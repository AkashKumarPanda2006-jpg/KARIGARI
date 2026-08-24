/**
 * Anti-exploitation pricing rule (new_admin.md, Tier 1.1).
 *
 * The AI Pricing Assistant computes a `fairWageFloor` from labour days plus raw
 * material cost. If the price the artisan actually accepts falls more than 30%
 * below that floor, a middleman is very likely squeezing them, so the listing is
 * flagged for a facilitator to phone the artisan before it goes live.
 *
 * This is the single source of truth for the rule. `simulate-sale` persists the
 * verdict onto the row; the facilitator queue also recomputes it on the fly so
 * legacy rows written before `pricingFlag` existed still surface.
 */

/** An accepted price below this fraction of the fair wage floor is exploitative. */
export const FAIR_WAGE_TOLERANCE = 0.7;

/** Percentage drop that trips the flag, for display in the UI. */
export const FAIR_WAGE_DROP_THRESHOLD_PCT = Math.round((1 - FAIR_WAGE_TOLERANCE) * 100);

export interface PricingDiscrepancyInput {
  fairWageFloor?: number | null;
  salePrice?: number | null;
  pricingFlag?: boolean | null;
  flagReason?: string | null;
}

export interface PricingDiscrepancy {
  /** True when the accepted price is more than 30% below the AI fair wage floor. */
  flagged: boolean;
  /** How far below the floor the accepted price sits, in whole percent. 0 when not below. */
  pctBelow: number;
  /** Human-readable explanation, or null when there is nothing to explain. */
  reason: string | null;
  /** AI-suggested fair price, or null when the AI never produced one. */
  fairPrice: number | null;
  /** The price actually accepted, or null when the item has not sold yet. */
  acceptedPrice: number | null;
  /** Rupees the artisan lost against the fair floor. 0 when not below. */
  shortfall: number;
}

/**
 * Compare an item's accepted price against its AI fair wage floor.
 * Safe on partial rows: missing prices yield an unflagged, zeroed result rather
 * than NaN, so a legacy item never breaks the queue.
 */
export function getPricingDiscrepancy(item: PricingDiscrepancyInput): PricingDiscrepancy {
  const fairPrice = numberOrNull(item.fairWageFloor);
  const acceptedPrice = numberOrNull(item.salePrice);

  // Nothing to compare against — fall back to whatever was persisted on the row.
  if (fairPrice === null || fairPrice <= 0 || acceptedPrice === null) {
    return {
      flagged: Boolean(item.pricingFlag),
      pctBelow: 0,
      reason: item.flagReason ?? null,
      fairPrice,
      acceptedPrice,
      shortfall: 0,
    };
  }

  const shortfall = Math.max(0, fairPrice - acceptedPrice);
  const pctBelow = Math.round((shortfall / fairPrice) * 100);
  const flagged = acceptedPrice < fairPrice * FAIR_WAGE_TOLERANCE;

  return {
    flagged: flagged || Boolean(item.pricingFlag),
    pctBelow,
    reason: flagged
      ? `Accepted price ${pctBelow}% below AI fair wage floor`
      : item.flagReason ?? null,
    fairPrice,
    acceptedPrice,
    shortfall,
  };
}

function numberOrNull(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Format rupees for display without ever rendering NaN. */
export function formatRupees(value: number | null | undefined): string {
  const n = numberOrNull(value ?? null);
  if (n === null) return '—';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}
