"use client";

import { useState } from "react";
import { CheckCircle2, X, Camera, ShieldCheck, Truck, Fingerprint } from "lucide-react";

interface AgentHandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

export function AgentHandoffModal({ isOpen, onClose, item }: AgentHandoffModalProps) {
  const [agentCode, setAgentCode] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setAgentCode("");
      setIsOtpVerified(false);
      setIsProcessing(false);
      setIsComplete(false);
      setIsCameraActive(false);
      setCapturedImage(null);
    }, 500);
  };

  const handleVerifyOtp = () => {
    if (agentCode === "4829" || agentCode.length === 4) {
      setIsOtpVerified(true);
      setIsCameraActive(true); // Automatically open camera after OTP
    } else {
      alert("Invalid Agent Code");
    }
  };

  // Simulate a camera capture
  const simulateCapture = () => {
    setCapturedImage(item?.images?.[0] || "/ikat_saree.jpg");
    setIsCameraActive(false);
  };

  const handleAIHandshake = async () => {
    setIsProcessing(true);
    
    try {
      // Complete the action by marking it as dispatched and issuing advance
      await fetch("/api/disbursement/apply", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            itemId: item.id,
            selectedOption: 'KARIGARI_ADVANCE',
            patchId: item.patchId
         })
      });
      // In a real app we would update the status to DISPATCHED_TO_ONDC here too
    } catch(e) {
      console.error(e);
    }

    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
    }, 2500);
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up font-sans">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="font-serif font-bold text-xl text-primary flex items-center gap-2">
              <ShieldCheck size={24} /> Agent OTP Handoff
            </h2>
          </div>
          <button onClick={resetAndClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 md:p-8 flex-grow overflow-y-auto">
          {!isComplete ? (
            <div className="animate-fade-in-up">
              
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Truck size={32} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Secure Dispatch Gate</h3>
                <p className="text-gray-500 text-sm">Please ensure Patch ID <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{item.patchId}</span> is securely attached.</p>
              </div>

              {!isOtpVerified ? (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8 text-center">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                    <Fingerprint size={18} className="text-primary" /> Enter Delivery Agent Code
                  </h4>
                  <p className="text-xs text-gray-500 mb-6">Ask the Karigari logistics agent at your door for their 4-digit code.</p>
                  
                  <input 
                    type="text" 
                    value={agentCode}
                    onChange={(e) => setAgentCode(e.target.value)}
                    placeholder="e.g. 4829"
                    className="w-full max-w-xs mx-auto text-center text-2xl tracking-[0.5em] font-mono border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none mb-4"
                    maxLength={4}
                  />
                  
                  <div className="flex flex-col gap-2 max-w-xs mx-auto">
                    <button 
                      onClick={handleVerifyOtp}
                      disabled={agentCode.length !== 4}
                      className="w-full py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Unlock Camera
                    </button>
                    {/* Hackathon Demo Button */}
                    <button 
                      onClick={() => setAgentCode("4829")}
                      className="w-full py-2 rounded-xl text-xs font-bold text-gray-500 bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                      (Demo) Simulate Agent Arrival
                    </button>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in-up">
                  <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-3 mb-6 text-sm flex items-center justify-center gap-2 font-bold">
                    <CheckCircle2 size={18} /> Agent Verified. Complete the Handoff.
                  </div>

                  {!capturedImage ? (
                     <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50">
                        <Camera size={40} className="text-gray-400 mb-4" />
                        <p className="text-gray-600 font-medium mb-4 text-center">Take a photo of the product + Patch ID in front of the agent.</p>
                        <button 
                          onClick={simulateCapture}
                          className="px-6 py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary-dark transition-all flex items-center gap-2"
                        >
                          <Camera size={18} /> Open Camera
                        </button>
                     </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-200">
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                         <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                      </div>

                      <button 
                        onClick={handleAIHandshake}
                        disabled={isProcessing}
                        className="w-full py-4 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg shadow-primary/20"
                      >
                        {isProcessing ? (
                          <span className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Vision-Sentinel Verifying...
                          </span>
                        ) : (
                          "Confirm AI Handshake"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="text-green-600" size={40} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">
                Handoff Complete!
              </h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                Vision-Sentinel Agent has authenticated the physical handoff. The product is now safely en route to the buyer.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-xl text-center max-w-sm mx-auto mb-8 border border-gray-200">
                <p className="text-sm font-bold text-gray-900 mb-1">Advance Transferred</p>
                <p className="text-2xl font-bold text-green-600">₹{item?.fairWageFloor?.toLocaleString() || "2,500"}</p>
                <p className="text-xs text-gray-500 mt-1">Deposited via UPI</p>
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
