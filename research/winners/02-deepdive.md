# Winner brief: DeepDive

**Hackathon:** Code-A-Site 2026 (web-only student hackathon, 78 participants) · **Prize won:** 1st Overall, Amazon Gift Cards
**Submission URL:** https://devpost.com/software/deepdive-3f5tru · **Repo:** https://github.com/samridh10exe/ocean-explorer · **Demo video:** https://www.youtube.com/watch?v=gxyUczTjppc (length not checked)
**Verified:** repo opened and cloned ☑ · prize stated in Devpost-sourced winner record ☑ ([HackWinnerDB](https://github.com/notsointresting/hackwinnerdb), synced from `codeasite.devpost.com/project-gallery?filter=winner`) · Devpost page opened ☐ (egress-blocked) · video played ☐ (YouTube blocked)

## Pitch, verbatim (Devpost tagline as recorded in the winner record)
> A scroll-driven deep-sea expedition with silhouette creature reveals, real breath-to-oxygen mic input, sonar mechanics, and ocean pollution cleanup…

README: *"`DeepDive` is a vanilla HTML/CSS/JavaScript ocean-depth game that runs a scroll-driven dive, sonar pings, oxygen state, trivia prompts, and a final score without a build step."*

## The wow moment
Scrolling *is* descending: the page is the ocean, and each depth zone (sunlight → twilight → midnight → abyssal → hadal) reveals its creatures as silhouettes. Your real breath into the microphone refills oxygen.

## Demo teardown
- Length / first 15 s / narration: not checked (YouTube blocked).
- Real data or hardcoded: hand-authored content (15 creature illustrations across five named depth zones, trivia); the mic input is real (`getUserMedia` + `AnalyserNode` in `app.js`).

## Scope reality
- Working in the repo: scroll-driven zones, sonar pings, oxygen state, trivia modal, scoring, audio cues (`app.js`, 2,242 lines; `styles.css`, 2,912 lines).
- Commit window: 48 commits from Apr 10 to Jun 2, 2026. The event was around Apr 10–11; later commits are post-event polish. **Flag:** not all of the repo's current state was built during the event.
- Four builders.

## Stack
Vanilla HTML/CSS/JS, Web Audio, no build step. The stack is not the story; the *scroll = depth* metaphor is.

## Submission page shape
Not checked (Devpost blocked). README is minimal: install, usage, how it works.

## Why this won (one sentence)
A web page that turns the most basic web gesture, scrolling, into a physical descent, with one surprising real-world input (your breath).

## Transferable to us
- **Copy:** scroll as a spatial metaphor (descending through named layers), a depth gauge, a named zone at every level, one surprising real input.
- **Don't copy:** the ocean theme (also in Harbour, and a common teen-hackathon default), trivia-quiz filler, a thin README.
