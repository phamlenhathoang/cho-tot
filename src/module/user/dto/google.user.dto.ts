import { IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";

export class CreateGoogleUserDTO {
    
    @IsString({ message: "The email is string" })
    @IsNotEmpty({ message: "The email is required!!!" })
    @Matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, {
        message: 'Email must be a valid Gmail address (@gmail.com)',
    })
    email !: string

    @IsString({ message: "The name is string" })
    @IsNotEmpty({ message: "The name is required!!!" })
    name !: string

    @IsOptional()
    password ?: string

    @IsOptional()
    phone ?: string

    @IsString()
    googleId !: string
}