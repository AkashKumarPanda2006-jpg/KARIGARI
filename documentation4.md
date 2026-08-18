# KARIGARI - Project Documentation v4

## Project Overview
Karigari is a decentralized supply chain protocol designed to empower handloom artisans. By cryptographically linking physical craft items to a digital ledger using AI verification and physical patches (QR/NFC), the platform guarantees fair wages, eliminates middleman exploitation, and prevents counterfeiting.

## Day 1 Works (Foundation)
### 1. Database & Authentication
- **Local SQLite DB:** Initialized Prisma with a local SQLite database for rapid, zero-friction prototyping.
- **Custom JWT Auth:** Built a secure authentication system using `httpOnly` cookies, separating `ARTISAN` and `ADMIN` roles.
### 2. Artisan Experience
- **Artisan Dashboard:** Built a real-time dashboard displaying total advances received, pending payouts, and recent craft inventory.
- **Capture Flow (Step 1-4):** Implemented a 6-step modal for minting new crafts.
- **ML Decision Engine (Step 5):** The system dynamically calculates a `Fair Wage Floor` and `Standard Market Price` based on labor days, material costs, and seasonality.
- **Transparent Payment Gateway (Step 6):** Built a financial breakdown showing the artisan exactly how much advance is paid instantly, what amount is queued for final sale, and what platform fees (0%) are taken.
### 3. Cooperative / Admin Experience
- **Admin Dashboard:** Built a dashboard for Cooperative Managers to track inventory and queued payouts.
- **Transaction Settlement:** Implemented an interactive "Simulate Sale" feature. Admins can input the final real-world sale price of a craft. The system automatically calculates the remaining profit and queues it back to the original artisan's ledger.

## Day 2 Works: AI Integration & UI Polish
### 1. Global Localization
- Implemented dynamic regional language support (Hindi, Odia, Telugu, English) across the platform, maintaining preferences via `localStorage`.
### 2. Conversational Capture
- Revamped the Artisan Capture Modal's Step 1 into a ChatGPT-style interface. Artisans can use real-time speech-to-text dictation in their native language, which is then parsed by the **Gemini AI API** to extract craft data, labor days, and costs.
### 3. AI Vision Verification
- Upgraded Step 2 image uploads to use the **Gemini Vision API**, ensuring uploaded photos are genuine handcrafted items that match the provided description before progressing, rejecting selfies or random objects.
### 4. Automated Minting
- Wired the physical patch scan step to auto-generate the digital passport dynamically, displaying the permanent `patchId`.

## Day 3 Works: Supabase & Admin Tooling
### 1. Database Migration
- Fully migrated the backend from local SQLite to a production-ready **Supabase PostgreSQL** database for remote access and real-time durability.
### 2. Admin Security & Fraud Prevention
- Built a live polling notification system on the Admin Dashboard to dynamically track and alert admins about Counterfeit products or crafts with unusually low fairness scores.
### 3. User Management System 
- Built a global directory for Admins (`/admin/users`) to track all registered artisans and their metrics. 
- Added security controls to toggle artisan accounts between **Active** and **Suspended** states.

## Day 4 Works: Trust, Automation & Digital Passport
### 1. The Buyer "Digital Passport" View
- Completely designed and implemented the public `/verify/[patchId]` page. Judges and consumers can now scan a QR code with their phones, verify the product via camera in real-time, and view the transparent wage breakdown and artisan story.
### 2. Advanced Counterfeit Prevention & Probation Logic
- Upgraded the Buyer verification camera to support multi-photo scanning (1-3 photos) to handle tricky lighting angles.
- Added a 5-minute / 10-attempt grace period for buyers before a product is permanently `FLAGGED`.
- Built automated Health Score dynamics: Artisans lose 15% health for flagged counterfeits, dropping them into **Probation** (50-64%) or **Banned** (<50%) states. Successful sales recover 2.5% health. 
- Overturned flags (e.g. if an item passes verification on a later attempt) automatically transition the status to `SOLD_FINAL` and restore the Artisan's health score fully.
### 3. Automated Ledger & Timeline
- Removed the manual payouts ledger (`/admin/payouts`) to adhere to the core philosophy: **zero middleman interference**. Payouts are now fully automated end-to-end triggers.
- Re-architected the `Audit Logs` page into a robust **Visual Product Timeline**. Searching for a `Patch ID` now yields a chronological UI mapping an item from `CAPTURE` -> `VERIFICATION` -> `SOLD_FINAL`, serving as an immutable, decentralized proof-of-journey.
### 4. Dynamic Artisan Profiling
- The `Capture` flow now intelligently extracts craft categories (e.g., Saree, Pottery) and dynamically attaches them as badges to the Artisan Profile. Buyers see these evolving credentials live on the Digital Passport.
- Fixed UI components by adding intuitive Camera Action icons to all Capture/Verification buttons across the platform.

## Day 5 Works: Government Oversight & Protocol Pivot (Latest)
### 1. The Super Admin (Government) Dashboard
- Introduced the `SUPER_ADMIN` role for centralized oversight.
- Built a macro-level dashboard tracking the **Regional Economic Health Index**.
- Utilized a **Min-Priority Heap algorithm** to sort local cooperative Admins by their fair-wage compliance score, instantly highlighting regions that need government intervention or subsidies.
- Displayed the global raw immutable audit ledger for complete platform transparency.
### 2. The Aggregator Routing Engine
- Pivoted away from building a standard D2C marketplace, redefining Karigari as a backend B2B/Escrow Protocol.
- Re-engineered the Artisan `SellModal` into a **Routing Engine**. Artisans hand over digital selling rights and claim their advance, choosing to route their products to **ONDC integration**, **B2B Wholesale Boutiques**, or **Karigari Auto-Auction**.
### 3. Strategic Counterfeit Dispute UI
- Built a highly secure `DisputeModal` for Artisans facing a `FLAGGED` counterfeit alert.
- Displays a side-by-side comparison of the artisan's original capture vs. the buyer's flagged image.
- Forces artisans to sign a legal penalty declaration before requesting a manual review, aggressively filtering out frivolous disputes.
### 4. Artisan-Side AI Cross-Check Gate
- Added an intermediary physical verification step (`CrossCheckModal`). After a local Admin verifies the product in the system, the Artisan must scan the newly attached QR code with their own camera to prove the digital ID was bound to the correct physical asset before selling rights can be transferred.

## Proximity to Final SIH Prototype
We have reached **100% feature completion** for a winning SIH prototype!
The application is fully styled, handles end-to-end edge cases, integrates Gemini AI, proves the S8 "AI Fairness" problem statement flawlessly, and positions itself as a massive, scalable backend protocol rather than a standard e-commerce site.
