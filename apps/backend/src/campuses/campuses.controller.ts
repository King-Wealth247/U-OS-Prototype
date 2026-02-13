import { Controller, Get } from '@nestjs/common';
import { CampusesService } from './campuses.service';

@Controller('campuses')
export class CampusesController {
    constructor(private campusesService: CampusesService) {}

    @Get()
    async getAllCampuses() {
        return this.campusesService.getAllCampuses();
    }
}
