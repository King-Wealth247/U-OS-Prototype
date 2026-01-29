import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('dashboard/stats')
    async getStats() {
        return this.adminService.getDashboardStats();
    }

    @Get('profile-requests')
    async getProfileRequests() {
        return this.adminService.getProfileRequests();
    }

    @Post('profile-requests/:id/approve')
    async approveRequest(@Param('id') id: string, @Request() req) {
        return this.adminService.approveProfileRequest(id, req.user.id);
    }

    @Post('profile-requests/:id/reject')
    async rejectRequest(@Param('id') id: string, @Body('reason') reason: string, @Request() req) {
        return this.adminService.rejectProfileRequest(id, req.user.id, reason);
    }

    @Get('complaints')
    async getComplaints() {
        return this.adminService.getComplaints();
    }

    @Patch('complaints/:id/assign')
    async assignComplaint(@Param('id') id: string, @Body('staffId') staffId: string) {
        return this.adminService.assignComplaint(id, staffId);
    }

    @Patch('complaints/:id/status')
    async updateComplaintStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.adminService.updateComplaintStatus(id, status);
    }

    @Get('staff')
    async getStaff() {
        return this.adminService.getStaff();
    }

    @Post('staff')
    async createStaff(@Body() body: any) {
        return this.adminService.createStaff(body.email, body.position, body.departmentId, body.salary);
    }

    @Patch('staff/:id')
    async updateStaff(@Param('id') id: string, @Body() body: any) {
        return this.adminService.updateStaff(id, body);
    }

    @Delete('staff/:id')
    async deleteStaff(@Param('id') id: string) {
        return this.adminService.deleteStaff(id);
    }

    @Get('admins')
    async getAdmins() {
        return this.adminService.getSystemAdmins();
    }

    @Get('departments')
    async getDepartments() {
        return this.adminService.getAllDepartments();
    }

    @Get('lecturers')
    async getLecturers() {
        return this.adminService.getAllLecturers();
    }

    @Get('students')
    async getStudents() {
        return this.adminService.getAllStudents();
    }

    @Post('users')
    async createUser(@Body() body: any) {
        // Body: { fullName, institutionalEmail, personalEmail, phoneNumber, role, departmentId, position, salary }
        return this.adminService.createUser(body);
    }
}
