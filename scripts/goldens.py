#!/usr/bin/env python3
"""Generate the reference ("golden") files the TypeScript engine is tested against.

For every program in tests/corpus/*.py this asks the real CPython for:
  * tokens  - the `tokenize` module's token stream
  * ast     - `ast.dump(ast.parse(src))`
  * dis     - the compiled bytecode, one entry per instruction (CACHE entries excluded,
              exactly as `dis` shows them), with jump targets as instruction indexes
  * run     - what the program prints, and the exception it raises, if any

Run:  python3 scripts/goldens.py      (needs CPython 3.11; the bytecode format changes between versions)
"""
import ast
import contextlib
import dis
import io
import json
import pathlib
import sys
import tokenize

ROOT = pathlib.Path(__file__).resolve().parent.parent
CORPUS = ROOT / "tests" / "corpus"
OUT = ROOT / "tests" / "golden"

if sys.version_info[:2] != (3, 11):
    sys.exit(f"goldens.py needs CPython 3.11 (found {sys.version.split()[0]})")


def tokens(src):
    out = []
    for t in tokenize.generate_tokens(io.StringIO(src).readline):
        out.append({
            "type": tokenize.tok_name[t.type],
            "string": t.string,
            "start": list(t.start),
            "end": list(t.end),
        })
    return out


def bytecode(src):
    code = compile(src, "<program>", "exec")
    instrs = list(dis.get_instructions(code))
    index_of_offset = {ins.offset: i for i, ins in enumerate(instrs)}
    out = []
    for ins in instrs:
        entry = {"op": ins.opname, "line": ins.starts_line}
        if ins.opcode in dis.hasjrel or ins.opcode in dis.hasjabs:
            entry["target"] = index_of_offset[ins.argval]
        elif ins.opname == "LOAD_CONST":
            entry["const"] = repr(ins.argval)
        elif ins.opname in ("LOAD_NAME", "STORE_NAME"):
            entry["name"] = ins.argval
        elif ins.opname in ("BINARY_OP", "COMPARE_OP"):
            entry["arg"] = ins.argrepr
        elif ins.arg is not None:
            entry["arg"] = ins.arg
        out.append(entry)
    return out


def run(src):
    buf = io.StringIO()
    error = None
    with contextlib.redirect_stdout(buf):
        try:
            exec(compile(src, "<program>", "exec"), {"__name__": "__main__"})
        except Exception as e:  # noqa: BLE001 - we record every runtime error
            error = {"type": type(e).__name__, "message": str(e)}
    return {"stdout": buf.getvalue(), "error": error}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for path in sorted(CORPUS.glob("*.py")):
        src = path.read_text(encoding="utf-8")
        golden = {
            "python": sys.version.split()[0],
            "source": src,
            "tokens": tokens(src),
            "ast": ast.dump(ast.parse(src)),
            "dis": bytecode(src),
            "run": run(src),
        }
        (OUT / (path.stem + ".json")).write_text(
            json.dumps(golden, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {len(list(CORPUS.glob('*.py')))} goldens to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
