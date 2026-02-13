import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MapsService {
    constructor(private prisma: PrismaService) {}

    async getMapsByCampus(campusId: string) {
        const maps = await this.prisma.map.findMany({
            where: { campusId },
            include: {
                building: {
                    select: { id: true, name: true, shortCode: true }
                },
                floor: {
                    select: { id: true, floorNumber: true }
                }
            }
        });

        if (!maps.length) {
            throw new NotFoundException(`No maps found for campus ${campusId}`);
        }

        return maps;
    }

    async getMapByCampusAndType(campusId: string, type: string) {
        const map = await this.prisma.map.findFirst({
            where: { campusId, type },
            include: {
                building: true,
                floor: true
            }
        });

        if (!map) {
            throw new NotFoundException(`No ${type} map found for campus ${campusId}`);
        }

        return map;
    }

    async getFloorMaps(buildingId: string) {
        const maps = await this.prisma.map.findMany({
            where: { buildingId, type: 'floor_plan' },
            include: {
                floor: { select: { floorNumber: true } }
            }
        });

        return maps;
    }

    async getFloorMap(floorId: string) {
        const map = await this.prisma.map.findFirst({
            where: { floorId, type: 'floor_plan' },
            include: {
                floor: { select: { floorNumber: true } },
                building: { select: { name: true, shortCode: true } }
            }
        });

        if (!map) {
            throw new NotFoundException(`No map found for floor ${floorId}`);
        }

        return map;
    }

    async getMap(mapId: string) {
        const map = await this.prisma.map.findUnique({
            where: { id: mapId },
            include: {
                campus: { select: { id: true, slug: true, townName: true } },
                building: true,
                floor: true
            }
        });

        if (!map) {
            throw new NotFoundException(`Map ${mapId} not found`);
        }

        return map;
    }
}