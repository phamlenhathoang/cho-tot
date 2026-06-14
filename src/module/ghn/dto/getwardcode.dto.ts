import { Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export class GetWardCodeDTO{
    @Type(() => Number)
    @IsNumber()
    districtId !: number

    @IsString()
    ward !: string
}