# KARIGARI Heritage — Cloud Infrastructure, AI Compute Costs, Unit Economics & Scalability Blueprint

> **A Rigorous Technical & Financial Analysis of Serverless Hosting, Multi-Modal AI Compute Charges, Unit Economics, and 3-Year Enterprise Scale Projections.**  
> *Prepared for: Ministry of Social Justice and Empowerment (MoSJE) | Smart India Hackathon (SIH) Technical & Business Jury*

---

## 1. Executive Summary & Financial Philosophy

Unlike legacy monolithic enterprise software that requires expensive on-premise servers and dedicated DevOps teams, **KARIGARI is architected on a 100% Serverless, Event-Driven, and Edge-Optimized Cloud Infrastructure**.

### Key Highlights:
1. **Sub-10-Paise AI Compute:** Groq LPU inference (Whisper + LLaMA 3.3) reduces multi-modal voice and catalog generation costs to **₹0.065 (6.5 paise) per craft listing**.
2. **95.9% Software Gross Margin:** Out of a 3.5% platform facilitation fee (₹105 on a ₹3,000 saree), total technical infrastructure COGS is only **₹4.30**, leaving **₹100.70 in gross contribution margin per item**.
3. **Low Break-Even Threshold:** The platform achieves operational break-even at just **80 verified craft transactions per month**.

---

## 2. Granular Cloud Hosting & Infrastructure Breakdown

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          CLOUD INFRASTRUCTURE ARCHITECTURE                             │
├──────────────────────┬───────────────────────────┬──────────────┬──────────────────────┤
│ Infrastructure Layer │ Provider & Service        │ Free Tier    │ Production Monthly   │
│                      │                           │ Capacity     │ Cost (at 5,000 Users)│
├──────────────────────┼───────────────────────────┼──────────────┼──────────────────────┤
│ 1. Frontend & API    │ Vercel Serverless         │ 100GB Bw,    │ $20 / month          │
│    Compute           │ Next.js App Router (Edge) │ 1M Invoc.    │ (~₹1,700 / mo)       │
├──────────────────────┼───────────────────────────┼──────────────┼──────────────────────┤
│ 2. Primary Database  │ Supabase / Neon           │ 500MB DB,    │ $25 / month          │
│    (PostgreSQL)      │ (PgBouncer Pooling)       │ 50MB Pool    │ (~₹2,100 / mo)       │
├──────────────────────┼───────────────────────────┼──────────────┼──────────────────────┤
│ 3. Media & Photo CDN │ Cloudflare R2             │ 10GB Free,   │ $5 / month           │
│    (Object Storage)  │ (Zero Egress Bandwidth)   │ 1M writes    │ (~₹420 / mo)         │
├──────────────────────┼───────────────────────────┼──────────────┼──────────────────────┤
│ 4. DNS, SSL & DDoS   │ Cloudflare DNS            │ Unlimited    │ ₹0.00                │
│    Protection        │ Enterprise Edge Shield    │ Free SSL     │ (100% Free)          │
├──────────────────────┼───────────────────────────┼──────────────┼──────────────────────┤
│ 5. Transactional SMS │ Fast2SMS / Twilio DLT     │ 100 Free     │ ₹0.15 / SMS alert    │
│    & WhatsApp Engine │ (Government DLT Route)    │ SMS credits  │ (~₹750 / mo)         │
├──────────────────────┼───────────────────────────┼──────────────┼──────────────────────┤
│ TOTAL MONTHLY FIXED INFRASTRUCTURE OVERHEAD              │ ~₹5,000 / month ($60)│
└──────────────────────────────────────────────────────────┴──────────────────────┘
```

---

## 3. Multi-Modal AI Compute Charges & Token Economics

KARIGARI utilizes a specialized multi-model AI routing strategy to maximize speed while keeping costs negligible:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             AI COMPUTE UNIT ECONOMICS                                  │
├──────────────────────┬───────────────────────┬────────────────────┬────────────────────┤
│ AI Task              │ Model & Provider      │ Official Pricing   │ Cost per Craft     │
│                      │                       │ Rate               │ Item Processed     │
├──────────────────────┼───────────────────────┼────────────────────┼────────────────────┤
│ 1. Voice Dialect     │ Groq Whisper          │ $0.111 / hour of   │ ₹0.015             │
│    Transcription     │ (`whisper-large-v3`)  │ audio stream       │ (1.5 paise / 30s)  │
├──────────────────────┼───────────────────────┼────────────────────┼────────────────────┤
│ 2. NLP Catalog JSON  │ Groq LLaMA 3.3 70B    │ $0.59 / 1M input,  │ ₹0.030             │
│    Extraction        │ (`llama-3.3-versatile`│ $0.79 / 1M output  │ (3.0 paise / 500t) │
├──────────────────────┼───────────────────────┼────────────────────┼────────────────────┤
│ 3. Multimodal Texture│ Google Gemini 1.5     │ $0.075 / 1M input  │ ₹0.020             │
│    Authenticity Check│ Flash Vision API      │ tokens             │ (2.0 paise / img)  │
├──────────────────────┼───────────────────────┼────────────────────┼────────────────────┤
│ 4. Social Ad & Reel  │ Groq LLaMA 3.3 70B    │ $0.59 / 1M input   │ ₹0.025             │
│    Script Generator  │ (Fast LPU Inference)  │ tokens             │ (2.5 paise / kit)  │
├──────────────────────┼───────────────────────┼────────────────────┼────────────────────┤
│ TOTAL AI COMPUTE COGS PER CRAFT CATALOGED            │ ₹0.090 (9.0 paise) │
└──────────────────────────────────────────────────────┴────────────────────┘
```

*Key Insight for Judges:* Even if 100,000 rural artisans upload crafts in a month, the total AI compute bill is under **₹9,000 ($108)**.

---

## 4. End-to-End Unit Economics (Per ₹3,000 Handicraft Item)

```
┌─────────────────────────────────────────────────────────────┬───────────┐
│ Metric / Component                                          │ Real-World│
├─────────────────────────────────────────────────────────────┼───────────┤
│ Customer Retail Sale Price                                  │ ₹3,000.00 │
│ (-) ONDC Buyer App Network Finder Fee (Paytm/Magicpin @ 3%) │ ₹90.00    │
│ (-) Rural Logistics & Shipping (India Post DNK Flat Rate)   │ ₹120.00   │
│ (-) Payment Gateway Payout Fee (Razorpay UPI @ ₹4 flat)     │ ₹4.00     │
│ (-) Multi-Modal AI Compute (Groq Whisper + LLaMA + Gemini)  │ ₹0.09     │
│ (-) Cloud Database & Serverless Allocation                  │ ₹0.21     │
├─────────────────────────────────────────────────────────────┼───────────┤
│ Net Platform Facilitation Revenue (3.5% Fee)                │ ₹105.00   │
│ Total Technical COGS (AI + Database + Gateway + Hosting)    │ ₹4.30     │
│ Net Platform Contribution Margin per Item                   │ ₹100.70   │
│ Platform Software Gross Margin                              │ 95.9%     │
├─────────────────────────────────────────────────────────────┼───────────┤
│ Total Realized Payout to Rural Artisan                      │ ₹2,680.70 │
│ Artisan Share of Gross Value                                │ 89.36%    │
│ Traditional Middleman Exploitation Share                    │ 60.00%+   │
└─────────────────────────────────────────────────────────────┴───────────┘
```

---

## 5. 3-Year Scale & Financial Feasibility Projections

```
┌───────────┬──────────────┬──────────────────┬──────────────┬──────────────┬──────────────────┐
│ Phase     │ Active       │ Monthly Items    │ Annual GMV   │ Annual Net   │ Monthly Tech &   │
│           │ Artisans     │ Transacted       │ Volume       │ Revenue      │ Infra Burn       │
├───────────┼──────────────┼──────────────────┼──────────────┼──────────────┼──────────────────┤
│ Year 1    │ 500          │ 2,500 items/mo   │ ₹9.0 Crore   │ ₹27.0 Lakhs  │ ₹8,000 / mo      │
│ (Pilot)   │ (2 Clusters) │                  │              │              │ (Break-even M4)  │
├───────────┼──────────────┼──────────────────┼──────────────┼──────────────┼──────────────────┤
│ Year 2    │ 5,000        │ 30,000 items/mo  │ ₹108.0 Crore │ ₹3.24 Crore  │ ₹45,000 / mo     │
│ (Scale)   │ (15 Clusters)│                  │              │              │ (₹2.7Cr Profit)  │
├───────────┼──────────────┼──────────────────┼──────────────┼──────────────┼──────────────────┤
│ Year 3    │ 25,000       │ 175,000 items/mo │ ₹630.0 Crore │ ₹18.9 Crore  │ ₹1,80,000 / mo   │
│ (National)│ (60 Clusters)│                  │              │              │ (Venture Scale)  │
└───────────┴──────────────┴──────────────────┴──────────────┴──────────────┴──────────────────┘
```

---

## 6. Technical Scalability Architecture & Bottleneck Mitigations

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SCALABILITY ENGINEERING MATRIX                        │
├──────────────────────────┬──────────────────────────────────────────────────┤
│ Potential Bottleneck     │ Architectural Defense & Mitigation               │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 1. Database Connection   │ Implements PgBouncer connection pooling via      │
│    Exhaustion on Vercel  │ Prisma singleton (`src/lib/prisma.ts`), capping  │
│                          │ max active Postgres sockets to 50 concurrent.    │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 2. High-Resolution Photo │ Direct client-side image compression (HTML5      │
│    Payload Spikes        │ canvas resize to 1200x1200px @ 80% JPEG) before  │
│                          │ upload, reducing payload size by 90% (<400KB).   │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 3. ONDC Catalog Search   │ `/api/ondc/catalog` is edge-cached using Stale-  │
│    Traffic Surges        │ While-Revalidate (SWR) headers, shielding the DB │
│                          │ from millions of repetitive Beckn search queries.│
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 4. Rural Network Drops   │ Service Worker + IndexedDB background sync queues│
│    (Zero 4G Hamlets)     │ audio recordings locally until connection returns│
└──────────────────────────┴──────────────────────────────────────────────────┘
```

---

## 7. How to Present This Cost Breakdown to the Jury

When asked: *"Is this platform financially viable, and what will it cost the government to host?"*, deliver this winning answer:

> *"Respected Jury, KARIGARI is engineered for extreme cost efficiency:
> 
> 1. **Under 10 Paise AI Cost:** By pairing Groq's high-speed LPU inference with Gemini Vision, generating a complete multi-lingual voice catalog, AI photo verification, and viral social ad costs just **₹0.09 (9 paise) per craft**.
> 2. **Negligible Cloud Overhead:** Our serverless PostgreSQL and edge architecture costs less than **₹5,000 ($60) per month** to support 5,000 active artisans.
> 3. **95.9% Gross Contribution Margin:** On a modest 3.5% facilitation fee, the platform generates **₹100.70 net margin per saree**, breaking even at just 80 transactions per month.
> 
> The platform requires zero expensive legacy infrastructure, scales automatically, and generates sustainable revenue from Month 4."*

---
*Authored by the KARIGARI Core Technical & Financial Architecture Team.*
