// webhooks/ghn/dto/ghn-callback.dto.ts
import { IsString, IsOptional, IsNumber, IsIn } from 'class-validator';

export class GhnCallbackDto {
  @IsString()
  CodeId !: string;

  @IsString()
  Status !: string;

  @IsString()
  Time !: string;

  @IsString()
  @IsIn(['create', 'switch_status', 'update_weight', 'update_cod', 'update_fee'])
  Type !: string;

  @IsOptional()
  @IsString()
  Description ?: string;

  @IsOptional()
  @IsNumber()
  CODAmount ?: number;

  @IsOptional()
  @IsString()
  Reason ?: string;

  @IsOptional()
  @IsString()
  ClientOrderCode ?: string;
}