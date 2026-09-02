"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, IndianRupee, ShieldCheck, PieChart as PieIcon, BarChart3, Award, Sparkles, Download, CheckCircle2, ArrowUpRight, Clock, Info } from "lucide-react";
import { KarigariLogo } from "@/components/ui/KarigariLogo";
import { useLanguage } from "@/lib/translations";
import { formatINR } from "@/lib/formatters";

export default function ArtisanEarningsPage() {
  const { t, language } = useLanguage();
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // Sample data for artisan earnings analytics
  const lifetimeStats = {
    grossVolume: 284500,
    advancesPaid: 113800, // 40% Fair Wage Advance
    settlementsCleared: 140480, // Final Settlements
    platformFeeDeducted: 9957, // 3.5% maintenance
    middlemanSavings: 182080, // Extra money retained vs traditional middleman cut
    realizationRate: 89.36, // % of gross value to weaver
    traditionalRealization: 25.0 // % under old middlemen
  };

  const monthlyTally = [
    { month: "Jan", before: 6500, after: 24000 },
    { month: "Feb", before: 7200, after: 28500 },
    { month: "Mar", before: 5800, after: 31000 },
    { month: "Apr", before: 8000, after: 34500 },
    { month: "May", before: 6900, after: 38000 },
    { month: "Jun", before: 7500, after: 41200 },
    { month: "Jul", before: 8200, after: 43800 },
    { month: "Aug", before: 9000, after: 43500 },
  ];

  const wageBands = [
    { label: "Premium Band (>20% Above Floor)", percentage: 48, count: 36, color: "#10B981", bgClass: "bg-emerald-500", textClass: "text-emerald-700", borderClass: "border-emerald-200", bgLight: "bg-emerald-50" },
    { label: "Market Optimal (Fair Average)", percentage: 38, count: 28, color: "#3B82F6", bgClass: "bg-blue-500", textClass: "text-blue-700", borderClass: "border-blue-200", bgLight: "bg-blue-50" },
    { label: "Guaranteed Floor (Minimum Wage)", percentage: 14, count: 10, color: "#F59E0B", bgClass: "bg-amber-500", textClass: "text-amber-700", borderClass: "border-amber-200", bgLight: "bg-amber-50" },
    { label: "Below Floor (Exploitative)", percentage: 0, count: 0, color: "#EF4444", bgClass: "bg-red-500", textClass: "text-red-700", borderClass: "border-red-200", bgLight: "bg-red-50" },
  ];

  const signatureItem = {
    name: "Sambalpuri Pasapalli Silk Saree",
    category: "Handloom Silk",
    repeatOrderRate: 68,
    totalOrders: 38,
    repeatBuyers: 26,
    avgRating: 4.9,
    totalRevenue: 171000,
    demandVelocity: "High • 4.2 units / week",
    badge: "Top Seller • Heritage Signature"
  };

  const recentTransactions = [
    { id: "TXN-88291", craft: "Sambalpuri Ikat Silk Saree (PAT-101)", buyer: "Rajesh Retailers (Mumbai)", type: "Final Settlement (60%)", amount: 2430, date: "31 Aug 2026", vpa: "lakshmi@upi" },
    { id: "TXN-88285", craft: "Sambalpuri Ikat Silk Saree (PAT-101)", buyer: "Rajesh Retailers (Mumbai)", type: "Fair Wage Advance (40%)", amount: 1800, date: "28 Aug 2026", vpa: "lakshmi@upi" },
    { id: "TXN-88104", craft: "Pasapalli Silk Saree (PAT-99)", buyer: "Anita K. (Bengaluru)", type: "Direct Retail Sale (100%)", amount: 4021, date: "24 Aug 2026", vpa: "lakshmi@upi" },
    { id: "TXN-87942", craft: "Pattachitra Canvas Scroll (PAT-92)", buyer: "FabIndia B2B Bulk", type: "Final Settlement (60%)", amount: 8900, date: "19 Aug 2026", vpa: "lakshmi@upi" },
  ];

  // SVG Chart dimensions
  const chartHeight = 220;
  const chartWidth = 700;
  const maxVal = 50000;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-16">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/artisan/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <KarigariLogo variant="dark" showWordmark={true} size={28} />
          <span className="text-gray-300 font-light text-xl">|</span>
          <span className="font-bold text-[#24332C] text-sm sm:text-base tracking-wide">
            {language === 'hi' ? 'कमाई और वित्तीय विश्लेषण' : 'Earnings & Financial Analytics'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full border border-emerald-200">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>89.36% Direct Realization</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Page Title & Lifetime Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 flex items-center gap-2.5">
              <BarChart3 className="text-[#24332C]" size={30} />
              {language === 'hi' ? 'कुल संचयी कमाई' : 'Lifetime Financial Earnings'}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Transparent, non-custodial direct UPI earnings with AI fair wage floor protection.
            </p>
          </div>
          <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto">
            <Download size={14} /> Download Bank Statement
          </button>
        </div>

        {/* 4 Lifetime Lump-Sum Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Gross Sales</span>
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
                <IndianRupee size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900">₹{formatINR(lifetimeStats.grossVolume)}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight size={12} /> 74 total verified crafts sold
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">40% Instant Advances</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
                <Clock size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-blue-700">₹{formatINR(lifetimeStats.advancesPaid)}</div>
            <div className="text-[11px] text-gray-500 font-medium mt-1">
              Disbursed immediately upon dispatch
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">60% Final Settlements</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-700">₹{formatINR(lifetimeStats.settlementsCleared)}</div>
            <div className="text-[11px] text-gray-500 font-medium mt-1">
              Credited directly to UPI at delivery
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#24332C] to-[#14211B] text-white rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between text-white/70 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Middleman Savings</span>
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
                <Sparkles size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-400">+₹{formatINR(lifetimeStats.middlemanSavings)}</div>
            <div className="text-[11px] text-white/80 font-medium mt-1">
              Extra income kept vs. 25% middleman rate
            </div>
          </div>

        </div>

        {/* Contrast Comparison: Before vs. With Karigari (Crisp SVG Bar Chart) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp size={22} className="text-[#24332C]" />
                Income Contrast: Before vs. With Karigari
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Monthly income realization comparison demonstrating middleman elimination.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-gray-400"></div>
                <span className="text-gray-600">Before Karigari (Middlemen ~25%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-[#10B981]"></div>
                <span className="text-emerald-800">With Karigari (89.36% Direct)</span>
              </div>
            </div>
          </div>

          {/* Inline Responsive SVG Bar Chart */}
          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="w-full h-64 select-none">
              {/* Horizontal Gridlines */}
              {[0, 15000, 30000, 45000].map((val, idx) => {
                const y = chartHeight - (val / maxVal) * chartHeight + 10;
                return (
                  <g key={idx}>
                    <line x1="50" y1={y} x2={chartWidth - 20} y2={y} stroke="#E5E7EB" strokeDasharray="4" />
                    <text x="40" y={y + 4} textAnchor="end" fontSize="10" fill="#9CA3AF" fontFamily="sans-serif">
                      ₹{val / 1000}k
                    </text>
                  </g>
                );
              })}

              {/* Bars Group */}
              {monthlyTally.map((item, idx) => {
                const groupWidth = (chartWidth - 80) / monthlyTally.length;
                const xCenter = 65 + idx * groupWidth + groupWidth / 2;
                const barWidth = 14;

                const beforeH = (item.before / maxVal) * chartHeight;
                const afterH = (item.after / maxVal) * chartHeight;

                const beforeY = chartHeight - beforeH + 10;
                const afterY = chartHeight - afterH + 10;

                const isHovered = hoveredMonth === idx;

                return (
                  <g 
                    key={idx} 
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredMonth(idx)}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    {/* Before Bar */}
                    <rect
                      x={xCenter - barWidth - 2}
                      y={beforeY}
                      width={barWidth}
                      height={beforeH}
                      rx="3"
                      fill={isHovered ? "#9CA3AF" : "#D1D5DB"}
                      className="transition-colors duration-200"
                    />

                    {/* After Bar */}
                    <rect
                      x={xCenter + 2}
                      y={afterY}
                      width={barWidth}
                      height={afterH}
                      rx="3"
                      fill={isHovered ? "#059669" : "#10B981"}
                      className="transition-colors duration-200"
                    />

                    {/* Month Label */}
                    <text
                      x={xCenter}
                      y={chartHeight + 28}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill={isHovered ? "#111827" : "#4B5563"}
                      fontFamily="sans-serif"
                    >
                      {item.month}
                    </text>

                    {/* Hover Value Tooltip on SVG */}
                    {isHovered && (
                      <g>
                        <rect
                          x={xCenter - 45}
                          y={afterY - 32}
                          width="90"
                          height="24"
                          rx="6"
                          fill="#111827"
                        />
                        <text
                          x={xCenter}
                          y={afterY - 16}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="bold"
                          fill="#34D399"
                          fontFamily="sans-serif"
                        >
                          ₹{formatINR(item.after)}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Two-Column Grid: AI Wage Spectrum Realization + Signature Craft Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Column 1: AI Wage Spectrum Realization Distribution (Vector SVG Donut) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <PieIcon size={20} className="text-indigo-600" />
                  AI Wage Spectrum Realization
                </h3>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
                  Price Realization
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Percentage of crafts sold across the AI-generated fair price spectrum.
              </p>
            </div>

            {/* SVG Donut Chart + Legend */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* SVG Donut */}
              <div className="relative w-40 h-40 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Circle 1: 48% (strokeDasharray: 48 52) */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10B981" strokeWidth="16" strokeDasharray="120.6 130.6" strokeDashoffset="0" />
                  {/* Circle 2: 38% (strokeDasharray: 38 62) */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3B82F6" strokeWidth="16" strokeDasharray="95.5 155.5" strokeDashoffset="-120.6" />
                  {/* Circle 3: 14% (strokeDasharray: 14 86) */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F59E0B" strokeWidth="16" strokeDasharray="35.2 216" strokeDashoffset="-216.1" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-gray-900 leading-none">100%</span>
                  <span className="text-[9px] font-bold text-gray-400 mt-0.5">Fair Protected</span>
                </div>
              </div>

              {/* Legend Stack */}
              <div className="flex-1 w-full space-y-2">
                {wageBands.map((band, i) => (
                  <div key={i} className={`p-2.5 rounded-xl border ${band.borderClass} ${band.bgLight} flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${band.bgClass} shrink-0`} />
                      <span className="text-xs font-bold text-gray-800">{band.label}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className={`text-xs font-black ${band.textClass}`}>{band.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-emerald-100/60 p-3 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
              <span><strong>Anti-Exploitation Guarantee:</strong> 0% of sales occurred below the calculated Fair Wage Floor.</span>
            </div>
          </div>

          {/* Column 2: Artisan Signature Craft & Repeat Demand */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <Award size={20} className="text-amber-500" />
                  Signature Craft & Repeat Purchases
                </h3>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
                  {signatureItem.badge}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Identifies your most sought-after products re-ordered by repeat customers.
              </p>
            </div>

            {/* Signature Card Highlight */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-5 space-y-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-white/80 px-2 py-0.5 rounded-md border border-amber-200">
                    🏆 Most Re-Ordered Product
                  </span>
                  <h4 className="text-lg font-bold text-gray-900 mt-2">{signatureItem.name}</h4>
                  <span className="text-xs text-gray-600 font-medium">{signatureItem.category} • GI Certified</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-700">₹4,500</span>
                  <span className="text-[10px] text-gray-500 block">Avg Asking Price</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-200/60">
                <div className="bg-white/80 p-2.5 rounded-xl text-center border border-amber-100">
                  <div className="text-lg font-black text-gray-900">{signatureItem.repeatOrderRate}%</div>
                  <div className="text-[10px] text-gray-500 font-bold">Repeat Rate</div>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl text-center border border-amber-100">
                  <div className="text-lg font-black text-gray-900">{signatureItem.totalOrders}</div>
                  <div className="text-[10px] text-gray-500 font-bold">Total Sales</div>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl text-center border border-amber-100">
                  <div className="text-lg font-black text-gray-900">{signatureItem.avgRating} ★</div>
                  <div className="text-[10px] text-gray-500 font-bold">Buyer Rating</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-amber-900 font-medium pt-1">
                <span>Demand Velocity: <strong>{signatureItem.demandVelocity}</strong></span>
                <span className="font-bold text-amber-800">₹{formatINR(signatureItem.totalRevenue)} Generated</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs text-gray-600 flex items-center justify-between">
              <span>💡 <strong>AI Tip:</strong> Stock 10 extra units of Pasapalli silk before the festive season to capture peak demand.</span>
            </div>
          </div>

        </div>

        {/* Direct UPI Settlement Ledger */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-gray-900">Recent Direct UPI Payout Ledger</h3>
              <p className="text-xs text-gray-500">Every disbursement is transferred non-custodially directly to your bank VPA.</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Auto-Settled via Razorpay Route
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-6">Transaction ID</th>
                  <th className="py-3.5 px-6">Craft & Customer</th>
                  <th className="py-3.5 px-6">Disbursement Stage</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Destination VPA</th>
                  <th className="py-3.5 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {recentTransactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-gray-900">{tx.id}</td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{tx.craft}</div>
                      <div className="text-gray-400 text-[11px]">{tx.buyer}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-black text-emerald-700 text-sm">
                      +₹{formatINR(tx.amount)}
                    </td>
                    <td className="py-4 px-6 font-mono text-gray-500">{tx.vpa}</td>
                    <td className="py-4 px-6 text-gray-500">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
