import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Sample Credentials for Testing ---');

    const roles = Object.values(Role);

    for (const role of roles) {
        const user = await prisma.user.findFirst({
            where: { role }
        });

        if (user) {
            console.log(`Role: ${role}`);
            console.log(`Email: ${user.institutionalEmail}`);
            console.log(`Full Name: ${user.fullName}`);
            console.log(`Password: password (default)`);
            console.log('-----------------------------------');
        } else {
            console.log(`Role: ${role} - No user found in DB.`);
            console.log('-----------------------------------');
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
