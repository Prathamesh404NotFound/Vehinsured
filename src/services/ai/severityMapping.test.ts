import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyDamageSeverity } from './severityMapping';

test('classifyDamageSeverity returns unable_to_determine for low confidence', () => {
  const result = classifyDamageSeverity({ confidence: 0.15, damageType: 'dent' });
  assert.equal(result, 'unable_to_determine');
});

test('classifyDamageSeverity classifies broken parts as severe', () => {
  const result = classifyDamageSeverity({ confidence: 0.85, damageType: 'broken' });
  assert.equal(result, 'severe');
});

test('classifyDamageSeverity classifies scratches with small area as minor', () => {
  const result = classifyDamageSeverity({ confidence: 0.9, damageType: 'scratch', areaRatio: 0.02 });
  assert.equal(result, 'minor');
});

test('classifyDamageSeverity classifies dents with medium area as moderate', () => {
  const result = classifyDamageSeverity({ confidence: 0.8, damageType: 'dent', areaRatio: 0.12 });
  assert.equal(result, 'moderate');
});
