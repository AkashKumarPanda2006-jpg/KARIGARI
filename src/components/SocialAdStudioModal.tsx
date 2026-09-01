"use client";

import { useState } from "react";
import { X, Sparkles, Camera, Video, Share2, Copy, Check, MessageSquare, ExternalLink, Loader2, Award } from "lucide-react";

interface SocialAdStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  craftItem?: {
    id: string;
    patchId?: string;
    craftType: string;
    images?: string[];
    askingPrice?: number;
    standardMarketPrice?: number;
    laborDays?: number;
    artisanName?: string;
    clusterName?: string;
    description?: string;
  } | null;
}

export function SocialAdStudioModal({ isOpen, onClose, craftItem }: SocialAdStudioModalProps) {
  const [activeTab, setActiveTab] = useState<"reel" | "instagram" | "whatsapp" | "affiliate">("reel");
  const [isLoading, setIsLoading] = useState(false);
  const [adData, setAdData] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const craft = craftItem || {
    id: "demo",
    patchId: "PAT-99283-OD",
    craftType: "Sambalpuri Ikat Silk Saree",
    images: ["/ikat_saree.jpg"],
    askingPrice: 4500,
    standardMarketPrice: 6200,
    laborDays: 14,
    artisanName: "Lakshmi Devi",
    clusterName: "Bargarh, Odisha",
    description: "100% pure Mulberry silk handwoven using traditional tie-dye resist technique."
  };

  const shoppableUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/verify/${craft.patchId || "PAT-101"}` 
    : `https://karigari.in/verify/${craft.patchId || "PAT-101"}`;

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/artisan/generate-social-ad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          craftType: craft.craftType,
          artisanName: craft.artisanName,
          clusterName: craft.clusterName,
          price: craft.askingPrice || 4500,
          laborDays: craft.laborDays || 12,
          description: craft.description
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAdData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up font-sans">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">
        
        {/* Header */}
        <div className="bg-[#24332C] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg leading-tight">AI Social Studio & Viral Ad Engine</h2>
              <p className="text-xs text-white/70">Generate 1-Click Instagram Reels, Shoppable Links & Ad Creatives</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Action Bar / Item context */}
        <div className="bg-[#F5F8F6] px-6 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">Selected Craft:</span>
            <span className="bg-white px-2.5 py-1 rounded-lg border border-gray-200 font-semibold text-[#24332C]">{craft.craftType}</span>
            <span className="text-gray-400">•</span>
            <span className="font-bold text-green-700">₹{craft.askingPrice}</span>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-[#24332C] hover:bg-[#14211B] text-white px-4 py-1.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all text-xs disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-amber-400" />}
            {adData ? "Regenerate AI Content" : "✨ Generate Viral Ads Now"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white px-6 shrink-0">
          <button
            onClick={() => setActiveTab("reel")}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors ${activeTab === "reel" ? "border-[#24332C] text-[#24332C]" : "border-transparent text-gray-500 hover:text-gray-900"}`}
          >
            <Video size={16} /> 15s Reel Script
          </button>
          <button
            onClick={() => setActiveTab("instagram")}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors ${activeTab === "instagram" ? "border-[#24332C] text-[#24332C]" : "border-transparent text-gray-500 hover:text-gray-900"}`}
          >
            <Camera size={16} /> Instagram Post & Ad
          </button>
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors ${activeTab === "whatsapp" ? "border-[#24332C] text-[#24332C]" : "border-transparent text-gray-500 hover:text-gray-900"}`}
          >
            <MessageSquare size={16} /> WhatsApp Broadcast
          </button>
          <button
            onClick={() => setActiveTab("affiliate")}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors ${activeTab === "affiliate" ? "border-[#24332C] text-[#24332C]" : "border-transparent text-gray-500 hover:text-gray-900"}`}
          >
            <Award size={16} /> Creator Affiliate
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-6">
          
          {/* Shoppable Link Banner (Universal) */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1 mb-1">
                <Share2 size={13} /> 1-Click Shoppable Social Link (Headless Checkout)
              </div>
              <p className="text-xs text-emerald-900/80 font-mono truncate max-w-md">{shoppableUrl}</p>
            </div>
            <button
              onClick={() => copyToClipboard(shoppableUrl, "shoppable-link")}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
            >
              {copiedKey === "shoppable-link" ? <Check size={14} /> : <Copy size={14} />}
              {copiedKey === "shoppable-link" ? "Copied!" : "Copy Link for IG Bio"}
            </button>
          </div>

          {/* Tab 1: Reel / Shorts Teleprompter */}
          {activeTab === "reel" && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Video size={16} className="text-purple-600" /> 15-Second Viral Reel Script & Teleprompter
                  </span>
                  <span className="text-[11px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">TikTok / Reel / Short</span>
                </div>

                <div className="space-y-3">
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-xl">
                    <div className="text-[11px] font-bold text-red-800 uppercase tracking-wider mb-1">💥 Hook (0 - 3 Seconds)</div>
                    <p className="text-sm text-gray-800 font-medium">
                      {adData?.reelScript?.hook || "\"Did you know a machine takes 20 minutes to fake this saree, while Lakshmi Devi spent 14 days handweaving it?\""}
                    </p>
                  </div>

                  <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-xl">
                    <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">📖 Story & Value (4 - 10 Seconds)</div>
                    <p className="text-sm text-gray-800 font-medium">
                      {adData?.reelScript?.body || "\"Handcrafted with pure natural dyes and 100% organic silk. Every thread carries a GI-certified heritage code.\""}
                    </p>
                  </div>

                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-xl">
                    <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1">🎯 Call-to-Action (11 - 15 Seconds)</div>
                    <p className="text-sm text-gray-800 font-medium">
                      {adData?.reelScript?.cta || "\"Tap the link in bio to inspect the live QR digital passport and support the artisan directly with 0% middleman cut!\""}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(`${adData?.reelScript?.hook || ''}\n\n${adData?.reelScript?.body || ''}\n\n${adData?.reelScript?.cta || ''}`, "reel-script")}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  {copiedKey === "reel-script" ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  {copiedKey === "reel-script" ? "Reel Script Copied!" : "Copy Complete Voiceover Script"}
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Instagram Post & Creative */}
          {activeTab === "instagram" && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Camera size={16} className="text-pink-600" /> High-Converting Post Caption & Hashtags
                  </span>
                  <span className="text-[11px] bg-pink-100 text-pink-800 font-bold px-2 py-0.5 rounded-full">Instagram / Facebook</span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Suggested Caption</h4>
                  <p className="text-sm text-gray-800 bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed">
                    {adData?.instagramCaption || "Every thread tells a story of heritage, patience, and pride. Handcrafted over 14 days by master weavers in Odisha. Scan the digital passport to see Lakshmi Devi's workshop and buy authentic with zero middleman markups."}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Trending SEO Hashtags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(adData?.hashtags || ["#VocalForLocal", "#HandloomSaree", "#AuthenticIkat", "#SlowFashion", "#DiwaliShopping"]).map((tag: string, i: number) => (
                      <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-lg font-mono font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => copyToClipboard(`${adData?.instagramCaption || "Handcrafted with love."}\n\nShop Direct: ${shoppableUrl}\n\n${(adData?.hashtags || []).join(" ")}`, "ig-caption")}
                    className="flex-1 py-2.5 bg-[#24332C] hover:bg-[#14211B] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    {copiedKey === "ig-caption" ? <Check size={14} /> : <Copy size={14} />}
                    {copiedKey === "ig-caption" ? "Caption & Tags Copied!" : "Copy Caption & Tags for IG"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: WhatsApp Broadcast */}
          {activeTab === "whatsapp" && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <MessageSquare size={16} className="text-green-600" /> 1-Tap WhatsApp Broadcast / Status Message
                  </span>
                  <span className="text-[11px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">Conversational Commerce</span>
                </div>

                <div className="bg-[#E7FFDB] p-4 rounded-2xl border border-green-200 text-gray-900 text-sm whitespace-pre-line leading-relaxed font-sans shadow-inner">
                  {adData?.whatsappPitch || `🌟 *Authentic Handloom Special from ${craft.clusterName}* 🌟\n\nDirect from weaver ${craft.artisanName}. 100% Genuine with QR Digital Passport.\n\nPrice: ₹${craft.askingPrice} (Zero Middleman Commission)\n\n👉 *Tap to view and order direct:* ${shoppableUrl}`}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => copyToClipboard(adData?.whatsappPitch || `Buy direct: ${shoppableUrl}`, "wa-text")}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    {copiedKey === "wa-text" ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    {copiedKey === "wa-text" ? "Copied!" : "Copy Text"}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(adData?.whatsappPitch || `Authentic ${craft.craftType} available direct from weaver: ${shoppableUrl}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <Share2 size={14} /> Open in WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Creator Affiliate Bridge */}
          {activeTab === "affiliate" && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Award size={16} className="text-amber-600" /> Heritage Micro-Affiliate Bridge for Fashion Creators
                  </span>
                  <span className="text-[11px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">5% Creator Reward</span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  Invite Instagram fashion creators and YouTube vloggers to showcase this craft in their videos. When their viewers buy using their custom link, the creator earns a 5% reward, and the artisan keeps 85%+ direct payout!
                </p>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <strong>Creator Collaboration Pitch:</strong>
                  <p className="mt-1 italic">
                    {adData?.microAffiliateOffer || `"Hi! We'd love to collaborate with you to celebrate authentic Indian weavers. Share this verified GI-tagged ${craft.craftType} with your audience, earn a 5% heritage affiliate commission, and help eliminate middlemen!"`}
                  </p>
                </div>

                <button
                  onClick={() => copyToClipboard(adData?.microAffiliateOffer || "Collaborate with our artisans!", "affiliate-pitch")}
                  className="w-full py-2.5 bg-[#24332C] hover:bg-[#14211B] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  {copiedKey === "affiliate-pitch" ? <Check size={14} /> : <Copy size={14} />}
                  {copiedKey === "affiliate-pitch" ? "Pitch Copied!" : "Copy Creator Outreach DM"}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-3 border-t border-gray-200 flex justify-between items-center shrink-0 text-xs text-gray-500">
          <span>Powered by Groq LLaMA 3.3 Viral Marketing Engine</span>
          <button onClick={onClose} className="font-bold text-gray-700 hover:text-gray-900">
            Close Studio
          </button>
        </div>

      </div>
    </div>
  );
}
