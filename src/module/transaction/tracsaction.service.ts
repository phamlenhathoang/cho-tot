import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class TransactionService{
    constructor(
        private readonly prismaService: PrismaService
    ){}

    async execute<T>(callback: (tx: any) => Promise<T>,): Promise<T>{
        return this.prismaService.$transaction(async (tx) =>{
            return callback(tx);
        })
    }
}