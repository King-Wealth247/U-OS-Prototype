import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { NotificationService } from '../notifications/notifications.service';
import { RegisterPaymentDto } from './cashier.controller';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CashierService {
    private readonly logger = new Logger(CashierService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationService: NotificationService,
    ) { }

    /**
     * Register student payment and auto-create account
     */
    async registerPayment(dto: RegisterPaymentDto) {
        // 1. Validate payment reference uniqueness
        const existingPayment = await this.prisma.payment.findUnique({
            where: { externalRef: dto.paymentReference },
        });

        if (existingPayment) {
            throw new BadRequestException('Payment reference already exists');
        }

        // 2. Generate unique matricule number
        const matricule = await this.generateMatricule();

        // 3. Generate institutional email from student name
        const institutionalEmail = this.generateEmailFromName(dto.studentName);

        // Check if email already exists, if so add matricule suffix
        const existingUser = await this.prisma.user.findUnique({
            where: { institutionalEmail },
        });

        const finalEmail = existingUser
            ? this.generateEmailFromName(dto.studentName, matricule.slice(-3))
            : institutionalEmail;

        // 4. Generate temporary password from student name
        const temporaryPassword = this.generatePasswordFromName(dto.studentName);
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        // 5. Determine campus
        const campus = await this.prisma.campus.findFirst({
            where: { slug: dto.campus || 'town-a' },
        });

        if (!campus) {
            throw new BadRequestException('Invalid campus');
        }

        // 6. Create payment record
        const payment = await this.prisma.payment.create({
            data: {
                externalRef: dto.paymentReference,
                studentMatricule: matricule,
                studentName: dto.studentName,
                personalEmail: dto.personalEmail,
                phoneNumber: dto.phoneNumber,
                amount: dto.amount,
                status: 'CLEARED',  // Auto-clear for demo
                clearedAt: new Date(),
            },
        });

        // 7. Create user account
        const user = await this.prisma.user.create({
            data: {
                role: 'STUDENT',
                campusIdHome: campus.id,
                institutionalEmail: finalEmail,
                recoveryEmail: dto.personalEmail,
                phone: dto.phoneNumber,
                fullName: dto.studentName,
                createdFromPaymentId: payment.id,
                isActive: true,
                password: hashedPassword,
                passwordChangedAt: new Date(),
            },
        });

        this.logger.log(`✅ Created user ${user.id} with email ${finalEmail}`);

        // 8. Send credentials via Email, SMS, WhatsApp
        const notificationResult = await this.notificationService.sendCredentials({
            fullName: dto.studentName,
            institutionalEmail: finalEmail,
            personalEmail: dto.personalEmail,
            phone: dto.phoneNumber,
            temporaryPassword,
        });

        // 9. Update payment with notification status
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                credentialsSentAt: new Date(),
                emailSent: notificationResult.emailSent,
                smsSent: notificationResult.smsSent,
                whatsappSent: notificationResult.whatsappSent,
            },
        });

        // 10. Create audit log
        await this.prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'CREATED_USER_VIA_PAYMENT',
                description: `Created user account via payment ref ${payment.id}`,
                metadata: {
                    matricule,
                    paymentAmount: dto.amount.toString(),
                    campus: campus.slug,
                    paymentId: payment.id,
                },
            },
        });

        return {
            user: {
                id: user.id,
                fullName: user.fullName,
                institutionalEmail: user.institutionalEmail,
                matricule,
            },
            payment: {
                id: payment.id,
                reference: payment.externalRef,
                amount: payment.amount,
            },
            notifications: notificationResult,
            temporaryPassword, // Include in response for demo purposes only
        };
    }

    /**
     * Generate unique matricule number
     * Format: YYXXXXX (Year + 5-digit sequential number)
     */
    private async generateMatricule(): Promise<string> {
        const year = new Date().getFullYear().toString().slice(-2);

        // Find all users with emails starting with current year
        const usersThisYear = await this.prisma.user.findMany({
            where: {
                institutionalEmail: {
                    contains: '@university.edu',
                },
            },
            select: {
                institutionalEmail: true,
            },
        });

        // Extract matricules and find the highest sequence number
        let maxSequence = 0;
        for (const user of usersThisYear) {
            const emailPrefix = user.institutionalEmail.split('@')[0];
            // Check if email starts with year pattern (e.g., "26" for 2026)
            if (emailPrefix.match(/^\d{2}\d{5}$/)) {
                const yearPart = emailPrefix.slice(0, 2);
                if (yearPart === year) {
                    const sequence = parseInt(emailPrefix.slice(2), 10);
                    if (!isNaN(sequence) && sequence > maxSequence) {
                        maxSequence = sequence;
                    }
                }
            }
        }

        const nextSequence = maxSequence + 1;
        return `${year}${nextSequence.toString().padStart(5, '0')}`;
    }

    /**
   * Generate password from student name
   * Format: FirstName + LastDigits
   * Example: "John Doe" -> "John26"
   */
    private generatePasswordFromName(fullName: string): string {
        const parts = fullName.trim().split(' ');
        const firstName = parts[0] || 'Student';
        const randomDigits = Math.floor(10 + Math.random() * 90);  // 10-99

        return `${firstName}${randomDigits}`;
    }

    /**
     * Generate institutional email from student name
     * Format: firstname.lastname@university.edu
     * Example: "John Doe" -> "john.doe@university.edu"
     */
    private generateEmailFromName(fullName: string, suffix?: string): string {
        const parts = fullName.trim().toLowerCase().split(' ');
        const firstName = parts[0] || 'student';
        const lastName = parts[parts.length - 1] || 'user';

        // Remove special characters and spaces
        const cleanFirst = firstName.replace(/[^a-z]/g, '');
        const cleanLast = lastName.replace(/[^a-z]/g, '');

        const baseEmail = `${cleanFirst}.${cleanLast}`;
        const finalEmail = suffix ? `${baseEmail}${suffix}` : baseEmail;

        return `${finalEmail}@university.edu`;
    }
}
