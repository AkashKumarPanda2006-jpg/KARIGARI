import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, ScrollText, Search, Clock, ShieldCheck, Banknote, AlertTriangle, Download, ChevronDown, CheckCircle2 } from 'lucide-react';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const revalidate = 0; // Disable static rendering for this page

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || '';

  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');
  let adminId = null;

  if (token) {
    try {
      const decoded: any = jwt.verify(token.value, process.env.JWT_SECRET || 'fallback-secret');
      adminId = decoded.userId;
    } catch (e) {
      console.error("Invalid token");
    }
  }

  let searchItem = null;
  let searchLogs: any[] = [];

  // 1. If searching, find specific item
  if (search) {
    searchItem = await prisma.craftItem.findFirst({
      where: { patchId: search },
      include: {
        artisan: true,
        auditLogs: { orderBy: { createdAt: 'desc' } }
      }
    });
    if (searchItem) {
      searchLogs = searchItem.auditLogs;
    }
  }

  // 2. Fetch admin's assigned items
  const adminItems = await prisma.craftItem.findMany({
    where: { 
      // For MVP demo purposes, if adminId isn't on old records, we'll just show items with patchIds
      OR: [
        { assignedAdminId: adminId },
        { patchId: { not: null } } // Backwards compatibility for items minted before the update
      ]
    },
    include: {
      artisan: true,
      auditLogs: { orderBy: { createdAt: 'desc' } }
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  const renderTimeline = (logs: any[]) => {
    return (
      <div className="mt-4 relative border-l-2 border-gray-100 ml-4 pl-6 space-y-6">
        {logs.length === 0 && <p className="text-sm text-gray-400 italic">No logs found.</p>}
        {logs.map((log) => {
          let icon = <Clock size={16} className="text-gray-400" />;
          let colorClass = "bg-gray-100 border-gray-200";
          
          if (log.action.includes('CAPTURE')) {
            icon = <ScrollText size={16} className="text-blue-500" />;
            colorClass = "bg-blue-50 border-blue-200";
          } else if (log.action.includes('VERIFIED')) {
            icon = <ShieldCheck size={16} className="text-green-500" />;
            colorClass = "bg-green-50 border-green-200";
          } else if (log.action.includes('SOLD_FINAL') || log.action.includes('DISBURSEMENT') || log.action.includes('UPI_PAYMENT')) {
            icon = <Banknote size={16} className="text-green-600" />;
            colorClass = "bg-green-100 border-green-300";
          } else if (log.action.includes('AGENT_HANDOFF')) {
            icon = <CheckCircle2 size={16} className="text-purple-500" />;
            colorClass = "bg-purple-50 border-purple-200";
          } else if (log.action.includes('FLAGGED')) {
            icon = <AlertTriangle size={16} className="text-red-500" />;
            colorClass = "bg-red-50 border-red-200";
          }

          return (
            <div key={log.id} className="relative">
              <div className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center ${colorClass.replace('bg-', 'border-')}`}>
                {icon}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{log.action.replace(/_/g, ' ')}</p>
                <p className="text-xs text-gray-500 mb-1">{new Date(log.createdAt).toLocaleString()} • by {log.actorRole}</p>
                {log.comments && (
                  <p className={`text-sm p-3 rounded-xl border mt-2 inline-block ${colorClass}`}>
                    {log.comments}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-4 sm:px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} />
          <span className="font-bold">Back to Dashboard</span>
        </Link>
        <div className="flex items-center gap-4">
          <form method="GET" action="/admin/audit-logs" className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                name="search" 
                defaultValue={search}
                placeholder="Search an old Patch ID..."
                className="pl-9 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              />
            </div>
            <button type="submit" className="bg-primary text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-primary-dark transition-colors">
              Search
            </button>
          </form>
        </div>
      </header>

      <main className="flex-grow p-6 sm:p-10 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <ScrollText size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-gray-900">Your Authenticated Items</h1>
              <p className="text-sm text-gray-500">Timelines for products you have physically verified.</p>
            </div>
          </div>
          
          <a href="/api/admin/export-compliance" target="_blank" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm">
            <Download size={16} />
            Export Compliance Report
          </a>
        </div>

        {search && searchItem && (
          <div className="mb-8 bg-white border border-primary/20 rounded-2xl p-6 shadow-md ring-2 ring-primary/10">
            <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-2">
              <h2 className="text-lg font-bold text-gray-900">Search Result: {searchItem.patchId}</h2>
              <Link href="/admin/audit-logs" className="text-sm text-gray-500 hover:text-gray-900 underline">Clear Search</Link>
            </div>
            {renderTimeline(searchLogs)}
          </div>
        )}

        <div className="space-y-4">
          {adminItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
              <p className="text-gray-500 font-medium">You have not authenticated any items yet.</p>
            </div>
          ) : (
            adminItems.map(item => (
              <details key={item.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group">
                <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between list-none">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                      ID
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{item.patchId || "Unpatched Item"}</p>
                      <p className="text-sm text-gray-500">{item.craftType} • Artisan: {item.artisan?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
                      item.status === 'SOLD_FINAL' ? 'bg-green-100 text-green-700' :
                      item.status === 'FLAGGED' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {item.status.replace(/_/g, ' ')}
                    </span>
                    <ChevronDown size={20} className="text-gray-400 group-open:rotate-180 transition-transform" />
                  </div>
                </summary>
                <div className="px-6 pb-6 pt-2 border-t border-gray-100 bg-gray-50/50">
                  <h4 className="font-bold text-sm text-gray-900 mb-4 mt-2">Immutable Product Timeline</h4>
                  {renderTimeline(item.auditLogs)}
                </div>
              </details>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
