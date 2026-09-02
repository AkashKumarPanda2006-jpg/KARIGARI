/**
 * Deterministic Indian Rupee (INR) formatter for SSR and Client consistency.
 * Prevents Next.js Hydration Mismatch errors caused by locale discrepancies.
 */
export function formatINR(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return "0";
  const str = Math.round(val).toString();
  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  if (otherNumbers !== '') {
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  }
  return lastThree;
}
