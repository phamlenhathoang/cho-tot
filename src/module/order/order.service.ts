import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { CreateOrderDTO } from './dto/create-order.dto';
import { UserRepo } from '../user/user.repository';
import { PostRepository } from '../post/post.repositosy';
import { MapService } from '../map/map.service';
import { GHTKConfig } from '../auth/config/ghtk.config';
import { UpdateOrderDTO } from './dto/update-order.dto';
import { OfferStatus, OrderStatus, Prisma } from '@prisma/client';
import { GhnService } from '../ghn/ghn.service';
import { TrackingService } from '../tracking/tracking.service';
import { TransactionService } from '../transaction/tracsaction.service';
import { OfferRepository } from '../offer/offer.repository';

@Injectable()
export class OrderService {
    constructor(
        private readonly orderRepo: OrderRepository,
        private readonly userRepo: UserRepo,
        private readonly postRepo: PostRepository,
        private readonly mapService: MapService,
        private readonly ghtkConfig: GHTKConfig,
        private readonly ghnService: GhnService,
        private readonly trackingService: TrackingService,
        private readonly transactionService: TransactionService,
        private readonly offerRepo: OfferRepository
    ) { }

    async createOrder(offer: any, tx: Prisma.TransactionClient, serviceId : number, totalShipFee : any) {
        try {
            const price = Number(offer.price)
            const prisma = tx;
            return await prisma.order.create({
                data: {
                    sellerId: offer.post.author.id,
                    buyerId: offer.buyerId,
                    postId: offer.postId,
                    serviceId: serviceId,
                    shipFee: totalShipFee,
                    totalAmount: price + totalShipFee
                }
            })

        } catch (error) {
            throw error;
        }
    }

    async updateOrder(updateOrderDto: UpdateOrderDTO, user: any) {
        try {
            const order = await this.orderRepo.getOrderById(updateOrderDto.orderId, user.id);
            if (!order) {
                throw new NotFoundException("Order does not exist");
            }
            switch (updateOrderDto.orderStatus) {
                case OrderStatus.ACCEPTED:

                    if (order.orderStatus != OrderStatus.PENDING) {
                        throw new BadRequestException("Order must be pending status");
                    }

                    const codeId = await this.ghnService.createGHNOrder({
                        content: order.post.title!,
                        fromName: order.post.author.name!,
                        fromPhone: order.post.author.phone!,
                        fromAddress: order.post.author.addresss.find(a => a.isDefault === true)?.street!,
                        fromWard: order.post.author.addresss.find(a => a.isDefault === true)?.ward!,
                        fromDistrictId: order.post.author.addresss.find(a => a.isDefault === true)?.districtId!,

                        toName: order.buyer.name!,
                        toPhone: order.buyer.phone!,
                        toAddress: order.buyer.addresss.find(a => a.isDefault === true)?.street!,
                        toWard: order.buyer.addresss.find(a => a.isDefault === true)?.ward!,
                        toWardCode: String(order.buyer.addresss.find(a => a.isDefault === true)?.wardCode!),
                        toDistrictId: order.buyer.addresss.find(a => a.isDefault === true)?.districtId!,

                        weight: order.post.weight!,
                        length: order.post.length!,
                        width: order.post.width!,
                        height: order.post.height!,

                        codAmount: Number(order.post.offers.find(o => o.postId === order.postId && o.buyerId === order.buyerId && o.offerStatus === OfferStatus.ACCEPTED)?.price!),
                        value: order.post.price!,

                        serviceId: order.serviceId!,
                        orderId: order.id
                    })

                    if (!codeId) {
                        throw new BadRequestException("Can not create codeId in GHN");
                    }

                    const trackingData = await this.ghnService.getTrackingInfo(codeId);
                    await this.trackingService.createTracking({
                        orderId: order.id,
                        statusOrderTracking: trackingData,
                    })

                    return await this.orderRepo.updateOrder(order.id, codeId, updateOrderDto.orderStatus)

                    break;
                
                case OrderStatus.CANCELED:
                    if (order.orderStatus != OrderStatus.PENDING) {
                        throw new BadRequestException("Order must be pending status");
                    }

                    return await this.transactionService.execute(
                        async(tx) => {
                            const updatedOrder = await this.orderRepo.updateOrder(order.id, updateOrderDto.orderStatus,tx);
                            await this.offerRepo.updateOffer(order.post.offers.find(o => o.buyerId === order.buyerId && o.postId === order.postId)?.id!, OfferStatus.CANCELED,tx);
                            return updatedOrder;
                        }
                    )
                default:
                    throw new Error("Invalid status");
            }
        } catch (error) {
            throw error
        }
    }

    async getOrderAndTrackingByOrderId(orderId: number, user: any) {
        try {
            const order = await this.orderRepo.getOrder(orderId, user.id);
            if (!order) {
                throw new NotFoundException("Order does not exist");
            }

            if (order.trackings) {
                const tracking = await this.ghnService.getTrackingInfo(order.codeId!);
                if (!tracking) {
                    throw new NotFoundException("Tracking does not exist");
                }

                const orderTracking = order.trackings.find(
                    t => t.statusOrderTracking === tracking,
                );

                if (!orderTracking) {
                    await this.trackingService.createTracking({
                        orderId: order.id,
                        statusOrderTracking: tracking,
                    })
                }
                
                return await this.orderRepo.getOrder(orderId, user.id);
            }

            return order;
        } catch (error) {
            throw error;
        }
    }

    async getOrderById(orderId: number, user: any) {
        return await this.orderRepo.getOrderById(orderId, user.id);
    }

    async getAllOrderByUser(user: any) {
        console.log(user)
        return await this.orderRepo.getAllOrderByUser(user.id);
    }

    async getOrderByPostId(postId: number, user: any) {
        return await this.orderRepo.getOrderByPostId(postId, user.id);
    }
}
