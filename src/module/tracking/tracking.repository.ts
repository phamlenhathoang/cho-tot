import { Injectable } from "@nestjs/common";
import { mapGhnStatusToEnum } from "src/common/helper/mapper-status-order-tracking";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class TrackingRepository {
    constructor(private readonly prismaService: PrismaService) { }

    async createTracking(tracking: any) {
        return await this.prismaService.orderTracking.create({
            data: tracking
        })
    }

    async updateTracking(trackingId: number, status: any) {
        return await this.prismaService.orderTracking.update({
            where: {
                id: trackingId
            }, data: {
                statusOrderTracking: mapGhnStatusToEnum(status)
            }
        })
    }
}