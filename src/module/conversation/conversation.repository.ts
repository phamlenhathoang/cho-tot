import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ConversationRepository {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    async getConversation(postId: number, buyerId: number, sellerId: number) {
        return await this.prisma.conversation.findFirst({
            where: {
                postId: postId,
                buyerId: buyerId,
                sellerId: sellerId
            }
        })
    }

    async getConversationById(id: number, userId) {
        console.log(id + "   " + userId)
        return await this.prisma.conversation.findUnique({
            where: {
                id: id,
                OR:[
                    {buyerId: userId},
                    {sellerId: userId}
                ]
            }
        })
    }

    async createConversation(postId: number, buyerId: number, sellerId: number) {
        return await this.prisma.conversation.create({
            data: {
                postId: postId,
                buyerId: buyerId,
                sellerId: sellerId
            }
        })
    }

    async getConservationByUserId(userId: number) {
        return this.prisma.conversation.findMany({
            where: {
                OR:
                    [
                        { buyerId: userId },
                        { sellerId: userId }
                    ]
            }, include: {
                buyer: true,
                post : true,
                seller: true
            }
        })
    }


}