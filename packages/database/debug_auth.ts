
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function debugAuth() {
    console.log('--- AUTH DEBUGGER ---');
    console.log('1. Connecting to database...');

    try {
        const user = await prisma.user.findUnique({
            where: { institutionalEmail: 'admin@university.edu' }
        });

        if (!user) {
            console.error('❌ CRITICAL: User admin@university.edu NOT FOUND in database!');
            return;
        }

        console.log('✅ User found:', user.institutionalEmail);
        console.log('   ID:', user.id);
        console.log('   Role:', user.role);
        console.log('   Stored Hash:', user.password);

        console.log('2. Testing password verification...');
        const testPassword = 'password';
        const isMatch = await bcrypt.compare(testPassword, user.password);

        if (isMatch) {
            console.log('✅ SUCCESS: Password "password" matches the stored hash.');
            console.log('   Expected Login Result: OK');
        } else {
            console.error('❌ FAILURE: Password "password" does NOT match the stored hash.');
            console.error('   Expected Login Result: 401 Unauthorized');

            // Try generating a new hash to compare format
            const newHash = bcrypt.hashSync(testPassword, 10);
            console.log('   New sample hash would be:', newHash);
        }

    } catch (error) {
        console.error('❌ DATABASE ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugAuth();
