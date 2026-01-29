import * as bcrypt from 'bcryptjs';
import { PrismaClient, Role, RoomType, RecurrencePattern, StaffPosition } from '@prisma/client';
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
    const campuses: any[] = [];
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
    const rooms: any[] = [];
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

    // 3. Create Departments & Courses
    console.log('Seeding Departments & Courses...');
    const DEPARTMENTS = [
        { slug: 'CE', name: 'Computer Engineering' },
        { slug: 'EE', name: 'Electrical Engineering' },
        { slug: 'ME', name: 'Mechanical Engineering' },
        { slug: 'CV', name: 'Civil Engineering' },
        { slug: 'SE', name: 'Software Engineering' },
    ];

    const LEVELS = [200, 300, 400, 500];
    const courses: any[] = [];

    for (const dept of DEPARTMENTS) {
        await prisma.department.upsert({
            where: { slug: dept.slug },
            update: {},
            create: { slug: dept.slug, name: dept.name }
        });

        // Create Courses for this Dept
        for (const level of LEVELS) {
            for (let i = 1; i <= 3; i++) {
                const courseCode = `${dept.slug}${level}0${i}`;
                const c = await prisma.course.upsert({
                    where: { code: courseCode },
                    update: {},
                    create: {
                        code: courseCode,
                        title: `${dept.name} Topic ${level}-${i}`,
                        credits: 6,
                        departmentSlug: dept.slug,
                    }
                });
                courses.push(c);
            }
        }
    }

    // 4. Create Staff (Lecturers)
    console.log('Seeding Staff...');
    const lecturers: any[] = [];
    const STAFF_COUNT = 50;

    for (let i = 0; i < STAFF_COUNT; i++) {
        const email = `staff_${i}@university.edu`;
        const dept = faker.helpers.arrayElement(DEPARTMENTS);

        // Ensure user - NO PASSWORD UPDATE IF EXIST
        const user = await prisma.user.upsert({
            where: { institutionalEmail: email },
            update: { password: HASHED_PASSWORD }, // OVERWRITE to hashed
            create: {
                role: Role.LECTURER,
                campusIdHome: campuses[0].id,
                institutionalEmail: email,
                fullName: `Dr. ${faker.person.lastName()} (${dept.slug})`,
                isActive: true,
                password: HASHED_PASSWORD,
            }
        });

        // Ensure Staff Record
        // Make random HOD assignment for first few
        let position: StaffPosition = StaffPosition.LECTURER;
        // First 5 staff are HODs of the 5 depts respectively? Simpler: Just make random HODs
        if (i < 5 && i < DEPARTMENTS.length) {
            position = StaffPosition.HOD;
            // Link to department i
            dept.slug = DEPARTMENTS[i].slug;
            console.log(`   -> Assigned ${email} as HOD of ${dept.slug}`);
        }

        await prisma.staffMember.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                userId: user.id,
                position: position,
                departmentId: dept.slug,
                salary: faker.number.int({ min: 2000, max: 5000 }),
                hireDate: faker.date.past(),
            }
        });
        lecturers.push(user);
    }

    // 5. Create Students
    const STUDENT_COUNT = 2500;
    console.log(`Seeding ${STUDENT_COUNT} students... this may take a moment.`);

    // Using upsert loop to ensure passwords are corrected for everyone
    for (let i = 0; i < STUDENT_COUNT; i++) {
        const email = `std_${i}@university.edu`;
        const campus = faker.helpers.arrayElement(campuses);
        const dept = faker.helpers.arrayElement(DEPARTMENTS);
        const level = faker.helpers.arrayElement(LEVELS);

        await prisma.user.upsert({
            where: { institutionalEmail: email },
            update: { password: HASHED_PASSWORD }, // OVERWRITE to hashed
            create: {
                role: Role.STUDENT,
                campusIdHome: campus.id,
                institutionalEmail: email,
                fullName: faker.person.fullName(),
                isActive: true,
                password: HASHED_PASSWORD,
                enrollments: {
                    create: {
                        departmentSlug: dept.slug,
                        programSlug: 'B.Eng',
                        level: level,
                        academicYear: '2023/2024'
                    }
                }
            }
        });

        if (i % 100 === 0) process.stdout.write('.');
    }
    console.log('\nStudents seeded.');

    // 6. Create Admins & Guest
    console.log('Seeding admins and guests...');
    await prisma.user.upsert({
        where: { institutionalEmail: 'admin@university.edu' },
        update: { password: HASHED_PASSWORD },
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
        update: { password: HASHED_PASSWORD },
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
        update: { password: HASHED_PASSWORD },
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
        update: { password: HASHED_PASSWORD },
        create: {
            role: Role.CASHIER,
            campusIdHome: campuses[0].id,
            institutionalEmail: 'cashier@university.edu',
            fullName: 'Cash Clerk',
            isActive: true,
            password: HASHED_PASSWORD,
        }
    });

    // 7. Timetable Events
    console.log('Seeding timetable events...');
    // Create random schedule
    const room = await prisma.room.findFirst();
    if (room && lecturers.length > 0 && courses.length > 0) {
        // Create 50 events
        for (let k = 0; k < 50; k++) {
            const c = faker.helpers.arrayElement(courses);
            const l = faker.helpers.arrayElement(lecturers);

            // Time fix: ensure proper HH:MM format
            const startHour = faker.number.int({ min: 8, max: 16 });
            const endHour = faker.number.int({ min: 17, max: 19 });
            const startStr = startHour.toString().padStart(2, '0');
            const endStr = endHour.toString().padStart(2, '0');

            await prisma.timetableEvent.create({
                data: {
                    courseId: c.id,
                    roomId: room.id,
                    weekday: faker.number.int({ min: 0, max: 6 }),
                    startTime: new Date(`2024-01-01T${startStr}:00:00Z`),
                    endTime: new Date(`2024-01-01T${endStr}:00:00Z`),
                    recurrencePattern: RecurrencePattern.WEEKLY,
                    lecturers: { connect: { id: l.id } }
                }
            });
        }
    }

    console.log('Seed complete.');
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
