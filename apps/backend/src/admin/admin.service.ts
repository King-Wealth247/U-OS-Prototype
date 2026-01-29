import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Role, StaffPosition } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { NotificationService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private notifications: NotificationService
    ) { }

    private generatePassword(lastName: string): string {
        // Generate random 8-character alphanumeric password
        // Math.random toString(36) gives 0.alphanum... slice 2 for 8 chars
        return Math.random().toString(36).slice(2, 10); // e.g. 'k4l2m5n9'
    }

    async createUser(data: {
        fullName: string,
        institutionalEmail: string,
        personalEmail: string,
        phoneNumber: string,
        role: Role,
        departmentId?: string, // for staff/student
        position?: string, // for staff
        salary?: number // for staff
    }) {
        // Check existence
        const existing = await this.prisma.user.findUnique({ where: { institutionalEmail: data.institutionalEmail } });
        if (existing) throw new Error('User with this email already exists');

        // Generate Password
        const lastName = data.fullName.split(' ').pop() || 'User';
        const rawPassword = this.generatePassword(lastName);
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // Transaction to ensure consistency
        const newUser = await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    fullName: data.fullName,
                    institutionalEmail: data.institutionalEmail,
                    password: hashedPassword,
                    role: data.role,
                    campus: { connect: { slug: 'town-a' } }, // Default to Campus A
                }
            });

            // Role specific records
            if (data.role === Role.LECTURER || data.role === Role.SUPER_ADMIN || data.role === Role.CAMPUS_ADMIN || data.role === Role.CASHIER) {
                // Determine if they are treated as staff
                if (data.position || data.salary) {
                    await tx.staffMember.create({
                        data: {
                            userId: user.id,
                            position: (data.position as StaffPosition) || StaffPosition.LECTURER,
                            departmentId: data.departmentId || 'CE', // Default fallback
                            salary: data.salary || 0,
                            hireDate: new Date()
                        }
                    });
                }
            }

            return user;
        });

        // Send Notification (Async/Fire-and-forget)
        this.notifications.sendCredentials({
            fullName: newUser.fullName,
            institutionalEmail: newUser.institutionalEmail,
            personalEmail: data.personalEmail,
            phone: data.phoneNumber,
            temporaryPassword: rawPassword
        });

        return { user: newUser, tempPassword: rawPassword };
    }

    async getDashboardStats() {
        // Run parallel queries
        const [
            totalUsers,
            pendingRequests,
            activeComplaints,
            totalStaff
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.profileChangeRequest.count({ where: { status: 'PENDING' } }),
            this.prisma.complaint.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
            this.prisma.staffMember.count(),
        ]);

        return {
            totalUsers,
            pendingRequests,
            activeComplaints,
            totalStaff
        };
    }

    // Profile Requests
    async getProfileRequests(status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
        return this.prisma.profileChangeRequest.findMany({
            where: status ? { status } : {},
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async approveProfileRequest(id: string, adminId: string) {
        return this.prisma.$transaction(async (tx) => {
            const request = await tx.profileChangeRequest.findUnique({ where: { id } });
            if (!request || request.status !== 'PENDING') throw new Error('Invalid request');

            // Update User
            const updateData: any = {};
            if (request.requestType === 'NAME') updateData.fullName = request.newValue;
            if (request.requestType === 'EMAIL') updateData.institutionalEmail = request.newValue;

            await tx.user.update({
                where: { id: request.userId },
                data: updateData
            });

            // Update Request
            return tx.profileChangeRequest.update({
                where: { id },
                data: {
                    status: 'APPROVED',
                    reviewedById: adminId,
                    reviewedAt: new Date()
                }
            });
        });
    }

    async rejectProfileRequest(id: string, adminId: string, reason: string) {
        return this.prisma.profileChangeRequest.update({
            where: { id },
            data: {
                status: 'REJECTED',
                reviewedById: adminId,
                reviewedAt: new Date(),
                rejectionReason: reason
            }
        });
    }

    // Complaints
    async getComplaints() {
        return this.prisma.complaint.findMany({
            include: {
                user: { select: { fullName: true, institutionalEmail: true } },
                assignedTo: { include: { user: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async assignComplaint(id: string, staffId: string) {
        return this.prisma.complaint.update({
            where: { id },
            data: { assignedToId: staffId, status: 'IN_PROGRESS' }
        });
    }

    async updateComplaintStatus(id: string, status: any) { // Type check later
        return this.prisma.complaint.update({
            where: { id },
            data: { status }
        });
    }

    // Staff
    async getStaff() {
        return this.prisma.staffMember.findMany({
            include: { user: true }
        });
    }

    async createStaff(email: string, position: any, departmentId: string, salary: number) {
        const user = await this.prisma.user.findUnique({ where: { institutionalEmail: email } });
        if (!user) throw new Error('User not found');

        return this.prisma.staffMember.create({
            data: {
                userId: user.id,
                position: position,
                departmentId,
                salary,
                hireDate: new Date()
            }
        });
    }

    async updateStaff(id: string, data: any) {
        return this.prisma.staffMember.update({
            where: { id },
            data
        });
    }

    async deleteStaff(id: string) {
        return this.prisma.staffMember.delete({ where: { id } });
    }

    async getSystemAdmins() {
        return this.prisma.user.findMany({
            where: {
                role: { in: [Role.SUPER_ADMIN, Role.CAMPUS_ADMIN] }
            },
            include: {
                campus: true
            }
        });
    }

    async getAllDepartments() {
        return this.prisma.department.findMany({
            orderBy: { name: 'asc' }
        });
    }

    async getAllLecturers() {
        return this.prisma.user.findMany({
            where: { role: Role.LECTURER },
            include: {
                staffMember: true,
                campus: true
            },
            orderBy: { fullName: 'asc' }
        });
    }

    async getAllStudents() {
        // Fetching with enrollments to group by department
        return this.prisma.user.findMany({
            where: { role: Role.STUDENT },
            include: {
                enrollments: {
                    include: { department: true }
                },
                campus: true
            },
            orderBy: { fullName: 'asc' },
            take: 100 // Safety limit for MVP mobile view
        });
    }
}
