import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { RolesGuard } from '../auth/roles.guard';

@Controller('timetable')
export class TimetableController {
    constructor(private readonly timetableService: TimetableService) { }

    @UseGuards(JwtAuthGuard)
    @Post('events')
    async createEvent(@Body() body: any) {
        return this.timetableService.createEvent(body);
    }

    @Get('events')
    async getWeeklySchedule(
        @Query('level') level: string,
        @Query('department') department: string
    ) {
        return this.timetableService.getWeeklySchedule(Number(level), department);
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-schedule')
    async getMySchedule(@Request() req) {
        return this.timetableService.getMySchedule(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('events/:id')
    async deleteEvent(@Param('id') id: string) {
        return this.timetableService.deleteEvent(id);
    }
}
