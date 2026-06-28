import { IsString, MaxLength, MinLength } from 'class-validator';

export class SendChatMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  chatId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  text!: string;
}
