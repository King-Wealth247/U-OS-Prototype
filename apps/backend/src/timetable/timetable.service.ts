import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RecurrencePattern } from '@prisma/client';

@Injectable()
export class TimetableService {
    constructor(private prisma: PrismaService) { }

    async createEvent(data: {
        courseId: string;
        roomId: string;
        weekday: number;
        startTime: string; // ISO DateTime string
        endTime: string;   // ISO DateTime string
        recurrence: RecurrencePattern;
        campusId?: string;
    }) {
        return this.prisma.timetableEvent.create({
            data: {
                courseId: data.courseId,
                roomId: data.roomId,
                weekday: data.weekday,
                startTime: new Date(data.startTime),
                endTime: new Date(data.endTime),
                recurrencePattern: data.recurrence,
                campusIdForced: data.campusId
            }
        });
    }

    async getWeeklySchedule(level: number, departmentSlug: string) {
        // Find courses for this dept/level and get their events
        return this.prisma.timetableEvent.findMany({
            where: {
                course: {
                    departmentSlug: departmentSlug,
                    // Note: Schema might need 'level' on Course or we infer from code (CSC301 -> 300)
                    // For now, fetching all dept courses, optimization later
                }
            },
            include: {
                course: true,
                room: true,
                campus: true
            },
            orderBy: [
                { weekday: 'asc' },
                { startTime: 'asc' }
            ]
        });
    }

    async getMySchedule(userId: string) {
        // 1. Get user enrollments
        const enrollments = await this.prisma.enrollment.findMany({
            where: { userId }
        });

        // 2. Get courses from department (simple version)
        // In a real system, we'd check specific CourseRegistrations.
        // For MVP, we show all courses for their enrolled department/level.

        if (enrollments.length === 0) return [];

        const enrollment = enrollments[0]; // Primary enrollment

        // Filter courses by department and loose level check (e.g. course code starts with level)
        // This is a heuristic until we have strict CourseRegistration link
        const deptEvents = await this.prisma.timetableEvent.findMany({
            where: {
                course: {
                    departmentSlug: enrollment.departmentSlug
                }
            },
            include: {
                course: true,
                room: true,
                campus: true
            }
        });

        // Filter by level heuristic (e.g. Level 300 -> Code starts with '3')
        const levelPrefix = enrollment.level.toString().charAt(0);
        return deptEvents.filter(e => {
            const codeNum = e.course.code.match(/\d+/);
            return codeNum ? codeNum[0].startsWith(levelPrefix) : false;
        });
    }

    async deleteEvent(id: string) {
        return this.prisma.timetableEvent.delete({ where: { id } });
    }
}
