import { Injectable } from "@nestjs/common";
import { OfferStatus, Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class OfferRepository {
    constructor(
        private readonly prismaService: PrismaService
    ) { }

    async getOfferById(offerId: number, userId: number) {
        return await this.prismaService.offer.findFirst({
            where: {
                id: offerId,
                offerStatus: OfferStatus.PENDING,
                post: {
                    authorId: userId
                }
            },
            include: {
                buyer: {
                    include: {
                        addresss: true
                    }
                },
                post: {
                    include: {
                        author: {
                            include: {
                                addresss: true
                            }
                        },
                    }
                },
            }
        })
    }

    async acceptOffer(id: number, tx?: Prisma.TransactionClient) {
        const prisma = tx || this.prismaService;
        return await prisma.offer.update({
            where: {
                id: id
            }, data: {
                offerStatus: OfferStatus.ACCEPTED
            }
        })
    }

    async rejectOffer(postId: number, offerId: number, tx?: Prisma.TransactionClient) {
        const prisma = tx || this.prismaService;
        return await prisma.offer.updateMany({
            where: {
                postId: postId,
                id:{
                    not: offerId
                }
            }, data: {
                offerStatus: OfferStatus.REJECTED
            }
        })
    }

    async createOffer(offer: any) {
        return await this.prismaService.offer.create({
            data: offer
        })
    }

    async updateOffer(offerId: number, offerStatus: OfferStatus, tx?: Prisma.TransactionClient) {
        const prisma = tx || this.prismaService;
        return await prisma.offer.update({
            where: {
                id: offerId
            },
            data: {
                offerStatus
            }
        })
    }

    async getOffersByPostId(postId: number|undefined) {
        return await this.prismaService.offer.findMany({
            where: {
                ...(postId ? {postId} : {}),
                // OR: [
                //     {post: 
                //         {authorId: userId}
                //     },
                //     {buyerId: userId}
                // ]
            },
            include: {
                post: true,
            }
        })
    }
    
    async getAllOffersByUser(userId: number) {
        try{
            return await this.prismaService.offer.findMany({
            where: {
                buyerId: userId
            }
        })
        }catch(error){
            throw error;
        }
    }

    async getAllOffer(){
        return await this.prismaService.offer.findMany();
    }

    async getOfferByUserIdAndOfferId(id: number, userId){
        return await this.prismaService.offer.findFirst({
            where:{
                id: id,
                buyerId: userId,
                offerStatus: 'PENDING'
            }
        })
    }

    async deleteOffer(id: number){
        return await this.prismaService.offer.delete({
            where:{
                id: id
            }
        })
    }
}