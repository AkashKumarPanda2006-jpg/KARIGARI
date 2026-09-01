# KARIGARI Heritage — Complete Technical Architecture & Judge Q&A Guide

> **A Comprehensive Technical Deep-Dive for Hackathon Juries & Engineering Reviewers**  
> *Stack: Next.js 16 (App Router, Turbopack) | TypeScript | Prisma ORM | PostgreSQL | Groq (Whisper + LLaMA 3.3) | Google Gemini 1.5 | Tailwind CSS | ONDC Beckn Protocol*

---

## 1. Complete System Tech Stack

| Layer | Technology | Version / Spec | Purpose & Implementation Justification |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **Next.js (App Router)** | 16.3.1 (Turbopack) | Server Components (RSC) for fast initial load + Client Components for interactive voice/camera modals. |
| **Language** | **TypeScript** | 5.x | Strict type-safety across all API request/response contracts, DB models, and component props. |
| **Styling & UI** | **Tailwind CSS + Lucide Icons** | 3.4.x | Responsive mobile-first styling with custom palette (#24332C, #14211B), glassmorphism, and micro-animations. |
| **Database & ORM** | **PostgreSQL + Prisma ORM** | Prisma v6.x | Relational integrity with foreign key constraints, connection pooling via global singleton, and automatic migrations (prisma db push). |
| **Audio AI & Speech** | **Groq Whisper API** | whisper-large-v3 | Transcribes regional dialects (Odia, Hindi, Telugu, English) in $< 600\text{ms}$ with zero latency. |
| **NLP Extraction AI** | **Groq LLaMA 3.3** | llama-3.3-70b-versatile | Extracts structured JSON (materials cost, labor days, craft type) from transcribed voice text with deterministic JSON mode. |
| **Computer Vision AI** | **Google Gemini 1.5** | @google/genai | Multi-modal vision analysis comparing live craft texture patterns vs. machine-made benchmarks to verify handmade authenticity. |
| **Network Protocol** | **ONDC Beckn Protocol** | Core Spec 1.2.0 | Serializes internal catalog rows into Beckn-compliant BPP on_search payloads under ONDC:RET12 and ONDC:RET16. |
| **Authentication** | **JWT + Bcrypt.js** | jsonwebtoken, cryptjs | HTTP-only cookie-based session tokens with role-based routing (ARTISAN, ADMIN, BUYER) and salted password hashing. |
| **PWA & Offline** | **Next-PWA / Workbox** | Service Worker API | Caches critical static assets and provides offline fallback for field data capture. |

---

## 2. Database Schema & Data Modeling (prisma/schema.prisma)

`mermaid
erDiagram
    USER ||--o| ARTISAN_PROFILE : "has profile"
    USER ||--o{ CRAFT_ITEM : "creates"
    USER ||--o{ ORDER : "places (as Buyer)"
    USER ||--o{ SCHEME_APPLICATION : "applies for"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ IVR_DUMMY_ITEM : "ingests"
    CRAFT_ITEM ||--o{ AUDIT_LOG : "tracks state transitions"
    CRAFT_ITEM ||--o{ ORDER : "purchased via"
`

### 2.1 Core Relational Models & Architectural Decisions
1. **User & ArtisanProfile (1-to-1 Relation):**
   - Separates core authentication data (email, passwordHash, ole: ADMIN | ARTISAN | BUYER) from social demographic metadata (socialCategory, nnualIncome, adhaarLast4, clusterName, giTagCertified, healthScore).
   - Indexed on [socialCategory] for rapid government analytical querying without scanning full user tables.
2. **CraftItem (The Central Asset Model):**
   - Stores physical, economic, and provenance attributes:
     - Provenance: patchId (unique QR identifier), images (array of base64/URLs), awMaterialProofUrl.
     - Fair Wage Engine: laborDays, awMaterialCost, airWageFloor, airnessScore, skingPrice, standardMarketPrice.
     - ONDC / Syndication: isListedOnMarketplace, giTagApplied, iGeneratedListing, iSuggestedCategory.
   - Indices: [artisanId], [patchId], [status], [createdAt], [pricingFlag].
3. **AuditLog (Append-Only Provenance Ledger):**
   - Every status transition (Pending $\rightarrow$ Verified $\rightarrow$ Disbursed $\rightarrow$ Sold) is logged with ctorId, ctorRole, ction, previousState, and 
ewState. 
   - Provides immutable tracking for government compliance (IT Act Section 65B).
4. **Order & IvrDummyItem:**
   - Order: Links Buyer with CraftItem, tracking 	otalPrice, status: PLACED | CONFIRMED | SHIPPED | DELIVERED | VERIFIED, and payment metadata.
   - IvrDummyItem: Holding table for crafts registered via the feature-phone IVR line before high-resolution photo attachment.

### 2.2 Connection Pooling & Database Optimization (src/lib/prisma.ts)
- Implements the **Global Singleton Pattern** (globalThis.prisma):
  - In serverless environments (Next.js API routes on Vercel), hot-reloads create multiple Prisma instances, quickly exhausting PostgreSQL connection limits.
  - The singleton pattern reuses the same client across all serverless invocations.

---

## 3. The Multimodal "Capture Modal" Pipeline (src/components/CaptureModal.tsx)

The Capture Modal implements a 4-step wizard that turns an illiterate artisan's voice and photo into an authenticated, priced listing:

`
[Audio Stream / Mic] ──> [MediaRecorder] ──> [Groq Whisper] ──> [Groq LLaMA 3] ──> Form State (Labor/Material)
                                                                                       │
[Camera Viewfinder] ───> [HTML5 Canvas] ───> [Gemini Vision / DINOv2] ───────────────┼──> Verified Listing
                                                                                       │
[Pricing Engine] ──────> [Fair Wage Algorithm] ──> [Market Comparables] ───────────────┼──> Dynamic Suggested Price
                                                                                       │
[Prisma DB Write] ─────> [AuditLog Entry] ─────> [Unique PatchId Minted] ──────────────┴──> Live Digital Passport
`

### Step 1: Voice Recording & AI Parsing
- **Client Implementation:** Uses the browser MediaRecorder API to capture audio in udio/webm format, packaging it into a FormData object.
- **Backend API (/api/items/voice-parse):**
  1. Streams the binary audio to **Groq Whisper** (whisper-large-v3), transcribing the regional speech (Odia/Hindi) to text.
  2. Pipes the transcript to **Groq LLaMA 3.3** (llama-3.3-70b-versatile) with a strict JSON schema prompt instructing it to extract:
     - craftType (e.g., "Sambalpuri Ikat Saree")
     - laborDays (integer)
     - awMaterialCost (number in INR)
     - englishDescription (SEO-optimized English copy)

### Step 2: Dual Camera Capture & Vision Verification
- **Client Implementation:** Accesses the device camera using 
avigator.mediaDevices.getUserMedia, projecting frames onto an HTML <video> element, and grabbing high-res snapshots via an off-screen <canvas>.
- **Backend API (/api/items/vision-verify):**
  - Analyzes the image using **Gemini 1.5 Flash Vision** to detect texture authenticity (handloom thread irregularities vs. smooth machine weave).
  - Automatically rejects non-craft images (e.g., selfies, random objects).

### Step 3: Dynamic Pricing Assistant & Fair Wage Calculation (src/lib/pricing.ts)
- **Mathematical Formula for the Fair Wage Floor:**
  \text{Fair Wage Floor} = \text{Raw Material Cost} + (\text{Labor Days} \times \text{Base Regional Daily Wage}) \times (1 + \text{Artisan Experience Factor})
- Evaluates real-time price bands:
  - standardMarketPrice: Weighted average of identical crafts on Amazon/Flipkart.
  - airWageFloor: Minimum non-negotiable floor to protect the weaver from middleman undercutting.
  - suggestedPrice: Optimum sweet spot balancing artisan profit with buyer conversion.

### Step 4: Digital Passport Minting (/api/items/capture)
- Generates a unique cryptographic patchId (e.g., PAT-99283-OD).
- Creates the CraftItem record, updates the artisan's active catalog, and writes an entry to AuditLog.

---

## 4. AI Learning & Grow Assistant (src/components/LearningAssistantModal.tsx)

A voice-interactive assistant that teaches artisans business skills and technical craft techniques.

### Technical Implementation:
1. **Voice Recognition in Browser:** Uses the HTML5 webkitSpeechRecognition / SpeechRecognition API for real-time speech-to-text directly on the client.
2. **AI Reasoning (/api/artisan/chat):**
   - Sends the artisan's question and current craft type to **Gemini 1.5** with structured output configuration.
   - Generates:
     - A 2-to-3 sentence conversational response in simple English/Hinglish.
     - A specific, curated youtubeQuery (e.g., *"how to paint pattachitra tree border step by step"*).
3. **Dynamic YouTube Scraper & Embed Validator:**
   - The route queries YouTube's search endpoint with &sp=CAM%253D (sorting strictly by **Highest View Count / Top Engagement**).
   - Extracts candidate video IDs using regex match on "videoId":"...".
   - Validates each candidate video via YouTube's public **oEmbed API** (https://www.youtube.com/oembed?url=...) to ensure the creator has not disabled external iframe embedding.
   - Renders the validated video inline inside the chat window.

---

## 5. ONDC Beckn Protocol Provider Node (src/app/api/ondc/catalog/route.ts)

KARIGARI operates as a native **BPP (Beckn Provider Platform)** node, allowing any ONDC buyer app (Paytm, Magicpin, Mystore) to ingest the artisan catalog.

### Technical Specifications:
- **Spec Compliance:** Beckn Core 1.2.0 + ONDC RET12 (Fashion/Textiles) and RET16 (Home & Decor).
- **Endpoint Structure (/api/ondc/catalog):**
  1. Queries all CraftItem records with isListedOnMarketplace: true.
  2. Groups items by rtisanId into Beckn pp/providers.
  3. Uses a Geographic Gazetteer (src/lib/indiaGeo.ts) to resolve artisan village names (e.g. "Bargarh, Odisha") into exact GPS coordinates (gps: "lat,lon").
  4. Generates standard Beckn descriptors, attributes (Fair Wage Floor, GI Tag, Patch ID), and delivery fulfillments (	ype: "Delivery", 	ime_to_ship: "P7D").

---

## 6. Authentication, Security & Role-Based Access Control (RBAC)

### 6.1 Authentication Mechanism
- **Password Hashing:** Passwords are never stored in plaintext; they are hashed using **cryptjs** with a salt round of 10.
- **Session Tokens:** JWT (JSON Web Tokens) signed using HMAC-SHA256 (jsonwebtoken), stored in **HTTP-only, Secure, SameSite cookies** (uth-token) to prevent XSS and token exfiltration.
- **Endpoint Verification (/api/auth/me):** Decodes the JWT token on the server and retrieves authenticated user claims (userId, ole, email).

### 6.2 Layout-Level Route Protection
- src/app/artisan/layout.tsx: Checks data.user?.role === "ARTISAN". If unauthenticated or invalid role, immediately executes outer.replace("/login").
- src/app/admin/layout.tsx: Restricts access to ADMIN, NODAL_OFFICER, and FACILITATOR roles.

---

## 7. Direct-to-Artisan Automated Escrow & Payment Gateway Architecture

### 7.1 Non-Custodial Smart Escrow
- **Governance Rule:** Admins and facilitators have **zero financial custody or approval authority**.
- **Automated State Machine:**
  1. **Customer Checkout:** Buyer pays via Stripe/UPI $\rightarrow$ Funds lock in an RBI-compliant Nodal Escrow (ESCROW_HELD).
  2. **Stage 1 (At Dispatch):** Webhook detects physical verification and parcel handover $\rightarrow$ Automatically releases **40% Fair Wage Advance directly to the artisan's UPI ID**.
  3. **Stage 2 (At Delivery):** Logistics API emits DELIVERED status $\rightarrow$ Automatically releases the remaining **~49.36% balance directly to the artisan's UPI ID** (totaling ~89.36% net artisan realization after logistics and 3.5% maintenance fee).

---

## 8. Top 15 Technical Defense Questions Judges Will Ask & Exact Answers

### Q1: "How does your voice parsing work in low-connectivity rural areas?"
> **Answer:** *"Our architecture uses a dual-engine approach. For online voice capture, the audio stream is sent to Groq Whisper (whisper-large-v3) which completes transcription in under 600ms, followed by Groq LLaMA 3.3 for JSON schema extraction. If the device is completely offline, our Service Worker intercepts the request, caches the audio blob locally in IndexedDB, and queues it for background sync as soon as connectivity resumes."*

### Q2: "Why do you use both Groq and Gemini in the same app?"
> **Answer:** *"We use a specialized multi-model strategy based on latency and modality. Groq is optimized for hyper-fast LPU inference, making it ideal for our real-time voice-to-JSON parsing ($<1\text{s}$). Gemini 1.5 Flash is used specifically for multimodal computer vision and structured multi-lingual chat where large context windows and visual pattern analysis (detecting handmade texture irregularities) are required."*

### Q3: "How does your ONDC integration actually connect to external apps?"
> **Answer:** *"We built an ONDC Beckn Provider Platform (BPP) catalog serializer in /api/ondc/catalog. It conforms strictly to the Beckn Protocol Core 1.2.0 and ONDC RET12/16 specifications. It dynamically serializes our PostgreSQL CraftItem records into Beckn pp/providers and pp/items JSON trees with GPS location tags, GI attributes, and fair-wage metadata, ready for ingestion by any registered Beckn BAP (like Paytm Mall or Magicpin)."*

### Q4: "How do you prevent SQL injection and database connection pool exhaustion?"
> **Answer:** *"All database interactions are parameterized through Prisma ORM, which completely prevents raw SQL injection vulnerabilities. To prevent connection exhaustion in serverless environments, src/lib/prisma.ts implements the Global Singleton Pattern (globalThis.prisma), ensuring all API routes reuse a shared connection pool instead of opening new sockets on every cold start."*

### Q5: "How does the AI verify that an item is handmade and not machine-made?"
> **Answer:** *"Our AI Vision pipeline in /api/items/vision-verify inspects micro-texture characteristics. Machine-made power-loom textiles exhibit mathematically uniform thread pitch and zero pattern variation. Handcrafted textiles exhibit natural micro-variations in warp/weft tension and organic edge alignments. Gemini Vision scores these surface textures against our handloom taxonomy benchmarks."*

### Q6: "How do you ensure security if JWT tokens are stored in the browser?"
> **Answer:** *"We do not store JWTs in localStorage where they are vulnerable to XSS attacks. Our auth pipeline stores the token inside an HTTP-Only, Secure, SameSite=Lax cookie. Client-side JavaScript cannot read or modify the token; it is automatically validated server-side on every API call and layout navigation."*

### Q7: "What is your database indexing strategy?"
> **Answer:** *"We placed explicit B-Tree indices in schema.prisma on all high-cardinality foreign keys and frequently filtered columns: [artisanId], [patchId], [status], [createdAt], [pricingFlag], and [socialCategory]. This ensures (\log N)$ search latency even with tens of thousands of items."*

### Q8: "How does the AI Learning Assistant fetch relevant YouTube tutorials without a paid API key?"
> **Answer:** *"When an artisan asks a question, Gemini generates a precise tutorial search string. Our server queries YouTube's search endpoint with the &sp=CAM%253D parameter, which strictly sorts results by highest view count and engagement. We extract candidate video IDs and validate them against YouTube's public oEmbed API to guarantee the video allows external iframe embedding before rendering it in the UI."*

### Q9: "How do you calculate the Fair Wage Floor?"
> **Answer:** *"The Fair Wage Floor is deterministically calculated in src/lib/pricing.ts. It takes awMaterialCost + (laborDays * regionalBaseWage) * (1 + experienceFactor). We benchmark egionalBaseWage against Ministry of Labour handloom wage surveys (₹500–₹650/day). If an artisan tries to sell below this floor, our Anti-Exploitation Guardian flags the item on the Nodal Officer dashboard."*

### Q10: "How does the platform handle concurrency and race conditions in orders?"
> **Answer:** *"We use Prisma transactional operations (prisma.). When a buyer initiates an order, the inventory decrement and Order creation execute inside an atomic transaction with row-level locks, ensuring inventory cannot be oversold concurrently."*

### Q11: "What prevents a malicious admin from altering an artisan's payout or data?"
> **Answer:** *"Our architecture enforces non-custodial financial isolation. All state changes are written to the append-only AuditLog table with actor timestamps. Payouts are executed programmatically via direct UPI webhooks triggered by physical logistics events, completely bypassing admin manual discretion."*

### Q12: "How is the app optimized for Core Web Vitals and low-end mobile devices?"
> **Answer:** *"We use Next.js App Router for server-rendered HTML shells, Next/Image with WebP/AVIF format optimization and blur placeholders, dynamic code-splitting for heavy modals (CaptureModal, LearningAssistantModal), and Turbopack for minimal bundle sizes."*

### Q13: "What is the role of the Patch ID (patchId)?"
> **Answer:** *"The patchId is a unique alphanumeric identifier (e.g. PAT-99283-OD) linked to a physical tamper-evident QR patch attached to the craft. When scanned by a consumer at /verify/[patchId], it serves as a public Digital Passport displaying the artisan's profile, craft story, and immutable audit timeline."*

### Q14: "How does your system support multiple Indian languages?"
> **Answer:** *"We built a client-side reactive translation system in src/lib/translations.ts supporting Odia, Hindi, Telugu, and English. The UI instantly switches all labels, alerts, and instructions based on the active language context without triggering a full page reload."*

### Q15: "How does your platform handle PII compliance under the DPDP Act 2023?"
> **Answer:** *"Sensitive artisan demographic data (like Aadhaar) only stores the last 4 digits (adhaarLast4) for visual verification. Full Aadhaar numbers and biometric data are never captured or stored. Public verification pages (/verify/[patchId]) strip all private contact numbers and financial VPAs, exposing only verified craft story metadata."*

---
*Authored by the KARIGARI Core Technical Architecture Team for Smart India Hackathon.*
