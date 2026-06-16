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
        example: 'ACCEPTED',
        description: 'Order status'
    })
    @IsEnum(OrderStatus)
    orderStatus !: OrderStatus;

    @ApiProperty({
        example: 30000,
        description: 'Ship fee '
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    shipFee !: number;

    @ApiProperty({
        example: 4505,
        description: 'Service Id'
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    serviceId !: number;
}