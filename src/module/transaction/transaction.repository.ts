import { Injectable } from "@nestjs/common";
import { Prisma, TransactionStatus } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class TransactionRepository{
    constructor(
        private readonly prismaService: PrismaService
    ){}

    async createTransaction(orderId: number, vnpTxnRef: string, amount: number, status: TransactionStatus){
        return await this.prismaService.transaction.create({
            data:{
                orderId: orderId,
                vnpTxnRef: vnpTxnRef,
                amount: amount,
                status: status
            }
        })
    }

    async getTransaction(vnpTxnRef: string){
        return await this.prismaService.transaction.findUnique({
            where:{
                vnpTxnRef: vnpTxnRef
            }
        })
    }

    async updateTransaction(id: number, status: TransactionStatus, vnpTransactionNo: string, bankCode: string, paydate: string, rawIpnResponse: any, tx?: Prisma.TransactionClient){
        const prisma = tx || this.prismaService
        return await prisma.transaction.update({
            where:{
                id: id
            },
            data:{
                status: status ? 'SUCCESS' : 'FAILED',
                vnpTransactionNo: vnpTransactionNo,
                bankCode: bankCode,
                payDate: paydate,
                rawIpnResponse: rawIpnResponse
            }
        })
    }
}