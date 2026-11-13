import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRepairEstimate, DEFAULT_COST_REFERENCES } from './calculator';
import { DamagedRegion } from '../../types';

test('calculateRepairEstimate returns zero total for empty regions', () => {
  const result = calculateRepairEstimate([], 'hatchback', DEFAULT_COST_REFERENCES);
  assert.equal(result.totalMin, 0);
  assert.equal(result.totalMax, 0);
  assert.equal(result.components.length, 0);
});

test('calculateRepairEstimate calculates hatchback bumper repair correctly', () => {
  const regions: DamagedRegion[] = [
    {
      id: 'd1',
      partName: 'Front Bumper',
      damageType: 'scratch',
      severity: 'minor'
    }
  ];

  const result = calculateRepairEstimate(regions, 'hatchback', DEFAULT_COST_REFERENCES);
  assert.equal(result.components.length, 1);
  assert.equal(result.components[0].suggestedOperation, 'repair');
  assert.ok(result.totalMin > 0);
  assert.ok(result.totalMax >= result.totalMin);
});

test('calculateRepairEstimate applies luxury vehicle category multiplier', () => {
  const regions: DamagedRegion[] = [
    {
      id: 'd1',
      partName: 'Front Bumper',
      damageType: 'broken',
      severity: 'severe'
    }
  ];

  const hatchbackResult = calculateRepairEstimate(regions, 'hatchback', DEFAULT_COST_REFERENCES);
  const luxuryResult = calculateRepairEstimate(regions, 'luxury', DEFAULT_COST_REFERENCES);

  assert.ok(luxuryResult.totalMin > hatchbackResult.totalMin);
  assert.ok(luxuryResult.totalMax > hatchbackResult.totalMax);
});
