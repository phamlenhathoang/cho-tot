import { IsNotEmpty, IsString, Matches } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDTO {
    
    @ApiProperty({
        example: 'abc@gmail.com',
        description: 'User email'
    })
    @IsString({ message: "The email is string" })
    @IsNotEmpty({ message: "The email is required!!!" })
    @Matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, {
        message: 'Email must be a valid Gmail address (@gmail.com)',
    })
    email !: string

    @ApiProperty({
        example: 'Hoang Pham',
        description: 'User name'
    })
    @IsString({ message: "The name is string" })
    @IsNotEmpty({ message: "The name is required!!!" })
    name !: string

    @ApiProperty({
        example: '123456',
        description: 'Password'
    })
    @IsNotEmpty({ message: "The password is required!!!" })
    password !: string

    @ApiProperty({
        example: '0987654321',
        description: 'Phone number'
    })
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