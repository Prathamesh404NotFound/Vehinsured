import { DamageSeverity } from '../../types';

export interface DamageClassificationInput {
  confidence?: number;
  areaRatio?: number; // Damaged region relative area (0.0 to 1.0)
  damageType?: 'dent' | 'scratch' | 'crack' | 'broken' | 'alignment' | 'other';
  isStructuralComponent?: boolean;
}

export function classifyDamageSeverity(input: DamageClassificationInput): DamageSeverity {
  const { confidence, areaRatio = 0.05, damageType, isStructuralComponent } = input;

  if (confidence !== undefined && confidence < 0.3) {
    return 'unable_to_determine';
  }

  if (damageType === 'broken' || isStructuralComponent || areaRatio > 0.25) {
    return 'severe';
  }

  if (damageType === 'dent' || damageType === 'crack' || areaRatio > 0.1) {
    return 'moderate';
  }

  if (damageType === 'scratch' || areaRatio <= 0.1) {
    return 'minor';
  }

  return 'unable_to_determine';
}
