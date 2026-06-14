import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { Min } from "class-validator";

export class PaginationDTO{
    @ApiPropertyOptional()
    @Type(() => Number)
    @Min(0)
    skip !: number

    @ApiPropertyOptional()
    @Type(() => Number)
    @Min(1)
    limit !: number
}