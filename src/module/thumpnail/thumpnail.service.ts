import { Injectable, NotFoundException } from '@nestjs/common';
import { ThumbnaiRepo } from './thumbnail.repository';
import { CloudnaryService } from '../cloudnary/cloudnary.service';
import { PostService } from '../post/post.service';

@Injectable()
export class ThumpnailService {

    constructor(
        private readonly thumbnailRepo: ThumbnaiRepo,
        private readonly cloudinaryService: CloudnaryService,
        private readonly postService: PostService
    ) { }

    async saveImages(postId: number, files: any) {
        const post = await this.postService.GetById(postId);
        if(!post){
            throw new NotFoundException("Post does not exist");
        }
        const urls = await this.cloudinaryService.uploadImages(files);
        if(!urls){
            throw new NotFoundException('Urls does not exist');
        }
        return await this.thumbnailRepo.addImages(urls, postId);
    }

    async update(imageId: number, file: any) {
        try {
            const image = await this.thumbnailRepo.getById(imageId);
            
            if (!image) {
                throw new NotFoundException("Image does not exist");
            }

            await this.cloudinaryService.deleteImage(image.publisId!);

            const result = await this.cloudinaryService.uploadImage(file);
            return this.thumbnailRepo.update(imageId, result);
        } catch (error) {
            throw error;
        }
    }
}
