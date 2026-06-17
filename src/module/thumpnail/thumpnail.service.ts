import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ThumbnaiRepo } from './thumbnail.repository';

@Injectable()
export class ThumpnailService {

    constructor(
        private readonly prismaService: PrismaService,
        private readonly thumbnailRepo: ThumbnaiRepo
    ) { }

    async saveImages(postId: number, addImages: any) {
        return await this.thumbnailRepo.addImages(addImages, postId);
    }

    async update(imageId: number, url: string){
        try {
            const image = await this.thumbnailRepo.getById(imageId);
            if(!image){
                throw new NotFoundException("Image does not exist");
            }

            return this.thumbnailRepo.update(imageId, url);
        } catch (error) {
            throw error;
        }
    }
}
