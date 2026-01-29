import { Module } from '@nestjs/common';
import { PaymentController } from './payment/payment.controller';
import { PaymentService } from './payment/payment.service';
import { PrismaService } from './prisma.service';
import { CashierModule } from './cashier/cashier.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { TimetableModule } from './timetable/timetable.module';
import { AcademicModule } from './academic/academic.module';

@Module({
    imports: [
        CashierModule,
        NotificationsModule,
        AuthModule,
        AdminModule,
        TimetableModule,
        AcademicModule,
    ],
    controllers: [
        PaymentController,
    ],
    providers: [
        PaymentService,
        PrismaService
    ],
})
export class AppModule { }
