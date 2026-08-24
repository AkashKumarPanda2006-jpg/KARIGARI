import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

/** The only social categories the eligibility engine (src/lib/schemes.ts) understands. */
const SOCIAL_CATEGORIES = ['SC', 'ST', 'OBC', 'EWS', 'GENERAL'] as const;
type SocialCategory = (typeof SOCIAL_CATEGORIES)[number];

/**
 * `undefined` → field omitted from the request, leave whatever is stored alone.
 * `null`      → explicitly cleared.
 * Anything else that is not a known category is a 400, so the column can never
 * hold a value the scheme rules cannot read.
 */
function parseSocialCategory(
  value: unknown
): { ok: true; value: SocialCategory | null } | { ok: false; error: string } {
  if (value === null) return { ok: true, value: null };
  if (typeof value !== 'string') {
    return { ok: false, error: 'socialCategory must be null or one of SC, ST, OBC, EWS, GENERAL' };
  }
  const normalized = value.trim().toUpperCase();
  if (!(SOCIAL_CATEGORIES as readonly string[]).includes(normalized)) {
    return { ok: false, error: 'socialCategory must be null or one of SC, ST, OBC, EWS, GENERAL' };
  }
  return { ok: true, value: normalized as SocialCategory };
}

function parseAnnualIncome(
  value: unknown
): { ok: true; value: number | null } | { ok: false; error: string } {
  if (value === null) return { ok: true, value: null };
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return { ok: false, error: 'annualIncome must be null or a number greater than or equal to 0' };
  }
  return { ok: true, value };
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'fallback-secret');
    } catch {
      // An expired or tampered token is an auth failure, not a server fault —
      // and the raw jwt error must not be echoed back to the caller.
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const userId = decoded.userId;

    const body = await req.json();
    const { name, photoUrl, upiId, description, mobileNumber, aadhaarLast4 } = body;

    // Left `undefined` when the key is absent, so Prisma skips the column and an
    // unrelated profile save can never wipe an artisan's recorded category/income.
    let socialCategory: SocialCategory | null | undefined;
    if (Object.prototype.hasOwnProperty.call(body ?? {}, 'socialCategory')) {
      const parsed = parseSocialCategory(body.socialCategory);
      if (!parsed.ok) {
        return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
      }
      socialCategory = parsed.value;
    }

    let annualIncome: number | null | undefined;
    if (Object.prototype.hasOwnProperty.call(body ?? {}, 'annualIncome')) {
      const parsed = parseAnnualIncome(body.annualIncome);
      if (!parsed.ok) {
        return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
      }
      annualIncome = parsed.value;
    }

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
        aadhaarLast4,
        socialCategory,
        annualIncome
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
        aadhaarLast4,
        socialCategory,
        annualIncome
      }
    });

    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
