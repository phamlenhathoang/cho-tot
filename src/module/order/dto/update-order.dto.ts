import { OrderStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional } from "class-validator";

export class UpdateOrderDTO {
    @Type(() => Number)
    @IsNumber()
    orderId !: number;

    @IsEnum(OrderStatus)
    orderStatus !: OrderStatus;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    shipFee !: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    serviceId !: number;
}