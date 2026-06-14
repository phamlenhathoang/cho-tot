import { IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateUserDTO {
    
    @IsString({ message: "The email is string" })
    @IsNotEmpty({ message: "The email is required!!!" })
    @Matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, {
        message: 'Email must be a valid Gmail address (@gmail.com)',
    })
    email !: string

    @IsString({ message: "The name is string" })
    @IsNotEmpty({ message: "The name is required!!!" })
    name !: string

    @IsNotEmpty({ message: "The password is required!!!" })
    password !: string

    @IsString({ message: "The phone is the number" })
    @IsNotEmpty({ message: "The phone is required!!!" })
    @Matches(/^[0-9]{10}$/, {
        message: 'The phone must be number and contain exactly 10 digits',
    })
    @Matches(/^0/, {
        message: 'Phone number must start with 0',
    })
    phone !: string
}