"use client";

import { useState, useMemo } from "react";
import { CheckCircle2, X, Sparkles, Wallet, Store, Globe, Building2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

export function SellModal({ isOpen, onClose, item }: SellModalProps) {
  const [step, setStep] = useState(1);
  const [selectedRoute, setSelectedRoute] = useState<'ondc' | 'b2b' | 'karigari'>('karigari');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // Extra form details for ONDC/B2B (Simulated for SIH UI)
  const [retailerName, setRetailerName] = useState("");
  const [retailerId, setRetailerId] = useState("");
  const [ondcId, setOndcId] = useState("");

  const pricing = useMemo(() => {
    if (!item?.fairWageFloor) return { advance: 0, finalEstimated: 0 };
    return {
      advance: item.fairWageFloor,
      finalEstimated: item.fairWageFloor * 1.5,
    };
  }, [item?.fairWageFloor]);

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSelectedRoute('karigari');
      setIsComplete(false);
      setIsProcessing(false);
    }, 500);
  };

  const handleRouteSelection = async () => {
    setIsProcessing(true);
    // Simulate updating the database status based on chosen route
    try {
      let newStatus = 'KARIGARI_CUSTODY';
      if (selectedRoute === 'ondc') newStatus = 'LISTED_ONDC';
      if (selectedRoute === 'b2b') newStatus = 'SOLD_B2B';

      // This is a dummy call for the UI prototype
      await fetch("/api/disbursement/apply", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            itemId: item.id,
            selectedOption: 'KARIGARI_ADVANCE', // Always gives the advance
            patchId: item.patchId
         })
      });
      // We would ideally also update the precise route status, but for the prototype, taking the advance is enough
    } catch(e) {
      console.error(e);
    }

    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
    }, 2000);
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up font-sans">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="font-serif font-bold text-xl text-primary">Aggregator Routing Engine</h2>
            {!isComplete && <p className="text-xs text-gray-500">Transfer Rights & Distribute</p>}
          </div>
          <button onClick={resetAndClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 md:p-8 flex-grow overflow-y-auto">
          
          {step === 1 && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Step 1: Choose Distribution Channel</h3>
                <p className="text-gray-500 text-sm">Select where Karigari should list your verified product.</p>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex gap-4 mb-8">
                <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0">
                  <Image src={item.images?.[0] || "/ikat_saree.jpg"} alt="Craft" fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{item.craftType}</h4>
                  <p className="text-xs text-gray-500 mt-1">ID: {item.patchId}</p>
                  <p className="text-sm font-bold text-green-700 mt-1">Guaranteed Advance: ₹{pricing.advance.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {/* ONDC Option */}
                <div 
                  onClick={() => setSelectedRoute('ondc')}
                  className={cn("border rounded-2xl p-4 cursor-pointer transition-all", selectedRoute === 'ondc' ? "ring-2 ring-primary bg-green-50/30 border-transparent" : "border-gray-200 bg-white hover:border-gray-300")}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center shrink-0", selectedRoute === 'ondc' ? "border-primary bg-primary text-white" : "border-gray-300")}>
                      {selectedRoute === 'ondc' && <CheckCircle2 size={12} />}
                    </div>
                    <Globe size={18} className={selectedRoute === 'ondc' ? "text-primary" : "text-gray-400"} />
                    <h5 className={cn("font-bold", selectedRoute === 'ondc' ? "text-primary" : "text-gray-800")}>ONDC Integration</h5>
                  </div>
                  <p className="text-xs text-gray-500 ml-8 mb-3">Karigari will list your product on buyer apps like Mystore and Paytm. Platform fees apply upon final sale.</p>
                  {selectedRoute === 'ondc' && (
                    <div className="ml-8 mt-3 animate-fade-in-up">
                       <input 
                         type="text" 
                         placeholder="Enter your ONDC Seller ID (Optional)" 
                         className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:outline-none"
                         value={ondcId}
                         onChange={(e) => setOndcId(e.target.value)}
                       />
                    </div>
                  )}
                </div>

                {/* B2B Option */}
                <div 
                  onClick={() => setSelectedRoute('b2b')}
                  className={cn("border rounded-2xl p-4 cursor-pointer transition-all", selectedRoute === 'b2b' ? "ring-2 ring-primary bg-green-50/30 border-transparent" : "border-gray-200 bg-white hover:border-gray-300")}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center shrink-0", selectedRoute === 'b2b' ? "border-primary bg-primary text-white" : "border-gray-300")}>
                      {selectedRoute === 'b2b' && <CheckCircle2 size={12} />}
                    </div>
                    <Store size={18} className={selectedRoute === 'b2b' ? "text-primary" : "text-gray-400"} />
                    <h5 className={cn("font-bold", selectedRoute === 'b2b' ? "text-primary" : "text-gray-800")}>B2B Wholesale Boutique</h5>
                  </div>
                  <p className="text-xs text-gray-500 ml-8">Karigari will route this to a partnered high-end boutique (e.g., FabIndia). Lower fees, steady wholesale returns.</p>
                  {selectedRoute === 'b2b' && (
                    <div className="ml-8 mt-3 space-y-2 animate-fade-in-up">
                       <input 
                         type="text" 
                         placeholder="Boutique / Retailer Name" 
                         className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:outline-none"
                         value={retailerName}
                         onChange={(e) => setRetailerName(e.target.value)}
                       />
                       <input 
                         type="text" 
                         placeholder="GST or Retailer ID" 
                         className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:outline-none"
                         value={retailerId}
                         onChange={(e) => setRetailerId(e.target.value)}
                       />
                    </div>
                  )}
                </div>

                {/* Karigari Warehouse / Auto-Auction Option */}
                <div 
                  onClick={() => setSelectedRoute('karigari')}
                  className={cn("border rounded-2xl p-4 cursor-pointer transition-all relative overflow-hidden", selectedRoute === 'karigari' ? "ring-2 ring-primary bg-green-50/30 border-transparent" : "border-gray-200 bg-white hover:border-gray-300")}
                >
                  <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Zero Hassle</div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center shrink-0", selectedRoute === 'karigari' ? "border-primary bg-primary text-white" : "border-gray-300")}>
                      {selectedRoute === 'karigari' && <CheckCircle2 size={12} />}
                    </div>
                    <Building2 size={18} className={selectedRoute === 'karigari' ? "text-primary" : "text-gray-400"} />
                    <h5 className={cn("font-bold text-primary flex items-center gap-2")}>Karigari Warehouse <Sparkles size={14}/></h5>
                  </div>
                  <p className="text-xs text-gray-500 ml-8">We take custody of the physical product. If we cannot sell it globally within 60 days, we automatically trigger an auction to recover capital.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={resetAndClose} className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                <button 
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition-colors"
                >
                  Proceed to Transfer Rights
                </button>
              </div>
            </div>
          )}

          {step === 2 && !isComplete && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
                  <Wallet size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Transfer Rights & Disburse</h3>
                <p className="text-gray-500 text-sm">Review the legal transfer and claim your advance.</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Distribution Route</span>
                  <span className="font-bold text-gray-900 uppercase">{selectedRoute}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Immediate Advance</span>
                  <span className="font-bold text-green-700">₹{pricing.advance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Platform Yield (On Sale)</span>
                  <span className="font-bold text-red-500">3% (-₹150)</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Expected Final Payout</span>
                  <span className="font-bold text-gray-900">₹{(pricing.finalEstimated - pricing.advance - 150).toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-8 text-xs text-orange-800">
                <p className="font-bold mb-1">Declaration of Rights Transfer:</p>
                <p>By clicking confirm, you legally transfer the digital selling rights of this product to the Karigari Cooperative Protocol to execute the sale on your behalf.</p>
              </div>

              <button 
                onClick={handleRouteSelection}
                disabled={isProcessing}
                className="w-full bg-green-600 text-white font-bold py-3.5 rounded-full hover:bg-green-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Disbursing via UPI...</>
                ) : (
                  <>I Agree, Transfer Rights & Claim ₹{pricing.advance.toLocaleString()}</>
                )}
              </button>
            </div>
          )}

          {isComplete && (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">Rights Transferred</h3>
              <p className="text-gray-600 mb-6">
                You have successfully transferred selling authority to Karigari for <strong>{selectedRoute.toUpperCase()}</strong> routing.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8 inline-block text-left">
                <p className="text-sm font-bold text-gray-800 mb-2">Advance Disbursed: <span className="text-green-600">₹{pricing.advance.toLocaleString()}</span></p>
                <p className="text-xs text-gray-500 font-mono">Txn ID: KGR-UPI-{Math.floor(Math.random()*1000000)}</p>
              </div>
              
              <button 
                onClick={() => {
                  onClose();
                  window.location.reload();
                }} 
                className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-full hover:bg-gray-800 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
