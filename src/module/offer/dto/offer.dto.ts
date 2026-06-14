import { Type } from "class-transformer"
import { IsNotEmpty } from "class-validator"

export class OfferDTO{
    @Type(() => Number)
    @IsNotEmpty()
    postId !: number

    @Type(() => Number)
    @IsNotEmpty()
    price !: number
}