import { IsNotEmpty, IsString } from "class-validator";

export class CreateBankDto {
    @IsNotEmpty()
    @IsString()
    name !: string;

    @IsNotEmpty()
    @IsString()
    accountNumber !: string;  
}