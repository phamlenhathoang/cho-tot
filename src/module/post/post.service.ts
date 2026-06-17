import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostDto } from './dto/create-post.dto';
import { ThumpnailService } from '../thumpnail/thumpnail.service';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationDTO } from 'src/common/pagination';
import { PostRepository } from './post.repositosy';
import { User } from '@prisma/client';
import sanitizeHtml from 'sanitize-html'
import { UserRepo } from '../user/user.repository';
import { CategoryRepository } from '../categoty/category.repository';
import { ThumbnaiRepo } from '../thumpnail/thumbnail.repository';
import { RedisService } from '../redis/redis.service';
import { CloudnaryService } from '../cloudnary/cloudnary.service';

@Injectable()
export class PostService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly userRepo: UserRepo,
        private readonly categoryRepo: CategoryRepository,
        private readonly thumbnaiRepo: ThumbnaiRepo,
        private readonly postRepo: PostRepository,
        private readonly redis : RedisService,
        private readonly cloudinaryService: CloudnaryService
    ) { }

    async createPost(createPostDto: PostDto, files: Express.Multer.File[], user: any) {
        try {
            const result = await this.cloudinaryService.uploadImages(files);
            const urls: string [] = result.map(x => x.url);

            const category = await this.categoryRepo.getCategoryById(createPostDto.categoryId);
            if (!category) {
                throw new NotFoundException("Category does not exist");
            }

            const post = await this.prismaService.$transaction(
                async (tx) => {
                    const addPost = await this.postRepo.createPost(tx, createPostDto, user);

                    if (urls !== undefined) {
                        await this.thumbnaiRepo.saveImages(tx, urls, addPost.id)
                    }
                    return addPost;
                },
            );

            await this.redis.delete('getAllPost');

            return post;
        } catch (error) {
            throw error;
        }
    }

    async GetById(postId: number) {
        return this.postRepo.getPostById(postId);
    }

    // async updatePost(postId: number, updatePostDto: PostDto, updateImages: { imageId: number; url: string }[] = [], newImageUrls: string[]) {
    //     try {
    //         const post = await this.prismaService.post.findFirst({
    //             where:{
    //                 id: postId,
    //                 authorId: updatePostDto.authorId
    //             }
    //         })

    //         if(!post){
    //             throw new NotFoundException("Post or User does not exist");
    //         }

    //         const category = await this.categoryServie.getById(updatePostDto.categoryId);
    //         if (!category) {
    //             throw new NotFoundException("Category does not exist");
    //         }

    //         return await this.prismaService.$transaction(
    //             async (tx) => {

    //                 const updatePost = await tx.post.update({
    //                     data: {
    //                         title: updatePostDto.title ?? post.title,
    //                         content: updatePostDto.content ?? post.content,
    //                         authorId: updatePostDto.authorId,
    //                         categoryId: updatePostDto.categoryId ?? post.categoryId,
    //                     },
    //                     where:{
    //                         id: postId
    //                     }
    //                 });

    //                 if(newImageUrls.length > 0){
    //                     await this.thumbnaiService.saveImages(tx, newImageUrls, postId);
    //                 }

    //                 await this.thumbnaiService.updateImages(tx, updateImages)

    //                 return updatePost;
    //             },
    //         );
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    async updatePost(postId: number, updatePostDto: UpdatePostDto, user: any) {
        try {
            const postExist = await this.postRepo.getPostById(postId);

            if (!postExist) {
                throw new NotFoundException("Post does not exist or User are not alowed to update this post");
            }

            if (updatePostDto.categoryId != undefined) {
                const category = await this.categoryRepo.getCategoryById(updatePostDto.categoryId);
                if (!category) {
                    throw new NotFoundException("Category does not exist");
                }
            }
            const post = this.postRepo.updatePost(updatePostDto, postExist, user)

            await this.redis.delete('getAllPost');

            return post
        } catch (error) {
            throw error;
        }
    }

    async deletePost(postId: number, userId: number) {
        try {
            const postExist = await this.postRepo.getPostByIdAndUserId(postId, userId);
            if(!postExist){
                throw new NotFoundException("Post does not exist");
            }
            const post = await this.postRepo.deletePost(postId)
            await this.redis.delete('getAllPost');
            return post;
        } catch (error) {
            throw error
        }
    }

    async getAllPostsByUserId(userId: number, check: boolean | null = null) {
        return await this.postRepo.getAllPostsByUserId(userId, check);
    }

    async getPostsByUserId(user: User, title: string, paginatioDto: PaginationDTO) {
        return await this.postRepo.getPostsByUserId(user, title, paginatioDto)
    }

    async getPostById(id: number) {
        return this.postRepo.getPostById(id)
    }

    async getAllPost(){
        const key = `getAllPost`;
        const cache = await this.redis.get(key);
        if(cache){
            return JSON.parse(cache)
        }
        const posts =  await this.postRepo.getAllPost();
        if(!posts){
            return
        }
        await this.redis.set(key, JSON.stringify(posts), 300);
        return posts;
    }

    async getAllPostByUserId(userId: number){
        return await this.postRepo.getAllPostByUserId(userId);
    }
}
