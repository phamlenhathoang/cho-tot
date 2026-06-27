import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { url } from "node:inspector";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ThumbnaiRepo {
    constructor(
        private readonly prismaService: PrismaService
    ) { }

    async update(imageId: number, result: any) {
        return this.prismaService.image.update({
            where: {
                id: imageId
            },
            data: {
                url: result.url,
                publisId: result.publicId
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

    async saveImages(tx: Prisma.TransactionClient, urls: any, postId: number) {
        return tx.image.createMany({
            data: urls.map((image, index) => ({
                url: image.url,
                postId: postId,
                isAvatar: index === 0,
                publisId: image.publicId
            })),
        });
    }

    async addImages(urls: any, postId: number) {
        return await this.prismaService.image.createMany({
            data: urls.map((image) => ({
                url: image.url,
                postId: postId,
                publisId: image.publicId
            })),
        });
    }
}