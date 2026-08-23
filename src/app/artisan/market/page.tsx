"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, TrendingUp, Search, Package, ChevronRight, Store, DollarSign, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/translations";
import { KarigariLogo } from "@/components/ui/KarigariLogo";
import Image from "next/image";

export default function MarketPage() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("ondc");

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
          <h1 className="text-3xl font-serif font-bold text-[#1A4731] flex items-center gap-3">
            <Globe size={28} className="text-[#1A4731]" />
            {language === 'hi' ? 'बाज़ार और B2B लिस्टिंग' : 'Global Market & B2B Listing'}
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            {language === 'hi' ? 'अपने उत्पादों को देश भर के थोक खरीदारों और खुदरा ग्राहकों तक पहुँचाएँ।' : 'Reach bulk buyers and retail customers across the country through open networks.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setActiveTab("ondc")}
            className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'ondc' ? 'bg-[#1A4731] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            <Store size={20} /> ONDC Network
          </button>
          <button 
            onClick={() => setActiveTab("b2b")}
            className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'b2b' ? 'bg-[#1A4731] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            <Package size={20} /> Bulk Buyers (B2B)
          </button>
        </div>

        {activeTab === 'ondc' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">ONDC Integration</h2>
                <p className="text-gray-600 max-w-lg">
                  {language === 'hi' 
                    ? 'ओएनडीसी (ONDC) नेटवर्क से जुड़कर अपने उत्पादों को Paytm, Magicpin और अन्य ई-कॉमर्स ऐप्स पर एक साथ बेचें।' 
                    : 'List once on Karigari and sell simultaneously across multiple buyer apps like Paytm, Magicpin, and Snapdeal via the ONDC network.'}
                </p>
              </div>
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm p-4 hidden md:flex">
                <Globe size={40} className="text-blue-500" />
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Features & Benefits</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="flex gap-3">
                  <div className="mt-1"><CheckCircle2 className="text-green-500" size={20} /></div>
                  <div>
                    <strong className="block text-gray-900">Zero Commission</strong>
                    <span className="text-gray-600 text-sm">Keep 100% of your earnings. No middleman cuts.</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1"><CheckCircle2 className="text-green-500" size={20} /></div>
                  <div>
                    <strong className="block text-gray-900">Auto-Translation</strong>
                    <span className="text-gray-600 text-sm">Your product descriptions are translated to buyer's language.</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1"><CheckCircle2 className="text-green-500" size={20} /></div>
                  <div>
                    <strong className="block text-gray-900">Logistics Handled</strong>
                    <span className="text-gray-600 text-sm">IndiaPost and Shiprocket integration for easy shipping.</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1"><CheckCircle2 className="text-green-500" size={20} /></div>
                  <div>
                    <strong className="block text-gray-900">Trust Badges</strong>
                    <span className="text-gray-600 text-sm">Your GI Tags and Artisan ID boost search rankings.</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
                <div>
                  <div className="font-bold text-gray-900">Ready to start selling?</div>
                  <div className="text-sm text-gray-500">Your profile meets all ONDC requirements.</div>
                </div>
                <button className="bg-[#1A4731] hover:bg-[#123323] text-white font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2">
                  Link Account <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'b2b' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Wholesale & B2B Orders</h2>
                <p className="text-gray-600 max-w-lg">
                  {language === 'hi' 
                    ? 'कॉर्पोरेट उपहार और बड़े ऑर्डर के लिए सीधे कारखानों और ब्रांडों से जुड़ें।' 
                    : 'Connect directly with brands, boutiques, and corporate buyers for large volume bulk orders.'}
                </p>
              </div>
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm p-4 hidden md:flex">
                <DollarSign size={40} className="text-amber-500" />
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Active Bulk Enquiries</h3>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-xl p-4 hover:border-[#1A4731] transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg text-gray-900">FabIndia Procurement</h4>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">MATCH</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">Looking for 500 meters of authentic Ikat fabric for upcoming summer collection. Timeline: 45 days.</p>
                  <div className="flex items-center gap-4 text-sm font-medium">
                    <span className="text-gray-900">Value: ₹1,50,000</span>
                    <span className="text-gray-400">|</span>
                    <button className="text-[#1A4731] hover:underline">Submit Quote</button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-4 hover:border-[#1A4731] transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg text-gray-900">Corporate Gifting (TCS)</h4>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">NEW</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">Requirement of 200 handcrafted items (Dhokra/Pottery) for Diwali employee gifting.</p>
                  <div className="flex items-center gap-4 text-sm font-medium">
                    <span className="text-gray-900">Value: ₹80,000</span>
                    <span className="text-gray-400">|</span>
                    <button className="text-[#1A4731] hover:underline">Submit Portfolio</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
