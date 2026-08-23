"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, Users, Package, Banknote, History, ShieldAlert, Tag, 
  Settings, UserCog, ScrollText, Search, Calendar, Download, Menu, Bell,
  TrendingUp, Activity, CheckCircle2, AlertTriangle, HelpCircle, LogOut, Clock, ShieldCheck
} from "lucide-react";
import Image from "next/image";
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer 
} from "recharts";
import { StatCard } from "@/components/ui/StatCard";
import { KarigariLogo } from "@/components/ui/KarigariLogo";

export default function AdminDashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [saleModalItem, setSaleModalItem] = useState<any>(null);
  const [actualSalePrice, setActualSalePrice] = useState<string>("");
  const [isProcessingSale, setIsProcessingSale] = useState(false);

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

  const handleSimulateSale = async () => {
    if (!saleModalItem || !actualSalePrice) return;
    setIsProcessingSale(true);
    try {
      const res = await fetch('/api/admin/simulate-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          itemId: saleModalItem.id,
          actualSalePrice: parseFloat(actualSalePrice)
        })
      });
      if (res.ok) {
        setSaleModalItem(null);
        setActualSalePrice("");
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingSale(false);
    }
  };

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <p className="text-gray-500 font-medium">Loading Dashboard Data...</p>
      </div>
    );
  }

  const handleBatchApprove = async (artisanId: string) => {
    const itemsToApprove = dashboardData?.pendingCaptures
      ?.filter((item: any) => item.artisanId === artisanId)
      ?.map((item: any) => item.id);

    if (!itemsToApprove || itemsToApprove.length === 0) return;

    try {
      const res = await fetch('/api/admin/verify-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: itemsToApprove })
      });
      if (res.ok) {
        fetchDashboardData();
        alert("Batch Approved Successfully!");
      } else {
        const err = await res.json();
        alert("Failed to approve: " + err.error);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex">
      {/* Sidebar Navigation */}
      <aside className={`bg-[var(--color-sidebar)] text-white transition-all duration-300 z-50 flex flex-col fixed inset-y-0 left-0 md:relative ${isSidebarOpen ? 'w-64' : 'w-0 md:w-20'} overflow-hidden shrink-0`}>
        <div className="h-16 flex items-center px-4 border-b border-white/10 shrink-0">
          <KarigariLogo variant="light" showWordmark={isSidebarOpen} size={32} />
        </div>
        
        <div className="flex-grow overflow-y-auto py-6">
          <nav className="space-y-1 px-3">
            <NavItem icon={<LayoutDashboard />} label="Dashboard" active isOpen={isSidebarOpen} href="/admin/dashboard" />
            <NavItem icon={<Users />} label="User Management" isOpen={isSidebarOpen} href="/admin/users" />
            <NavItem icon={<Package />} label="Verify Batch" isOpen={isSidebarOpen} href="/admin/verify" />
            <NavItem 
              icon={<ShieldAlert />} 
              label="Counterfeit Alerts" 
              isOpen={isSidebarOpen} 
              badge={dashboardData?.alertCount > 0 ? dashboardData.alertCount.toString() : undefined} 
              href="/admin/alerts"
            />
            
            <div className="pt-6 pb-2">
              <p className={`px-4 text-xs font-bold text-white/40 uppercase tracking-wider ${isSidebarOpen ? 'block' : 'hidden'}`}>System</p>
            </div>
            
            <NavItem icon={<ScrollText />} label="Audit Log" isOpen={isSidebarOpen} href="/admin/audit-logs" />
          </nav>
        </div>
        
        <div className="p-4 border-t border-white/10 space-y-4">
          <button 
            onClick={() => {
              document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              window.location.href = '/login';
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-white/70 hover:bg-red-500/20 hover:text-red-400 ${!isSidebarOpen && 'justify-center'}`}
            title={!isSidebarOpen ? "Logout" : undefined}
          >
            <LogOut size={20} className="shrink-0" />
            <span className={`whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0 overflow-hidden bg-white md:bg-[var(--color-background)] rounded-l-3xl shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.1)] z-10 md:m-2 md:rounded-2xl border border-gray-100">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 z-10 shrink-0 mb-4 pt-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-gray-900 transition-colors">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-serif font-bold text-gray-900 hidden sm:block">Admin Dashboard</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-gray-100/50 rounded-full px-4 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white transition-all w-64 md:w-80">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input type="text" placeholder="Search registry..." className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm ml-2 w-full placeholder:text-gray-400" />
            </div>

            <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-gray-600">
              <Calendar size={16} /> {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            
            <div className="relative cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors">
              <Bell size={20} className="text-gray-600" />
              {dashboardData?.alertCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 border border-white rounded-full"></span>
              )}
            </div>

            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
              <Image src="/female_artisan.jpg" alt="Admin" width={32} height={32} className="object-cover" />
            </div>

            <button className="flex items-center gap-2 text-sm font-bold bg-[#1A1A1A] hover:bg-black text-white px-4 py-2 rounded-md transition-colors shadow-sm ml-2">
              <span className="hidden sm:inline">Export Report</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <p className="text-gray-500 mb-6 -mt-4">Welcome back. Here is the daily summary of the registry and artisan activities.</p>
          
          {/* 4 Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard 
              label="Total Artisans" 
              value={dashboardData ? dashboardData.totalArtisans.toLocaleString() : "..."} 
              icon={<Users size={20} />}
              accentColor="teal"
            />
            <StatCard 
              label="Items Captured" 
              value={dashboardData ? (dashboardData.itemsCaptured >= 1000 ? `\${(dashboardData.itemsCaptured / 1000).toFixed(1)}k` : dashboardData.itemsCaptured) : "..."} 
              icon={<Package size={20} />}
              accentColor="orange"
            />
            <StatCard 
              label="Advances Disbursed" 
              value={dashboardData ? `₹\${(dashboardData.totalAdvances / 100000).toFixed(1)}L` : "..."} 
              icon={<Banknote size={20} />}
              accentColor="blue"
            />
            <StatCard 
              label="Items Sold" 
              value={dashboardData ? dashboardData.itemsSold.toLocaleString() : "..."} 
              icon={<Package size={20} />}
              accentColor="brown"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Donut Chart - Regional Health */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 lg:col-span-1 flex flex-col h-[350px]">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-serif font-bold text-gray-900">Regional Economic Health</h3>
                <MoreHorizontalIcon />
              </div>
              <div className="flex-grow relative flex flex-col justify-center py-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData?.fairWageData || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {(dashboardData?.fairWageData || []).map((entry: any, index: number) => (
                        <Cell key={`cell-\${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                  <span className="text-2xl font-bold text-gray-900">{dashboardData?.complianceRate || 45}%</span>
                  <span className="text-xs text-gray-500 font-medium text-center leading-tight">Rajasthan<br/>Cluster A</span>
                </div>
              </div>
              {/* Simple Legend */}
              <div className="flex justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#1A4731]"></div><span className="text-xs text-gray-500">Rajasthan</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#34d399]"></div><span className="text-xs text-gray-500">Gujarat</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#d1fae5]"></div><span className="text-xs text-gray-500">U.P.</span></div>
              </div>
            </div>

            {/* Middle & Right Column Container */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Advance Disbursement Trend */}
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 flex flex-col h-[350px]">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-serif font-bold text-gray-900 leading-tight">Advance<br/>Disbursement Trend</h3>
                  <div className="flex bg-gray-100 rounded-full p-0.5 mt-1 shrink-0">
                    <button className="px-3 py-1 text-xs font-medium text-gray-500 rounded-full">1M</button>
                    <button className="px-3 py-1 text-xs font-bold text-white bg-[#1A1A1A] rounded-full shadow">6M</button>
                    <button className="px-3 py-1 text-xs font-medium text-gray-500 rounded-full">1Y</button>
                  </div>
                </div>
                
                <div className="flex-grow w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData?.disbursementData || []} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={false} />
                      <RechartsTooltip />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#1A4731" 
                        strokeWidth={4} 
                        dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#1A4731' }} 
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right Col: Top Earners */}
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 flex flex-col h-[350px] overflow-hidden">
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-6">Top Earners</h3>
                <div className="flex flex-col gap-5 flex-grow overflow-y-auto pr-2">
                  {dashboardData?.leaderboard?.length > 0 ? (
                    dashboardData.leaderboard.map((artisan: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                            {artisan.image ? <Image src={artisan.image} alt={artisan.name} width={40} height={40} className="object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">{artisan.name[0]}</div>}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{artisan.name}</p>
                            <p className="text-xs text-gray-500">{artisan.craft || 'Textiles'} · {artisan.location || 'India'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">₹{artisan.earnings.toLocaleString()}</p>
                          <p className={`text-xs \${idx === 2 ? 'text-red-500' : 'text-green-500'}`}>{idx === 2 ? '-2%' : '+4%'}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No data available</div>
                  )}
                </div>
                <button className="w-full text-center text-xs font-bold text-gray-600 pt-4 mt-2 border-t border-gray-100">
                  View All Artisans
                </button>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              {/* Recent Captures */}
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-serif font-bold text-gray-900">Recent Captures</h3>
                  <button className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-md text-xs font-medium text-gray-700">
                    <FilterIcon /> Filter
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        <th className="pb-3 font-medium">Item ID</th>
                        <th className="pb-3 font-medium">Artisan</th>
                        <th className="pb-3 font-medium">Craft</th>
                        <th className="pb-3 font-medium">Date Captured</th>
                        <th className="pb-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData?.recentCaptures?.length > 0 ? (
                        dashboardData.recentCaptures.slice(0,5).map((item: any, idx: number) => (
                          <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer">
                            <td className="py-4 text-xs font-mono text-gray-500">#{item.id.substring(0,8)}</td>
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-gray-200 overflow-hidden">
                                  {item.artisan?.profile?.photoUrl ? <Image src={item.artisan.profile.photoUrl} alt="" width={24} height={24} className="object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-gray-500">{item.artisan?.name?.[0] || 'A'}</div>}
                                </div>
                                <span className="text-sm font-medium text-gray-900">{item.artisan?.name || "Unknown"}</span>
                              </div>
                            </td>
                            <td className="py-4 text-sm text-gray-600">{item.craftType}</td>
                            <td className="py-4 text-sm text-gray-600">{new Date(item.createdAt).toLocaleString('en-US', {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}</td>
                            <td className="py-4">
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap \${
                                item.status === 'SOLD_FINAL' ? "bg-gray-100 text-gray-700 border border-gray-200" : 
                                item.status === 'FLAGGED' ? "bg-red-50 text-red-600 border border-red-100" : 
                                "bg-gray-100 text-gray-600"
                              }`}>
                                {item.status === 'FLAGGED' ? '⚑ Flagged' : item.status.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5} className="py-4 text-center text-sm text-gray-500">No recent captures found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <button className="w-full text-center text-xs font-bold text-gray-600 pt-4 mt-4 border-t border-gray-100 flex items-center justify-center gap-1">
                  Load More <ChevronDownIcon />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:col-span-1">
              {/* Security Alerts */}
              <div className="bg-red-50/50 rounded-2xl shadow-sm border border-red-100 p-6">
                <h3 className="text-md font-serif font-bold text-red-900 mb-4 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  Security Alerts
                </h3>
                <div className="flex flex-col gap-3">
                  <div className="bg-white rounded-lg p-3 flex gap-3 shadow-sm items-start border border-red-50">
                    <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">Duplicate NFC Tag Detected</p>
                      <p className="text-[10px] text-gray-500 mt-1">Batch #4492 • 10 mins ago</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 flex gap-3 shadow-sm items-start border border-red-50">
                    <ShieldAlert size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">Geofence Violation</p>
                      <p className="text-[10px] text-gray-500 mt-1">Scanner ID: SC-882 • 1 hr ago</p>
                    </div>
                  </div>
                </div>
                <button className="mt-4 text-xs font-bold text-red-600 flex items-center gap-1 hover:underline">
                  Review Log &rarr;
                </button>
              </div>

              {/* Patch Inventory */}
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                <h3 className="text-md font-serif font-bold text-gray-900 mb-4">Patch Inventory</h3>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-500">Global Stock</span>
                  <span className="font-bold">14,200 / 20,000</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full mb-6">
                  <div className="bg-[#1A4731] h-1.5 rounded-full" style={{width: '71%'}}></div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Hub North</span>
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200">Healthy</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Hub South</span>
                    <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100">Low Stock</span>
                  </div>
                </div>
              </div>
              
              {/* Community Breakdown - SIH26090 */}
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                <h3 className="text-md font-serif font-bold text-gray-900 mb-4">Community Breakdown (MoSJE)</h3>
                <div className="space-y-3">
                  <DemoBar label="SC" value={42} color="bg-orange-500" />
                  <DemoBar label="ST" value={18} color="bg-blue-500" />
                  <DemoBar label="OBC" value={35} color="bg-teal-500" />
                  <DemoBar label="EWS" value={15} color="bg-yellow-500" />
                  <DemoBar label="Gen" value={12} color="bg-gray-400" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Settle Transaction Modal (Keep existing logic) */}
      {saleModalItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-fade-in-up p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Item Details</h3>
            <p className="text-sm text-gray-500 mb-6">Viewing lifecycle for {saleModalItem.craftType}.</p>
            {/* Keeping modal logic... */}
            <div className="flex gap-3 mt-auto pt-4">
              <button onClick={() => setSaleModalItem(null)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function NavItem({ icon, label, active = false, isOpen, badge, href = "#" }: { icon: React.ReactNode, label: string, active?: boolean, isOpen: boolean, badge?: string, href?: string }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group \${
        active 
          ? 'bg-[#2D5016] text-white font-medium' 
          : 'text-white/70 hover:bg-white/10 hover:text-white'
      } \${!isOpen && 'justify-center'}`}
      title={!isOpen ? label : undefined}
    >
      <div className={`\${active ? 'text-white' : 'text-white/60 group-hover:text-white'} transition-colors shrink-0`}>
        {icon}
      </div>
      <span className={`whitespace-nowrap transition-all duration-300 \${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
        {label}
      </span>
      {badge && isOpen && (
        <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      {badge && !isOpen && (
        <span className="absolute right-2 top-2 w-2 h-2 rounded-full bg-red-500"></span>
      )}
    </Link>
  );
}

function DemoBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-8 font-bold text-gray-600">{label}</span>
      <div className="flex-grow bg-gray-100 h-2 rounded-full overflow-hidden">
        <div className={`\${color} h-full rounded-full`} style={{ width: `\${value}%` }}></div>
      </div>
      <span className="w-8 text-right font-medium text-gray-500">{value}%</span>
    </div>
  );
}

function MoreHorizontalIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>;
}
function FilterIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
}
function ChevronDownIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
}
