export interface UserDTO {
    id: string;
    email: string;
    fullName: string;
    role: 'SUPER_ADMIN' | 'CAMPUS_ADMIN' | 'CASHIER' | 'LECTURER' | 'STUDENT' | 'GUEST';
    campusId?: string;
    isActive: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: UserDTO;
    requiresPasswordChange: boolean;
}

export interface TimetableEventDTO {
    id: string;
    courseCode: string;
    courseTitle: string;
    roomCode: string;
    campusName: string;
    startTime: string; // ISO String
    endTime: string;   // ISO String
    lecturerName: string;
}

export interface PaymentWebhookDTO {
    paymentId: string;
    externalRef: string;
    amount: number;
    status: 'PENDING' | 'CLEARED' | 'FAILED';
    studentMatricule?: string;
}
