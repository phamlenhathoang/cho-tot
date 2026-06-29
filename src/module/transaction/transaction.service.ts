import { Injectable } from '@nestjs/common';
import { TransactionRepository } from './transaction.repository';
import { Prisma, TransactionStatus } from '@prisma/client';

@Injectable()
export class TransactionService {
    
    constructor(
        private readonly transactionRepository: TransactionRepository
    ){}

    async createTransaction(orderId: number, vnpTxnRef: string, amount: number, status: TransactionStatus){
        return await this.transactionRepository.createTransaction(orderId, vnpTxnRef, amount, status)
    }

    async getTransaction(vnpTxnRef: string){
        return this.transactionRepository.getTransaction(vnpTxnRef)
    }

    async updateTransaction(id: number, status: TransactionStatus, vnpTransactionNo: string, bankCode: string, paydate: string, rawIpnResponse: any, tx?: Prisma.TransactionClient){
        return await this.transactionRepository.updateTransaction(id, status, vnpTransactionNo, bankCode, paydate, rawIpnResponse, tx);
    }
}
