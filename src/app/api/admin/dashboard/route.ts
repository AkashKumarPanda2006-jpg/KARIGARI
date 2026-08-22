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

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Run queries concurrently
    const [
      totalArtisans,
      advances,
      itemsCaptured,
      itemsSold,
      pastWeekItemsCaptured,
      pastWeekItemsSold,
      pastWeekAdvancesQuery,
      pastWeekArtisans,
      adminItems,
      recentCaptures,
      pendingCaptures,
      alerts,
      alertCount,
      atRiskArtisans,
      adminUser,
      allArtisans
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'ARTISAN' } }),
      prisma.craftItem.aggregate({ _sum: { advancePaid: true }, where: { status: { in: ['ADVANCE_PAID', 'SOLD_FINAL'] } } }),
      prisma.craftItem.count(),
      prisma.craftItem.count({ where: { status: { in: ['SOLD_FINAL', 'SOLD_MIDDLEMAN'] } } }),
      prisma.craftItem.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.craftItem.count({ where: { status: { in: ['SOLD_FINAL', 'SOLD_MIDDLEMAN'] }, createdAt: { gte: oneWeekAgo } } }),
      prisma.craftItem.aggregate({ _sum: { advancePaid: true }, where: { status: { in: ['ADVANCE_PAID', 'SOLD_FINAL'] }, createdAt: { gte: oneWeekAgo } } }),
      prisma.user.count({ where: { role: 'ARTISAN', createdAt: { gte: oneWeekAgo } } }),
      prisma.craftItem.findMany({ where: { assignedAdminId: decoded.userId, status: { not: 'PENDING_VERIFICATION' } } }),
      prisma.craftItem.findMany({ take: 5, orderBy: { createdAt: 'desc' }, where: { status: { not: 'PENDING_VERIFICATION' } }, include: { artisan: { select: { name: true, artisanProfile: true } }, auditLogs: { orderBy: { createdAt: 'desc' } } } }),
      prisma.craftItem.findMany({ where: { status: 'PENDING_VERIFICATION' }, orderBy: { createdAt: 'desc' }, include: { artisan: { select: { name: true, artisanProfile: true } } } }),
      prisma.craftItem.findMany({ where: { assignedAdminId: decoded.userId, OR: [ { status: 'FLAGGED' }, { failedScanCount: { gt: 0 } }, { fairnessScore: { lt: 60 } } ] }, include: { auditLogs: { orderBy: { createdAt: 'desc' } } }, orderBy: { createdAt: 'desc' } }),
      prisma.craftItem.count({ where: { assignedAdminId: decoded.userId, OR: [ { status: 'FLAGGED' }, { fairnessScore: { lt: 60 } } ] } }),
      prisma.user.findMany({ where: { role: 'ARTISAN', accountStatus: 'ACTIVE', artisanProfile: { healthScore: { lt: 65 } } }, include: { artisanProfile: true } }),
      prisma.user.findUnique({ where: { id: decoded.userId } }),
      prisma.user.findMany({ where: { role: 'ARTISAN' }, include: { artisanProfile: true, craftItems: { where: { status: { in: ['ADVANCE_PAID', 'SOLD_FINAL', 'SOLD_MIDDLEMAN'] } }, select: { advancePaid: true, fairWageFloor: true, finalPayoutQueued: true } } } })
    ]);

    const totalAdvances = advances._sum.advancePaid || 0;
    const pastWeekAdvances = pastWeekAdvancesQuery._sum.advancePaid || 0;

    const trends = {
      artisans: `+${pastWeekArtisans}`,
      captured: `+${pastWeekItemsCaptured}`,
      sold: `+${pastWeekItemsSold}`,
      advances: `+₹${pastWeekAdvances.toLocaleString()}`
    };
    
    let totalScore = 0;
    if (adminItems.length > 0) {
      adminItems.forEach((item: any) => {
        const salePrice = item.salePrice || item.fairWageFloor || 0;
        const floor = item.fairWageFloor || 1;
        let score = (salePrice / floor) * 100;
        if (score > 100) score = 100;
        totalScore += score;
      });
    }
    
    const complianceRate = adminItems.length > 0 ? Math.round(totalScore / adminItems.length) : 100;

    atRiskArtisans.forEach((a: any) => {
      a.name = a.name.substring(0, 2) + "***";
      if (a.artisanProfile && a.artisanProfile.upiId) {
        a.artisanProfile.upiId = a.artisanProfile.upiId.substring(0, 3) + "***@upi";
      }
    });

    const leaderboard = allArtisans.map((a: any) => {
      let earnings = 0;
      a.craftItems.forEach((ci: any) => {
        earnings += (ci.advancePaid || ci.fairWageFloor || 0) + (ci.finalPayoutQueued || 0);
      });
      return {
        id: a.id,
        name: a.name.substring(0, 2) + "***",
        image: a.artisanProfile?.photoUrl || "/female_artisan.jpg",
        items: a.craftItems.length,
        earnings
      };
    }).sort((a: any, b: any) => b.earnings - a.earnings).slice(0, 5);

    let above = 0, at = 0, below = 0;
    adminItems.forEach((item: any) => {
      const sale = item.salePrice || item.standardMarketPrice || item.fairWageFloor || 0;
      const floor = item.fairWageFloor || 1;
      if (sale > floor * 1.1) above++;
      else if (sale >= floor) at++;
      else below++;
    });
    
    const totalWageItems = above + at + below;
    const fairWageData = totalWageItems > 0 ? [
      { name: "Above Fair Floor", value: Math.round((above / totalWageItems) * 100), color: "#10b981" },
      { name: "At Fair Floor", value: Math.round((at / totalWageItems) * 100), color: "#34d399" },
      { name: "Below Fair Floor", value: Math.round((below / totalWageItems) * 100), color: "#ef4444" }
    ] : [
      { name: "No Sales Data", value: 100, color: "#e5e7eb" }
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
    
    recentCaptures.forEach((rc: any) => {
       if (rc.artisan && rc.artisan.name) rc.artisan.name = rc.artisan.name.substring(0,2) + "***";
       if (rc.artisan?.artisanProfile?.upiId) rc.artisan.artisanProfile.upiId = rc.artisan.artisanProfile.upiId.substring(0,3) + "***@upi";
    });
    pendingCaptures.forEach((pc: any) => {
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
        trends,
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
