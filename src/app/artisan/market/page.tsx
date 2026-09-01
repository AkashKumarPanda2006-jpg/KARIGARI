"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, Package, ChevronRight, Store, DollarSign, CheckCircle2, Sparkles, Camera, Video, Share2, MessageSquare } from "lucide-react";
import { useLanguage } from "@/lib/translations";
import { KarigariLogo } from "@/components/ui/KarigariLogo";
import { SocialAdStudioModal } from "@/components/SocialAdStudioModal";

export default function MarketPage() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"ondc" | "b2b" | "social">("ondc");
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [selectedCraft, setSelectedCraft] = useState<any>(null);

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-12">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/artisan/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <KarigariLogo variant="dark" showWordmark={true} size={28} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#24332C] flex items-center gap-3">
            <Globe size={28} className="text-[#24332C]" />
            {language === 'hi' ? 'बाज़ार, ONDC और सोशल कॉमर्स' : 'Global Market, ONDC & Social Commerce'}
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            {language === 'hi' ? 'अपने उत्पादों को ONDC, B2B खरीदारों और सोशल मीडिया विज्ञापनों तक पहुँचाएँ।' : 'Syndicate your craft across ONDC buyer apps, B2B corporate bulk orders, and AI-powered Instagram & WhatsApp social ads.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 sm:gap-4 mb-6">
          <button 
            onClick={() => setActiveTab("ondc")}
            className={`flex-1 py-3 px-3 sm:px-4 rounded-xl font-bold flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm transition-colors ${activeTab === 'ondc' ? 'bg-[#24332C] text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            <Store size={18} /> ONDC Network
          </button>
          <button 
            onClick={() => setActiveTab("b2b")}
            className={`flex-1 py-3 px-3 sm:px-4 rounded-xl font-bold flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm transition-colors ${activeTab === 'b2b' ? 'bg-[#24332C] text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            <Package size={18} /> Bulk B2B Orders
          </button>
          <button 
            onClick={() => setActiveTab("social")}
            className={`flex-1 py-3 px-3 sm:px-4 rounded-xl font-bold flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm transition-colors ${activeTab === 'social' ? 'bg-[#24332C] text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            <Sparkles size={18} className="text-amber-400" /> AI Social Studio
          </button>
        </div>

        {/* Tab 1: ONDC Network */}
        {activeTab === 'ondc' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Zero-ID ONDC Syndication</h2>
                <p className="text-gray-600 max-w-lg text-sm">
                  List once on Karigari. Our Beckn Protocol Provider node (`/api/ondc/catalog`) broadcasts your verified inventory live across Paytm, Magicpin, Mystore, and Snapdeal with zero extra accounts.
                </p>
              </div>
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm p-4 hidden md:flex">
                <Globe size={36} className="text-blue-500" />
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-base">Connected Buyer App Channels</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="flex gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <div className="mt-0.5"><CheckCircle2 className="text-green-600" size={18} /></div>
                  <div>
                    <strong className="block text-gray-900 text-sm">Paytm Mall & Snapdeal</strong>
                    <span className="text-gray-600 text-xs">Reach 100M+ retail shoppers nationwide under ONDC:RET12.</span>
                  </div>
                </div>
                <div className="flex gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <div className="mt-0.5"><CheckCircle2 className="text-green-600" size={18} /></div>
                  <div>
                    <strong className="block text-gray-900 text-sm">Magicpin & Pincode</strong>
                    <span className="text-gray-600 text-xs">Hyperlocal discovery and quick-ship delivery routing.</span>
                  </div>
                </div>
                <div className="flex gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <div className="mt-0.5"><CheckCircle2 className="text-green-600" size={18} /></div>
                  <div>
                    <strong className="block text-gray-900 text-sm">GeM B2G Government Quota</strong>
                    <span className="text-gray-600 text-xs">Direct procurement for PSU and Ministry gifting orders.</span>
                  </div>
                </div>
                <div className="flex gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <div className="mt-0.5"><CheckCircle2 className="text-green-600" size={18} /></div>
                  <div>
                    <strong className="block text-gray-900 text-sm">Automated Direct UPI Escrow</strong>
                    <span className="text-gray-600 text-xs">40% advance on dispatch + final balance directly to your VPA.</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-4 flex items-center justify-between border border-emerald-200">
                <div>
                  <div className="font-bold text-emerald-900 text-sm">Beckn Catalog Gateway Active</div>
                  <div className="text-xs text-emerald-700">All verified artisan inventory is live on the national network.</div>
                </div>
                <Link href="/api/ondc/catalog" target="_blank" className="bg-[#24332C] hover:bg-[#1A2721] text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm">
                  View Live Feed <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Bulk B2B Orders */}
        {activeTab === 'b2b' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Wholesale & Corporate B2B Demand</h2>
                <p className="text-gray-600 max-w-lg text-sm">
                  Connect directly with national brands, boutiques, and corporate bulk buyers for high-volume orders.
                </p>
              </div>
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm p-4 hidden md:flex">
                <DollarSign size={36} className="text-amber-500" />
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-base">Active Bulk Enquiries</h3>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-2xl p-5 hover:border-[#24332C] transition-all shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-base text-gray-900">FabIndia Procurement Request</h4>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-0.5 rounded-full">MATCHED CLUSTER</span>
                  </div>
                  <p className="text-gray-600 text-xs mb-4">Looking for 500 meters of authentic Sambalpuri Ikat silk fabric for upcoming festive collection. Delivery window: 45 days.</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                    <span className="font-black text-gray-900 text-sm">Value: ₹1,50,000</span>
                    <button className="bg-[#24332C] text-white px-4 py-1.5 rounded-xl font-bold hover:bg-[#14211B] transition-colors">Submit Quote</button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-2xl p-5 hover:border-[#24332C] transition-all shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-base text-gray-900">Corporate Gifting (TCS Festive Drive)</h4>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full">NEW ENQUIRY</span>
                  </div>
                  <p className="text-gray-600 text-xs mb-4">Requirement of 200 handcrafted Dhokra & Terracotta heritage desk artifacts for Diwali employee gifting.</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                    <span className="font-black text-gray-900 text-sm">Value: ₹80,000</span>
                    <button className="bg-[#24332C] text-white px-4 py-1.5 rounded-xl font-bold hover:bg-[#14211B] transition-colors">Submit Portfolio</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: AI Social Studio */}
        {activeTab === 'social' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-pink-100 text-pink-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                  <Sparkles size={12} /> Social Discovery Engine
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Social Marketing & Viral Ad Studio</h2>
                <p className="text-gray-600 max-w-lg text-sm">
                  Urban buyers buy from Instagram Reels, YouTube Shorts, and WhatsApp. Turn your crafts into viral social ads with 1-click shoppable links in 10 seconds.
                </p>
              </div>
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm p-4 hidden md:flex">
                <Camera size={36} className="text-pink-600" />
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
                      <Video size={18} />
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 mb-1">15s Viral Reel Scripts</h3>
                    <p className="text-xs text-gray-500">Auto-generates high-retention hooks and storytelling teleprompter cues.</p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center mb-2">
                      <Camera size={18} />
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 mb-1">Instagram Ad Captions</h3>
                    <p className="text-xs text-gray-500">Emotional storytelling copy with high-ranking viral hashtags.</p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mb-2">
                      <MessageSquare size={18} />
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 mb-1">1-Tap WhatsApp Broadcast</h3>
                    <p className="text-xs text-gray-500">Pre-formatted status updates with direct 1-click checkout links.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#24332C] to-[#14211B] text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                <div>
                  <h3 className="text-lg font-bold">Launch AI Social Studio Generator</h3>
                  <p className="text-xs text-white/80 mt-1 max-w-md">
                    Choose any craft from your inventory to auto-generate customized Reel scripts, post captions, and 1-click shoppable links.
                  </p>
                </div>
                <button
                  onClick={() => setIsSocialModalOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md flex items-center gap-2 shrink-0"
                >
                  <Sparkles size={16} /> Open Studio Generator
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Social Ad Studio Modal */}
      <SocialAdStudioModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        craftItem={selectedCraft}
      />
    </div>
  );
}
