const fs = require('fs');
let lines = fs.readFileSync('src/lib/translations.ts', 'utf8').split('\n');
let seen = new Set();
let newLines = [];
let inObj = false;

for (let line of lines) {
  if (line.includes(': {')) {
    inObj = true;
    seen.clear();
    newLines.push(line);
    continue;
  }
  if (inObj && line.trim() === '},') {
    inObj = false;
    newLines.push(line);
    continue;
  }
  
  if (inObj) {
    let match = line.match(/^\s*([a-zA-Z0-9_]+):/);
    if (match) {
      let key = match[1];
      if (seen.has(key)) {
        continue; // skip duplicate
      }
      seen.add(key);
    }
  }
  newLines.push(line);
}
fs.writeFileSync('src/lib/translations.ts', newLines.join('\n'), 'utf8');
