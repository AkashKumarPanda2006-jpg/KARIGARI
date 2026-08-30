"use client";

import { useEffect, useCallback, useState } from "react";

/**
 * OfflineSyncProvider
 * 
 * Listens for the browser `online` event. When connectivity is restored,
 * it flushes all items saved in localStorage["offlineQueue"] to the
 * /api/items/capture endpoint. Shows a toast when items are synced.
 * 
 * Mount this once in the root layout or the artisan dashboard.
 */
export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const flushOfflineQueue = useCallback(async () => {
    const raw = localStorage.getItem("offlineQueue");
    if (!raw) return;

    let queue: any[] = [];
    try {
      queue = JSON.parse(raw);
    } catch {
      localStorage.removeItem("offlineQueue");
      return;
    }

    if (queue.length === 0) return;

    let synced = 0;
    const failed: any[] = [];

    for (const item of queue) {
      try {
        const res = await fetch("/api/items/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            craftType: item.craftType,
            laborDays: item.laborDays,
            rawMaterialCost: item.rawMaterialCost,
            askingPrice: item.askingPrice,
            transcript: item.descriptionOriginal || "",
            englishDescription: item.descriptionEnglish || "",
            images: item.images || [],
            catalogMethod: "VOICE",
          }),
        });

        if (res.ok) {
          synced++;
        } else {
          failed.push(item);
        }
      } catch {
        failed.push(item);
      }
    }

    // Keep only the failed items in the queue
    if (failed.length > 0) {
      localStorage.setItem("offlineQueue", JSON.stringify(failed));
    } else {
      localStorage.removeItem("offlineQueue");
    }

    if (synced > 0) {
      setSyncToast(`${synced} offline item${synced > 1 ? "s" : ""} synced successfully!`);
      setTimeout(() => setSyncToast(null), 5000);
    }
  }, []);

  useEffect(() => {
    // Try to flush on mount (in case we came online before the component mounted)
    if (navigator.onLine) {
      flushOfflineQueue();
    }

    // Listen for online events
    const handleOnline = () => {
      flushOfflineQueue();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [flushOfflineQueue]);

  return (
    <>
      {syncToast && (
        <div className="fixed top-4 right-4 z-[9999] bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-bold flex items-center gap-2 animate-fade-in-up">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          {syncToast}
        </div>
      )}
      {children}
    </>
  );
}
