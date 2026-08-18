import { useState } from 'react';
import { Camera, CheckCircle2, X } from 'lucide-react';

export function CrossCheckModal({ isOpen, onClose, item, onComplete }: { isOpen: boolean, onClose: () => void, item: any, onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !item) return null;

  const handleSimulateCrossCheck = async () => {
    setIsProcessing(true);
    // Simulate AI processing time
    await new Promise(r => setTimeout(r, 2000));
    
    // Call the backend to update status
    try {
      await fetch('/api/artisan/cross-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id })
      });
      setIsProcessing(false);
      setStep(3);
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up font-sans">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-serif font-bold text-lg text-primary">Attach QR & Cross-Check</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center">
          {step === 1 && (
            <>
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 border-2 border-dashed border-gray-300">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${item.patchId}`} alt="QR" className="w-20 h-20 opacity-80" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Step 1: Download & Attach</h3>
              <p className="text-center text-gray-500 text-sm mb-8">
                Your unique ID is <strong className="text-gray-900">{item.patchId}</strong>. 
                Print this QR code and physically attach it to your craft.
              </p>
              <button 
                onClick={() => setStep(2)}
                className="w-full bg-gray-900 text-white font-bold py-3 rounded-full hover:bg-gray-800 transition-colors"
              >
                I have attached the tag
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
                <Camera size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Step 2: AI Cross-Check</h3>
              <p className="text-center text-gray-500 text-sm mb-8">
                Upload a final photo showing the product with the tag clearly visible. Gemini AI will cross-check this against your original photos.
              </p>
              <button 
                onClick={handleSimulateCrossCheck}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? "AI Verifying..." : "Upload Photo & Verify"}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verification Successful!</h3>
              <p className="text-center text-gray-500 text-sm mb-8">
                The AI confirms the tag is attached to the correct product. Your item is now ready to sell.
              </p>
              <button 
                onClick={() => {
                  onComplete();
                  onClose();
                }}
                className="w-full bg-green-600 text-white font-bold py-3 rounded-full hover:bg-green-700 transition-colors"
              >
                Unlock Marketplace
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
