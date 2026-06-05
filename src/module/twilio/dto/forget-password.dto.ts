import {
  IsIn,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
} from "class-validator";

export class ForgotPasswordDto {

  @IsNotEmpty({
    message: "Phone is required",
  })
  @IsString({
    message: "Phone must be a string",
  })
  @IsPhoneNumber("VN", {
    message:
      "Phone must be begin +84. Example: +84901234567",
  })
  phone!: string;

  @IsNotEmpty({
    message: "Type is required",
  })
  @IsString({
    message: "Type must be a string",
  })
  @IsIn(["call", "sms"], {
    message: "Type must be either 'call' or 'sms'",
  })
  type!: "call" | "sms";
}