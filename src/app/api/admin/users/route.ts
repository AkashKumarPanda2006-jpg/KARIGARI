import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    let decoded: any;
    try {
      decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'fallback-secret');
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: { role: 'ARTISAN' },
      include: {
        artisanProfile: true,
        _count: {
          select: { craftItems: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    users.forEach(u => {
      u.name = u.name.substring(0, 2) + "***";
      if (u.artisanProfile && u.artisanProfile.upiId) {
        u.artisanProfile.upiId = u.artisanProfile.upiId.substring(0, 3) + "***@upi";
      }
    });

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error('Users API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    let decoded: any;
    try {
      decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'fallback-secret');
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, accountStatus } = await req.json();

    if (!userId || !accountStatus) {
      return NextResponse.json({ error: 'Missing userId or accountStatus' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { accountStatus }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Update User API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
