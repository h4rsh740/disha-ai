import assert from 'node:assert/strict';
import test from 'node:test';
import { CAREERS_PER_PAGE, paginateCareers } from '../lib/pagination.ts';

// Node 22: node --experimental-strip-types --test scripts/pagination.test.mjs
// Synthetic career IDs only; no stored profiles or AI services are accessed.
const matches = Object.freeze(Array.from({ length: 17 }, (_, index) => ({ id: `career-${index + 1}` })));

test('pages keep every career reachable in its original order', () => {
  const first = paginateCareers(matches, 1);
  assert.equal(first.visible.length, CAREERS_PER_PAGE);
  assert.equal(first.pageCount, 3);
  const all = Array.from({ length: first.pageCount }, (_, index) => paginateCareers(matches, index + 1).visible).flat();
  assert.deepEqual(all, matches);
  assert.equal(new Set(all.map((match) => match.id)).size, matches.length);
  assert.strictEqual(all[0], matches[0]);
});

test('last page contains the remainder without repeating earlier careers', () => {
  const last = paginateCareers(matches, 3);
  assert.equal(last.currentPage, 3);
  assert.equal(last.start, 12);
  assert.deepEqual(last.visible, matches.slice(12));
});

test('empty and exact-size result sets retain a valid page', () => {
  assert.deepEqual(paginateCareers([], 8), { pageCount: 1, currentPage: 1, start: 0, visible: [] });
  const single = paginateCareers(matches.slice(0, CAREERS_PER_PAGE), 2);
  assert.equal(single.pageCount, 1);
  assert.equal(single.currentPage, 1);
  assert.equal(single.visible.length, CAREERS_PER_PAGE);
});

test('a narrower filter cannot leave the user on an empty stale page', () => {
  const narrowed = matches.slice(0, 2);
  const page = paginateCareers(narrowed, 3);
  assert.equal(page.currentPage, 1);
  assert.deepEqual(page.visible, narrowed);
});

test('invalid page indices are bounded without losing results', () => {
  for (const requested of [0, -1, NaN, Infinity, -Infinity]) {
    assert.equal(paginateCareers(matches, requested).currentPage, 1);
  }
  assert.equal(paginateCareers(matches, 100).currentPage, 3);
  assert.equal(paginateCareers(matches, 2.5).currentPage, 2);
});
