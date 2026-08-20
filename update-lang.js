const fs = require('fs');

let content = fs.readFileSync('src/lib/translations.ts', 'utf8');

const keysToAdd = {
  en: {
    transaction_details: "Transaction Details",
    advance_received: "Advance Received",
    total_valuation_band: "Total Valuation Band",
    labor_days: "Labor Days",
    material_cost: "Material Cost",
    close_btn: "Close",
    days: "Days"
  },
  hi: {
    transaction_details: "लेनदेन विवरण",
    advance_received: "अग्रिम प्राप्त",
    total_valuation_band: "कुल मूल्यांकन सीमा",
    labor_days: "श्रम के दिन",
    material_cost: "सामग्री लागत",
    close_btn: "बंद करें",
    days: "दिन"
  },
  or: {
    transaction_details: "କାରବାର ବିବରଣୀ",
    advance_received: "ଅଗ୍ରୀମ ଗ୍ରହଣ",
    total_valuation_band: "ମୋଟ ମୂଲ୍ୟାଙ୍କନ ବ୍ୟାଣ୍ଡ",
    labor_days: "ଶ୍ରମ ଦିନ",
    material_cost: "ସାମଗ୍ରୀ ଖର୍ଚ୍ଚ",
    close_btn: "ବନ୍ଦ କରନ୍ତୁ",
    days: "ଦିନ"
  },
  te: {
    transaction_details: "లావాదేవీ వివరాలు",
    advance_received: "అడ్వాన్స్ అందుకున్నారు",
    total_valuation_band: "మొత్తం వాల్యుయేషన్ బ్యాండ్",
    labor_days: "శ్రమ దినాలు",
    material_cost: "మెటీరియల్ ఖర్చు",
    close_btn: "మూసివేయి",
    days: "రోజులు"
  }
};

['en', 'hi', 'or', 'te'].forEach(lang => {
  const langKeys = keysToAdd[lang];
  const stringToAdd = Object.entries(langKeys).map(([k, v]) => `    ${k}: "${v}",`).join('\n');
  const regex = new RegExp(`(${lang}: \\{\\n)`);
  content = content.replace(regex, `$1${stringToAdd}\n`);
});

// Now replace useLanguage hook to use event listeners
content = content.replace(
  /export function useLanguage\(\) \{[\s\S]*?\n\}/,
  `export function useLanguage() {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    // Read from localStorage on mount
    const saved = localStorage.getItem("karigari_lang") as Language;
    if (saved && dictionary[saved]) {
      setLanguage(saved);
    }

    const handleStorageChange = (e: any) => {
      if (e.detail && dictionary[e.detail as Language]) {
        setLanguage(e.detail);
      }
    };
    window.addEventListener('language-change', handleStorageChange);
    return () => window.removeEventListener('language-change', handleStorageChange);
  }, []);

  const changeLanguage = (lang: Language) => {
    localStorage.setItem("karigari_lang", lang);
    setLanguage(lang);
    window.dispatchEvent(new CustomEvent('language-change', { detail: lang }));
  };

  const t = (key: string): string => {
    return dictionary[language]?.[key] || dictionary.en[key] || key;
  };

  return { language, changeLanguage, t };
}`
);

fs.writeFileSync('src/lib/translations.ts', content);
console.log("Updated translations.ts");
