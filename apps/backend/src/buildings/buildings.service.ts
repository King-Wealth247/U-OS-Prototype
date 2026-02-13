import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BuildingsService {
    constructor(private prisma: PrismaService) {}

    async getBuildingsByCampus(campusId: string) {
        const buildings = await this.prisma.building.findMany({
            where: { campusId },
            select: {
                id: true,
                name: true,
                shortCode: true,
                campusId: true
            },
            orderBy: { name: 'asc' }
        });

        return buildings;
    }

    async getFloorsByBuilding(buildingId: string) {
        const floors = await this.prisma.floor.findMany({
            where: { buildingId },
            select: {
                id: true,
                floorNumber: true,
                buildingId: true,
                planImageUrl: true
            },
            orderBy: { floorNumber: 'asc' }
        });

        return floors;
    }
}
