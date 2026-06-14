import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class TrackingRepository {
    constructor(private readonly prismaService: PrismaService) { }

    async createTracking(tracking: any) {
        return await this.prismaService.orderTracking.create({
            data: tracking
        })
    }

    async updateTracking(trackingId: number, tracking: string) {
        return await this.prismaService.orderTracking.update({
            where: {
                id: trackingId
            }, data: {
                statusOrderTracking: tracking
            }
        })
    }
}