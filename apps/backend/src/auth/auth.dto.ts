import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MinLength(6)
    password: string;
}

export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    fullName?: string;
}

export interface LoginResponse {
    access_token: string;
    user: {
        id: string;
        email: string;
        role: string;
        fullName: string;
    };
}
