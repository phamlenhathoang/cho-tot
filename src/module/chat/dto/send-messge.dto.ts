import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class SendMessageDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  conversationId !: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content !: string;
}