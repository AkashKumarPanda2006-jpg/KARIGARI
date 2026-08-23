import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding KARIGARI database...');

  await prisma.auditLog.deleteMany();
  await prisma.schemeApplication.deleteMany();
  await prisma.craftItem.deleteMany();
  await prisma.artisanProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      id: 'super-admin-001',
      name: 'Rajesh Kumar',
      email: 'superadmin@karigari.com',
      passwordHash,
      role: 'ADMIN',
      accountStatus: 'ACTIVE',
      patchBankBalance: 5000,
      patchBankIssued: 127,
    }
  });
  console.log('✔️ Admin created:', admin.email);

  // 2. Create Artisans
  const artisanData = [
    {
      name: 'Lakshmi Devi',
      email: 'lakshmi@karigari.com',
      craftType: 'Pochampally Ikat',
      location: 'Pochampally, Telangana',
      experienceYears: 15,
      clusterName: 'Pochampally Weavers Cooperative',
      description: 'Master weaver specializing in double-ikat silk sarees.',
      tags: ['Ikat', 'Silk', 'Handloom', 'GI Tag'],
      healthScore: 95,
      upiId: 'lakshmi@upi',
      giTagCertified: true,
      giTagName: 'Pochampally Ikat',
      socialCategory: 'OBC',
      annualIncome: 180000,
      aadhaarLast4: '4523',
    }
  ];

  const user = await prisma.user.create({
    data: {
      name: artisanData[0].name,
      email: artisanData[0].email,
      passwordHash,
      role: 'ARTISAN',
      accountStatus: 'ACTIVE',
      artisanProfile: {
        create: {
          craftType: artisanData[0].craftType,
          location: artisanData[0].location,
          experienceYears: artisanData[0].experienceYears,
          clusterName: artisanData[0].clusterName,
          description: artisanData[0].description,
          tags: artisanData[0].tags,
          healthScore: artisanData[0].healthScore,
          upiId: artisanData[0].upiId,
          giTagCertified: artisanData[0].giTagCertified,
          giTagName: artisanData[0].giTagName,
          socialCategory: artisanData[0].socialCategory,
          annualIncome: artisanData[0].annualIncome,
          aadhaarLast4: artisanData[0].aadhaarLast4,
          photoUrl: '/female_artisan.jpg',
        }
      }
    }
  });
  console.log('✔️ Artisan created:', user.email);

  // 3. Create Scheme Applications for Lakshmi
  await prisma.schemeApplication.createMany({
    data: [
      {
        userId: user.id,
        schemeName: 'PM Vishwakarma Yojana',
        status: 'DISBURSED',
        notes: 'Toolkits and first tranche of Rs 15,000 disbursed.'
      },
      {
        userId: user.id,
        schemeName: 'National Handicraft Development Programme',
        status: 'PENDING_APPROVAL',
        notes: 'Documents submitted. Awaiting block officer verification.'
      },
      {
        userId: user.id,
        schemeName: 'MUDRA Shishu Loan',
        status: 'APPROVED',
        notes: 'Loan of Rs 50,000 approved, awaiting disbursement.'
      }
    ]
  });
  console.log('✔️ Schemes seeded for Lakshmi');

  // 4. Create Craft Items
  await prisma.craftItem.create({
    data: {
      artisanId: user.id,
      craftType: 'Pochampally Ikat Saree',
      descriptionOriginal: 'Beautiful silk saree with intricate double ikat patterns.',
      descriptionEnglish: 'Beautiful silk saree with intricate double ikat patterns.',
      rawMaterialCost: 2500,
      laborDays: 15,
      status: 'VERIFIED',
      advancePaid: 3000,
      assignedAdminId: admin.id,
      aiGeneratedListing: 'Stunning handcrafted Pochampally Ikat Silk Saree. A true testament to Indian heritage weaving. Perfect for festive occasions.',
      marketPriceMin: 8500,
      marketPriceMax: 12000,
      isListedOnMarketplace: true,
      patchId: 'PATCH-LAK-001',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.craftItem.create({
    data: {
      artisanId: user.id,
      craftType: 'Cotton Ikat Dupatta',
      descriptionOriginal: 'Soft cotton dupatta with classic ikat motifs.',
      descriptionEnglish: 'Soft cotton dupatta with classic ikat motifs.',
      rawMaterialCost: 800,
      laborDays: 3,
      status: 'PENDING_VERIFICATION',
      advancePaid: 0,
      assignedAdminId: null,
      aiGeneratedListing: 'Elegant Cotton Ikat Dupatta. Breathable fabric for daily wear.',
      marketPriceMin: 1500,
      marketPriceMax: 2200,
      isListedOnMarketplace: false,
    }
  });
  
  await prisma.craftItem.create({
    data: {
      artisanId: user.id,
      craftType: 'Ikat Wall Hanging',
      descriptionOriginal: 'Decorative wall piece using traditional techniques.',
      descriptionEnglish: 'Decorative wall piece using traditional techniques.',
      rawMaterialCost: 1200,
      laborDays: 7,
      status: 'SOLD',
      advancePaid: 1500,
      assignedAdminId: admin.id,
      aiGeneratedListing: 'Traditional Ikat Wall Hanging. Adds ethnic charm to any room.',
      marketPriceMin: 3000,
      marketPriceMax: 4500,
      salePrice: 4200,
      finalPayoutQueued: 2700,
      isListedOnMarketplace: true,
      patchId: 'PATCH-LAK-003',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    }
  });
  console.log('✔️ Crafts seeded for Lakshmi');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
