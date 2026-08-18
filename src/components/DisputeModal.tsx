"use client";

import { useState } from "react";
import { CheckCircle2, ShieldAlert, X } from "lucide-react";
import Image from "next/image";

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

export function DisputeModal({ isOpen, onClose, item }: DisputeModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await fetch('/api/artisan/request-review', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id }) 
      });
      alert("Dispute filed successfully. The Super Admin will review the visual evidence.");
      window.location.reload();
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up font-sans">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex justify-between items-center">
          <div>
            <h2 className="font-serif font-bold text-xl text-red-700">Counterfeit Alert Review</h2>
            <p className="text-xs text-red-600">Patch ID: {item.patchId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 md:p-8 overflow-y-auto max-h-[80vh]">
          <p className="text-gray-700 mb-6 text-sm">
            A buyer or warehouse inspector has flagged this item as counterfeit or mismatched. 
            Before requesting a Super Admin review, you must compare your original capture with the flagged image. <strong className="text-red-600">Frivolous disputes will result in an instant ban.</strong>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Original Image */}
            <div>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-500" /> Your Original Capture
              </h3>
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-green-200">
                <Image src={item.images?.[0] || "/ikat_saree.jpg"} alt="Original" fill className="object-cover" />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">Verified at: {new Date(item.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Flagged Image */}
            <div>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <ShieldAlert size={18} className="text-red-500" /> Image Uploaded by Reviewer
              </h3>
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                {/* Simulated Buyer Image - in production this would be the actual uploaded evidence */}
                <Image src={item.images?.[0] || "/ikat_saree.jpg"} alt="Flagged Evidence" fill className="object-cover sepia-[.4] contrast-125" />
                <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">FLAGGED EVIDENCE</div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">Uploaded recently</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="mt-1 w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-600"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <span className="text-sm text-gray-700">
                <strong>I swear under penalty of platform ban</strong> that the buyer's image is either a false flag, or my original genuine product. I request a manual review by the Super Admin to overturn this counterfeit alert.
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-4">
            <button onClick={onClose} className="px-6 py-3 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
              Accept Flag (Do Not Dispute)
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!confirmed || isSubmitting}
              className="px-6 py-3 rounded-full text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isSubmitting ? "Submitting Dispute..." : "Submit Dispute for Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
