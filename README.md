# Rough Draft (app prototype)

A self-guided mental health companion for 18–25s: check in, write it down, talk it out with Remi (an AI), and reach real people fast. Built on the [Rough Draft design system](../rough-draft-ds), which must sit next to this folder (`~/rough-draft-ds`).

```bash
npm install
npm run dev          # http://localhost:5250
```

## Turning on live Remi

Without credentials, Remi runs in a clearly labelled **demo mode** (scripted replies). To use the real model:

```bash
cp .env.example .env.local   # then add ANTHROPIC_API_KEY=...
npm run dev
```

The key is read by the Vite server only (`server/remi.ts`) and never sent to the browser. Static hosting (e.g. GitHub Pages) has no server, so it always runs in demo mode.

## Map

| | |
|---|---|
| `src/screens/` | Onboarding, Today, CheckIn, Drafts, Talk (Remi), Help (+ safety plan, my people), You |
| `src/ai/safety.ts` | Deterministic risk screen (client + server) |
| `src/ai/remi.ts` | Streaming client + demo fallback |
| `server/` | Claude proxy and Remi's system prompt |
| `src/state/` | Local store (localStorage), helplines, hash router |
| `DESIGN.md` | UX decision records, risks, research questions |

⚑ Prototype only. See DESIGN.md → "Risks and things that must happen before real users" before putting this in front of anyone in distress.
