import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MapsService } from './maps.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('maps')
@UseGuards(JwtAuthGuard)
export class MapsController {
    constructor(private mapsService: MapsService) {}

    @Get('campus/:campusId')
    async getMapsByCampus(@Param('campusId') campusId: string) {
        return this.mapsService.getMapsByCampus(campusId);
    }

    @Get('campus/:campusId/outdoor')
    async getOutdoorMap(@Param('campusId') campusId: string) {
        return this.mapsService.getMapByCampusAndType(campusId, 'outdoor');
    }

    @Get('building/:buildingId/floors')
    async getFloorMaps(@Param('buildingId') buildingId: string) {
        return this.mapsService.getFloorMaps(buildingId);
    }

    @Get('floor/:floorId')
    async getFloorMap(@Param('floorId') floorId: string) {
        return this.mapsService.getFloorMap(floorId);
    }

    @Get(':mapId')
    async getMap(@Param('mapId') mapId: string) {
        return this.mapsService.getMap(mapId);
    }
}