import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ThumbnaiRepo {
    constructor(
        private readonly prismaService: PrismaService
    ) { }

    async update(imageId: number, url: string) {
        return this.prismaService.image.update({
            where: {
                id: imageId
            },
            data: {
                url: url
            }
        })
    }

    async getById(imageId: number) {
        return this.prismaService.image.findUnique({
            where: {
                id: imageId
            }
        })
    }

    async saveImages(tx: Prisma.TransactionClient, urls: string[], postId: number) {
        return tx.image.createMany({
            data: urls.map((url, index) => ({
                url,
                postId,
                isAvatar: index === 0
            })),
        });
    }
}