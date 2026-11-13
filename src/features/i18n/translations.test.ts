import test from 'node:test';
import assert from 'node:assert/strict';
import { translations } from './translations';

test('all English translation keys exist and are non-empty in Hindi and Marathi', () => {
  const enKeys = Object.keys(translations.en);
  assert.ok(enKeys.length >= 60, 'Expected comprehensive translation coverage');

  for (const key of enKeys) {
    const hiVal = (translations.hi as Record<string, string>)[key];
    const mrVal = (translations.mr as Record<string, string>)[key];
    assert.ok(hiVal && hiVal.trim().length > 0, `Missing Hindi translation for key: ${key}`);
    assert.ok(mrVal && mrVal.trim().length > 0, `Missing Marathi translation for key: ${key}`);
  }
});
