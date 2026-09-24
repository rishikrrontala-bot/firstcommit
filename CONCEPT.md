# CONCEPT: All the Way Down

**Event:** Beginner's Paradise – FirstCommit · **Lane:** open, a delightful, ambitious web experience · **Claimed:** Wed Sep 23 2026, 10:47 PM EDT

**One line:** *Type one line of Python. Follow it all the way down.* Your code falls through every layer of the machine (characters, bytes, tokens, syntax tree, bytecode, virtual machine, machine code, logic gates, transistors) and comes back up as light on your screen.

**The problem:** every beginner's first program is `print("hello")`, and what happens next is invisible. Tutorials teach syntax; compilers, CPUs and logic gates arrive years later, if ever. The layers in between are where "coding" turns into "understanding computers", and nobody shows a beginner *their own* line of code going through them.

**The user:** a first-time coder, for example a 14-year-old who just ran their first Python script and wants to know what the computer actually did with it. (A persona, not a real user.)

**What it does**
1. You type a line or two of Python (or pick a preset: hello world, a countdown, an even/odd check).
2. The page descends through ten floors. Each shows **your** program in that floor's form, computed live:
   - **Letters → numbers:** code points, UTF-8 bytes, bits
   - **Tokens:** a real lexer, including Python's INDENT/DEDENT
   - **Syntax tree:** a real parser whose trees match Python's own `ast`
   - **Bytecode:** a real compiler whose output matches CPython 3.11's `dis`
   - **The virtual machine:** the stack machine running it, step by step
   - **Machine code:** the core of one operation as RISC-V instructions, with 32-bit encodings that match LLVM's assembler
   - **Logic gates:** a ripple-carry adder computing your program's actual numbers, carry by carry
   - **Transistors:** one NAND gate from that adder as four CMOS switches, in the states your bits put them in
   - **Light:** your output rendered by the browser's own font rasterizer, read back as pixels and subpixels
3. **Dive** plays the whole descent as a ~30-second film. Scroll or use the keys to walk it floor by floor. **Look closer** opens the details on each floor.
4. **Field notes** on each floor say what broke and what changed while building that layer: the learning journey, inside the product.

**Wow moment (first 15 s of the video):** a line of code shatters into characters, the characters into bits, tokens snap together, a tree grows, bytecode stacks, one addition drops into an adder and the carries ripple across the gates to the transistors, then everything rises back up as the glowing pixels of the output.

**Named prior art:** *Inside the Computer* (a hardware zoom tour with an 8086 emulator), Compiler Explorer, Python Tutor, nandgame. We differ by following the beginner's **own high-level code** through every software *and* hardware layer as one continuous descent, with each layer checked against a real reference (CPython, LLVM).

**Stack:** Vite + TypeScript, pure-function engines (lexer, parser, compiler, VM, RISC-V encoder, gate simulator) with Vitest, golden files generated from CPython 3.11 and LLVM `llvm-mc`, Canvas/SVG rendering, Playwright e2e, GitHub Pages. No backend, no key, no tracking.

Full scoring: `research/CONCEPTS.md` (A 4.90 · C 4.38 · B 3.78).
