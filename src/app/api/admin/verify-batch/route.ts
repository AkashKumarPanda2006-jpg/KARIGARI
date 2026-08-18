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

    const { itemIds } = await req.json();

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid itemIds' }, { status: 400 });
    }

    // Use a transaction to update status, track bank balances, and log events
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get Admin user
      const admin = await tx.user.findUnique({ where: { id: decoded.userId } });
      if (!admin) throw new Error("Admin not found");
      
      const itemsToVerify = [];
      for (const id of itemIds) {
        const item = await tx.craftItem.findUnique({ where: { id } });
        if (item && item.status === 'PENDING_VERIFICATION') {
          itemsToVerify.push(id);
        }
      }

      if (itemsToVerify.length === 0) return [];
      
      if (admin.patchBankBalance < itemsToVerify.length) {
        throw new Error(`Insufficient patch tags in bank. Need ${itemsToVerify.length}, have ${admin.patchBankBalance}`);
      }

      const updatedItems = [];
      for (let i = 0; i < itemsToVerify.length; i++) {
        const id = itemsToVerify[i];
        
        // Generate mathematically unique patch ID: PATCH-[base36-timestamp]-[random]
        const uniqueSuffix = Date.now().toString(36).toUpperCase() + Math.floor(1000 + Math.random() * 9000).toString();
        const generatedPatchId = `PATCH-${uniqueSuffix}`;

        const updated = await tx.craftItem.update({
          where: { id },
          data: { 
            status: 'VERIFIED',
            patchId: generatedPatchId,
            assignedAdminId: decoded.userId
          }
        });

        await logCraftItemEvent({
          prisma: tx as any,
          craftItemId: id,
          actorId: decoded.userId,
          actorRole: 'ADMIN',
          action: 'ADMIN_VERIFIED',
          previousState: { status: 'PENDING_VERIFICATION' },
          newState: { status: 'VERIFIED', patchId: generatedPatchId },
          comments: `Admin verified AI math and attached Patch ID: ${generatedPatchId}.`
        });

        updatedItems.push(updated);
      }
      
      // Update admin bank balance
      await tx.user.update({
        where: { id: decoded.userId },
        data: {
          patchBankBalance: { decrement: itemsToVerify.length },
          patchBankIssued: { increment: itemsToVerify.length }
        }
      });
      
      return updatedItems;
    }, {
      maxWait: 5000,
      timeout: 30000
    });

    return NextResponse.json({ success: true, verifiedCount: result.length });
  } catch (error: any) {
    console.error('Verify Batch API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
