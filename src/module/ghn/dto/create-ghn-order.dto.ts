import { Type } from 'class-transformer';
import {
    IsString,
    IsNumber,
    IsOptional,
    IsNotEmpty,
} from 'class-validator';

export class CreateGHNOrderDTO {
    @IsString()
    @IsNotEmpty()
    content !: string;

    @IsString()
    @IsNotEmpty()
    fromName !: string;

    @IsString()
    @IsNotEmpty()
    fromPhone !: string;

    @IsString()
    @IsNotEmpty()
    fromAddress !: string;

    @IsString()
    @IsNotEmpty()
    fromWard !: string;

    @Type(() => Number)
    @IsNumber()
    fromDistrictId !: number;

    @IsString()
    @IsNotEmpty()
    toName !: string;

    @IsString()
    @IsNotEmpty()
    toPhone !: string;

    @IsString()
    @IsNotEmpty()
    toAddress !: string;

    @IsString()
    @IsNotEmpty()
    toWard !: string;

    @IsString()
    @IsNotEmpty()
    toWardCode !: string;

    @Type(() => Number)
    @IsNumber()
    toDistrictId !: number;

    @Type(() => Number)
    @IsNumber()
    weight !: number;

    @Type(() => Number)
    @IsNumber()
    length !: number;

    @Type(() => Number)
    @IsNumber()
    width !: number;

    @Type(() => Number)
    @IsNumber()
    height !: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    codAmount?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    value?: number;

    @Type(() => Number)
    @IsNumber()
    serviceId !: number;
}