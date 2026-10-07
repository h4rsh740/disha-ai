import assert from 'node:assert/strict';
import test from 'node:test';
import { formatChatBlocks, formatInlineText } from '../lib/chat-format.ts';

// node --experimental-strip-types --test scripts/chat-format.test.mjs
test('plain replies preserve paragraphs, line breaks, and Indian-language text', () => {
  assert.deepEqual(formatChatBlocks('Start here.\r\nएक कदम आगे।\r\n\r\nThen visit an ITI.'), [
    { type: 'paragraph', text: 'Start here.\nएक कदम आगे।' },
    { type: 'paragraph', text: 'Then visit an ITI.' },
  ]);
  assert.deepEqual(formatChatBlocks('  \n'), []);
});

test('headings and career guidance lists become readable blocks', () => {
  assert.deepEqual(formatChatBlocks('## Your next steps\n- **Research** courses\n- Visit an ITI\n\n3. Check eligibility\n4. Apply'), [
    { type: 'heading', level: 2, text: 'Your next steps' },
    { type: 'list', ordered: false, start: 1, items: ['**Research** courses', 'Visit an ITI'] },
    { type: 'list', ordered: true, start: 3, items: ['Check eligibility', 'Apply'] },
  ]);
});

test('list continuations and following paragraphs keep their content', () => {
  assert.deepEqual(formatChatBlocks('- Training\n  Takes two years.\nAsk the institute about fees.'), [
    { type: 'list', ordered: false, start: 1, items: ['Training\nTakes two years.'] },
    { type: 'paragraph', text: 'Ask the institute about fees.' },
  ]);
});

test('fenced examples are text, even with Markdown or HTML inside', () => {
  assert.deepEqual(formatChatBlocks('```text\n# Not a heading\n<script>example</script>\n```\nNext step'), [
    { type: 'code', text: '# Not a heading\n<script>example</script>' },
    { type: 'paragraph', text: 'Next step' },
  ]);
  assert.deepEqual(formatChatBlocks('```\nunfinished'), [{ type: 'code', text: 'unfinished' }]);
});

test('inline emphasis and code do not lose surrounding words', () => {
  assert.deepEqual(formatInlineText('Try **training**, *practice*, and `safety`.'), [
    { type: 'text', text: 'Try ' }, { type: 'bold', text: 'training' },
    { type: 'text', text: ', ' }, { type: 'italic', text: 'practice' },
    { type: 'text', text: ', and ' }, { type: 'code', text: 'safety' },
    { type: 'text', text: '.' },
  ]);
});

test('literal or incomplete markers remain visible rather than disappearing', () => {
  for (const text of ['*', '**', '`', '**unfinished', '2 * 3', '```']) {
    assert.deepEqual(formatInlineText(text), [{ type: 'text', text }]);
  }
});

test('HTML and unsafe links remain ordinary text, not executable markup', () => {
  const text = '<img src=x onerror=alert(1)> [click](javascript:alert(1))';
  assert.deepEqual(formatChatBlocks(text), [{ type: 'paragraph', text }]);
  assert.deepEqual(formatInlineText(text), [{ type: 'text', text }]);
});
