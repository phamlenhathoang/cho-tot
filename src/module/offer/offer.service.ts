import { Injectable, NotFoundException } from '@nestjs/common';
import { OfferRepository } from './offer.repository';
import { TransactionService } from '../transaction/tracsaction.service';
import { OrderService } from '../order/order.service';
import { PostService } from '../post/post.service';
import { OfferDTO } from './dto/offer.dto';
import { GhnService } from '../ghn/ghn.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OfferService {
    constructor(
        private readonly offerRepo: OfferRepository,
        private readonly transactionService: TransactionService,
        private readonly orderService: OrderService,
        private readonly postService: PostService,
        private readonly ghnService: GhnService
    ) { }

    async acceptOffer(offerId: number, user: any) {
        try {
            const offer = await this.offerRepo.getOfferById(offerId, user.id);
            if (!offer) {
                throw new NotFoundException("Offer does not exist");
            }

            if (!offer.post || !offer.post.author || !offer.buyer.addresss || !offer.post.author.addresss) {
                throw new NotFoundException("Post, author, buyer address or seller address does not exits");
            }

            const addressSeller = offer.post.author.addresss.find(x => x.isDefault == true);
            const addressBuyer = offer.buyer.addresss.find(x => x.isDefault == true);

            const services = await this.ghnService.canShip(addressSeller?.districtId!, addressBuyer?.districtId!);
            const serviceId = services.services.find(s => s.service_type_id === 2)?.service_id

            const shipFee = await this.ghnService.getShipFee(
                {
                    districtBuyer: addressSeller?.districtId!,
                    serviceId: serviceId,
                    districtSeller: addressBuyer?.districtId!,
                    value: Number(offer.price),
                    width: offer.post.width!,
                    weight: offer.post.weight!,
                    height: offer.post.height!,
                    length: offer.post.length!
                }
            )

            console.log(shipFee)

            const totalShipFee = shipFee.data.total;

            return await this.transactionService.execute(
                async (tx) => {
                    const updateOffer = await this.offerRepo.acceptOffer(offerId, tx);
                    await this.orderService.createOrder(offer, tx, serviceId, totalShipFee);
                    await this.offerRepo.rejectOffer(offer.postId, offerId, tx);
                    return updateOffer
                }
            )
        } catch (error) {
            throw error;
        }
    }

    async createOffer(offerdto: OfferDTO, user: any) {
        try {

            const post = await this.postService.getPostById(offerdto.postId);
            if (!post) {
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

    async getOffersByPostId(postId: number | undefined) {
        return await this.offerRepo.getOffersByPostId(postId);
    }

    async getAllOffersByUser(userId: number) {
        return await this.offerRepo.getAllOffersByUser(userId);
    }

    async getAllOffer() {
        return await this.offerRepo.getAllOffer();
    }

    async deleteOfferById(id: number, userId: number){
        const offer = await this.offerRepo.getOfferByUserIdAndOfferId(id, userId);
        if(!offer){
            throw new NotFoundException("Offer does not exist or status offer is not PENDING");
        }
        return await this.offerRepo.deleteOffer(id);
    }
}
