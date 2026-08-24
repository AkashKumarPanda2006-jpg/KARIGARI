"use client";

import { useState } from "react";
import { Package, TrendingUp, Search, Store, ArrowRight, ShieldCheck, MapPin, Truck, Leaf, CheckCircle2 } from "lucide-react";
import { KarigariLogo } from "@/components/ui/KarigariLogo";
import Image from "next/image";
import { LogisticsMap } from "@/components/LogisticsMap";

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState('demands');
  const [quoteState, setQuoteState] = useState<'pending' | 'quoted' | 'accepted'>('pending');

  const handleSimulateQuote = () => {
    setTimeout(() => {
      setQuoteState('quoted');
    }, 1500);
  };

  const handleAcceptQuote = () => {
    setQuoteState('accepted');
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-16">
      <header className="px-4 sm:px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <KarigariLogo variant="dark" showWordmark={true} size={28} />
          <span className="text-gray-300 font-light text-xl">|</span>
          <span className="font-bold text-[#24332C] tracking-wide">B2B MARKETPLACE</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
              <Image src="/female_artisan.jpg" alt="Buyer" width={32} height={32} className="object-cover" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-gray-900">Rajesh Retailers (Mumbai)</div>
              <div className="text-[10px] text-gray-500 font-medium">Verified Buyer</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900">My Demand Requests</h1>
          <button className="bg-[#14211B] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-[#24332C] transition-colors flex items-center gap-2">
            <Package size={16} /> Post New Demand
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Demand Ticket */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Active Search</span>
                    <span className="text-xs text-gray-500 font-bold">REQ-99283</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">50 Sambalpuri Ikat Silk Sarees</h3>
                  <div className="text-sm text-gray-500 mt-1 flex gap-4">
                    <span className="flex items-center gap-1"><MapPin size={14} /> Odhisha Clusters</span>
                    <span className="flex items-center gap-1"><TrendingUp size={14} /> Target: ₹3,500 - ₹4,000 / unit</span>
                  </div>
                </div>
                {quoteState === 'pending' && (
                  <button onClick={handleSimulateQuote} className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                    Simulate Artisan Match
                  </button>
                )}
              </div>
              
              <div className="p-6 bg-gray-50">
                {quoteState === 'pending' ? (
                  <div className="text-center py-8">
                    <Search className="mx-auto text-gray-300 mb-3" size={32} />
                    <p className="text-gray-500 font-medium text-sm">Karigari AI Matchmaker is searching inventory databases...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-700">
                      <CheckCircle2 className="text-green-500" size={18} /> Match Found & Quoted!
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                            <Image src="/female_artisan.jpg" alt="Artisan" width={48} height={48} className="object-cover" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 flex items-center gap-2">
                              Lakshmi Devi <ShieldCheck size={14} className="text-blue-500" />
                            </div>
                            <div className="text-xs text-gray-500">Bargarh Weavers Cooperative (4.9/5)</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-500">Quoted Price</div>
                          <div className="text-2xl font-black text-[#24332C]">₹3,850 <span className="text-sm font-normal text-gray-500">/ unit</span></div>
                        </div>
                      </div>

                      <div className="bg-[#DCEBE0] rounded-lg p-4 mb-4 border border-[#DCEBE0]">
                        <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <TrendingUp size={14} /> AI Profitability Prediction
                        </h4>
                        <p className="text-sm text-green-900">
                          This quote is <strong>15% below standard retail market value (₹4,500)</strong> in the Mumbai region for the upcoming Diwali season. Accepting this ensures a highly profitable margin while guaranteeing the artisan a fair wage (₹850 above floor).
                        </p>
                      </div>

                      {quoteState === 'accepted' ? (
                          <div className="mt-4 animate-fade-in-up">
                            <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                              <Truck size={16} className="text-green-600" /> Choose Fulfillment Route
                            </h4>
                            <LogisticsMap />
                          </div>
                        ) : (
                        <div className="flex gap-3">
                          <button onClick={handleAcceptQuote} className="flex-1 bg-[#24332C] text-white py-3 rounded-xl font-bold hover:bg-[#14211B] transition-colors shadow-sm">
                            Accept Quote & Purchase
                          </button>
                          <button className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm">
                            Negotiate / Counter
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Shipping Estimates (Mumbai)</h3>
              
              <div className="space-y-4">
                <div className="border border-gray-100 rounded-xl p-4 cursor-pointer hover:border-[#24332C] transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                      <Truck size={16} className="text-gray-500" /> Standard Air
                    </div>
                    <div className="font-bold text-gray-900">₹450</div>
                  </div>
                  <div className="text-xs text-gray-500">Delivery in 2-3 Days. High carbon footprint.</div>
                </div>

                <div className="border-2 border-[#24332C] bg-[#DCEBE0] rounded-xl p-4 cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#24332C] text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">
                    Recommended
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 font-bold text-[#24332C] text-sm">
                      <Leaf size={16} /> Eco-Friendly Surface
                    </div>
                    <div className="font-bold text-[#24332C]">₹200</div>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">Delivery in 5-7 Days via train/truck routing.</div>
                  <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-[10px] font-bold">
                    ↓ 40% Carbon Emissions
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#14211B] text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 relative z-10">B2B Market Insights</h3>
              <p className="text-sm text-white/80 mb-4 relative z-10">Diwali demand for Silk is surging. Securing inventory now avoids a 15% price hike expected next week.</p>
              <div className="bg-white/10 p-3 rounded-xl border border-white/10 relative z-10">
                <div className="text-2xl font-black mb-1">98%</div>
                <div className="text-xs font-medium text-white/70">Order Fulfillment Rate for Verified SHGs</div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
