import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateBankDto } from "./dto/create-bank.dto";

@Injectable()
export class BankRepository {
    constructor( 
        private readonly prismaService: PrismaService
    ){}

    async createBank(createBankDTO: CreateBankDto, userId: number, bin: string) {
        return await this.prismaService.bank.create({
            data: {
                ...createBankDTO,
                userId,
                bin
            }
        });
    }
}