import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdatePostDto {

    @IsOptional()
    title !: string

    @IsOptional()
    content !: string

    @IsOptional()
    categoryId !: number;

    // @IsOptional()
    // @IsString()
    // imageIds !: string[];
}