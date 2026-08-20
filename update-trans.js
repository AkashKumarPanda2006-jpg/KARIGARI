const fs = require('fs');
let content = fs.readFileSync('src/lib/translations.ts', 'utf8');

// For English
content = content.replace(/assistant_intro: "(.*Namaste.*)",/g, 'assistant_intro: "$1",\n    ai_parsing_failed: "Sorry, I couldn\'t understand that. Please try again.",\n    ai_parsing_network_error: "Sorry, there was a network error.",');

// For Hindi
content = content.replace(/assistant_intro: "(.*नमस.*)",/g, 'assistant_intro: "$1",\n    ai_parsing_failed: "क्षमा करें, मुझे समझ नहीं आया। कृपया पुनः प्रयास करें।",\n    ai_parsing_network_error: "क्षमा करें, नेटवर्क त्रुटि हुई।",');

// For Odia
content = content.replace(/assistant_intro: "(.*ନମସ.*)",/g, 'assistant_intro: "$1",\n    ai_parsing_failed: "କ୍ଷମା କରିବେ, ମୁଁ ବୁଝିପାରିଲି ନାହିଁ। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।",\n    ai_parsing_network_error: "କ୍ଷମା କରିବେ, ଏକ ନେଟୱର୍କ ତ୍ରୁଟି ହୋଇଛି।",');

// For Telugu
content = content.replace(/assistant_intro: "(.*నమస.*)",/g, 'assistant_intro: "$1",\n    ai_parsing_failed: "క్షమించండి, నాకు అర్థం కాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.",\n    ai_parsing_network_error: "క్షమించండి, నెట్‌వర్క్ లోపం ఏర్పడింది.",');

fs.writeFileSync('src/lib/translations.ts', content);
