import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';
import { ChatMessagesService } from '../../chat-messages/chat-messages.service';
import { BroadcastChatMessageDto } from '../dto/broadcast-chat-message.dto';
import { SendChatMessageDto } from '../dto/send-chat-message.dto';
import { MaxApiService } from '../services/max-api.service';

@Controller('max/chats')
@Roles(UserRole.ADMIN, UserRole.DISPATCHER)
export class MaxChatsController {
  constructor(
    private readonly maxApi: MaxApiService,
    private readonly chatMessages: ChatMessagesService,
  ) {}

  @Get('threads')
  async threads(@CurrentUser() user: AuthenticatedUser) {
    if (!user.companyId) return { threads: [] };
    const threads = await this.chatMessages.listThreads(user.companyId);
    return { threads };
  }

  @Post('reply')
  async reply(@Body() dto: SendChatMessageDto, @CurrentUser() user: AuthenticatedUser) {
    const sent = await this.maxApi.sendMessage(dto.chatId.trim(), dto.text.trim());
    await this.chatMessages.recordOutgoingMessage({
      companyId: user.companyId,
      chatId: dto.chatId.trim(),
      text: dto.text.trim(),
      authorName: user.email,
      externalMessageId: sent.messageId,
    });
    return { ok: true, chatId: dto.chatId.trim(), messageId: sent.messageId ?? null };
  }

  @Post('broadcast')
  async broadcast(@Body() dto: BroadcastChatMessageDto, @CurrentUser() user: AuthenticatedUser) {
    const chatIds = Array.from(new Set(dto.chatIds.map((id) => id.trim()).filter(Boolean)));
    const results: Array<{ chatId: string; ok: boolean; messageId?: string; error?: string }> = [];

    for (const chatId of chatIds) {
      try {
        const sent = await this.maxApi.sendMessage(chatId, dto.text.trim());
        await this.chatMessages.recordOutgoingMessage({
          companyId: user.companyId,
          chatId,
          text: dto.text.trim(),
          authorName: user.email,
          externalMessageId: sent.messageId,
        });
        results.push({ chatId, ok: true, messageId: sent.messageId });
      } catch (error) {
        results.push({
          chatId,
          ok: false,
          error: error instanceof Error ? error.message : 'MAX send failed',
        });
      }
    }

    const sent = results.filter((r) => r.ok).length;
    return {
      ok: true,
      total: chatIds.length,
      sent,
      failed: chatIds.length - sent,
      results,
    };
  }

  @Delete(':chatId/messages/:messageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMessage(
    @Param('chatId') chatId: string,
    @Param('messageId') messageId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.maxApi.deleteMessage(chatId.trim(), messageId.trim());
    await this.chatMessages.markDeletedByExternalMessageId(user.companyId, chatId.trim(), messageId.trim());
  }
}
