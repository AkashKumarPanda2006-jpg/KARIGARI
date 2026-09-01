# KARIGARI Heritage — Micro-Affiliate Engine & Creator Discovery Suite

> **Technical Implementation Blueprint & API Architecture for Social Discovery Commerce, Influencer Sourcing, and Automated 5% Escrow Split-Settlement.**  
> *Target Stack: Next.js 16 (App Router) | Prisma ORM | PostgreSQL | Groq LLaMA 3.3 | Smart Escrow Payouts*

---

## 1. Executive Summary & Core Objective

The **Heritage Micro-Affiliate Engine** bridges rural Indian weavers with fashion/lifestyle content creators (Instagram Reels, YouTube Shorts, and NIFT fashion students). 

Instead of artisans spending thousands of rupees on marketing agencies, creators receive a **unique tokenized referral link (`?ref=creator_handle`)**. When an urban buyer purchases through their link, the Smart Escrow automatically dispatches a **5% affiliate reward directly to the creator's UPI ID at delivery**, while the artisan keeps their full **85%+ direct payout**.

---

## 2. Creator Data Sourcing: APIs vs. LLMs

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CREATOR DATA SOURCING ARCHITECTURE                       │
├──────────────────────────┬──────────────────────────────────────────────────┤
│ Layer                    │ Exact Technology & Data Flow                     │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 1. Free APIs             │ • YouTube Data API v3 (Search endpoint):         │
│    (Discovery Engine)    │   Queries: "Handloom Saree Haul", "Ikat Draping",│
│                          │   "Indian Ethnic Styling", "Vocal For Local".    │
│                          │ • RapidAPI / Instagram Scraper:                  │
│                          │   Indexes micro-creators (5K–50K followers)      │
│                          │   posting with `#HandloomLove`, `#SareeReels`.   │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 2. LLMs (Groq LLaMA 3.3) │ • Profile Matcher: Evaluates creator niche vs.   │
│    (AI Intelligence)     │   craft type (Saree, Pottery, Dhokra, Jewelry).  │
│                          │ • Personalized Outreach: Auto-generates high-     │
│                          │   converting Instagram collaboration DMs.        │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 3. Self-Serve Portal     │ • Public onboarding at `karigari.in/creators`     │
│    (Inbound Capture)     │   for NIFT/NID fashion students & vloggers.      │
└──────────────────────────┴──────────────────────────────────────────────────┘
```

---

## 3. Database Schema (`prisma/schema.prisma`)

```prisma
model Creator {
  id              String           @id @default(uuid())
  name            String
  handle          String           @unique // e.g. "shreya_styles" or "ananya_ethnic"
  platform        String           @default("INSTAGRAM") // "INSTAGRAM" | "YOUTUBE" | "NIFT_STUDENT"
  profileUrl      String?
  nicheCategory   String           // "Handloom Sarees" | "Tribal Jewelry" | "Home Decor"
  upiId           String           // Direct VPA for automated 5% commission payouts
  totalClicks     Int              @default(0)
  totalSales      Int              @default(0)
  earningsTotal   Float            @default(0.0)
  createdAt       DateTime         @default(now())
  
  affiliateClicks AffiliateClick[]
  orders          Order[]          @relation("AffiliateOrders")

  @@index([handle])
}

model AffiliateClick {
  id          String   @id @default(uuid())
  creatorId   String
  creator     Creator  @relation(fields: [creatorId], references: [id])
  craftItemId String?
  ipHash      String?
  createdAt   DateTime @default(now())

  @@index([creatorId])
  @@index([createdAt])
}
```

---

## 4. End-to-End Technical Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Creator as Fashion Creator (@ananya_ethnic)
    actor Buyer as Urban Buyer (Instagram User)
    participant Link as Shoppable Link (`?ref=ananya_ethnic`)
    participant App as KARIGARI Checkout Engine
    participant Escrow as Smart Escrow Engine
    actor Artisan as Rural Weaver (Lakshmi Devi)

    Creator->>Creator: Self-registers on `/creators` & gets `?ref=ananya_ethnic`
    Creator->>Buyer: Posts 15s Saree Styling Reel + Bio Link
    Buyer->>Link: Clicks link on Instagram Reel
    Link->>App: Logs click in `/api/creators/track` & renders Endorsement Badge
    Buyer->>App: Completes 1-Tap UPI Checkout for ₹4,500
    App->>Escrow: Locks ₹4,500 in RBI-Compliant Escrow
    Escrow->>Artisan: At Dispatch: 40% Fair Wage Advance (₹1,800) sent to Artisan UPI
    Escrow->>Artisan: At Delivery: Final Balance (₹2,025) sent to Artisan UPI
    Escrow->>Creator: At Delivery: 5% Affiliate Reward (₹225) sent to Creator UPI
```

---

## 5. Backend API Endpoints

### 5.1 Creator Registration (`POST /api/creators/register`)
- **Request Payload:**
  ```json
  {
    "name": "Shreya Sharma",
    "handle": "shreya_styles",
    "platform": "INSTAGRAM",
    "nicheCategory": "Handloom Sarees",
    "upiId": "shreya@okaxis",
    "profileUrl": "https://instagram.com/shreya_styles"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "refSlug": "shreya_styles",
    "affiliateUrl": "https://karigari.in/verify/PAT-101?ref=shreya_styles",
    "creatorId": "uuid-here"
  }
  ```

### 5.2 AI Creator-Craft Matcher & Auto-DM (`POST /api/creators/match-outreach`)
- Uses **Groq LLaMA 3.3** (`llama-3.3-70b-versatile`) to generate customized collaboration messages:
  ```json
  {
    "matchScore": 96,
    "personalizedDm": "Hey Shreya! Loved your recent Reel on handloom draping. We work with master weaver Lakshmi Devi in Bargarh, Odisha. We’d love to gift you an authentic GI-tagged Sambalpuri Saree for your next video + a 5% affiliate link so your followers can support the weaver directly with 0% middleman cuts!",
    "targetHashtags": ["#HandloomSaree", "#VocalForLocal", "#AuthenticIkat"]
  }
  ```

### 5.3 Click Tracking & Attribution (`POST /api/creators/track`)
- Increments `totalClicks` for the associated `Creator` record and returns attribution session data.

### 5.4 Creator Dashboard Stats (`GET /api/creators/stats?handle=...`)
- Returns aggregated real-time metrics:
  ```json
  {
    "handle": "shreya_styles",
    "totalClicks": 1420,
    "totalSales": 38,
    "grossSalesVolume": 171000,
    "earningsTotal": 8550.0,
    "payoutUpi": "shreya@okaxis"
  }
  ```

---

## 6. Frontend Components & Pages

### 6.1 Public Creator Portal (`src/app/creators/page.tsx`)
1. **Hero Section:** *"Earn 5% Promoting Verified Indian Heritage • 0% Middlemen"*.
2. **2-Minute Onboarding Form:** Name, Instagram/YouTube Handle, Niche Specialty, and UPI VPA.
3. **Live Creator Dashboard:**
   - Active Token Box: `https://karigari.in/verify/PAT-101?ref=shreya_styles` (1-click copy).
   - **Real-Time Analytics Grid:** Total Traffic, Verified Saree Orders, 5% Payout Balance.
   - **Catalog Browser:** Showcase verified crafts with instant **"Copy My Custom Link"** buttons.

### 6.2 Endorsement Badge on Digital Passport (`src/app/verify/[patchId]/VerificationClient.tsx`)
When a buyer arrives from an influencer's bio (`?ref=shreya_styles`):
```tsx
<div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center gap-2.5 mb-4 shadow-sm">
  <Sparkles size={16} className="text-amber-600 shrink-0" />
  <span className="text-xs text-amber-900 font-medium leading-relaxed">
    🌟 Curated & Recommended by <strong>@{ref}</strong> • 100% Authentic Handloom • Direct from Weaver
  </span>
</div>
```

---

## 7. Economics & The "Triple-Win" Model

| Stakeholder | Financial & Social Benefit |
| :--- | :--- |
| **Rural Weaver** | Retains **85%+ of gross retail price** (vs. <25% through traditional middlemen) with zero marketing expense. |
| **Content Creator** | Earns a transparent **5% affiliate commission** paid directly via UPI while supporting authentic cultural heritage. |
| **Urban Consumer** | Purchases verified, GI-tagged handloom direct from the source at a fair price with a live QR Digital Passport. |
| **Government (MoSJE)** | Formalizes unorganized craft trade, generating lifelong GST and expanding rural economic self-reliance. |

---
*Authored by the KARIGARI Core Product & Architecture Team.*
