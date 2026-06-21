import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class SendMailOtpDto {

  @IsNotEmpty({
    message: "Email is required",
  })
  @IsEmail(
    {},
    {
      message: "Email is invalid",
    },
  )
  @MaxLength(255, {
    message:
      "Email must not exceed 255 characters",
  })
  email!: string;

  @IsOptional()
  @IsString()
  newPassword !: string
}