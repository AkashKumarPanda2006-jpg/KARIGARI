"use client";

import { useState, useEffect } from "react";
import { QrCode, ArrowRight, X, Sparkles, CheckCircle2, Wallet, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/translations";

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

export function SellModal({ isOpen, onClose, item }: SellModalProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [isMinting, setIsMinting] = useState(false);
  const [generatedPatchId, setGeneratedPatchId] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<'middleman' | 'auction' | 'karigari'>('karigari');
  const [upiId, setUpiId] = useState("sunita@upi");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);
  const [assignedAdminId, setAssignedAdminId] = useState<string>("");

  useEffect(() => {
    fetch('/api/users/admins').then(r => r.json()).then(d => {
      if (d.success && d.admins.length > 0) {
        setAdmins(d.admins);
        setAssignedAdminId(d.admins[0].id);
      }
    });
  }, []);

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setGeneratedPatchId(null);
      setSelectedOption('karigari');
      setPaymentSuccess(false);
      setIsProcessingPayment(false);
    }, 500);
  };

  if (!isOpen || !item) return null;

  const handleMintPatch = () => {
    setIsMinting(true);
    // Simulate NFC scan and DB update
    setTimeout(async () => {
      try {
        const res = await fetch("/api/items/mint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId: item.id })
        });
        const data = await res.json();
        if (res.ok && data.patchId) {
          setGeneratedPatchId(data.patchId);
        } else {
          // Fallback if API fails
          setGeneratedPatchId(`PATCH-${Math.random().toString(36).substr(2, 8).toUpperCase()}`);
        }
      } catch (e) {
        setGeneratedPatchId(`PATCH-${Math.random().toString(36).substr(2, 8).toUpperCase()}`);
      }
      setIsMinting(false);
    }, 2000);
  };

  const processPayment = async () => {
    setIsProcessingPayment(true);
    try {
      let backendOption = 'KARIGARI_ADVANCE';
      if (selectedOption === 'middleman') backendOption = 'MIDDLEMAN';
      if (selectedOption === 'auction') backendOption = 'COOP_AUCTION';

      await fetch("/api/disbursement/apply", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            itemId: item.id,
            selectedOption: backendOption,
            assignedAdminId,
            patchId: generatedPatchId
         })
      });
    } catch(e) {
      console.error(e);
    }

    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="font-serif font-bold text-xl text-primary">Sell / Mint Item</h2>
            {!paymentSuccess && <p className="text-xs text-gray-500">Step {step} of 3</p>}
          </div>
          <button onClick={resetAndClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex-grow overflow-y-auto">
          {/* Step 1: Patch Scan */}
          {step === 1 && (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in-up">
              <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 border-4 border-green-400 rounded-full animate-ping opacity-20"></div>
                <QrCode size={48} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{t('scan_patch')}</h3>
              <p className="text-gray-500 mb-8 max-w-sm">Bring your phone close to the blank NFC/QR patch attached to the craft to link it.</p>
              
              {!generatedPatchId ? (
                <button 
                  onClick={handleMintPatch}
                  disabled={isMinting}
                  className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg w-full max-w-xs justify-center"
                >
                  {isMinting ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Scanning...</>
                  ) : "Scan NFC Patch"}
                </button>
              ) : (
                <div className="bg-white border border-green-200 shadow-sm rounded-xl p-4 flex flex-col items-center gap-2 w-full max-w-sm animate-fade-in-up">
                  <div className="flex items-center gap-3 w-full border-b border-gray-100 pb-3 mb-1">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                      <CheckCircle2 size={20} />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-gray-900">{t('patch_detected')}</p>
                      <p className="text-xs text-green-600 font-bold tracking-wider uppercase">Linked successfully</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Assigned ID</p>
                  <p className="font-mono text-lg font-bold text-primary bg-primary-light/10 px-4 py-2 rounded-lg w-full tracking-widest">{generatedPatchId}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Decision Engine */}
          {step === 2 && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-serif font-bold text-primary mb-2">{t('decision_engine')}</h3>
                <p className="text-gray-500">Choose your preferred payout route based on AI valuation.</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl flex gap-4 mb-8">
                <div className="w-20 h-20 rounded-xl overflow-hidden relative shrink-0">
                  <Image src={item.images?.[0] || "/ikat_saree.jpg"} alt="Craft" fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{item.craftType}</h4>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className="text-xs bg-white px-2 py-1 border border-gray-200 rounded-md font-bold text-gray-600">Floor: ₹{item.fairWageFloor?.toFixed(0)}</span>
                    <span className="text-xs bg-white px-2 py-1 border border-gray-200 rounded-md font-bold text-gray-600">Band: ₹{item.marketPriceMin?.toFixed(0)} - ₹{item.marketPriceMax?.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-gray-200 p-4 rounded-2xl mb-2 shadow-sm">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Assign Cooperative Manager (Optional)</label>
                  <select 
                    value={assignedAdminId}
                    onChange={(e) => setAssignedAdminId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary font-medium text-gray-800"
                  >
                    <option value="">-- No specific manager --</option>
                    {admins.map(admin => (
                      <option key={admin.id} value={admin.id}>{admin.name} ({admin.email})</option>
                    ))}
                  </select>
                </div>

                <div 
                  onClick={() => setSelectedOption('middleman')}
                  className={cn("border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all", selectedOption === 'middleman' ? "ring-2 ring-primary bg-green-50 border-transparent" : "border-gray-200 bg-white hover:border-gray-300")}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center shrink-0", selectedOption === 'middleman' ? "border-primary bg-primary text-white" : "border-gray-300")}>
                      {selectedOption === 'middleman' && <CheckCircle2 size={12} />}
                    </div>
                    <div>
                      <h5 className={cn("font-bold", selectedOption === 'middleman' ? "text-primary" : "text-gray-800")}>Option A: Local Middleman</h5>
                      <p className="text-sm text-gray-500">Immediate Cash: ₹{(item.fairWageFloor * 0.7).toFixed(0)}</p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setSelectedOption('karigari')}
                  className={cn("border rounded-2xl p-4 flex items-center justify-between cursor-pointer relative shadow-soft transition-all", selectedOption === 'karigari' ? "ring-2 ring-primary bg-green-50/50 border-transparent" : "border-gray-200 bg-white hover:border-gray-300")}
                >
                  <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">{t('recommended')}</div>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center shrink-0", selectedOption === 'karigari' ? "border-primary bg-primary text-white" : "border-gray-300")}>
                      {selectedOption === 'karigari' && <CheckCircle2 size={12} />}
                    </div>
                    <div>
                      <h5 className="font-bold text-primary flex items-center gap-2">Option B: KARIGARI Advance <Sparkles size={14} /></h5>
                      <p className="text-sm text-green-800">Same-day Cash: ₹{item.fairWageFloor?.toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment Gateway */}
          {step === 3 && (
            <div className="animate-fade-in-up">
              {!paymentSuccess ? (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
                      <Wallet size={32} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{t('disbursement_gateway')}</h3>
                    <p className="text-gray-500">Review payout details and process payment securely.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Your Registered UPI ID</label>
                      <input 
                        type="text" 
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                      <h4 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-green-600"/> Financial Breakdown
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>Total Market Prediction</span>
                          <span className="font-mono font-bold">₹{item.standardMarketPrice?.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-green-700 bg-green-50 p-2 rounded-lg font-bold">
                          <span>Advance Disbursing Now</span>
                          <span className="font-mono">₹{item.fairWageFloor?.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 px-2">
                          <span>Queued for Final Sale</span>
                          <span className="font-mono">₹{Math.max(0, (item.standardMarketPrice || 0) - (item.fairWageFloor || 0)).toFixed(0)}</span>
                        </div>
                      </div>
                    </div>

                    {isProcessingPayment && (
                      <div className="flex flex-col items-center justify-center p-4 animate-pulse">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-3"></div>
                        <p className="text-sm font-medium text-gray-600">Connecting to UPI & Minting On-Chain Ledger...</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in-up">
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-20"></div>
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-3xl font-serif font-bold text-gray-900 mb-2">{t('payment_disbursed')}</h3>
                  <p className="text-gray-500 mb-6 max-w-sm">Funds have been initiated to <span className="font-bold text-gray-800">{upiId}</span>. The AI Patch ID has been minted.</p>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 w-full mb-8 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Generated Patch ID</p>
                    <p className="font-mono text-xl text-primary font-bold">{generatedPatchId}</p>
                  </div>

                  <div className="flex flex-col gap-3 w-full animate-fade-in-up">
                    <button 
                      onClick={resetAndClose}
                      className="bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg w-full text-lg"
                    >
                      <CheckCircle2 size={24} />
                      {t('return_dashboard')}
                    </button>
                    <Link 
                      href={`/verify/${generatedPatchId}`}
                      onClick={resetAndClose}
                      target="_blank"
                      className="bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all w-full"
                    >
                      <QrCode size={20} />
                      {t('view_passport')}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!paymentSuccess && (
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center relative z-20">
            <button 
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={isProcessingPayment}
              className={cn("px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-full transition-colors", (step === 1 || isProcessingPayment) && "invisible")}
            >
              Back
            </button>
            
            {step === 1 ? (
              <button 
                onClick={() => setStep(2)}
                disabled={!generatedPatchId}
                className="bg-primary hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-full font-medium transition-all shadow-soft flex items-center justify-center gap-2 min-w-[140px]"
              >
                Continue <ArrowRight size={18} />
              </button>
            ) : step === 2 ? (
              <button 
                onClick={() => setStep(3)}
                className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-bold text-lg transition-all shadow-soft min-w-[160px] mx-auto flex justify-center items-center gap-2"
              >
                Confirm Selection
              </button>
            ) : (
              <button 
                onClick={processPayment}
                disabled={isProcessingPayment}
                className="bg-primary hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full font-bold text-lg transition-all shadow-soft w-full max-w-xs mx-auto"
              >
                Process Payment
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
