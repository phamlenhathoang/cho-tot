import { Injectable } from "@nestjs/common";
import { OrderStatus } from "@prisma/client";
import { post } from "axios";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class OrderRepository {
    constructor(private readonly prismaService: PrismaService) { }

    async createOrder(order: any) {
        return await this.prismaService.order.create({
            data: order
        })
    }

    async getOrderById(orderId: number, userId: number) {
        return await this.prismaService.order.findFirst({
            where: {
                id: orderId,
                buyerId: userId
            },
            include:{
                buyer: {
                    include:{
                        addresss: true
                    }
                },
                post: {
                    include:{
                        category: true,
                        offers: true,
                        author:{
                            include:{
                                addresss: true
                            }
                        }
                    }
                }
            }
        })
    }

    async updateOrder(orderId: number, serviceId: number, shipFee: number, codeId: string, price: number) {
        return await this.prismaService.order.update({
            where: {
                id: orderId
            }, data: {
                serviceId: serviceId,
                shipFee: shipFee,
                codeId: codeId,
                totalAmount: shipFee + price,
                orderStatus: OrderStatus.ACCEPTED
            }
        })
    }
}