import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateConversationDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  postId !: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  sellerId !: number;
}