const fs = require('fs');
const path = require('path');

function unescapeBackticks(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace \ with 
    content = content.replace(/\\/g, '');
    // Replace \$ with $
    content = content.replace(/\\\$/g, '$');
    fs.writeFileSync(filePath, content);
}

unescapeBackticks('src/app/artisan/dashboard/page.tsx');
unescapeBackticks('src/components/AgentHandoffModal.tsx');
unescapeBackticks('src/app/admin/dashboard/page.tsx');

console.log('Fixed backslashes');
