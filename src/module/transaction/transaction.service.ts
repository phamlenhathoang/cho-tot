import { Injectable } from '@nestjs/common';
import { TransactionRepository } from './transaction.repository';
import { Prisma, TransactionStatus } from '@prisma/client';

@Injectable()
export class TransactionService {
    
    constructor(
        private readonly transactionRepository: TransactionRepository
    ){}

    async createTransaction(data: any){
        return await this.transactionRepository.createTransaction(data)
    }

    async getTransaction(orderCode: string){
        return this.transactionRepository.getTransaction(orderCode)
    }

    async updateTransaction(transactionId: number, data: any, tx?: Prisma.TransactionClient){
        return await this.transactionRepository.updateTransaction(transactionId, data, tx);
    }
}
