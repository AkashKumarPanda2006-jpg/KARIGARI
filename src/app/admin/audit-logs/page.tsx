import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, ScrollText } from 'lucide-react';

export const revalidate = 0; // Disable static rendering for this page

export default async function AuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white h-16 border-b border-gray-200 flex items-center px-4 sm:px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} />
          <span className="font-bold">Back to Dashboard</span>
        </Link>
      </header>

      <main className="flex-grow p-6 sm:p-10 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <ScrollText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-900">System Audit Logs</h1>
            <p className="text-sm text-gray-500">Immutable record of all verification and state changes.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Item ID</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Actor</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      No audit logs found. Try verifying or flagging an item.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-sm text-gray-600 font-mono whitespace-nowrap">
                        {log.createdAt.toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                          log.action.includes('FLAGGED') ? 'bg-red-100 text-red-700' : 
                          log.action.includes('VERIFIED') ? 'bg-green-100 text-green-700' : 
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm font-mono text-gray-500">
                        {log.craftItemId.substring(0, 8)}...
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">
                        {log.actorRole}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 max-w-xs truncate" title={log.comments || ''}>
                        {log.comments || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
