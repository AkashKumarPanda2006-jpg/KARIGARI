import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false });
    }

    
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    if (!payload.userId) {
      return NextResponse.json({ success: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        businessName: true,
      }
    });

    if (!user) {
      return NextResponse.json({ success: false });
    }

    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error('Auth Me Error:', error);
    return NextResponse.json({ success: false });
  }
}
