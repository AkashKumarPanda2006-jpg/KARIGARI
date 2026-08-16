"use client";

import { useState, useEffect } from "react";
import { X, Save, Upload, User } from "lucide-react";
import Image from "next/image";

interface ProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  artisanData: any;
  onSaved: () => void;
}

export function ProfileEditorModal({ isOpen, onClose, artisanData, onSaved }: ProfileEditorModalProps) {
  const [photoUrl, setPhotoUrl] = useState(artisanData?.photoUrl || "/female_artisan.jpg");
  const [upiId, setUpiId] = useState(artisanData?.upiId || "");
  const [description, setDescription] = useState(artisanData?.description || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (artisanData) {
      setPhotoUrl(artisanData.photoUrl || "/female_artisan.jpg");
      setUpiId(artisanData.upiId || "");
      setDescription(artisanData.description || "");
    }
  }, [artisanData]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/artisan/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl, upiId, description })
      });
      if (res.ok) {
        onSaved();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-serif font-bold text-lg text-primary">Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 relative group">
              <Image src={photoUrl} alt="Profile" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload size={24} className="text-white" />
              </div>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <p className="text-xs text-gray-500 font-bold uppercase">Tap to change photo</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">UPI ID for Payments</label>
            <input 
              type="text" 
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. 9876543210@ybl"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">About Me (Bio)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell your story to the buyers..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
            />
          </div>
          
          <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-xl flex items-start gap-2">
            <User className="shrink-0 mt-0.5" size={14} />
            <p>Your Tags: <strong>{artisanData?.tags?.join(", ") || "None"}</strong>. Tags are added automatically when you capture new craft types.</p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors flex items-center gap-2"
          >
            {isSaving ? "Saving..." : <><Save size={18} /> Save Profile</>}
          </button>
        </div>
      </div>
    </div>
  );
}
