import { IsNotEmpty } from "class-validator";

export class CategoryDTO{
    @IsNotEmpty({message:"The category name is required!!!"})
    name !: string
}