import { Injectable, NotFoundException } from '@nestjs/common';
import { ThumbnaiRepo } from './thumbnail.repository';
import { CloudnaryService } from '../cloudnary/cloudnary.service';

@Injectable()
export class ThumpnailService {

    constructor(
        private readonly thumbnailRepo: ThumbnaiRepo,
        private readonly cloudinaryService: CloudnaryService
    ) { }

    async saveImages(postId: number, files: any) {
        const result = await this.cloudinaryService.uploadImages(files);
        const urls: string[] = result.map(x => x.url);
        return await this.thumbnailRepo.addImages(urls, postId);
    }

    async update(imageId: number, file: any) {
        try {
            const image = await this.thumbnailRepo.getById(imageId);
            
            if (!image) {
                throw new NotFoundException("Image does not exist");
            }

            const result = await this.cloudinaryService.uploadImage(file);
            
            return this.thumbnailRepo.update(imageId, result.url);
        } catch (error) {
            throw error;
        }
    }
}
