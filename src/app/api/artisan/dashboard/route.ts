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

    if (decoded.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Forbidden. Artisan access required.' }, { status: 403 });
    }

    const artisanId = decoded.userId;

    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id: artisanId },
      include: { artisanProfile: true }
    });

    // 1. My Captures (total count)
    const myCapturesCount = await prisma.craftItem.count({
      where: { artisanId }
    });

    // 2. Advances Received (with fallback for past items without advancePaid explicitly set)
    const advancedItems = await prisma.craftItem.findMany({
      where: { 
        artisanId,
        status: { in: ['ADVANCE_PAID', 'SOLD_FINAL'] } 
      },
      select: { advancePaid: true, fairWageFloor: true }
    });
    
    const totalAdvances = advancedItems.reduce((sum, item) => sum + (item.advancePaid || item.fairWageFloor || 0), 0);

    // 3. Items Sold (SOLD_FINAL or SOLD_MIDDLEMAN)
    const itemsSold = await prisma.craftItem.count({
      where: { 
        artisanId,
        status: { in: ['SOLD_FINAL', 'SOLD_MIDDLEMAN'] } 
      }
    });

    // 4. Total Earnings
    // Earnings = advancePaid + finalPayoutQueued (for platform items) 
    // Wait, if it's SOLD_MIDDLEMAN, the platform didn't track the cash in the ledger.
    // For simplicity, Total Earnings = sum of advancePaid + sum of finalPayoutQueued
    const queued = await prisma.craftItem.aggregate({
      _sum: { finalPayoutQueued: true },
      where: { 
        artisanId,
        status: 'SOLD_FINAL'
      }
    });
    const totalEarnings = totalAdvances + (queued._sum.finalPayoutQueued || 0);

    // 5. Recent Captures (for table)
    const recentCaptures = await prisma.craftItem.findMany({
      where: { artisanId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // 6. Trends (past 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const pastWeekCaptures = await prisma.craftItem.count({
      where: { artisanId, createdAt: { gte: oneWeekAgo } }
    });

    const pastWeekAdvancedItems = await prisma.craftItem.findMany({
      where: { 
        artisanId,
        status: { in: ['ADVANCE_PAID', 'SOLD_FINAL'] },
        createdAt: { gte: oneWeekAgo }
      },
      select: { advancePaid: true, fairWageFloor: true }
    });
    const pastWeekAdvances = pastWeekAdvancedItems.reduce((sum, item) => sum + (item.advancePaid || item.fairWageFloor || 0), 0);

    const pastWeekSold = await prisma.craftItem.count({
      where: { artisanId, status: { in: ['SOLD_FINAL', 'SOLD_MIDDLEMAN'] }, createdAt: { gte: oneWeekAgo } }
    });

    const pastWeekQueued = await prisma.craftItem.aggregate({
      _sum: { finalPayoutQueued: true },
      where: { artisanId, status: 'SOLD_FINAL', createdAt: { gte: oneWeekAgo } }
    });
    const pastWeekEarnings = pastWeekAdvances + (pastWeekQueued._sum.finalPayoutQueued || 0);

    return NextResponse.json({
      success: true,
      data: {
        artisanName: user?.name,
        artisanProfile: user?.artisanProfile,
        myCapturesCount,
        totalAdvances,
        itemsSold,
        totalEarnings,
        healthScore: user?.artisanProfile?.healthScore ?? 100,
        accountStatus: user?.accountStatus ?? 'ACTIVE',
        recentCaptures,
        trends: {
          captures: `+${pastWeekCaptures}`,
          advances: `+₹${pastWeekAdvances.toLocaleString()}`,
          sold: `+${pastWeekSold}`,
          earnings: `+₹${pastWeekEarnings.toLocaleString()}`
        }
      }
    });
  } catch (error: any) {
    console.error('Artisan Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
