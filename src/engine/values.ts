// Python values, and the rules Python uses to combine, compare and print them.
//
// Ints are JavaScript BigInts because Python ints never overflow (2 ** 100 is exact).
// Floats are JavaScript numbers: both are IEEE-754 doubles, so arithmetic matches.
// Error messages are copied from CPython 3.11 so a beginner sees the same text here
// as in a real Python.

export type PyValue =
  | { t: 'int'; v: bigint }
  | { t: 'float'; v: number }
  | { t: 'str'; v: string }
  | { t: 'bool'; v: boolean }
  | { t: 'none' }
  | { t: 'list'; v: PyValue[] }
  | { t: 'tuple'; v: PyValue[] }
  | { t: 'range'; start: bigint; stop: bigint; step: bigint }
  | { t: 'builtin'; name: string }
  | { t: 'iter'; items: PyValue[]; pos: number; of: string }
  | { t: 'null' };

export const NONE: PyValue = { t: 'none' };
export const NULL: PyValue = { t: 'null' };
export const TRUE: PyValue = { t: 'bool', v: true };
export const FALSE: PyValue = { t: 'bool', v: false };
export const int = (v: bigint | number): PyValue => ({ t: 'int', v: BigInt(v) });
export const float = (v: number): PyValue => ({ t: 'float', v });
export const str = (v: string): PyValue => ({ t: 'str', v });
export const bool = (v: boolean): PyValue => (v ? TRUE : FALSE);

/** A Python exception raised while running the program (NameError, TypeError, ...). */
export class PyError extends Error {
  constructor(public readonly pyType: string, message: string) {
    super(message);
    this.name = pyType;
  }
}

export function typeName(v: PyValue): string {
  switch (v.t) {
    case 'int': return 'int';
    case 'float': return 'float';
    case 'str': return 'str';
    case 'bool': return 'bool';
    case 'none': return 'NoneType';
    case 'list': return 'list';
    case 'tuple': return 'tuple';
    case 'range': return 'range';
    case 'builtin': return 'builtin_function_or_method';
    case 'iter': return `${v.of}_iterator`;
    case 'null': return 'NULL';
  }
}

// ---------------------------------------------------------------- printing

/** Python's repr() for a float: the shortest digits that round-trip, in Python's layout. */
export function floatRepr(x: number): string {
  if (Number.isNaN(x)) return 'nan';
  if (x === Infinity) return 'inf';
  if (x === -Infinity) return '-inf';
  if (x === 0) return Object.is(x, -0) ? '-0.0' : '0.0';
  // toExponential() with no argument gives the shortest round-trip digits.
  const [mant, expStr] = x.toExponential().split('e');
  const exp = Number(expStr);
  // CPython switches to scientific notation when the decimal point would sit
  // more than 16 places right, or 4+ places left, of the first digit.
  if (exp < -4 || exp >= 16) {
    const sign = exp < 0 ? '-' : '+';
    const digits = String(Math.abs(exp)).padStart(2, '0');
    return `${mant}e${sign}${digits}`;
  }
  const fixed = x.toString();
  return fixed.includes('.') ? fixed : `${fixed}.0`;
}

/** Python's repr() for a string: single quotes unless the text has ' but no ". */
export function strRepr(s: string): string {
  const quote = s.includes("'") && !s.includes('"') ? '"' : "'";
  let out = quote;
  for (const ch of s) {
    const cp = ch.codePointAt(0)!;
    if (ch === quote || ch === '\\') out += '\\' + ch;
    else if (ch === '\n') out += '\\n';
    else if (ch === '\r') out += '\\r';
    else if (ch === '\t') out += '\\t';
    else if (cp < 0x20 || cp === 0x7f) out += '\\x' + cp.toString(16).padStart(2, '0');
    else out += ch;
  }
  return out + quote;
}

export function repr(v: PyValue): string {
  switch (v.t) {
    case 'int': return v.v.toString();
    case 'float': return floatRepr(v.v);
    case 'str': return strRepr(v.v);
    case 'bool': return v.v ? 'True' : 'False';
    case 'none': return 'None';
    case 'list': return '[' + v.v.map(repr).join(', ') + ']';
    case 'tuple':
      return v.v.length === 1 ? `(${repr(v.v[0])},)` : '(' + v.v.map(repr).join(', ') + ')';
    case 'range':
      return v.step === 1n ? `range(${v.start}, ${v.stop})` : `range(${v.start}, ${v.stop}, ${v.step})`;
    case 'builtin': return `<built-in function ${v.name}>`;
    case 'iter': return `<${v.of}_iterator object>`;
    case 'null': return 'NULL';
  }
}

/** Python's str(): like repr(), except strings print without quotes. */
export function toStr(v: PyValue): string {
  return v.t === 'str' ? v.v : repr(v);
}

// ---------------------------------------------------------------- truth and numbers

export function truthy(v: PyValue): boolean {
  switch (v.t) {
    case 'int': return v.v !== 0n;
    case 'float': return v.v !== 0;
    case 'str': return v.v.length > 0;
    case 'bool': return v.v;
    case 'none': return false;
    case 'list': case 'tuple': return v.v.length > 0;
    case 'range': return rangeLength(v) > 0n;
    default: return true;
  }
}

/** bool is a kind of int in Python: True + 1 == 2. */
function asInt(v: PyValue): bigint | null {
  if (v.t === 'int') return v.v;
  if (v.t === 'bool') return v.v ? 1n : 0n;
  return null;
}

function asNumber(v: PyValue): number | null {
  if (v.t === 'float') return v.v;
  const i = asInt(v);
  return i === null ? null : Number(i);
}

const isNumeric = (v: PyValue) => v.t === 'int' || v.t === 'bool' || v.t === 'float';

function floorDivInt(a: bigint, b: bigint): bigint {
  const q = a / b;
  return a % b !== 0n && (a < 0n) !== (b < 0n) ? q - 1n : q;
}

function modInt(a: bigint, b: bigint): bigint {
  const r = a % b;
  return r !== 0n && (r < 0n) !== (b < 0n) ? r + b : r;
}

/** CPython's float_divmod (Objects/floatobject.c), for exact // and % on floats. */
function floatDivmod(vx: number, wx: number): [number, number] {
  let mod = vx % wx;
  let div = (vx - mod) / wx;
  if (mod) {
    if ((wx < 0) !== (mod < 0)) {
      mod += wx;
      div -= 1.0;
    }
  } else {
    mod = wx < 0 ? -0 : 0;
  }
  let floordiv: number;
  if (div) {
    floordiv = Math.floor(div);
    if (div - floordiv > 0.5) floordiv += 1.0;
  } else {
    floordiv = (vx / wx) < 0 || Object.is(vx / wx, -0) ? -0 : 0;
  }
  return [floordiv, mod];
}

// Symbols as they appear in `dis` output (BINARY_OP argrepr).
export type BinSym = '+' | '-' | '*' | '/' | '//' | '%' | '**';

function unsupported(sym: string, a: PyValue, b: PyValue): PyError {
  return new PyError('TypeError',
    `unsupported operand type(s) for ${sym}: '${typeName(a)}' and '${typeName(b)}'`);
}

function repeatSeq(seq: PyValue, n: bigint): PyValue {
  const times = n > 0n ? Number(n) : 0;
  if (seq.t === 'str') {
    if (seq.v.length * times > 10_000_000) throw new PyError('MemoryError', '');
    return str(seq.v.repeat(times));
  }
  if (seq.t === 'list' || seq.t === 'tuple') {
    const out: PyValue[] = [];
    for (let i = 0; i < times; i++) out.push(...seq.v);
    return { t: seq.t, v: out };
  }
  throw new Error('unreachable');
}

export function binaryOp(sym: BinSym, a: PyValue, b: PyValue): PyValue {
  const ai = asInt(a);
  const bi = asInt(b);
  // int (op) int
  if (ai !== null && bi !== null) {
    switch (sym) {
      case '+': return int(ai + bi);
      case '-': return int(ai - bi);
      case '*': return int(ai * bi);
      case '/':
        if (bi === 0n) throw new PyError('ZeroDivisionError', 'division by zero');
        return float(Number(ai) / Number(bi));
      case '//':
        if (bi === 0n) throw new PyError('ZeroDivisionError', 'integer division or modulo by zero');
        return int(floorDivInt(ai, bi));
      case '%':
        if (bi === 0n) throw new PyError('ZeroDivisionError', 'integer division or modulo by zero');
        return int(modInt(ai, bi));
      case '**':
        if (bi < 0n) {
          if (ai === 0n) throw new PyError('ZeroDivisionError', '0.0 cannot be raised to a negative power');
          return float(Number(ai) ** Number(bi));
        }
        if (bi > 100_000n && ai !== 0n && ai !== 1n && ai !== -1n) {
          throw new PyError('OverflowError', 'that number is too big for this tiny Python');
        }
        return int(ai ** bi);
    }
  }
  // any mix of int/bool/float
  if (isNumeric(a) && isNumeric(b)) {
    const x = asNumber(a)!;
    const y = asNumber(b)!;
    switch (sym) {
      case '+': return float(x + y);
      case '-': return float(x - y);
      case '*': return float(x * y);
      case '/':
        if (y === 0) throw new PyError('ZeroDivisionError', 'float division by zero');
        return float(x / y);
      case '//':
        if (y === 0) throw new PyError('ZeroDivisionError', 'float floor division by zero');
        return float(floatDivmod(x, y)[0]);
      case '%':
        if (y === 0) throw new PyError('ZeroDivisionError', 'float modulo');
        return float(floatDivmod(x, y)[1]);
      case '**':
        if (x === 0 && y < 0) throw new PyError('ZeroDivisionError', '0.0 cannot be raised to a negative power');
        if (x < 0 && !Number.isInteger(y)) {
          throw new PyError('ValueError', 'this tiny Python has no complex numbers');
        }
        return float(x ** y);
    }
  }
  // sequences
  if (sym === '+') {
    if (a.t === 'str' && b.t === 'str') return str(a.v + b.v);
    if (a.t === 'list' && b.t === 'list') return { t: 'list', v: [...a.v, ...b.v] };
    if (a.t === 'tuple' && b.t === 'tuple') return { t: 'tuple', v: [...a.v, ...b.v] };
    if (a.t === 'str') {
      throw new PyError('TypeError', `can only concatenate str (not "${typeName(b)}") to str`);
    }
    if (a.t === 'list') {
      throw new PyError('TypeError', `can only concatenate list (not "${typeName(b)}") to list`);
    }
  }
  if (sym === '*') {
    const seqA = a.t === 'str' || a.t === 'list' || a.t === 'tuple';
    const seqB = b.t === 'str' || b.t === 'list' || b.t === 'tuple';
    if (seqA && bi !== null) return repeatSeq(a, bi);
    if (seqB && ai !== null) return repeatSeq(b, ai);
    if (seqA || seqB) {
      throw new PyError('TypeError', `can't multiply sequence by non-int of type '${typeName(seqA ? b : a)}'`);
    }
  }
  if (sym === '%' && a.t === 'str') {
    throw new PyError('TypeError', 'this tiny Python has no % string formatting: try an f-string');
  }
  throw unsupported(sym, a, b);
}

// ---------------------------------------------------------------- comparison

export type CmpSym = '<' | '<=' | '==' | '!=' | '>' | '>=';

/** Compare strings by code point, the way Python does (not by UTF-16 unit). */
function cmpStrings(a: string, b: string): number {
  const x = Array.from(a);
  const y = Array.from(b);
  const n = Math.min(x.length, y.length);
  for (let i = 0; i < n; i++) {
    const d = x[i].codePointAt(0)! - y[i].codePointAt(0)!;
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return x.length === y.length ? 0 : x.length < y.length ? -1 : 1;
}

export function equals(a: PyValue, b: PyValue): boolean {
  if (isNumeric(a) && isNumeric(b)) {
    const ai = asInt(a);
    const bi = asInt(b);
    if (ai !== null && bi !== null) return ai === bi;
    return asNumber(a) === asNumber(b);
  }
  if (a.t === 'str' && b.t === 'str') return a.v === b.v;
  if (a.t === 'none' && b.t === 'none') return true;
  if ((a.t === 'list' && b.t === 'list') || (a.t === 'tuple' && b.t === 'tuple')) {
    return a.v.length === b.v.length && a.v.every((x, i) => equals(x, b.v[i]));
  }
  if (a.t === 'range' && b.t === 'range') {
    return a.start === b.start && a.stop === b.stop && a.step === b.step;
  }
  if (a.t === 'builtin' && b.t === 'builtin') return a.name === b.name;
  return false;
}

/** -1, 0 or 1; throws the TypeError Python raises for unorderable types. */
function order(sym: CmpSym, a: PyValue, b: PyValue): number {
  if (isNumeric(a) && isNumeric(b)) {
    const ai = asInt(a);
    const bi = asInt(b);
    if (ai !== null && bi !== null) return ai < bi ? -1 : ai > bi ? 1 : 0;
    const x = asNumber(a)!;
    const y = asNumber(b)!;
    return x < y ? -1 : x > y ? 1 : 0;
  }
  if (a.t === 'str' && b.t === 'str') return cmpStrings(a.v, b.v);
  if ((a.t === 'list' && b.t === 'list') || (a.t === 'tuple' && b.t === 'tuple')) {
    const n = Math.min(a.v.length, b.v.length);
    for (let i = 0; i < n; i++) {
      if (!equals(a.v[i], b.v[i])) return order(sym, a.v[i], b.v[i]);
    }
    return a.v.length === b.v.length ? 0 : a.v.length < b.v.length ? -1 : 1;
  }
  throw new PyError('TypeError',
    `'${sym}' not supported between instances of '${typeName(a)}' and '${typeName(b)}'`);
}

export function compare(sym: CmpSym, a: PyValue, b: PyValue): PyValue {
  switch (sym) {
    case '==': return bool(equals(a, b));
    case '!=': return bool(!equals(a, b));
    case '<': return bool(order(sym, a, b) < 0);
    case '<=': return bool(order(sym, a, b) <= 0);
    case '>': return bool(order(sym, a, b) > 0);
    case '>=': return bool(order(sym, a, b) >= 0);
  }
}

export function contains(container: PyValue, item: PyValue): boolean {
  if (container.t === 'str') {
    if (item.t !== 'str') {
      throw new PyError('TypeError', `'in <string>' requires string as left operand, not ${typeName(item)}`);
    }
    return container.v.includes(item.v);
  }
  if (container.t === 'list' || container.t === 'tuple') return container.v.some((x) => equals(x, item));
  if (container.t === 'range') {
    const i = asInt(item);
    if (i === null) return false;
    return iterate(container).some((x) => equals(x, item));
  }
  throw new PyError('TypeError', `argument of type '${typeName(container)}' is not iterable`);
}

// ---------------------------------------------------------------- unary

export function unaryOp(op: 'UNARY_NEGATIVE' | 'UNARY_POSITIVE' | 'UNARY_NOT' | 'UNARY_INVERT', v: PyValue): PyValue {
  if (op === 'UNARY_NOT') return bool(!truthy(v));
  const i = asInt(v);
  if (op === 'UNARY_INVERT') {
    if (i === null) throw new PyError('TypeError', `bad operand type for unary ~: '${typeName(v)}'`);
    return int(-i - 1n);
  }
  const sym = op === 'UNARY_NEGATIVE' ? '-' : '+';
  if (i !== null) return int(op === 'UNARY_NEGATIVE' ? -i : i);
  if (v.t === 'float') return float(op === 'UNARY_NEGATIVE' ? -v.v : v.v);
  throw new PyError('TypeError', `bad operand type for unary ${sym}: '${typeName(v)}'`);
}

// ---------------------------------------------------------------- sequences

export function rangeLength(r: { start: bigint; stop: bigint; step: bigint }): bigint {
  const { start, stop, step } = r;
  if (step > 0n) return stop > start ? (stop - start + step - 1n) / step : 0n;
  return start > stop ? (start - stop - step - 1n) / -step : 0n;
}

/** Every item a for-loop would visit. Ranges are capped: a loop that long hits the step limit anyway. */
export function iterate(v: PyValue): PyValue[] {
  switch (v.t) {
    case 'str': return Array.from(v.v, (ch) => str(ch));
    case 'list': case 'tuple': return [...v.v];
    case 'range': {
      const n = rangeLength(v);
      const count = n > 100_000n ? 100_000 : Number(n);
      const out: PyValue[] = [];
      for (let i = 0; i < count; i++) out.push(int(v.start + BigInt(i) * v.step));
      return out;
    }
    case 'iter': return v.items.slice(v.pos);
    default:
      throw new PyError('TypeError', `'${typeName(v)}' object is not iterable`);
  }
}

export function length(v: PyValue): bigint {
  switch (v.t) {
    case 'str': return BigInt(Array.from(v.v).length);
    case 'list': case 'tuple': return BigInt(v.v.length);
    case 'range': return rangeLength(v);
    default:
      throw new PyError('TypeError', `object of type '${typeName(v)}' has no len()`);
  }
}

export function subscript(container: PyValue, index: PyValue): PyValue {
  const i = asInt(index);
  const seqName = container.t === 'str' ? 'string' : container.t;
  if (container.t === 'str' || container.t === 'list' || container.t === 'tuple' || container.t === 'range') {
    if (i === null) {
      throw new PyError('TypeError',
        `${seqName} indices must be integers${container.t === 'range' ? ' or slices' : ' or slices'}, not ${typeName(index)}`);
    }
    const items = container.t === 'str' ? Array.from(container.v) : null;
    const n = container.t === 'str' ? BigInt(items!.length)
      : container.t === 'range' ? rangeLength(container) : BigInt(container.v.length);
    const k = i < 0n ? i + n : i;
    if (k < 0n || k >= n) {
      throw new PyError('IndexError', `${seqName === 'range' ? 'range object' : seqName} index out of range`);
    }
    if (container.t === 'str') return str(items![Number(k)]);
    if (container.t === 'range') return int(container.start + k * container.step);
    return container.v[Number(k)];
  }
  throw new PyError('TypeError', `'${typeName(container)}' object is not subscriptable`);
}
