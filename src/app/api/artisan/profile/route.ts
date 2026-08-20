import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function PUT(req: Request) {
  try {
    const { name, photoUrl, upiId, description } = await req.json();
    
    // Auth Check
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jwt = require('jsonwebtoken');
    let decoded: any;
    try {
      decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'fallback-secret');
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    if (decoded.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const userId = decoded.userId;

    if (name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name }
      });
    }

    // Upsert ArtisanProfile
    const profile = await prisma.artisanProfile.upsert({
      where: { userId },
      update: {
        photoUrl,
        upiId,
        description
      },
      create: {
        userId,
        photoUrl,
        upiId,
        description,
        craftType: "Unknown",
        location: "Unknown",
        experienceYears: 0
      }
    });

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
