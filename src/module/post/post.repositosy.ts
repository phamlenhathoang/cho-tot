import { Injectable } from "@nestjs/common";
import { Post, Prisma, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { PostDto } from "./dto/create-post.dto";
import sanitizeHtml from 'sanitize-html'
import { PaginationDTO } from "src/common/pagination";
import { UpdatePostDto } from "./dto/update-post.dto";

@Injectable()
export class PostRepository {
    constructor(
        private readonly prismaService: PrismaService
    ) { }

    async getPostById(postId: number) {
        return this.prismaService.post.findUnique({
            where: {
                id: postId,
                published: true,
            },
            include: {
                images: true
            }
        })
    }

    async getPostByIdAndUserId(postId: number, userId: number) {
        return this.prismaService.post.findUnique({
            where: {
                id: postId,
                authorId: userId,
                published: true,
            },
            include: {
                images: true
            }
        })
    }

    async checkPostByCategoryId(id: number) {
        return await this.prismaService.post.findFirst({
            where: {
                categoryId: id
            }
        })
    }

    async createPost(tx: Prisma.TransactionClient, createPostDto: PostDto, user: any) {
        return await tx.post.create({
            data: {
                title: sanitizeHtml(createPostDto.title),
                content: sanitizeHtml(createPostDto.content, {
                    allowedTags: [
                        'h1',
                        'h2',
                        'p',
                        'b',
                        'i',
                        'ul',
                        'li',
                        'img'
                    ],
                    allowedAttributes: {
                        img: ['src'],
                    },
                }),
                authorId: user.id,
                categoryId: createPostDto.categoryId,
                price: createPostDto.price,
                width: createPostDto.width,
                length: createPostDto.length,
                height: createPostDto.height,
                weight: createPostDto.weight
            }
        })
    }

    async updatePost(updatePostDto: UpdatePostDto, post: Post, user: any) {
        return await this.prismaService.post.update({
            data: {
                authorId: user.id,
                categoryId: updatePostDto.categoryId ?? post.categoryId,
                content: updatePostDto.content ?? post.content,
                title: updatePostDto.title ?? post.title,
                price: updatePostDto.price ?? post.price,
                width: updatePostDto.weight ?? post.width,
                length: updatePostDto.length ?? post.length,
                height: updatePostDto.height ?? post.height,
                weight: updatePostDto.weight ?? post.weight,
            },
            where: {
                id: post.id
            }
        })
    }

    async deletePost(postId: number) {
        return await this.prismaService.post.update({
            where: {
                id: postId
            },
            data: {
                published: false,
                images: {
                    updateMany: {
                        where: {
                            postId: postId
                        },
                        data: {
                            published: false
                        }
                    }
                }
            }
        })
    }

    async getAllPostsByUserId(userId: number, check: boolean | null = null) {
        return await this.prismaService.post.findMany({
            where: {
                authorId: userId,
                ...(check != null && check !== undefined && {
                    published: check
                })
            },
            include: {
                images: true
            }
        });
    }

    async getPostsByUserId(user: User, title: string, paginatioDto: PaginationDTO) {
        const posts = await this.prismaService.post.findMany({
            skip: paginatioDto.skip,
            take: paginatioDto.limit,
            where: {
                title: title,
                ...(user.role === "CUSTOMER" && {
                    authorId: user.id
                })
            },
            include: {
                images: true
            }
        });

        return posts.map((post) => ({
            ...post,
            createdAt: new Date(post.createdAt).toLocaleString('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh',
            }),
            updatedAt: new Date(post.updatedAt).toLocaleString('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh',
            })
        }))
    }

    async getAllPost(){
        return await this.prismaService.post.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        })
    }

    async getAllPostByUserId(userId: number){
        return await this.prismaService.post.findMany({
            where:{
                authorId: userId
            }
        })
    }
}