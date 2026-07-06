import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { CreateOrderDTO } from './dto/create-order.dto';
import { UserRepo } from '../user/user.repository';
import { PostRepository } from '../post/post.repositosy';
import { MapService } from '../map/map.service';
import { GHTKConfig } from '../auth/config/ghtk.config';
import { UpdateOrderDTO } from './dto/update-order.dto';
import { OfferStatus, OrderStatus, PaymentStatus, Prisma, StatusOrderTracking } from '@prisma/client';
import { GhnService } from '../ghn/ghn.service';
import { TrackingService } from '../tracking/tracking.service';
import { TransactionTrackingService } from '../transaction-tracking/tracsaction-tracking.service';
import { OfferRepository } from '../offer/offer.repository';
import { mapGhnStatusToEnum } from 'src/common/helper/mapper-status-order-tracking';
import { PaymentService } from '../payment/payment.service';

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
        private readonly transactionService: TransactionTrackingService,
        private readonly offerRepo: OfferRepository,
        @Inject(forwardRef(() => PaymentService))
        private readonly paymentService: PaymentService
    ) { }

    async createOrder(offer: any, tx: Prisma.TransactionClient, serviceId: number, totalShipFee: any) {
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
                    if (!trackingData) {
                        throw new NotFoundException('Tracking does not exist');
                    }

                    await this.trackingService.createTracking({
                        orderId: order.id,
                        statusOrderTracking: trackingData,
                    })

                    if (updateOrderDto.paymentMethod === 'BANKING') {
                        await this.paymentService.createPaymentPayOsUrl(order)
                    }

                    return await this.orderRepo.updateOrder(order.id, codeId, updateOrderDto.orderStatus)

                    break;

                case OrderStatus.CANCELED:
                    if (order.orderStatus != OrderStatus.PENDING) {
                        throw new BadRequestException("Order must be pending status");
                    }

                    return await this.transactionService.execute(
                        async (tx) => {
                            const updatedOrder = await this.orderRepo.updateOrder(order.id, updateOrderDto.orderStatus, tx);
                            await this.offerRepo.updateOffer(order.post.offers.find(o => o.buyerId === order.buyerId && o.postId === order.postId)?.id!, OfferStatus.CANCELED, tx);
                            return updatedOrder;
                        }
                    )

                    break;
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

                const status = mapGhnStatusToEnum(tracking);

                const orderTracking = order.trackings.find(
                    t => t.statusOrderTracking === status,
                );

                if (!orderTracking) {
                    await this.trackingService.createTracking({
                        orderId: order.id,
                        statusOrderTracking: tracking,
                    })
                }

                return await this.transactionService.execute(
                    async (tx) => {
                        var orderStatus 
                        if (status === 'DELIVERED') {
                            orderStatus = OrderStatus.COMPLETED
                            await this.paymentService.refund(order, status)
                        }
                        if(status === 'RETURNED'){
                            orderStatus = OrderStatus.CANCELED
                            await this.paymentService.refund(order, status)
                        }
                        await this.orderRepo.updateStatusOrder(orderId, orderStatus, tx);
                    }
                )
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

    async getAll() {
        return await this.orderRepo.getAll()
    }

    async updateReleaseAt(id: number, autoReleaseAt: Date, tx?: Prisma.TransactionClient) {
        return await this.orderRepo.updateReleaseAt(id, autoReleaseAt, tx);
    }

    async updateStatusOrder(id: number, paymentStatus: PaymentStatus, releaseAt: Date, orderStatus: OrderStatus) {
        return await this.orderRepo.updateStatusOrderPayment(id, paymentStatus, releaseAt, orderStatus)
    }

    async markAsPaid(id: number) {
        return await this.orderRepo.markAsPaid
    }

    async updateOrderById(id: number, data: any) {
        return await this.orderRepo.updateOrderById(id, data)
    }
}
