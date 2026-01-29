import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { LoginDto, JwtPayload, LoginResponse } from './auth.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: { institutionalEmail: email },
        });

        if (user && user.password) {
            const isMatch = await bcrypt.compare(pass, user.password);
            if (isMatch) {
                const { password, ...result } = user;
                return result;
            }
        }
        return null;
    }

    async login(loginDto: LoginDto): Promise<LoginResponse> {
        const user = await this.validateUser(loginDto.email, loginDto.password);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload: JwtPayload = {
            sub: user.id,
            email: user.institutionalEmail,
            role: user.role,
            fullName: user.fullName
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.institutionalEmail,
                role: user.role,
                fullName: user.fullName,
            },
        };
    }
}
