"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Package, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";

export default function VerifyBatchPage() {
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const fetchPendingItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setPendingItems(data.data.pendingCaptures || []);
      }
    } catch (e) {
      console.error("Failed to fetch pending captures", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveBatch = async (artisanId: string) => {
    const itemsToApprove = pendingItems.filter(i => i.artisanId === artisanId).map(i => i.id);
    if (itemsToApprove.length === 0) return;

    try {
      const res = await fetch('/api/admin/verify-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: itemsToApprove })
      });
      if (res.ok) {
        alert("Batch Approved Successfully!");
        fetchPendingItems();
      } else {
        const err = await res.json();
        alert("Failed to approve: " + err.error);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  // Group items by artisan
  const groupedByArtisan = pendingItems.reduce((acc, item) => {
    if (!acc[item.artisanId]) {
      acc[item.artisanId] = {
        artisanName: item.artisan.name,
        items: []
      };
    }
    acc[item.artisanId].items.push(item);
    return acc;
  }, {} as Record<string, { artisanName: string, items: any[] }>);

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
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-900">Verify Captures (Batch)</h1>
            <p className="text-sm text-gray-500">Review and approve newly captured craft items to generate Patch IDs.</p>
          </div>
        </div>

        <div className="space-y-8">
          {isLoading ? (
            <div className="text-center text-gray-500 py-12">Loading pending items...</div>
          ) : Object.keys(groupedByArtisan).length === 0 ? (
            <div className="text-center text-gray-500 py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
              No pending captures require verification.
            </div>
          ) : (
            Object.entries(groupedByArtisan).map(([artisanId, group]) => (
              <div key={artisanId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <div>
                    <h2 className="font-bold text-gray-900">{group.artisanName}</h2>
                    <p className="text-xs text-gray-500">{group.items.length} items pending verification</p>
                  </div>
                  <button 
                    onClick={() => handleApproveBatch(artisanId)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                  >
                    <CheckCircle size={16} />
                    Approve Batch ({group.items.length})
                  </button>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {group.items.map((item) => (
                    <div key={item.id} className="p-6 flex gap-6">
                      <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                        <Image src={item.images?.[0] || "/ikat_saree.jpg"} alt={item.craftType} fill className="object-cover" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{item.craftType}</h3>
                        <p className="text-sm text-gray-600 mb-4">{item.descriptionEnglish}</p>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">AI Valuation</span>
                            <span className="font-bold text-gray-900">₹{item.fairWageFloor?.toLocaleString()}</span>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Labor</span>
                            <span className="font-bold text-gray-900">{item.laborDays} Days</span>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Material</span>
                            <span className="font-bold text-gray-900">₹{item.rawMaterialCost?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
