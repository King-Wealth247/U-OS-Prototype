import { Injectable, Logger } from '@nestjs/common';

interface NotificationPayload {
    to: string;
    subject?: string;
    message: string;
    templateData?: Record<string, any>;
}

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    /**
     * Send credentials via Email, SMS, and WhatsApp
     * MOCK implementation for demo - logs to console
     * In production, integrate with SendGrid, Twilio, etc.
     */
    async sendCredentials(params: {
        fullName: string;
        institutionalEmail: string;
        personalEmail: string;
        phone: string;
        temporaryPassword: string;
    }): Promise<{ emailSent: boolean; smsSent: boolean; whatsappSent: boolean }> {
        this.logger.log(`📧 Sending credentials to ${params.fullName}...`);

        // Email notification
        const emailSent = await this.sendEmail({
            to: params.personalEmail,
            subject: '🎓 Welcome to U-OS - Your Login Credentials',
            message: `
Dear ${params.fullName},

Welcome to the University Operating System (U-OS)!

Your account has been successfully created. Here are your login credentials:

📧 School Email: ${params.institutionalEmail}
🔑 Temporary Password: ${params.temporaryPassword}

IMPORTANT: For security reasons, please change your password upon first login.

Login here: https://u-os.university.edu/login

If you have any questions, contact your campus administrator.

Best regards,
U-OS Admin Team
      `,
        });

        // SMS notification
        const smsSent = await this.sendSMS({
            to: params.phone,
            message: `U-OS: Your login is ready! Email: ${params.institutionalEmail} | Password: ${params.temporaryPassword} | Change password on first login.`,
        });

        // WhatsApp notification
        const whatsappSent = await this.sendWhatsApp({
            to: params.phone,
            message: `
🎓 *Welcome to U-OS!*

Your account is ready:
📧 Email: ${params.institutionalEmail}
🔑 Password: ${params.temporaryPassword}

⚠️ Change your password on first login for security.

Login: https://u-os.university.edu/login
      `,
        });

        this.logger.log(`✅ Notifications sent - Email: ${emailSent}, SMS: ${smsSent}, WhatsApp: ${whatsappSent}`);

        return { emailSent, smsSent, whatsappSent };
    }

    /**
     * Send generic email
     * MOCK: Logs to console
     */
    private async sendEmail(payload: NotificationPayload): Promise<boolean> {
        this.logger.log(`📧 [EMAIL] To: ${payload.to}`);
        this.logger.log(`Subject: ${payload.subject}`);
        this.logger.log(`Message:\n${payload.message}`);
        this.logger.log(`---`);

        // In production: Use SendGrid, AWS SES, Nodemailer, etc.
        // await this.sgMail.send({to, from, subject, html})

        return true;  // Mock success
    }

    /**
     * Send SMS
     * MOCK: Logs to console
     */
    private async sendSMS(payload: NotificationPayload): Promise<boolean> {
        this.logger.log(`📱 [SMS] To: ${payload.to}`);
        this.logger.log(`Message: ${payload.message}`);
        this.logger.log(`---`);

        // In production: Use Twilio, Africa's Talking, etc.
        // await this.twilioClient.messages.create({to, from, body})

        return true;  // Mock success
    }

    /**
     * Send WhatsApp message
     * MOCK: Logs to console
     */
    private async sendWhatsApp(payload: NotificationPayload): Promise<boolean> {
        this.logger.log(`💬 [WhatsApp] To: ${payload.to}`);
        this.logger.log(`Message: ${payload.message}`);
        this.logger.log(`---`);

        // In production: Use Twilio WhatsApp API
        // await this.twilioClient.messages.create({
        //   to: `whatsapp:${payload.to}`,
        //   from: 'whatsapp:+14155238886',
        //   body: payload.message
        // })

        return true;  // Mock success
    }

    /**
     * Send complaint status update
     */
    async sendComplaintUpdate(params: {
        userEmail: string;
        complaintSubject: string;
        status: string;
        response?: string;
    }): Promise<void> {
        await this.sendEmail({
            to: params.userEmail,
            subject: `Complaint Update: ${params.complaintSubject}`,
            message: `
Your complaint has been updated.

Status: ${params.status}
${params.response ? `\nResponse:\n${params.response}` : ''}

You can track your complaint in the U-OS mobile app.
      `,
        });
    }

    /**
     * Send profile change request notification
     */
    async sendProfileChangeNotification(params: {
        userEmail: string;
        requestType: string;
        status: 'APPROVED' | 'REJECTED';
        reason?: string;
    }): Promise<void> {
        await this.sendEmail({
            to: params.userEmail,
            subject: `Profile Change Request ${params.status}`,
            message: `
Your ${params.requestType} change request has been ${params.status.toLowerCase()}.

${params.reason ? `Reason: ${params.reason}` : ''}

Login to U-OS to view details.
      `,
        });
    }
}
