import { Module } from '@nestjs/common';
import { CashierController } from './cashier.controller';
import { CashierService } from './cashier.service';
import { PrismaService } from '../prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [NotificationsModule],
    controllers: [CashierController],
    providers: [CashierService, PrismaService],
})
export class CashierModule { }
