"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Map as MapIcon, TrendingUp, AlertTriangle, Info, MapPin, Package, CheckCircle2, X } from "lucide-react";
import { KarigariLogo } from "@/components/ui/KarigariLogo";

export default function InsightsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/artisan/dashboard');
      const data = await res.json();
      if (data.success) {
        setProfile(data.data.artisanProfile);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const craft = profile?.craftType || "Ikat Weaving";

  const [newDemandAppeared, setNewDemandAppeared] = useState(false);
  const [isWhatsappSimOpen, setIsWhatsappSimOpen] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNewDemandAppeared(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <header className="px-4 py-4 bg-white shadow-sm sticky top-0 z-40 flex items-center gap-3">
        <Link href="/artisan/dashboard" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Market Insights</h1>
          <p className="text-xs text-gray-500 font-medium">View real-time demand maps</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Real-time B2B Demand Map */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Live Demand Map</h2>
              <p className="text-gray-500 text-sm">Viewing AI-aggregated B2B matching signals for <strong className="text-[#1A4731]">{craft}</strong>.</p>
            </div>
            {newDemandAppeared && (
              <div className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-full animate-bounce">
                New Buyer Demand Listed!
              </div>
            )}
          </div>
          
          {/* Map Container */}
          <div className="relative w-full bg-[#E8EAED] rounded-xl border border-gray-200 overflow-hidden shadow-inner flex justify-center bg-gray-100">
            <div className="relative w-full max-w-[600px] aspect-square">
            {/* Realistic Map Background (OpenStreetMap) */}
            <div className="absolute inset-0 z-0">
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0} 
                src="https://www.openstreetmap.org/export/embed.html?bbox=68.1%2C7.9%2C97.3%2C35.5&amp;layer=mapnik" 
                style={{ filter: 'grayscale(0.3) brightness(1.1) hue-rotate(10deg)', opacity: 0.8 }}
                className="pointer-events-none"
              ></iframe>
            </div>
            
            {/* Overlay shadow for depth */}
            <div className="absolute inset-0 z-0 shadow-inner bg-gradient-to-b from-transparent to-[#E8EAED]/50 pointer-events-none"></div>
            
            {/* Dynamic New Demand (Delhi) */}
            {newDemandAppeared && (
              <div className="absolute top-[25%] left-[31%] group cursor-pointer animate-fade-in-up z-30">
                <div className="w-12 h-12 bg-blue-500 rounded-full animate-ping absolute opacity-50 -left-4 -top-4"></div>
                <div className="relative z-10 w-4 h-4 bg-blue-600 border-[3px] border-white rounded-full shadow-lg"></div>
                
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-blue-200 w-64 transition-opacity pointer-events-none z-20 overflow-hidden">
                  <div className="bg-blue-600 px-3 py-2">
                    <div className="font-bold text-sm text-white flex items-center justify-between">
                      Delhi NCR <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">JUST NOW</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">New B2B Request</div>
                    <div className="font-bold text-gray-900 mb-2">50 Sambalpuri Sarees (Diwali)</div>
                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                      <span className="text-xs font-bold text-gray-600">Offered Price</span>
                      <span className="text-sm font-bold text-[#1A4731]">₹3,800/unit</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
              
              {/* Mumbai Hotspot (High Demand) */}
              <div className="absolute top-[59%] left-[16%] group cursor-pointer">
                <div className="w-8 h-8 bg-red-500 rounded-full animate-ping absolute opacity-30 -left-2 -top-2"></div>
                <div className="relative z-10 w-4 h-4 bg-red-600 border-[3px] border-white rounded-full shadow-md"></div>
                
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-100 w-56 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 overflow-hidden">
                  <div className="bg-red-50 px-3 py-2 border-b border-red-100">
                    <div className="font-bold text-sm text-red-900">Mumbai Zone</div>
                  </div>
                  <div className="p-3 bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Demand</span>
                      <span className="text-sm font-bold text-red-600">850 Units</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Available Supply</span>
                      <span className="text-sm font-bold text-gray-900">120 Units</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bangalore Hotspot (High Demand) */}
              <div className="absolute top-[82%] left-[32%] group cursor-pointer">
                <div className="w-8 h-8 bg-red-500 rounded-full animate-ping absolute opacity-30 -left-2 -top-2"></div>
                <div className="relative z-10 w-4 h-4 bg-red-600 border-[3px] border-white rounded-full shadow-md"></div>
                
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-100 w-56 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 overflow-hidden">
                  <div className="bg-red-50 px-3 py-2 border-b border-red-100">
                    <div className="font-bold text-sm text-red-900">Bangalore Tech Park</div>
                  </div>
                  <div className="p-3 bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Demand</span>
                      <span className="text-sm font-bold text-red-600">420 Units</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Available Supply</span>
                      <span className="text-sm font-bold text-gray-900">50 Units</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Local Cluster (High Supply) */}
              <div className="absolute top-[55%] left-[61%] group cursor-pointer">
                <div className="relative z-10 w-4 h-4 bg-green-500 border-[3px] border-white rounded-full shadow-md"></div>
                
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-100 w-56 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 overflow-hidden">
                  <div className="bg-green-50 px-3 py-2 border-b border-green-100">
                    <div className="font-bold text-sm text-green-900">Local Cluster Hub</div>
                  </div>
                  <div className="p-3 bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Demand</span>
                      <span className="text-sm font-bold text-gray-900">45 Units</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Available Supply</span>
                      <span className="text-sm font-bold text-green-600">890 Units</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 px-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div> High Demand Hotspot
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div> Saturated (High Supply)
              </div>
            </div>
        </div>

        {/* Right Column: AI Actionable Advice */}
        <div className="space-y-6">
          <div className="bg-[#0F2D20] text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><TrendingUp size={20}/> AI Recommendation</h3>
            <p className="text-sm text-white/80 mb-6 leading-relaxed">
              Based on the upcoming festive season, demand for <strong>{craft}</strong> in Metro Tier-1 cities (Delhi, Mumbai) is up 45%. 
              Local middlemen are currently paying below market value.
            </p>
            
            <div className="bg-white/10 p-4 rounded-xl border border-white/20 mb-6">
              <div className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">Suggested Action</div>
              <div className="text-sm font-bold">Hold current inventory and list directly on ONDC for B2C buyers.</div>
            </div>

            <Link href="/artisan/dashboard" className="block w-full bg-white text-[#0F2D20] text-center py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors">
              List on ONDC
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">SMS Auto-Pilot</h3>
              <button 
                onClick={() => setAlertsEnabled(!alertsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${alertsEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${alertsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-4 border border-blue-100">
              <Info size={16} className="mb-2 inline-block mr-2" />
              <strong>No internet? No problem.</strong>
              <p className="mt-1 text-blue-700/80 text-xs">When demand spikes for your craft, we will send you an SMS. Just reply "YES" to automatically list your inventory at the best price.</p>
            </div>
            
            {alertsEnabled ? (
              <div className="space-y-4 animate-fade-in-up">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <CheckCircle2 size={16} className="text-green-500" /> WhatsApp / SMS Alerts Active
                </div>
                <button 
                  onClick={() => setIsWhatsappSimOpen(true)}
                  className="w-full py-3 bg-[#00A884] hover:bg-[#008f6f] text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.468 2.349 8.468 4.35v7.061c0 2.001 1.53 3.531 3.531 3.531zM11.999 17.24c-3.766 0-6.852-3.036-6.852-6.759h-1.884c0 4.296 3.447 7.844 7.64 8.411v3.212h2.192v-3.212c4.193-.567 7.64-4.115 7.64-8.411h-1.884c0 3.723-3.086 6.759-6.852 6.759z"></path>
                  </svg>
                  Simulate Market Update Alert
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <AlertTriangle size={16} /> Turn on to receive AI market updates.
              </div>
            )}
          </div>
        </div>

      {isWhatsappSimOpen && (
        <div id="whatsapp-simulator-modal" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-[320px] h-[640px] shadow-2xl flex flex-col overflow-hidden relative border-[10px] border-gray-900">
            {/* Phone Header */}
            <div className="bg-[#075E54] text-white px-4 py-3 flex items-center gap-3 relative z-10 shadow">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shrink-0 overflow-hidden">
                <img src="/icons/karigari-logo.png" alt="Karigari" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png'; }} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm leading-tight">KARIGARI Bot (Govt)</h3>
                <p className="text-[11px] text-white/80 leading-tight flex items-center gap-1">Official MoSJE Partner <CheckCircle2 size={10}/></p>
              </div>
              <button onClick={() => setIsWhatsappSimOpen(false)} className="bg-black/20 p-2 rounded-full hover:bg-black/40"><X size={16} /></button>
            </div>
            
            {/* WhatsApp Chat Background */}
            <div className="flex-1 bg-[#E5DDD5] p-4 flex flex-col gap-3 overflow-y-auto" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}>
              <div className="text-center my-2"><span className="bg-[#E1F3FB] text-gray-600 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm">Today</span></div>
              
              <div className="bg-white p-3 rounded-r-xl rounded-bl-xl max-w-[90%] shadow-sm relative">
                <p className="text-sm text-gray-900 leading-snug"><span role="img" aria-label="market">📈</span> <strong>AI Market Update for {craft}</strong></p>
                <p className="text-sm text-gray-800 mt-2 leading-snug">
                  Our sensors show demand in Mumbai has spiked 45% ahead of the upcoming festival season! 
                  Local middlemen are currently paying below market value (&#8377;2,500).
                </p>
                <p className="text-sm text-gray-800 mt-2 font-medium">We strongly recommend holding your inventory. Direct B2C listings on ONDC are fetching &#8377;4,500.</p>
                <p className="text-sm text-gray-800 mt-2 font-medium">Reply '1' to list on ONDC now</p>
                <div className="text-[10px] text-gray-400 text-right mt-1">10:42 AM</div>
              </div>

              <div className="bg-[#DCF8C6] p-3 rounded-l-xl rounded-br-xl max-w-[80%] self-end shadow-sm relative mt-2">
                <p className="text-sm text-gray-900">1</p>
                <div className="text-[10px] text-gray-500 text-right mt-1 flex items-center justify-end gap-1">10:45 AM <CheckCircle2 size={12} className="text-[#34B7F1]"/></div>
              </div>

              <div className="bg-white p-3 rounded-r-xl rounded-bl-xl max-w-[90%] shadow-sm relative mt-2">
                <p className="text-sm text-gray-900 leading-snug"><span role="img" aria-label="check">✅</span> <strong>Listed on ONDC!</strong></p>
                <p className="text-sm text-gray-800 mt-1 leading-snug">
                  Awesome! Your available stock of {craft} is now live on the ONDC national market at &#8377;4,500 per unit.
                </p>
                <div className="text-[10px] text-gray-400 text-right mt-1">10:45 AM</div>
              </div>
            </div>

            {/* Fake Input Area */}
            <div className="bg-[#F0F0F0] p-2 flex items-center gap-2 relative z-10">
              <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center shadow-sm">
                <span className="text-gray-400 text-sm">Type a message</span>
              </div>
              <div className="w-10 h-10 bg-[#00A884] rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.468 2.349 8.468 4.35v7.061c0 2.001 1.53 3.531 3.531 3.531zM11.999 17.24c-3.766 0-6.852-3.036-6.852-6.759h-1.884c0 4.296 3.447 7.844 7.64 8.411v3.212h2.192v-3.212c4.193-.567 7.64-4.115 7.64-8.411h-1.884c0 3.723-3.086 6.759-6.852 6.759z"></path>
                </svg>
              </div>
            </div>
            
            {/* iOS Home Indicator */}
            <div className="h-5 bg-[#F0F0F0] flex items-center justify-center w-full relative z-10">
              <div className="w-1/3 h-1 bg-black/20 rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      </main>
    </div>
  );
}
