import { CostEstimateResult, CostReferenceItem, DamagedRegion, VehicleCategory } from '../../types';

// Default initial reference cost data (sample dataset for demo/testing)
export const DEFAULT_COST_REFERENCES: CostReferenceItem[] = [
  {
    id: 'ref-bumper-front',
    partName: 'Front Bumper',
    category: 'hatchback',
    repairLaborMin: 800,
    repairLaborMax: 1500,
    replacePartsMin: 2500,
    replacePartsMax: 4500,
    paintingAllowanceMin: 1200,
    paintingAllowanceMax: 2200,
    lastUpdated: Date.now(),
    updatedBy: 'System Administrator'
  },
  {
    id: 'ref-bumper-rear',
    partName: 'Rear Bumper',
    category: 'hatchback',
    repairLaborMin: 800,
    repairLaborMax: 1500,
    replacePartsMin: 2500,
    replacePartsMax: 4200,
    paintingAllowanceMin: 1200,
    paintingAllowanceMax: 2000,
    lastUpdated: Date.now(),
    updatedBy: 'System Administrator'
  },
  {
    id: 'ref-bonnet',
    partName: 'Bonnet',
    category: 'hatchback',
    repairLaborMin: 1200,
    repairLaborMax: 2500,
    replacePartsMin: 4500,
    replacePartsMax: 8500,
    paintingAllowanceMin: 2000,
    paintingAllowanceMax: 3500,
    lastUpdated: Date.now(),
    updatedBy: 'System Administrator'
  },
  {
    id: 'ref-headlight',
    partName: 'Headlight',
    category: 'hatchback',
    repairLaborMin: 300,
    repairLaborMax: 600,
    replacePartsMin: 1800,
    replacePartsMax: 4000,
    paintingAllowanceMin: 0,
    paintingAllowanceMax: 0,
    lastUpdated: Date.now(),
    updatedBy: 'System Administrator'
  },
  {
    id: 'ref-door-front',
    partName: 'Front Door',
    category: 'hatchback',
    repairLaborMin: 1500,
    repairLaborMax: 3000,
    replacePartsMin: 5500,
    replacePartsMax: 9500,
    paintingAllowanceMin: 2200,
    paintingAllowanceMax: 3800,
    lastUpdated: Date.now(),
    updatedBy: 'System Administrator'
  },
  {
    id: 'ref-fender',
    partName: 'Fender',
    category: 'hatchback',
    repairLaborMin: 1000,
    repairLaborMax: 2000,
    replacePartsMin: 2800,
    replacePartsMax: 5000,
    paintingAllowanceMin: 1500,
    paintingAllowanceMax: 2800,
    lastUpdated: Date.now(),
    updatedBy: 'System Administrator'
  },
  {
    id: 'ref-windscreen',
    partName: 'Windscreen',
    category: 'hatchback',
    repairLaborMin: 800,
    repairLaborMax: 1500,
    replacePartsMin: 3500,
    replacePartsMax: 6500,
    paintingAllowanceMin: 0,
    paintingAllowanceMax: 0,
    lastUpdated: Date.now(),
    updatedBy: 'System Administrator'
  }
];

// Multipliers by vehicle category
export const CATEGORY_MULTIPLIERS: Record<VehicleCategory, number> = {
  hatchback: 1.0,
  sedan: 1.25,
  suv: 1.45,
  luxury: 2.5,
  two_wheeler: 0.55,
  commercial: 1.6
};

export function calculateRepairEstimate(
  damagedRegions: DamagedRegion[],
  category: VehicleCategory = 'hatchback',
  referenceItems: CostReferenceItem[] = DEFAULT_COST_REFERENCES
): CostEstimateResult {
  const categoryMultiplier = CATEGORY_MULTIPLIERS[category] || 1.0;
  const componentsEstimate = damagedRegions.map((region) => {
    // Find matching reference item by fuzzy part name match or fallback to generic
    const ref = referenceItems.find(
      (item) => item.partName.toLowerCase() === region.partName.toLowerCase()
    ) || {
      id: 'ref-generic',
      partName: region.partName,
      category,
      repairLaborMin: 800,
      repairLaborMax: 1800,
      replacePartsMin: 2000,
      replacePartsMax: 5000,
      paintingAllowanceMin: 1000,
      paintingAllowanceMax: 2500,
      lastUpdated: Date.now(),
      updatedBy: 'Default Rule'
    };

    // Determine operation based on severity
    const isSevere = region.severity === 'severe' || region.damageType === 'broken';
    const isModerate = region.severity === 'moderate' || region.damageType === 'crack';
    const operation: 'repair' | 'replace' | 'inspect' = isSevere ? 'replace' : 'repair';

    let partsMin = 0;
    let partsMax = 0;
    let laborMin = 0;
    let laborMax = 0;
    let paintingMin = 0;
    let paintingMax = 0;

    if (operation === 'replace') {
      partsMin = Math.round(ref.replacePartsMin * categoryMultiplier);
      partsMax = Math.round(ref.replacePartsMax * categoryMultiplier);
      laborMin = Math.round(ref.repairLaborMin * 0.8 * categoryMultiplier);
      laborMax = Math.round(ref.repairLaborMax * 0.8 * categoryMultiplier);
      paintingMin = Math.round(ref.paintingAllowanceMin * categoryMultiplier);
      paintingMax = Math.round(ref.paintingAllowanceMax * categoryMultiplier);
    } else {
      // Repair
      partsMin = region.damageType === 'scratch' ? 0 : Math.round(ref.replacePartsMin * 0.25 * categoryMultiplier);
      partsMax = region.damageType === 'scratch' ? 500 : Math.round(ref.replacePartsMax * 0.3 * categoryMultiplier);
      laborMin = Math.round(ref.repairLaborMin * (isModerate ? 1.2 : 0.8) * categoryMultiplier);
      laborMax = Math.round(ref.repairLaborMax * (isModerate ? 1.3 : 0.9) * categoryMultiplier);
      paintingMin = Math.round(ref.paintingAllowanceMin * (isModerate ? 1.0 : 0.6) * categoryMultiplier);
      paintingMax = Math.round(ref.paintingAllowanceMax * (isModerate ? 1.0 : 0.7) * categoryMultiplier);
    }

    const subtotalMin = partsMin + laborMin + paintingMin;
    const subtotalMax = partsMax + laborMax + paintingMax;

    return {
      partName: region.partName,
      suggestedOperation: operation,
      partsCostMin: partsMin,
      partsCostMax: partsMax,
      laborCostMin: laborMin,
      laborCostMax: laborMax,
      paintingCostMin: paintingMin,
      paintingCostMax: paintingMax,
      subtotalMin,
      subtotalMax,
    };
  });

  const totalMin = componentsEstimate.reduce((sum, c) => sum + c.subtotalMin, 0);
  const totalMax = componentsEstimate.reduce((sum, c) => sum + c.subtotalMax, 0);

  return {
    vehicleCategory: category,
    components: componentsEstimate,
    totalMin,
    totalMax,
    assumptions: [
      `Cost estimates are calculated using standard regional repair reference baseline adjusted for ${category.toUpperCase()} vehicles (multiplier ${categoryMultiplier}x).`,
      'Includes estimated labor, estimated OEM/OES replacement parts, and surface painting allowances where applicable.',
      'Hidden internal or structural chassis damage is not included and requires physical workshop disassembly.'
    ],
    referenceTableVersion: 'REF-2026.1-STANDARD',
    lastUpdatedDate: new Date().toLocaleDateString(),
    disclaimer: 'Indicative repair cost range only. Actual quotes vary by workshop, city, and insurer final surveyor assessment.'
  };
}
