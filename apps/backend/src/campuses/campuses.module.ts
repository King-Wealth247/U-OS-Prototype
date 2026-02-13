import { Module } from '@nestjs/common';
import { CampusesController } from './campuses.controller';
import { CampusesService } from './campuses.service';
import { PrismaModule } from '../prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [CampusesController],
    providers: [CampusesService],
    exports: [CampusesService]
})
export class CampusesModule {}
