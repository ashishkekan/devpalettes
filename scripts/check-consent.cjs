const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../js/main.js'), 'utf8');
function setup(choice, blocked = false) {
  const appended = [], idle = [];
  let reloads = 0;
  const storage = new Map(choice ? [['devpalettes-cookie-consent-v1', choice]] : []);
  const ctx = {
    console, setTimeout, clearTimeout,
    localStorage: {
      getItem(k) { if (blocked) throw Error('blocked'); return storage.get(k) || null; },
      setItem(k,v) { if (blocked) throw Error('blocked'); storage.set(k,v); }
    },
    location: { hostname: 'devpalettes.com' },
    document: {
      cookie: '', addEventListener() {}, getElementById() { return null; },
      createElement() { return { attrs: {}, setAttribute(k,v) { this.attrs[k]=v; }, remove() { appended.splice(appended.indexOf(this),1); } }; },
      head: { appendChild(s) { appended.push(s); } },
      querySelector(selector) {
        if (selector === 'script[data-adsense-src]') return { getAttribute() { return 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2390881516968474'; } };
        return appended.find(s => Object.keys(s.attrs).some(a => selector.includes('['+a+']'))) || null;
      }
    }
  };
  ctx.window = { requestIdleCallback(fn) { idle.push(fn); }, location: { reload() { reloads++; } } };
  vm.createContext(ctx);
  vm.runInContext(source + '\nglobalThis.api = {CookieConsent, ThirdPartyAnalytics, ThirdPartyAds, ThemeManager};',ctx);
  return { ...ctx.api, appended, idle, window: ctx.window, reloads: () => reloads };
}
for (const choice of [null, 'rejected']) {
  const env = setup(choice);
  env.ThirdPartyAds.load(); env.ThirdPartyAnalytics.load();
  assert.equal(env.appended.length,0); assert.equal(env.idle.length,0);
}
{
  const e = setup('accepted');
  e.CookieConsent.init(); e.idle.shift()();
  assert.equal(e.appended.length,2);
  e.ThirdPartyAds.load(); e.ThirdPartyAnalytics.load();
  assert.equal(e.appended.length,2);
  e.CookieConsent.reject();
  assert.equal(e.CookieConsent.get(),'rejected'); assert.equal(e.reloads(),1);
  assert.equal(e.window['ga-disable-G-F252PEQ1JC'],true);
}
{
  const e = setup('accepted');
  e.ThirdPartyAnalytics.load(); e.CookieConsent.reject(); e.idle.shift()();
  assert.equal(e.appended.length,0); // consent withdrawn before idle callback
  e.CookieConsent.set('accepted'); e.ThirdPartyAnalytics.load(); e.idle.shift()();
  assert.equal(e.appended.length,1);
}
{
  const e = setup(null,true);
  assert.equal(e.ThemeManager.getSaved(),null);
  e.CookieConsent.set('accepted'); e.ThirdPartyAds.load();
  assert.equal(e.appended.length,1); // in-memory choice still works with storage blocked
  e.appended[0].onerror(); e.ThirdPartyAds.load();
  assert.equal(e.appended.length,1); // network failure can be retried
  e.CookieConsent.reject(); assert.equal(e.reloads(),1);
}
console.log('PASS: consent denial, acceptance, one-time loading, withdrawal, idle race, blocked storage and failed-load retry.');
