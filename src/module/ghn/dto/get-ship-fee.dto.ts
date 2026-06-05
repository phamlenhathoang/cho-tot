import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

export class GetShipFeeDTO{
    @Type(() => Number)
    @IsNumber()
    districtBuyer !: number

    @Type(() => Number)
    @IsNumber()
    districtSeller !: number

    @Type(() => Number)
    @IsNumber()
    serviceId !: number

    @Type(() => Number)
    @IsNumber()
    value !: number

    @Type(() => Number)
    @IsNumber()
    weight !: number

    @Type(() => Number)
    @IsNumber()
    length !: number

    @Type(() => Number)
    @IsNumber()
    width !: number

    @Type(() => Number)
    @IsNumber()
    height !: number
}