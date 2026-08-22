"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Bell, Globe, ChevronDown, TrendingUp, Package, HandCoins, Banknote, 
  MoreHorizontal, LogOut, X, ShieldAlert, ShieldCheck, MapPin, Award, 
  Camera, FileText, ArrowRightCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CaptureModal } from "@/components/CaptureModal";
import { SellModal } from "@/components/SellModal";
import { ProfileEditorModal } from "@/components/ProfileEditorModal";
import { CrossCheckModal } from "@/components/CrossCheckModal";
import { DisputeModal } from "@/components/DisputeModal";
import { AgentHandoffModal } from "@/components/AgentHandoffModal";
import { useLanguage } from "@/lib/translations";
import { StatCard } from "@/components/ui/StatCard";
import { KarigariLogo } from "@/components/ui/KarigariLogo";

export default function ArtisanDashboard() {
  const router = useRouter();
  const { t, language, changeLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState("workshop");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isCrossCheckModalOpen, setIsCrossCheckModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedSellItem, setSelectedSellItem] = useState<any>(null);
  const [selectedCrossCheckItem, setSelectedCrossCheckItem] = useState<any>(null);
  const [selectedDisputeItem, setSelectedDisputeItem] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/artisan/dashboard', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setDashboardData(data.data);
      } else {
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
    fetchDashboardData();
  };

  const flaggedItems = dashboardData?.recentCaptures?.filter((item: any) => item.status === 'FLAGGED' || item.status === 'REPORTED') || [];
  const healthScore = Math.max(0, 100 - (flaggedItems.length * 15));

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-12">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <KarigariLogo variant="dark" showWordmark={true} size={32} />
          
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => setActiveTab('workshop')} className={\`text-sm font-bold pb-4 -mb-4 border-b-2 transition-colors \${activeTab === 'workshop' ? 'border-[#1A4731] text-[#1A4731]' : 'border-transparent text-gray-500 hover:text-gray-900'}\`}>
              My Workshop
            </button>
            <button onClick={() => { setActiveTab('trace'); document.getElementById('my-uploaded-works')?.scrollIntoView({behavior: 'smooth'}) }} className={\`text-sm font-bold pb-4 -mb-4 border-b-2 transition-colors \${activeTab === 'trace' ? 'border-[#1A4731] text-[#1A4731]' : 'border-transparent text-gray-500 hover:text-gray-900'}\`}>
              Trace Craft
            </button>
            <button onClick={() => window.location.href='/verify'} className={\`text-sm font-bold pb-4 -mb-4 border-b-2 transition-colors \${activeTab === 'registry' ? 'border-[#1A4731] text-[#1A4731]' : 'border-transparent text-gray-500 hover:text-gray-900'}\`}>
              Global Registry
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* Language Selector */}
          <div className="relative group cursor-pointer" onMouseEnter={() => setShowLangMenu(true)} onMouseLeave={() => setShowLangMenu(false)}>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
              <Globe size={16} />
              <span className="uppercase">{language}</span>
              <ChevronDown size={14} />
            </div>
            {showLangMenu && (
              <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-card border border-gray-100 z-50">
                <button onClick={() => changeLanguage('en')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-t-xl font-medium">English</button>
                <button onClick={() => changeLanguage('hi')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 font-medium">हिन्दी</button>
                <button onClick={() => changeLanguage('or')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 font-medium">ଓଡ଼ିଆ</button>
                <button onClick={() => changeLanguage('te')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-b-xl font-medium">తెలుగు</button>
              </div>
            )}
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="text-gray-500 hover:text-gray-900 transition-colors">
              <Bell size={20} />
              {flaggedItems.length > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-card border border-gray-100 z-50">
                <div className="p-3 border-b border-gray-50"><h3 className="text-sm font-bold text-gray-900">Notifications</h3></div>
                {flaggedItems.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto">
                    {flaggedItems.map((item: any) => (
                      <div key={item.id} className="p-3 border-b border-gray-50 hover:bg-red-50 cursor-pointer text-sm">
                        <p className="font-bold text-red-600 mb-1">Attention Required</p>
                        <p className="text-gray-700">Your item <strong>{item.craftType}</strong> was flagged.</p>
                      </div>
                    ))}
                  </div>
                ) : <div className="p-4 text-center text-sm text-gray-500">No new notifications.</div>}
              </div>
            )}
          </div>
          
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors ml-2" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Profile */}
        <aside className="lg:col-span-1 space-y-6">
          
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-gray-100 shadow-sm relative group cursor-pointer" onClick={() => setIsProfileEditorOpen(true)}>
              <Image src={dashboardData?.artisanProfile?.photoUrl || "/female_artisan.jpg"} alt="Profile" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold">Edit</span>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-1">{dashboardData?.artisanName || 'Artisan'}</h2>
            <div className="flex items-center gap-1 text-sm text-gray-500 mb-4 font-medium">
              <MapPin size={14} /> {dashboardData?.artisanProfile?.clusterName || 'Pochampally Coop'}
            </div>
            
            {dashboardData?.artisanProfile?.giTagCertified && (
              <div className="bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 mb-6">
                <Award size={14} /> GI Tag Certified
              </div>
            )}

            {/* Health Bar */}
            <div className="w-full text-left bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-gray-900">Artisan Trust Health</span>
                <span className={\`text-sm font-bold \${healthScore >= 80 ? 'text-[#0D9488]' : healthScore >= 50 ? 'text-orange-500' : 'text-red-500'}\`}>
                  {healthScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                <div className={\`h-1.5 rounded-full \${healthScore >= 80 ? 'bg-[#0D9488]' : healthScore >= 50 ? 'bg-orange-500' : 'bg-red-500'}\`} style={{ width: \`\${healthScore}%\` }}></div>
              </div>
              <div className="flex items-center gap-2">
                <div className={\`w-2 h-2 rounded-full \${healthScore >= 80 ? 'bg-[#0D9488]' : 'bg-orange-500'}\`}></div>
                <span className="text-xs font-medium text-gray-600">Credit Risk: <span className="font-bold">{healthScore >= 80 ? 'Low' : healthScore >= 50 ? 'Medium' : 'High'}</span></span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-4 space-y-2">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Quick Actions</h3>
            
            <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center justify-between p-3 bg-[#1A1A1A] hover:bg-black text-white rounded-xl transition-colors shadow-sm group">
              <div className="flex items-center gap-3 font-bold text-sm">
                <Camera size={18} className="text-white/70" /> Capture New Craft
              </div>
              <ArrowRightCircle size={18} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-xl transition-colors border border-gray-100 group">
              <div className="flex items-center gap-3 font-bold text-sm">
                <FileText size={18} className="text-gray-400" /> Apply for Schemes
              </div>
            </button>

            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-xl transition-colors border border-gray-100 group">
              <div className="flex items-center gap-3 font-bold text-sm">
                <Globe size={18} className="text-gray-400" /> List on ONDC (B2B)
              </div>
            </button>
          </div>

        </aside>

        {/* Right Column: Content */}
        <div className="lg:col-span-3 space-y-8">
          
          <div className="mb-2">
            <h1 className="text-2xl font-serif font-bold text-gray-900">{t('dashboard_title')}</h1>
          </div>

          {/* 4 StatCards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              label={t('my_captures')} 
              value={dashboardData ? dashboardData.myCapturesCount.toString() : "..."} 
              icon={<Package size={20} />} 
              trend={dashboardData?.trends?.captures || ""} 
              accentColor="teal" 
            />
            <StatCard 
              label={t('advances_received')} 
              value={dashboardData ? \`₹\${dashboardData.totalAdvances.toLocaleString()}\` : "..."} 
              icon={<Banknote size={20} />} 
              trend={dashboardData?.trends?.advances || ""} 
              accentColor="blue" 
            />
            <StatCard 
              label={t('items_sold')} 
              value={dashboardData ? dashboardData.itemsSold.toString() : "..."} 
              icon={<HandCoins size={20} />} 
              trend={dashboardData?.trends?.sold || ""} 
              accentColor="orange" 
            />
            <StatCard 
              label={t('total_earnings')} 
              value={dashboardData ? \`₹\${dashboardData.totalEarnings.toLocaleString()}\` : "..."} 
              icon={<TrendingUp size={20} />} 
              trend={dashboardData?.trends?.earnings || ""} 
              accentColor="brown" 
            />
          </div>

          {/* Craft Table */}
          <div id="my-uploaded-works" className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-lg font-serif font-bold text-gray-900">{t('my_uploaded_works')}</h2>
              <button className="text-sm font-bold text-gray-500 hover:text-gray-900">View All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                    <th className="px-6 py-4 font-medium">{t('craft_details')}</th>
                    <th className="px-6 py-4 font-medium">{t('blockchain_patch_id')}</th>
                    <th className="px-6 py-4 font-medium">{t('date')}</th>
                    <th className="px-6 py-4 font-medium">{t('status')}</th>
                    <th className="px-6 py-4 font-medium text-right">{t('action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dashboardData?.recentCaptures?.length > 0 ? (
                    dashboardData.recentCaptures.map((item: any) => {
                      let color = "bg-green-50 text-green-700 border-green-200";
                      if (item.status === 'PENDING_DISBURSEMENT') color = "bg-yellow-50 text-yellow-800 border-yellow-200";
                      if (item.status === 'ADVANCE_PAID') color = "bg-blue-50 text-blue-700 border-blue-200";
                      if (item.status === 'SOLD_FINAL' || item.status === 'SOLD_MIDDLEMAN') color = "bg-gray-100 text-gray-700 border-gray-200";
                      if (item.status === 'FLAGGED') color = "bg-red-50 text-red-700 border-red-200";

                      return (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                <Image src={item.images?.[0] || "/ikat_saree.jpg"} alt={item.craftType} fill className="object-cover" />
                              </div>
                              <span className="font-bold text-gray-900 text-sm">{item.craftType}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-500">#{item.patchId || item.id.substring(0,8).toUpperCase()}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{new Date(item.createdAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</td>
                          <td className="px-6 py-4">
                            <span className={\`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border \${color}\`}>
                              {item.status === 'FLAGGED' ? '⚑ Flagged' : item.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => { setSelectedItem(item); setIsDetailsModalOpen(true); }}
                              className="text-xs font-bold text-gray-600 hover:text-gray-900 px-4 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors bg-white shadow-sm"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm font-medium">No recent captures found. Click 'Capture New Craft' to begin!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </main>

      {/* Modals */}
      <CaptureModal isOpen={isModalOpen} onClose={handleModalClose} />
      <AgentHandoffModal 
        isOpen={isSellModalOpen || isCrossCheckModalOpen} 
        onClose={() => { setIsSellModalOpen(false); setIsCrossCheckModalOpen(false); fetchDashboardData(); }} 
        item={selectedItem} 
      />
      <DisputeModal isOpen={isDisputeModalOpen} onClose={() => setIsDisputeModalOpen(false)} item={selectedDisputeItem} />
      <ProfileEditorModal 
        isOpen={isProfileEditorOpen} 
        onClose={() => setIsProfileEditorOpen(false)} 
        artisanData={{...dashboardData?.artisanProfile, name: dashboardData?.artisanName}} 
        onSaved={fetchDashboardData} 
      />
      {isDetailsModalOpen && selectedItem && (
        <DetailsModal item={selectedItem} onClose={() => { setIsDetailsModalOpen(false); setSelectedItem(null); }} />
      )}
    </div>
  );
}

function DetailsModal({ item, onClose }: { item: any, onClose: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-serif font-bold text-lg text-[#1A4731]">{t('transaction_details')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-gray-100 border border-gray-200 shadow-sm">
            <Image src={item.images?.[0] || "/ikat_saree.jpg"} alt="Item" fill className="object-cover" />
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              ID: {item.patchId || item.id.substring(0,8).toUpperCase()}
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-1">{item.craftType}</h3>
          <p className="text-gray-600 text-sm mb-6">{item.descriptionEnglish}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">{t('status')}</span>
              <span className="font-medium text-gray-800">{item.status.replace(/_/g, ' ')}</span>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <span className="text-xs text-green-600 font-bold uppercase tracking-wider block mb-1">{t('advance_received')}</span>
              <span className="font-bold text-xl text-green-700">₹{item.advancePaid > 0 ? item.advancePaid.toLocaleString() : (item.fairWageFloor?.toLocaleString() || 0)}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm py-2 border-b border-gray-100">
              <span className="text-gray-500">{t('total_valuation_band')}</span>
              <span className="font-medium">₹{item.marketPriceMin?.toLocaleString()} - ₹{item.marketPriceMax?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-gray-100">
              <span className="text-gray-500">{t('labor_days')}</span>
              <span className="font-medium">{item.laborDays} {t('days')}</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-gray-500">{t('material_cost')}</span>
              <span className="font-medium">₹{item.rawMaterialCost?.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-full transition-colors">
            {t('close_btn')}
          </button>
        </div>
      </div>
    </div>
  );
}
