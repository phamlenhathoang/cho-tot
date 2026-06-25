import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { Max, Min } from "class-validator";

export class PaginationDTO{
    @ApiPropertyOptional()
    @Type(() => Number)
    @Min(1)
    page !: number

    @ApiPropertyOptional()
    @Type(() => Number)
    @Min(1)
    @Max(50)
    limit !: number
}