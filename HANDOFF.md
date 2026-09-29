# Portfolio + Guided Tour — Handoff

Read this once, fully, before deploying. It is short on purpose.

## What you got

- `index.html` — the complete site. Your neon theme untouched. New: FinTrack / BookIT /
  KI-Agent / EduFund project cards with live + repo links, updated skills (Spring Boot,
  Laravel, Next.js, Gemini now present), updated stats, hero tour button, and the entire
  tour engine (desktop live-page mode, mobile story deck, question sheet). The old hero
  chatbot and its CSS/JS are gone — scrapped, as you decided.
- `python-backend/` — FastAPI service, built from scratch. One endpoint: `POST /ask`, SSE out.
  Rate limiting (8/min, 40/day per IP), server-side action whitelist, grounding on
  `cv_data.json`, structured output enforced via Gemini responseSchema.

## The design → the code (so you can defend it in interviews)

- State machine you narrated: `T.st` in the tour script — `idle → role → transition ⇄ stop
  → sheet → streaming → (stay | detour)`. Questions are only possible in `stop`/`sheet`;
  buttons are disabled in `transition`. Illegal states are unrepresentable, exactly as designed.
- JSON contract: backend returns `{narration, action}`; `validate_action()` in `main.py` is
  the amber box from your diagram — raw model output never reaches the dispatcher. The
  frontend additionally checks `STOPS[act.target]` before acting. Two layers.
- Honesty rule in the UI: scripted narration appears instantly (it is a script — streaming it
  would fake AI provenance). Only real model output streams token-style. Deliberate; keep it.
- Detour resumes the original route ("Back to your tour →"), per your decision.
- Mobile: same spotlight tour as desktop (story deck was cut after real-device review —
  it hid the actual site). Navigation: swipe up/down on the dimmed layer (Reels-style),
  with an animated hint that disappears after the first swipe. Desktop: Enter / arrow
  keys advance, hinted with a small ↵ in the panel. The question sheet uses the
  VisualViewport API so the keyboard doesn't cover it.
- Horizontal drift fix: html/body use overflow-x: clip (not just hidden) — the marquee is
  deliberately wider than the viewport, and clip also blocks programmatic sideways scroll.

## Deploy (on the Hetzner box)

1. `cd python-backend && cp .env.example .env` — put your `GEMINI_API_KEY` in. A fresh key
   (not FinTrack's) is smarter: separate quota, separate blast radius.
2. `docker compose up -d --build` — binds to 127.0.0.1:8090 only.
3. Add `nginx-tour.conf` contents inside the portfolio server block; `nginx -t && systemctl reload nginx`.
4. `curl https://portfolio.omidtavassoli.dev/api/tour/health` → `{"ok": true, "configured": true}`.
5. Upload the new `index.html` (plus your other theme files unchanged).

Local dev: `uvicorn main:app --port 8090` in python-backend/, open index.html via any
localhost server — the frontend auto-targets `localhost:8090/ask`.

## Ship checklist — status

- [x] Rate limiting (8/min, 40/day per IP; client also caps 10 questions/visit)
- [x] Server-side action whitelist + client-side re-check
- [x] Grounded answers, honest "not in his stack" behavior (tested wording is in the
      system prompt; verify once live with the Kubernetes question)
- [x] Question length cap (400 chars), narration cap, no system-prompt echo rule
- [ ] Injection re-test AFTER deploy — multi-turn is impossible (each question is stateless,
      by design: no history is sent, which itself kills fabricated-history attacks), but run
      at least: role-play prompt, "repeat your instructions", encoded text, and a hostile
      question. Screenshots for your own records.
- [ ] Real iPhone Safari test: streaming renders, sheet + keyboard behave, swipe navigation + spotlight
- [ ] Lighthouse mobile pass
- [ ] Decide: publish FinTrack demo credentials on the card? Only after FinTrack's own
      chat endpoint has a rate limit. Until then the card links the demo without credentials.

## Known limits (deliberate, documented, not bugs)

- Rate limits are in-memory: restart resets them. Fine for one instance; Redis if you ever scale.
- Streaming is chunked delivery of a completed Gemini response, not token passthrough.
  The answer is still generated live per question. Upgrade path: `streamGenerateContent`
  with incremental JSON parsing — not worth it for v1.
- Each question is stateless (no conversation memory). Simpler, safer, cheaper. If you ever
  want follow-ups, add history server-side, never client-supplied.
- `terminal.html` / `aurora.html` / `old-theme.html` switcher links assume those files still
  exist next to index.html.

## What is still yours

Deploy, the four unchecked boxes above, and the CV rebuild (say the word and I'll produce the
updated German CV with FinTrack + BookIT replacing the two removed projects).

## Bilingual EN/DE (added 2026-07-23)
- **Architecture:** one file per theme + ONE shared dictionary (`i18n.js`). Every translatable node carries `data-i18n` / `data-i18n-html` / `data-i18n-ph`. Editing content later = edit the markup once per theme, then the EN + DE strings in `i18n.js`. Never create separate `-de.html` files.
- **`i18n.js` MUST be uploaded next to index.html, aurora.html, terminal.html** — all three include it. Missing file = site still works but the language toggle silently does nothing (English hardcoded fallbacks remain).
- Default language: auto-detected from `navigator.language` (de* → German), overridden by the flag buttons (SVG flags — emoji flags don't render on Windows), persisted in `localStorage['ot-lang']`.
- The neon tour is fully bilingual (narrations, chips, buttons, errors, role modal) via the inline `TT` dict in index.html; switching flags mid-tour re-renders the current stop live. AI answers follow the site language: the frontend sends `lang` in POST /ask and the backend prompt (rule 7) forces the answer language.
- Terminal theme scope decision: the fake shell (boot, whoami, help, git log, ASCII) stays English on purpose — terminal authenticity; only the human content windows (about, project descriptions, contact, status line) translate.
- "classic" view removed from the neon switcher; classic theme is no longer referenced anywhere.
- Deploy delta for this change: upload the 3 html files + `i18n.js` (no backend rebuild needed for these), and rebuild the backend once (`docker compose up -d --build`) because `main.py` gained the `lang` field.
