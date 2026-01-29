import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AcademicService } from './academic.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('academic')
export class AcademicController {
    constructor(private readonly academicService: AcademicService) { }

    @UseGuards(JwtAuthGuard)
    @Get('courses')
    async getAvailableCourses(
        @Query('department') department: string,
        @Query('level') level: string
    ) {
        return this.academicService.getAvailableCourses(department, Number(level));
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-courses')
    async getEnrolledCourses(@Request() req) {
        return this.academicService.getEnrolledCourses(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('register')
    async registerCourse(@Request() req, @Body() body: { courseId: string }) {
        return this.academicService.registerCourse(req.user.userId, body.courseId);
    }
}
