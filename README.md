# يلا نفكر · Yalla Nfkar

A short, playful AI-powered creative-thinking game. You don't come to "produce
an idea" — you come because you're curious. You play for 2–4 minutes, the
facilitator flips your answer to a new angle, and you leave wanting one more.

> الأولوية: **MAKE ME WANT TO PLAY ONE MORE** — not impress you with features.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

**No API key needed.** The app runs on a built-in `MockAIProvider` that speaks
the facilitator's voice locally. To plug in a live model, copy `.env.example`
to `.env.local`, set `AI_PROVIDER=openai` and `OPENAI_API_KEY=...` — calls run
**server-side only** (via `/api/ai/*`), never in the client.

## The core loop

Curiosity → Challenge → Input → Surprise → Perspective shift → Creative action
→ Reward → Next challenge.

## Architecture

```
app/                 Routes (Landing, Onboarding, Home, Play, Ideas, Profile)
  api/ai/*           Server routes — the only place an AI provider is used
components/          ui · motion · challenge · idea · game · navigation · landing
lib/
  ai/                AIProvider interface, MockAIProvider, OpenAIProvider, schema
  recommendations/   recommendNextChallenge() — adaptive engine
  analytics/         provider-agnostic track()
  progression.ts     discoverable stages (🌱 → 🚀)
data/challenges.ts   hand-crafted challenge library (quality > quantity)
services/store.ts    localStorage persistence (Supabase-swappable)
types/               domain + AI + recommendation contracts
hooks/               useProgress
```

### Key design decisions

- **UI never imports an AI provider.** It calls `/api/ai/*`, so keys stay on
  the server and providers are swappable without touching screens.
- **Structured, validated AI output** (`lib/ai/schema.ts`) — never raw JSON.
- **Graceful fallback**: any live-AI failure falls back to the mock. The
  experience must never break.
- **No "right answer", no scores.** We reward experimentation, perspective
  shifts, and noticing — surfaced only as gentle behavioral notes.
- **Mobile-first (390px)**, responsive to desktop while keeping the app feel.

## Analytics funnel

`session_started → challenge_started → challenge_completed →
second_challenge_started → session_completed → user_returned →
idea_started → idea_completed → idea_developed → experiment_started`

Events are logged to the console and a localStorage ring buffer — swap the sink
in `lib/analytics/index.ts` for PostHog/Amplitude/Supabase later.

## What's intentionally NOT built (yet)

Community, org/B2B dashboards, payments, heavy gamification. The architecture
(`types/`, `services/`) leaves room for them without over-building the MVP.
