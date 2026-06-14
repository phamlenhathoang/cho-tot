import { Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export class GetDistrictIdDTO{
    @Type(() => Number)
    @IsNumber()
    provinceId !: number

    @IsString()
    district !: string
}