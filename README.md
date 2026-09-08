# Dhaal — MVP

A forward-anything inbox: paste a suspicious message or upload a screenshot,
get back a straight answer with the specific evidence behind it — no scary
percentages, no auto-blocking, in a warm Roman Urdu "smart cousin" voice.

This is Phase 1 of the product (see `ARCHITECTURE.md` for the full roadmap):
a stateless web app. Nothing submitted is stored anywhere.

## Setup

You'll need Node.js 18.17 or later.

```bash
npm install
cp .env.example .env.local
```

Open `.env.local` and add your Anthropic API key (get one at
https://console.anthropic.com/settings/keys):

```
ANTHROPIC_API_KEY=sk-ant-...
```

Then run it locally:

```bash
npm run dev
```

Visit http://localhost:3000.

## How it works

1. `components/SubmissionForm.tsx` collects pasted text and/or an uploaded
   screenshot, and turns the image into base64 in the browser.
2. `app/api/analyze/route.ts` receives that submission and calls
   `lib/anthropic.ts`.
3. `lib/prompts.ts` holds the system prompt that encodes Dhaal's rules:
   mandatory evidence citation, no fake confidence scores, no automated
   actions, honest uncertainty.
4. `lib/anthropic.ts` calls the Claude API (vision + text in one call when
   there's an image) and validates the JSON that comes back before it's
   trusted — malformed output becomes a clear error, never a silent guess.
5. `components/AnalysisResult.tsx` renders the verdict, the cited evidence,
   and one concrete next step.

## Deploying

The simplest path is Vercel, since this is an unmodified Next.js app:

1. Push this to a GitHub repo.
2. Import it at https://vercel.com/new.
3. Add `ANTHROPIC_API_KEY` as an environment variable in the Vercel project
   settings.
4. Deploy.

Any host that runs Next.js (Railway, Render, your own Node server) works
too — the only required environment variable is `ANTHROPIC_API_KEY`.

## What's deliberately NOT here yet

- No accounts, no login, no database — see `ARCHITECTURE.md` Phase 2 for
  when and why to add these (short answer: once someone wants to save a
  history of checks, that's also when subscription billing makes sense).
- No WhatsApp or email forwarding — see `ARCHITECTURE.md` Phase 3. Both
  need a persistent backend and, for WhatsApp, Meta Business verification,
  so they're deliberately out of the MVP.
