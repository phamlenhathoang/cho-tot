import { BadRequestException, forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { VNPAYConfig } from '../auth/config/vnpay-config';
import { PaymentRepository } from './payment.repository';
import { OrderService } from '../order/order.service';
import { TransactionService } from '../transaction/transaction.service';
import { createVnpayPaymentUrl, verifyVnpayChecksum } from 'src/common/helper/vnpay.helper';
import { TransactionTrackingService } from '../transaction-tracking/tracsaction-tracking.service';
import { PayOS } from '@payos/node';
import { PayosConfig } from '../auth/config/payos-config';
import { BkPayosConfig } from '../auth/config/bk-payos-config';
import { UserService } from '../user/user.service';
import { createHmac } from 'crypto';
import console from 'console';

@Injectable()
export class PaymentService {

    private readonly logger = new Logger(PaymentService.name)
    private readonly payos
    private readonly bk

    constructor(
        private readonly vnpayConfig: VNPAYConfig,
        private readonly paymentRepository: PaymentRepository,
        @Inject(forwardRef(() => OrderService))
        private readonly orderService: OrderService,
        private readonly transactionService: TransactionService,
        private readonly transactionTrackingService: TransactionTrackingService,
        private readonly payosConfig: PayosConfig,
        private readonly bkConfig: BkPayosConfig,
        private readonly userService: UserService,
    ) {
        this.payos = new PayOS({
            apiKey: payosConfig.getApiKey(),
            clientId: payosConfig.getClientID(),
            checksumKey: payosConfig.getCheckSum(),
        }),

            this.bk = new PayOS({
                apiKey: bkConfig.getBkApiKey(),
                clientId: bkConfig.getBkClientID(),
                checksumKey: bkConfig.getBkCheckSum(),
            })
    }

    async createPaymentPayOsUrl(order: any) {

        if (order.checkoutUrl) {
            return order;
        }

        if (!order.totalAmount) {
            throw new BadRequestException("Order does not has totalAmount");
        }

        const amount = Number(order.totalAmount)

        if (!amount || amount <= 0) {
            throw new BadRequestException(`Order ${order.id} có totalAmount không hợp lệ: ${order.totalAmount}`);
        }

        const orderCode = Number(`${Date.now()}`.slice(-9));

        const paymentLink = await this.payos.paymentRequests.create({
            orderCode: orderCode,
            amount,
            description: `Thanh toan don hang`,
            returnUrl: this.payosConfig.getReturnUrl(),
            cancelUrl: this.payosConfig.getCancelUrl(),
        });

        // await this.orderService.updateOrderById(order.id, { payosOrderCode: orderCode.toString(), checkoutUrl: paymentLink.checkoutUrl, paymentMethod: 'BANKING' })
        await this.transactionService.createTransaction({
            orderId: order.id,
            totalAmount: amount,
            status: 'PENDING',
            orderCode: orderCode.toString(),
            urlPayment : paymentLink.checkoutUrl,
        })

        return {
            checkoutUrl: paymentLink.checkoutUrl,
            qrCode: paymentLink.qrCode,
        }
    }

    async handlePaymentWebhook(body: any) {
        let webhookData;
        try {
            // verify() tự check chữ ký, throw nếu sai
            webhookData = await this.payos.webhooks.verify(body);
        } catch (err) {
            // this.logger.warn(`Chữ ký webhook Thu không hợp lệ: ${err.message}`);
            throw new BadRequestException('Invalid signature');
        }

        const { orderCode, code, desc } = webhookData;

        if (code !== '00') {
            this.logger.warn(`Payment Thu thất bại orderCode=${orderCode}, code=${code}, desc=${desc}`);
            return { success: false, message: `Payment Thu thất bại orderCode=${orderCode}, code=${code}, desc=${desc}` };
        }

        const order = await this.transactionService.getTransaction(orderCode);
        if (!order) {
            this.logger.warn(`Payment Thu không tìm thấy orderCode=${orderCode}`);
            return { success: false, message: `Payment Thu không tìm thấy orderCode=${orderCode}` };
        }

        await this.orderService.markAsPaid(order.id);

        return { success: true };
    }

    // payment.service.ts
    async confirmWebhookUrl() {
        const webhookUrl = process.env.PAYOS_THU_WEBHOOK_URL
            ?? 'https://cho-tot-production.up.railway.app/payment/thu';

        const result = await this.payos.webhooks.confirm(webhookUrl);
        this.logger.log(`Đã confirm webhook URL: ${webhookUrl}`);
        return result;
    }


    async refund(order: any, status: any) {
        const reference = order.payosOrderCode;
        if (status === 'DELIVERED') {
            const seller = order.seller; // hoặc order.product.seller tuỳ schema
            const bank = seller.banks.find(b => b.isDefault);

            return this.bk.payouts.create({
                referenceId: reference,
                amount: Number(order.totalAmount),
                description: 'Thanh toan',
                toBin: bank?.bin!,
                toAccountNumber: bank?.accountNumber!,
            });
        }

        if (status === 'RETURNED') {
            // Hoàn tiền cho BUYER
            const bank = order.buyer.banks.find(b => b.isDefault);
            return this.bk.payouts.create({
                referenceId: reference,
                amount: Number(order.totalAmount),
                description: 'Hoan tien',
                toBin: bank?.bin!,
                toAccountNumber: bank?.accountNumber!,
            });
        }

        throw new Error(`Trạng thái không hợp lệ để xử lý payout: ${status}`);
    }
}