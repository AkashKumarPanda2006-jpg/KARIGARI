import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    if (decoded.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const userId = decoded.userId;

    const body = await req.json();
    const { name, photoUrl, upiId, description, mobileNumber, aadhaarLast4 } = body;

    // Update User model
    if (name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name }
      });
    }

    // Update ArtisanProfile
    const profile = await prisma.artisanProfile.upsert({
      where: { userId },
      update: {
        photoUrl,
        upiId,
        description,
        mobileNumber,
        aadhaarLast4
      },
      create: {
        userId,
        craftType: 'Unknown',
        location: 'Unknown',
        experienceYears: 0,
        photoUrl,
        upiId,
        description,
        mobileNumber,
        aadhaarLast4
      }
    });

    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
