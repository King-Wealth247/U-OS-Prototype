import { Controller, Post, Patch, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('change-password')
    async changePassword(@Request() req, @Body('newPassword') newPassword: string) {
        await this.authService.changePassword(req.user.id, newPassword);
        return { success: true, message: 'Password updated successfully' };
    }

    @UseGuards(JwtAuthGuard)
    @Patch('update-profile')
    async updateProfile(@Request() req, @Body() body: { personalEmail?: string; phone?: string }) {
        await this.authService.updateProfile(req.user.id, body);
        return { success: true, message: 'Profile updated successfully' };
    }
}
