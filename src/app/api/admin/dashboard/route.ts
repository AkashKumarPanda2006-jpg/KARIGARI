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

    // 3. Fair Wage Compliance Rate
    // Items that opted out of the local middleman vs total items with decisions
    const itemsWithDecisions = await prisma.craftItem.count({
      where: { status: { not: 'PENDING_DISBURSEMENT' } }
    });
    
    const compliantItems = await prisma.craftItem.count({
      where: { status: { in: ['ADVANCE_PAID', 'SOLD_FINAL', 'LISTED_AUCTION'] } }
    });

    const complianceRate = itemsWithDecisions > 0 
      ? Math.round((compliantItems / itemsWithDecisions) * 100) 
      : 100;

    // 4. Recent Captures
    const recentCaptures = await prisma.craftItem.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        artisan: {
          select: { name: true }
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalArtisans,
        totalAdvances,
        complianceRate,
        recentCaptures
      }
    });
  } catch (error: any) {
    console.error('Admin Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
