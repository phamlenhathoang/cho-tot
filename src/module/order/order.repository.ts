import { Injectable } from "@nestjs/common";
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
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
            include: {
                buyer: {
                    include: {
                        addresss: true
                    }
                },
                post: {
                    include: {
                        category: true,
                        offers: true,
                        author: {
                            include: {
                                addresss: true
                            }
                        }
                    }
                },
                transaction: true
            }
        })
    }

    async updateOrder(orderId: number, codeId: string | null, orderStatus: OrderStatus, tx?: Prisma.TransactionClient) {
        const prisma = tx || this.prismaService;
        return await prisma.order.update({
            where: {
                id: orderId
            }, data: {
                codeId: codeId,
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
                ],
            },
            include: {
                post: true,
                trackings: {
                    orderBy: {
                        createAt: 'desc'
                    }
                },
                buyer: {
                    include: {
                        banks: {
                            where: {
                                isDefault: true
                            }
                        }
                    }
                },
                seller: {
                    include: {
                        banks: {
                            where: {
                                isDefault: true
                            }
                        }
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
                OR: [
                    { sellerId: userId },
                    { buyerId: userId }
                ]
            }, include: {
                post: true,
            }
        })
    }

    async getAll() {
        return await this.prismaService.order.findMany()
    }

    async getOrderByCodeId(codeId: string) {
        return await this.prismaService.order.findFirst({
            where: {
                codeId: codeId
            }
        })
    }

    async updateStatusOrder(id: number, status: OrderStatus, tx ?: Prisma.TransactionClient) {
        const prisma = tx || this.prismaService
        return await prisma.order.update({
            where: {
                id: id
            },
            data: {
                orderStatus: status,
                paymentStatus: 'PAID',
                releasedAt: new Date(),
            }
        })
    }

    async updateReleaseAt(id: number, autoReleaseAt: Date, tx?: Prisma.TransactionClient) {
        const prisma = tx || this.prismaService
        return await prisma.order.update({
            where: {
                id: id
            },
            data: {
                autoReleaseAt: autoReleaseAt,
                paymentStatus: 'PAID',
                paidAt: new Date()
            }
        })
    }

    async updateStatusOrderPayment(id: number, paymentStatus: PaymentStatus, releaseAt: Date, orderStatus: OrderStatus) {
        return await this.prismaService.order.update({
            where: {
                id: id
            },
            data: {
                paymentStatus: paymentStatus,
                releasedAt: releaseAt,
                orderStatus: orderStatus
            }
        })
    }

    async markAsPaid(id: number, tx?: Prisma.TransactionClient) {
        const prisma = tx || this.prismaService
        return await prisma.order.update({
            where: {
                id: id
            }, data: {
                paymentStatus: 'PAID',
                
            }
        })
    }
    

    async updateOrderById(orderId: number, data: any) {
        return await this.prismaService.order.update({
            where: {
                id: orderId
            },
            data: data
        })
    }

}