import { Injectable } from "@nestjs/common";
import { Prisma, TransactionStatus } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class TransactionRepository{
    constructor(
        private readonly prismaService: PrismaService
    ){}

    async createTransaction(data: any){
        return await this.prismaService.transaction.create({
            data:data
        })
    }

    async getTransaction(orderCode: string){
        return await this.prismaService.transaction.findFirst({
            where:{
                orderCode: orderCode
            },
            include:{
                order: true
            }
        })
    }

    async updateTransaction(transactionId: number, data: any, tx?: Prisma.TransactionClient){
        const prisma = tx || this.prismaService
        return await prisma.transaction.update({
            where:{
                id: transactionId
            },
            data: data
        })
    }
}