import { ApiProperty } from "@nestjs/swagger";
import { OrderStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional } from "class-validator";

export class UpdateOrderDTO {

    @ApiProperty({
        example: 1,
        description: 'OrderID'
    })
    @Type(() => Number)
    @IsNumber()
    orderId !: number;

    @ApiProperty({
        example: 'CANCELED, PENDING, ACCEPTED, COMPLETED',
        description: 'Order status'
    })
    @IsEnum(OrderStatus)
    orderStatus !: OrderStatus;
}