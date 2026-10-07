import assert from 'node:assert/strict';
import test from 'node:test';
import { chatViewport } from '../lib/chat-viewport.ts';

const screen = { layoutHeight: 800, visualHeight: 800, referenceHeight: 800, scale: 1, touch: true, focused: true };

test('an iOS-style visual-only keyboard reduces the chat frame', () => {
  assert.deepEqual(chatViewport({ ...screen, visualHeight: 360 }), { height: 360, keyboardOpen: true });
});

test('a keyboard that resizes both viewports is detected from the closed height', () => {
  assert.deepEqual(chatViewport({ ...screen, layoutHeight: 360, visualHeight: 360 }), { height: 360, keyboardOpen: true });
});

test('closing or blurring the composer restores normal navigation', () => {
  assert.deepEqual(chatViewport(screen), { height: 800, keyboardOpen: false });
  assert.equal(chatViewport({ ...screen, visualHeight: 360, focused: false }).keyboardOpen, false);
});

test('pinch zoom is not treated as a keyboard and does not resize the document', () => {
  assert.deepEqual(chatViewport({ ...screen, visualHeight: 360, scale: 2 }), { height: 800, keyboardOpen: false });
});

test('desktop resizing and small address-bar changes keep navigation available', () => {
  assert.equal(chatViewport({ ...screen, visualHeight: 360, touch: false }).keyboardOpen, false);
  assert.deepEqual(chatViewport({ ...screen, visualHeight: 760 }), { height: 760, keyboardOpen: false });
});

test('invalid or transient measurements cannot collapse the chat frame', () => {
  assert.deepEqual(chatViewport({ ...screen, visualHeight: 0 }), { height: 800, keyboardOpen: false });
  assert.deepEqual(chatViewport({ ...screen, visualHeight: NaN }), { height: 800, keyboardOpen: false });
  assert.deepEqual(chatViewport({ ...screen, layoutHeight: 0 }), { height: null, keyboardOpen: false });
});
