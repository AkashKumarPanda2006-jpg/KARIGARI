"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, AlertTriangle } from "lucide-react";

export default function CounterfeitAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setAlerts(data.data.alerts || []);
      }
    } catch (e) {
      console.error("Failed to fetch alerts", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900 flex items-center gap-3">
            <ShieldAlert size={32} className="text-red-500" />
            Security & Counterfeit Alerts
          </h1>
          <p className="text-gray-500 mt-2">Review items flagged for potential counterfeiting or fairness violations.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">System Secure</h3>
            <p className="text-gray-500">No counterfeit or fairness alerts have been detected.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map(alert => (
              <div key={alert.id} className="flex flex-col">
                <div className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col md:flex-row gap-4 items-center justify-between z-10 relative ${alert.status !== 'FLAGGED' && alert.failedScanCount > 0 ? 'border-gray-200 opacity-80' : 'border-red-100'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${alert.status !== 'FLAGGED' && alert.failedScanCount > 0 ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-500'}`}>
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {alert.status === 'FLAGGED' 
                          ? "Active Counterfeit Alert" 
                          : (alert.failedScanCount > 0 ? "Resolved Counterfeit Incident" : "Fairness Violation")}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Item: <span className="font-mono">{alert.craftType} #{alert.id.substring(0,6)}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Detected: {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <span className={`px-4 py-2 text-sm font-bold rounded-lg ${alert.status !== 'FLAGGED' && alert.failedScanCount > 0 ? 'text-gray-500 bg-gray-100' : 'text-red-700 bg-red-100'}`}>
                      {alert.status === 'FLAGGED' ? "Action Required" : "Resolved"}
                    </span>
                  </div>
                </div>
                
                {/* Counterfeit Audit Logs Timeline */}
                {alert.auditLogs && alert.auditLogs.length > 0 && (
                  <div className="bg-gray-50 rounded-b-xl border-x border-b border-gray-200 p-4 -mt-4 pt-8 relative z-0">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Counterfeit Audit Logs</h4>
                    <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-[2px] before:bg-gray-200">
                      {alert.auditLogs.filter((log: any) => log.action.includes('FLAGGED') || log.action.includes('RESOLVE') || log.action.includes('SCAN')).map((log: any) => (
                        <div key={log.id} className="relative flex items-start gap-4">
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 border-white shrink-0 z-10 ${log.action.includes('FLAGGED') ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                            <AlertTriangle size={12} />
                          </div>
                          <div className="pb-1">
                            <span className="font-bold text-xs text-gray-900">{log.action.replace(/_/g, ' ')}</span>
                            <time className="text-[10px] font-medium text-gray-500 block">
                              {new Date(log.createdAt).toLocaleString()} • {log.actorRole}
                            </time>
                            <p className="text-xs text-gray-600 mt-1">{log.comments}</p>
                          </div>
                        </div>
                      ))}
                      {alert.auditLogs.filter((log: any) => log.action.includes('FLAGGED') || log.action.includes('RESOLVE') || log.action.includes('SCAN')).length === 0 && (
                        <p className="text-xs text-gray-500 italic ml-6">No specific anomaly logs found for this item.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
