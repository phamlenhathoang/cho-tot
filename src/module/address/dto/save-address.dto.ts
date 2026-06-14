import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class SaveAddressDTO{

    @Type(() => Number)
    @IsNumber()
    userId !: number

    @IsString()
    @IsNotEmpty()
    street !: string

    @IsString()
    @IsNotEmpty()
    ward !: string

    @IsString()
    @IsNotEmpty()
    district !: string

    @IsString()
    @IsNotEmpty()
    city !: string

    @IsOptional()
    @IsNumber()
    cityId !: number

    @IsOptional()
    @IsNumber()
    districtId !: number

    @IsOptional()
    @IsNumber()
    wardCode !: number
}