import * as bcrypt from 'bcryptjs';
import { PrismaClient, Role, RoomType, RecurrencePattern } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();
const HASHED_PASSWORD = bcrypt.hashSync('password', 10);

const CAMPUSES = [
    { slug: 'town-a', town: 'Town A', lat: 4.15, lng: 9.24, studentShare: 0.4 },
    { slug: 'town-b', town: 'Town B', lat: 4.05, lng: 9.70, studentShare: 0.2 },
    { slug: 'town-c', town: 'Town C', lat: 3.84, lng: 11.50, studentShare: 0.2 },
    { slug: 'town-d', town: 'Town D', lat: 5.96, lng: 10.15, studentShare: 0.2 },
];

async function main() {
    console.log('Starting massive seed...');

    // 1. Create Campuses
    const campuses = [];
    for (const c of CAMPUSES) {
        const campus = await prisma.campus.upsert({
            where: { slug: c.slug },
            update: {}, // No updates needed if exists
            create: {
                slug: c.slug,
                townName: c.town,
                centerLat: c.lat,
                centerLng: c.lng,
            }
        });
        campuses.push(campus);
        console.log(`Created campus: ${c.town}`);
    }

    // 2. Create Buildings & Rooms
    const rooms = [];
    for (const campus of campuses) {
        const numBuildings = 30; // Approx 120 total
        for (let i = 0; i < numBuildings; i++) {
            const b = await prisma.building.create({
                data: {
                    campusId: campus.id,
                    name: `${faker.person.lastName()} Hall`,
                    shortCode: `B${i}`,
                }
            });

            const numFloors = faker.number.int({ min: 1, max: 4 });
            for (let f = 1; f <= numFloors; f++) {
                const floor = await prisma.floor.create({
                    data: { buildingId: b.id, floorNumber: f }
                });

                const numRooms = faker.number.int({ min: 5, max: 15 });
                for (let r = 0; r < numRooms; r++) {
                    const room = await prisma.room.create({
                        data: {
                            floorId: floor.id,
                            roomCode: `${b.shortCode}-${f}${r.toString().padStart(2, '0')}`,
                            capacity: faker.number.int({ min: 20, max: 300 }),
                            type: faker.helpers.arrayElement(Object.values(RoomType)),
                        }
                    });
                    rooms.push(room);
                }
            }
        }
    }
    console.log(`Created ~120 buildings and ${rooms.length} rooms.`);

    // 3. Create Users (Students)
    const TOTAL_STUDENTS = 65000;
    console.log('Seeding students... (simulated batch)');

    const sampleStudentCount = 100;
    for (let i = 0; i < sampleStudentCount; i++) {
        const campus = faker.helpers.arrayElement(campuses);
        const email = `std_${i}@university.edu`;
        await prisma.user.upsert({
            where: { institutionalEmail: email },
            update: {},
            create: {
                role: Role.STUDENT,
                campusIdHome: campus.id,
                institutionalEmail: email,
                fullName: faker.person.fullName(),
                isActive: true,
                password: HASHED_PASSWORD,
            }
        });
    }

    // 4. Create Staff (Lecturers)
    const lecturers = [];
    const sampleStaffCount = 50;
    for (let i = 0; i < sampleStaffCount; i++) {
        const email = `staff_${i}@university.edu`;
        const l = await prisma.user.upsert({
            where: { institutionalEmail: email },
            update: {},
            create: {
                role: Role.LECTURER,
                campusIdHome: campuses[0].id,
                institutionalEmail: email,
                fullName: `Dr. ${faker.person.lastName()}`,
                isActive: true,
                password: HASHED_PASSWORD,
            }
        });
        lecturers.push(l);
    }

    // 5. Create Admins & Guest
    console.log('Seeding admins and guests...');
    await prisma.user.upsert({
        where: { institutionalEmail: 'admin@university.edu' },
        update: {},
        create: {
            role: Role.SUPER_ADMIN,
            campusIdHome: campuses[0].id,
            institutionalEmail: 'admin@university.edu',
            fullName: 'Main Admin',
            isActive: true,
            password: HASHED_PASSWORD,
        }
    });

    await prisma.user.upsert({
        where: { institutionalEmail: 'campus_b_admin@university.edu' },
        update: {},
        create: {
            role: Role.CAMPUS_ADMIN,
            campusIdHome: campuses[1].id,
            institutionalEmail: 'campus_b_admin@university.edu',
            fullName: 'Campus B Administrator',
            isActive: true,
            password: HASHED_PASSWORD,
        }
    });

    await prisma.user.upsert({
        where: { institutionalEmail: 'guest_test@university.edu' },
        update: {},
        create: {
            role: Role.GUEST,
            campusIdHome: campuses[0].id,
            institutionalEmail: 'guest_test@university.edu',
            fullName: 'Visitor User',
            isActive: true,
            password: HASHED_PASSWORD,
        }
    });

    // Cashier
    await prisma.user.upsert({
        where: { institutionalEmail: 'cashier@university.edu' },
        update: {},
        create: {
            role: Role.CASHIER,
            campusIdHome: campuses[0].id,
            institutionalEmail: 'cashier@university.edu',
            fullName: 'Cash Clerk',
            isActive: true,
            password: HASHED_PASSWORD,
        }
    });

    // 6. Timetable Events
    console.log('Seeding timetable events...');
    // Create some dummy courses
    const course = await prisma.course.upsert({
        where: { code: 'CSC301' },
        update: {},
        create: {
            code: 'CSC301',
            title: 'Advanced Operating Systems',
            credits: 6,
            department: {
                connectOrCreate: {
                    where: { slug: 'csc' },
                    create: { slug: 'csc', name: 'Computer Science' }
                }
            }
        }
    });

    // Schedule event
    // Find a room
    const room = await prisma.room.findFirst();
    if (room && lecturers.length > 0) {
        await prisma.timetableEvent.create({
            data: {
                courseId: course.id,
                roomId: room.id,
                weekday: 1, // Mon
                startTime: new Date('2024-01-01T08:00:00Z'),
                endTime: new Date('2024-01-01T10:00:00Z'),
                recurrencePattern: RecurrencePattern.WEEKLY,
                lecturers: {
                    connect: { id: lecturers[0].id }
                }
            }
        });
    }

    console.log('Seed complete.');
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
