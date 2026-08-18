# Karigari - AI Fairness Trust Protocol

**Smart India Hackathon (SIH) 2026**
*Addressing Problem Statement S8: Fairness for the artisan using AI on the systems*

## 🎯 The Problem
Artisans in India face severe exploitation through a long chain of middlemen, leading to extreme poverty despite the high market value of their crafts. Furthermore, cheap power-loom counterfeits flood the market, degrading the value of authentic handloom. Artisans lack the digital literacy to onboard onto complex e-commerce systems or ONDC independently.

## 💡 The Solution: Karigari
Karigari is not just an e-commerce storefront—it is an **AI-driven Verification and Escrow Protocol**. We act as a trust bridge between rural artisans and global markets (ONDC, B2B wholesale, etc.), guaranteeing fairness at every step using Artificial Intelligence.

### Key Features (The SIH Prototype)
1. **🎙️ AI Voice-to-Data Onboarding:** Illiterate artisans do not need to fill out complex forms. They speak into the app, and Gemini AI parses their audio into structured product data (material, labor days, craft type).
2. **⚖️ AI Fair Wage Prediction:** The AI calculates the exact `Fair Wage Floor` based on regional labor rates and raw material costs. This is the absolute minimum advance the artisan must be paid, preventing exploitation.
3. **🔐 Cryptographic QR Patching:** Local cooperative admins physically inspect the product and attach a Karigari `PATCH-ID` QR code, permanently tying the physical asset to the digital ledger.
4. **👁️ AI Vision Gate (Cross-Check):** Before an artisan can sell, they must upload a photo of the product with the tag attached. AI Vision verifies the match, preventing tag-swapping fraud.
5. **🔀 Aggregator Routing Engine:** The artisan transfers digital selling rights to Karigari in exchange for an immediate upfront advance (secured by a liquidity pool). Karigari then routes the product to the most profitable channel (ONDC integration, B2B boutique, or Karigari custody).
6. **🏛️ Immutable Govt Ledger & Oversight:** The Super Admin dashboard tracks a `Regional Economic Health Index`, sorting cooperatives in a Min-Heap. The government can instantly see which regions are falling behind on fair wage compliance.
7. **🚨 Counterfeit Dispute Resolution:** If an item is flagged by a buyer, the artisan is shown side-by-side visual evidence. They must confirm under penalty of a platform ban before requesting a Super Admin review, eliminating frivolous disputes.

## 🛠️ Tech Stack
- **Frontend:** Next.js 15 (App Router), React, Tailwind CSS, Lucide Icons
- **Backend:** Next.js Server Actions & API Routes, Prisma ORM
- **Database:** PostgreSQL (Neon / Supabase)
- **AI Integration:** Google Gemini (Generative AI) for Voice Parsing, Vision Verification, and Pricing logic.

## 🚀 Getting Started

First, install dependencies:
```bash
npm install
```

Set up your `.env` file (see `.env.example`):
```env
DATABASE_URL="your-postgres-url"
JWT_SECRET="your-secret"
GEMINI_API_KEY="your-gemini-key"
```

Push the database schema:
```bash
npx prisma db push
```

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 👥 User Roles in Prototype
- **Artisan:** Onboards products via voice, captures AI images, receives advances, and tracks inventory.
- **Local Admin:** Verifies physical products in bulk and issues QR tags.
- **Super Admin (Govt):** Oversees macro-economic health indices and immutable audit logs.
