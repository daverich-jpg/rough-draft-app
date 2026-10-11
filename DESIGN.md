# Rough Draft: UX decisions

A self-guided mental health companion for **18–25s**, built on the [Rough Draft design system](../rough-draft-ds). Core job: **everyday self-care (check in, journal, coping tools, an AI to think out loud with) plus a low-effort path to real humans when it's more than everyday.**

Every decision below was run through the high-yield UX framework. Evidence is labelled **Known** (research, standards, established principles), **Likely** (reasoned hypothesis) or **Unknown** (needs research). Nothing here is a user-research finding. No research has been done yet.

---

## Product frame

| | |
|---|---|
| **User goal** | "Help me get through today a bit better, and help me get real help if I need it, without making me feel like a patient." |
| **Product goal** | Regular, low-pressure use that builds self-awareness, and reliable hand-off to human support when risk appears. |
| **Not the goal** | Engagement for its own sake. No streaks, no scores, no time-in-app targets. |
| **Decision hierarchy** | Safety → task completion → comprehension → control → efficiency → conventions → accessibility → hierarchy → aesthetics. Safety wins every tie. |

## Information architecture

`today · drafts · [check in] · remi · help`, plus **you** (settings) behind the avatar.

- **Check in is the centre action:** the most frequent, shortest task.
- **Help is a top-level tab, never a menu item.** Known: findability of crisis resources is a core criterion in mental-health app evaluation frameworks (e.g. the APA app evaluation model). Likely: people in distress won't hunt through menus.
- **Remi is a tab, not the home screen.** The AI is one tool among several, not the product's centre of gravity (see D-M1).
- **No community feed in v1.** Peer support needs moderation, reporting and safeguarding operations this prototype can't promise. The design system's zine components are ready for later.

---

## Remi (the AI companion)

### D-M1 · The AI is opt-in to *use*, not the default surface
- **Decision:** Home leads with check-in and human-written tools. Remi is one card and one tab.
- **Principles:** user control, trust, cognitive load.
- **Known:** Over-reliance on conversational AI for emotional support is a recognised risk area; general-purpose chatbots are not validated mental-health interventions.
- **Likely:** Many users will open the app *for* Remi. Keeping it one tap away serves them without making the AI the only path.
- **Trade-off:** less "wow" on first open; more balanced use.
- **Validate:** usage mix in a pilot; interviews on whether Remi feels like a tool or a substitute for people.

### D-M2 · A human name, with the AI label always beside it
- **Decision:** the companion was renamed from "Margin" to **Remi** (David's call, 2026-10-11): a warm, gender-neutral, real-friend name. To keep it honest, the name never appears without "AI": the "AI · not a therapist" subtitle, a "remi · AI" label on every reply group, an "r" letterform mark (never an editor character), and a system-prompt rule that Remi never claims or implies being human.
- **Principles:** trust and transparency (rank 1 here, since this is mental health), mental models.
- **Known:** human-like naming and personas increase anthropomorphism and perceived social presence. That warmth is the point, and also the risk: over-trust and confusion about who's on the other end.
- **Trade-off:** more warmth and approachability, more reliance on the labels doing their job.
- **Validate:** after one chat, can users correctly say Remi is an AI, can be wrong, and isn't a therapist? (comprehension check, target ≥90%). Watch for users addressing Remi as a person in transcripts (with consent).

### D-M3 · Disclosure before the first message, and on every screen
- **Decision:** onboarding step "Meet Remi", plus the "AI · not a therapist" subtitle, a "remi · AI" label on each reply group, and the empty-state intro.
- **Principles:** trust and transparency, mental models.
- **Known:** transparency that you're talking to an AI is an emerging regulatory expectation (e.g. EU AI Act transparency obligations for chatbots).
- **Trade-off:** a little repetition; disclosure stays visible without being a wall of text.

### D-M4 · Crisis handling never depends on the model
- **Decision:** a **deterministic safety screen** (`src/ai/safety.ts`) runs on every message, on the device. On a crisis match, the **crisis card appears immediately, before the AI replies**, and stays in the thread. The server also screens and adds a mid-conversation system note telling the model to follow its crisis guidance. The system prompt bans stating phone numbers (prevents hallucinated helplines) and method information.
- **Principles:** safety (rank 1), error prevention, feedback.
- **Known:** language models can miss or mishandle risk signals; asking directly about suicide does not increase risk; safety planning (Stanley & Brown) is an evidence-based brief intervention.
- **Likely:** the phrase list will produce false positives. Accepted: a false positive costs one calm card.
- **Unknown:** recall of the phrase list on real Gen Z language (slang, misspellings, other languages).
- **Validate:** clinical review of the list; offline test set of real-world phrasings (with an ethics process); measure recall first, precision second.

### D-M5 · The person controls what Remi sees and keeps
- **Decision:** check-in sharing is **off by default**, shares moods and tags only (never notes or drafts), and can be toggled in the chat. Chats live on the device; the person can save one to drafts, start over, or delete it (with confirmation). Remi has no memory across chats.
- **Principles:** user control, trust.
- **Trade-off:** less personalised replies; much lower privacy risk and clearer mental model.

### D-M6 · Streaming you can stop, failures you can recover from
- **Decision:** replies stream with a caret; the send button becomes **stop** while streaming. Errors keep the user's message and offer **try again**; "busy" (rate limit) says so plainly; a model refusal points to real people. Screen readers get one announcement per finished reply (not every token).
- **Principles:** feedback and system status, error recovery, accessibility.

### D-M7 · Demo mode is labelled, never disguised
- **Decision:** with no server or API key, Remi falls back to hand-written replies **with a visible "demo mode: scripted, not AI" banner**.
- **Principles:** trust. Presenting scripted text as AI (or vice versa) would be deceptive.

### Model and API (implementation notes)
- `claude-opus-5-5`, effort `medium` (chat replies are short; medium balances quality and latency), streamed through a server proxy (`server/remi.ts`) so the key never reaches the browser.
- Frozen system prompt (`server/system-prompt.ts`) + top-level `cache_control` so the conversation prefix is cached turn to turn. Per-request notes (risk flag, shared check-ins) go in a **mid-conversation system message after the last user turn**, so they never break the cached prefix.
- `fallbacks: "default"` (beta `server-side-fallback-2026-07-01`): if a safety classifier declines, the request is retried server-side on Anthropic's recommended fallback model. A final refusal shows the "real people can" message.
- History is capped at 40 turns and 4,000 characters per message.

---

## Other key decisions

### D-1 · Onboarding: two pieces of deliberate friction
**"The honest bit"** (what this is and isn't) + **18+ confirmation**, then **"Meet Remi"** before anyone can chat. Everything else is skippable.
- **Necessary friction:** sets the right mental model (not therapy, not an emergency service) and scopes the product to adults. Under-18s get a clear, kind exit with youth services. That's safer than pretending.
- **Unknown:** drop-off at the 18+ step; whether self-declaration is enough (see risks).

### D-2 · Region is asked up front
The help button is only as good as its numbers. Asking "where are you?" in onboarding (with the reason shown) means the first crisis card is correct. **Trade-off:** one more field. **Validate:** error rate of the region default.

### D-3 · After a check-in, offer one next step, then get out of the way
Write about it / talk it through / *nothing, that's it*. "Nothing" is a first-class option (no guilt). **Heavy** check-ins put real-human support first, in calm sentence case.

### D-4 · The week is faces, not a chart
No averages, scores or streaks. A missed day is a dashed outline. **Likely:** quantified-self framing can turn reflection into self-judgement for this audience. **Validate:** interviews: does the trail feel like a diary or a report card?

### D-5 · Safety plan follows Stanley–Brown's structure
Seven short parts, all optional, written on a calm day. **Known:** safety planning is an evidence-based brief intervention. It's linked from every crisis card ("Open my safety plan").

### D-6 · "My people" sends nothing on its own
One tap opens a pre-written "could you check in on me?" text **in the phone's own messaging app**. The user always presses send. Contacts stay on the device.

### D-7 · Data stays on the device; delete is real
Everything is local. **Export everything** (JSON) and **delete everything** (with a clear, non-scary confirmation) are in *you*. Drafts autosave (no save button to forget); empty new drafts are discarded on exit.

---

## Risks and things that must happen before real users ⚑

1. **Clinical and safeguarding review** of the system prompt, safety-screen phrases, crisis copy and the safety-plan flow.
2. **Helplines verified** against official sources for every region, and more regions added (the region list is UK/US/"elsewhere" only).
3. **Regulatory review.** Depending on market and claims, an AI mental-health tool can fall under medical-device rules (e.g. UK MHRA, EU MDR) and AI-specific rules. Copy currently avoids clinical claims on purpose.
4. **Data protection.** Mental-health data is special-category data under GDPR. Messages are sent to the model provider: this needs a DPA, a retention review, and plain-language disclosure (started in *you* and the chat options).
5. **Age assurance.** Self-declared 18+ is the minimum; assess whether stronger assurance is required.
6. **Escalation evaluation.** Build an eval set for Remi's crisis behaviour (detect, respond calmly, point to help, never give method information) and run it on every prompt or model change.

## Research questions (next)

- Can first-time users correctly predict what Remi can and can't do after onboarding?
- In distress, how long does it take to reach a human from any screen? (target: ≤2 taps, <10 s)
- Which onboarding steps contribute to understanding vs. cause abandonment?
- Does the opt-in for check-in sharing get used, and do people understand what it shares?
- What does the safety screen miss in real language, and what does it over-flag?
- Do users feel more connected to *people* after a month, or more reliant on Remi?

---

## Spacing and layout system (2026-10-11)

| Rule | Value | Why |
|---|---|---|
| Rhythm | **8** related (label→content) · **12** items in a group / header→what it introduces · **32** between groups | Gestalt proximity: distance tells you what belongs together. Previously every gap was 24px, so nothing grouped. |
| Gutter | **20px** on every screen, chat thread and composer | One left edge across the app. |
| Grouped lists | Related rows share one surface (radius 24) with inset 1px dividers: tools, drafts, help links, "the honest bit" | Common region: three tools read as one set, not three competing cards. |
| Concentric radii | outer = inner + padding: hero card 24 / 12 pad → face tile 12; crisis card 26 / 16 pad → 10px buttons | Mismatched nested corners are the most common "something's off" cue. |
| Shape family | Pill input + round send button | Adjacent controls share a shape. |
| Chat grouping | Same sender 4px apart; sender change 16px | Proximity shows turn-taking without labels on every bubble. |
| Section labels | One style: small secondary label | Two competing heading styles read as two levels of importance. |
| Onboarding hero | Rows: [headline + its sticker] [illustration, centred in free space] [copy + action] | The sticker annotates the headline it belongs to; no even-split voids. |

## Copy and type (2026-10-11)

**Type:** two families only, Anton + Archivo (DS D23). One Anton headline per screen; when a screen has a question headline (check-in), the page title drops to an Archivo heading.

**Copy rules** (glanceable first, delightful second):
- Lead with the point. One idea per line, ~10 words max.
- Labels over sentences: "for / not / yours" instead of "this is / this isn't / your stuff stays yours".
- Keep the small delights that cost nothing: "a name, a nickname, a vibe", "ugh counts", "nope, i'm good".
- Hints say *why* in 3–5 words: "for your local crisis lines."
- Gentle (tone 5) copy is tightened, never made cute: sentence case, complete meaning, support named plainly ("A real person can help right now. Free and confidential.").
- Errors say what happened and what's safe: "didn't send. your message is safe."
