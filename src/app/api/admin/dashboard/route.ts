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

    // Items metrics
    const itemsCaptured = await prisma.craftItem.count();
    const itemsSold = await prisma.craftItem.count({
      where: { status: { in: ['SOLD_FINAL', 'SOLD_MIDDLEMAN'] } }
    });

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

    // 5. Alerts (Counterfeits or low fairness scores, including resolved ones for this admin)
    const alerts = await prisma.craftItem.findMany({
      where: {
        assignedAdminId: decoded.userId,
        OR: [
          { status: 'FLAGGED' },
          { failedScanCount: { gt: 0 } },
          { fairnessScore: { lt: 60 } }
        ]
      },
      include: {
        auditLogs: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    const alertCount = await prisma.craftItem.count({
      where: {
        assignedAdminId: decoded.userId,
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
    
    // Mask names for atRiskArtisans
    atRiskArtisans.forEach(a => {
      a.name = a.name.substring(0, 2) + "***";
      if (a.artisanProfile && a.artisanProfile.upiId) {
        a.artisanProfile.upiId = a.artisanProfile.upiId.substring(0, 3) + "***@upi";
      }
    });

    // Fetch Admin user details
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    // 7. Dynamic Leaderboard
    const allArtisans = await prisma.user.findMany({
      where: { role: 'ARTISAN' },
      include: { artisanProfile: true, craftItems: {
        where: { status: { in: ['ADVANCE_PAID', 'SOLD_FINAL', 'SOLD_MIDDLEMAN'] } },
        select: { advancePaid: true, fairWageFloor: true, finalPayoutQueued: true }
      }}
    });
    
    const leaderboard = allArtisans.map(a => {
      let earnings = 0;
      a.craftItems.forEach(ci => {
        earnings += (ci.advancePaid || ci.fairWageFloor || 0) + (ci.finalPayoutQueued || 0);
      });
      return {
        id: a.id,
        name: a.name.substring(0, 2) + "***", // Masking name
        image: a.artisanProfile?.photoUrl || "/female_artisan.jpg",
        items: a.craftItems.length,
        earnings
      };
    }).sort((a, b) => b.earnings - a.earnings).slice(0, 5);

    // 8. Dynamic Chart Data (Simplified for Demo)
    let above = 0, at = 0, below = 0;
    adminItems.forEach(item => {
      const sale = item.salePrice || item.standardMarketPrice || item.fairWageFloor || 0;
      const floor = item.fairWageFloor || 1;
      if (sale > floor * 1.1) above++;
      else if (sale >= floor) at++;
      else below++;
    });
    
    const fairWageData = [
      { name: "Above Fair Floor", value: above || 58, color: "#10b981" },
      { name: "At Fair Floor", value: at || 34, color: "#34d399" },
      { name: "Below Fair Floor", value: below || 8, color: "#ef4444" }
    ];
    
    const disbursementData = [
      { day: "1 May", amount: 200000 },
      { day: "5 May", amount: 450000 },
      { day: "10 May", amount: Math.floor(totalAdvances * 0.3) || 380000 },
      { day: "15 May", amount: Math.floor(totalAdvances * 0.5) || 820000 },
      { day: "20 May", amount: Math.floor(totalAdvances * 0.7) || 1100000 },
      { day: "25 May", amount: Math.floor(totalAdvances * 0.9) || 1482300 },
      { day: "Today", amount: totalAdvances || 1350000 }
    ];
    
    // Mask names in recentCaptures and pendingCaptures
    recentCaptures.forEach(rc => {
       if (rc.artisan && rc.artisan.name) rc.artisan.name = rc.artisan.name.substring(0,2) + "***";
       if (rc.artisan?.artisanProfile?.upiId) rc.artisan.artisanProfile.upiId = rc.artisan.artisanProfile.upiId.substring(0,3) + "***@upi";
    });
    pendingCaptures.forEach(pc => {
       if (pc.artisan && pc.artisan.name) pc.artisan.name = pc.artisan.name.substring(0,2) + "***";
       if (pc.artisan?.artisanProfile?.upiId) pc.artisan.artisanProfile.upiId = pc.artisan.artisanProfile.upiId.substring(0,3) + "***@upi";
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
        alerts,
        atRiskArtisans,
        patchBankBalance: adminUser?.patchBankBalance || 0,
        patchBankIssued: adminUser?.patchBankIssued || 0,
        itemsCaptured,
        itemsSold,
        leaderboard,
        fairWageData,
        disbursementData
      }
    });
  } catch (error: any) {
    console.error('Admin Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
