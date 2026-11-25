// Self-check for worker.js: `node check.mjs`
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker from './worker.js';

const env = { ASSETS: { fetch: () => new Response('<html>site</html>', { headers: { 'content-type': 'text/html' } }) } };
const get = (path, ua, accept = '*/*') => worker.fetch(new Request('http://x' + path, { headers: { 'user-agent': ua, accept } }), env);
const CHROME_UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const CHROME_ACCEPT = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7';

for (const ua of ['curl/8.5.0', 'Wget/1.21.4', 'HTTPie/3.2.2']) {
  const r = await get('/', ua);
  assert.equal(r.headers.get('content-type'), 'text/plain; charset=utf-8', ua);
  assert.match(await r.text(), /\x1b\[/, ua);
}
const plain = await (await get('/?plain', 'curl/8.5.0')).text();
assert(!plain.includes('\x1b') && plain.includes('KHIZAR AHMED'));
assert(plain.split('\n').every(l => l.length <= 80), 'line over 80 cols');
// every fragment of the text view must appear verbatim in index.html (wrapping only splits on spaces)
const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
for (const line of plain.split('\n')) for (const s of line.trim().replace(/^(- |## |\$ )/, '').split(/ {2,}/))
  assert(html.includes(s) || s === 'khiz3r.me/resume.pdf', 'not verbatim in index.html: ' + s);
const br = await get('/', CHROME_UA, CHROME_ACCEPT);
assert.equal(br.headers.get('vary'), 'Accept, User-Agent');
assert.equal(br.headers.get('link'), '</index.md>; rel="alternate"; type="text/markdown"');
assert.equal(await br.text(), '<html>site</html>');

// markdown negotiation: explicit text/markdown not ranked below html wins, any UA
const isMd = r => r.headers.get('content-type') === 'text/markdown; charset=utf-8';
for (const [ua, accept, want] of [
  ['curl/8.5.0', 'text/markdown', true], [CHROME_UA, 'text/markdown', true],
  ['agent/1', 'text/markdown, text/html;q=0.9', true], ['agent/1', 'text/html;q=0.5, text/markdown', true],
  ['agent/1', 'text/markdown;q=0.5, text/html', false], ['agent/1', 'text/markdown;q=0.5, */*', false],
  ['agent/1', 'text/markdown;q=0', false], [CHROME_UA, CHROME_ACCEPT, false], ['curl/8.5.0', '*/*', false],
]) assert.equal(isMd(await get('/', ua, accept)), want, ua + ' ' + accept);
assert.equal((await get('/', 'curl/8.5.0', 'text/markdown')).headers.get('vary'), 'Accept, User-Agent');
const md = await (await get('/index.md', CHROME_UA, CHROME_ACCEPT)).text();
assert(md.startsWith('# Khizar Ahmed\n') && md.includes('[website@khiz3r.me](mailto:website@khiz3r.me)'));
assert(md.includes('[khiz3r.me/resume.pdf](http://x/resume.pdf)'));
const llms = await get('/llms.txt', 'agent/1');
assert.equal(llms.headers.get('content-type'), 'text/plain; charset=utf-8');
const llmsTxt = await llms.text();
assert(llmsTxt.includes('(http://x/index.md)') && llmsTxt.includes('(http://x/resume.pdf)'));
// markdown and llms.txt copy must be verbatim too: strip markdown syntax, link targets and structural headings
for (const line of (md + llmsTxt).split('\n')) {
  const s = line.replace(/\]\([^)]*\)/g, '').replace(/^(#+ |> |- )/, '').replace(/[*`[]/g, '').replace(/^[a-z]+: /, '').trim();
  if (!s || s === 'Links') continue;
  const parts = /^[A-Z][a-z]{2} \d{4} /.test(s) ? [s.slice(0, 8), s.slice(9)] : [s];
  for (const p of parts) assert(html.includes(p) || p === 'khiz3r.me/resume.pdf', 'not verbatim in index.html: ' + p);
}
assert.equal(await (await get('/resume.pdf', 'curl/8.5.0')).text(), '<html>site</html>');
console.log('ok');
