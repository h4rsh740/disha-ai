import assert from 'node:assert/strict';
import test from 'node:test';
import { journeyEntryUrl, journeyAuthDestination, JOURNEY_SIGN_IN_URL, JOURNEY_SIGN_UP_URL } from '../lib/journey-auth.ts';

// node --experimental-strip-types --test scripts/journey-auth.test.mjs
// Checks only routing policy, not a real auth session or credentials.
test('signed-out and loading visitors reach sign-in before onboarding', () => {
  assert.equal(journeyEntryUrl(false), JOURNEY_SIGN_IN_URL);
  assert.equal(journeyEntryUrl(undefined), JOURNEY_SIGN_IN_URL);
  const url = new URL(journeyEntryUrl(false), 'https://disha.example');
  assert.equal(url.pathname, '/sign-in');
  assert.equal(url.searchParams.get('redirect_url'), '/onboarding');
});

test('signed-in visitors can continue directly to onboarding', () => {
  assert.equal(journeyEntryUrl(true), '/onboarding');
});

test('both authentication routes retain the same onboarding destination', () => {
  for (const path of [JOURNEY_SIGN_IN_URL, JOURNEY_SIGN_UP_URL]) {
    const url = new URL(path, 'https://disha.example');
    assert.equal(journeyAuthDestination(url.searchParams.get('redirect_url')), '/onboarding');
  }
});

test('unrelated, repeated, and external destinations do not become forced journey redirects', () => {
  for (const value of [undefined, null, '', '/dashboard', '//external.example', 'https://external.example', ['/onboarding', '/dashboard']]) {
    assert.equal(journeyAuthDestination(value), undefined);
  }
});
