# PROGRESS: FirstCommit entry

Running log for the unattended cloud build. A resumed session reads this first and continues from the last unchecked phase.

**Deadline:** Wed Sep 30, 2026 · 5:00 PM EDT
**Internal finish line (all deliverables done, ≥24 h before):** Tue Sep 29, 2026 · 5:00 PM EDT

## Countdown log

| When (ET) | Hours to deadline | Phase |
|---|---|---|
| Wed Sep 23 2026 · 10:34 PM EDT | 162.4 h | 0: kickoff, tools check |
| Wed Sep 23 2026 · 10:47 PM EDT | 162.2 h | 2–3: research done, concept picked (All the Way Down) |
| Wed Sep 23 2026 · 10:52 PM EDT | 162.1 h | 4: design direction (core sample / strata) |

## Phase plan (budgeted backwards, hackathon-win Phase 4 table)

Working budget = 162.4 h − 24 h safety margin = **~138 h** to the internal finish line.

| Phase | Share | Budget | Must be done by (ET) |
|---|---|---|---|
| Research + concept (Phases 0–3) | pre-build | ~4 h | Thu Sep 24 · 3:00 AM |
| Design direction (impeccable shape) | pre-build | ~2 h | Thu Sep 24 · 5:00 AM |
| Core build: wow moment → demo path → rest | ~50% | ~60 h | Sat Sep 26 · 5:00 PM |
| Quality passes (critique → audit → polish) + tests | (part of buffer) | ~10 h | Sun Sep 27 · 3:00 AM |
| Demo video | ~20% | ~28 h | Mon Sep 28 · 7:00 AM |
| Submission kit + docs | ~15% | ~21 h | Tue Sep 29 · 4:00 AM |
| Buffer for the thing that breaks | ~15% | ~13 h | Tue Sep 29 · 5:00 PM |

In practice an agent session moves faster than this; the table is the ceiling, not the target. Everything ships as early as it's ready.

## Phases

- [x] 0. Kickoff: countdown, PROGRESS.md
- [x] 1. Tools check
- [x] 2. Research: verify HACKATHON.md, 5–8 winner briefs, RESEARCH-BRIEF.md
- [x] 3. Concept: siblings check, CONCEPTS.md (3 × rubric), CONCEPT.md pushed
- [x] 4. Design direction: PRODUCT.md + DESIGN.md
- [ ] 5. Build: wow moment, demo path, the rest; Vitest + Playwright + CI; Pages live
- [ ] 6. Quality: critique → audit → polish; full tests; live-URL headless pass
- [ ] 7. Demo video: submission/video/demo.mp4 (3:00–5:00, captioned)
- [ ] 8. Submission kit: DEVPOST.md, VIDEO-SCRIPT.md, gallery, deck.pdf, LEARNING.md, CHECKLIST.md, docs
- [ ] 9. Ship: merge to main, verify live, HANDOFF.md

## Log

### Phase 0–1 · Wed Sep 23 · 10:34 PM EDT · 162.4 h left
- Branch: `claude/hackathon-project-complete-vrnfie`. Repo had only the brief (CLAUDE.md, HACKATHON.md, PROMPT.md, hackathon-win skill, Pages workflow).
- **Skills in this session:** `hackathon-win`, `dataviz`, `anthropic-skills:ui-demo`, `anthropic-skills:make-interfaces-feel-better`, `anthropic-skills:accessibility`, `anthropic-skills:web-design-cheatcode`, `anthropic-skills:3d-motion-site`.
  **Missing → fallback (cloned to `/tmp/skills`, read SKILL.md directly):** `impeccable` (pbakaus/impeccable), `emil-design-skills:animate` + `emil-design-eng` (emilkowalski/skills), taste-skill (leonxlnx/taste-skill). `hypersite` is not in the session and not in the fallback repos; its job (marketing surface craft) is covered by impeccable + taste-skill + web-design-cheatcode.
- **Runtime:** Node v22.22.2, npm 10.9.7. Playwright Chromium at `/opt/pw-browsers/chromium-1194`.
- **ffmpeg:** none on the system; installed `imageio-ffmpeg` (ffmpeg 7.0.2 static, has libx264 + aac + libass `subtitles` filter) and symlinked to `/usr/local/bin/ffmpeg`.
- **n8n:** `N8N_BASE_URL` is empty in this environment, so there is no n8n API access. Any n8n workflow ships as an importable `n8n/*.json` file with a HANDOFF step (only if the concept genuinely needs one).
- 4 vCPU, 15 GB RAM, ~30 GB disk.

### Phases 2–3 · Wed Sep 23 · 10:47 PM EDT · 162.2 h left
- **Blocked hosts:** the environment's network policy denies `devpost.com`, `firstcommit.devpost.com`, YouTube, jsdelivr/unpkg CDNs, huggingface.co, web.archive.org. GitHub, npm, PyPI and fonts.googleapis.com work. WebSearch works. (Fix, if Rishik wants it: broaden Network access in the cloud environment's settings.)
- **Workaround used for research:** event facts from the organizer's GitHub (`Ur-FirstCommit`: `bp-landingpage`, `landingpage/js/data.js`, `blog`), a participant's verbatim rules mirror, and search snippets. Winners from HackWinnerDB (Devpost-synced winner records, CC BY 4.0), each verified by cloning its repo. Details and limits are in `research/RESEARCH-BRIEF.md`.
- **HACKATHON.md corrected:** Most Ambitious is $220 (not $292; the pool is $952); judging Oct 3, winners Oct 20; AI policy (disclose where AI helped, you must understand the code); core logic must be built during the event; the video should cover difficulties and what you learned.
- **8 winner briefs** in `research/winners/` (PitchSide, DeepDive, UmbraCity, LoreLeaf, Harbour, MIX&MATCH!, ColorStorm, GiveFive).
- **Siblings:** only practicetocreate has claimed a concept (Low Sun, a sun-glare calendar). No overlap.
- **Concept picked:** **A. All the Way Down** (4.90), ahead of C. First Light (4.38) and B. Field Guide to Bugs (3.78). See `research/CONCEPTS.md`, `CONCEPT.md`.
- **Key risk logged:** the AI policy. Mitigation: truthful disclosure, readable code, EXPLAIN-IT study guide, HANDOFF asks Rishik to personalise LEARNING.md and record the voiceover himself.
- **Build log for LEARNING.md starts now:** `docs/BUILD-LOG.md` records real bugs and decisions as they happen (source for "field notes").

### Phase 4 · Wed Sep 23 · 10:52 PM EDT · 162.1 h left
- impeccable run from the fallback clone (`/tmp/skills/impeccable`). Its interview round was skipped because Rishik said he can't answer questions; PRODUCT.md marks every inferred fact.
- `concept-seed` ran **degraded** (impeccable.style is egress-blocked, so no challengers or quality-bar boards). It assigned candidate 4 of my ordered list: **stratigraphic column / core sample**. Seed key b8631867.
- The direction contract is in `.impeccable/surfaces/index-html.md`. The direction record and tokens are in `DESIGN.md`.
- The world: each abstraction layer is a stratum in its official ICS/CGMW period colour (verified from pyrolite's `timecolors.csv`), with a borehole-log column as navigation. Type: Anybody (width compresses with depth), Public Sans, Fragment Mono. Every stratum's "first deposit" date was verified by web search (sources listed in DESIGN.md; ARCHITECTURE.md will carry the links).
- Build path: code-led (no image generation in this environment).
