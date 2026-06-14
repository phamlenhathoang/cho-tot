import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

export class CreateOrderDTO{
    @Type(() => Number)
    @IsNumber()
    buyerId !: number;

    @Type(() => Number)
    @IsNumber()
    price !: number;

    // @Type(() => Number)
    // @IsNumber()
    // postId !: number;

    // @Type(() => Number)
    // @IsNumber()
    // totalAmount !: number;
}