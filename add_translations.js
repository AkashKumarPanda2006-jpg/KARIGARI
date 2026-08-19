const fs = require('fs');

const path = 'src/lib/translations.ts';
let content = fs.readFileSync(path, 'utf8');

const newTranslations = {
  en: {
    craft_details: "Craft Details",
    upload_date: "Upload Date",
    blockchain_patch_id: "Blockchain Patch ID",
    verification_status: "Verification Status",
    action: "Action",
    pending_admin: "Pending Admin",
    flagged: "Flagged",
    verified: "Verified",
    initiate_handoff: "Initiate Agent Handoff",
    protocol_action: "Protocol Action",
    attach_patch_verify: "Attach Patch & Verify",
    recommendation_engine: "Recommendation Engine",
    agent_otp_handoff: "Agent OTP Handoff",
    confirm_route: "Confirm Route",
    transfer_custody: "Transfer Custody",
  },
  hi: {
    craft_details: "शिल्प विवरण",
    upload_date: "अपलोड की तारीख",
    blockchain_patch_id: "ब्लॉकचेन पैच आईडी",
    verification_status: "सत्यापन स्थिति",
    action: "कार्रवाई",
    pending_admin: "व्यवस्थापक लंबित",
    flagged: "फ़्लैग किया गया",
    verified: "सत्यापित",
    initiate_handoff: "एजेंट हैंडऑफ़ शुरू करें",
    protocol_action: "प्रोटोकॉल कार्रवाई",
    attach_patch_verify: "पैच संलग्न करें और सत्यापित करें",
    recommendation_engine: "सिफारिश इंजन",
    agent_otp_handoff: "एजेंट ओटीपी हैंडऑफ़",
    confirm_route: "मार्ग की पुष्टि करें",
    transfer_custody: "कस्टडी ट्रांसफर करें",
  },
  or: {
    craft_details: "ଶିଳ୍ପ ବିବରଣୀ",
    upload_date: "ଅପଲୋଡ୍ ତାରିଖ",
    blockchain_patch_id: "ବ୍ଲକଚେନ୍ ପ୍ୟାଚ୍ ଆଇଡି",
    verification_status: "ଯାଞ୍ଚ ସ୍ଥିତି",
    action: "କାର୍ଯ୍ୟ",
    pending_admin: "ଆଡମିନ୍ ବାକି ଅଛି",
    flagged: "ଫ୍ଲାଗ୍ ହୋଇଛି",
    verified: "ଯାଞ୍ଚ ହୋଇଛି",
    initiate_handoff: "ଏଜେଣ୍ଟ ହ୍ୟାଣ୍ଡଅଫ୍ ଆରମ୍ଭ କରନ୍ତୁ",
    protocol_action: "ପ୍ରୋଟୋକଲ୍ କାର୍ଯ୍ୟ",
    attach_patch_verify: "ପ୍ୟାଚ୍ ସଂଲଗ୍ନ କରନ୍ତୁ ଏବଂ ଯାଞ୍ଚ କରନ୍ତୁ",
    recommendation_engine: "ସୁପାରିଶ ଇଞ୍ଜିନ୍",
    agent_otp_handoff: "ଏଜେଣ୍ଟ ଓଟିପି ହ୍ୟାଣ୍ଡଅଫ୍",
    confirm_route: "ମାର୍ଗ ନିଶ୍ଚିତ କରନ୍ତୁ",
    transfer_custody: "କଷ୍ଟୋଡି ଟ୍ରାନ୍ସଫର କରନ୍ତୁ",
  },
  te: {
    craft_details: "క్రాఫ్ట్ వివరాలు",
    upload_date: "అప్‌లోడ్ తేదీ",
    blockchain_patch_id: "బ్లాక్‌చెయిన్ ప్యాచ్ ID",
    verification_status: "ధృవీకరణ స్థితి",
    action: "చర్య",
    pending_admin: "అడ్మిన్ పెండింగ్",
    flagged: "ఫ్లాగ్ చేయబడింది",
    verified: "ధృవీకరించబడింది",
    initiate_handoff: "ఏజెంట్ హ్యాండాఫ్ ప్రారంభించండి",
    protocol_action: "ప్రోటోకాల్ చర్య",
    attach_patch_verify: "ప్యాచ్ అటాచ్ చేయండి మరియు ధృవీకరించండి",
    recommendation_engine: "సిఫార్సు ఇంజిన్",
    agent_otp_handoff: "ఏజెంట్ OTP హ్యాండాఫ్",
    confirm_route: "మార్గాన్ని నిర్ధారించండి",
    transfer_custody: "కస్టడీ బదిలీ చేయండి",
  }
};

for (const lang in newTranslations) {
  const translations = newTranslations[lang];
  let injectedString = '';
  for (const key in translations) {
    injectedString += `    ${key}: "${translations[key]}",\n`;
  }
  
  const searchString = `  ${lang}: {`;
  content = content.replace(searchString, `${searchString}\n${injectedString}`);
}

fs.writeFileSync(path, content, 'utf8');
console.log("Translations added.");
