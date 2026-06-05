import { Injectable } from "@nestjs/common";
import { OrderStatus, Prisma } from "@prisma/client";
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

    async updateOrder(orderId: number, serviceId: number, shipFee: number, codeId: string | null, price: number, orderStatus: OrderStatus, tx?: Prisma.TransactionClient) {
        const prisma = tx || this.prismaService;
        return await prisma.order.update({
            where: {
                id: orderId
            }, data: {
                serviceId: serviceId,
                shipFee: shipFee,
                codeId: codeId,
                totalAmount: shipFee + price,
                orderStatus: orderStatus
            }
        })
    }

    async getOrder(orderId: number, userId: number) {
        return await this.prismaService.order.findFirst({
            where: {
                id: orderId,

                OR: [
                    {
                        buyerId: userId
                    },
                    {
                        sellerId: userId
                    }
                ]
            },
            include:{
                post: true,
                trackings: {
                    orderBy: {
                        createAt: 'desc'
                    }
                }
            }
        })
    }

    async getAllOrderByUser(userId: number) {
        return await this.prismaService.order.findMany({
            where: {
                buyerId: userId
            }
        })
    }

    async getOrderByPostId(postId: number, userId: number) {
        return await this.prismaService.order.findMany({
            where: {
                postId: postId,
                OR:[
                    {sellerId: userId},
                    {buyerId: userId}
                ]
            }, include: {
                post: true,
            }
        })
    }
}