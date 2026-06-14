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

@Injectable()
export class PostService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly userRepo: UserRepo,
        private readonly categoryRepo: CategoryRepository,
        private readonly thumbnaiRepo: ThumbnaiRepo,
        private readonly postRepo: PostRepository
    ) { }

    async createPost(createPostDto: PostDto, urls: string[], user: any) {
        try {

            const category = await this.categoryRepo.getCategoryById(createPostDto.categoryId);
            if (!category) {
                throw new NotFoundException("Category does not exist");
            }

            return await this.prismaService.$transaction(
                async (tx) => {
                    const addPost = await this.postRepo.createPost(tx, createPostDto, user);

                    if (urls !== undefined) {
                        await this.thumbnaiRepo.saveImages(tx, urls, addPost.id)
                    }
                    return addPost;
                },
            );
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
            const post = await this.postRepo.getPostById(postId);

            if (!post) {
                throw new NotFoundException("Post does not exist or User are not alowed to update this post");
            }

            if (updatePostDto.categoryId != undefined) {
                const category = await this.categoryRepo.getCategoryById(updatePostDto.categoryId);
                if (!category) {
                    throw new NotFoundException("Category does not exist");
                }
            }
            return this.postRepo.updatePost(updatePostDto, post, user)
        } catch (error) {
            throw error;
        }
    }

    async deletePost(postId: number) {
        try {
            const post = await this.postRepo.getPostById(postId);
            if(!post){
                throw new NotFoundException("Post does not exist");
            }
            return await this.postRepo.deletePost(postId)
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
}
