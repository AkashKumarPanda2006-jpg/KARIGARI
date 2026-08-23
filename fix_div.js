
const fs = require('fs');
let text = fs.readFileSync('src/app/artisan/insights/page.tsx', 'utf8');
text = text.replace('          </div>\n        </div>\n\n        {/* Right Column: AI Actionable Advice */}', '        </div>\n\n        {/* Right Column: AI Actionable Advice */}');
fs.writeFileSync('src/app/artisan/insights/page.tsx', text);

