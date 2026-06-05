import { Injectable } from '@nestjs/common';
import { TrackingRepository } from './tracking.repository';
import { GhnService } from '../ghn/ghn.service';
import { OrderRepository } from '../order/order.repository';

@Injectable()
export class TrackingService {
    constructor(
        private readonly trackingRepository: TrackingRepository,
        private readonly ghnService: GhnService,
        private readonly orderRepository: OrderRepository
    ) { }

    async createTracking(tracking: any) {
        return await this.trackingRepository.createTracking(tracking)
    }

    async getTrackingByOrderId(orderId: number, user: any) {
        try {
            const order = await this.orderRepository.getOrder(orderId, user.id);
            if (!order) {
                throw new Error('Order not found');
            }

        } catch (error) {
            throw error;
        }
    }

    async updateTracking(trackingId: number, tracking: string) {  
        return await this.trackingRepository.updateTracking(trackingId, tracking)
    }

    
}
