import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ChatRepo {
    constructor(private readonly prismaService: PrismaService) { }

    async save(chat: any) {
        return await this.prismaService.message.create({
            data: chat,
            include: {
                sender: true
            }
        })
    }

    async createMessage(conversationId: number, senderId: number, content: string) {
        return await this.prismaService.message.create({
            data: {
                senderId: senderId,
                content: content,
                conversationId: conversationId
            }
        })
    }

    async getMessages(conversationId: number, skip: number, take: number) {
        return this.prismaService.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            skip,
            take,
        });
    }

    async countMessageInConversationById(conversationId: number, userId: number){
        return this.prismaService.message.count({
            where:{
                conversationId: conversationId,
                isRead: false,
                senderId: {not: userId}
            }
        })
    }

    async markAsRead(conversationId: number, userId: number){
        return this.prismaService.message.updateMany({
            where:{
                conversationId: conversationId,
                isRead: false,
                senderId: {not: userId}
            },data:{
                isRead: true,
            }
        })
    }
}