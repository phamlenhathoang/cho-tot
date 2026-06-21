import { IsEmail, IsOptional, IsString } from "class-validator";

export class ForgetPasswordDTO{
    @IsOptional()
    @IsString()
    newPassord !: string

    @IsOptional()
    @IsEmail()
    email !: string
}