import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ConversationRepository {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    async getConversation(buyerId: number, sellerId: number) {
        return await this.prisma.conversation.findFirst({
            where: {
                OR: [
                    {
                        AND: [
                            { buyerId },
                            { sellerId }
                        ]
                    },
                    {
                        AND: [
                            { buyerId: sellerId },
                            { sellerId: buyerId }
                        ]
                    }
                ]
            }, 
            include:{
                messages: true
            }
        });
    }

    async getConversationById(id: number, userId: number) {
        return await this.prisma.conversation.findFirst({
            where: {
                id: id,
                OR: [
                    { buyerId: userId },
                    { sellerId: userId }
                ]
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        })
    }

    async createConversation(buyerId: number, sellerId: number) {
        return await this.prisma.conversation.create({
            data: {
                buyerId: buyerId,
                sellerId: sellerId
            }
        })
    }

    async getAllConservationByUserId(userId: number) {
        console.log(userId)
        const conservation = await this.prisma.conversation.findMany({
            where: {
                OR:
                    [
                        { buyerId: userId },
                        { sellerId: userId }
                    ]
            }, include: {
                buyer: true,
                seller: true,
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        })

        const sorted = conservation.sort((a, b) => {
            const aTime = a.messages[0]?.createdAt?.getTime() ?? 0;
            const bTime = b.messages[0]?.createdAt?.getTime() ?? 0;
            return bTime - aTime;
        })

        return sorted.map((conv) => {
            const isBuyer = conv.buyerId === userId;
            const partner = isBuyer ? conv.seller : conv.buyer;

            return {
                id: conv.id,
                partner,
                lastMessage: conv.messages[0] ?? null
            }
        })
    }


}