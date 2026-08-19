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
    // Live Polling every 15 seconds for notifications
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

  const handleBatchApprove = async (artisanId: string) => {
    // Find all pending item IDs for this artisan
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
        console.error("API error:", err);
        alert("Failed to approve: " + err.error);
      }
    } catch (e: any) {
      console.error('Failed to batch approve', e);
      alert("Error: " + e.message);
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
            
            <div className="relative cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors">
              <Bell size={20} className="text-gray-600" />
              {dashboardData?.alertCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
              )}
            </div>

            <button className="flex items-center gap-2 text-sm font-bold bg-primary hover:bg-primary-dark text-white px-4 py-1.5 rounded-md transition-colors shadow-sm ml-2">
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
            <AdminMetricCard title="Items Captured" value={dashboardData ? dashboardData.itemsCaptured.toString() : "..."} trend="+45" trendPositive />
            <AdminMetricCard title="Advances Disbursed" value={dashboardData ? `₹${dashboardData.totalAdvances.toLocaleString()}` : "..."} trend="+15%" trendPositive />
            <AdminMetricCard title="Items Sold" value={dashboardData ? dashboardData.itemsSold.toString() : "..."} trend="+24" trendPositive />
            <AdminMetricCard title="Regional Econ Health" value={dashboardData ? `${dashboardData.complianceRate}%` : "..."} trend="-1%" trendPositive={false} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Donut Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-gray-900">Regional Economic Health</h3>
                  <p className="text-xs text-gray-500">Average Final Price vs AI Fair Wage Floor</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary text-sm">{dashboardData?.complianceRate || 0}%</span>
                </div>
              </div>
              
              <div className="flex-grow relative flex flex-col justify-center min-h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData?.fairWageData || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={4}
                    >
                      {(dashboardData?.fairWageData || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => [`${value}%`, 'Share']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-10">
                  <span className="text-3xl font-black text-gray-800">{dashboardData?.complianceRate || 0}%</span>
                  <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Health</span>
                </div>
                
                {/* Custom Legend */}
                <div className="flex flex-col gap-2 mt-2">
                  {(dashboardData?.fairWageData || []).map((item: any, i: number) => (
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
                  <LineChart data={dashboardData?.disbursementData || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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

          {/* Pending Approvals Row (New Feature) */}
          {dashboardData?.pendingCaptures?.length > 0 && (
            <div className="mb-8 bg-white rounded-2xl shadow-sm border border-yellow-200 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <ShieldAlert size={18} className="text-yellow-500" />
                    Pending AI-Filtered Approvals
                  </h3>
                  <p className="text-xs text-gray-500">These items passed the AI Anomaly Check and require final Admin verification.</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {/* Group pending captures by artisan */}
                {Object.entries(
                  dashboardData.pendingCaptures.reduce((acc: any, item: any) => {
                    if (!acc[item.artisanId]) acc[item.artisanId] = { artisan: item.artisan, items: [] };
                    acc[item.artisanId].items.push(item);
                    return acc;
                  }, {})
                ).map(([artisanId, data]: any) => (
                  <div key={artisanId} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <Image src={data.artisan?.profile?.photoUrl || "/female_artisan.jpg"} alt={data.artisan?.name || "Unknown Artisan"} width={32} height={32} className="rounded-full object-cover" />
                        <h4 className="font-bold text-gray-800">{data.artisan?.name || "Unknown Artisan"}</h4>
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-bold">{data.items.length} Pending</span>
                      </div>
                      <button 
                        onClick={() => handleBatchApprove(artisanId)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1.5 px-4 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 size={14} /> Batch Approve
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {data.items.map((item: any) => (
                        <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-100 flex gap-3 shadow-sm items-center">
                          <Image src={item.images?.[0] || "/ikat_saree.jpg"} alt={item.craftType} width={40} height={40} className="rounded-md object-cover" />
                          <div>
                            <p className="text-xs font-bold text-gray-900">{item.craftType}</p>
                            <p className="text-[10px] text-gray-500">Labor: {item.laborDays} days | Mat: ₹{item.rawMaterialCost}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* At Risk Artisans Row */}
          {dashboardData?.atRiskArtisans?.length > 0 && (
            <div className="mb-8 bg-white rounded-2xl shadow-sm border border-red-200 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <ShieldAlert size={18} className="text-red-500" />
                    At-Risk Artisans (Counterfeit Alerts)
                  </h3>
                  <p className="text-xs text-gray-500">These artisans have a Health Score below 65% and are eligible for a ban.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.atRiskArtisans.map((artisan: any) => (
                  <div key={artisan.id} className="bg-red-50 rounded-xl p-4 border border-red-100 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Image src={artisan.artisanProfile?.photoUrl || "/female_artisan.jpg"} alt={artisan.name} width={40} height={40} className="rounded-full object-cover" />
                        <div>
                          <h4 className="font-bold text-gray-800">{artisan.name}</h4>
                          <p className="text-xs text-gray-500">{artisan.email}</p>
                        </div>
                      </div>
                      <div className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-md">
                        {artisan.artisanProfile?.healthScore}% Health
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                        if (confirm(`Are you sure you want to ban ${artisan.name}? This action is permanent.`)) {
                          try {
                            const res = await fetch('/api/admin/ban-artisan', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ artisanId: artisan.id })
                            });
                            const data = await res.json();
                            if (res.ok) {
                              alert(data.message);
                              fetchDashboardData();
                            } else {
                              alert(data.error);
                            }
                          } catch (e) {
                            alert('Error banning artisan');
                          }
                        }
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      Ban Artisan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                {dashboardData?.leaderboard?.length > 0 ? (
                  dashboardData.leaderboard.map((artisan: any, index: number) => (
                    <LeaderboardRow 
                      key={artisan.id} 
                      rank={index + 1} 
                      name={artisan.name} 
                      earnings={`₹${artisan.earnings.toLocaleString()}`} 
                      items={artisan.items} 
                      image={artisan.image} 
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No data available.</p>
                )}
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
                  {dashboardData?.alerts?.length > 0 ? (
                    dashboardData.alerts.slice(0,3).map((alert: any) => (
                      <AlertRow 
                        key={alert.id} 
                        icon={<AlertTriangle />} 
                        type={alert.status === 'FLAGGED' ? "Counterfeit Alert" : (alert.failedScanCount > 0 ? "Resolved Incident" : "Fairness Alert")} 
                        item={`${alert.craftType} #${alert.id.substring(0,4)}`} 
                        severity={alert.status === 'FLAGGED' ? "high" : "medium"} 
                      />
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No recent alerts.</p>
                  )}
                </div>
                <Link href="/admin/alerts" className="mt-4 block w-full text-center text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 py-2 rounded-lg transition-colors">
                  Review All Alerts
                </Link>
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
                    <p className="font-bold text-lg">{dashboardData ? (dashboardData.patchBankBalance + dashboardData.patchBankIssued).toLocaleString() : "..."}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Issued</p>
                    <p className="font-bold text-lg">{dashboardData ? dashboardData.patchBankIssued.toLocaleString() : "..."}</p>
                  </div>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-3 flex justify-between items-center mt-2 border border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Available</span>
                  <span className="font-bold text-lg text-primary">{dashboardData ? dashboardData.patchBankBalance.toLocaleString() : "..."}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4 overflow-hidden">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: dashboardData ? `${Math.round((dashboardData.patchBankIssued / Math.max(1, (dashboardData.patchBankBalance + dashboardData.patchBankIssued))) * 100)}%` : '0%' }}></div>
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
                  saleModalItem.auditLogs.map((log: any) => {
                    let icon = <Clock size={12} />;
                    let colorClass = "bg-gray-100 text-gray-500 border-white";
                    
                    if (log.action.includes('CAPTURE')) {
                      icon = <ScrollText size={12} />;
                      colorClass = "bg-blue-100 text-blue-500 border-white";
                    } else if (log.action.includes('VERIFIED')) {
                      icon = <ShieldCheck size={12} />;
                      colorClass = "bg-green-100 text-green-500 border-white";
                    } else if (log.action.includes('SOLD_FINAL') || log.action.includes('DISBURSEMENT') || log.action.includes('UPI_PAYMENT')) {
                      icon = <Banknote size={12} />;
                      colorClass = "bg-green-100 text-green-600 border-white";
                    } else if (log.action.includes('AGENT_HANDOFF')) {
                      icon = <CheckCircle2 size={12} />;
                      colorClass = "bg-purple-100 text-purple-500 border-white";
                    } else if (log.action.includes('FLAGGED')) {
                      icon = <AlertTriangle size={12} />;
                      colorClass = "bg-red-100 text-red-500 border-white";
                    }

                    return (
                      <div key={log.id} className="relative flex items-start gap-4">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 shrink-0 z-10 ${colorClass}`}>
                          {icon}
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
                    );
                  })
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
