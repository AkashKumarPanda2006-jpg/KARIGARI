const fs = require('fs');

// 1. UPDATE SCHEMA
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (!schema.includes('socialCategory')) {
  schema = schema.replace(
    '  healthScore     Float    @default(100)\n}',
    '  healthScore     Float    @default(100)\n\n  socialCategory  String?\n  annualIncome    Float?\n  aadhaarLast4    String?\n  clusterName     String?\n  giTagCertified  Boolean  @default(false)\n  giTagName       String?\n\n  @@index([socialCategory])\n}'
  );

  schema = schema.replace(
    '  failedScanCount     Int      @default(0)\n\n  auditLogs           AuditLog[]\n}',
    '  failedScanCount     Int      @default(0)\n\n  aiGeneratedListing   String?\n  aiSuggestedCategory  String?\n  giTagApplied         String?\n  isListedOnMarketplace Boolean @default(false)\n\n  auditLogs           AuditLog[]\n\n  @@index([artisanId])\n  @@index([patchId])\n  @@index([status])\n  @@index([createdAt])\n}'
  );

  schema += '\nmodel SchemeApplication {\n  id         String    @id @default(uuid())\n  userId     String\n  user       User      @relation(fields: [userId], references: [id])\n  schemeName String\n  status     String    @default("ELIGIBLE")\n  appliedAt  DateTime?\n  notes      String?\n  createdAt  DateTime  @default(now())\n  \n  @@index([userId])\n}\n';

  fs.writeFileSync('prisma/schema.prisma', schema, 'utf8');
  console.log('Schema updated successfully.');
}

// 2. UPDATE GLOBALS.CSS
const css = \@import "tailwindcss";

@theme {
  --color-primary: #1A4731;
  --color-primary-dark: #123323;
  --color-primary-light: #2c6e4e;
  --color-background: #F5F0E8;
  --color-foreground: #111827;
  --color-sidebar: #1A1A1A;
  --color-cream: #F5F0E8;
  --color-card: #FFFFFF;

  --color-stat-teal: #0D9488;
  --color-stat-orange: #EA580C;
  --color-stat-blue: #2563EB;
  --color-stat-brown: #92400E;

  --font-sans: var(--font-inter);
  --font-serif: var(--font-playfair);
  
  --shadow-soft: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
  --shadow-card: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
}

:root {
  --background: #F5F0E8;
  --foreground: #111827;
}

body {
  background: var(--background);
  color: var(--foreground);
}\;
fs.writeFileSync('src/app/globals.css', css, 'utf8');
console.log('globals.css updated.');

// 3. CREATE LOGO COMPONENT
const logoDir = 'src/components/ui';
if (!fs.existsSync(logoDir)) fs.mkdirSync(logoDir, { recursive: true });

const logoCode = \import React from 'react';

interface KarigariLogoProps {
  size?: number;
  showWordmark?: boolean;
  variant?: 'dark' | 'light';
  className?: string;
}

export function KarigariLogo({ size = 32, showWordmark = false, variant = 'dark', className = '' }: KarigariLogoProps) {
  const color = variant === 'dark' ? '#1A4731' : '#F5F0E8';
  
  return (
    <div className={\\\lex items-center gap-2 \\\\\\}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Bobbin center */}
        <rect x="35" y="25" width="20" height="50" rx="2" fill={color} />
        {/* Bobbin top/bottom caps */}
        <rect x="32" y="20" width="26" height="5" rx="1" fill={color} />
        <rect x="32" y="75" width="26" height="5" rx="1" fill={color} />
        {/* Thread lines on bobbin */}
        <line x1="35" y1="35" x2="55" y2="30" stroke={variant === 'dark' ? '#F5F0E8' : '#1A1A1A'} strokeWidth="1.5" />
        <line x1="35" y1="45" x2="55" y2="40" stroke={variant === 'dark' ? '#F5F0E8' : '#1A1A1A'} strokeWidth="1.5" />
        <line x1="35" y1="55" x2="55" y2="50" stroke={variant === 'dark' ? '#F5F0E8' : '#1A1A1A'} strokeWidth="1.5" />
        <line x1="35" y1="65" x2="55" y2="60" stroke={variant === 'dark' ? '#F5F0E8' : '#1A1A1A'} strokeWidth="1.5" />
        
        {/* The 'K' arms */}
        <path d="M52 50 L85 20 M55 50 L95 20 M50 50 L85 80 M52 50 L95 80" stroke={color} strokeWidth="6" strokeLinecap="round" />
        
        {/* Needle and thread loop */}
        <path d="M25 25 L35 45" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="24" r="1.5" fill={variant === 'dark' ? '#F5F0E8' : '#1A1A1A'} />
        <path d="M35 45 C45 65, 10 50, 20 75" stroke={color} strokeWidth="1.5" fill="none" />
      </svg>
      
      {showWordmark && (
        <span className="font-serif font-bold text-xl tracking-wide" style={{ color }}>
          KARIGARI
        </span>
      )}
    </div>
  );
}\;
fs.writeFileSync('src/components/ui/KarigariLogo.tsx', logoCode, 'utf8');
console.log('Logo created.');

// 4. CREATE STAT CARD
const statCardCode = \import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  accentColor?: 'teal' | 'orange' | 'blue' | 'brown';
  trend?: string;
  className?: string;
}

export function StatCard({ 
  label, 
  value, 
  icon, 
  accentColor = 'teal', 
  trend,
  className 
}: StatCardProps) {
  
  const borderColors = {
    teal: 'border-l-[var(--color-stat-teal)]',
    orange: 'border-l-[var(--color-stat-orange)]',
    blue: 'border-l-[var(--color-stat-blue)]',
    brown: 'border-l-[var(--color-stat-brown)]',
  };
  
  const textColors = {
    teal: 'text-[var(--color-stat-teal)]',
    orange: 'text-[var(--color-stat-orange)]',
    blue: 'text-[var(--color-stat-blue)]',
    brown: 'text-[var(--color-stat-brown)]',
  };

  return (
    <div className={cn(
      "bg-white rounded-xl shadow-card p-5 border-l-4 flex flex-col justify-between h-full min-h-[120px]",
      borderColors[accentColor],
      className
    )}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest max-w-[70%]">
          {label}
        </h3>
        {icon && (
          <div className={cn("opacity-80", textColors[accentColor])}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div className="text-3xl font-serif font-bold text-gray-900">
          {value}
        </div>
        {trend && (
          <div className="text-xs font-medium bg-gray-50 px-2 py-1 rounded text-gray-600">
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}\;
fs.writeFileSync('src/components/ui/StatCard.tsx', statCardCode, 'utf8');
console.log('StatCard created.');
