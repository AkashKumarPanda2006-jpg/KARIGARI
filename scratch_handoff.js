const fs = require('fs');

let content = fs.readFileSync('src/components/AgentHandoffModal.tsx', 'utf8');

// 1. Add QRCode import
if (!content.includes('react-qr-code')) {
  content = content.replace('import { CheckCircle2,', 'import QRCode from "react-qr-code";\nimport { CheckCircle2,');
}

// 2. Replace QR Image Tag
content = content.replace(
  /{[\s\S]*?\/\/ eslint-disable-next-line @next\/next\/no-img-element\n\s*<img\s*src=\{https:\/\/api.qrserver.com\/v1\/create-qr-code\/\?size=150x150&data=\$\{encodeURIComponent\(typeof window !== 'undefined' \? \$\{window.location.origin\}\/verify\/\$\{item.patchId\} : http:\/\/localhost:3000\/verify\/\$\{item.patchId\}\)\}\}\s*alt="QR Code"\s*className="w-full h-full mix-blend-multiply"\s*\/>/m,
  \<QRCode 
                      value={typeof window !== 'undefined' ? \\\\\\/verify/\\\\\\ : \\\http://localhost:3000/verify/\\\\\\} 
                      size={150} 
                      className="w-full h-full mix-blend-multiply" 
                   />\
);

// We need to reorder the steps manually because the strings are very large.
// It's safer to use write_to_file for the whole file. Let's just exit this node script and do that.
console.log('Use write_to_file instead.');
