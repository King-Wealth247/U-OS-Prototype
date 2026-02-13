import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CampusesService {
    constructor(private prisma: PrismaService) {}

    async getAllCampuses() {
        return this.prisma.campus.findMany({
            select: {
                id: true,
                slug: true,
                townName: true,
                centerLat: true,
                centerLng: true
            },
            orderBy: { townName: 'asc' }
        });
    }
}
