import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

export class CreateOrderDTO {

    @ApiProperty({
        example: 1,
        description: 'Buyer ID'
    })
    @Type(() => Number)
    @IsNumber()
    buyerId !: number;

    @ApiProperty({
        example: 2,
        description: 'Price of order'
    })
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