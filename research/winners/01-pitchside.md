# Winner brief: PitchSide

**Hackathon:** United Hacks V7 (2026; teen-run online hackathon, 1,189 participants, $700 pool) · **Prize won:** 1st Place Theme
**Submission URL:** https://devpost.com/software/pitchside-nr5yxm · **Repo:** https://github.com/aman-a-shah/pitchside · **Demo video:** https://www.youtube.com/watch?v=eSIOLMYX840 (length not checked)
**Verified:** repo opened and cloned ☑ · prize stated in Devpost-sourced winner record ☑ ([HackWinnerDB](https://github.com/notsointresting/hackwinnerdb) entry, synced from `unitedhacksv7.devpost.com/project-gallery?filter=winner`) · Devpost page opened ☐ (devpost.com blocked by this environment's egress policy) · video played ☐ (YouTube blocked)

## Pitch, verbatim (README first two sentences; the Devpost text could not be loaded)
> **A time machine for football.** PitchSide rebuilds real matches — every pass, shot, save and goal from their actual recorded event streams — as living, navigable 3D worlds.

Devpost tagline: *"The football archive you can walk into."*

## The wow moment
Stepping *inside* a real historic match (the 1958 World Cup final, the Hand of God) rebuilt in 3D from the real event stream, rendered on the film stock of its decade (silver newsreel for pre-1965, broadcast tape with scanlines for the 80s–90s).

## Demo teardown
- Length: not checked (YouTube blocked here).
- First 15 seconds show: unknown; README leads with a hero screenshot titled "step inside the game".
- Narrated/captioned: unknown.
- Real data or hardcoded: **real**, StatsBomb Open Data, ~4,000 matches, fetched and baked by a script.

## Scope reality
- Shown working (README screenshots): 3D match playback, five camera modes (broadcast, director, POV, orbit, fly), timeline scrubbing, minimap, stats, commentary feed, archive browser.
- Only described or optional: the Claude-backed `/api/ask` route needs an API key; local grammar parser is the default.
- Repo commit window: 27 commits between **Jul 11 09:11 and Jul 12 11:07 (ET)**, about 26 hours. Solo builder.

## Stack
Next.js, React Three Fiber, three.js, TypeScript; procedural environments and procedural crowd audio ("No audio samples anywhere except the voice clips"). The stack isn't the story; the *time machine* framing is.

## Submission page shape
- Images: README has 9 captioned screenshots in a "tour" layout (hero, 4 camera modes, stats, library, archive).
- Sections: What it does · Inside a match · The library · Running · Controls · Architecture.
- Led with: a one-line metaphor ("A time machine for football") and a named historic moment (a 17-year-old Pelé).

## Why this won (one sentence)
A familiar thing (a football archive) turned into a place you can *walk into*, built on real data with cinematic polish far beyond what a teen weekend usually produces.

## Transferable to us
- **Copy:** a one-line metaphor that makes an abstract thing physical ("walk into"); real data or real computation under every visual; many captioned screenshots in the README; procedural audio instead of samples.
- **Don't copy:** football, 3D worlds as the default answer, or a feature list so long a judge can't hold it in their head.
