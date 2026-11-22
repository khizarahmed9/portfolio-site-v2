// Serves a text resume to curl/wget/HTTPie on `/`; everything else is the static site.
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
const CONTACTS = [
  ['location', 'Houston, TX'], ['email', 'website@khiz3r.me'], ['linkedin', 'linkedin.com/in/khizar-ahmed9'],
  ['github', 'github.com/khizarahmed9'], ['resume', 'khiz3r.me/resume.pdf'],
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

const CLI = /^(curl|wget2?|httpie|xh|libfetch)\//i;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/') return env.ASSETS.fetch(request);
    if (!CLI.test(request.headers.get('user-agent') || '')) {
      // `/` has two bodies depending on UA, so caches must key on it
      const r = await env.ASSETS.fetch(request), res = new Response(r.body, r);
      res.headers.append('Vary', 'User-Agent');
      return res;
    }
    return new Response(render(!url.searchParams.has('plain')), {
      headers: { 'content-type': 'text/plain; charset=utf-8', vary: 'User-Agent' },
    });
  },
};
