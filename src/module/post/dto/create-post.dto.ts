import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";

export class PostDto {
    @IsNotEmpty({ message: "The title post is required!!!" })
    title !: string

    @IsNotEmpty({ message: "The content post is required!!!" })
    content !: string

    @Type(() => Number)
    @IsNumber()
    categoryId !: number;

    @Type(() => Number)
    @IsNumber()
    price !: number;

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
}