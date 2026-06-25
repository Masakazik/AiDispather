import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { createReadStream } from 'node:fs';
import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Response } from 'express';
import { DocumentsService } from './documents.service';
import { UPLOAD_DIR, ensureUploadDir } from './documents.constants';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAll(user.companyId);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          ensureUploadDir();
          cb(null, UPLOAD_DIR);
        },
        filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname)}`),
      }),
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: AuthenticatedUser) {
    return this.service.createFromUpload(file, user.companyId);
  }

  @Get(':id/download')
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StreamableFile> {
    const doc = await this.service.findOne(id, user.companyId);
    const encoded = encodeURIComponent(doc.name);
    res.set({
      'Content-Type': doc.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encoded}"; filename*=UTF-8''${encoded}`,
    });
    return new StreamableFile(createReadStream(doc.storedPath));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.remove(id, user.companyId);
  }
}
