# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, weighted equally:

- **Recruiters and hiring managers** screening candidates for IT support, systems administration, and security operations internships or entry-level roles. They skim quickly, usually after seeing the resume or LinkedIn, and need to get the candidate's level in about 30 seconds.
- **Technical interviewers and peers** (security and sysadmin engineers) who look closely at the home lab topology, certifications, projects, and CTF background, and who appreciate the interactive terminal details.

The site has to pass the quick skim and still reward the close read.

## Product Purpose

The personal portfolio and resume site of Khizar Ahmed, a 18-year-old Information Systems student at Houston City College. It exists to get him an internship or entry-level role in IT support, sysadmin, or SecOps.

A visit succeeds when the visitor:
- remembers him, since the terminal and CTF experience is meant to stick;
- follows through to LinkedIn or GitHub;
- opens the resume PDF.

Email (`website@khiz3r.me`) remains the contact channel. It was not named as a primary success signal.

## Positioning

Hands-on depth that is unusual for his age, shown on the page rather than just claimed:
- eleven certifications, including CCNA, CySA+, Security+, Network+, and A+;
- four years running a self-hosted Proxmox + pfSense lab, credited for QA on 0xBEN's lab series;
- national NCL rankings (30th individual, 23rd team);
- 300+ TryHackMe labs;
- team lead on a NASA pre-apprenticeship;
- CTO of the CS Association and an organizer of HackHCC, the college's first hackathon.

The site itself works as a skills demonstration: an interactive lab diagram, a command bar, and a hidden CTF.

## Operating Context

- Visitors usually arrive from the resume, LinkedIn, or a direct share, on phones (~360px) as well as wide desktops.
- Recruiters scan the sections in order. Technical visitors use the command bar (`help`, `grep`, `whoami`, `0–9` jumps) and the hidden CTF.
- Deployed as static assets on Cloudflare (`wrangler.jsonc`, assets directory `.`). Entry point is `index.html` plus `support.js`.

## Capabilities and Constraints

- Single page. The section order in CLAUDE.md is canonical, and the nav, right rail, and number keys all follow it.
- Content rules, contact details, project framing, and home-lab topology are pinned in CLAUDE.md. Use the user's wording verbatim. Confirm with the user before adding lab components or new claims.
- The full motion and interaction inventory listed in CLAUDE.md must be kept.
- Props: `skipBoot`, `scanlines` (default on), `typeSpeed` (0.5–3).
- No phone number anywhere. No resume revision text in the footer.

## Brand Commitments

- Name: Khizar Ahmed. Handle: Khiz3r. Domain: khiz3r.me.
- Voice: first-person and plain ("A curious learner driven to understand how systems work down to the lowest level"). Copy is the user's own and is not to be rewritten.
- Easter eggs are part of the identity: PID / flag number 2077 and `flag{curious_learner_2077}`.

## Evidence on Hand

- Resume: `uploads/Khizar Ahmed Resume 9.22.2026.pdf`.
- Certifications with Credly references, NCL rankings, the TryHackMe count, the HackHCC role, and Compudopt volunteering, all already in the page copy.
- Projects: the NASA moon-base network (the instrument names and lunar temps in its figure are illustrative) and Wayne Finance (`khizarahmed9/hackrice-finance-thingy`, HackRice 2026).
- Not on hand, and never to be fabricated: testimonials, references, employer endorsements, metrics beyond those stated.

## Product Principles

1. **Show, don't claim.** Wherever possible, competence is demonstrated through working interactive pieces (lab diagram, command bar, CTF), not adjectives.
2. **Skim first, depth on demand.** A recruiter gets role, certs, and contact paths immediately. Technical depth sits one interaction away.
3. **Factual and verbatim.** Every claim traces to the resume or the user. Nothing is invented or embellished.
4. **Memorable but never in the way.** Playful details must not block the main paths to LinkedIn, GitHub, and the resume.

## Accessibility & Inclusion

Keep the existing commitments; no formal standard has been adopted:
- respect `prefers-reduced-motion` (skew, tilt, parallax, magnet, and bursts off);
- show the crosshair cursor only on fine pointers;
- the boot sequence and scanlines can be skipped or toggled;
- tap targets are at least 44px on mobile;
- the command input uses 16px text on mobile.
