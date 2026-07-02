# Intelligences Test App — Project Status Report

## Infrastructure

Production: Hostinger VPS, 187.127.40.142, Ubuntu 24.04, Node 20, PM2, Nginx, Certbot SSL. Domain: app.intelligencestest.com

Repo: https://github.com/intelligencestest/intelligencestest-app.git, branch main

Local dev: C:\Users\oubaa\intelligencestest-app (Windows)

Database: Supabase (yqedlmmcxiqwmnnzjmkb.supabase.co)

Email: Resend, API key + RESEND_FROM_EMAIL=noreply@intelligencestest.com set in .env.local on both VPS and local

## Deploy process (this workflow works, follow it exactly)

```powershell
# Local (Windows PowerShell), one line at a time:
cd C:\Users\oubaa\intelligencestest-app
npm run build   # MUST pass clean before proceeding
git add .
git commit -m "..."
git push origin main
```

```bash
# VPS (SSH):
cd /var/www/intelligencestest-app
git pull origin main   # if package-lock.json conflict: git checkout -- package-lock.json, then retry
npm install             # only if package.json changed
npm run build           # MUST pass clean
pm2 delete intelligencestest
pm2 start npm --name intelligencestest -- start   # fresh start required to reload .env.local — plain "pm2 restart" does NOT reload env vars
pm2 status               # confirm "online", uptime counting, ↺ 0
```

## What's working (confirmed live)

- Full Spanish/English i18n across dashboard, signup, settings, assessments library
- Language selection screen before signup; saves to companies.language; auto-applies on login
- Signup → onboarding → project creation → assessment linking (bug fixed, was silently failing before)
- Project detail page (/projects/[id]) as workspace: add/view assessments, candidate list, Edit button, View report link
- Invite flow: Copy Link + Send Email (Resend), consolidated across all invite surfaces (project card, project detail, /candidates page)
- Candidate invites correctly scoped to only their project's assessments (not all 30)
- Email sending confirmed working (was broken most of this session due to .env.local having placeholder REPLACE_WITH_YOUR_RESEND_API_KEY instead of the real key — watch for this again, it silently reverted at least once)
- Spanish invite emails (companies.language driven) confirmed working via real test send
- Dashboard header refresh button
- 15-page candidate PDF report (lib/report-pdf.ts) — template/rule-based, NO AI/LLM calls, built but not yet visually QA'd page-by-page

## KNOWN BROKEN / IN PROGRESS

- Email logo (PNG) still not displaying — Codex added public/intelligencestest-email-logo.png, code deployed, but logo still not rendering in actual received email. Needs investigation: confirm the PNG is actually publicly reachable at https://app.intelligencestest.com/intelligencestest-email-logo.png (paste that URL directly into a browser to check), and confirm the email template references that exact full URL, not a relative path.
- /candidates page invite modal — was rebuilt to match 2-button pattern (Copy Link / Send Email) per later fix, but verify this is still true — this file has been overwritten multiple times this session by different Claude Code passes and has regressed silently before.
- attention-detail.ts Q4 — has broken/duplicate distractor options, flagged early in session, never fixed.
- PDF report never visually QA'd — built, compiles, but no one has actually opened a generated PDF and checked all 15 pages render correctly with real candidate data (especially partial-completion cases, and the Job Fit page which is a deliberate stub).

## NOT STARTED

- Pricing per assessment (flat default rate + per-client override, e.g. Gabriela/CEO Consultoría custom rate) — scoped, not built
- Admin dashboard to view any client's data (read-only, RLS-safe) — scoped, not built
- Bigger dashboard vision from ChatGPT spec (analytics, benchmarks, radar comparisons, AI insights, billing/settings pages) — long-term roadmap, not started
- Job Fit Analysis (report Page 7) — needs a "required competency per role" data model that doesn't exist yet

## Recurring pitfalls to avoid (learned the hard way this session)

- .env.local on both VPS and local must have real Resend keys, not placeholders — check this first if email breaks again
- git pull on VPS fails silently if package-lock.json has local changes — always run git checkout -- package-lock.json before pulling if pull is aborted
- pm2 restart does NOT reload env vars — must pm2 delete + fresh pm2 start after any .env.local change
- Multiple Claude Code/Codex sessions editing the same file (ProjectDetailClient.tsx, CandidatesClient.tsx) can silently overwrite each other's work — always grep/verify a fix is actually present in the final file before considering it done, don't just trust the session summary
- "Done locally" ≠ "deployed" — every fix must go through the full build→push→pull→build→restart cycle before it's real on production
- Test builds locally first (npm run build) before ever pushing — catches TypeScript errors before they cause a live 502
