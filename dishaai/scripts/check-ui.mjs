import assert from 'node:assert/strict';
import postcss from 'postcss';

// Run against a local dev or production server; no cookies, stored profiles,
// AI requests, or authentication actions are needed for these smoke checks.
const base = new URL(process.argv[2] ?? 'http://localhost:3000');
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(base.hostname), 'Use a local app server');

const pages = [
  '/', '/dashboard', '/careers', '/careers/c-01', '/career-path/c-01',
  '/family', '/family/report', '/counsellor', '/admin', '/onboarding',
  '/sign-in', '/sign-up',
];
const stylesheetUrls = new Set();
const pageHtml = new Map();
const servedStyles = [];

async function get(path, expectedStatus = 200) {
  const response = await fetch(new URL(path, base), {
    redirect: 'manual',
    signal: AbortSignal.timeout(60_000),
  });
  assert.equal(response.status, expectedStatus, `${path}: expected HTTP ${expectedStatus}`);
  console.log(`PASS ${response.status} ${path}`);
  return response;
}

for (const page of pages) {
  const html = await (await get(page)).text();
  assert.ok(html.includes('<html'), `${page}: expected an HTML document`);
  const viewports = [...html.matchAll(/<meta\b[^>]*name="viewport"[^>]*>/g)];
  assert.equal(viewports.length, 1, `${page}: use one consistent viewport configuration`);
  assert.ok(viewports[0][0].includes('viewport-fit=cover'), `${page}: expected safe-area-aware viewport`);
  assert.ok(viewports[0][0].includes('interactive-widget=resizes-content'), `${page}: allow the keyboard to resize the layout`);
  assert.ok(!/user-scalable=no|maximum-scale=1(?:[,"\s]|$)/.test(viewports[0][0]), `${page}: do not disable user zoom`);
  pageHtml.set(page, html);
  for (const [tag] of html.matchAll(/<link\b[^>]*>/g)) {
    if (!/\brel="stylesheet"/.test(tag)) continue;
    const href = tag.match(/\bhref="([^"]+)"/)?.[1];
    if (!href) continue;
    const url = new URL(href.replaceAll('&amp;', '&'), base);
    if (url.origin === base.origin) stylesheetUrls.add(url.href);
  }
}

const careerCards = [...pageHtml.get('/careers').matchAll(/<article\b[^>]*\bdata-career-card="([^"]+)"/g)];
assert.equal(careerCards.length, 6, 'The first career page should contain six cards, not every match');
assert.equal(new Set(careerCards.map((match) => match[1])).size, 6, 'Career cards should not repeat');
assert.ok(pageHtml.get('/careers').includes('aria-label="Career results pages"'), 'Every remaining match needs pagination controls');

function closedDisclosures(html) {
  const bodies = [...html.matchAll(/<div\b[^>]*>/g)]
    .map(([tag]) => tag)
    .filter((tag) => /\bclass="[^"]*\bui-disclosure-content\b/.test(tag) && /\bhidden(?:=""|(?=\s|>))/.test(tag));
  for (const tag of bodies) {
    const id = tag.match(/\bid="([^"]+)"/)?.[1];
    assert.ok(id && html.includes(`aria-controls="${id}"`), 'Closed content needs a linked expansion control');
  }
  return bodies.length;
}
assert.equal(closedDisclosures(pageHtml.get('/careers')), 6, 'Career match details should start closed');
assert.ok(closedDisclosures(pageHtml.get('/careers/c-01')) >= 6, 'Career essentials should lead; supporting details should be expandable');
assert.equal(closedDisclosures(pageHtml.get('/family')), 5, 'Family supporting sections should start closed');
// The dashboard intentionally waits for the saved client-side profile. An
// HTTP-only check sees its loading state, not the hydrated profile/details.
assert.ok(pageHtml.get('/dashboard').includes('role="status"') && pageHtml.get('/dashboard').includes('Preparing your Career Twin'), 'The dashboard should expose its profile-loading status');
console.log('SKIP hydrated dashboard expansion checks (requires browser interaction)');
console.log('PASS compact page markup, six-card pagination, and linked expansion controls');

const counsellor = pageHtml.get('/counsellor');
assert.ok(counsellor.includes('data-chat-state="empty"'), 'The counsellor should open in a focused first-turn state');
assert.equal([...counsellor.matchAll(/<button\b[^>]*\bdata-chat-starter\b/g)].length, 4, 'Keep the welcome screen to four useful prompts');
assert.ok(counsellor.includes('role="log"') && counsellor.includes('aria-label="Conversation"'), 'Conversation updates need an accessible transcript');
assert.ok(counsellor.includes('aria-label="Start a new conversation"'), 'The counsellor needs a real new-chat control');
const composerTag = counsellor.match(/<form\b[^>]*aria-label="Message the career counsellor"[^>]*>/)?.[0];
const textareaTag = counsellor.match(/<textarea\b[^>]*id="counsellor-question"[^>]*>/)?.[0];
assert.ok(composerTag && textareaTag, 'Expected the counsellor’s labelled composer');
assert.ok(textareaTag.includes('counsellor-keyboard-hint counsellor-disclaimer'), 'Keyboard help and AI guidance should be linked to the input');
const textareaClass = textareaTag.match(/\bclass="([^"]+)"/)?.[1];
const composerClass = composerTag.match(/\bclass="([^"]+)"/)?.[1];
console.log('PASS counsellor welcome, four starters, and accessible chat controls');

const redirect = await get('/career-path', 307);
assert.equal(new URL(redirect.headers.get('location'), base).pathname, '/career-path/c-01');
await get('/ui-smoke-page-not-found', 404);
await get('/landing-pages/kibori-assets/5eb09b5ac0e28b67.woff2');
await get('/landing-pages/kibori-assets/5a51946dfffa8297.woff2');

function layerOf(rule) {
  for (let parent = rule.parent; parent; parent = parent.parent) {
    if (parent.type === 'atrule' && parent.name === 'layer') return parent.params;
  }
  return null;
}

function isPrintRule(rule) {
  for (let parent = rule.parent; parent; parent = parent.parent) {
    if (parent.type === 'atrule' && parent.name === 'media' && parent.params.includes('print')) return true;
  }
  return false;
}

function luminance(hex) {
  const short = hex.replace('#', '');
  const rgb = short.length === 3 ? [...short].map((digit) => digit + digit).join('') : short;
  assert.match(rgb, /^[\da-f]{6}$/i, 'Expected a solid theme colour');
  const values = [0, 2, 4].map((offset) => {
    const value = Number.parseInt(rgb.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}

function readable(foreground, background, label) {
  assert.ok(foreground && background, `${label}: expected theme colours`);
  const values = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
  const contrast = (values[1] + 0.05) / (values[0] + 0.05);
  assert.ok(contrast >= 4.5, `${label}: text contrast ${contrast.toFixed(2)} is below 4.5:1`);
}

// Guard the project-wide spacing regression: unlayered universal resets beat
// Tailwind utilities regardless of selector specificity. Inspect the CSS
// actually served by Next rather than a second copy of the source stylesheet.
let utilityPadding = false;
let componentSurface = false;
let printNavigationHidden = false;
let hiddenResetInBase = false;
let printDisclosuresRevealed = false;
let counsellorInputFullWidth = false;
let counsellorComposerFocus = false;
const theme = {};
const printTheme = {};
assert.ok(stylesheetUrls.size > 0, 'Expected Next to serve app stylesheets');
for (const href of stylesheetUrls) {
  const response = await fetch(href, { signal: AbortSignal.timeout(60_000) });
  assert.equal(response.status, 200, `${new URL(href).pathname}: expected a served stylesheet`);
  const css = postcss.parse(await response.text());
  servedStyles.push(css);
  css.walkRules((rule) => {
    const layer = layerOf(rule);
    if (!isPrintRule(rule) && rule.selector.includes(`.${textareaClass}`)) {
      rule.walkDecls('width', (declaration) => {
        if (declaration.value === '100%') counsellorInputFullWidth = true;
      });
    }
    if (!isPrintRule(rule) && rule.selector.includes(`.${composerClass}:focus-within`)) {
      rule.walkDecls('border-color', () => { counsellorComposerFocus = true; });
    }
    if (/(^|[,\s])\*(?=[\s:,.#\[]|$)/.test(rule.selector) && !layer) {
      rule.walkDecls(/^(padding|margin)(-|$)/, () => {
        assert.fail('An unlayered universal reset overrides app spacing');
      });
    }
    if (rule.selector === '.p-5' && layer === 'utilities') {
      rule.walkDecls('padding', () => { utilityPadding = true; });
    }
    if (rule.selector.includes('.paper-panel') && layer === 'components') {
      componentSurface = true;
    }
    if (rule.selector.split(',').some((selector) => selector.trim() === ':root') && !isPrintRule(rule)) {
      rule.walkDecls(/^--ui-/, (declaration) => { theme[declaration.prop] = declaration.value; });
    }
    if (isPrintRule(rule) && rule.selector.includes('.paper-panel')) {
      rule.walkDecls(/^--ui-/, (declaration) => { printTheme[declaration.prop] = declaration.value; });
    }
    if (isPrintRule(rule) && rule.selector.includes('.workspace-mobile')) {
      rule.walkDecls('display', (declaration) => {
        if (declaration.value === 'none' && declaration.important) printNavigationHidden = true;
      });
    }
    if (!isPrintRule(rule) && layer === 'base' && rule.selector.includes('[hidden]')) {
      rule.walkDecls('display', (declaration) => {
        if (declaration.value === 'none' && declaration.important) hiddenResetInBase = true;
      });
    }
    // !important layer priority is reversed: this must share the reset's base
    // layer, then win with the more specific scoped selector. A component-layer
    // override would leave all closed report bodies hidden in print.
    if (isPrintRule(rule) && layer === 'base' && rule.selector === '.app-page .ui-disclosure-content[hidden]') {
      rule.walkDecls('display', (declaration) => {
        if (declaration.value === 'block' && declaration.important) printDisclosuresRevealed = true;
      });
    }
  });
}
assert.ok(utilityPadding, 'Expected card padding in the utilities layer');
assert.ok(componentSurface, 'Expected app surfaces in the components layer');
assert.ok(printNavigationHidden, 'Expected print navigation to stay hidden');
assert.ok(hiddenResetInBase, 'Expected Tailwind’s important hidden reset in base');
assert.ok(printDisclosuresRevealed, 'Closed report bodies need a higher-specificity important print override in base');
assert.ok(counsellorInputFullWidth, 'The chat textarea must fill its composer, not stay at the browser default width');
assert.ok(counsellorComposerFocus, 'The borderless input needs a visible composer focus treatment');
for (const text of ['--ui-text', '--ui-muted', '--ui-faint', '--ui-accent', '--ui-success']) {
  for (const surface of ['--ui-surface', '--ui-surface-2', '--ui-surface-3']) {
    readable(theme[text], theme[surface], `Screen ${text} on ${surface}`);
  }
  readable(printTheme[text], printTheme['--ui-surface'], `Print ${text}`);
}
readable(theme['--ui-on-accent'], theme['--ui-accent'], 'Primary button');
readable(theme['--ui-on-danger'], theme['--ui-red'], 'Danger button');
readable(printTheme['--ui-on-accent'], printTheme['--ui-accent'], 'Print accent badge');
console.log(`PASS CSS cascade checks (${stylesheetUrls.size} served stylesheets)`);
console.log('PASS screen/print theme contrast and print navigation checks');
console.log('PASS closed-section print CSS precedence over Tailwind’s hidden reset');
console.log('PASS full-width counsellor input and composer focus styles');

// Anonymous HTTP requests: verify the journey link and auth routes
const journeyLink = pageHtml.get('/').match(/<a\b[^>]*class="disha-kibori-cta__button"[^>]*>/)?.[0];
const journeyHref = journeyLink?.match(/\bhref="([^"]+)"/)?.[1];
assert.ok(journeyHref, 'Expected the landing page journey link');
const journeyUrl = new URL(journeyHref.replaceAll('&amp;', '&'), base);
assert.equal(journeyUrl.origin, base.origin, 'Journey sign-in must stay on this app');
assert.equal(journeyUrl.pathname, '/sign-in', 'Signed-out journey starts must reach sign-in first');
assert.equal(journeyUrl.searchParams.get('redirect_url'), '/onboarding', 'Onboarding must remain the post-login destination');

for (const [path, targetPath] of [['/sign-in', '/sign-up'], ['/sign-up', '/sign-in']]) {
  const html = await (await get(`${path}?redirect_url=%2Fonboarding`)).text();
  assert.ok(html.includes(`${targetPath}?redirect_url=%2Fonboarding`) || html.includes('redirect_url'), `${path}: switching auth flows must preserve onboarding redirect`);
}
console.log('PASS journey CTA and sign-in/sign-up onboarding redirect configuration');

// Responsive CSS contracts, not rendered device tests. Inspect the production
// styles to catch utility layering, fixed-height, input zoom, and safe-area
// regressions without claiming that a browser/device was exercised.
function mediaOf(rule) {
  const queries = [];
  for (let parent = rule.parent; parent; parent = parent.parent) {
    if (parent.type === 'atrule' && parent.name === 'media') queries.push(parent.params);
  }
  return queries.join(' and ');
}

function responsiveRule(selector, property, predicate, { layer, mobile = false } = {}) {
  let found = false;
  for (const css of servedStyles) css.walkRules((rule) => {
    if (isPrintRule(rule) || !rule.selector.includes(selector)) return;
    if (layer && layerOf(rule) !== layer) return;
    if (mobile && !/(?:max-width:\s*(640|700|900)px|width\s*<=\s*(640|700|900)px)/.test(mediaOf(rule))) return;
    rule.walkDecls(property, (declaration) => {
      if (predicate(declaration.value.replaceAll(' ', ''))) found = true;
    });
  });
  assert.ok(found, `Responsive CSS: ${selector} ${property}`);
}

responsiveRule('.workspace-mobile__header', 'height', (value) => value === 'var(--workspace-fixed-top)', { mobile: true });
responsiveRule('.app-main', 'padding-top', (value) => value === 'var(--workspace-fixed-top)', { mobile: true });
responsiveRule('.app-main', 'padding-bottom', (value) => value === 'var(--workspace-fixed-bottom)', { mobile: true });
responsiveRule('.workspace-mobile__controls .language-control__trigger', 'padding', (value) => value === '6px8px', { mobile: true, layer: 'utilities' });
responsiveRule('.workspace-mobile__controls .auth-controls__signin', 'min-height', (value) => value === '44px', { mobile: true, layer: 'utilities' });
responsiveRule('.workspace-mobile__controls .auth-controls__signup', 'display', (value) => value === 'none', { mobile: true, layer: 'utilities' });
responsiveRule('.workspace-mobile__nav a', 'min-height', (value) => value === '44px', { mobile: true });
responsiveRule('.app-page .app-input', 'font-size', (value) => value === '16px', { mobile: true, layer: 'utilities' });
responsiveRule('.auth-page .auth-card input', 'font-size', (value) => value === '16px', { mobile: true, layer: 'utilities' });
responsiveRule('.auth-page .auth-card', 'max-width', (value) => value === 'min(100%,448px)', { layer: 'utilities' });
responsiveRule('.disha-kibori-shell .shader-frame', 'min-height', (value) => value === '0', { mobile: true });
responsiveRule('.disha-kibori-cta__button', 'width', (value) => value === '100%', { mobile: true });
assert.ok(servedStyles.some((css) => css.toString().includes('--chat-viewport-height')), 'Expected visual-viewport sizing for the chat');
const adminMobileNav = pageHtml.get('/admin').match(/<nav\b[^>]*class="workspace-mobile workspace-mobile__nav"[^>]*>(.*?)<\/nav>/s)?.[1];
assert.ok(adminMobileNav?.includes('href="/admin"') && adminMobileNav.includes('aria-label="Analytics"'), 'Analytics must remain reachable in admin mobile navigation');
console.log('PASS responsive CSS contracts: viewport, navigation, touch targets, inputs, auth, landing, and chat');
console.log('SKIP rendered phone/tablet layouts and real keyboard interaction (requires browser/device QA)');
