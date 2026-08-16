import 'dotenv/config';
import { prisma } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'artisan@karigari.com';
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (!existingUser) {
    const passwordHash = await bcrypt.hash('password123', 10);
    
    await prisma.user.create({
      data: {
        name: 'Lakshmi Weavers',
        email,
        passwordHash,
        role: 'ARTISAN',
        artisanProfile: {
          create: {
            craftType: 'Ikat Silk',
            location: 'Pochampally',
            experienceYears: 12,
            cooperativeId: 'COOP-POCH-01'
          }
        }
      }
    });
    console.log('Successfully created dummy artisan account.');
  } else {
    console.log('Dummy artisan account already exists.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
