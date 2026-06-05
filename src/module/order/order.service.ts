import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { CreateOrderDTO } from './dto/create-order.dto';
import { UserRepo } from '../user/user.repository';
import { PostRepository } from '../post/post.repositosy';
import { MapService } from '../map/map.service';
import { GHTKConfig } from '../auth/config/ghtk.config';
import { UpdateOrderDTO } from './dto/update-order.dto';
import { OrderStatus } from '@prisma/client';
import { GhnService } from '../ghn/ghn.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrderService {
    constructor(
        private readonly orderRepo: OrderRepository,
        private readonly userRepo: UserRepo,
        private readonly postRepo: PostRepository,
        private readonly mapService: MapService,
        private readonly ghtkConfig: GHTKConfig,
        private readonly ghnService: GhnService

    ) { }

    async createOrder(offer: any) {
        try {
            // const addressBuyer = offer.buyer.addresss.find(a => a.isDefault === true)
            // const addressSeller = offer.post.author.addresss.find(a => a.isDefault === true)

            // const shipFee = await this.ghtkConfig.getShipFee(addressBuyer, addressSeller, weight, offer.price)

            return await this.orderRepo.createOrder({
                sellerId: offer.post.author.id,
                buyerId: offer.buyerId,
                // totalAmount: Number(offer.price) + Math.round(shipFee / 1000) * 1000,
                postId: offer.postId,
                // shipFee: Math.round(shipFee / 1000) * 1000
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
                        content: order.post.category.name!,
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

                        codAmount: Number(order.post.offers.find(o => o.postId === order.postId)?.price!),
                        value: order.post.price!,

                        serviceId: updateOrderDto.serviceId,
                    })

                    if (!codeId) {
                        throw new BadRequestException("Can not create codeId in GHN");
                    }

                    return await this.orderRepo.updateOrder(order.id, updateOrderDto.serviceId, updateOrderDto.shipFee, codeId, Number(order.post.offers.find(o => o.postId === order.postId)?.price!))

                    break;

                default:
                    throw new Error("Invalid status");
            }
        } catch (error) {
            throw error
        }
    }
}
