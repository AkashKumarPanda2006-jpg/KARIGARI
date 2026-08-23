import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { logCraftItemEvent } from '@/lib/auditLogger';
import { validateArtisanClaim } from '@/lib/benchmarkData';

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

    if (decoded.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Forbidden. Artisan access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { craftType, rawMaterialCost, laborDays, descriptionOriginal, descriptionEnglish, tags, assignedAdminId, images, aiGeneratedListing } = body;
    
    console.log(`[Capture API] Received payload with ${images ? images.length : 'NO'} images.`);
    if (images && images.length > 0) {
      console.log(`[Capture API] First image length: ${images[0].length}`);
    }

    if (!craftType || rawMaterialCost === undefined || laborDays === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const rawCost = Number(rawMaterialCost);
    const days = Number(laborDays);

    // --- AI AUTO-REJECTION FILTER ---
    const validationResult = validateArtisanClaim(craftType, days, rawCost);
    if (!validationResult.isValid) {
      return NextResponse.json({ error: validationResult.reason }, { status: 400 });
    }

    // --- ML Prediction Engine (Mock) ---
    // 1. Dynamic Base Wage based on craft
    let baseWage = 500;
    const craftLower = craftType.toLowerCase();
    if (craftLower.includes('silk')) baseWage = 650;
    else if (craftLower.includes('cotton')) baseWage = 450;
    else if (craftLower.includes('wool')) baseWage = 550;

    const laborCost = days * baseWage;
    const overhead = (laborCost + rawCost) * 0.1;
    const fairWageFloor = laborCost + rawCost + overhead;
    
    // 2. Seasonality Factor (Mocking current month)
    const currentMonth = new Date().getMonth(); 
    let seasonalBump = 1.0;
    // Example: October/November (Diwali) bumps Silk prices
    if ((currentMonth === 9 || currentMonth === 10) && craftLower.includes('silk')) {
      seasonalBump = 1.15; // +15% demand
    }

    // 3. Predicted Market Prices
    const standardMarketPrice = (fairWageFloor * 1.4) * seasonalBump;
    const marketPriceMin = (fairWageFloor * 1.2) * seasonalBump;
    const marketPriceMax = (fairWageFloor * 1.6) * seasonalBump;
    const creditScore = 85.5; // Mock credit score based on history
    
    // Auto-update ArtisanProfile tags with the new craftType
    try {
      if (craftType) {
        const profile = await prisma.artisanProfile.findUnique({ where: { userId: decoded.userId } });
        if (profile) {
          const currentTags = profile.tags || [];
          if (!currentTags.includes(craftType)) {
            await prisma.artisanProfile.update({
              where: { userId: decoded.userId },
              data: { tags: { push: craftType } }
            });
          }
        } else {
          // Create the profile with the tag if it doesn't exist
          await prisma.artisanProfile.create({
            data: {
              userId: decoded.userId,
              craftType: "Unknown",
              location: "Unknown",
              experienceYears: 0,
              tags: ["Artisan", craftType]
            }
          });
        }
      }
    } catch (tagErr) {
      console.error("Failed to update artisan profile tags:", tagErr);
    }

    const item = await prisma.craftItem.create({
      data: {
        artisanId: decoded.userId,
        assignedAdminId: assignedAdminId || null,
        patchId: null, // Generated during the Sell phase
        craftType,
        descriptionOriginal,
        descriptionEnglish,
        aiGeneratedListing,
        tags: tags || [],
        images: images || [],
        rawMaterialCost: rawCost,
        laborDays: days,
        fairWageFloor,
        standardMarketPrice,
        marketPriceMin,
        marketPriceMax,
        creditScore,
        fairnessScore: 95.0,
        status: 'PENDING_VERIFICATION',
      }
    });

    await logCraftItemEvent({
      prisma,
      craftItemId: item.id,
      actorId: decoded.userId,
      actorRole: 'ARTISAN',
      action: 'UPLOAD_CREATED',
      newState: { status: 'PENDING_VERIFICATION' },
      comments: `Artisan uploaded ${craftType}. Auto-verified math plausible. Sent to Admin for review.`
    });

    return NextResponse.json({ 
      success: true, 
      item, 
      valuations: {
        fairWageFloor,
        marketPriceMin,
        marketPriceMax,
        creditScore,
      }
    });
  } catch (error: any) {
    console.error('Capture API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
