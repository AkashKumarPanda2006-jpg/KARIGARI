import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { logCraftItemEvent } from '@/lib/auditLogger';

export async function POST(req: Request) {
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

    const { itemId, actualSalePrice } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });
    }

    const item = await prisma.craftItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (item.status !== 'ADVANCE_PAID' && item.status !== 'LISTED_AUCTION') {
      return NextResponse.json({ error: 'Item is not eligible for sale simulation.' }, { status: 400 });
    }

    // Simulate sale at manual price or fallback
    const salePrice = actualSalePrice ? Number(actualSalePrice) : (item.marketPriceMax || ((item.fairWageFloor || 0) * 1.5));
    
    // Ledger math
    const advancePaid = item.advancePaid || 0;
    
    // Remainder to be queued to the artisan
    const finalPayoutQueued = Math.max(0, salePrice - advancePaid);

    const updatedItem = await prisma.craftItem.update({
      where: { id: itemId },
      data: { 
        status: 'SOLD_FINAL',
        salePrice: salePrice,
        finalPayoutQueued: finalPayoutQueued
      }
    });

    await logCraftItemEvent({
      prisma,
      craftItemId: itemId,
      actorId: decoded.userId,
      actorRole: 'ADMIN',
      action: 'ITEM_SOLD_FINAL',
      previousState: { status: item.status },
      newState: { status: 'SOLD_FINAL', salePrice },
      comments: `Item sold to buyer for ₹${salePrice.toLocaleString()}. Final payout of ₹${finalPayoutQueued.toLocaleString()} queued for artisan.`
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error: any) {
    console.error('Simulate Sale API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
