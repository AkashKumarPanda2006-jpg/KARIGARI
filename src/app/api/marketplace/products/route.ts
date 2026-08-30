import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    if (id) {
      const product = await prisma.craftItem.findUnique({
        where: { id },
        include: {
          artisan: {
            select: {
              name: true,
              artisanProfile: {
                select: {
                  clusterName: true,
                  location: true,
                  giTagCertified: true,
                  photoUrl: true,
                  description: true,
                }
              }
            }
          }
        }
      });

      if (!product) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        product: {
          id: product.id,
          craftType: product.craftType,
          images: product.images,
          askingPrice: product.askingPrice,
          standardMarketPrice: product.standardMarketPrice,
          marketPriceMin: product.marketPriceMin,
          marketPriceMax: product.marketPriceMax,
          fairWageFloor: product.fairWageFloor,
          descriptionOriginal: product.descriptionOriginal,
          descriptionEnglish: product.descriptionEnglish,
          patchId: product.patchId,
          giTagApplied: product.giTagApplied,
          artisanName: product.artisan?.name,
          clusterName: product.artisan?.artisanProfile?.clusterName,
          location: product.artisan?.artisanProfile?.location,
          giTagCertified: product.artisan?.artisanProfile?.giTagCertified,
          artisanPhoto: product.artisan?.artisanProfile?.photoUrl,
          artisanBio: product.artisan?.artisanProfile?.description,
          createdAt: product.createdAt
        }
      });
    }

    const whereClause: any = {
      OR: [
        { isListedOnMarketplace: true },
        { status: { not: 'FLAGGED' } }
      ]
    };

    if (category) {
      whereClause.craftType = {
        contains: category,
        mode: 'insensitive'
      };
    }

    if (search) {
      whereClause.OR = [
        ...(whereClause.OR || []),
        { craftType: { contains: search, mode: 'insensitive' } },
        { descriptionEnglish: { contains: search, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.craftItem.findMany({
      where: whereClause,
      include: {
        artisan: {
          select: {
            name: true,
            artisanProfile: {
              select: {
                clusterName: true,
                location: true,
                giTagCertified: true,
                photoUrl: true,
                description: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedProducts = products.map((product: any) => ({
      id: product.id,
      craftType: product.craftType,
      images: product.images,
      askingPrice: product.askingPrice,
      standardMarketPrice: product.standardMarketPrice,
      marketPriceMin: product.marketPriceMin,
      marketPriceMax: product.marketPriceMax,
      fairWageFloor: product.fairWageFloor,
      descriptionOriginal: product.descriptionOriginal,
      descriptionEnglish: product.descriptionEnglish,
      patchId: product.patchId,
      giTagApplied: product.giTagApplied,
      artisanName: product.artisan?.name,
      clusterName: product.artisan?.artisanProfile?.clusterName,
      location: product.artisan?.artisanProfile?.location,
      giTagCertified: product.artisan?.artisanProfile?.giTagCertified,
      artisanPhoto: product.artisan?.artisanProfile?.photoUrl,
      artisanBio: product.artisan?.artisanProfile?.description,
      createdAt: product.createdAt
    }));

    return NextResponse.json({ success: true, products: formattedProducts });

  } catch (error) {
    console.error('Products API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}
