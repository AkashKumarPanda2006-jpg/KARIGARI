"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Award, FileText, ChevronRight, UserCheck, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/translations";
import { KarigariLogo } from "@/components/ui/KarigariLogo";
import { useRouter } from "next/navigation";

export default function SchemesPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newlyApplied, setNewlyApplied] = useState<number[]>([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/artisan/dashboard');
      const data = await res.json();
      if (data.success) {
        setProfile(data.data.artisanProfile);
        setApplications(data.data.schemeApplications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const allSchemes = [
    {
      id: 1,
      name: language === "or" ? "ପିଏମ୍ ବିଶ୍ୱକର୍ମା ଯୋଜନା" : language === "hi" ? "पीएम विश्वकर्मा योजना" : "PM Vishwakarma Yojana",
      description: language === "or" ? "ପାରମ୍ପରିକ କାରିଗରମାନଙ୍କ ପାଇଁ ଦକ୍ଷତା ବିକାଶ ଏବଂ କ୍ରେଡିଟ୍ ସମର୍ଥନ।" : language === "hi" ? "पारंपरिक कारीगरों के लिए कौशल विकास और क्रेडिट सहायता।" : "Skill upgradation, toolkit incentive (₹15,000) and credit support for traditional artisans.",
      amount: "₹15,000",
      incomeLimit: 200000,
      icon: <Award className="text-orange-500" size={24} />
    },
    {
      id: 2,
      name: language === "or" ? "ଜାତୀୟ ହସ୍ତତନ୍ତ ବିକାଶ କାର୍ଯ୍ୟକ୍ରମ" : language === "hi" ? "राष्ट्रीय हस्तशिल्प विकास कार्यक्रम" : "National Handicraft Development Programme",
      description: language === "or" ? "ପ୍ରଦର୍ଶନୀ, ବଜାର ପ୍ରବେଶ ଏବଂ ସ୍ୱାସ୍ଥ୍ୟ ବୀମା ପାଇଁ ସରକାରୀ ସହାୟତା।" : language === "hi" ? "प्रदर्शनियों, बाजार पहुंच और स्वास्थ्य बीमा के लिए सरकारी सहायता।" : "Government support for exhibitions, market access and health insurance.",
      amount: "Health Cover",
      incomeLimit: 500000,
      icon: <CheckCircle2 className="text-blue-500" size={24} />
    },
    {
      id: 3,
      name: language === "or" ? "ଅମ୍ବେଦକର ହସ୍ତଶିଳ୍ପ ବିକାଶ ଯୋଜନା" : language === "hi" ? "अम्बेडकर हस्तशिल्प विकास योजना" : "Ambedkar Hastshilp Vikas Yojana",
      description: language === "or" ? "ମହିଳା ଏବଂ ଏସସି/ଏସଟି କାରିଗରମାନଙ୍କ ପାଇଁ ବୈଷୟିକ ଏବଂ ଆର୍ଥିକ ସହାୟତା।" : language === "hi" ? "महिलाओं और एससी/एसटी कारीगरों के लिए तकनीकी और वित्तीय सहायता।" : "Technical and financial assistance specifically for SC/ST and women artisans.",
      amount: "₹25,000 Grant",
      incomeLimit: 150000,
      icon: <FileText className="text-purple-500" size={24} />
    }
  ];

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

  const income = profile?.annualIncome || 0;
  const eligibleSchemes = allSchemes.filter(s => income <= s.incomeLimit);

  const handleAutoApply = (id: number) => {
    if (!profile?.aadhaarLast4) {
      alert("Aadhaar details missing. Please update your profile.");
      return;
    }
    // Simulate API call for auto-apply
    setTimeout(() => {
      setNewlyApplied([...newlyApplied, id]);
      alert("Success! Your agent has submitted the application using your verified Aadhaar and Income profile.");
    }, 800);
  };

  const getSchemeStatus = (schemeName: string, schemeId: number) => {
    // 1. Check if just applied
    if (newlyApplied.includes(schemeId)) {
      return { status: 'PENDING_APPROVAL', notes: 'Application submitted successfully. Under review.' };
    }
    // 2. Check DB
    const app = applications.find(a => a.schemeName === schemeName || (schemeName.includes('Handicraft') && a.schemeName.includes('Handicraft')));
    if (app) return { status: app.status, notes: app.notes };
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-16">
      <header className="px-4 sm:px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/artisan/dashboard" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{language === "or" ? "ସରକାରୀ ଯୋଜନା" : language === "hi" ? "सरकारी योजनाएं" : "Government Schemes"}</h1>
        </div>
        <KarigariLogo variant="dark" showWordmark={true} size={28} />
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Verification Banner */}
        <div className="bg-[#1A4731] text-white p-6 rounded-2xl shadow-sm mb-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center shrink-0">
            <ShieldCheck size={32} className="text-green-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold mb-1">{language === "or" ? "ଆଧାର ଏବଂ ଆୟ ଯାଞ୍ଚ ହୋଇଛି" : language === "hi" ? "आधार और आय सत्यापित" : "Aadhaar & Income Verified"}</h2>
            <p className="text-white/80 text-sm">
              Your profile is verified. Aadhaar ending in <span className="font-mono font-bold">{profile?.aadhaarLast4 || 'XXXX'}</span>. 
              Declared annual income: <span className="font-bold">₹{income.toLocaleString()}</span>.
            </p>
          </div>
          <div className="shrink-0 bg-white text-[#1A4731] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
            <UserCheck size={16}/> {language === "or" ? "ସ୍ୱତଃ-ପ୍ରୟୋଗ ସକ୍ଷମ ହୋଇଛି" : language === "hi" ? "स्वतः-लागू सक्षम" : "Auto-Apply Enabled"}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">{language === "or" ? "ଆପଣଙ୍କ ପାଇଁ ଯୋଗ୍ୟ" : language === "hi" ? "आपके लिए योग्य" : "Eligible For You"} ({eligibleSchemes.length})</h3>
          <p className="text-sm text-gray-500">{language === "or" ? "ଆପଣଙ୍କ ଆୟ ପ୍ରୋଫାଇଲ୍ ଉପରେ ଆଧାର କରି, ଆପଣ ଏହି ଯୋଜନାଗୁଡ଼ିକ ପାଇଁ ଯୋଗ୍ୟ ଅଟନ୍ତି।" : language === "hi" ? "आपकी आय प्रोफ़ाइल के आधार पर, आप इन योजनाओं के लिए पूर्व-योग्य हैं।" : "Based on your income profile, you pre-qualify for these schemes."}</p>
        </div>

        <div className="space-y-4">
          {eligibleSchemes.map((scheme) => {
            const statusData = getSchemeStatus(scheme.name, scheme.id);
            return (
              <div key={scheme.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                      {scheme.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-1">{scheme.name}</h4>
                      <p className="text-sm text-gray-500 mb-3 max-w-lg">{scheme.description}</p>
                      <div className="inline-flex bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100 mb-2">
                        Benefit: {scheme.amount}
                      </div>
                      {statusData && (
                        <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg text-sm text-gray-600">
                          <span className="font-bold text-gray-900">Agent Update:</span> {statusData.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-4 sm:mt-0 sm:min-w-[160px]">
                    {statusData ? (
                      <div className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 border ${
                        statusData.status === 'DISBURSED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        statusData.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                        'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {statusData.status === 'DISBURSED' ? <Award size={16}/> : 
                         statusData.status === 'APPROVED' ? <CheckCircle2 size={16}/> : 
                         <Clock size={16} />}
                        {statusData.status.replace('_', ' ')}
                      </div>
                    ) : (
                      <>
                        <button onClick={() => handleAutoApply(scheme.id)} className="bg-[#0F2D20] hover:bg-[#1A4731] text-white w-full py-3 rounded-xl font-bold shadow-sm transition-colors text-sm">
                          Auto-Apply via Agent
                        </button>
                        <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 w-full py-2 rounded-xl font-bold shadow-sm transition-colors text-sm">
                          Apply Manually
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
