import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BuildingsService } from './buildings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('buildings')
@UseGuards(JwtAuthGuard)
export class BuildingsController {
    constructor(private buildingsService: BuildingsService) {}

    @Get('campus/:campusId')
    async getBuildingsByCampus(@Param('campusId') campusId: string) {
        return this.buildingsService.getBuildingsByCampus(campusId);
    }

    @Get(':buildingId/floors')
    async getFloorsByBuilding(@Param('buildingId') buildingId: string) {
        return this.buildingsService.getFloorsByBuilding(buildingId);
    }
}
