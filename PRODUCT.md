# Product

<!-- impeccable:product-schema 1 -->

> **How this file was made.** Rishik Rontala delegated every decision in this unattended build (his kickoff message: "I'm not available to answer questions"), so impeccable's interview round could not run. Everything below is inferred from his explicit brief (`CLAUDE.md`, `PROMPT.md`, `HACKATHON.md`) and the research (`research/`). Inferences are marked *(inferred)*; facts from the brief are unmarked.

## Platform

web

## Stack

Delegated: Vite + TypeScript, no UI framework. The product is a set of pure-function engines (lexer, parser, compiler, VM, RISC-V encoder, gate simulator, rasterizer read-back) rendered with DOM, SVG and Canvas, and a framework would add weight without adding anything. Static-first, deployed to GitHub Pages with `base: './'`. Vitest for the engines, Playwright for the judge's path. No backend, no API key, no tracking (brief: "Static-first. No required backend, no required API key").

## Users

- **Primary: a first-time coder** aged 13–21 who has just written their first lines of Python (in school, on Replit, in a tutorial) and has never been shown what the computer does with them *(inferred from the event's audience: Beginner's Paradise is for beginners aged 13–21)*. Their job: *understand what really happens when they run code*, without a textbook.
- **Evaluating audience: hackathon judges** (the FirstCommit organizer and volunteer judges) who meet the project first through a 3–5 minute video, then maybe the live site on a laptop, and score Learning & Growth 30%, Creativity & Impact 25%, Technical Execution 25%, Presentation 20%.

## Product Purpose

All the Way Down takes one line (or a few lines) of beginner Python and shows it passing through every layer of a computer, computed live from the visitor's own code: characters → bytes → tokens → syntax tree → bytecode → virtual machine → machine code → logic gates → transistors → and back up as the light of the output on screen. Success: a beginner can say, in their own words, what each layer does to their code, and a judge leaves believing every layer was real, not an animation.

## Positioning

It follows **your own code**, not a canned example, through **every** layer as **one continuous descent**, and each layer is a real engine checked against a real reference: the parser's trees against Python's `ast`, the compiler's bytecode against CPython 3.11's `dis`, the RISC-V encodings against LLVM's `llvm-mc`, the adder against exhaustive arithmetic. Hardware tours (Inside the Computer), professional tools (Compiler Explorer) and execution visualisers (Python Tutor) each cover one slice.

## Operating Context

- Visitors arrive from a Devpost page or a YouTube demo, on a laptop, logged out, in a fresh browser; some on a phone.
- Many will never type code: presets and an autoplay "dive" must carry them.
- Some will type something unexpected (a syntax error, an infinite loop, an emoji). A real error, located and explained, is part of the lesson.
- The build and the product together are the Learning & Growth story: the learning journey is shown inside the product ("field notes" per layer) and in `docs/LEARNING.md`.

## Capabilities and Constraints

- Language: a documented **subset of Python 3** (integers, strings, booleans, `None`; names and assignment; arithmetic, comparison and boolean operators; `print`, `len`, `str`, `int`, `range`, `input`-free; `if/elif/else`, `while`, `for … in range(…)`; *(inferred scope; exact subset recorded in `docs/ARCHITECTURE.md`)*. Anything outside it gets a friendly, located "not in this tiny Python yet" message, never a crash.
- Bytecode is compared with CPython **3.11** (the version in this build environment); bookkeeping ops (`RESUME`, `PUSH_NULL`, `PRECALL`, `CACHE`) are filtered out and that filtering is documented.
- Machine code is **RV32I RISC-V** shown for the core of one operation. It is honest about the gap: real CPython runs many machine instructions per bytecode op.
- The execution step limit prevents infinite loops from hanging the page.
- Must load fast (LCP < 2.5 s on 4G), no console errors, work at 375 px, WCAG 2.2 AA, respect `prefers-reduced-motion`.
- Sound, if any, starts muted.

## Brand Commitments

- Name: **All the Way Down** *(inferred, chosen in `research/CONCEPTS.md`)*.
- Credit: a visible "Built by Rishik Rontala" and `<meta name="author" content="Rishik Rontala">`.
- Banned by the brief: purple/blue gradients, centered-card SaaS templates, emoji section headers, Playfair + drop shadows, generic 3D blobs, stock hero illustrations. Must not look AI-generated. Must not share a template with Rishik's other entries.
- Taste references (brief): Rishik's portfolio (Archivo condensed display, JetBrains Mono micro-labels, grain, bone/ink/terra) and Unseen Studio (display serif, neo-grotesk body, hairlines, negative space). Rule: "that style, but don't just copy them".
- Voice *(inferred)*: plain, warm, exact. Talks to a 14-year-old like a smart friend, never down. Every claim checkable.

## Evidence on Hand

- Real computation only; there are no users, testimonials, metrics or traction, and none may be invented.
- Reference checks that will exist as tests: CPython 3.11 `ast`/`dis` goldens, LLVM 18 `llvm-mc` RISC-V goldens, exhaustive adder tests.
- The organizer's published values (research): "Document your journey… your story is part of the submission"; "AI is allowed… make sure you genuinely understand."
- Build log (`docs/BUILD-LOG.md`): real bugs and decisions, recorded as they happen; the only source for "field notes".

## Product Principles

1. **Your code, not ours.** Every layer shows the visitor's own program. Presets exist only to get started.
2. **Nothing fake.** If a layer is drawn, it was computed. Where the product simplifies, it says so on the page.
3. **One idea per floor.** Each layer says what it does in one sentence a beginner can repeat; depth lives behind "look closer".
4. **The journey is the product.** The descent is continuous; the visitor always knows where they are and how far down they've gone.
5. **Show the learning.** The build's real struggles are part of the content, not hidden.

## Accessibility & Inclusion

WCAG 2.2 AA. Every visual layer has a text equivalent (tables, lists, live regions). Full keyboard path through the descent. `prefers-reduced-motion` replaces the dive with instant floor changes. Readable at 375 px. Beginners with no English-first background: short sentences, no jargon without an inline definition.
