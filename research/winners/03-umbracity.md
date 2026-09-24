# Winner brief: UmbraCity (Paris)

**Hackathon:** FutureHacks 2026 (265 participants, $5,010 pool). The same project also won at Lumora Hacks 2026 and CSC Summer Impactathon 2026 · **Prize won:** 1st Place Overall; 1st Prize; CSC Impact Honorable Mention
**Submission URL:** https://devpost.com/software/umbracity · **Repo:** https://github.com/PoseidonProMax/UmbraCity-Paris · **Demo video:** none recorded in the winner record
**Verified:** repo opened and cloned ☑ · prize stated in Devpost-sourced winner records ☑ ([HackWinnerDB](https://github.com/notsointresting/hackwinnerdb), three events' `?filter=winner` galleries) · Devpost page opened ☐ (egress-blocked) · video ☐ (none listed)

## Pitch, verbatim (README)
> UmbraCity is a real-time, 3D pedestrian navigation system that routes you through the **shadiest streets** in the city. It uses actual building heights, tree canopy data, and live sun geometry to calculate where shadows fall *right now* — and colors every road by how comfortable (or dangerous) it is to walk on.

Tagline: *"The coolest route is the shadiest one — sun-smart streets for smarter walkers."*

## The wow moment
Scrubbing a time slider and watching real building shadows sweep across a 3D Paris, with the "coolest route" recomputing as the sun moves.

## Demo teardown
- No video in the record. The README carries the demo: a feature table and an architecture tree.
- Real data: **yes**, OpenStreetMap buildings/trees/roads (preprocessed to JSON, shipped in the repo), live Open-Meteo weather, computed sun position.

## Scope reality
- Working per README: heat map, fastest vs. coolest routing (modified Dijkstra), shade planner, time slider, weather sync, procedural ambient audio.
- Commit window: 7 commits, Jun 28 18:09 → Jun 29 02:14 (IST), about 8 hours of pushes. Solo builder.

## Stack
Vite, vanilla JS, three.js, Web Audio, a Python OSM preprocessor. The algorithm (Dijkstra with a shade-weighted cost) is part of the story.

## Submission page shape
README leads with a one-line promise, then a feature table with one row per capability, then install steps for non-developers ("Download ZIP").

## Why this won (one sentence)
One inversion (the best route is the *shadiest*, not the shortest), made visible by real data and a real algorithm you can scrub through time.

## Transferable to us
- **Copy:** a real algorithm the judge can *see* working; a time scrubber; procedural audio with zero audio files; install steps a beginner judge can follow.
- **Don't copy:** sun and shade geometry. It overlaps Rishik's past project Shade Debt and his sibling entry Low Sun.
