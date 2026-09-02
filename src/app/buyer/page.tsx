"use client";

import { useState } from "react";
import { Package, TrendingUp, Search, Store, ArrowRight, ShieldCheck, MapPin, Truck, Leaf, CheckCircle2, Image as ImageIcon, Upload, X, Clock, FileText, Sparkles, Check, AlertCircle, RefreshCw } from "lucide-react";
import { KarigariLogo } from "@/components/ui/KarigariLogo";
import Image from "next/image";
import { LogisticsMap } from "@/components/LogisticsMap";

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState<'demands' | 'tracking'>('demands');
  const [quoteState, setQuoteState] = useState<'pending' | 'quoted' | 'accepted'>('accepted');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postTab, setPostTab] = useState<'general' | 'instructions' | 'photo'>('general');
  
  // Production Tracker State
  const [productionStage, setProductionStage] = useState<number>(3); // 1: Confirmed, 2: Raw Material, 3: Weaving, 4: Quality Check, 5: Dispatched
  const [completedUnits, setCompletedUnits] = useState<number>(35);
  const totalUnits = 50;

  // New Demand Form State
  const [demandForm, setDemandForm] = useState({
    title: "50 Sambalpuri Ikat Silk Sarees",
    craftType: "Sambalpuri Ikat Silk",
    quantity: 50,
    targetPrice: 3800,
    cluster: "Bargarh Weavers Cluster, Odisha",
    deadline: "2026-10-15",
    // Detailed Artisan Instructions
    dimensions: "5.5 meters length + 0.8 meter unstitched blouse piece",
    naturalDyes: "100% Organic Vegetable & Plant Dyes (Indigo, Madder Root, Turmeric)",
    yarnSpecs: "Pure Mulberry Silk 4-ply warp and weft (Certified Silk Mark)",
    motifs: "Traditional Shankha (Conch), Chakra (Wheel), and Pasapalli checkerboard border",
    specialNotes: "Ensure all edge borders are hand-twisted with traditional tassels. Weave sample batch of 5 before full bulk execution.",
    referencePhoto: "/ikat_saree.jpg"
  });

  const handleSimulateQuote = () => {
    setTimeout(() => {
      setQuoteState('quoted');
    }, 1200);
  };

  const handleAcceptQuote = () => {
    setQuoteState('accepted');
  };

  const advanceProduction = () => {
    if (productionStage < 5) {
      setProductionStage(prev => prev + 1);
      if (productionStage === 3) setCompletedUnits(50);
    } else {
      setProductionStage(1);
      setCompletedUnits(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-16">
      
      {/* Header */}
      <header className="px-4 sm:px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <KarigariLogo variant="dark" showWordmark={true} size={28} />
          <span className="text-gray-300 font-light text-xl">|</span>
          <span className="font-bold text-[#1A4731] tracking-wide text-xs sm:text-sm">B2B DEMAND & PRODUCTION HUB</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
              <Image src="/female_artisan.jpg" alt="Buyer" width={32} height={32} className="object-cover" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-gray-900">Rajesh Retailers (Mumbai)</div>
              <div className="text-[10px] text-gray-500 font-medium">Verified Enterprise Buyer</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">B2B Bulk Demand & Production Hub</h1>
            <p className="text-sm text-gray-500 mt-1">
              Post customized craft specifications, attach design photos, and track live cluster production rates.
            </p>
          </div>
          <button 
            onClick={() => setIsPostModalOpen(true)}
            className="bg-[#0F2D20] hover:bg-[#1A4731] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <Package size={16} className="text-amber-400" /> Post New Custom Demand
          </button>
        </div>

        {/* Demand & Live Production Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Demand Ticket */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {productionStage === 5 ? "Dispatched" : "In Production"}
                    </span>
                    <span className="text-xs text-gray-400 font-mono font-bold">REQ-99283-OD</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{demandForm.title}</h2>
                  <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-4">
                    <span className="flex items-center gap-1"><MapPin size={14} className="text-gray-400" /> {demandForm.cluster}</span>
                    <span className="flex items-center gap-1 font-semibold text-gray-700"><TrendingUp size={14} className="text-green-600" /> Target: ₹{demandForm.targetPrice} / unit</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={advanceProduction}
                    className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw size={12} /> Advance Stage ({productionStage}/5)
                  </button>
                </div>
              </div>

              {/* Reference Photo & Custom Instructions Banner */}
              <div className="bg-[#FAFBF9] p-6 border-b border-gray-100 space-y-4">
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  
                  {/* Attached Reference Image Preview */}
                  <div className="relative w-full sm:w-36 h-36 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shrink-0 shadow-sm">
                    <Image 
                      src={demandForm.referencePhoto || "/ikat_saree.jpg"} 
                      alt="Reference Craft" 
                      fill 
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-bold text-center py-1 backdrop-blur-sm flex items-center justify-center gap-1">
                      <ImageIcon size={10} /> Reference Design
                    </div>
                  </div>

                  {/* Detailed Specs for Artisans */}
                  <div className="flex-1 space-y-2.5 text-xs text-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1 text-[#1A4731]">
                        <FileText size={13} /> Artisan Custom Instructions:
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-3.5 rounded-xl border border-gray-200">
                      <div>
                        <strong className="text-gray-900 block">Dimensions & Length:</strong>
                        <span className="text-gray-600">{demandForm.dimensions}</span>
                      </div>
                      <div>
                        <strong className="text-gray-900 block">Dyes & Colors:</strong>
                        <span className="text-gray-600">{demandForm.naturalDyes}</span>
                      </div>
                      <div>
                        <strong className="text-gray-900 block">Yarn & Quality:</strong>
                        <span className="text-gray-600">{demandForm.yarnSpecs}</span>
                      </div>
                      <div>
                        <strong className="text-gray-900 block">Motif Specifications:</strong>
                        <span className="text-gray-600">{demandForm.motifs}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500 italic bg-amber-50/70 p-2 rounded-lg border border-amber-100">
                      📝 <strong>Special Note:</strong> {demandForm.specialNotes}
                    </p>
                  </div>

                </div>
              </div>

              {/* LIVE PRODUCTION & BULK VELOCITY TRACKER */}
              <div className="p-6 space-y-6">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <Clock size={16} className="text-blue-600" /> Live Production Stage & Velocity Tracker
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Real-time status updates from the Bargarh cluster workshop</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-gray-900">{completedUnits} / {totalUnits}</span>
                    <span className="text-xs text-gray-500 block">Units Completed ({Math.round((completedUnits/totalUnits)*100)}%)</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200">
                    <div 
                      style={{ width: `${(completedUnits/totalUnits)*100}%` }} 
                      className="h-full bg-gradient-to-r from-[#1A4731] to-emerald-500 rounded-full transition-all duration-500 shadow-sm"
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500">
                    <span>⚡ Production Velocity: <strong>4.2 Sarees / Day</strong></span>
                    <span>Estimated Completion: <strong>5 Days Remaining</strong></span>
                  </div>
                </div>

                {/* 5-Stage Visual Stepper */}
                <div className="grid grid-cols-5 gap-2 pt-2 text-center">
                  
                  {/* Step 1 */}
                  <div className={`p-2.5 rounded-xl border transition-all ${productionStage >= 1 ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    <div className="text-[10px] uppercase">Step 1</div>
                    <div className="text-xs mt-1">Matched</div>
                    <div className="text-[10px] font-normal text-gray-500 mt-0.5">40% Advance ✓</div>
                  </div>

                  {/* Step 2 */}
                  <div className={`p-2.5 rounded-xl border transition-all ${productionStage >= 2 ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    <div className="text-[10px] uppercase">Step 2</div>
                    <div className="text-xs mt-1">Raw Material</div>
                    <div className="text-[10px] font-normal text-gray-500 mt-0.5">Silk Acquired</div>
                  </div>

                  {/* Step 3 */}
                  <div className={`p-2.5 rounded-xl border transition-all ${productionStage === 3 ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold ring-2 ring-blue-400/30' : productionStage > 3 ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    <div className="text-[10px] uppercase">Step 3</div>
                    <div className="text-xs mt-1">Weaving</div>
                    <div className="text-[10px] font-normal text-gray-500 mt-0.5">70% on Looms</div>
                  </div>

                  {/* Step 4 */}
                  <div className={`p-2.5 rounded-xl border transition-all ${productionStage >= 4 ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    <div className="text-[10px] uppercase">Step 4</div>
                    <div className="text-xs mt-1">GI Quality</div>
                    <div className="text-[10px] font-normal text-gray-500 mt-0.5">QR Tagging</div>
                  </div>

                  {/* Step 5 */}
                  <div className={`p-2.5 rounded-xl border transition-all ${productionStage >= 5 ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    <div className="text-[10px] uppercase">Step 5</div>
                    <div className="text-xs mt-1">Dispatched</div>
                    <div className="text-[10px] font-normal text-gray-500 mt-0.5">India Post DNK</div>
                  </div>

                </div>

                {/* Assigned Artisan & Escrow Status */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border border-gray-300 shrink-0">
                      <Image src="/female_artisan.jpg" alt="Lakshmi Devi" width={40} height={40} className="object-cover" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        Lakshmi Devi <ShieldCheck size={14} className="text-blue-600" />
                      </div>
                      <div className="text-xs text-gray-500">Lead Master Weaver • Bargarh Weavers Cooperative (4.9★)</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-500 font-medium">Smart Escrow Status:</div>
                    <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 mt-0.5">
                      40% Advance Disbursed (₹77,000)
                    </div>
                  </div>
                </div>

                {/* Logistics Route Map when Dispatched */}
                {productionStage === 5 && (
                  <div className="mt-4 animate-fade-in-up border-t pt-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Truck size={16} className="text-green-600" /> India Post DNK Live Transit Tracking
                    </h4>
                    <LogisticsMap />
                  </div>
                )}

              </div>

            </div>

          </div>

          {/* Right Sidebar: Shipping & Market Insights */}
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">India Post DNK Logistics</h3>
              
              <div className="space-y-3">
                <div className="border-2 border-[#1A4731] bg-[#F5F8F7] rounded-2xl p-4 cursor-pointer relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 bg-[#1A4731] text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                    Official DNK Route
                  </div>
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2 font-bold text-[#1A4731] text-sm">
                      <Leaf size={16} /> Dak Ghar Niryat Kendra
                    </div>
                    <div className="font-bold text-[#1A4731]">₹120 / unit</div>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">Direct hub pickup from Bargarh post office with integrated Customs declaration.</div>
                  <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px] font-bold">
                    ✓ Direct Government Escrow Linked
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0F2D20] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 relative z-10 flex items-center gap-1.5">
                <Sparkles size={14} /> AI Bulk Procurement Insights
              </h3>
              <p className="text-xs text-white/80 mb-4 leading-relaxed relative z-10">
                Diwali festival demand for Sambalpuri silk is up <strong>42% YoY</strong>. By placing custom bulk orders directly with weaver clusters, you have saved <strong>₹45,000 in middleman trading margins</strong>.
              </p>
              <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 relative z-10">
                <div className="text-2xl font-black mb-0.5">100%</div>
                <div className="text-[11px] font-medium text-white/70">GI Provenance Verified on Blockchain / Hash Ledger</div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* POST NEW DEMAND MODAL (With Reference Photo & Custom Instructions) */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up font-sans">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">
            
            {/* Modal Header */}
            <div className="bg-[#1A4731] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400">
                  <Package size={20} />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-lg leading-tight">Post Custom B2B Artisan Demand</h2>
                  <p className="text-xs text-white/70">Upload reference designs and specific artisan execution rules</p>
                </div>
              </div>
              <button onClick={() => setIsPostModalOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-200 bg-white px-6 shrink-0 text-xs font-bold">
              <button
                onClick={() => setPostTab('general')}
                className={`py-3 px-4 border-b-2 transition-colors ${postTab === 'general' ? 'border-[#1A4731] text-[#1A4731]' : 'border-transparent text-gray-500'}`}
              >
                1. Basic Info & Quantity
              </button>
              <button
                onClick={() => setPostTab('instructions')}
                className={`py-3 px-4 border-b-2 transition-colors ${postTab === 'instructions' ? 'border-[#1A4731] text-[#1A4731]' : 'border-transparent text-gray-500'}`}
              >
                2. Artisan Detailed Instructions
              </button>
              <button
                onClick={() => setPostTab('photo')}
                className={`py-3 px-4 border-b-2 transition-colors ${postTab === 'photo' ? 'border-[#1A4731] text-[#1A4731]' : 'border-transparent text-gray-500'}`}
              >
                3. Reference Design Photo
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              
              {/* Tab 1: General Info */}
              {postTab === 'general' && (
                <div className="space-y-4 animate-fade-in-up">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Demand Title</label>
                    <input 
                      type="text" 
                      value={demandForm.title} 
                      onChange={(e) => setDemandForm({ ...demandForm, title: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#1A4731] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Craft Type</label>
                      <input 
                        type="text" 
                        value={demandForm.craftType} 
                        onChange={(e) => setDemandForm({ ...demandForm, craftType: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#1A4731] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Target Cluster</label>
                      <input 
                        type="text" 
                        value={demandForm.cluster} 
                        onChange={(e) => setDemandForm({ ...demandForm, cluster: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#1A4731] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Bulk Quantity (Units)</label>
                      <input 
                        type="number" 
                        value={demandForm.quantity} 
                        onChange={(e) => setDemandForm({ ...demandForm, quantity: Number(e.target.value) })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#1A4731] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Target Unit Price (₹)</label>
                      <input 
                        type="number" 
                        value={demandForm.targetPrice} 
                        onChange={(e) => setDemandForm({ ...demandForm, targetPrice: Number(e.target.value) })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#1A4731] outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Specific Artisan Instructions */}
              {postTab === 'instructions' && (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900">
                    💡 These instructions will be translated directly into the artisan's regional dialect audio notes by our AI assistant.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Dimensions & Sizing</label>
                    <input 
                      type="text" 
                      value={demandForm.dimensions} 
                      onChange={(e) => setDemandForm({ ...demandForm, dimensions: e.target.value })}
                      placeholder="e.g. 5.5m saree + 0.8m blouse"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#1A4731] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Natural Dye / Color Preferences</label>
                    <input 
                      type="text" 
                      value={demandForm.naturalDyes} 
                      onChange={(e) => setDemandForm({ ...demandForm, naturalDyes: e.target.value })}
                      placeholder="e.g. 100% Organic Indigo & Turmeric Dyes"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#1A4731] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Yarn Count & Material Quality</label>
                    <input 
                      type="text" 
                      value={demandForm.yarnSpecs} 
                      onChange={(e) => setDemandForm({ ...demandForm, yarnSpecs: e.target.value })}
                      placeholder="e.g. Pure 4-ply Mulberry Silk (Silk Mark Certified)"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#1A4731] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Custom Motif & Border Rules</label>
                    <textarea 
                      rows={2}
                      value={demandForm.motifs} 
                      onChange={(e) => setDemandForm({ ...demandForm, motifs: e.target.value })}
                      placeholder="e.g. Shankha, Chakra motifs on Pallu"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-[#1A4731] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Reference Design Photo */}
              {postTab === 'photo' && (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="border-2 border-dashed border-gray-300 rounded-3xl p-6 text-center bg-white hover:border-[#1A4731] transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-600">
                      <Upload size={22} />
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm">Upload Reference Design Photo</h4>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG or WebP up to 10MB</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 relative shrink-0 border">
                      <Image src={demandForm.referencePhoto || "/ikat_saree.jpg"} alt="Preview" fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-gray-900">Active Reference: reference_design_ikat.jpg</div>
                      <div className="text-[11px] text-gray-500">Ready for Gemini Vision authenticity pre-screening</div>
                    </div>
                    <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-md">Attached ✓</span>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="bg-gray-100 px-6 py-4 border-t border-gray-200 flex justify-between items-center shrink-0">
              <button onClick={() => setIsPostModalOpen(false)} className="text-xs font-bold text-gray-600 hover:text-gray-900">
                Cancel
              </button>
              <button 
                onClick={() => {
                  setIsPostModalOpen(false);
                  setProductionStage(1);
                  setCompletedUnits(0);
                }} 
                className="bg-[#1A4731] hover:bg-[#0F2D20] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <Check size={14} /> Submit Demand to Cluster
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
