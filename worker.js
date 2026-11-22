// Serves a text resume to curl/wget/HTTPie on `/`, markdown to agents (Accept: text/markdown, /index.md, /llms.txt);
// everything else is the static site.
// shortcut: copy is duplicated from index.html (check.mjs asserts it still matches), move to a shared JSON if it drifts often.
const BIO = 'A curious learner driven to understand how systems work down to the lowest level. 18-year-old Information Systems student with eleven certifications including CCNA, CompTIA CySA+, Security+, Network+ and A+, plus four years running a self-hosted Proxmox and pfSense lab.';
const SYSINFO = [
  ['role', 'Information Systems student · HCC'], ['certs', '11 · CCNA, CySA+, Sec+, Net+, A+'],
  ['lab', 'Proxmox + pfSense · 4 yrs'], ['thm', '300+ labs'], ['ncl', 'Fall 2026: 136th of 6,366 overall · 2nd of 72 at HCC'], ['seeking', 'IT support · sysadmin · SecOps'],
];
const CERTS = [
  ['Sep 2026', 'Microsoft Endpoint Administrator (MD-102)'], ['Aug 2026', 'Cisco CCNA'],
  ['Jun 2026', 'AWS Certified Cloud Practitioner (CLF-C02)'], ['Jun 2026', 'CompTIA Network+'],
  ['May 2026', 'CompTIA CySA+'], ['Jan 2026', 'CompTIA A+'], ['Feb 2025', 'Google IT Support'],
  ['Dec 2023', 'CompTIA Security+'], ['Dec 2023', 'Google Data Analytics'],
  ['Aug 2023', 'PCEP – Certified Entry-Level Python Programmer'], ['Jul 2023', 'Google Cybersecurity'],
];
const LAB = [
  'Built and administer a Proxmox virtualization lab running Windows and Debian VMs and containers behind a pfSense firewall.',
  "Built from 0xBEN's Proxmox cybersecurity lab series, where I'm credited for QA testing and feedback.",
];
const DESC = 'Khizar Ahmed: Information Systems student and CCNA, CySA+ and Security+ holder looking for IT support, sysadmin and SecOps roles. Home lab, projects, certs and a hidden CTF.';
// third column is the markdown link target; `/` paths get the request origin prepended
const CONTACTS = [
  ['location', 'Houston, TX'], ['email', 'website@khiz3r.me', 'mailto:website@khiz3r.me'],
  ['linkedin', 'linkedin.com/in/khizar-ahmed9', 'https://linkedin.com/in/khizar-ahmed9'],
  ['github', 'github.com/khizarahmed9', 'https://github.com/khizarahmed9'], ['resume', 'khiz3r.me/resume.pdf', '/resume.pdf'],
];
const FLAG_HINT = '1 flag hidden on this page. good luck.';
const B64 = 'echo ZmxhZ3tjdXJpb3VzX2xlYXJuZXJfMjA3N30= | base64 -d';

const wrap = (s, ind, w = 78) => s.split(' ').reduce((ls, word) => {
  const last = ls[ls.length - 1];
  if (last.length > ind.length && last.length + 1 + word.length > w) ls.push(ind + word);
  else ls[ls.length - 1] = last + (last.length > ind.length ? ' ' : '') + word;
  return ls;
}, [ind]).join('\n');

function render(color) {
  const c = code => s => color ? `\x1b[${code}m${s}\x1b[0m` : s;
  const g = c('1;32'), d = c('2'), h = s => g('## ' + s);
  const kv = rows => rows.map(([k, v]) => '  ' + d(k.padEnd(10)) + v).join('\n');
  return [
    '', g('  KHIZAR AHMED'), d('  $ cat about.txt'), wrap(BIO, '  '), '',
    kv(SYSINFO), '',
    h('Certifications'), CERTS.map(([when, n]) => '  ' + d(when) + '  ' + n).join('\n'), '',
    h('Home Lab'), LAB.map(s => wrap(s, '  ').replace('  ', '- ')).join('\n'), '',
    h('Contact'), kv(CONTACTS), '',
    d('  ' + FLAG_HINT), d('  ' + B64), '',
  ].join('\n');
}

function markdown(origin) {
  const li = rows => rows.map(r => '- ' + r.join(' ')).join('\n');
  return [
    '# Khizar Ahmed', BIO, li(SYSINFO.map(([k, v]) => ['**' + k + ':**', v])),
    '## Certifications', li(CERTS.map(([when, n]) => ['**' + when + '**', n])),
    '## Home Lab', li(LAB.map(s => [s])),
    '## Contact', li(CONTACTS.map(([k, v, href]) => ['**' + k + ':**', href ? `[${v}](${href[0] === '/' ? origin + href : href})` : v])),
    FLAG_HINT, '`' + B64 + '`', '',
  ].join('\n\n');
}

const llms = origin => [
  '# Khizar Ahmed', '> ' + DESC, BIO,
  `## Links\n\n- [Khizar Ahmed · Portfolio](${origin}/index.md)\n- [resume.pdf](${origin}/resume.pdf)`, '',
].join('\n\n');

// q-value of the first listed type the Accept header names explicitly (0 if none)
const q = (accept, ...types) => {
  const parts = accept.toLowerCase().split(',').map(p => p.split(';').map(x => x.trim()));
  for (const t of types) {
    const p = parts.find(([mt]) => mt === t);
    if (p) return Number((p.find(x => x.startsWith('q=')) || 'q=1').slice(2));
  }
  return 0;
};
// markdown only when named explicitly and not ranked below HTML, so browsers (`*/*;q=0.8`) and curl (`*/*`) keep their views
const wantsMarkdown = a => q(a, 'text/markdown') > 0 && q(a, 'text/markdown') >= q(a, 'text/html', 'text/*', '*/*');

const CLI = /^(curl|wget2?|httpie|xh|libfetch)\//i;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const md = { 'content-type': 'text/markdown; charset=utf-8' };
    if (url.pathname === '/index.md') return new Response(markdown(url.origin), { headers: md });
    if (url.pathname === '/llms.txt') return new Response(llms(url.origin), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
    if (url.pathname !== '/') return env.ASSETS.fetch(request);
    // `/` has three bodies depending on Accept and UA, so caches must key on both
    const vary = 'Accept, User-Agent';
    if (wantsMarkdown(request.headers.get('accept') || '')) return new Response(markdown(url.origin), { headers: { ...md, vary } });
    if (!CLI.test(request.headers.get('user-agent') || '')) {
      const r = await env.ASSETS.fetch(request), res = new Response(r.body, r);
      res.headers.append('Vary', vary);
      res.headers.append('Link', '</index.md>; rel="alternate"; type="text/markdown"');
      return res;
    }
    return new Response(render(!url.searchParams.has('plain')), {
      headers: { 'content-type': 'text/plain; charset=utf-8', vary },
    });
  },
};
