# Dhaal — Architecture & Roadmap

## Where this starts from

The validation phase (manual WhatsApp concierge test) confirmed the concept:
people want a forward-anything inbox for suspicious or confusing messages,
answered in a warm Roman Urdu "smart cousin" voice, with these design
principles locked in as non-negotiable:

1. Mandatory evidence citation — never a bare verdict.
2. No fake precision scores — three honest buckets, not a percentage.
3. No automated actions — Dhaal informs, the person acts.
4. Privacy-first monetization — the product's trust depends on this.
5. "Relief, not productivity" positioning — this is not an efficiency tool.

Everything below is built to keep those five true at every phase, not just
in the MVP.

## Phase 1 — Web MVP (this build)

**Submission channel:** paste text or upload a screenshot, directly in a
web app. This is the simplest channel to build and deploy, and it lets you
test the core loop — analysis quality and voice — before taking on any
messaging-platform integration.

```
┌──────────┐      paste/upload       ┌──────────────┐
│  Browser │ ───────────────────────▶│  Next.js app  │
│ (React)  │                         │ /api/analyze  │
└──────────┘◀─────────────────────── └──────┬───────┘
   renders         JSON result              │
   verdict +                                │ text + image
   evidence                                 ▼
                                     ┌───────────────┐
                                     │  Claude API   │
                                     │ (vision+text) │
                                     └───────────────┘
```

**Stack:**
- **Next.js (App Router) + TypeScript** — one project handles both the UI
  and the API route that talks to Claude, so there's nothing extra to
  deploy or host for the MVP.
- **Tailwind CSS** — fast to iterate on, and the custom token set in
  `tailwind.config.ts` keeps the visual identity specific to Dhaal rather
  than a generic component-library look.
- **Anthropic SDK (`@anthropic-ai/sdk`)** — direct API calls from the
  server route; the API key never reaches the browser.

**Why no database yet:** principle #4 (privacy-first) is easiest to keep
true when there's nothing to leak — the MVP never writes what someone
submits to disk anywhere. It's held in memory for the one request and
discarded. That's also just less to build before you know if the core
answer quality lands.

**Why no accounts yet:** nothing in the MVP needs to know who's asking.
Add auth when a real feature needs it (saved history, subscription),
not before.

## Phase 2 — Accounts, history, monetization

Add this once Phase 1 has shown the analysis itself is good enough that
people want to come back.

- **Auth:** something like Clerk or NextAuth — whichever has less setup
  overhead for a solo founder shipping fast matters more here than
  feature depth.
- **Database:** a small Postgres instance (Supabase or Neon both work,
  and both give you a free tier to start on) — but only store history a
  person opts into keeping. The default should still be "we don't keep
  what you send us."
- **Billing:** Stripe subscriptions. This is where principle #4 becomes a
  concrete pricing decision, not just an ethos: e.g., free tier is
  fully ephemeral (today's MVP behavior), paid tier adds optional saved
  history, higher volume, or faster turnaround — never "pay to get real
  evidence citations," since that undermines principle #1.

## Phase 3 — Real forwarding channels

This is what makes the product match its name: an actual forward-anything
inbox, not a paste-it-in tool.

- **Email forwarding** is the easier next step: a dedicated inbound
  address via something like Postmark or SendGrid's inbound parse, which
  hands you the forwarded email as a webhook payload. Much less
  infrastructure than WhatsApp.
- **WhatsApp** matches the original validation test most closely but
  costs the most to stand up:
  - Meta Business verification (can take days to weeks)
  - A persistent backend (not just a Next.js API route — you need a
    server that's always on to receive webhooks and can queue replies,
    since WhatsApp delivery isn't synchronous the way a web request is)
  - Either Twilio's WhatsApp API (faster to start, small per-message
    cost) or Meta's Cloud API directly (no middleman fee, more setup)

Recommendation: don't start Phase 3 until Phase 2's core answer quality
and monetization are validated with the web MVP. Adding a messaging
channel multiplies support surface (delivery failures, rate limits,
template-message approval for WhatsApp) — worth taking on once you know
the product underneath is right.

## Open decisions for you, not yet made in this codebase

- **Model choice:** `lib/anthropic.ts` defaults to `claude-sonnet-5`.
  For a consumer product doing a high volume of relatively short checks,
  it's worth benchmarking a faster/cheaper model (like the Haiku line)
  against Sonnet on your actual evidence-citation quality bar before you
  scale — check https://docs.claude.com for current models and pricing.
- **Rate limiting:** the MVP has none. Before a public launch, add basic
  per-IP rate limiting on `/api/analyze` (even something simple) so the
  API key isn't exposed to abuse.
- **Content limits:** there's currently no cap on pasted text length or
  image size beyond what the browser and API allow. Decide a sensible
  cap once you see real usage.
