import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function PUT(req: Request) {
  try {
    const { photoUrl, upiId, description } = await req.json();
    
    // Auth Check
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth_session');
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, role } = JSON.parse(sessionCookie.value);
    
    if (role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
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
        description
      }
    });

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
