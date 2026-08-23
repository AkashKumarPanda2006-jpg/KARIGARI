# The KARIGARI Admin Architecture: SIH 26090 Winning Strategy

## The Core Philosophy (Why Most Dashboards Fail)
For SIH 26090 (MoSJE), the judges do not want to see a generic Shopify-style admin dashboard with basic "Total Sales" charts. The problem statement targets the **unorganized sector** and **marginalized artisans**. 

Therefore, your Admin Dashboard must not be a "Store Manager" — it must be an **AI Quality Assurance and Artisan Protection Guardian**. It needs to prove that your AI tools (Voice Cataloger and Pricing Assistant) are actually working safely in the real world.

To score a 10/10, we propose a **Two-Tier Admin System**:

---

## Tier 1: The Field Facilitator (NGO / Cooperative Leader)
*This is the on-the-ground admin who works directly with the artisans in a specific district.*

### 1. The Anti-Exploitation Queue (Dynamic Pricing Guardian)
* **The Problem:** An artisan might be coerced by a local middleman to list a beautiful ₹5,000 handloom saree for ₹1,500 so the middleman can buy it instantly and flip it.
* **The Dashboard Feature:** The "Pricing Discrepancy Queue." 
* **How it works:** When the AI Pricing Assistant suggests a fair wage of ₹5,000, but the artisan manually overrides the price to ₹1,500 (more than a 30% drop), the system **flags the listing**. The Facilitator sees a red flag, giving them the exact phone number to call the artisan and ensure they aren't being exploited before the listing goes live.

### 2. AI Voice Translation Audit (Human-in-the-Loop)
* **The Problem:** AI can hallucinate. What if the artisan says "Cotton" in Odia, but Whisper translates it as "Silk"?
* **The Dashboard Feature:** The "Voice QA Center."
* **How it works:** When reviewing a pending product, the Facilitator sees a side-by-side view:
  * A play button for the **Original Audio Blob**.
  * The **Raw Regional Transcript** (Odia/Hindi).
  * The **Final AI English Description**.
* **Why Judges Love It:** This proves you aren't blindly trusting AI. You have built a responsible, auditable AI system.

### 3. Assisted Onboarding Portal
* **How it works:** An interface for the Facilitator to onboard multiple artisans who *do not own smartphones*. The Facilitator uses their own device to take the photo, hands the phone to the artisan to record the voice note, and publishes it under the artisan's sub-profile. 

---

## Tier 2: Central Nodal Officer (MoSJE / State Level)
*This is the macro-level government official monitoring policy impact.*

### 1. Digital Inclusion Impact Metrics
* Instead of showing "revenue," this dashboard tracks the success of the MoSJE mandate.
* **Metrics to display:**
  * **Cataloging Method:** % of products listed via Voice vs. Manual Typing (Proves your Voice tool is breaking the literacy barrier).
  * **Language Distribution:** A pie chart of regional languages used (e.g., 45% Odia, 30% Hindi, 25% Telugu).
  * **Average Wage Increase:** The difference between the artisan's historical baseline income and the new AI-suggested fair prices.

### 2. Traceability & Hash-Ledger Oversight
* A global view of the Tamper-Evident Digital Passports. The officer can enter any Product ID and see the immutable hash-chain (Created → Verified by Facilitator → Sold) to prove the system's integrity against systemic fraud.

---

## Development Blueprint for Your Teammate

If you hand this to your teammate, here is exactly what they should build in Next.js:

### Data Models Needed (Add to Prisma)
1. **User Role Update:** Ensure roles are `ARTISAN`, `FACILITATOR` (Tier 1), and `NODAL_OFFICER` (Tier 2).
2. **Flag Status:** Add a `pricingFlag: boolean` and `flagReason: string` to the `CraftItem` model.

### Pages to Build
* **`/admin/facilitator` (Tier 1 Dashboard)**
  * **Tab 1: Pending QA.** List of items needing review. Must include the `<audio>` tag linked to the Voice Assistant blob, and the Anti-Exploitation price comparison.
  * **Tab 2: My Cluster.** A CRM-style list of artisans in their district, with a button to "Add Product on Behalf of Artisan".
* **`/admin/nodal` (Tier 2 Dashboard)**
  * **Tab 1: Impact Analytics.** Recharts visualizing the "Digital Inclusion Metrics" (Voice vs Text adoption, Language distribution).
  * **Tab 2: Global Audit.** A search bar to look up any Product ID and view its cryptographic hash chain to verify authenticity.

### The Pitch Clincher
When presenting this, your team should say: *"We didn't build a dashboard to track sales. We built a two-tier oversight system to protect artisans from exploitation, audit our AI's accuracy, and prove to the Ministry that the digital divide is actively being closed."*
