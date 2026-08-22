const fs = require('fs');
const file = 'src/app/verify/[patchId]/VerificationClient.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'const [isPurchased, setIsPurchased] = useState(false);',
  'const [isPurchased, setIsPurchased] = useState(item.status === \'SOLD_FINAL\' || item.status === \'SOLD_MIDDLEMAN\');'
);

const oldBadge = '<div className=\"absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm\">\n              <CheckCircle2 size={14} />\n              Verified Item\n            </div>';
const newBadge = '<div className=\"absolute top-4 right-4 flex flex-col gap-2\"><div className=\"bg-white/90 backdrop-blur-sm text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm\"><CheckCircle2 size={14} /> Karigari Verified Product</div><div className=\"bg-white/90 backdrop-blur-sm text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm\"><ShieldCheck size={14} /> Karigari Verified Artisan</div></div>';

content = content.replace(oldBadge, newBadge);
fs.writeFileSync(file, content);
console.log('Fixed');
