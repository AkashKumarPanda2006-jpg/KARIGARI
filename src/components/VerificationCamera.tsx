"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, X, ShieldCheck, AlertTriangle, UploadCloud, Flag, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface VerificationCameraProps {
  patchId: string;
}

export function VerificationCamera({ patchId }: VerificationCameraProps) {
  const [status, setStatus] = useState<'IDLE' | 'CAMERA_ACTIVE' | 'PROCESSING' | 'AUTHENTIC' | 'FLAGGED'>('IDLE');
  const [resultData, setResultData] = useState<{ similarityScore?: number, reasoning?: string } | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const handleVerify = async (base64Image: string) => {
    stopCamera();
    setStatus('PROCESSING');
    
    try {
      const res = await fetch('/api/verify-authenticity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patchId, scannedImageBase64: base64Image })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setResultData({
          similarityScore: data.similarityScore,
          reasoning: data.reasoning
        });
        if (data.isAuthentic) {
          setStatus('AUTHENTIC');
        } else {
          setStatus('FLAGGED');
        }
      } else {
        console.error(data.error);
        alert(data.error || "Verification failed");
        setStatus('IDLE');
      }
    } catch (err) {
      console.error(err);
      alert("Network error during verification");
      setStatus('IDLE');
    }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.8);
        handleVerify(dataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleVerify(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 animate-fade-in-up mt-6 relative overflow-hidden">
      
      {/* IDLE STATE */}
      {status === 'IDLE' && (
        <div className="flex flex-col items-center justify-center py-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck size={32} />
          </div>
          <h3 className="font-bold text-lg text-gray-900 mb-2">Verify Authenticity</h3>
          <p className="text-gray-500 text-sm text-center mb-6">Scan the physical item to compare it against the original cooperative records using AI.</p>
          
          <div className="grid grid-cols-1 gap-3 w-full">
            <button onClick={startCamera} className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
              <Camera size={18} /> Run AI Scan
            </button>
            <label className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors">
              <UploadCloud size={18} /> Upload Photo
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </div>
      )}

      {/* CAMERA ACTIVE STATE */}
      {status === 'CAMERA_ACTIVE' && (
        <div className="flex flex-col items-center">
          <div className="w-full relative bg-black rounded-2xl overflow-hidden aspect-square flex flex-col items-center justify-end shadow-inner mb-4">
            <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
            <canvas ref={canvasRef} width="640" height="640" className="hidden" />
            
            {/* Scanning Overlay Effect */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-1 bg-green-400/80 shadow-[0_0_15px_rgba(74,222,128,0.8)] absolute top-0 animate-[scan_2s_linear_infinite]" />
              <div className="absolute inset-8 border-2 border-white/20 rounded-xl" />
            </div>

            <button 
              onClick={captureFrame}
              className="relative z-10 mb-6 w-16 h-16 bg-white/30 backdrop-blur-md border-4 border-white rounded-full flex items-center justify-center hover:bg-white/50 transition-all active:scale-95 shadow-lg"
            >
              <div className="w-12 h-12 bg-white rounded-full" />
            </button>
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
          <p className="text-gray-500 text-sm text-center">Comparing fabric weave, color, and texture against immutable ledger records...</p>
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
          <button onClick={() => setStatus('IDLE')} className="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">
            Scan Another Item
          </button>
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
          <button onClick={() => setStatus('IDLE')} className="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">
            Scan Again
          </button>
        </div>
      )}

    </div>
  );
}
