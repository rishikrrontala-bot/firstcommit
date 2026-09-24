// Stratum 3: from tokens to a syntax tree.
//
// A recursive-descent parser: one function per grammar rule, each calling the rules
// for the things that bind tighter (`or` → `and` → `not` → comparisons → `+` → `*` → `**`).
// That call order is what makes 2 + 3 * 4 mean 2 + (3 * 4).
// The trees match Python's own `ast.parse` for everything in the supported subset.

import type { CmpOpName, Ctx, Expr, Loc, Module, OperatorName, Stmt } from './ast';
import { PySyntaxError, tokenize, type Token } from './lexer';
import { FALSE, NONE, TRUE, float, int, str, type PyValue } from './values';

/** A construct that is real Python but outside this project's subset. */
export class NotSupported extends Error {
  constructor(message: string, public readonly line: number, public readonly col: number) {
    super(message);
    this.name = 'NotSupported';
  }
}

const KEYWORDS = new Set([
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue',
  'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in',
  'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
]);

const UNSUPPORTED_STATEMENTS: Record<string, string> = {
  def: 'Defining your own functions with `def`',
  class: 'Classes',
  import: 'Importing modules',
  from: 'Importing modules',
  return: '`return` (it needs `def`)',
  try: '`try`/`except`',
  with: '`with` blocks',
  global: '`global`',
  nonlocal: '`nonlocal`',
  del: '`del`',
  assert: '`assert`',
  raise: '`raise`',
  yield: '`yield`',
  async: '`async`',
  await: '`await`',
  lambda: '`lambda`',
};

const AUG_OPS: Record<string, OperatorName | 'bit'> = {
  '+=': 'Add', '-=': 'Sub', '*=': 'Mult', '/=': 'Div', '//=': 'FloorDiv', '%=': 'Mod', '**=': 'Pow',
  '|=': 'bit', '&=': 'bit', '^=': 'bit', '<<=': 'bit', '>>=': 'bit', '@=': 'bit',
};

const COMPARE_OPS: Record<string, CmpOpName> = {
  '==': 'Eq', '!=': 'NotEq', '<': 'Lt', '<=': 'LtE', '>': 'Gt', '>=': 'GtE',
};

const BLOCK_NAMES: Record<string, string> = {
  if: "'if' statement", elif: "'elif' statement", else: "'else' statement",
  while: "'while' statement", for: "'for' statement",
};

export function parse(source: string): Module {
  return new Parser(tokenize(source), source).parseModule();
}

export function parseTokens(tokens: Token[], source: string): Module {
  return new Parser(tokens, source).parseModule();
}

class Parser {
  private toks: Token[];
  private i = 0;

  constructor(all: Token[], private readonly source: string) {
    // Comments and blank-line NLs matter to the lexer, not to the grammar.
    this.toks = all.filter((t) => t.type !== 'COMMENT' && t.type !== 'NL');
    this.checkBrackets(all);
  }

  // ------------------------------------------------------------ helpers

  private get tok(): Token { return this.toks[this.i]; }
  private peek(n = 1): Token { return this.toks[Math.min(this.i + n, this.toks.length - 1)]; }
  private prev(): Token { return this.toks[this.i - 1]; }
  private next(): Token { return this.toks[this.i++]; }

  private isOp(s: string, t = this.tok) { return t.type === 'OP' && t.string === s; }
  private isKw(s: string, t = this.tok) { return t.type === 'NAME' && t.string === s; }

  private fail(message: string, t: Token = this.tok): never {
    if (t.type === 'ERRORTOKEN' && (t.string === '"' || t.string === "'")) {
      throw new PySyntaxError(`unterminated string literal (detected at line ${t.start[0]})`, t.start[0], t.start[1]);
    }
    throw new PySyntaxError(message, t.start[0], t.start[1]);
  }

  private expectOp(s: string, message = `expected '${s}'`) {
    if (!this.isOp(s)) this.fail(message, this.isEnd(this.tok) ? this.prev() : this.tok);
    return this.next();
  }

  private isEnd(t: Token) { return t.type === 'NEWLINE' || t.type === 'ENDMARKER'; }

  private locFrom(start: Token, end: Token = this.prev()): Loc {
    return { line: start.start[0], col: start.start[1], endLine: end.end[0], endCol: end.end[1] };
  }

  private span(a: { loc: Loc }, b: { loc: Loc }): Loc {
    return { line: a.loc.line, col: a.loc.col, endLine: b.loc.endLine, endCol: b.loc.endCol };
  }

  /** Report unclosed or unmatched brackets the way CPython 3.11 does. */
  private checkBrackets(all: Token[]) {
    const stack: Token[] = [];
    const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
    for (const t of all) {
      if (t.type !== 'OP') continue;
      if ('([{'.includes(t.string)) stack.push(t);
      else if (t.string in pairs) {
        const open = stack.pop();
        if (!open) throw new PySyntaxError(`unmatched '${t.string}'`, t.start[0], t.start[1]);
        if (open.string !== pairs[t.string]) {
          throw new PySyntaxError(
            `closing parenthesis '${t.string}' does not match opening parenthesis '${open.string}'` +
            (open.start[0] !== t.start[0] ? ` on line ${open.start[0]}` : ''),
            t.start[0], t.start[1]);
        }
      }
    }
    if (stack.length) {
      const open = stack[stack.length - 1];
      throw new PySyntaxError(`'${open.string}' was never closed`, open.start[0], open.start[1]);
    }
  }

  // ------------------------------------------------------------ statements

  parseModule(): Module {
    const body: Stmt[] = [];
    while (this.tok.type !== 'ENDMARKER') {
      if (this.tok.type === 'INDENT') {
        throw new PySyntaxError('unexpected indent', this.tok.end[0], this.tok.end[1], 'IndentationError');
      }
      if (this.tok.type === 'NEWLINE') { this.next(); continue; }
      body.push(...this.statement());
    }
    return { kind: 'Module', body };
  }

  private statement(): Stmt[] {
    const t = this.tok;
    if (t.type === 'NAME') {
      if (t.string === 'if') return [this.ifStmt()];
      if (t.string === 'while') return [this.whileStmt()];
      if (t.string === 'for') return [this.forStmt()];
      if (t.string === 'elif' || t.string === 'else') this.fail('invalid syntax');
    }
    return this.simpleStatements();
  }

  private simpleStatements(): Stmt[] {
    const out = [this.simpleStatement()];
    while (this.isOp(';')) {
      this.next();
      if (this.tok.type === 'NEWLINE') break;
      out.push(this.simpleStatement());
    }
    if (this.tok.type !== 'NEWLINE' && this.tok.type !== 'ENDMARKER') this.unexpected();
    if (this.tok.type === 'NEWLINE') this.next();
    return out;
  }

  /** Name what went wrong after a complete statement, with CPython's wording where it has one. */
  private unexpected(): never {
    const t = this.tok;
    const before = this.prev();
    if (t.type === 'INDENT') {
      throw new PySyntaxError('unexpected indent', t.end[0], t.end[1], 'IndentationError');
    }
    if (this.isOp('=') ) this.fail('invalid syntax. Maybe you meant \'==\' or \':=\' instead of \'=\'?');
    if ((t.type === 'NAME' || t.type === 'NUMBER' || t.type === 'STRING') &&
        (before.type === 'NAME' || before.type === 'NUMBER' || before.type === 'STRING' || this.isOp(')', before))) {
      this.fail('invalid syntax. Perhaps you forgot a comma?', before);
    }
    this.fail('invalid syntax');
  }

  private simpleStatement(): Stmt {
    const t = this.tok;
    if (t.type === 'NAME') {
      if (t.string === 'pass') { this.next(); return { kind: 'Pass', loc: this.locFrom(t) }; }
      if (t.string === 'break') { this.next(); return { kind: 'Break', loc: this.locFrom(t) }; }
      if (t.string === 'continue') { this.next(); return { kind: 'Continue', loc: this.locFrom(t) }; }
      if (t.string in UNSUPPORTED_STATEMENTS) {
        throw new NotSupported(`${UNSUPPORTED_STATEMENTS[t.string]} isn't part of this tiny Python yet.`, t.start[0], t.start[1]);
      }
      // Python 2 habit: print "hi"
      if (t.string === 'print' && !this.isEnd(this.peek()) && this.peek().type !== 'OP') {
        this.fail("Missing parentheses in call to 'print'. Did you mean print(...)?");
      }
    }

    const first = this.expressions();

    if (this.tok.type === 'OP' && this.tok.string in AUG_OPS) {
      const opTok = this.next();
      const op = AUG_OPS[opTok.string];
      if (op === 'bit') throw new NotSupported(`\`${opTok.string}\` isn't part of this tiny Python yet.`, opTok.start[0], opTok.start[1]);
      this.checkTarget(first, 'augmented assignment');
      const value = this.expressions();
      return { kind: 'AugAssign', target: this.store(first), op, value, loc: this.span(first, value) };
    }

    if (this.isOp('=')) {
      const targets: Expr[] = [first];
      let value: Expr = first;
      while (this.isOp('=')) {
        this.next();
        if (this.isEnd(this.tok)) this.fail('invalid syntax');
        value = this.expressions();
        targets.push(value);
      }
      targets.pop();
      for (const target of targets) this.checkTarget(target, 'assignment');
      return { kind: 'Assign', targets: targets.map((x) => this.store(x)), value, loc: this.span(first, value) };
    }

    return { kind: 'Expr', value: first, loc: first.loc };
  }

  private checkTarget(e: Expr, what: string) {
    if (e.kind === 'Name' || e.kind === 'Subscript') return;
    if (e.kind === 'Tuple' || e.kind === 'List') {
      throw new NotSupported('Unpacking several values at once (a, b = ...) isn\'t part of this tiny Python yet.', e.loc.line, e.loc.col);
    }
    const describe: Record<string, string> = {
      Constant: 'literal', Call: 'function call', BinOp: 'expression', Compare: 'comparison',
      BoolOp: 'expression', UnaryOp: 'expression', JoinedStr: 'f-string expression',
    };
    const name = describe[e.kind] ?? 'expression';
    const hint = what === 'assignment' ? " here. Maybe you meant '==' instead of '='?" : '';
    throw new PySyntaxError(`cannot assign to ${name}${hint}`, e.loc.line, e.loc.col);
  }

  private store(e: Expr): Expr {
    if (e.kind === 'Name' || e.kind === 'Subscript') return { ...e, ctx: 'Store' as Ctx };
    return e;
  }

  /** `:` then either an indented block or statements on the same line. */
  private block(keyword: Token): Stmt[] {
    this.expectOp(':');
    if (this.tok.type !== 'NEWLINE') return this.simpleStatements();
    this.next();
    if (this.tok.type !== 'INDENT') {
      throw new PySyntaxError(
        `expected an indented block after ${BLOCK_NAMES[keyword.string]} on line ${keyword.start[0]}`,
        this.tok.start[0], this.tok.start[1], 'IndentationError');
    }
    this.next();
    const body: Stmt[] = [];
    while (this.tok.type !== 'DEDENT' && this.tok.type !== 'ENDMARKER') {
      if (this.tok.type === 'INDENT') {
        throw new PySyntaxError('unexpected indent', this.tok.end[0], this.tok.end[1], 'IndentationError');
      }
      body.push(...this.statement());
    }
    if (this.tok.type === 'DEDENT') this.next();
    return body;
  }

  private ifStmt(): Stmt {
    const kw = this.next(); // 'if' or 'elif'
    if (this.isOp(':')) this.fail('invalid syntax');
    const test = this.namedTest();
    const body = this.block(kw);
    let orelse: Stmt[] = [];
    if (this.isKw('elif')) {
      orelse = [this.ifStmt()];
    } else if (this.isKw('else')) {
      const elseKw = this.next();
      orelse = this.block(elseKw);
    }
    const last = orelse.length ? orelse[orelse.length - 1] : body[body.length - 1];
    return { kind: 'If', test, body, orelse, loc: { ...this.locFrom(kw), endLine: last.loc.endLine, endCol: last.loc.endCol } };
  }

  private whileStmt(): Stmt {
    const kw = this.next();
    const test = this.namedTest();
    const body = this.block(kw);
    let orelse: Stmt[] = [];
    if (this.isKw('else')) {
      const elseKw = this.next();
      orelse = this.block(elseKw);
    }
    const last = orelse.length ? orelse[orelse.length - 1] : body[body.length - 1];
    return { kind: 'While', test, body, orelse, loc: { ...this.locFrom(kw), endLine: last.loc.endLine, endCol: last.loc.endCol } };
  }

  private forStmt(): Stmt {
    const kw = this.next();
    const targetTok = this.tok;
    const target = this.bitOr();
    if (target.kind !== 'Name') {
      if (target.kind === 'Tuple' || this.isOp(',')) {
        throw new NotSupported('Looping over several names at once isn\'t part of this tiny Python yet.', targetTok.start[0], targetTok.start[1]);
      }
      this.fail('invalid syntax', targetTok);
    }
    if (!this.isKw('in')) this.fail("expected 'in'");
    this.next();
    const iter = this.expressions();
    const body = this.block(kw);
    let orelse: Stmt[] = [];
    if (this.isKw('else')) {
      const elseKw = this.next();
      orelse = this.block(elseKw);
    }
    const last = orelse.length ? orelse[orelse.length - 1] : body[body.length - 1];
    return {
      kind: 'For', target: this.store(target), iter, body, orelse,
      loc: { ...this.locFrom(kw), endLine: last.loc.endLine, endCol: last.loc.endCol },
    };
  }

  /** A condition, with CPython's hint when someone writes `=` for `==`. */
  private namedTest(): Expr {
    const test = this.expression();
    if (this.isOp('=')) this.fail("invalid syntax. Maybe you meant '==' or ':=' instead of '='?");
    return test;
  }

  // ------------------------------------------------------------ expressions

  /** One expression, or several separated by commas (which make a tuple). */
  private expressions(): Expr {
    const first = this.expression();
    if (!this.isOp(',')) return first;
    const elts = [first];
    while (this.isOp(',')) {
      this.next();
      if (this.isEnd(this.tok) || this.isOp('=') || this.isOp(')')) break;
      elts.push(this.expression());
    }
    return { kind: 'Tuple', elts, ctx: 'Load', loc: this.span(first, elts[elts.length - 1]) };
  }

  private expression(): Expr {
    const t = this.tok;
    if (this.isKw('lambda')) throw new NotSupported('`lambda` isn\'t part of this tiny Python yet.', t.start[0], t.start[1]);
    const e = this.disjunction();
    if (this.isKw('if')) {
      throw new NotSupported('Inline if-expressions (x if c else y) aren\'t part of this tiny Python yet.', this.tok.start[0], this.tok.start[1]);
    }
    return e;
  }

  private disjunction(): Expr {
    const first = this.conjunction();
    if (!this.isKw('or')) return first;
    const values = [first];
    while (this.isKw('or')) { this.next(); values.push(this.conjunction()); }
    return { kind: 'BoolOp', op: 'Or', values, loc: this.span(first, values[values.length - 1]) };
  }

  private conjunction(): Expr {
    const first = this.inversion();
    if (!this.isKw('and')) return first;
    const values = [first];
    while (this.isKw('and')) { this.next(); values.push(this.inversion()); }
    return { kind: 'BoolOp', op: 'And', values, loc: this.span(first, values[values.length - 1]) };
  }

  private inversion(): Expr {
    if (this.isKw('not')) {
      const t = this.next();
      const operand = this.inversion();
      return { kind: 'UnaryOp', op: 'Not', operand, loc: { ...this.locFrom(t), endLine: operand.loc.endLine, endCol: operand.loc.endCol } };
    }
    return this.comparison();
  }

  private compareOp(): CmpOpName | null {
    const t = this.tok;
    if (t.type === 'OP' && t.string in COMPARE_OPS) { this.next(); return COMPARE_OPS[t.string]; }
    if (this.isKw('in')) { this.next(); return 'In'; }
    if (this.isKw('not') && this.isKw('in', this.peek())) { this.next(); this.next(); return 'NotIn'; }
    if (this.isKw('is')) {
      this.next();
      if (this.isKw('not')) { this.next(); return 'IsNot'; }
      return 'Is';
    }
    return null;
  }

  private comparison(): Expr {
    const left = this.bitOr();
    const ops: CmpOpName[] = [];
    const comparators: Expr[] = [];
    for (;;) {
      const op = this.compareOp();
      if (!op) break;
      ops.push(op);
      comparators.push(this.bitOr());
    }
    if (!ops.length) return left;
    return { kind: 'Compare', left, ops, comparators, loc: this.span(left, comparators[comparators.length - 1]) };
  }

  private bitOr(): Expr {
    const e = this.sum();
    const t = this.tok;
    if (t.type === 'OP' && ['|', '^', '&', '<<', '>>', '@'].includes(t.string)) {
      throw new NotSupported(`The \`${t.string}\` operator isn't part of this tiny Python yet.`, t.start[0], t.start[1]);
    }
    return e;
  }

  private sum(): Expr {
    let left = this.term();
    while (this.isOp('+') || this.isOp('-')) {
      const op: OperatorName = this.next().string === '+' ? 'Add' : 'Sub';
      const right = this.term();
      left = { kind: 'BinOp', left, op, right, loc: this.span(left, right) };
    }
    return left;
  }

  private term(): Expr {
    let left = this.factor();
    const ops: Record<string, OperatorName> = { '*': 'Mult', '/': 'Div', '//': 'FloorDiv', '%': 'Mod' };
    while (this.tok.type === 'OP' && this.tok.string in ops) {
      const op = ops[this.next().string];
      const right = this.factor();
      left = { kind: 'BinOp', left, op, right, loc: this.span(left, right) };
    }
    return left;
  }

  private factor(): Expr {
    const t = this.tok;
    if (this.isOp('-') || this.isOp('+') || this.isOp('~')) {
      this.next();
      const operand = this.factor();
      const op = t.string === '-' ? 'USub' : t.string === '+' ? 'UAdd' : 'Invert';
      return { kind: 'UnaryOp', op, operand, loc: { ...this.locFrom(t), endLine: operand.loc.endLine, endCol: operand.loc.endCol } };
    }
    return this.power();
  }

  private power(): Expr {
    const left = this.primary();
    if (this.isOp('**')) {
      this.next();
      const right = this.factor(); // right-associative, and binds tighter than unary minus on the left
      return { kind: 'BinOp', left, op: 'Pow', right, loc: this.span(left, right) };
    }
    return left;
  }

  private primary(): Expr {
    let e = this.atom();
    for (;;) {
      if (this.isOp('(')) {
        this.next();
        const args: Expr[] = [];
        while (!this.isOp(')')) {
          if (this.tok.type === 'NAME' && this.isOp('=', this.peek())) {
            throw new NotSupported('Keyword arguments like sep= or end= aren\'t part of this tiny Python yet.', this.tok.start[0], this.tok.start[1]);
          }
          if (this.isOp('*') || this.isOp('**')) {
            throw new NotSupported('Unpacking arguments with * isn\'t part of this tiny Python yet.', this.tok.start[0], this.tok.start[1]);
          }
          args.push(this.expression());
          if (this.isOp(',')) this.next();
          else if (!this.isOp(')')) this.fail('invalid syntax. Perhaps you forgot a comma?', this.prev());
        }
        this.next();
        e = { kind: 'Call', func: e, args, keywords: [], loc: { ...e.loc, endLine: this.prev().end[0], endCol: this.prev().end[1] } };
      } else if (this.isOp('[')) {
        this.next();
        if (this.isOp(':') ) throw new NotSupported('Slices like s[1:3] aren\'t part of this tiny Python yet.', this.tok.start[0], this.tok.start[1]);
        const slice = this.expression();
        if (this.isOp(':')) throw new NotSupported('Slices like s[1:3] aren\'t part of this tiny Python yet.', this.tok.start[0], this.tok.start[1]);
        this.expectOp(']');
        e = { kind: 'Subscript', value: e, slice, ctx: 'Load', loc: { ...e.loc, endLine: this.prev().end[0], endCol: this.prev().end[1] } };
      } else if (this.isOp('.')) {
        const dot = this.next();
        throw new NotSupported('Methods like .append() or .upper() aren\'t part of this tiny Python yet.', dot.start[0], dot.start[1]);
      } else {
        return e;
      }
    }
  }

  private atom(): Expr {
    const t = this.tok;
    if (t.type === 'NAME') {
      if (t.string === 'True') { this.next(); return this.constant(TRUE, t); }
      if (t.string === 'False') { this.next(); return this.constant(FALSE, t); }
      if (t.string === 'None') { this.next(); return this.constant(NONE, t); }
      if (KEYWORDS.has(t.string)) {
        if (t.string in UNSUPPORTED_STATEMENTS) {
          throw new NotSupported(`${UNSUPPORTED_STATEMENTS[t.string]} isn't part of this tiny Python yet.`, t.start[0], t.start[1]);
        }
        this.fail('invalid syntax');
      }
      this.next();
      return { kind: 'Name', id: t.string, ctx: 'Load', loc: this.locFrom(t) };
    }
    if (t.type === 'NUMBER') {
      this.next();
      return this.constant(parseNumber(t), t);
    }
    if (t.type === 'STRING') return this.strings();
    if (this.isOp('(')) {
      const open = this.next();
      if (this.isOp(')')) {
        this.next();
        return { kind: 'Tuple', elts: [], ctx: 'Load', loc: this.locFrom(open) };
      }
      const inner = this.expression();
      if (this.isOp(',')) {
        const elts = [inner];
        while (this.isOp(',')) {
          this.next();
          if (this.isOp(')')) break;
          elts.push(this.expression());
        }
        this.expectOp(')');
        return { kind: 'Tuple', elts, ctx: 'Load', loc: this.locFrom(open) };
      }
      this.expectOp(')', "'(' was never closed");
      return inner;
    }
    if (this.isOp('[')) {
      const open = this.next();
      const elts: Expr[] = [];
      while (!this.isOp(']')) {
        elts.push(this.expression());
        if (this.isKw('for')) {
          throw new NotSupported('List comprehensions aren\'t part of this tiny Python yet.', this.tok.start[0], this.tok.start[1]);
        }
        if (this.isOp(',')) this.next();
        else if (!this.isOp(']')) this.fail('invalid syntax. Perhaps you forgot a comma?', this.prev());
      }
      this.next();
      return { kind: 'List', elts, ctx: 'Load', loc: this.locFrom(open) };
    }
    if (this.isOp('{')) {
      throw new NotSupported('Dictionaries and sets ({...}) aren\'t part of this tiny Python yet.', t.start[0], t.start[1]);
    }
    if (t.type === 'INDENT') throw new PySyntaxError('unexpected indent', t.end[0], t.end[1], 'IndentationError');
    if (this.isEnd(t)) this.fail('invalid syntax', this.prev());
    this.fail('invalid syntax');
  }

  private constant(value: PyValue, t: Token): Expr {
    return { kind: 'Constant', value, loc: this.locFrom(t, t) };
  }

  /** One or more adjacent string literals ("a" "b" is one string), including f-strings. */
  private strings(): Expr {
    const first = this.tok;
    const parts: { tok: Token; pieces: FPiece[]; isF: boolean }[] = [];
    while (this.tok.type === 'STRING') {
      const tok = this.next();
      const lit = splitStringToken(tok);
      if (lit.bytes) throw new NotSupported('Bytes literals (b"...") aren\'t part of this tiny Python yet.', tok.start[0], tok.start[1]);
      parts.push({ tok, pieces: lit.isF ? this.fstringPieces(lit.body, lit.raw, tok) : [{ text: decode(lit.body, lit.raw, tok) }], isF: lit.isF });
    }
    const last = this.prev();
    const loc = this.locFrom(first, last);
    const strKind = splitStringToken(first).u ? 'u' as const : undefined;
    if (!parts.some((p) => p.isF)) {
      const expr: Expr = { kind: 'Constant', value: str(parts.map((p) => p.pieces[0].text).join('')), loc };
      if (strKind) expr.strKind = strKind;
      return expr;
    }
    // Merge neighbouring literal text, as CPython does when it builds a JoinedStr.
    const values: Expr[] = [];
    let text = '';
    const flush = () => {
      if (text) values.push({ kind: 'Constant', value: str(text), loc });
      text = '';
    };
    for (const p of parts) {
      for (const piece of p.pieces) {
        if (piece.expr) { flush(); values.push(piece.expr); } else text += piece.text;
      }
    }
    flush();
    return { kind: 'JoinedStr', values, loc };
  }

  /** Split an f-string body into literal text and {expressions}. */
  private fstringPieces(body: string, raw: boolean, tok: Token): FPiece[] {
    const pieces: FPiece[] = [];
    let text = '';
    let i = 0;
    const err = (m: string): never => { throw new PySyntaxError(`f-string: ${m}`, tok.start[0], tok.start[1]); };
    while (i < body.length) {
      const ch = body[i];
      if (ch === '{' && body[i + 1] === '{') { text += '{'; i += 2; continue; }
      if (ch === '}' && body[i + 1] === '}') { text += '}'; i += 2; continue; }
      if (ch === '}') err("single '}' is not allowed");
      if (ch !== '{') {
        // copy up to the next brace, decoding escapes in that run
        let j = i;
        while (j < body.length && body[j] !== '{' && body[j] !== '}') j++;
        text += decode(body.slice(i, j), raw, tok);
        i = j;
        continue;
      }
      // an expression field
      if (text) { pieces.push({ text }); text = ''; }
      let depth = 0;
      let j = i + 1;
      let quote = '';
      for (; j < body.length; j++) {
        const c = body[j];
        if (quote) { if (c === quote) quote = ''; continue; }
        if (c === '"' || c === "'") { quote = c; continue; }
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') {
          if (depth === 0) break;
          depth--;
        } else if ((c === '!' && body[j + 1] !== '=') || c === ':') {
          if (depth === 0) break;
        }
      }
      const exprText = body.slice(i + 1, j);
      if (!exprText.trim()) err('empty expression not allowed');
      if (exprText.trimEnd().endsWith('=') && !/[=!<>]=$/.test(exprText.trimEnd())) {
        throw new NotSupported('The f-string debug form {x=} isn\'t part of this tiny Python yet.', tok.start[0], tok.start[1]);
      }
      let conversion = -1;
      let formatSpec: Expr | null = null;
      if (body[j] === '!') {
        const c = body[j + 1];
        if (!'sra'.includes(c)) err("invalid conversion character: expected 's', 'r', or 'a'");
        conversion = c.charCodeAt(0);
        j += 2;
      }
      if (body[j] === ':') {
        let k = j + 1;
        let d = 0;
        for (; k < body.length; k++) {
          if (body[k] === '{') d++;
          else if (body[k] === '}') { if (d === 0) break; d--; }
        }
        const specPieces = this.fstringPieces(body.slice(j + 1, k), raw, tok);
        formatSpec = {
          kind: 'JoinedStr',
          values: specPieces.map((p) => p.expr ?? { kind: 'Constant', value: str(p.text), loc: this.locFrom(tok, tok) }),
          loc: this.locFrom(tok, tok),
        };
        j = k;
      }
      if (body[j] !== '}') err("expecting '}'");
      const inner = parseInnerExpression(exprText, tok);
      pieces.push({ text: '', expr: { kind: 'FormattedValue', value: inner, conversion, format_spec: formatSpec, loc: this.locFrom(tok, tok) } });
      i = j + 1;
    }
    if (text) pieces.push({ text });
    return pieces;
  }
}

interface FPiece { text: string; expr?: Expr }

/** Parse the expression inside an f-string's braces, e.g. the `x * x` in f"{x * x}". */
function parseInnerExpression(text: string, tok: Token): Expr {
  const src = `(${text.trim()})\n`;
  const inner = new Parser(tokenize(src), src) as unknown as { expressions(): Expr };
  const e = inner.expressions();
  // Shift locations so highlights point inside the original string token.
  const shift = (x: Expr) => {
    x.loc = { line: tok.start[0], col: tok.start[1], endLine: tok.end[0], endCol: tok.end[1] };
  };
  walk(e, shift);
  return e;
}

function walk(e: Expr, fn: (x: Expr) => void) {
  fn(e);
  for (const v of Object.values(e)) {
    if (Array.isArray(v)) v.forEach((x) => x && typeof x === 'object' && 'kind' in x && walk(x as Expr, fn));
    else if (v && typeof v === 'object' && 'kind' in v && 'loc' in v) walk(v as Expr, fn);
  }
}

function parseNumber(t: Token): PyValue {
  const s = t.string.replace(/_/g, '');
  if (/[jJ]$/.test(s)) throw new NotSupported('Complex numbers (like 3j) aren\'t part of this tiny Python yet.', t.start[0], t.start[1]);
  if (/^0[xX]/.test(s)) return int(BigInt(s));
  if (/^0[oO]/.test(s)) return int(BigInt('0o' + s.slice(2)));
  if (/^0[bB]/.test(s)) return int(BigInt('0b' + s.slice(2)));
  if (/[.eE]/.test(s)) return float(Number(s));
  return int(BigInt(s));
}

function splitStringToken(tok: Token) {
  const m = /^([a-zA-Z]*)('''|"""|'|")([\s\S]*)\2$/.exec(tok.string);
  if (!m) throw new PySyntaxError(`unterminated string literal (detected at line ${tok.start[0]})`, tok.start[0], tok.start[1]);
  const prefix = m[1].toLowerCase();
  return {
    body: m[3],
    raw: prefix.includes('r'),
    isF: prefix.includes('f'),
    bytes: prefix.includes('b'),
    u: prefix === 'u',
  };
}

/** Turn escape sequences like \n and é into the characters they stand for. */
function decode(body: string, raw: boolean, tok: Token): string {
  if (raw) return body;
  let out = '';
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch !== '\\') { out += ch; continue; }
    const n = body[++i];
    switch (n) {
      case '\n': break; // backslash-newline continues the string
      case '\\': out += '\\'; break;
      case "'": out += "'"; break;
      case '"': out += '"'; break;
      case 'n': out += '\n'; break;
      case 't': out += '\t'; break;
      case 'r': out += '\r'; break;
      case 'a': out += '\x07'; break;
      case 'b': out += '\b'; break;
      case 'f': out += '\f'; break;
      case 'v': out += '\v'; break;
      case 'x': {
        const hex = body.slice(i + 1, i + 3);
        if (!/^[0-9a-fA-F]{2}$/.test(hex)) {
          throw new PySyntaxError(`(unicode error) 'unicodeescape' codec can't decode bytes: truncated \\xXX escape`, tok.start[0], tok.start[1]);
        }
        out += String.fromCodePoint(parseInt(hex, 16));
        i += 2;
        break;
      }
      case 'u': case 'U': {
        const len = n === 'u' ? 4 : 8;
        const hex = body.slice(i + 1, i + 1 + len);
        if (!new RegExp(`^[0-9a-fA-F]{${len}}$`).test(hex)) {
          throw new PySyntaxError(`(unicode error) 'unicodeescape' codec can't decode bytes: truncated \\${n}${'X'.repeat(len)} escape`, tok.start[0], tok.start[1]);
        }
        out += String.fromCodePoint(parseInt(hex, 16));
        i += len;
        break;
      }
      default:
        if (n !== undefined && /[0-7]/.test(n)) {
          const oct = /^[0-7]{1,3}/.exec(body.slice(i))![0];
          out += String.fromCodePoint(parseInt(oct, 8));
          i += oct.length - 1;
        } else {
          out += '\\' + (n ?? ''); // unknown escapes keep their backslash, as in Python
        }
    }
  }
  return out;
}
