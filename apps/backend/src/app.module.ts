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
import { MapsModule } from './maps/maps.module';
import { PrismaModule } from './prisma.module';

@Module({
    imports: [
        PrismaModule,
        CashierModule,
        NotificationsModule,
        AuthModule,
        AdminModule,
        TimetableModule,
        AcademicModule,
        MapsModule
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
