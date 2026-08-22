const fs = require('fs');
let code = fs.readFileSync('src/app/api/admin/dashboard/route.ts', 'utf8');

const replacement = `    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Parallelize all independent DB queries to dramatically improve SSR / API response time
    const [
      totalArtisans,
      advances,
      itemsCaptured,
      itemsSold,
      pastWeekItemsCaptured,
      pastWeekItemsSold,
      pastWeekAdvancesQuery,
      pastWeekArtisans,
      adminItems,
      recentCaptures,
      pendingCaptures,
      alerts,
      alertCount,
      atRiskArtisans,
      adminUser,
      allArtisans
    ] = await Promise.all([
      // 1. Total Artisans
      prisma.user.count({ where: { role: 'ARTISAN' } }),
      
      // 2. Total Advances Disbursed (sum of advancePaid)
      prisma.craftItem.aggregate({
        _sum: { advancePaid: true },
        where: { status: { in: ['ADVANCE_PAID', 'SOLD_FINAL'] } }
      }),

      // Items metrics
      prisma.craftItem.count(),
      prisma.craftItem.count({
        where: { status: { in: ['SOLD_FINAL', 'SOLD_MIDDLEMAN'] } }
      }),

      // Trend calculations
      prisma.craftItem.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.craftItem.count({
        where: { status: { in: ['SOLD_FINAL', 'SOLD_MIDDLEMAN'] }, createdAt: { gte: oneWeekAgo } }
      }),
      prisma.craftItem.aggregate({
        _sum: { advancePaid: true },
        where: { status: { in: ['ADVANCE_PAID', 'SOLD_FINAL'] }, createdAt: { gte: oneWeekAgo } }
      }),
      prisma.user.count({ where: { role: 'ARTISAN', createdAt: { gte: oneWeekAgo } } }),

      // 3. Regional Fair Wage Index (Local Admin's specific items)
      prisma.craftItem.findMany({
        where: { assignedAdminId: decoded.userId, status: { not: 'PENDING_VERIFICATION' } }
      }),

      // 4. Recent Captures
      prisma.craftItem.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        where: { status: { not: 'PENDING_VERIFICATION' } },
        include: { artisan: { select: { name: true, artisanProfile: true } }, auditLogs: { orderBy: { createdAt: 'desc' } } }
      }),

      // Pending Captures
      prisma.craftItem.findMany({
        where: { status: 'PENDING_VERIFICATION' },
        orderBy: { createdAt: 'desc' },
        include: { artisan: { select: { name: true, artisanProfile: true } } }
      }),

      // 5. Alerts
      prisma.craftItem.findMany({
        where: {
          assignedAdminId: decoded.userId,
          OR: [ { status: 'FLAGGED' }, { failedScanCount: { gt: 0 } }, { fairnessScore: { lt: 60 } } ]
        },
        include: { auditLogs: { orderBy: { createdAt: 'desc' } } },
        orderBy: { createdAt: 'desc' }
      }),

      // Alert Count
      prisma.craftItem.count({
        where: {
          assignedAdminId: decoded.userId,
          OR: [ { status: 'FLAGGED' }, { fairnessScore: { lt: 60 } } ]
        }
      }),

      // 6. At Risk Artisans
      prisma.user.findMany({
        where: { role: 'ARTISAN', accountStatus: 'ACTIVE', artisanProfile: { healthScore: { lt: 65 } } },
        include: { artisanProfile: true }
      }),

      // Fetch Admin user details
      prisma.user.findUnique({ where: { id: decoded.userId } }),

      // 7. Dynamic Leaderboard
      prisma.user.findMany({
        where: { role: 'ARTISAN' },
        include: { artisanProfile: true, craftItems: {
          where: { status: { in: ['ADVANCE_PAID', 'SOLD_FINAL', 'SOLD_MIDDLEMAN'] } },
          select: { advancePaid: true, fairWageFloor: true, finalPayoutQueued: true }
        }}
      })
    ]);

    const totalAdvances = advances._sum.advancePaid || 0;
    const pastWeekAdvances = pastWeekAdvancesQuery._sum.advancePaid || 0;
    
    const trends = {
      artisans: \`+\${pastWeekArtisans}\`,
      captured: \`+\${pastWeekItemsCaptured}\`,
      sold: \`+\${pastWeekItemsSold}\`,
      advances: \`+₹\${pastWeekAdvances.toLocaleString()}\`
    };
`;

const startIndex = code.indexOf('// 1. Total Artisans');
const endIndex = code.indexOf('let totalScore = 0;');
if (startIndex !== -1 && endIndex !== -1) {
    code = code.substring(0, startIndex) + replacement + '    ' + code.substring(endIndex);
    fs.writeFileSync('src/app/api/admin/dashboard/route.ts', code);
    console.log('Successfully optimized admin dashboard API');
} else {
    console.log('Could not find injection points');
}
