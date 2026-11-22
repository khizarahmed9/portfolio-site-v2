// Self-check for worker.js: `node check.mjs`
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker from './worker.js';

const env = { ASSETS: { fetch: () => new Response('<html>site</html>', { headers: { 'content-type': 'text/html' } }) } };
const get = (path, ua) => worker.fetch(new Request('http://x' + path, { headers: { 'user-agent': ua } }), env);

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
const br = await get('/', 'Mozilla/5.0 (X11; Linux x86_64) Chrome/130');
assert.match(br.headers.get('vary') || '', /User-Agent/);
assert.equal(await br.text(), '<html>site</html>');
assert.equal(await (await get('/resume.pdf', 'curl/8.5.0')).text(), '<html>site</html>');
console.log('ok');
