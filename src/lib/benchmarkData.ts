export interface BenchmarkData {
  craftType: string;
  maxLaborDays: number;
  maxMaterialCost: number;
  minMaterialCost: number;
}

export const craftBenchmarks: Record<string, BenchmarkData> = {
  "Pochampally Ikat Saree": {
    craftType: "Pochampally Ikat Saree",
    maxLaborDays: 20, // Anything over 20 days for a single standard saree is highly suspicious
    maxMaterialCost: 15000,
    minMaterialCost: 1000,
  },
  "Jaipur Blue Pottery": {
    craftType: "Jaipur Blue Pottery",
    maxLaborDays: 10,
    maxMaterialCost: 2000,
    minMaterialCost: 100,
  },
  "Pashmina Shawl": {
    craftType: "Pashmina Shawl",
    maxLaborDays: 45, // Pashmina takes longer
    maxMaterialCost: 25000,
    minMaterialCost: 3000,
  },
  "Channapatna Toys": {
    craftType: "Channapatna Toys",
    maxLaborDays: 5,
    maxMaterialCost: 500,
    minMaterialCost: 50,
  },
  "Terracotta": {
    craftType: "Terracotta",
    maxLaborDays: 7,
    maxMaterialCost: 1000,
    minMaterialCost: 50,
  },
  "DEFAULT": {
    craftType: "Unknown",
    maxLaborDays: 30, // Fallback safe limit
    maxMaterialCost: 20000,
    minMaterialCost: 50,
  }
};

/**
 * Checks if the artisan's claims are mathematically plausible.
 * @param craftType The type of craft (e.g., "Pochampally Ikat Saree")
 * @param laborDays The claimed days of labor
 * @param materialCost The claimed cost of materials
 * @returns An object containing `isValid` and a `reason` if invalid.
 */
export function validateArtisanClaim(craftType: string, laborDays: number, materialCost: number): { isValid: boolean; reason?: string } {
  // Normalize craft type to match keys
  const normalizedKey = Object.keys(craftBenchmarks).find(k => craftType.toLowerCase().includes(k.toLowerCase())) || "DEFAULT";
  const benchmark = craftBenchmarks[normalizedKey];

  if (laborDays > benchmark.maxLaborDays) {
    return {
      isValid: false,
      reason: `Mathematical Anomaly Detected: Claimed labor (${laborDays} days) exceeds the absolute maximum threshold (${benchmark.maxLaborDays} days) for ${benchmark.craftType}.`
    };
  }

  if (materialCost > benchmark.maxMaterialCost) {
    return {
      isValid: false,
      reason: `Mathematical Anomaly Detected: Claimed material cost (₹${materialCost}) exceeds the absolute maximum threshold (₹${benchmark.maxMaterialCost}) for ${benchmark.craftType}.`
    };
  }

  return { isValid: true };
}
