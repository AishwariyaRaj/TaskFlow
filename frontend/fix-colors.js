const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src/styles/index.css');
let content = fs.readFileSync(cssPath, 'utf8');

// Tailwind bracket syntax
content = content.replace(/\[#0f0f13\]/gi, 'bg');
content = content.replace(/\[#1a1a24\]/gi, 'surface');
content = content.replace(/\[#22222e\]/gi, 'surface-2');
content = content.replace(/\[#2e2e3e\]/gi, 'border');
content = content.replace(/\[#f1f1f8\]/gi, 'text');
content = content.replace(/\[#8b8ba8\]/gi, 'muted');

// Raw CSS values
content = content.replace(/#0f0f13/gi, 'var(--color-bg)');
content = content.replace(/#1a1a24/gi, 'var(--color-surface)');
content = content.replace(/#22222e/gi, 'var(--color-surface-2)');
content = content.replace(/#2e2e3e/gi, 'var(--color-border)');
content = content.replace(/#f1f1f8/gi, 'var(--color-text)');
content = content.replace(/#8b8ba8/gi, 'var(--color-text-muted)');

fs.writeFileSync(cssPath, content);
console.log('Replaced colors in index.css');
