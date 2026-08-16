"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, Users, Package, Banknote, History, ShieldAlert, Tag, 
  Settings, UserCog, ScrollText, Search, Calendar, Download, Menu, Bell,
  TrendingUp, Activity, CheckCircle2, AlertTriangle, HelpCircle, LogOut
} from "lucide-react";
import Image from "next/image";
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer 
} from "recharts";

// Mock Data for Charts
const fairWageData = [
  { name: "Above Fair Floor", value: 58, color: "#10b981" },
  { name: "At Fair Floor", value: 34, color: "#34d399" },
  { name: "Below Fair Floor", value: 8, color: "#ef4444" },
];

const disbursementData = [
  { day: "1 May", amount: 200000 },
  { day: "5 May", amount: 450000 },
  { day: "10 May", amount: 380000 },
  { day: "15 May", amount: 820000 },
  { day: "20 May", amount: 1100000 },
  { day: "25 May", amount: 1482300 },
  { day: "31 May", amount: 1350000 },
];

export default function AdminDashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [saleModalItem, setSaleModalItem] = useState<any>(null);
  const [actualSalePrice, setActualSalePrice] = useState<string>("");
  const [isProcessingSale, setIsProcessingSale] = useState(false);

  useEffect(() => {
    fetchDashboardData();
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <aside className={`bg-[#123323] text-white transition-all duration-300 z-50 flex flex-col fixed inset-y-0 left-0 md:relative ${isSidebarOpen ? 'w-64' : 'w-0 md:w-20'} overflow-hidden shrink-0`}>
        <div className="h-16 flex items-center justify-center border-b border-white/10 px-4 whitespace-nowrap">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold">K</span>
          </div>
          <span className={`font-serif font-bold text-xl ml-3 tracking-tight transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>KARIGARI</span>
        </div>
        
        <div className="flex-grow overflow-y-auto py-6">
          <nav className="space-y-1 px-3">
            <NavItem icon={<LayoutDashboard />} label="Dashboard" active isOpen={isSidebarOpen} />
            <NavItem icon={<Users />} label="Artisans" isOpen={isSidebarOpen} />
            <NavItem icon={<Package />} label="Captures & Items" isOpen={isSidebarOpen} />
            <NavItem icon={<Banknote />} label="Advances" isOpen={isSidebarOpen} />
            <NavItem icon={<TrendingUp />} label="Sales" isOpen={isSidebarOpen} />
            <NavItem icon={<History />} label="Repayments" isOpen={isSidebarOpen} />
            <NavItem icon={<Tag />} label="Patch Inventory" isOpen={isSidebarOpen} />
            <NavItem icon={<ShieldAlert />} label="Counterfeit Alerts" isOpen={isSidebarOpen} badge="3" />
            
            <div className="pt-6 pb-2">
              <p className={`px-4 text-xs font-bold text-white/40 uppercase tracking-wider ${isSidebarOpen ? 'block' : 'hidden'}`}>System</p>
            </div>
            
            <NavItem icon={<Activity />} label="Reports & Analytics" isOpen={isSidebarOpen} />
            <NavItem icon={<Settings />} label="Cooperative Settings" isOpen={isSidebarOpen} />
            <NavItem icon={<UserCog />} label="Users & Roles" isOpen={isSidebarOpen} />
            <NavItem icon={<ScrollText />} label="Audit Log" isOpen={isSidebarOpen} href="/admin/audit-logs" />
          </nav>
        </div>
        
        <div className="p-4 border-t border-white/10 space-y-4">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-white/20 shrink-0 flex items-center justify-center font-bold text-sm">A</div>
            <div className={`overflow-hidden transition-all ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
              <p className="text-sm font-bold truncate">Admin User</p>
              <p className="text-xs text-white/60 truncate">Pochampally Coop</p>
            </div>
          </div>
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
      <main className="flex-grow flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-gray-900 transition-colors">
              <Menu size={24} />
            </button>
            
            <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white transition-all w-64 md:w-80">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input type="text" placeholder="Search artisans, captures, patches..." className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm ml-2 w-full placeholder:text-gray-400" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700">
              <Calendar size={16} className="text-gray-400" />
              May 1 - May 31, 2024
            </div>
            
            <button className="flex items-center gap-2 text-sm font-bold bg-primary hover:bg-primary-dark text-white px-4 py-1.5 rounded-md transition-colors shadow-sm">
              <Download size={16} />
              <span className="hidden sm:inline">Export Report</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
          
          <div className="mb-8">
            <h1 className="text-2xl font-serif font-bold text-gray-900">Welcome back, Admin 👋</h1>
            <p className="text-gray-500 mt-1">Here's what's happening in Pochampally Weavers Cooperative today.</p>
          </div>

          {/* 5 Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <AdminMetricCard title="Total Artisans" value={dashboardData ? dashboardData.totalArtisans.toString() : "..."} trend="+12" trendPositive />
            <AdminMetricCard title="Items Captured" value="612" trend="+45" trendPositive />
            <AdminMetricCard title="Advances Disbursed" value={dashboardData ? `₹${dashboardData.totalAdvances.toLocaleString()}` : "..."} trend="+15%" trendPositive />
            <AdminMetricCard title="Items Sold" value="325" trend="+24" trendPositive />
            <AdminMetricCard title="Fair Pay Compliance" value={dashboardData ? `${dashboardData.complianceRate}%` : "..."} trend="-1%" trendPositive={false} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Donut Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-gray-900">Fair Wage Compliance</h3>
                  <p className="text-xs text-gray-500">Overview of payouts vs fair floor</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <span className="font-bold text-green-600 text-sm">92%</span>
                </div>
              </div>
              
              <div className="flex-grow relative flex flex-col justify-center min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fairWageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {fairWageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => [`${value}%`, 'Share']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Custom Legend */}
                <div className="flex flex-col gap-2 mt-2">
                  {fairWageData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-gray-600 font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Line Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2 flex flex-col">
              <div className="mb-6">
                <h3 className="font-bold text-gray-900">Advance Disbursement Trend</h3>
                <p className="text-xs text-gray-500">Total volume disbursed over the month</p>
              </div>
              
              <div className="flex-grow min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={disbursementData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(value) => `₹${value >= 100000 ? (value/100000).toFixed(1) + 'L' : value}`}
                    />
                    <RechartsTooltip 
                      formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Disbursed']}
                      labelStyle={{ color: '#64748b', fontWeight: 'bold' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#1A4731" 
                      strokeWidth={3} 
                      dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                      activeDot={{ r: 6, fill: '#1A4731', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Data Grids Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Recent Captures */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-1 overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Recent Captures</h3>
                <Link href="#" className="text-xs text-primary font-bold hover:underline">View All</Link>
              </div>
              <div className="flex flex-col gap-3 flex-grow overflow-y-auto">
                {dashboardData?.recentCaptures?.length > 0 ? (
                  dashboardData.recentCaptures.map((item: any) => (
                    <MiniCaptureRow 
                      key={item.id}
                      id={item.id}
                      artisan={item.artisan?.name || "Unknown"} 
                      artisanImage={item.artisan?.profile?.photoUrl}
                      item={item.craftType} 
                      image={item.images?.[0]}
                      status={item.status} 
                      color={item.status === 'SOLD_FINAL' ? "bg-gray-100 text-gray-700" : item.status === 'ADVANCE_PAID' ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}
                      onClick={() => {
                        setSaleModalItem(item);
                        setActualSalePrice(item.standardMarketPrice?.toFixed(0) || item.marketPriceMax?.toFixed(0) || "5000");
                      }}
                      onSimulateSale={() => { 
                        setSaleModalItem(item); 
                        setActualSalePrice(item.standardMarketPrice?.toFixed(0) || item.marketPriceMax?.toFixed(0) || "5000"); 
                      }}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500 p-4">No recent captures found.</p>
                )}
              </div>
            </div>

            {/* Middle: Top Artisans */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-1 overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Top Earners</h3>
                <Link href="#" className="text-xs text-primary font-bold hover:underline">Full Leaderboard</Link>
              </div>
              <div className="flex flex-col gap-4 flex-grow overflow-y-auto">
                <LeaderboardRow rank={1} name="Sunita R." earnings="₹89,540" items={12} image="/female_artisan.jpg" />
                <LeaderboardRow rank={2} name="Ramesh D." earnings="₹84,200" items={15} />
                <LeaderboardRow rank={3} name="Laxmi S." earnings="₹76,800" items={9} />
                <LeaderboardRow rank={4} name="Krishna M." earnings="₹65,450" items={11} />
                <LeaderboardRow rank={5} name="Bhavani G." earnings="₹61,200" items={8} />
              </div>
            </div>

            {/* Right: Alerts & Inventory */}
            <div className="flex flex-col gap-6 lg:col-span-1">
              
              {/* Counterfeit Alerts */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <ShieldAlert size={18} className="text-red-500" />
                    Security Alerts
                  </h3>
                </div>
                <div className="flex flex-col gap-3">
                  <AlertRow icon={<AlertTriangle />} type="Duplicate Item" item="Ikat Saree #9F8X" severity="high" />
                  <AlertRow icon={<HelpCircle />} type="Patch Tampered" item="Silk Scarf #2B4C" severity="medium" />
                </div>
                <button className="mt-4 w-full text-center text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 py-2 rounded-lg transition-colors">
                  Review All Alerts
                </button>
              </div>

              {/* Patch Inventory */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Tag size={18} className="text-primary" />
                    Patch Inventory
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Allocated</p>
                    <p className="font-bold text-lg">4,850</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Issued</p>
                    <p className="font-bold text-lg">3,210</p>
                  </div>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-3 flex justify-between items-center mt-2 border border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Available</span>
                  <span className="font-bold text-lg text-primary">1,640</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4 overflow-hidden">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: '66%' }}></div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* Settle Transaction Modal */}
      {saleModalItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-fade-in-up p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Item Details</h3>
            <p className="text-sm text-gray-500 mb-6">Viewing lifecycle for {saleModalItem.craftType}.</p>

            {/* Audit Log Timeline Block */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6">
              <h4 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
                <History size={16} className="text-primary" /> Product Timeline
              </h4>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-[2px] before:bg-gray-200">
                {saleModalItem.auditLogs && saleModalItem.auditLogs.length > 0 ? (
                  saleModalItem.auditLogs.map((log: any) => (
                    <div key={log.id} className="relative flex items-start gap-4">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-blue-100 text-blue-500 shrink-0 z-10">
                        <CheckCircle2 size={12} />
                      </div>
                      <div className="pb-2">
                        <span className="font-bold text-xs text-gray-900">{log.action.replace(/_/g, ' ')}</span>
                        <time className="text-[10px] font-medium text-gray-500 block">
                          {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString()}
                        </time>
                        <p className="text-xs text-gray-600 mt-1">
                          {log.comments || `State updated to ${log.newState?.status || 'Unknown'}`}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic">No timeline events found.</p>
                )}
              </div>
            </div>
            
            {saleModalItem.status === 'ADVANCE_PAID' && (
              <>
                <h4 className="font-bold text-md text-gray-900 mb-3">Settle Transaction</h4>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <h4 className="text-sm font-bold text-green-900 mb-2 flex items-center gap-2"><TrendingUp size={16}/> ML Market Prediction</h4>
                  <div className="space-y-2 text-sm text-green-800">
                    <div className="flex justify-between"><span>Minimum Value</span><span className="font-mono">₹{saleModalItem.marketPriceMin?.toFixed(0) || '0'}</span></div>
                    <div className="flex justify-between font-bold border-b border-green-200/50 pb-2"><span>Expected (Standard)</span><span className="font-mono">₹{saleModalItem.standardMarketPrice?.toFixed(0) || saleModalItem.marketPriceMax?.toFixed(0) || '0'}</span></div>
                    <div className="flex justify-between pt-1"><span>Maximum Value</span><span className="font-mono">₹{saleModalItem.marketPriceMax?.toFixed(0) || '0'}</span></div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Final Sale Price (₹)</label>
                  <input 
                    type="number" 
                    value={actualSalePrice}
                    onChange={(e) => setActualSalePrice(e.target.value)}
                    placeholder="Enter final amount..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 mt-auto pt-4">
              <button onClick={() => setSaleModalItem(null)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors">Close</button>
              {saleModalItem.status === 'ADVANCE_PAID' && (
                <button onClick={handleSimulateSale} disabled={isProcessingSale || !actualSalePrice} className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex justify-center items-center">
                  {isProcessingSale ? <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span> : "Confirm Sale"}
                </button>
              )}
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
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
        active 
          ? 'bg-primary-light text-white font-medium' 
          : 'text-white/70 hover:bg-white/10 hover:text-white'
      } ${!isOpen && 'justify-center'}`}
      title={!isOpen ? label : undefined}
    >
      <div className={`${active ? 'text-white' : 'text-white/60 group-hover:text-white'} transition-colors shrink-0`}>
        {icon}
      </div>
      <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
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

function AdminMetricCard({ title, value, trend, trendPositive }: { title: string, value: string, trend: string, trendPositive: boolean }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <p className="text-xs font-medium text-gray-500 mb-2 truncate">{title}</p>
      <div className="flex items-end justify-between">
        <h3 className="text-xl lg:text-2xl font-bold text-gray-900">{value}</h3>
        <div className={`flex items-center text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-md ${
          trendPositive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
        }`}>
          {trend}
        </div>
      </div>
    </div>
  );
}

function MiniCaptureRow({ id, artisan, artisanImage, item, image, status, color, onClick, onSimulateSale }: { id?: string, artisan: string, artisanImage?: string, item: string, image?: string, status: string, color: string, onClick?: () => void, onSimulateSale?: () => void }) {
  return (
    <div onClick={onClick} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100 cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-200 shrink-0 overflow-hidden relative border border-gray-100">
          <Image src={image || "/ikat_saree.jpg"} alt="thumbnail" fill className="object-cover" />
        </div>
        <div className="flex items-center gap-2">
          {artisanImage && (
            <div className="w-6 h-6 rounded-full overflow-hidden relative border border-gray-200 hidden sm:block">
              <Image src={artisanImage} alt={artisan} fill className="object-cover" />
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-gray-900">{artisan}</p>
            <p className="text-xs text-gray-500 truncate w-24 sm:w-32">{item}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${color}`}>
          {status}
        </span>
        {status === 'ADVANCE_PAID' && onSimulateSale && (
          <button 
            onClick={(e) => { e.stopPropagation(); onSimulateSale(); }} 
            className="text-[10px] font-bold bg-primary hover:bg-primary-dark text-white px-2 py-1 rounded transition-colors shadow-sm whitespace-nowrap"
          >
            Simulate Sale
          </button>
        )}
      </div>
    </div>
  );
}

function LeaderboardRow({ rank, name, earnings, items, image }: { rank: number, name: string, earnings: string, items: number, image?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
        rank === 1 ? 'bg-yellow-100 text-yellow-700' : 
        rank === 2 ? 'bg-gray-100 text-gray-700' : 
        rank === 3 ? 'bg-orange-50 text-orange-700' : 'text-gray-400'
      }`}>
        {rank}
      </div>
      {image && (
        <div className="w-8 h-8 rounded-full overflow-hidden relative border border-gray-200 shrink-0">
          <Image src={image} alt={name} fill className="object-cover" />
        </div>
      )}
      <div className="flex-grow">
        <p className="text-sm font-bold text-gray-900">{name}</p>
        <p className="text-xs text-gray-500">{items} items</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-primary">{earnings}</p>
      </div>
    </div>
  );
}

function AlertRow({ icon, type, item, severity }: { icon: React.ReactNode, type: string, item: string, severity: 'high' | 'medium' }) {
  return (
    <div className={`p-3 rounded-xl border ${
      severity === 'high' ? 'bg-red-50/50 border-red-100' : 'bg-orange-50/50 border-orange-100'
    } flex gap-3 items-start`}>
      <div className={`mt-0.5 shrink-0 ${
        severity === 'high' ? 'text-red-500' : 'text-orange-500'
      }`}>
        {icon}
      </div>
      <div>
        <p className={`text-sm font-bold ${
          severity === 'high' ? 'text-red-900' : 'text-orange-900'
        }`}>{type}</p>
        <p className="text-xs text-gray-600 mt-0.5">{item}</p>
      </div>
    </div>
  );
}
