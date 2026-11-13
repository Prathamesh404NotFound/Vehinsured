import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeRegistrationNumber,
  formatRegistrationNumber,
  isValidRegistrationNumber,
  isValidDateRange,
  canCustomerEditClaim,
  isAllowedStatusTransition,
  canUserAccessRecord,
} from './validation';

test('normalizeRegistrationNumber strips spaces and punctuation and uppercases', () => {
  assert.equal(normalizeRegistrationNumber('mh-12 ab 4821'), 'MH12AB4821');
});

test('formatRegistrationNumber formats standard Indian plate numbers cleanly', () => {
  assert.equal(formatRegistrationNumber('mh12rt4821'), 'MH 12 RT 4821');
});

test('isValidRegistrationNumber validates length and alphanumeric format', () => {
  assert.equal(isValidRegistrationNumber('MH 12 AB 1234'), true);
  assert.equal(isValidRegistrationNumber('AB12'), false);
});

test('isValidDateRange verifies expiry is on or after start date', () => {
  assert.equal(isValidDateRange('2026-01-01', '2027-01-01'), true);
  assert.equal(isValidDateRange('2026-05-10', '2026-05-01'), false);
});

test('canCustomerEditClaim allows edits only on draft, ready, or clarification states', () => {
  assert.equal(canCustomerEditClaim('draft'), true);
  assert.equal(canCustomerEditClaim('more_info_required'), true);
  assert.equal(canCustomerEditClaim('review_complete'), false);
  assert.equal(canCustomerEditClaim('closed'), false);
});

test('isAllowedStatusTransition enforces customer vs admin role rules', () => {
  assert.equal(isAllowedStatusTransition('draft', 'submitted_for_review', false), true);
  assert.equal(isAllowedStatusTransition('submitted_for_review', 'review_complete', false), false);
  assert.equal(isAllowedStatusTransition('submitted_for_review', 'review_complete', true), true);
});

test('canUserAccessRecord restricts access to owner or admin', () => {
  assert.equal(canUserAccessRecord('user-1', 'user-1', false), true);
  assert.equal(canUserAccessRecord('user-1', 'user-2', false), false);
  assert.equal(canUserAccessRecord('user-1', 'admin-9', true), true);
});
