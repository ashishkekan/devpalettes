// Smoke-test startup in both script-loading orders. A missing initializer used
// to throw before scroll-reveal content was registered with the observer.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../js/enhancements.js'), 'utf8');
for (const readyState of ['loading', 'complete']) {
  for (const reducedMotion of [false, true]) {
    const events = new Map();
    let observed = false;
    let reveal;
    const classes = new Set();
    const article = { classList: { add(value) { classes.add(value); } } };
    const context = {
      window: { matchMedia() { return { matches: reducedMotion }; } },
      document: {
        readyState,
        getElementById() { return null; },
        querySelectorAll(selector) { return selector === '.animate-on-scroll' ? [article] : []; },
        addEventListener(event, callback) { events.set(event, callback); }
      },
      IntersectionObserver: class {
        constructor(callback) { reveal = callback; }
        observe(element) { assert.equal(element, article); observed = true; }
      }
    };
    vm.runInNewContext(source, context);
    if (readyState === 'loading') events.get('DOMContentLoaded')();
    assert.ok(observed, 'Visible article content must be registered after startup');
    reveal([{ isIntersecting: true, target: article }]);
    assert.ok(classes.has('animate-in'), 'Content becomes visible when it enters the viewport');
  }
}
console.log('PASS: visual enhancement startup and content reveal in both loading orders and motion preferences.');
