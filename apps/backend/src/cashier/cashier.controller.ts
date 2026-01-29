import { Body, Controller, Post, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { CashierService } from './cashier.service';

export class RegisterPaymentDto {
    studentName: string;
    personalEmail: string;
    phoneNumber: string;
    amount: number;
    paymentReference: string;
    campus?: string;
}

@Controller('cashier')
export class CashierController {
    private readonly logger = new Logger(CashierController.name);

    constructor(private readonly cashierService: CashierService) { }

    /**
     * Register a new student payment and create account
     * POST /cashier/register-payment
     */
    @Post('register-payment')
    @HttpCode(HttpStatus.CREATED)
    async registerPayment(@Body() dto: RegisterPaymentDto) {
        this.logger.log(`📝 New payment registration: ${dto.studentName}`);

        const result = await this.cashierService.registerPayment(dto);

        return {
            success: true,
            message: 'Student registered successfully. Credentials sent via Email, SMS, and WhatsApp.',
            data: result,
        };
    }

    /**
     * Get payment stats (for cashier dashboard)
     * GET /cashier/stats
     */
    @Post('stats')
    async getStats() {
        // TODO: Implement stats endpoint
        return {
            todayRegistrations: 12,
            pendingPayments: 5,
            totalRevenue: 15000000,
        };
    }
}
