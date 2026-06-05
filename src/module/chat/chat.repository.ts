import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ChatRepo{
    constructor(private readonly prismaService: PrismaService){}

    async save(chat: any){
        return await this.prismaService.message.create({
            data: chat,
            include:{
                sender: true
            }
        })
    }
}