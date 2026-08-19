# Implementation Plan: Multi-Agent Architecture & OTP Handoff

## Goal Description
Transform the current UI flows to visually reflect a "Multi-Agent System" (MAS) and implement the highly secure "Agent OTP Handoff" flow, perfectly aligning the codebase with the Karigari Protocol Technical Specification.

## Proposed Changes

### 1. Visual Agent Branding in `CaptureModal`
We will update `src/components/CaptureModal.tsx` to explicitly reference the AI Agents during processing states:
#### [MODIFY] `CaptureModal.tsx`
- **Step 1 (Audio):** Change the processing text to *"Voice-Scribe Agent is transcribing local dialect..."*
- **Step 2 (Image):** Change text to *"Vision-Sentinel Agent is verifying handloom texture..."*
- **Step 5 (Fair Wage):** Change text to *"Economic-Compliance Agent is fetching regional labor rates..."*

### 2. The New Unified `AgentHandoffModal`
We will create a new modal that replaces the old Cross-Check flow. This handles Phase 3 (Vision Sentinel) and the physical dispatch.
#### [NEW] `src/components/AgentHandoffModal.tsx`
- **Step 1 (OTP Gate):** UI asks for a 4-digit Delivery Agent Code. Includes a "Simulate Agent" button for the hackathon demo.
- **Step 2 (Vision-Sentinel Check):** Once the OTP is entered, the camera unlocks. The artisan takes a photo of the product with the attached `PATCH-ID`.
- **Step 3 (Execution):** The AI verifies the match. If successful, the item is locked for dispatch and the artisan is cleared.

### 3. Update Dashboard Routing
We will update the Artisan Dashboard to map correctly to this new 5-Phase flow.
#### [MODIFY] `src/app/artisan/dashboard/page.tsx`
- Remove the old `CrossCheckModal`.
- Integrate `AgentHandoffModal`.
- **Status `TAG_ATTACHED`:** Shows a button **"Initiate Agent Handoff"** which opens the `AgentHandoffModal`.

## Verification Plan
1. Open the Artisan Dashboard and run a new Capture flow to see the "Multi-Agent" loading screens.
2. Manually change an item's status to `TAG_ATTACHED` in the database (or run the flow end-to-end).
3. Click "Initiate Agent Handoff", enter the simulated OTP, take a picture, and verify the status successfully updates.
