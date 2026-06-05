import { Injectable } from "@nestjs/common";
import { OfferStatus } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class OfferRepository{
    constructor(
        private readonly prismaService: PrismaService
    ){}

    async getOfferById(offerId: number, userId: number){
        return await this.prismaService.offer.findFirst({
            where:{
                id: offerId,
                offerStatus: OfferStatus.PENDING,
                post:{
                    authorId: userId
                }
            },
            include:{
                buyer: {
                    include:{
                        addresss: true
                    }
                },
                post:{
                    include:{
                        author: {
                            include:{
                                addresss: true
                            }
                        },
                    }
                }
            }
        })
    }

    async updateStatusOffer(id: number){
        return await this.prismaService.offer.update({
            where:{
                id: id
            },data:{
                offerStatus: OfferStatus.ACCEPTED
            }
        })
    }

    async createOffer(offer: any){
        return await this.prismaService.offer.create({
            data: offer
        })
    }

}