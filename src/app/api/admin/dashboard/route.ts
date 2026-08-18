import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'fallback-secret');
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    // 1. Total Artisans
    const totalArtisans = await prisma.user.count({
      where: { role: 'ARTISAN' }
    });

    // 2. Total Advances Disbursed (sum of advancePaid)
    const advances = await prisma.craftItem.aggregate({
      _sum: { advancePaid: true },
      where: { 
        status: { in: ['ADVANCE_PAID', 'SOLD_FINAL'] } 
      }
    });
    const totalAdvances = advances._sum.advancePaid || 0;

    // 3. Regional Fair Wage Index (Local Admin's specific items)
    const adminItems = await prisma.craftItem.findMany({
      where: { assignedAdminId: decoded.userId, status: 'SOLD_FINAL' }
    });
    
    let totalScore = 0;
    if (adminItems.length > 0) {
      adminItems.forEach(item => {
        const salePrice = item.salePrice || item.fairWageFloor || 0;
        const floor = item.fairWageFloor || 1;
        // Cap at 100% to prevent inflation gamification
        let score = (salePrice / floor) * 100;
        if (score > 100) score = 100;
        totalScore += score;
      });
    }
    
    const complianceRate = adminItems.length > 0 
      ? Math.round(totalScore / adminItems.length) 
      : 100;

    const recentCaptures = await prisma.craftItem.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: { status: { not: 'PENDING_VERIFICATION' } },
      include: {
        artisan: {
          select: { name: true, artisanProfile: true }
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    const pendingCaptures = await prisma.craftItem.findMany({
      where: { status: 'PENDING_VERIFICATION' },
      orderBy: { createdAt: 'desc' },
      include: {
        artisan: {
          select: { name: true, artisanProfile: true }
        }
      }
    });

    // 5. Alert Count (Counterfeits or low fairness scores)
    const alertCount = await prisma.craftItem.count({
      where: {
        OR: [
          { status: 'FLAGGED' },
          { fairnessScore: { lt: 60 } }
        ]
      }
    });

    // 6. At Risk Artisans (Health < 65%)
    const atRiskArtisans = await prisma.user.findMany({
      where: {
        role: 'ARTISAN',
        accountStatus: 'ACTIVE',
        artisanProfile: {
          healthScore: { lt: 65 }
        }
      },
      include: { artisanProfile: true }
    });

    // Fetch Admin user details
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalArtisans,
        totalAdvances,
        complianceRate,
        recentCaptures,
        pendingCaptures,
        alertCount,
        atRiskArtisans,
        patchBankBalance: adminUser?.patchBankBalance || 0,
        patchBankIssued: adminUser?.patchBankIssued || 0
      }
    });
  } catch (error: any) {
    console.error('Admin Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
