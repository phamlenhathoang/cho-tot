import { ApiProperty } from "@nestjs/swagger";
import { OrderStatus, PaymentMethod } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

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

    @ApiProperty({
        example: 'COD, BANKING',
        description: 'Payment method'
    })
    @IsEnum(PaymentMethod)
    paymentMethod !: PaymentMethod;
}