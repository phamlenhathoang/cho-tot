import { IsEmail, IsOptional, IsString } from "class-validator";

export class ForgetPasswordDTO{
    @IsOptional()
    @IsString()
    phone !: string

    @IsOptional()
    @IsEmail()
    email !: string
}