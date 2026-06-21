import { ApiProperty } from "@nestjs/swagger";
import { StatusOrderTracking } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber } from "class-validator";

export class CreateTrackingDTO{
    @ApiProperty({
        example: '1',
        description: 'OrderId'
    })
    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    orderId !: number

    @ApiProperty({
        example: 'READY_TO_PICK, PICKING, PICKED, STORING, DELIVERING, DELIVERED, DELIVERY_FAIL, WAITING_TO_RETURN, RETURN RETURNED',
        description: 'Order status'
    })
    @IsEnum(StatusOrderTracking)
    statusTracking !: StatusOrderTracking;

}