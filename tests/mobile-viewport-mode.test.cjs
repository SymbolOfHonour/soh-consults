const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, imports = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX}}).outputText, {exports, require: name => imports[name] || require(name), ...globals});
  return exports;
}
const identity = load('lib/mobile-viewport.ts');
const android = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36';
const desktop = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36';
test('normal mobile identity opts in, while Desktop site identity opts out on the same touchscreen', () => {
  assert.equal(identity.usesMobileLayout({userAgent: android, userAgentData: {mobile: true}}), true);
  assert.equal(identity.usesMobileLayout({userAgent: desktop, userAgentData: {mobile: false}}), false);
  assert.equal(identity.usesMobileLayout({userAgent: android, userAgentData: {mobile: false}}), false);
});
test('browsers without client hints distinguish mobile Safari and requested desktop identity', () => {
  assert.equal(identity.usesMobileLayout({userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) Mobile/15E148 Safari/604.1'}), true);
  assert.equal(identity.usesMobileLayout({userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Safari/605.1.15'}), false);
  assert.equal(identity.usesMobileLayout({userAgent: android}), true);
  assert.equal(identity.usesMobileLayout({userAgent: desktop}), false);
});
function mount(browser) {
  const values = new Map(), events = new Map(), root = {dataset: {}, style: {setProperty: (k,v) => values.set(k,v), removeProperty: k => values.delete(k)}};
  const viewport = {scale: 390/1120, width: 1120, height: 2200, offsetLeft: 0, offsetTop: 0, addEventListener: (k,v) => events.set(k,v), removeEventListener: k => events.delete(k)};
  let cleanup;
  load('app/components/WideViewportControls.tsx', {'../../lib/mobile-viewport': identity, react: {useEffect: fn => {cleanup = fn();}}}, {window: {visualViewport: viewport, matchMedia: () => ({matches: true})}, navigator: browser, document: {documentElement: root}, requestAnimationFrame: fn => {fn(); return 1;}, cancelAnimationFrame: () => {}}).default();
  return {root, values, events, viewport, cleanup};
}
test('desktop mode never applies mobile CSS compensation or mobile navigation on touch hardware', () => {
  const mounted = mount({userAgent: desktop, userAgentData: {mobile: false}});
  assert.equal(mounted.root.dataset.sohWideTouch, undefined);
  assert.equal(mounted.values.size, 0);
  assert.equal(mounted.events.size, 0);
});
test('mobile mode keeps navigation compensation, updates viewport values, and cleans up', () => {
  const mounted = mount({userAgent: android, userAgentData: {mobile: true}});
  assert.equal(mounted.root.dataset.sohWideTouch, 'true');
  assert.equal(mounted.values.get('--soh-screen-width'), '390px');
  mounted.viewport.scale = 1; mounted.viewport.width = 390;
  mounted.events.get('resize')();
  assert.equal(mounted.values.get('--soh-screen-width'), '390px');
  assert.equal(mounted.values.get('--soh-zoom-inverse'), '1');
  mounted.cleanup();
  assert.equal(mounted.root.dataset.sohWideTouch, undefined);
  assert.equal(mounted.events.size, 0);
  assert.equal(mounted.values.size, 0);
});
