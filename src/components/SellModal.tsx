"use client";

import { useState, useMemo } from "react";
import { CheckCircle2, X, Sparkles, Wallet, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

export function SellModal({ isOpen, onClose, item }: SellModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [agreed, setAgreed] = useState(false);
  
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
      setIsComplete(false);
      setIsProcessing(false);
      setAgreed(false);
    }, 500);
  };

  const handleListAndClaim = async () => {
    if (!agreed) return;
    setIsProcessing(true);
    
    try {
      // Complete the action by applying for the advance and marking it as listed
      const res = await fetch("/api/disbursement/apply", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            itemId: item.id,
            selectedOption: 'KARIGARI_ADVANCE',
            patchId: item.patchId
         })
      });
      
      if (res.ok) {
        setTimeout(() => {
          setIsProcessing(false);
          setIsComplete(true);
        }, 2500);
      } else {
        const err = await res.json();
        alert("Failed to claim advance: " + (err.error || "Unknown error"));
        setIsProcessing(false);
      }
    } catch(e: any) {
      console.error(e);
      alert("Network error: " + e.message);
      setIsProcessing(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up font-sans">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="font-serif font-bold text-xl text-primary">Protocol Listing & Escrow</h2>
          </div>
          <button onClick={resetAndClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 md:p-8 flex-grow overflow-y-auto">
          {!isComplete ? (
            <div className="animate-fade-in-up">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wallet size={32} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Claim Fair Wage Advance</h3>
                <p className="text-gray-500 text-sm">List this item on the global protocol and instantly claim your AI-guaranteed advance.</p>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0">
                  <Image src={item.images?.[0] || "/ikat_saree.jpg"} alt="Craft" fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{item.craftType}</h4>
                  <p className="text-xs font-mono text-gray-500 mt-1">{item.patchId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Instant Advance</p>
                  <p className="text-lg font-bold text-green-700">₹{pricing.advance.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-8">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                  <ShieldCheck size={16} className="text-primary" /> Zero-Burden Logistics Agreement
                </h4>
                <ul className="space-y-3 text-sm text-gray-600 mb-5">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    I agree to safely store this product in its exact verified condition.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    When a buyer purchases this on the global network, Karigari will dispatch a delivery agent to my door.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    I must pass the <span className="font-bold text-gray-800">AI Dispatch Scan</span> with the delivery agent before the product leaves my possession.
                  </li>
                </ul>
                
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-white rounded-xl border border-gray-200 hover:border-primary/50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                  />
                  <span className="text-xs font-medium text-gray-700">
                    I understand that any attempt to swap or damage this product will fail the AI Dispatch scan, resulting in an immediate platform ban.
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                <button 
                  onClick={resetAndClose}
                  className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleListAndClaim}
                  disabled={!agreed || isProcessing}
                  className="px-6 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-colors flex items-center justify-center min-w-[220px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing Escrow...
                    </span>
                  ) : (
                    "List & Claim ₹" + pricing.advance.toLocaleString()
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="text-green-600" size={40} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">
                Advance Released!
              </h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                ₹{pricing.advance.toLocaleString()} has been sent to your UPI. Your product's Digital Twin is now broadcasted on the global open network.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4 text-left max-w-sm mx-auto mb-8">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <Truck size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Keep it safe</p>
                  <p className="text-xs text-gray-500">We will notify you when a delivery agent is dispatched to your location.</p>
                </div>
              </div>

              <button 
                onClick={resetAndClose}
                className="w-full max-w-sm mx-auto py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
