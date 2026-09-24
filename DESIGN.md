# Design: All the Way Down

> Direction record written at shape time (Phase 4). The token tables are the build's source of truth and are re-checked against the built site in the finish pass. The direction contract lives in `.impeccable/surfaces/index-html.md`.

## The world: a core sample of your code

A computer is sedimentary. Your line of Python is the newest deposit, resting on layers of ideas laid down since 1937. The page is a **geological survey publication** that documents one borehole drilled straight down through a computer: each abstraction layer is a **stratum**, coloured by the official ICS/CGMW geologic-period colours, with a borehole-log column that always shows where you are.

Why this world: every student has met a stratigraphic column in earth science class. "Layers" is how computer scientists already talk about abstraction. The metaphor also holds a true lesson: in geology, deeper usually means older, and here it *mostly* does. The first logic gates (1937) are older than the transistors (1947) that build them today. Geologists call that an **unconformity**, and the page says so.

Refused: the category default (a dark IDE with neon syntax colours and terminal cosplay) and its opposite (a pastel cartoon textbook with a mascot).

## Strata

| # | Stratum | Shows (from the visitor's own code) | Period colour (ICS/CGMW) | Lithology pattern | First deposit (verified) |
|---|---|---|---|---|---|
| 0 | **Your code** | the editor | Quaternary `#F9F97F` | none (topsoil) | today |
| 1 | **Letters → numbers** | code points, UTF-8 bytes, bits | Neogene `#FFE619` | fine dots (sand) | UTF-8, Sep 1992: Ken Thompson and Rob Pike, on a diner placemat |
| 2 | **Tokens** | the lexer's token stream | Paleogene `#FD9A52` | coarse dots (conglomerate) | FORTRAN I compiler, Apr 1957: John Backus's team at IBM |
| 3 | **Syntax tree** | the parse tree (matches Python's `ast`) | Cretaceous `#7FC64E` | dashes (shale) | BNF grammars, 1959–60: Backus and Naur, for ALGOL |
| 4 | **Bytecode** | CPython-style instructions (match `dis`) | Jurassic `#34B2C9` | brick (limestone) | BCPL O-code, c. 1966–67: Martin Richards |
| 5 | **Virtual machine** | the stack machine running it | Triassic `#812B92` | dash-dot | Python 0.9.0, 20 Feb 1991: Guido van Rossum |
| 6 | **Machine code** | RISC-V instructions + 32-bit encodings (match LLVM) | Permian `#F04028` | vertical ticks | Manchester Baby, 21 Jun 1948 (17 instructions); RISC-V, 2010 |
| 7 | **Logic gates** | a ripple-carry adder on your numbers | Carboniferous `#67A599` | cross-hatch | Shannon's thesis and Stibitz's Model K, 1937 |
| 8 | **Transistors** | a CMOS NAND gate in your bits' states | Devonian `#CB8C37` | crosses (crystalline) | point-contact transistor, 16 Dec 1947, Bell Labs; CMOS, 1963 |
| 9 | **Light** | your output as glyph pixels and subpixels | the screen (dark) | pixel grid | (surfacing) |

Colour source: CGMW/ICS standard period colours, taken from pyrolite's `timecolors.csv` (`pyrolite/data/timescale/`). Date sources are listed in `docs/ARCHITECTURE.md#sources`.

## Colour tokens

Strategy: **Full palette**. Each stratum owns its whole field. A stratum's reading surface is a light tint of its period colour; the full-strength colour carries the lithology pattern, the borehole band, the stratum's name block and key marks in its visual. Text is always ink on tint (≥ 4.5:1) and never grey on colour; secondary text is ink at reduced weight or size, not reduced contrast.

```css
--ink:        #16130f;   /* text, rules, marks */
--ink-soft:   #3b352d;   /* secondary text: still ≥ 7:1 on every tint */
--paper:      #fbfaf4;   /* margins, the log column's ground */
--screen:     #0f1113;   /* the Light stratum: a screen in a dark room */
--phosphor:   #e8f5e0;   /* text on --screen */

/* period colours (full strength) */
--s0: #F9F97F;  --s1: #FFE619;  --s2: #FD9A52;  --s3: #7FC64E;  --s4: #34B2C9;
--s5: #812B92;  --s6: #F04028;  --s7: #67A599;  --s8: #CB8C37;

/* reading tints: color-mix(in oklab, var(--sN) P%, var(--paper)), with P chosen per
   stratum so ink passes AA and the stratum still reads as its colour */
```

Focus ring: 3 px solid `--ink` with a 2 px `--paper` offset (visible on every tint). Selection: `--ink` background, `--paper` text. Caret: `--ink`.

## Type

| Role | Face | Notes |
|---|---|---|
| Display (stratum names, headline) | **Anybody** variable (wght 100–900, **wdth 50–150**) | Width is tied to depth: surface wdth 112, each stratum ~6 narrower, transistors at 60. The type *compacts* like sediment under load. |
| Body | **Public Sans** variable | The US government publication face (USWDS); plain, very legible for beginners. |
| Code and measurements | **Fragment Mono** | Only for code, bytes, bits, encodings, depths and years. Never as costume. |

Scale (fluid, clamp): display `clamp(2.75rem, 1.6rem + 5vw, 5.75rem)`; stratum title `clamp(2rem, 1.3rem + 3vw, 3.75rem)`; lede `1.25rem`; body `1.0625rem/1.6`; small `0.875rem`; mono data `0.9375rem`. Measure 60–70ch. Tracking never tighter than −0.02em. Tabular numerals for every number column.

## Layout

- **Borehole log**: fixed left column (64 px desktop; a 10 px horizontal strip at the top on phones), with every stratum band, its pattern, depth ticks and a marker. Clickable; keyboard reachable as a list of links.
- **Strata**: full-width sections, each at least one viewport tall on desktop. Content sits on a 12-column grid with an asymmetric split: explanation on the left (5 cols), the live specimen on the right (7 cols). The *specimen* (the visitor's code in this layer's form) is the hero of each stratum.
- **Stratum head**: the stratum name in Anybody, a one-sentence "what happens here", and a survey-style data line in mono (`STRATUM 04 · DEPTH 4 · FIRST DEPOSIT 1966`). The depth number carries information, so it is not an eyebrow.
- **Look closer**: a disclosure under each specimen (native `<details>`) with the deeper explanation and the reference check.
- **Field note**: one real entry from the build log per stratum, set as a survey margin note, italic Public Sans with a hairline.
- Corners: **square everywhere** (radius 0). Rules: 1 px ink hairlines. No shadows except the drill button's pressed state.

## Motion

One authored moment: **the drill**. The rest of the motion serves it.

- Descending: the next stratum's field rises with a clip-path wipe from the bottom (`--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, 520 ms, explanatory tier). The log marker sinks with the same curve. Display `font-variation-settings: "wdth"` steps down per stratum.
- Specimen transformations (explanatory, played once when a stratum enters, replayable): characters fan into bytes (40 ms stagger); tokens snap into typed chips; tree nodes grow downward level by level; bytecode lines stack; VM steps at the chosen speed; adder carries ripple right to left (per-gate delay); transistors switch.
- **Watch the dive**: a scripted ~30 s autoplay through all strata, pausable (Space) and skippable.
- UI feedback (buttons, chips, disclosure): 140–200 ms ease-out, transform/opacity only, hover gated to `(hover: hover) and (pointer: fine)`.
- `prefers-reduced-motion: reduce`: no wipes, no staggers, no autoplay movement; strata change instantly, specimens render in their final state, opacity-only fades ≤ 150 ms.

## Voice

Plain, warm, exact. One idea per sentence. Every technical word is defined the first time it appears ("a **token** is a word the computer recognises: a name, a number, a symbol"). Claims are checkable, and simplifications are named on the page ("Real CPython runs dozens of machine instructions for this one step. We show the one that does the adding.").

## Credit

Footer: "Built by Rishik Rontala" and a link to the repository. `<meta name="author" content="Rishik Rontala">`.
