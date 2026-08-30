"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, ExternalLink, ShieldCheck, Box, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MaterialsPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [craftName, setCraftName] = useState("Your Craft");

  useEffect(() => {
    async function fetchData() {
      try {
        // First fetch dashboard data to get the craft type
        const dbRes = await fetch('/api/artisan/dashboard');
        const dbData = await dbRes.json();
        
        const craftType = dbData.data?.artisanProfile?.craftType || "General Crafts";
        const clusterName = dbData.data?.artisanProfile?.clusterName || "Local Artisan Cluster";
        setCraftName(craftType);

        const res = await fetch('/api/artisan/generate-materials', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ craftType, clusterName })
        });
        const data = await res.json();
        if (data.success && data.data) {
          setMaterials(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link href="/artisan/dashboard" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
          <h1 className="font-serif font-bold text-xl text-gray-900">Source Raw Materials</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-6 items-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
            <Box size={32} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Verified Suppliers for {craftName}</h2>
            <p className="text-sm text-gray-600">Buy high-quality, authentic raw materials directly from government-approved suppliers. Buying verified materials improves your Karigari Trust Score.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Scanning the internet for local {craftName} suppliers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {materials.map((mat, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mat.image || "https://images.unsplash.com/photo-1584286595398-a59f2afdd7ea?w=400&q=80"} alt={mat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {mat.isVerified !== false && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-green-700 flex items-center gap-1 shadow-sm">
                      <ShieldCheck size={14} /> Verified Supplier
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{mat.name}</h3>
                    <span className="font-bold text-xl text-[#24332C]">{mat.price}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">{mat.supplier}</div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 mb-6">
                    <span className="flex items-center gap-1"><MapPin size={14} /> {mat.location}</span>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <Phone size={16} /> Contact
                    </button>
                    <button className="flex-1 py-2.5 rounded-xl bg-[#24332C] text-white font-bold hover:bg-[#1a2520] transition-colors flex items-center justify-center gap-2 shadow-md">
                      Buy Now <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
