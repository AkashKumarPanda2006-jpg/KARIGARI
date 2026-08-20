# KARIGARI - Final Architecture & Gap Analysis

This document serves as a comprehensive review of our current implementation against the proposed `KARIGARI_Final_Architecture_v3.md` specifications, followed by the finalized architecture that governs the current application state.

---

## Part 1: Gap Analysis (Current vs. Proposed Specification)

### ✅ Areas We Fully Cover
We have successfully implemented the vast majority of the core protocol, specifically hitting the high-priority hackathon targets:

1. **The Core "Capture to Sell" Pipeline (Phases 1-4):**
   - **Phase 1:** Voice-to-text capture using native speech recognition parsed by Gemini AI to dynamically calculate the `Fair Wage Floor`.
   - **Phase 2:** Local Admin verification gate, which deducts Patch IDs from the admin's tag bank and sets the status to `VERIFIED`.
   - **Phase 3:** Artisan physical QR cross-check gate using Gemini Vision AI (implemented via the `CrossCheckModal`) to unlock selling rights.
   - **Phase 4:** The 3-channel Routing Engine (B2B, ONDC, Karigari Advance) giving the artisan instant liquidity choices.

2. **Hierarchical Roles & Dashboards:**
   - **Artisan:** Multilingual dashboard, dynamic metric trends, transparent advances, and dispute resolution UI.
   - **Local Admin:** Verification queues, counterfeit tracking, dynamic patching inventory, and local fair-wage compliance metrics.
   - **Super Admin (Govt):** Min-Priority Heap sorting of local admins, Regional Economic Index tracking, and global immutable audit ledgers.

3. **Digital Footprint & Ledger Timelines:**
   - Fully implemented public verification page (`/verify/[patchId]`).
   - Immutable chronological audit logs tracking `CAPTURE`, `VERIFIED`, `TAG_ATTACHED`, `AGENT_HANDOFF_COMPLETED`, `ADVANCE_PAID`, `UPI_PAYMENT_PROCESSED`, and `SOLD_FINAL`.

4. **Counterfeit & Trust Mechanisms:**
   - 15% health score deduction penalty for flagged items, dropping artisans into probation.
   - Strict Dispute Modal with penalty declarations.

### ❌ Areas We Do Not Cover (or Simulated)
Given the constraints of a software prototype, some physical/external integrations remain mocked or unimplemented:

1. **Offline-First PWA Sync:** The architecture proposed an offline-first SQLite queue for remote villages. We migrated directly to Supabase PostgreSQL, so the app currently requires an active internet connection to mint crafts.
2. **Micro-Insurance & Cryptographic Burning (Section 7):** While we handle Counterfeits extensively (`FLAGGED` status), we do not have an explicit UI for "Transit Insurance Claims" or a literal `DESTROYED` state for warehouse fires.
3. **True Blockchain / ONDC Integration:** The ONDC listing, B2B routing, and Liquidity Pool yields (3%) are visually simulated in the UI and PostgreSQL ledger rather than bridging to a live Polygon smart contract or live ONDC staging environment.
4. **Complex Credit Risk Formula:** The credit risk score is heavily tied to the health score rather than a deeply complex historical repayment algorithm.

---

## Part 2: Finalized Architecture & Flow

### 1. Executive Summary
KARIGARI is a **Fairness and Transparency Platform** for handloom artisans. It acts as a digital bridge between rural artisans and global markets, guaranteeing fair wages and eliminating middleman exploitation. By combining Gemini AI (voice parsing + vision verification) with a transparent digital ledger, it secures the supply chain against counterfeits and ensures artisans receive instant, fair compensation based on calculated labor and material costs.

### 2. Product Lifecycle State Machine
1. **PENDING_VERIFICATION:** Artisan dictates craft details in native language. Gemini predicts Fair Wage Floor.
2. **VERIFIED:** Local Admin inspects data, approves, and issues a physical QR Patch ID.
3. **TAG_ATTACHED:** Artisan physically tags the item and passes the Gemini Vision Cross-Check gate.
4. **ADVANCE_PAID:** Selling rights transferred. Artisan instantly receives up to 60% of the Fair Wage Floor. Agent handoff completes.
5. **SOLD_FINAL:** Consumer purchases item (D2C/B2B). Profit is settled. Remaining balance auto-disbursed via UPI.
6. **FLAGGED:** Consumer disputes authenticity. Item suspended. Artisan health drops 15%. Dispute resolution initiated.

### 3. Financial Settlement Engine
The core promise of Karigari is Zero Middleman Exploitation.
**Formula:**
`Final Payout = Final Sale Price - Instant Advance Paid - Staker Yield (3%) - Platform Fee (0%)`
*Note: Any profit above the standard market price goes 100% back to the artisan.*

### 4. Technical Infrastructure
- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (PostgreSQL) managed via Prisma ORM
- **AI Core:** Google Gemini Pro (Conversational NLP) & Gemini Pro Vision (Counterfeit/Cross-check visual matching).
- **Authentication:** Custom JWT Role-Based Access Control (ARTISAN, ADMIN, SUPER_ADMIN).
- **Localization:** Client-side dynamic language switching mapping to native speech-to-text APIs.

### 5. Super Admin Oversight Protocol
To ensure local cooperatives do not exploit artisans, the Super Admin dashboard utilizes a **Min-Priority Heap algorithm**. It constantly evaluates Local Admins based on the price gap between the AI's predicted Fair Wage Floor and the actual Final Sale Price. Admins in the "Red Zone" (underpaying artisans) are immediately flagged for government review.

### 6. Revenue & Business Model (Platform Viability)
Karigari operates on a strict **Zero-Fee policy for Artisans**. Revenue is generated from the top of the supply chain:
- **B2B API Licensing & Verification Fees:** Luxury boutiques, retail brands, and ONDC seller apps pay micro-transaction fees to query the Karigari API for the Digital Passport. This mathematical proof of authenticity allows them to command a 30-40% price premium in urban markets.
- **Escrow & Liquidity Yields:** When an item is sold through the Karigari Advance channel, the 3% staker yield acts as an escrow fee (paid out of the final buyer’s premium), with a fraction retained for platform maintenance.
- **B2G (Business-to-Government) Data SaaS:** The live Regional Economic Health Indices and compliance data can be licensed to government bodies (e.g., Ministry of Textiles, NABARD) for targeted subsidy disbursement and economic policy-making.

### 7. Security & Anti-Corruption Mechanisms
The protocol is heavily decentralized to prevent Local Admin corruption or collusion:
- **AI Vision Cross-Check Gate:** The Local Admin is a facilitator, not the final authority. Even if an admin issues a Patch ID to a fake item, the artisan must pass the Phase 3 cross-check. Gemini Vision AI compares the live photo of the tagged item against the original blueprint. A score < 75% instantly locks the item, bypassing the corrupt admin.
- **Super Admin Anomaly Tracking:** The Min-Priority Heap actively tracks Local Admins. An unusually high rate of AI rejections or consumer flags in an admin's cluster drops them into the 'Red Zone' for immediate audit.
- **Crowdsourced Consumer Audits:** Final buyers act as the last line of defense. Scanning the QR code upon delivery allows them to flag counterfeits, penalizing both the Artisan's Health Score and the approving Local Admin's Trust Score.
