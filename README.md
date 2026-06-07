# reachr

A command-line tool that automates cold outreach end to end. You give it one
company domain, and it does the rest on its own:

1. Finds similar companies (lookalike domains)
2. Finds the decision-makers at each company (C-suite / VP, with LinkedIn URLs)
3. Resolves each LinkedIn profile to a verified work email
4. Sends each person a personalized outreach email

One input, four stages, zero manual steps in between. You get a live terminal
view of the whole run, a safety prompt before any email actually goes out, and
a report afterwards showing what worked and what didn't.

```
$ reachr run stripe.com

 reachr  ·  stripe.com
 ──────────────────────────────────────────────

 ◆ Discovering Domains          · 4
 ◆ Discovering Profiles         · 11
 ◆ Enriching Emails             · 9

 → Send outreach emails to 9 profiles?  (Y/n)
```

## Why I swapped a few of the suggested tools

The brief suggested Ocean.io, Eazyreach, and Brevo. I ran into real blockers
with two of them, so I swapped in alternatives that do the same job. Here's
exactly what happened and why, so it's not a mystery during the demo:

**Ocean.io → CompanyEnrich**
I couldn't log into Ocean.io — it kept rejecting my work email even though it
was a real, valid address (company email tied to my domain). I didn't want to
lose time stuck on a login screen, so I found CompanyEnrich
(companyenrich.com), which has a "similar companies" endpoint that does the
same job — seed domain in, lookalike company domains out. Swapping it in was a
one-file change since the pipeline talks to domain discovery through an
interface, not a specific vendor.

**Eazyreach → Prospeo**
I signed up for Eazyreach and filled out the form for the promised credit
top-up, then followed up — but never heard back, so I had no way to actually
use it. Prospeo (which I was already using for finding decision-makers) also
returns a `person_id` for each profile, and has a separate endpoint that
resolves a `person_id` straight to a verified work email. So I just used
Prospeo for both stage 2 (find people) and stage 3 (resolve emails) — same
result, one less account to depend on, and I handled the `person_id → email`
hand-off myself in code.

**Brevo → Resend**
I already had `trymemento.in` set up and verified for sending on Resend, so
rather than verify the same domain again on a second provider, I just used
Resend. Same job — personalized email out, delivered.

**Domain**
I used my own domain, `trymemento.in`, which I already owned — so I skipped
the "buy a domain first" step entirely and went straight to setting up the
company email and the tool accounts.

None of these swaps change what the pipeline does or how it's structured —
they're all just different vendors behind the same four-stage shape. If you'd
rather see it run against the originally suggested tools, the provider for
each stage is a small, isolated class behind a shared interface (see
`src/services/*/providers/`), so wiring in a different vendor is a matter of
writing one new provider class and pointing the factory at it.

## How it's built

Each of the four stages is its own provider behind a small interface
(`DomainDiscoveryProvider`, `LinkedinDiscoveryProvider`, `EmailDiscoveryProvider`,
`EmailSendProvider`). `runWorkflow` wires them together — the output of one
stage becomes the input to the next, with no manual step in between.

```
src/
  pipeline/        task store + run state shared by the workflow and the UI
  services/
    domains/       stage 1 — lookalike domain discovery (CompanyEnrich)
    profiles/      stage 2 — decision-maker discovery (Prospeo)
    emails/        stage 3 — email resolution + stage 4 — sending
                   (Prospeo for resolution, Resend for sending) + templates
    mocks/         mock providers for every stage, used in dev/demo runs
  ui/              the live terminal view (built with Ink)
  commands/        CLI commands (run, report, export, clear-cache, ...)
  utils/           shared helpers — HTTP retry/backoff, caching, run reports
```

A few things worth knowing about how it behaves:

- **Retries with backoff, but only where it makes sense.** Every API call
  goes through a shared `withRetry` wrapper. It only retries on HTTP 429
  (rate limited) with exponential backoff — anything else (bad request, auth
  failure, server error) fails immediately instead of wasting time retrying
  something that was never going to succeed. The terminal UI shows a live
  "retrying in Xs" status when this kicks in.
- **A safety checkpoint before anything sends.** After discovery and email
  resolution finish, the pipeline stops and shows you exactly how many people
  it's about to email, and waits for a yes/no before sending a single message.
- **Caching, so reruns don't redo work.** Results for a domain are cached
  locally, and a rerun within the cache window picks up where the last one
  left off instead of hitting every API again. `reachr clear-cache` resets it.
- **A report after every run.** `reachr report <domain>` shows a per-stage
  breakdown of what succeeded, what was skipped, and what failed — and why —
  so you can see exactly where a run lost contacts without re-running anything.
- **Persona-aware email templates.** The outreach copy isn't one generic
  template — it's picked based on the recipient's job title (C-suite/founder,
  VP Sales, Operations, HR, or a general fallback), and each one reads and
  looks different, written for that audience.
- **Mock mode for every stage, independently.** Each of the four stages can be
  switched between its real provider and a mock one on its own
  (`MOCK_DOMAINS`, `MOCK_PROFILES`, `MOCK_EMAILS`, `MOCK_SEND` in `.env`). I
  added this mainly for my own debugging — if I'm working on stage 3, I don't
  want to re-run stages 1 and 2 against the real APIs every time just to get
  there. I mock the upstream stages, keep the one I'm working on pointed at
  the real provider, and test just that piece in isolation. It saves API
  credits and makes it much faster to find and fix a bug in one stage without
  the noise (and cost) of running the whole pipeline for real every time. It
  also doubles as a way to demo the full flow live without burning quota or
  emailing real strangers.

## Setup

```
npm install
# create a .env file in the project root with your own API keys
# (see "Commands" below for the env vars each provider needs — src/config.ts has the full list)
npm run dev -- run <domain>
```

You'll need accounts and API keys for:
- **CompanyEnrich** (companyenrich.com) — lookalike domain discovery
- **Prospeo** (app.prospeo.io) — decision-maker discovery + email resolution
- **Resend** (resend.com) — sending, with a verified sending domain

All of the above are configured through environment variables — see
`src/config.ts` for the full list and defaults.

## Commands

```
reachr run <domain>                discover, enrich, and (with confirmation) send to a domain
reachr run <domain> --max-domains 8 --max-profiles 5
reachr report <domain>             see what happened on the latest run, stage by stage
reachr export                      export everything you've found so far to CSV
reachr clear-cache [domain]        clear cached results
reachr preview-email <template> <to>   preview an email template locally (via MailDev)
```

Run `reachr --help` for the full list with examples.
