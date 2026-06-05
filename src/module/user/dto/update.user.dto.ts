import { Type } from "class-transformer"
import { IsInt, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator"

export class UpdateUserDTO {

    @IsOptional()
    @Matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, {
        message: 'Email must be a valid Gmail address (@gmail.com)',
    })
    email?: string

    @IsOptional()
    @Matches(/^[a-zA-Z\s]+$/, {
        message: 'Name must contain only letters',
    })
    name ?: string

    password ?: string

    @IsOptional()
    @Matches(/^[0-9]{10}$/, {
        message: 'The phone must be number and contain exactly 10 digits',
    })
    @Matches(/^0/, {
        message: 'Phone number must start with 0',
    })
    phone !: string
}