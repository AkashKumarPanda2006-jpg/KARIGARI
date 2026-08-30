import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    if (!payload.userId) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { buyerId: payload.userId as string },
      include: {
        craftItem: {
          select: {
            craftType: true,
            images: true,
            patchId: true,
            artisan: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Orders GET Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    if (!payload.userId || payload.role !== 'BUYER') {
      return NextResponse.json({ success: false, error: 'Only buyers can create orders' }, { status: 403 });
    }

    const body = await request.json();
    const { craftItemId, quantity, totalPrice, paymentMethod, shippingAddress } = body;

    if (!craftItemId || !quantity || !totalPrice) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const craftItem = await prisma.craftItem.findUnique({
      where: { id: craftItemId }
    });

    if (!craftItem) {
      return NextResponse.json({ success: false, error: 'Craft item not found' }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          buyerId: payload.userId as string,
          craftItemId,
          quantity,
          totalPrice,
          paymentMethod: paymentMethod || 'UPI_SIMULATED',
          shippingAddress: shippingAddress || '',
          status: 'PLACED'
        }
      });

      await tx.craftItem.update({
        where: { id: craftItemId },
        data: {
          status: 'SOLD_FINAL',
          salePrice: totalPrice / quantity
        }
      });

      await tx.auditLog.create({
        data: {
          action: 'MARKETPLACE_PURCHASE',
          craftItemId,
          actorId: payload.userId as string,
          actorRole: 'BUYER',
          newState: { orderId: order.id, quantity, totalPrice }
        }
      });

      return order;
    });

    return NextResponse.json({ 
      success: true, 
      order: result,
      patchId: craftItem.patchId
    });

  } catch (error) {
    console.error('Orders POST Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}
