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

    async createPaymentUrl(orderId: number, ipAddr: string, userId: number) {
        const order = await this.orderService.getOrderById(orderId, userId);
        if (!order) {
            throw new NotFoundException(`Order ${orderId} không tồn tại`);
        }
        if (!order.totalAmount) {
            throw new Error(`Order ${orderId} chưa có totalAmount`);
        }

        const txnRef = `ORDER${orderId}_${Date.now()}`
        const amount = Math.round(Number(order.totalAmount))

        // await this.transactionService.createTransaction(order.id, txnRef, amount, 'PENDING')

        return createVnpayPaymentUrl({
            vnpTmnCode: this.vnpayConfig.getTmnCode(),
            vnpHashSecret: this.vnpayConfig.getHashSecret(),
            vnpUrl: this.vnpayConfig.getUrl(),
            vnpReturnUrl: this.vnpayConfig.getReturnUrl(),
            txnRef,
            amount,
            orderInfo: `Thanh toan don hang ${order.id}`,
            ipAddr,
        });
    }

    async handleIpn(query: Record<string, string>) {
        const { isValid } = verifyVnpayChecksum({ vnpHashSecret: this.vnpayConfig.getHashSecret(), query })
        if (!isValid) {
            console.log(this.vnpayConfig.getHashSecret())
            this.logger.warn(`IPN checksum wrong, txnRef=${query['vnp_TxnRef']}`)
            return { RspCode: '97', Message: 'Invalid signature' }
        }

        const txnRef = query['vnp_TxnRef'];
        const transaction = await this.transactionService.getTransaction(txnRef)

        if (!transaction) {
            this.logger.warn(`IPN do not found transaction txnRef=${txnRef}`)
            return { RspCode: '01', Message: 'Order do not found' }
        }

        if (transaction.status !== 'PENDING') {
            this.logger.warn(`IPN txpRef=${txnRef} must be PENDING status, skip`)
            return { RspCode: '02', Message: 'Order already confirmed' }
        }

        const vnpAmount = Number(query['vnpAmount']) / 100
        if (vnpAmount !== transaction.amount) {
            this.logger.warn(`Amount IPN wrong txpRef=${txnRef}, expected=${transaction.amount}, got=${vnpAmount}`)
            return { RspCode: '04', Message: 'Invalid amount' }
        }

        const isPaymentSuccess = query['vnp_ResponseCode'] === '00'

        this.transactionTrackingService.execute(
            async (tx) => {
                await this.transactionService.updateTransaction(transaction.id, isPaymentSuccess ? 'SUCCESS' : 'FAILED', query['vnp_TransactionNo'], query['vnp_BankCode'], query['vnp_PayDate'], query)

                if (isPaymentSuccess) {
                    const autoRealeaseAt = new Date();
                    autoRealeaseAt.setDate(autoRealeaseAt.getDate() + 3)

                    await this.orderService.updateReleaseAt(transaction.orderId, autoRealeaseAt, tx)
                }
            }
        )
    }

    async confirmReceived(orderId: number, buyerId: number) {
        const order = await this.orderService.getOrderById(orderId, buyerId);

        if (!order) throw new NotFoundException(`Order ${orderId} không tồn tại`);
        if (order.buyerId !== buyerId) {
            throw new Error('Chỉ buyer của đơn hàng này mới được xác nhận');
        }
        if (order.paymentStatus !== 'PAID') {
            throw new Error(`Order ${orderId} chưa ở trạng thái PAID, không thể release`);
        }

        return await this.orderService.updateStatusOrder(order.id, 'RELEASED', new Date(), 'COMPLETED');
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

        await this.orderService.updateOrderById(order.id, { payosOrderCode: orderCode.toString(), checkoutUrl: paymentLink.checkoutUrl, paymentMethod: 'BANKING' })

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

        console.log(`Webhook Thu: orderCode=${orderCode}, code=${code}, desc=${desc}`);

        return { success: true };
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