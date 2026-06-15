import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdatePostDto {

    @IsOptional()
    @IsString()
    title !: string

    @IsOptional()
    @IsString()
    content !: string

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    categoryId !: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    price !: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    width !: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    length !: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    height !: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    weight !: number;
}