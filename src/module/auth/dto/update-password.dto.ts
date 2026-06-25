import { IsEmail, IsOptional, IsString } from "class-validator";

export class UpdatePasswordDTO{
    @IsOptional()
    @IsString()
    newPassord !: string

    @IsOptional()
    @IsEmail()
    email !: string
}