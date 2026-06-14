import { Injectable, NotFoundException } from '@nestjs/common';
import { OfferRepository } from './offer.repository';
import { TransactionService } from '../transaction/tracsaction.service';
import { OrderService } from '../order/order.service';
import { PostService } from '../post/post.service';
import { OfferDTO } from './dto/offer.dto';

@Injectable()
export class OfferService {
    constructor(
        private readonly offerRepo: OfferRepository,
        private readonly transactionService: TransactionService,
        private readonly orderService: OrderService,
        private readonly postService: PostService
    ){}

    async acceptOffer(offerId: number, user: any){
        try {
            const offer = await this.offerRepo.getOfferById(offerId, user.id);
            if(!offer){
                throw new NotFoundException("Offer does not exist");
            }

            return await this.transactionService.execute(
                async(tx) => {
                    const updateOffer = await this.offerRepo.acceptOffer(offerId, tx);
                    await this.orderService.createOrder(offer,tx);
                    await this.offerRepo.rejectOffer(offer.postId, offerId, tx);
                    return updateOffer
                }
            )
        } catch (error) {
            throw error;
        }
    }

    async createOffer(offerdto: OfferDTO, user: any){
        try {
            
            const post = await this.postService.getPostById(offerdto.postId);
            if(!post){
                throw new NotFoundException("Post does not exist");
            }
            return await this.offerRepo.createOffer({
                buyerId: user.id,
                postId: post.id,
                price: offerdto.price,
            })
        } catch (error) {
            throw error;
        }
    }

    async getOffersByPostId(postId: number|undefined, user: any){
        return await this.offerRepo.getOffersByPostId(postId, user.id);
    }

    async getAllOffersByUser(userId: number){
        return await this.offerRepo.getAllOffersByUser(userId);
    }

}
