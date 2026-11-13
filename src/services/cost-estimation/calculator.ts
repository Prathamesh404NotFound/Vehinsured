import { CostEstimateResult, CostReferenceItem, DamagedRegion, VehicleCategory } from '../../types';

/**
 * Illustrative baseline repair-cost reference dataset (INR) grounded in Indian
 * aftermarket & authorized service center workshop pricing benchmarks (2026).
 * Marked as illustrative sample values requiring local workshop verification.
 */
export const DEFAULT_COST_REFERENCES: CostReferenceItem[] = [
  {
    id: 'ref-bumper-front',
    partName: 'Front Bumper',
    category: 'hatchback',
    repairLaborMin: 1200,
    repairLaborMax: 2200,
    replacePartsMin: 2200,
    replacePartsMax: 4200,
    paintingAllowanceMin: 1500,
    paintingAllowanceMax: 2800,
    notes: 'Includes dent/crack repair or OEM bumper shell + primer & clear-coat.',
    lastUpdated: Date.now(),
    updatedBy: 'Reference Baseline (2026)',
  },
  {
    id: 'ref-bumper-rear',
    partName: 'Rear Bumper',
    category: 'hatchback',
    repairLaborMin: 1100,
    repairLaborMax: 2000,
    replacePartsMin: 2000,
    replacePartsMax: 4000,
    paintingAllowanceMin: 1500,
    paintingAllowanceMax: 2600,
    notes: 'Sensor cutout refitting may add nominal labor if parking sensors exist.',
    lastUpdated: Date.now(),
    updatedBy: 'Reference Baseline (2026)',
  },
  {
    id: 'ref-bonnet',
    partName: 'Bonnet',
    category: 'hatchback',
    repairLaborMin: 1500,
    repairLaborMax: 3000,
    replacePartsMin: 4000,
    replacePartsMax: 7000,
    paintingAllowanceMin: 2200,
    paintingAllowanceMax: 4000,
    notes: 'Sheet-metal denting + full panel color matching.',
    lastUpdated: Date.now(),
    updatedBy: 'Reference Baseline (2026)',
  },
  {
    id: 'ref-headlight',
    partName: 'Headlight',
    category: 'hatchback',
    repairLaborMin: 400,
    repairLaborMax: 800,
    replacePartsMin: 2200,
    replacePartsMax: 8000,
    paintingAllowanceMin: 0,
    paintingAllowanceMax: 0,
    notes: 'Halogen assemblies sit near lower bound; LED projector DRL units sit higher.',
    lastUpdated: Date.now(),
    updatedBy: 'Reference Baseline (2026)',
  },
  {
    id: 'ref-taillight',
    partName: 'Tail Light',
    category: 'hatchback',
    repairLaborMin: 350,
    repairLaborMax: 700,
    replacePartsMin: 1800,
    replacePartsMax: 5500,
    paintingAllowanceMin: 0,
    paintingAllowanceMax: 0,
    notes: 'Cracked tail light lenses typically require full assembly replacement.',
    lastUpdated: Date.now(),
    updatedBy: 'Reference Baseline (2026)',
  },
  {
    id: 'ref-door-front',
    partName: 'Front Door',
    category: 'hatchback',
    repairLaborMin: 1500,
    repairLaborMax: 3000,
    replacePartsMin: 5000,
    replacePartsMax: 9000,
    paintingAllowanceMin: 2000,
    paintingAllowanceMax: 3800,
    notes: 'Per-panel denting & painting; bare door shell replacement if crease is deep.',
    lastUpdated: Date.now(),
    updatedBy: 'Reference Baseline (2026)',
  },
  {
    id: 'ref-door-rear',
    partName: 'Rear Door',
    category: 'hatchback',
    repairLaborMin: 1400,
    repairLaborMax: 2800,
    replacePartsMin: 4800,
    replacePartsMax: 8500,
    paintingAllowanceMin: 2000,
    paintingAllowanceMax: 3600,
    notes: 'Includes trim removal and re-alignment.',
    lastUpdated: Date.now(),
    updatedBy: 'Reference Baseline (2026)',
  },
  {
    id: 'ref-fender',
    partName: 'Fender',
    category: 'hatchback',
    repairLaborMin: 1000,
    repairLaborMax: 2000,
    replacePartsMin: 1600,
    replacePartsMax: 3500,
    paintingAllowanceMin: 1500,
    paintingAllowanceMax: 2600,
    notes: 'Quarter panel / front mudguard denting and blending.',
    lastUpdated: Date.now(),
    updatedBy: 'Reference Baseline (2026)',
  },
  {
    id: 'ref-windscreen',
    partName: 'Windscreen',
    category: 'hatchback',
    repairLaborMin: 1000,
    repairLaborMax: 1800,
    replacePartsMin: 4000,
    replacePartsMax: 8500,
    paintingAllowanceMin: 0,
    paintingAllowanceMax: 0,
    notes: 'Laminated OEM glass + polyurethane adhesive kit.',
    lastUpdated: Date.now(),
    updatedBy: 'Reference Baseline (2026)',
  },
  {
    id: 'ref-rear-windshield',
    partName: 'Rear Windshield',
    category: 'hatchback',
    repairLaborMin: 900,
    repairLaborMax: 1600,
    replacePartsMin: 3500,
    replacePartsMax: 6500,
    paintingAllowanceMin: 0,
    paintingAllowanceMax: 0,
    notes: 'Defogger-integrated rear glass.',
    lastUpdated: Date.now(),
    updatedBy: 'Reference Baseline (2026)',
  },
  {
    id: 'ref-mirror',
    partName: 'Side Mirror',
    category: 'hatchback',
    repairLaborMin: 300,
    repairLaborMax: 600,
    replacePartsMin: 1200,
    replacePartsMax: 4500,
    paintingAllowanceMin: 400,
    paintingAllowanceMax: 800,
    notes: 'Higher range applies to motorized autofold ORVMs with turn indicators.',
    lastUpdated: Date.now(),
    updatedBy: 'Reference Baseline (2026)',
  },
  {
    id: 'ref-grille',
    partName: 'Radiator Grille',
    category: 'hatchback',
    repairLaborMin: 400,
    repairLaborMax: 800,
    replacePartsMin: 1500,
    replacePartsMax: 4200,
    paintingAllowanceMin: 0,
    paintingAllowanceMax: 0,
    notes: 'Front chrome/ABS grille assembly.',
    lastUpdated: Date.now(),
    updatedBy: 'Reference Baseline (2026)',
  },
  {
    id: 'ref-roof',
    partName: 'Roof Panel',
    category: 'hatchback',
    repairLaborMin: 2500,
    repairLaborMax: 5000,
    replacePartsMin: 7000,
    replacePartsMax: 14000,
    paintingAllowanceMin: 3000,
    paintingAllowanceMax: 5500,
    notes: 'Requires headliner removal and structural inspection.',
    lastUpdated: Date.now(),
    updatedBy: 'Reference Baseline (2026)',
  },
  {
    id: 'ref-wheel',
    partName: 'Wheel / Alloy Rim',
    category: 'hatchback',
    repairLaborMin: 500,
    repairLaborMax: 1200,
    replacePartsMin: 3000,
    replacePartsMax: 9000,
    paintingAllowanceMin: 0,
    paintingAllowanceMax: 0,
    notes: 'Steel rims at lower bound; diamond-cut alloys at upper bound.',
    lastUpdated: Date.now(),
    updatedBy: 'Reference Baseline (2026)',
  },
];

export const CATEGORY_MULTIPLIERS: Record<VehicleCategory, number> = {
  hatchback: 1.0,
  sedan: 1.25,
  suv: 1.45,
  luxury: 2.5,
  two_wheeler: 0.35,
  commercial: 1.55,
};

export function calculateRepairEstimate(
  damagedRegions: DamagedRegion[],
  category: VehicleCategory = 'hatchback',
  referenceItems: CostReferenceItem[] = DEFAULT_COST_REFERENCES
): CostEstimateResult {
  const categoryMultiplier = CATEGORY_MULTIPLIERS[category] || 1.0;

  if (!damagedRegions || damagedRegions.length === 0) {
    return {
      vehicleCategory: category,
      components: [],
      totalMin: 0,
      totalMax: 0,
      assumptions: [
        'No damaged components have been recorded yet. Add at least one damaged component to calculate an indicative cost range.',
      ],
      referenceTableVersion: 'REF-2026.2-INDIA-BASELINE',
      lastUpdatedDate: new Date().toLocaleDateString(),
      disclaimer:
        'Illustrative sample values requiring local verification. Not an official insurer rate card or workshop quotation.',
    };
  }

  const componentsEstimate = damagedRegions.map((region) => {
    const normalizedName = region.partName.toLowerCase();
    const ref =
      referenceItems.find((item) => item.partName.toLowerCase() === normalizedName) ||
      referenceItems.find((item) => normalizedName.includes(item.partName.toLowerCase())) || {
        id: 'ref-generic',
        partName: region.partName,
        category,
        repairLaborMin: 900,
        repairLaborMax: 1800,
        replacePartsMin: 2000,
        replacePartsMax: 5000,
        paintingAllowanceMin: 1000,
        paintingAllowanceMax: 2400,
        lastUpdated: Date.now(),
        updatedBy: 'Default Rule',
      };

    const isSevere = region.severity === 'severe' || region.damageType === 'broken';
    const isModerate = region.severity === 'moderate' || region.damageType === 'crack';
    const isUnable = region.severity === 'unable_to_determine';
    const operation: 'repair' | 'replace' | 'inspect' = isUnable
      ? 'inspect'
      : isSevere
      ? 'replace'
      : 'repair';

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
    } else if (operation === 'inspect') {
      partsMin = 0;
      partsMax = Math.round(ref.replacePartsMax * 0.5 * categoryMultiplier);
      laborMin = Math.round(ref.repairLaborMin * 0.5 * categoryMultiplier);
      laborMax = Math.round(ref.repairLaborMax * categoryMultiplier);
      paintingMin = 0;
      paintingMax = Math.round(ref.paintingAllowanceMax * 0.5 * categoryMultiplier);
    } else {
      partsMin = region.damageType === 'scratch' ? 0 : Math.round(ref.replacePartsMin * 0.2 * categoryMultiplier);
      partsMax = region.damageType === 'scratch' ? 500 : Math.round(ref.replacePartsMax * 0.35 * categoryMultiplier);
      laborMin = Math.round(ref.repairLaborMin * (isModerate ? 1.15 : 0.8) * categoryMultiplier);
      laborMax = Math.round(ref.repairLaborMax * (isModerate ? 1.25 : 0.9) * categoryMultiplier);
      paintingMin = Math.round(ref.paintingAllowanceMin * (isModerate ? 1.0 : 0.65) * categoryMultiplier);
      paintingMax = Math.round(ref.paintingAllowanceMax * (isModerate ? 1.0 : 0.75) * categoryMultiplier);
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
      `Illustrative baseline values adjusted for ${category.toUpperCase()} segment (multiplier ${categoryMultiplier}x).`,
      'Ranges span independent multi-brand garage estimates (lower bound) to authorized OEM service center rates (upper bound).',
      'Hidden mechanical, electrical, or chassis frame damage is excluded and requires physical workshop disassembly.',
      'Policy deductibles, depreciation (if without Zero-Dep add-on), and NCB impact are determined solely by your insurer.',
    ],
    referenceTableVersion: 'REF-2026.2-INDIA-BASELINE',
    lastUpdatedDate: new Date().toLocaleDateString(),
    disclaimer:
      'Illustrative sample values requiring local verification. Not an official insurer rate card, workshop quotation, or guarantee of insurance payout.',
  };
}
