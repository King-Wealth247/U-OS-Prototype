import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service'; // Local service
import { Role, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private prisma: PrismaService) { }

  /**
   * Core Business Rule #6:
   * When payment becomes cleared -> trigger: create user if missing, generate temp password,
   * "send" credentials 3 ways, set account active.
   */
  async handlePaymentCleared(paymentId: string) {
    this.logger.log(`Processing cleared payment: ${paymentId}`);

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment || payment.status !== PaymentStatus.CLEARED) {
      throw new Error('Invalid payment state');
    }

    if (payment.studentMatricule) {
      // Check if user exists
      let user = await this.prisma.user.findFirst({
        where: { institutionalEmail: `${payment.studentMatricule}@university.edu` },
      });

      if (!user) {
        this.logger.log(`Creating new user for matricule: ${payment.studentMatricule}`);
        // Generate credentials
        const tempPassword = randomBytes(8).toString('hex');
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        const institutionalEmail = `${payment.studentMatricule}@university.edu`;

        user = await this.prisma.user.create({
          data: {
            role: Role.STUDENT,
            institutionalEmail,
            fullName: 'Pending Name Registration',
            // createdFromPaymentId: payment.id, // Issue with unique constraint handling in Prisma sometimes
            payment: { connect: { id: payment.id } },
            isActive: true,
            password: hashedPassword,
          },
        });

        // "Send" credentials 3 ways
        this.dispatchCredentials(user.institutionalEmail, user.phone, tempPassword);
      } else {
        // Activate if inactive
        if (!user.isActive) {
          await this.prisma.user.update({
            where: { id: user.id },
            data: { isActive: true }
          });
        }
      }
    }
  }

  private dispatchCredentials(email: string, phone: string | null, pass: string) {
    // 1. Email
    this.logger.log(`[MOCK EMAIL] To: ${email} | Subject: Welcome to U-OS | Body: User: ${email} Pass: ${pass}`);

    // 2. SMS
    if (phone) {
      this.logger.log(`[MOCK SMS] To: ${phone} | Body: U-OS Creds: ${email} / ${pass}`);

      // 3. WhatsApp (using Business API mock)
      this.logger.log(`[MOCK WHATSAPP] To: ${phone} | Template: users_activation | Params: [${email}, ${pass}]`);
    } else {
      this.logger.warn(`No phone number for user ${email}, skipped SMS/WA`);
    }
  }
}
