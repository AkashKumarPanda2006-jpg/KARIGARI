const fs = require('fs');

const landingConfig = {
  "colors": {
    "primary-fixed": "#baeaff",
    "primary": "#0c6780",
    "on-tertiary-container": "#505150",
    "on-primary": "#ffffff",
    "surface-container-lowest": "#ffffff",
    "primary-fixed-dim": "#89d0ed",
    "error-container": "#ffdad6",
    "inverse-primary": "#89d0ed",
    "primary-container": "#87ceeb",
    "rosy-pink": "#F4C2C2",
    "on-secondary-fixed-variant": "#613d3e",
    "deep-ink": "#1A1C1E",
    "platinum-accent": "#E5E4E2",
    "surface-container": "#eceef0",
    "on-error-container": "#93000a",
    "secondary-fixed-dim": "#ecbaba",
    "inverse-surface": "#2d3133",
    "silver-zari": "#C0C0C0",
    "secondary-container": "#fecbcb",
    "on-background": "#191c1e",
    "on-primary-fixed": "#001f29",
    "secondary": "#7b5455",
    "surface-tint": "#0c6780",
    "on-error": "#ffffff",
    "surface-variant": "#e0e3e5",
    "surface": "#f7f9fb",
    "tertiary-container": "#c5c4c2",
    "tertiary-fixed": "#e3e2e0",
    "background": "#f7f9fb",
    "outline": "#6f787d",
    "tertiary": "#5e5e5d",
    "surface-container-low": "#f2f4f6",
    "on-secondary-fixed": "#2f1314",
    "outline-variant": "#bfc8cd",
    "inverse-on-surface": "#eff1f3",
    "on-surface-variant": "#3f484c",
    "on-secondary-container": "#7a5354",
    "on-secondary": "#ffffff",
    "on-tertiary-fixed-variant": "#464746",
    "surface-dim": "#d8dadc",
    "surface-bright": "#f7f9fb",
    "tertiary-fixed-dim": "#c7c6c4",
    "secondary-fixed": "#ffdad9",
    "surface-container-high": "#e6e8ea",
    "surface-container-highest": "#e0e3e5",
    "on-primary-container": "#005870",
    "on-surface": "#191c1e",
    "error": "#ba1a1a",
    "on-tertiary": "#ffffff",
    "on-tertiary-fixed": "#1b1c1b",
    "sky-blue": "#87CEEB",
    "on-primary-fixed-variant": "#004d62"
  },
  "spacing": {
    "margin-mobile": "20px",
    "margin-desktop": "80px",
    "unit": "8px",
    "gutter": "24px",
    "section-gap": "120px",
    "glass-padding": "32px"
  }
};

const adminConfig = {
  "colors": {
    "surface-container-highest": "#e0e3e5",
    "on-error-container": "#93000a",
    "error-container": "#ffdad6",
    "on-secondary": "#ffffff",
    "outline": "#6f787d",
    "on-tertiary-container": "#515151",
    "on-primary-fixed": "#001f29",
    "on-surface": "#191c1e",
    "on-primary-fixed-variant": "#004d62",
    "error": "#ba1a1a",
    "surface-tint": "#0c6780",
    "on-tertiary-fixed": "#1b1b1b",
    "surface-container": "#eceef0",
    "surface": "#f7f9fc",
    "surface-variant": "#e0e3e5",
    "liquid-gradient-end": "#F4C2C2",
    "primary-fixed": "#baeaff",
    "surface-bright": "#f7f9fc",
    "on-secondary-fixed": "#2f1314",
    "on-secondary-fixed-variant": "#613d3e",
    "tertiary": "#000000",
    "outline-variant": "#bfc8cd",
    "background": "#f7f9fc",
    "tertiary-fixed-dim": "#c6c6c6",
    "primary-container": "#87ceeb",
    "inverse-on-surface": "#eff1f3",
    "on-primary-container": "#005870",
    "inverse-surface": "#2d3133",
    "primary": "#0c6780",
    "primary-fixed-dim": "#89d0ed",
    "glass-border": "rgba(255, 255, 255, 0.6)",
    "on-tertiary": "#ffffff",
    "on-error": "#ffffff",
    "on-secondary-container": "#7a5354",
    "inverse-primary": "#89d0ed",
    "on-surface-variant": "#3f484c",
    "on-tertiary-fixed-variant": "#474747",
    "surface-container-high": "#e6e8ea",
    "secondary": "#7b5455",
    "surface-container-low": "#f2f4f6",
    "secondary-container": "#fecbcb",
    "liquid-gradient-start": "#87CEEB",
    "tertiary-container": "#c4c4c4",
    "surface-container-lowest": "#ffffff",
    "secondary-fixed-dim": "#ecbaba",
    "on-primary": "#ffffff",
    "tertiary-fixed": "#e2e2e2",
    "on-background": "#191c1e",
    "surface-dim": "#d8dadc",
    "glass-white": "rgba(255, 255, 255, 0.4)",
    "secondary-fixed": "#ffdad9",
    "zari-gold": "#D4AF37",
    "sky-blue": "#87CEEB",
    "rosy-pink": "#F4C2C2",
    "ink-charcoal": "#1A1C1E"
  }
};

const colors = { ...landingConfig.colors, ...adminConfig.colors };
const spacing = { ...landingConfig.spacing };

let themeStr = '@import "tailwindcss";\n\n@theme {\n';
for (const [k, v] of Object.entries(colors)) {
  themeStr += `  --color-${k}: ${v};\n`;
}
for (const [k, v] of Object.entries(spacing)) {
  themeStr += `  --spacing-${k}: ${v};\n`;
}

// Add fonts mapping to CSS variables we will define in layout
themeStr += `
  --font-headline-md: var(--font-bodoni), var(--font-playfair), serif;
  --font-headline-lg: var(--font-bodoni), var(--font-playfair), serif;
  --font-display-lg-mobile: var(--font-bodoni), var(--font-playfair), serif;
  --font-display-lg: var(--font-bodoni), var(--font-playfair), serif;
  --font-body-lg: var(--font-montserrat), var(--font-inter), sans-serif;
  --font-body-md: var(--font-montserrat), var(--font-inter), sans-serif;
  --font-label-lg: var(--font-montserrat), var(--font-inter), sans-serif;
  --font-label-sm: var(--font-montserrat), var(--font-inter), sans-serif;
`;

themeStr += '}\n\n';

themeStr += `:root {
  --background: #F9FAFB;
  --foreground: #111827;
}

body {
  background: var(--background);
  color: var(--foreground);
}

@layer base {
  html, body { margin: 0; padding: 0; }
  body { overscroll-behavior: none; }
  main > :first-child { margin-top: 0 !important; }
  main > :last-child { margin-bottom: 0 !important; }
}

::-webkit-scrollbar { display: none; }

.glass-panel {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
}

.fluid-bg {
  background: linear-gradient(135deg, #87CEEB 0%, #F4C2C2 100%);
  background-attachment: fixed;
}

.silk-gradient {
  background: linear-gradient(135deg, rgba(0,17,58,1) 0%, rgba(0,35,102,1) 100%);
  position: relative;
  overflow: hidden;
}

.silk-gradient::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('https://www.transparenttextures.com/patterns/silk.png');
  opacity: 0.1;
  pointer-events: none;
}
`;

fs.writeFileSync('src/app/globals.css', themeStr);
console.log("Updated globals.css");
