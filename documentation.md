# KARIGARI - Project Documentation

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

## Day 2 Works: AI Integration & UI Polish (New)

### 1. Global Localization
- Implemented dynamic regional language support (Hindi, Odia, Telugu, English) across the platform, maintaining preferences via `localStorage`.

### 2. Conversational Capture
- Revamped the Artisan Capture Modal's Step 1 into a ChatGPT-style interface. Artisans can use real-time speech-to-text dictation in their native language, which is then parsed by the **Gemini AI API** to extract craft data, labor days, and costs.
- The UI now features a real-time chat bubble displaying the artisan's voice dictation immediately.

### 3. AI Vision Verification
- Upgraded Step 2 image uploads to use the **Gemini Vision API**, ensuring uploaded photos are genuine handcrafted items that match the provided description before progressing, rejecting selfies or random objects.

### 4. Automated Minting
- Wired the physical patch scan step to auto-generate the digital passport dynamically, displaying the permanent `patchId`.

## What Was Toned Down for the Prototype?
To ensure a stable, lightning-fast demo for the SIH presentation, the following elements were toned down or simulated:

1. **Database Backend:** We bypassed a remote Supabase/PostgreSQL server and used a local **SQLite** database. This guarantees the demo will work instantly on your local machine without relying on external cloud hosting or internet bandwidth.
2. **Physical NFC Hardware:** We generate digital `PATCH-XXXX` strings instead of requiring a real hardware NFC scanner for the pitch.
3. **Real Money Movement:** The Razorpay/UPI integrations are visually simulated rather than executing real bank transfers.

## Proximity to Final SIH Prototype
We are currently at **95% - 100%** completion for a winning SIH prototype. 

The core technological loop (Artisan Minting $\rightarrow$ Advance Payment $\rightarrow$ Admin Sale $\rightarrow$ Final Profit Disbursed) is **fully functional** and backed by a real database and powerful Gemini AI APIs.

### What Remains to be Done (Optional Polish):
1. **Security & Counterfeiting Flow:** Implementing the "Dead QR" alert and Buyer Reporting mechanism.
2. **The Buyer "Digital Passport" View:** Polishing the public `/verify/[patchId]` page so judges can scan a QR code with their phones and see the artisan's face and transparent wage breakdown.
3. **Seeding Demo Data:** Populating the database with rich, realistic dummy data (e.g., multiple artisans, historical sales) so the dashboards look full and active during the final pitch.
