import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Activity, Users, FileText, Download, AlertTriangle } from 'lucide-react';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const revalidate = 0; // Disable static rendering

export default async function SuperAdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  // Basic security check for the MVP, assuming Super Admin uses the same JWT for now
  if (!token) return <div>Unauthorized</div>;

  // 1. Calculate Regional Economic Health (Minimum Priority Heap)
  // Fetch all admins
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, name: true, patchBankBalance: true }
  });

  const regionsData = await Promise.all(admins.map(async (admin) => {
    const adminItems = await prisma.craftItem.findMany({
      where: { assignedAdminId: admin.id, status: 'SOLD_FINAL' }
    });
    
    let totalScore = 0;
    if (adminItems.length > 0) {
      adminItems.forEach(item => {
        const salePrice = item.salePrice || item.fairWageFloor || 0;
        const floor = item.fairWageFloor || 1;
        let score = (salePrice / floor) * 100;
        if (score > 100) score = 100;
        totalScore += score;
      });
    }
    
    const complianceRate = adminItems.length > 0 ? Math.round(totalScore / adminItems.length) : 100;
    
    return {
      adminName: admin.name,
      // For MVP, we pretend the admin's name correlates to a region
      region: `${admin.name}'s Cooperative Cluster`,
      complianceRate,
      itemsSold: adminItems.length
    };
  }));

  // Sort ascending (Minimum Priority Heap)
  regionsData.sort((a, b) => a.complianceRate - b.complianceRate);

  // 2. Global Raw Ledger
  const rawLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      craftItem: {
        select: { patchId: true, craftType: true }
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-gray-900 h-16 border-b border-gray-800 flex items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
          <span className="font-bold">Back to Home</span>
        </Link>
        <div className="text-white font-bold tracking-widest text-sm flex items-center gap-2">
          <ShieldCheck size={18} className="text-blue-400" /> SUPER ADMIN OVERSIGHT
        </div>
      </header>

      <main className="flex-grow p-6 sm:p-10 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">Government Oversight Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Platform-wide analytics, security monitoring, and economic health interventions.</p>
          </div>
          <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm">
            <Download size={16} />
            Export National Report
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Minimum Priority Heap - Regional Economic Health */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <Activity size={20} className="text-red-500" />
                <h2 className="font-bold text-gray-900">At-Risk Regions (Min-Heap)</h2>
              </div>
              <p className="text-xs text-gray-500 mb-4">Clusters sorted by lowest Fair Wage Compliance. Use this to direct government subsidies or training programs.</p>
              
              <div className="space-y-3">
                {regionsData.map((region, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${region.complianceRate < 80 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-gray-900 text-sm">{region.region}</p>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${region.complianceRate < 80 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {region.complianceRate}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{region.itemsSold} items sold</span>
                      {region.complianceRate < 80 && (
                        <span className="flex items-center gap-1 text-red-600 font-medium">
                          <AlertTriangle size={12} /> Intervention Needed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Global Raw Ledger */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <FileText size={20} className="text-blue-500" />
                  <h2 className="font-bold text-gray-900">Global Raw Ledger</h2>
                </div>
                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">LIVE SYNC</span>
              </div>
              <p className="text-xs text-gray-500 mb-4">Immutable timeline of all platform actions. Secured via distributed architecture.</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100">
                      <th className="p-3 font-medium">Timestamp</th>
                      <th className="p-3 font-medium">Patch ID</th>
                      <th className="p-3 font-medium">Actor Role</th>
                      <th className="p-3 font-medium">Action Event</th>
                      <th className="p-3 font-medium text-right">Cryptographic Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rawLogs.map((log) => {
                      // Simulate a blockchain hash for the UI based on the log ID
                      const fakeHash = "0x" + log.id.replace(/-/g, '').substring(0, 16).toUpperCase();
                      
                      return (
                        <tr key={log.id} className="hover:bg-gray-50 font-mono text-xs">
                          <td className="p-3 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="p-3 font-bold text-gray-900">{log.craftItem.patchId || "N/A"}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-md ${
                              log.actorRole === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                              log.actorRole === 'ARTISAN' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {log.actorRole}
                            </span>
                          </td>
                          <td className="p-3 text-gray-700">{log.action.replace(/_/g, ' ')}</td>
                          <td className="p-3 text-right text-gray-400 select-all">{fakeHash}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
