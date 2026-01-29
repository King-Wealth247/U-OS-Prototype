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
        console.log(`Auth Debug: Attempting login for ${email}`);
        console.log(`Auth Debug: Received password: '${pass}' (Length: ${pass?.length})`);

        const user = await this.prisma.user.findUnique({
            where: { institutionalEmail: email },
        });

        if (!user) {
            console.log('Auth Debug: User NOT FOUND');
            return null;
        }

        console.log(`Auth Debug: User found (ID: ${user.id}). Checking password...`);
        console.log(`Auth Debug: Stored hash starts with: ${user.password.substring(0, 10)}...`);

        if (user && user.password) {
            const isMatch = await bcrypt.compare(pass, user.password);
            console.log(`Auth Debug: Password Match Result: ${isMatch}`);
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
