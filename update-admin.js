const fs = require('fs');

const pageContent = `"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setDashboardData(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fluid-bg font-body-md text-on-surface min-h-screen">
      <aside className="fixed left-0 top-0 h-full w-64 glass-panel z-50 flex flex-col !rounded-none !border-l-0 !border-t-0 !border-b-0">
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-zari-gold rounded-full shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>
          <span className="font-headline-md text-primary tracking-tighter">KARIGARI</span>
        </div>
        <div className="flex-1 px-4 py-4">
          <div className="mb-8">
            <h3 className="px-4 mb-4 text-xs font-label-lg text-outline uppercase tracking-widest">Management</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/admin/dashboard" className="flex items-center px-4 py-3 rounded-xl transition-all bg-tertiary text-white shadow-lg">
                <span className="font-label-lg">Registry Overview</span>
              </Link>
              <Link href="/admin/users" className="flex items-center px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/30 transition-all">
                <span className="font-label-lg">Artisan Directory</span>
              </Link>
              <Link href="/admin/verify" className="flex items-center px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/30 transition-all">
                <span className="font-label-lg">Certification Hub</span>
              </Link>
            </nav>
          </div>
          <div>
            <h3 className="px-4 mb-4 text-xs font-label-lg text-outline uppercase tracking-widest">System</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/admin/dashboard" className="flex items-center px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/30 transition-all">
                <span className="font-label-lg">Security Logs</span>
              </Link>
              <Link href="/admin/dashboard" className="flex items-center px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/30 transition-all">
                <span className="font-label-lg">System Integrity</span>
              </Link>
            </nav>
          </div>
        </div>
        <div className="p-6 border-t border-glass-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm border border-glass-border flex items-center justify-center text-secondary font-bold">LM</div>
            <div className="flex flex-col">
              <span className="font-label-lg text-on-surface">Loom Master</span>
              <span className="text-xs text-outline">Super Admin</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="pl-64">
        <header className="h-16 flex items-center justify-between px-margin-desktop glass-panel !rounded-none !border-t-0 !border-l-0 !border-r-0 sticky top-0 z-40">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              className="w-full pl-12 pr-4 py-3 bg-white/30 backdrop-blur-sm rounded-full border border-glass-border focus:ring-2 ring-tertiary text-sm outline-none shadow-inner" 
              placeholder="Search the registry..." 
              type="text" 
            />
          </div>
          <div className="flex items-center gap-6 text-on-surface-variant">
            <span className="material-symbols-outlined cursor-pointer hover:text-tertiary transition-colors">notifications</span>
            <span className="material-symbols-outlined cursor-pointer hover:text-tertiary transition-colors">settings</span>
          </div>
        </header>

        <main className="pt-16">
          <div className="flex flex-col w-full p-margin-desktop gap-section-gap">
            <div className="flex flex-col gap-2 glass-panel p-8 rounded-[2rem]">
              <h1 className="font-display-lg text-primary">Welcome back, Admin</h1>
              <p className="font-body-lg text-on-surface-variant max-w-2xl">
                Here's what's happening in Pochampally Weavers Cooperative today.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-gutter">
              <div className="glass-panel p-6 rounded-[2rem] flex flex-col gap-4 relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <span className="font-label-lg text-outline uppercase tracking-widest relative z-10">Total Artisans</span>
                <div className="flex items-end justify-between relative z-10">
                  <span className="font-headline-md text-ink-charcoal">{dashboardData?.metrics?.totalArtisans || 0}</span>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-[2rem] flex flex-col gap-4 relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <span className="font-label-lg text-outline uppercase tracking-widest relative z-10">Items Captured</span>
                <div className="flex items-end justify-between relative z-10">
                  <span className="font-headline-md text-ink-charcoal">{dashboardData?.metrics?.totalItems || 0}</span>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-[2rem] flex flex-col gap-4 relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <span className="font-label-lg text-outline uppercase tracking-widest relative z-10">Advances Disbursed</span>
                <div className="flex items-end justify-between relative z-10">
                  <span className="font-headline-md text-ink-charcoal">₹{(dashboardData?.metrics?.totalAdvances || 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-[2rem] flex flex-col gap-4 relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <span className="font-label-lg text-outline uppercase tracking-widest relative z-10">Items Sold</span>
                <div className="flex items-end justify-between relative z-10">
                  <span className="font-headline-md text-ink-charcoal">{dashboardData?.metrics?.totalSold || 0}</span>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-[2rem] flex flex-col gap-4 relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <span className="font-label-lg text-outline uppercase tracking-widest relative z-10">Regional Econ Health</span>
                <div className="flex items-end justify-between relative z-10">
                  <span className="font-headline-md text-ink-charcoal">100%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
              {/* Health Gauge Chart */}
              <div className="glass-panel p-8 rounded-[2rem] lg:col-span-1 flex flex-col">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="font-headline-md text-primary">Regional Economic Health</h2>
                    <p className="font-body-md text-outline">Average Final Price vs AI Fair Wage Floor</p>
                  </div>
                  <div className="bg-white/50 backdrop-blur-sm border border-glass-border shadow-sm px-4 py-2 rounded-full font-label-lg text-tertiary">
                    100%
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center relative my-8">
                  <div className="w-48 h-48 rounded-full relative shadow-[inset_0_4px_10px_rgba(0,0,0,0.3),0_10px_20px_rgba(0,0,0,0.2)] bg-gradient-to-br from-[#98FF98] via-[#76E076] to-[#55C255] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50"></div>
                    <div className="w-[85%] h-[85%] rounded-full bg-gradient-to-tl from-[#98FF98]/40 to-[#98FF98] shadow-lg flex items-center justify-center border border-white/20">
                      <div className="w-[70%] h-[70%] rounded-full bg-white/5 backdrop-blur-md border border-white/20 shadow-inner"></div>
                    </div>
                  </div>
                  <div className="absolute flex flex-col items-center mt-4">
                    <span className="font-headline-lg text-ink-charcoal drop-shadow-md">100%</span>
                    <span className="font-label-sm text-outline uppercase tracking-widest">Health</span>
                  </div>
                </div>
                <div className="flex flex-col gap-4 mt-auto pt-6 border-t border-glass-border">
                  <div className="flex justify-between items-center glass-panel px-4 py-2 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-[#98FF98] shadow-[0_0_8px_rgba(152,255,152,0.5)]"></div>
                      <span className="font-label-lg text-on-surface">Above Fair Floor</span>
                    </div>
                    <span className="font-label-lg text-ink-charcoal font-bold">100%</span>
                  </div>
                </div>
              </div>

              {/* Trend Stepped Area Chart */}
              <div className="glass-panel p-8 rounded-[2rem] lg:col-span-2 flex flex-col">
                <div className="mb-8">
                  <h2 className="font-headline-md text-primary">Advance Disbursement Trend</h2>
                  <p className="font-body-md text-outline">Total volume disbursed over the month</p>
                </div>
                <div className="flex-1 relative w-full min-h-[250px] mt-4">
                  <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-outline font-label-sm h-full pb-8">
                    <span>₹6.0L</span><span>₹4.5L</span><span>₹3.0L</span><span>₹1.5L</span><span>₹0</span>
                  </div>
                  <div className="absolute left-12 right-0 top-2 bottom-10 flex flex-col justify-between">
                    <div className="w-full h-px border-t border-white/40"></div>
                    <div className="w-full h-px border-t border-white/40"></div>
                    <div className="w-full h-px border-t border-white/40"></div>
                    <div className="w-full h-px border-t border-white/40"></div>
                    <div className="w-full h-px border-t border-white/40"></div>
                  </div>
                  <svg className="absolute left-12 right-0 top-2 bottom-10 w-[calc(100%-3rem)] h-[calc(100%-2.5rem)]" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="smoothAreaGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(186, 26, 26, 0.2)"></stop>
                        <stop offset="100%" stopColor="rgba(0,0,0,0)"></stop>
                      </linearGradient>
                      <filter id="softGlow">
                        <feGaussianBlur result="blur" stdDeviation="3"></feGaussianBlur>
                        <feMerge>
                          <feMergeNode in="blur"></feMergeNode>
                          <feMergeNode in="SourceGraphic"></feMergeNode>
                        </feMerge>
                      </filter>
                    </defs>
                    <path d="M0,80 C10,80 15,30 25,30 C35,30 40,75 50,75 C60,75 65,85 75,85 C85,85 90,82 100,82 L100,100 L0,100 Z" fill="url(#smoothAreaGradient)"></path>
                    <path d="M0,80 C10,80 15,30 25,30 C35,30 40,75 50,75 C60,75 65,85 75,85 C85,85 90,82 100,82" fill="none" filter="url(#softGlow)" stroke="#ba1a1a" strokeLinecap="round" strokeWidth="3"></path>
                  </svg>
                  <div className="absolute left-12 right-0 bottom-0 flex justify-between text-outline font-label-sm bg-white/20 backdrop-blur-sm py-1 px-2 rounded-lg border border-glass-border">
                    <span>1 May</span><span>5 May</span><span>10 May</span><span>15 May</span><span>20 May</span><span>25 May</span><span>Today</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter pb-margin-desktop">
              {/* Recent Captures */}
              <div className="glass-panel p-6 rounded-[2rem] flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline-md text-primary text-2xl">Recent Captures</h3>
                  <a className="font-label-lg text-tertiary bg-white/50 px-4 py-2 rounded-full border border-glass-border hover:bg-white/80 transition-all shadow-sm" href="#">View All</a>
                </div>
                <div className="flex flex-col gap-4 overflow-y-auto max-h-[400px]">
                  {dashboardData?.recentCaptures?.length > 0 ? (
                    dashboardData.recentCaptures.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4 group bg-white/30 p-3 rounded-2xl border border-glass-border hover:bg-white/50 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-surface-container overflow-hidden shrink-0 shadow-inner relative">
                          <Image src={item.images?.[0] || "/ikat_saree.jpg"} alt={item.craftType} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-label-lg text-ink-charcoal truncate">{item.artisanProfile?.user?.name || "Unknown"}</h4>
                          <p className="font-label-sm text-outline truncate">{item.craftType}</p>
                        </div>
                        <div className={\`border px-3 py-1 rounded-full font-label-sm font-bold whitespace-nowrap shadow-sm \${item.status === 'FLAGGED' ? 'bg-rosy-pink/50 border-rosy-pink/70 text-tertiary' : 'bg-white/50 border-glass-border text-tertiary'}\`}>
                          {item.status.replace(/_/g, ' ')}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic text-sm">No recent captures.</p>
                  )}
                </div>
              </div>

              {/* Top Earners */}
              <div className="glass-panel p-6 rounded-[2rem] flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline-md text-primary text-2xl">Top Earners</h3>
                  <a className="font-label-lg text-tertiary bg-white/50 px-4 py-2 rounded-full border border-glass-border hover:bg-white/80 transition-all shadow-sm" href="#">Full Leaderboard</a>
                </div>
                <div className="flex flex-col gap-4">
                  {dashboardData?.leaderboard?.map((artisan: any, index: number) => (
                    <div key={artisan.id} className={\`flex items-center gap-4 p-3 rounded-2xl \${index === 0 ? 'bg-gradient-to-r from-zari-gold/20 to-transparent border border-zari-gold/30' : 'bg-white/20 border border-glass-border'}\`}>
                      <div className={\`w-10 h-10 rounded-full shadow-sm flex items-center justify-center font-label-lg shrink-0 \${index === 0 ? 'bg-tertiary shadow-lg text-white border-2 border-zari-gold' : 'bg-white/60 backdrop-blur-sm border border-glass-border text-tertiary'}\`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={\`font-label-lg text-ink-charcoal truncate \${index === 0 ? 'font-bold' : ''}\`}>{artisan.name}</h4>
                        <p className="font-label-sm text-outline">{artisan.totalItems} items</p>
                      </div>
                      <span className={\`font-headline-md text-xl \${index === 0 ? 'text-tertiary font-bold drop-shadow-sm' : 'text-outline'}\`}>
                        ₹{artisan.totalEarnings?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Security & Inventory */}
              <div className="flex flex-col gap-gutter">
                <div className="glass-panel p-6 rounded-[2rem] border border-rosy-pink/50 flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-rosy-pink/10"></div>
                  <div className="flex items-center gap-2 relative z-10">
                    <span className="material-symbols-outlined text-error drop-shadow-sm">security</span>
                    <h3 className="font-headline-md text-primary text-xl">Security Alerts</h3>
                  </div>
                  <p className="font-body-md text-outline relative z-10">{dashboardData?.alertCount || 0} recent alerts.</p>
                  <button className="w-full py-3 px-4 rounded-xl bg-tertiary text-white font-label-lg hover:shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-all mt-2 relative z-10">
                    Review All Alerts
                  </button>
                </div>
                
                <div className="glass-panel p-6 rounded-[2rem] flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-tertiary drop-shadow-sm">sell</span>
                    <h3 className="font-headline-md text-primary text-xl">Patch Inventory</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/30 p-4 rounded-2xl border border-glass-border">
                      <span className="font-label-sm text-outline uppercase tracking-widest block mb-1">Total Allocated</span>
                      <span className="font-headline-md text-ink-charcoal text-2xl font-bold">4,850</span>
                    </div>
                    <div className="bg-white/30 p-4 rounded-2xl border border-glass-border">
                      <span className="font-label-sm text-outline uppercase tracking-widest block mb-1">Issued</span>
                      <span className="font-headline-md text-ink-charcoal text-2xl font-bold">3,211</span>
                    </div>
                  </div>
                  <div className="bg-white/50 backdrop-blur-md border border-glass-border p-4 rounded-2xl mb-4 flex justify-between items-center shadow-inner">
                    <span className="font-label-lg text-tertiary font-bold">Available</span>
                    <span className="font-headline-md text-tertiary text-2xl drop-shadow-sm">1,639</span>
                  </div>
                  <div className="w-full h-3 bg-white/40 border border-glass-border rounded-full overflow-hidden mt-auto shadow-inner p-0.5">
                    <div className="h-full bg-tertiary w-[66%] rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/app/admin/dashboard/page.tsx', pageContent);
console.log("Updated Admin Dashboard page.");
