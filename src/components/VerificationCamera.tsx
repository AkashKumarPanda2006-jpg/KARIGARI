"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, X, ShieldCheck, AlertTriangle, UploadCloud, Flag, CheckCircle2, Clock } from "lucide-react";
import Image from "next/image";

interface VerificationCameraProps {
  patchId: string;
  onPurchaseComplete?: () => void;
}

export function VerificationCamera({ patchId, onPurchaseComplete }: VerificationCameraProps) {
  const [status, setStatus] = useState<'IDLE' | 'CAMERA_ACTIVE' | 'PROCESSING' | 'AUTHENTIC' | 'SOFT_REJECT' | 'FLAGGED'>('IDLE');
  const [resultData, setResultData] = useState<{ similarityScore?: number, reasoning?: string, remainingAttempts?: number, expiresAt?: string } | null>(null);
  
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Countdown Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'SOFT_REJECT' && resultData?.expiresAt) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const expiration = new Date(resultData.expiresAt!).getTime();
        const distance = expiration - now;

        if (distance <= 0) {
          clearInterval(interval);
          setTimeLeft("0:00");
        } else {
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, resultData?.expiresAt]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStatus('CAMERA_ACTIVE');
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Camera access denied or not available. You can use the upload option.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (status === 'CAMERA_ACTIVE') {
      setStatus('IDLE');
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleVerify = async () => {
    if (capturedImages.length === 0) return;
    
    stopCamera();
    setStatus('PROCESSING');
    
    try {
      const res = await fetch('/api/verify-authenticity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patchId, scannedImageBase64: capturedImages })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setResultData({
          similarityScore: data.similarityScore,
          reasoning: data.reasoning,
          remainingAttempts: data.remainingAttempts,
          expiresAt: data.expiresAt
        });

        if (data.isAuthentic) {
          setStatus('AUTHENTIC');
          setCapturedImages([]);
        } else if (data.isSoftReject) {
          setStatus('SOFT_REJECT');
          setCapturedImages([]); // clear images for retry
        } else {
          setStatus('FLAGGED');
        }
      } else {
        console.error(data.error);
        alert(data.error || "Verification failed");
        setStatus(resultData?.expiresAt ? 'SOFT_REJECT' : 'IDLE');
      }
    } catch (err) {
      console.error(err);
      alert("Network error during verification");
      setStatus(resultData?.expiresAt ? 'SOFT_REJECT' : 'IDLE');
    }
  };

  const captureFrame = () => {
    if (capturedImages.length >= 3) return; // Max 3 images

    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.8);
        setCapturedImages(prev => [...prev, dataUrl]);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (capturedImages.length >= 3) {
      alert("You can only upload up to 3 photos.");
      return;
    }
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImages(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 animate-fade-in-up mt-6 relative overflow-hidden">
      
      {/* SOFT REJECT BANNER */}
      {status === 'SOFT_REJECT' && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex flex-col items-center text-center animate-fade-in-up">
          <div className="flex items-center gap-2 text-orange-600 font-bold mb-2">
            <Clock size={20} className="animate-pulse" />
            <span className="text-xl font-mono">{timeLeft}</span>
          </div>
          <p className="text-sm text-orange-800 font-medium mb-1">
            Verification failed. You have <span className="font-bold">{resultData?.remainingAttempts} attempts</span> remaining.
          </p>
          <p className="text-xs text-orange-600">
            Please try different lighting or angles before the timer expires.
          </p>
        </div>
      )}

      {/* IDLE OR SOFT REJECT STATE */}
      {(status === 'IDLE' || status === 'SOFT_REJECT') && (
        <div className="flex flex-col items-center justify-center py-4">
          {status === 'IDLE' && (
            <>
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck size={32} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Verify Authenticity</h3>
              <p className="text-gray-500 text-sm text-center mb-6">Scan up to 3 photos of the item from different angles.</p>
            </>
          )}

          {capturedImages.length > 0 && (
            <div className="w-full mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Captured Photos ({capturedImages.length}/3)</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {capturedImages.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-primary shrink-0 group">
                    <img src={img} alt={`Capture ${i}`} className="object-cover w-full h-full" />
                    <button 
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {capturedImages.length < 3 && (
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 shrink-0">
                    <Camera size={16} className="mb-1" />
                    <span className="text-[10px] font-bold">Add Photo</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-3 w-full">
            {capturedImages.length > 0 && (
              <button onClick={handleVerify} className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-md animate-fade-in-up">
                <CheckCircle2 size={18} /> Verify Now
              </button>
            )}

            {capturedImages.length < 3 && (
              <>
                <button onClick={startCamera} className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                  <Camera size={18} /> {capturedImages.length > 0 ? "Add Another Photo" : "Open Camera"}
                </button>
                <label className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                  <UploadCloud size={18} /> Upload Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </>
            )}
          </div>
        </div>
      )}

      {/* CAMERA ACTIVE STATE */}
      {status === 'CAMERA_ACTIVE' && (
        <div className="flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-2 px-1">
            <span className="text-xs font-bold text-gray-500 uppercase">Capturing ({capturedImages.length}/3)</span>
            {capturedImages.length > 0 && (
               <button onClick={handleVerify} className="text-xs font-bold bg-green-500 text-white px-3 py-1 rounded-full animate-pulse">
                 Verify Now
               </button>
            )}
          </div>
          
          <div className="w-full relative bg-black rounded-2xl overflow-hidden aspect-[3/4] flex flex-col items-center justify-end shadow-inner mb-4">
            <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
            <canvas ref={canvasRef} width="640" height="853" className="hidden" />
            
            {/* Scanning Overlay Effect */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-1 bg-green-400/80 shadow-[0_0_15px_rgba(74,222,128,0.8)] absolute top-0 animate-[scan_2s_linear_infinite]" />
              <div className="absolute inset-8 border-2 border-white/20 rounded-xl" />
            </div>

            <div className="relative z-10 mb-6 flex items-center justify-center gap-6 w-full px-8">
               <button 
                 onClick={captureFrame}
                 disabled={capturedImages.length >= 3}
                 className="w-16 h-16 bg-white/30 backdrop-blur-md border-4 border-white rounded-full flex items-center justify-center hover:bg-white/50 transition-all active:scale-95 shadow-lg disabled:opacity-50"
               >
                 <div className="w-12 h-12 bg-white rounded-full" />
               </button>
            </div>
            
            <button onClick={stopCamera} className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 z-10">
              <X size={18} />
            </button>
          </div>
          
          <p className="text-gray-500 text-sm font-medium animate-pulse">Position item within the frame...</p>
        </div>
      )}

      {/* PROCESSING STATE */}
      {status === 'PROCESSING' && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6" />
          <h3 className="font-bold text-lg text-gray-900 mb-2">Analyzing with Gemini AI</h3>
          <p className="text-gray-500 text-sm text-center">Comparing {capturedImages.length} photo(s) against immutable ledger records...</p>
        </div>
      )}

      {/* AUTHENTIC STATE */}
      {status === 'AUTHENTIC' && (
        <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-sm relative">
            <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-20" />
            <CheckCircle2 size={40} />
          </div>
          <h3 className="font-bold text-2xl text-green-700 mb-2">Item Verified!</h3>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-green-800 text-sm font-medium mb-1">
              Gemini AI matched this item with the original cooperative scan.
            </p>
            <p className="text-xs text-green-600 font-bold uppercase tracking-wider">
              Match Score: {resultData?.similarityScore}%
            </p>
          </div>
          
          {onPurchaseComplete && (
            <button 
              onClick={onPurchaseComplete} 
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1"
            >
              Buy Now & Reveal Artisan
            </button>
          )}
        </div>
      )}

      {/* FLAGGED STATE */}
      {status === 'FLAGGED' && (
        <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-sm relative">
            <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-20" />
            <AlertTriangle size={40} />
          </div>
          <h3 className="font-bold text-2xl text-red-700 mb-2">Counterfeit Flagged!</h3>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left w-full">
            <p className="text-red-900 text-sm font-medium mb-2 border-b border-red-200 pb-2">
              <span className="font-bold">Match Score: {resultData?.similarityScore}%</span>
            </p>
            <p className="text-xs text-red-800">
              <span className="font-bold">AI Reasoning:</span> {resultData?.reasoning}
            </p>
          </div>
          <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mb-6">
            <Flag size={14} className="text-red-400" />
            This event has been permanently recorded in the Audit Log.
          </p>
        </div>
      )}

    </div>
  );
}
