"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, Globe, ChevronDown, TrendingUp, Package, HandCoins, Banknote, MoreHorizontal, LogOut, X, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { CaptureModal } from "@/components/CaptureModal";
import { SellModal } from "@/components/SellModal";
import { ProfileEditorModal } from "@/components/ProfileEditorModal";
import { CrossCheckModal } from "@/components/CrossCheckModal";
import { DisputeModal } from "@/components/DisputeModal";
import { AgentHandoffModal } from "@/components/AgentHandoffModal";
import { useLanguage } from "@/lib/translations";

export default function ArtisanDashboard() {
  const router = useRouter();
  const { t, language, changeLanguage } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isCrossCheckModalOpen, setIsCrossCheckModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedSellItem, setSelectedSellItem] = useState<any>(null);
  const [selectedCrossCheckItem, setSelectedCrossCheckItem] = useState<any>(null);
  const [selectedDisputeItem, setSelectedDisputeItem] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/artisan/dashboard', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setDashboardData(data.data);
      } else {
        console.error("Dashboard API failed", data.error);
        if (data.status === 401 || data.status === 403) {
          router.push('/login');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (e) {
      console.error(e);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    fetchDashboardData(); // Refresh data after capture
  };

  const handleSellModalClose = () => {
    setIsSellModalOpen(false);
    setSelectedSellItem(null);
    fetchDashboardData(); // Refresh data after sell
  };

  const flaggedItems = dashboardData?.recentCaptures?.filter((item: any) => item.status === 'FLAGGED' || item.status === 'REPORTED') || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg leading-none">K</span>
              </div>
              <span className="font-serif font-bold text-xl tracking-tight text-primary hidden sm:block">KARIGARI</span>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              {/* Language Selector */}
              <div className="relative group cursor-pointer">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  <Globe size={16} />
                  <span className="uppercase">{language}</span>
                  <ChevronDown size={14} />
                </div>
                <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <button onClick={() => changeLanguage('en')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-t-xl">English</button>
                  <button onClick={() => changeLanguage('hi')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50">हिन्दी</button>
                  <button onClick={() => changeLanguage('or')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50">ଓଡ଼ିଆ</button>
                  <button onClick={() => changeLanguage('te')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-b-xl">తెలుగు</button>
                </div>
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <Bell size={20} />
                  {flaggedItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                      <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                    </div>
                    {flaggedItems.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto">
                        {flaggedItems.map((item: any) => (
                          <div key={item.id} className="p-3 border-b border-gray-50 hover:bg-red-50 transition-colors cursor-pointer text-sm">
                            <p className="font-bold text-red-600 mb-1">Attention Required</p>
                            <p className="text-gray-700">Your item <strong>{item.craftType}</strong> ({item.patchId || item.id.substring(0,8)}) has been flagged.</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No new notifications.
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="relative border-l border-gray-200 pl-4">
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-bold text-gray-900">{t('welcome')}, {dashboardData?.artisanName || 'Artisan'} 👋</p>
                    <p className="text-xs text-gray-500">Pochampally Coop</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-primary-light/20 flex items-center justify-center text-primary font-bold overflow-hidden border border-gray-200">
                     <Image src={dashboardData?.artisanProfile?.photoUrl || "/female_artisan.jpg"} alt="Profile" width={36} height={36} className="object-cover" />
                  </div>
                </div>

                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        setIsProfileEditorOpen(true);
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 border-b border-gray-50"
                    >
                      Edit Profile & Settings
                    </button>
                    <button 
                      onClick={handleLogout} 
                      className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Banner */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="font-bold text-green-900">You have 2 new recommendations</p>
              <p className="text-sm text-green-700">Check the best options for your new captures.</p>
            </div>
          </div>
          <button className="whitespace-nowrap bg-white text-green-700 border border-green-200 hover:bg-green-100 px-4 py-2 rounded-full text-sm font-bold transition-colors">
            View Now
          </button>
        </div>

        {/* Action Bar */}
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-gray-900">{t('dashboard_title')}</h1>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard title="My Captures" value={dashboardData ? dashboardData.myCapturesCount.toString() : "..."} icon={<Package />} trend="+2" />
          <MetricCard title="Advances Received" value={dashboardData ? `₹${dashboardData.totalAdvances.toLocaleString()}` : "..."} icon={<Banknote />} trend="+15%" />
          <MetricCard title="Items Sold" value={dashboardData ? dashboardData.itemsSold.toString() : "..."} icon={<HandCoins />} trend="+1" />
          <MetricCard title={t('total_earnings')} value={dashboardData ? `₹${dashboardData.totalEarnings.toLocaleString()}` : "..."} icon={<TrendingUp />} trend="+22%" />
        </div>

        {/* Recent Captures Table */}
        <div className="flex justify-between items-end mb-4 mt-12">
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900">{t('my_uploaded_works')}</h2>
            <p className="text-gray-500 mt-1">Manage and track your recent craft captures.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2 animate-pulse-soft"
          >
            {t('capture_new_craft')}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Item</th>
                  <th className="px-6 py-4 font-medium">Capture ID</th>
                  <th className="px-6 py-4 font-medium">{t('date')}</th>
                  <th className="px-6 py-4 font-medium">{t('status')}</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dashboardData?.recentCaptures?.length > 0 ? (
                  dashboardData.recentCaptures.map((item: any) => {
                    let color = "bg-green-100 text-green-700";
                    if (item.status === 'PENDING_DISBURSEMENT') color = "bg-yellow-100 text-yellow-800";
                    if (item.status === 'ADVANCE_PAID') color = "bg-blue-100 text-blue-700";
                    if (item.status === 'SOLD_FINAL' || item.status === 'SOLD_MIDDLEMAN') color = "bg-gray-100 text-gray-700";

                    return (
                      <TableRow 
                        key={item.id}
                        title={item.craftType} 
                        id={item.patchId || item.id.substring(0,8).toUpperCase()} 
                        date={new Date(item.createdAt).toLocaleDateString()} 
                        status={item.status} 
                        statusColor={color} 
                        image={item.images?.[0] || "/ikat_saree.jpg"}
                        onView={() => setSelectedItem(item)}
                        onSell={() => {
                          setSelectedItem(item);
                          setIsSellModalOpen(true);
                        }}
                        onCrossCheck={() => {
                          setSelectedItem(item);
                          setIsCrossCheckModalOpen(true);
                        }}
                        onDispute={() => {
                          setSelectedItem(item);
                          setIsDisputeModalOpen(true);
                        }}
                      />
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No recent captures found. Click 'Capture New Craft' to begin!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <CaptureModal isOpen={isModalOpen} onClose={handleModalClose} />
      <AgentHandoffModal 
        isOpen={isSellModalOpen || isCrossCheckModalOpen} 
        onClose={() => {
          setIsSellModalOpen(false);
          setIsCrossCheckModalOpen(false);
          fetchDashboardData();
        }} 
        item={selectedItem} 
      />
      <DisputeModal 
        isOpen={isDisputeModalOpen} 
        onClose={() => setIsDisputeModalOpen(false)} 
        item={selectedDisputeItem} 
      />
      <ProfileEditorModal 
        isOpen={isProfileEditorOpen} 
        onClose={() => setIsProfileEditorOpen(false)} 
        artisanData={dashboardData?.artisanProfile} 
        onSaved={fetchDashboardData} 
      />
      {selectedItem && (
        <DetailsModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </div>
  );
}

function MetricCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-xl bg-gray-50 text-primary flex items-center justify-center">
          {icon}
        </div>
        <div className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
          <TrendingUp size={12} className="mr-1" />
          {trend}
        </div>
      </div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  );
}

function TableRow({ title, id, date, status, statusColor, image, onView, onSell, onCrossCheck, onDispute }: { title: string, id: string, date: string, status: string, statusColor: string, image: string, onView: () => void, onSell: () => void, onCrossCheck: () => void, onDispute?: () => void }) {
  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative">
            <Image src={image} alt={title} fill className="object-cover" />
          </div>
          <span className="font-bold text-gray-900 text-sm">{title}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm font-mono text-gray-500">{id}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{date}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
          {status.replace(/_/g, ' ')}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {status === 'VERIFIED' && (
            <button 
              onClick={onCrossCheck}
              className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-full transition-colors whitespace-nowrap shadow-sm"
            >
              Initiate Agent Handoff
            </button>
          )}
          {status === 'PENDING_VERIFICATION' && (
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full flex items-center gap-1 border border-orange-200 whitespace-nowrap">
              <ShieldAlert size={14} /> Pending Admin
            </span>
          )}
          {status === 'FLAGGED' && (
            <button 
              onClick={onDispute}
              className="text-sm font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-full transition-colors whitespace-nowrap shadow-sm"
            >
              Review Counterfeit
            </button>
          )}
          <button 
            onClick={onView}
            className="text-sm font-bold text-primary border border-primary hover:bg-primary-light/10 px-4 py-1.5 rounded-full transition-colors whitespace-nowrap"
          >
            View Details
          </button>
        </div>
      </td>
    </tr>
  );
}

function DetailsModal({ item, onClose }: { item: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-serif font-bold text-lg text-primary">Transaction Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-gray-100 border border-gray-200">
            <Image src={item.images?.[0] || "/ikat_saree.jpg"} alt="Item" fill className="object-cover" />
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              ID: {item.patchId || item.id.substring(0,8).toUpperCase()}
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-1">{item.craftType}</h3>
          <p className="text-gray-600 text-sm mb-6">{item.descriptionEnglish}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Status</span>
              <span className="font-medium text-gray-800">{item.status.replace(/_/g, ' ')}</span>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <span className="text-xs text-green-600 font-bold uppercase tracking-wider block mb-1">Advance Received</span>
              <span className="font-bold text-xl text-green-700">₹{item.advancePaid?.toLocaleString() || 0}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm py-2 border-b border-gray-100">
              <span className="text-gray-500">Total Valuation Band</span>
              <span className="font-medium">₹{item.marketPriceMin?.toLocaleString()} - ₹{item.marketPriceMax?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-gray-100">
              <span className="text-gray-500">Labor Days</span>
              <span className="font-medium">{item.laborDays} Days</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-gray-500">Material Cost</span>
              <span className="font-medium">₹{item.rawMaterialCost?.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-full transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
