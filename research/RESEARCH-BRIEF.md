# Research brief: Beginner's Paradise – FirstCommit

*Compiled Wed Sep 23 2026, 10:35–10:45 PM EDT (~162 h to the deadline). Every source is linked. Nothing below comes from memory alone.*

## How this research was done (and its limits)

The environment's network policy **blocks `devpost.com` and `firstcommit.devpost.com`** (and YouTube), for WebFetch and for curl alike. So:

- **Event facts** come from three independent sources that *could* be opened: the organizer's own GitHub (`github.com/Ur-FirstCommit`: event landing page source, main landing-page data file, blog), a participant's verbatim mirror of the Devpost rules ([Duckweed-yhb/Beginner-s-Paradise-FirstCommit `HACKATHON.md`](https://github.com/Duckweed-yhb/Beginner-s-Paradise-FirstCommit)), and search-engine snippets of the Devpost page.
- **Winners** come from [HackWinnerDB](https://github.com/notsointresting/hackwinnerdb) (CC BY 4.0), an open dataset whose entries are synced from Devpost `project-gallery?filter=winner` pages. Each winner was then **verified by opening and cloning its own GitHub repo** (README, code, commit history). Devpost pages and demo videos could not be opened here; each brief says so on its *Verified* line.

## The event, verified

| Fact | Value | Source |
|---|---|---|
| Organizer | **FirstCommit** (non-profit, fiscally hosted on Hack Club HCB; founder Harshil Arora; UAE-based, online reach). This is its **first** hackathon. | [Ur-FirstCommit org](https://github.com/Ur-FirstCommit), [.github profile](https://github.com/Ur-FirstCommit/.github), [1Password application](https://github.com/1Password/for-open-source/issues/1664), blog post *"58+ Developers, 40 Days, One Beginner Hackathon"* (Aug 21 2026, `Ur-FirstCommit/blog`) |
| Window | Aug 21 – Sep 30, 2026 | search snippets of firstcommit.devpost.com; participant repos |
| Deadline | **Sep 30 2026, 5:00 PM EDT**, which matches the mirror's "2026‑10‑01 05:00" in China Standard Time (UTC+8 → 21:00 UTC → 17:00 EDT). The organizer's landing page says "Till October 1", so the Devpost time is the binding one. | mirror; `bp-landingpage/index.html` |
| Judging / winners | Judging **Oct 3, 2026**; winners **Oct 20, 2026** | `bp-landingpage/index.html` timeline |
| Eligibility | Ages 13–21, students only, global; solo or team | Devpost snippets; mirror |
| Rubric | Learning & Growth **30%** · Creativity & Impact **25%** · Technical Execution **25%** · Presentation & Communication **20%** | Devpost snippets; mirror; FocusStudy README |
| Required | Working project built during the hackathon (libraries/templates OK, **core logic must be new**); public GitHub repo; description (what, problem, for whom); **3–5 min demo video** (features, how it works, tech, difficulties, *what you learned*); README with run steps | mirror |
| Recommended | Live deployment, screenshots, tech list, slides/PPT | mirror |
| **AI policy** | AI allowed for brainstorming, debugging and helper code. **Can't hand the entire project to AI; you must understand your code; you must state in the description where AI helped.** Organizer's site: "AI is allowed. But learning is the goal… make sure you genuinely understand and contribute to what you build." | mirror; `bp-landingpage`; `landingpage/js/data.js` |
| Prizes | Pool **$952**: Champion $292 · **Most Ambitious $220** · Most Creative $120 · Best Web/App Experience $120 · Best Design $120 · Best Technical $20 · Biggest Learning Journey $20 · Most Polished $20 · Community Loved $20; plus .xyz domains, DevSwarm and Linear Pro subscriptions, certificates. (HACKATHON.md had Most Ambitious at $292. The mirror's table sums to the stated $952 only with $220.) | mirror; organizer landing page lists the same 9 categories |
| Sponsors | .xyz Domains, DevSwarm (Linear logo in the organizer's assets) | org profile README; `landingpage/assets/sponsors` |
| Participants | 58 by ~Sep 2 per the organizer's blog; the final count is unknown | blog |

## Who the judges are, and what they visibly value

No judges list could be loaded (Devpost blocked). What the organizer publishes is the next-best signal:

- **"Document Your Journey. Track your progress, iterations, and learning. Your story is part of the submission."** (`landingpage/js/data.js`)
- **"Learning Matters. We celebrate progress and what you learned, not just polished final products."** (same file)
- Blog titles: *"Your first commit doesn't have to be good"*, *"The ugly first version"*, *"Your first project will probably suck, build it anyway"*, *"Building something small"*.
- The event landing page is itself a **playful retro operating-system pastiche** (boot sequence, "BP-OS", task manager, "⚠ AI TOOL DETECTED" dialog). The organizer enjoys computing culture, craft and wit.

**Implication:** the Learning & Growth story has to be *specific and visible*: the journey, the ugly first version, what broke. It can't be a line in the README. And because the organizer loves the texture of computers, a project *about how computers work* speaks their language.

## The field right now (other FirstCommit entries visible on GitHub)

GitQuest (terminal git game), Commit Critter (a pet that evolves with your GitHub commits), commitcraft, Splits (swim-time standards), GridPulse (microgrid simulator), PathPilot (learning-path tool), FocusStudy (Pomodoro + analytics), ScopeSignal, dripcheck (AI stylist), missed-it (capture tool). **Git/commit puns and productivity tools are crowded.** Source: GitHub search results for "FirstCommit"/"Beginner's Paradise".

## Winners studied (8, all repo-verified)

| # | Project | Event (2026) | Prize | Shape |
|---|---|---|---|---|
| 1 | [PitchSide](winners/01-pitchside.md) | United Hacks V7 (teen, 1,189 participants) | 1st Place Theme | Real historic data rebuilt as a world you *walk into*; solo; ~26 h |
| 2 | [DeepDive](winners/02-deepdive.md) | Code-A-Site (web only) | 1st Overall | **Scroll = descent** through named depth zones; real mic input |
| 3 | [UmbraCity](winners/03-umbracity.md) | FutureHacks (+2 more events) | 1st Place Overall | A real algorithm you can *see*, with a time scrubber; solo |
| 4 | [LoreLeaf](winners/04-loreleaf.md) | Next Byte Hacks V2 + HackMars 3.0 | 3rd Overall + **Best Design** ×2 | One committed hand-made art direction; precise rules |
| 5 | [Harbour](winners/05-harbour.md) | Next Byte Hacks V2 (teen) | 1st Overall | Cinematic landing, three-beat tagline, empty README |
| 6 | [MIX&MATCH!](winners/06-mix-and-match.md) | Code as a Canvas | 1st (both tracks) | Genre twist with a message; candid Challenges/Learned sections |
| 7 | [ColorStorm](winners/07-colorstorm.md) | Code-A-Site (web only) | 2nd Overall | One mechanic, live link first, ~20 h, solo |
| 8 | [GiveFive](winners/08-givefive.md) | Katy Youth Hacks | Best Design | Borrowed gesture (swipe) + plainly stated limitation |

There are no prior editions of FirstCommit (this is the organizer's first event) and no sponsor tracks, so every winner comes from **same-audience** events: teen/student online hackathons in 2026 with Best Design / Most Creative / Overall categories, and web-experience events.

## The pattern

**Problem shape that keeps winning:** *a familiar thing made physical.* An archive you walk into (PitchSide). A web page you dive through (DeepDive). A route that is the shadiest, not the shortest (UmbraCity). A study timer that is a living library (LoreLeaf). The winners take something ordinary, give it a place and a metaphor, then put **real data or a real algorithm** underneath so it isn't only a picture.

**Demo shape that keeps winning:** open on the world, not the menu; a scrubber or a scroll that moves through it; a one-line metaphor for a tagline ("The football archive you can walk into"; "The coolest route is the shadiest one"). 3 of 8 use **procedural audio** with no sample files.

**Scope ceiling:** solo builders won overall prizes with ~8–26 hours of pushes (UmbraCity, ColorStorm, PitchSide). With a six-day runway, the bar is *one* world, finished, polished and correct. It is not six features.

**What winners skipped:** tests (none of the 8 repos shows a meaningful test suite), architecture docs, READMEs (Harbour's is empty). None of that stopped them. At FirstCommit, though, Presentation (20%) explicitly scores the README and description, and Technical Execution (25%) includes "code quality", so we still ship them. They support the scoring; they don't earn it.

**What FirstCommit adds on top of the pattern:** Learning & Growth at **30%** and an explicit "your story is part of the submission". None of the studied winners made learning *visible inside the product*. That is the open lane.

**Visible bias:** a first-time organizer with a retro-OS landing page and blog posts celebrating the ugly first version rewards **craft, computing culture and honest process**.

## Risks we must answer in the concept

1. **AI policy.** This entry is built with Claude Code, directed by Rishik. The rules allow AI help but say you can't hand the *entire* project to AI and must understand the code. **Response:** a completely truthful AI disclosure (required anyway); a code base written to be *read* (the product is literally an explanation of how code runs); `docs/EXPLAIN-IT.md` as a real study guide so Rishik can defend every layer; HANDOFF steps asking Rishik to personalise `docs/LEARNING.md` with his own experience and to record the narration in his own voice. The residual risk is stated plainly in HANDOFF.
2. **Crowded themes.** Avoid git/commit puns, study timers and productivity dashboards.
3. **Devpost couldn't be opened.** HANDOFF step: Rishik confirms the prize list and the submission form fields on the live page.

## Scoring implications for our concept

| Criterion | Weight | What earns it here |
|---|---|---|
| Learning & Growth | 30% | The *subject* is learning (beginners), the *build* forces genuinely new skills, and the journey is documented inside the product and in LEARNING.md |
| Creativity & Impact | 25% | A familiar thing made physical; the impact audience is the event's own participants (beginners) |
| Technical Execution | 25% | Real algorithms under every visual, checked against external references |
| Presentation | 20% | Wow in 15 s; a one-line metaphor; captioned video 3–5 min that also covers difficulties and learning (the rules ask for it) |
