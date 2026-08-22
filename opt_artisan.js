const fs = require('fs');
let code = fs.readFileSync('src/app/api/artisan/dashboard/route.ts', 'utf8');

const replacement = `    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Parallelize all independent DB queries to dramatically improve SSR / API response time
    const [
      user,
      myCapturesCount,
      advancedItems,
      itemsSold,
      queued,
      recentCaptures,
      pastWeekCaptures,
      pastWeekAdvancedItems,
      pastWeekSold,
      pastWeekQueued
    ] = await Promise.all([
      // Fetch user details
      prisma.user.findUnique({
        where: { id: artisanId },
        include: { artisanProfile: true }
      }),

      // 1. My Captures (total count)
      prisma.craftItem.count({
        where: { artisanId }
      }),

      // 2. Advances Received
      prisma.craftItem.findMany({
        where: { artisanId, status: { in: ['ADVANCE_PAID', 'SOLD_FINAL'] } },
        select: { advancePaid: true, fairWageFloor: true }
      }),

      // 3. Items Sold
      prisma.craftItem.count({
        where: { artisanId, status: { in: ['SOLD_FINAL', 'SOLD_MIDDLEMAN'] } }
      }),

      // 4. Total Earnings
      prisma.craftItem.aggregate({
        _sum: { finalPayoutQueued: true },
        where: { artisanId, status: 'SOLD_FINAL' }
      }),

      // 5. Recent Captures
      prisma.craftItem.findMany({
        where: { artisanId },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // 6. Trends (past 7 days)
      prisma.craftItem.count({
        where: { artisanId, createdAt: { gte: oneWeekAgo } }
      }),

      prisma.craftItem.findMany({
        where: { artisanId, status: { in: ['ADVANCE_PAID', 'SOLD_FINAL'] }, createdAt: { gte: oneWeekAgo } },
        select: { advancePaid: true, fairWageFloor: true }
      }),

      prisma.craftItem.count({
        where: { artisanId, status: { in: ['SOLD_FINAL', 'SOLD_MIDDLEMAN'] }, createdAt: { gte: oneWeekAgo } }
      }),

      prisma.craftItem.aggregate({
        _sum: { finalPayoutQueued: true },
        where: { artisanId, status: 'SOLD_FINAL', createdAt: { gte: oneWeekAgo } }
      })
    ]);

    const totalAdvances = advancedItems.reduce((sum, item) => sum + (item.advancePaid || item.fairWageFloor || 0), 0);
    const totalEarnings = totalAdvances + (queued._sum.finalPayoutQueued || 0);

    const pastWeekAdvances = pastWeekAdvancedItems.reduce((sum, item) => sum + (item.advancePaid || item.fairWageFloor || 0), 0);
    const pastWeekEarnings = pastWeekAdvances + (pastWeekQueued._sum.finalPayoutQueued || 0);
`;

const startIndex = code.indexOf('// Fetch user details');
const endIndex = code.indexOf('return NextResponse.json({');

if (startIndex !== -1 && endIndex !== -1) {
    code = code.substring(0, startIndex) + replacement + '\n    ' + code.substring(endIndex);
    fs.writeFileSync('src/app/api/artisan/dashboard/route.ts', code);
    console.log('Successfully optimized artisan dashboard API');
} else {
    console.log('Could not find injection points');
}
