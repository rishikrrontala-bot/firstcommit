# Concepts: three candidates scored against the FirstCommit rubric

*Scored Wed Sep 23 2026, ~11:45 PM EDT. Rishik delegated the pick (CLAUDE.md override), so the highest weighted score wins.*

Inputs: [RESEARCH-BRIEF.md](RESEARCH-BRIEF.md) (winner pattern: *a familiar thing made physical, with real computation underneath*; FirstCommit's open lane: *learning made visible inside the product*), the sibling check (`scripts/siblings.sh`: only **Low Sun**, a sun-glare calendar, is claimed so far), Rishik's past projects (no study tool, no music, no sun/shade geometry, no eco dashboard), and the current FirstCommit field (git/commit games, productivity tools).

## The three concepts

### A. All the Way Down
**One line:** Type one line of Python and follow it *all the way down*: characters → bytes → tokens → syntax tree → bytecode → virtual machine → machine code → logic gates → transistors, then back up as the light on your screen.

- **Problem:** every beginner writes `print("hello")` on day one, and it's pure magic: nobody shows you what actually happens. Tutorials teach syntax; compiler courses come years later; the layers in between stay invisible. FirstCommit's own participants are exactly this audience.
- **What's real:** a real lexer (with Python's INDENT/DEDENT), a recursive-descent parser whose trees match Python's own `ast` module, a compiler whose bytecode matches **CPython 3.11's `dis`** op-for-op on a test corpus, a stack VM that runs it, a **RISC-V** encoder whose 32-bit words match **LLVM's assembler**, a gate-level ripple-carry adder simulator fed with *your program's actual numbers*, a CMOS NAND model, and the browser's own font rasterizer read back pixel by pixel.
- **Wow moment (first 15 s):** the judge's line of code shatters into characters, the characters turn into bits, tokens snap together, a tree grows, bytecode stacks up, the VM runs it, one addition falls into an adder where carries ripple across the gates, the camera reaches the transistors… and then rises back up as the glowing pixels of `hi hi hi`.
- **Riskiest unknown:** matching CPython's bytecode exactly across control flow (3.11 jump forms, `PUSH_NULL`/`PRECALL` bookkeeping). Mitigation: compare opcode *sequences* after filtering documented bookkeeping ops; publish the comparison as a test.
- **Cut first:** the transistor floor (fold it into the gates floor as an inset), then `for`/`range`, then function definitions.
- **Prior art:** *Inside the Computer* (hardware zoom tour: desk → CPU → gates, with an 8086 you program in assembly), Compiler Explorer (source → assembly, for professionals), Python Tutor (execution visualiser), nandgame (build a CPU from NAND). **None follows the beginner's *own* line of high-level code through every software and hardware layer as one continuous descent.**

### B. A Field Guide to Bugs
**One line:** a naturalist's field guide to the errors beginners meet. Run broken Python in the browser; each error is a "specimen" with its habitat, lookalikes, life cycle and a live *catch it* exercise.

- **Problem:** error messages are the #1 thing that makes beginners quit, and the organizer's own landing page has a section called "A better error message".
- **What's real:** Pyodide (real CPython in WebAssembly) raises real exceptions; a deterministic classifier maps the traceback to a curated specimen; the exercises run for real.
- **Wow moment:** paste code, a specimen plate slides in, a hand-drawn "illustration" of `IndentationError` with its field marks annotated on *your* code.
- **Riskiest unknown:** Pyodide's ~10 MB first load against the LCP < 2.5 s target; the quality of a hand-curated taxonomy in six days.
- **Cut first:** exercises; fall back to the field guide alone.
- **Prior art:** friendly-traceback, Python Tutor error hints, countless "common Python errors" articles. The field-guide *framing* is the novelty, but the core function is well served already.

### C. First Light
**One line:** an interactive essay that builds a path tracer one idea at a time. Each chapter adds one line of physics, and the image on the judge's own GPU visibly gets more real (flat disc → shading → shadows → reflections → soft light → global illumination).

- **Problem:** "how do computers make realistic images?" is a question beginners ask; the answers online are dense math.
- **What's real:** a WebGL2 progressive path tracer rendering live; every chapter toggles a real term in the shader.
- **Wow moment:** scroll, and a flat red circle turns into a glass sphere in a sunlit room.
- **Riskiest unknown:** GPU variability on judges' laptops (integrated GPUs, iGPU driver bugs), and first-frame correctness (the R3F/WebGL lesson).
- **Cut first:** caustics and depth of field.
- **Prior art:** *Ray Tracing in One Weekend* (book), several excellent interactive explainers (e.g. Bartosz Ciechanowski's articles on light and cameras). Strong prior art; it also sits close to the art×tech lane of the sibling InnovArt entry.

## Weighted scoring (1–5 per criterion)

| Criterion | Weight | A. All the Way Down | B. Field Guide to Bugs | C. First Light |
|---|---|---|---|---|
| Learning & Growth | 30% | **5**: the subject *is* learning; the build spans lexing, parsing, compilation, VMs, ISAs and digital logic; the journey can be shown inside the product | 4: real learning (exceptions, tracebacks), narrower arc | 4.5: graphics maths is a steep, visible arc |
| Creativity & Impact | 25% | **5**: a familiar act (writing `print`) made physical as a descent; the audience is this event's own participants | 4: fun framing on a real pain; impact high, novelty moderate | 3.5: beautiful but a well-trodden explainer genre, and the impact is abstract for beginners |
| Technical Execution | 25% | **5**: seven real, independently checked engines (vs. CPython `ast`/`dis`, LLVM `llvm-mc`, exhaustive adder tests) | 3.5: mostly curation on top of Pyodide | 5: a real GPU path tracer |
| Presentation & Communication | 20% | **4.5**: the descent is inherently cinematic; the risk is density of explanation | 3.5: good screenshots, weaker motion | 4.5: gorgeous progressive render, strong video |
| **Weighted total** | 100% | **4.90** | **3.78** | **4.38** |

Arithmetic: A = 0.30·5 + 0.25·5 + 0.25·5 + 0.20·4.5 = 1.50 + 1.25 + 1.25 + 0.90 = **4.90**. B = 1.20 + 1.00 + 0.875 + 0.70 = **3.775**. C = 1.35 + 0.875 + 1.25 + 0.90 = **4.375**.

## Prize-track reach

| Track | A | B | C |
|---|---|---|---|
| Champion | ● | ○ | ● |
| Most Ambitious | ● | ○ | ● |
| Most Creative | ● | ● | ○ |
| Best Web/App Experience | ● | ● | ● |
| Best Design | ● | ● | ● |
| Best Technical Achievement | ● | ○ | ● |
| Biggest Learning Journey | ● | ● | ● |
| Most Polished | ● | ○ | ● |

## Pre-mortem on the pick (A): "it's October 20th and we lost. Why?"

- *"It's a textbook, not an experience."* → Every floor must be **alive with the judge's own code**, and move: no floor may be a wall of text. One sentence per floor above the fold; details behind "Look closer".
- *"Too much to take in."* → An autoplay **dive** (≈30 s) for judges who never scroll, plus manual floor-by-floor exploration for those who do. Presets so nobody has to think of code.
- *"AI built it."* → Truthful disclosure, and a product whose every layer Rishik can explain (EXPLAIN-IT.md is written as a study guide, not a cheat sheet).
- *"The bytecode is fake."* → The CPython and LLVM comparisons are tests in CI, stated in the README with the command to reproduce them.
- *"Breaks on my weird input."* → Friendly, *located* errors from the real lexer/parser (and that becomes part of the lesson: this is what a `SyntaxError` is), a step limit for infinite loops, and fuzzed inputs in the test suite.

## Pick

**A. All the Way Down**, at 4.90. It fits the theme ("your first project, your first commit" → *your first line of code*), fills the open lane from the research (learning made visible inside the product), and gives the video a wow that is literally a journey.
