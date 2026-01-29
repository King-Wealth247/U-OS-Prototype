import { Controller, Post, Body, Logger } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentWebhookDTO } from '@u-os/types';

@Controller('payment')
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name);

    constructor(private readonly paymentService: PaymentService) { }

    @Post('webhook')
    async handleWebhook(@Body() payload: PaymentWebhookDTO) {
        this.logger.log(`Received Webhook: ${payload.paymentId} [${payload.status}]`);

        if (payload.status === 'CLEARED') {
            await this.paymentService.handlePaymentCleared(payload.paymentId);
        }

        return { received: true };
    }
}
