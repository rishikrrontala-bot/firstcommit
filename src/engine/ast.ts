// Stratum 3: the syntax tree.
//
// Node names and fields follow Python's own `ast` module exactly, so `dump(tree)`
// prints the same text as `ast.dump(ast.parse(source))` in CPython 3.11.

import { repr, type PyValue } from './values';

export interface Loc {
  line: number;
  col: number;
  endLine: number;
  endCol: number;
}

export type Ctx = 'Load' | 'Store';
export type OperatorName = 'Add' | 'Sub' | 'Mult' | 'Div' | 'FloorDiv' | 'Mod' | 'Pow';
export type UnaryOpName = 'UAdd' | 'USub' | 'Not' | 'Invert';
export type CmpOpName = 'Eq' | 'NotEq' | 'Lt' | 'LtE' | 'Gt' | 'GtE' | 'In' | 'NotIn' | 'Is' | 'IsNot';

export type Expr =
  | { kind: 'Constant'; value: PyValue; strKind?: 'u'; loc: Loc }
  | { kind: 'Name'; id: string; ctx: Ctx; loc: Loc }
  | { kind: 'BinOp'; left: Expr; op: OperatorName; right: Expr; loc: Loc }
  | { kind: 'UnaryOp'; op: UnaryOpName; operand: Expr; loc: Loc }
  | { kind: 'BoolOp'; op: 'And' | 'Or'; values: Expr[]; loc: Loc }
  | { kind: 'Compare'; left: Expr; ops: CmpOpName[]; comparators: Expr[]; loc: Loc }
  | { kind: 'Call'; func: Expr; args: Expr[]; keywords: never[]; loc: Loc }
  | { kind: 'List'; elts: Expr[]; ctx: Ctx; loc: Loc }
  | { kind: 'Tuple'; elts: Expr[]; ctx: Ctx; loc: Loc }
  | { kind: 'Subscript'; value: Expr; slice: Expr; ctx: Ctx; loc: Loc }
  | { kind: 'JoinedStr'; values: Expr[]; loc: Loc }
  | { kind: 'FormattedValue'; value: Expr; conversion: number; format_spec: Expr | null; loc: Loc };

export type Stmt =
  | { kind: 'Expr'; value: Expr; loc: Loc }
  | { kind: 'Assign'; targets: Expr[]; value: Expr; loc: Loc }
  | { kind: 'AugAssign'; target: Expr; op: OperatorName; value: Expr; loc: Loc }
  | { kind: 'If'; test: Expr; body: Stmt[]; orelse: Stmt[]; loc: Loc }
  | { kind: 'While'; test: Expr; body: Stmt[]; orelse: Stmt[]; loc: Loc }
  | { kind: 'For'; target: Expr; iter: Expr; body: Stmt[]; orelse: Stmt[]; loc: Loc }
  | { kind: 'Pass'; loc: Loc }
  | { kind: 'Break'; loc: Loc }
  | { kind: 'Continue'; loc: Loc };

export interface Module {
  kind: 'Module';
  body: Stmt[];
}

export type Node = Expr | Stmt | Module;

// The fields of each node class, in the order `ast` lists them (`Class._fields`).
const FIELDS: Record<string, string[]> = {
  Module: ['body', 'type_ignores'],
  Expr: ['value'],
  Assign: ['targets', 'value', 'type_comment'],
  AugAssign: ['target', 'op', 'value'],
  If: ['test', 'body', 'orelse'],
  While: ['test', 'body', 'orelse'],
  For: ['target', 'iter', 'body', 'orelse', 'type_comment'],
  Pass: [], Break: [], Continue: [],
  Constant: ['value', 'kind'],
  Name: ['id', 'ctx'],
  BinOp: ['left', 'op', 'right'],
  UnaryOp: ['op', 'operand'],
  BoolOp: ['op', 'values'],
  Compare: ['left', 'ops', 'comparators'],
  Call: ['func', 'args', 'keywords'],
  List: ['elts', 'ctx'],
  Tuple: ['elts', 'ctx'],
  Subscript: ['value', 'slice', 'ctx'],
  JoinedStr: ['values'],
  FormattedValue: ['value', 'conversion', 'format_spec'],
};

// Fields that default to None and are left out of the dump when they are None.
const OPTIONAL = new Set(['type_comment', 'kind', 'format_spec']);

// Fields whose values are operator singletons such as Add() or Load().
const OPERATOR_FIELDS = new Set(['op', 'ctx']);

function dumpValue(field: string, v: unknown): string {
  if (Array.isArray(v)) {
    if (field === 'ops') return '[' + v.map((o) => `${o}()`).join(', ') + ']';
    return '[' + v.map((x) => dumpValue('', x)).join(', ') + ']';
  }
  if (OPERATOR_FIELDS.has(field)) return `${v}()`;
  if (field === 'value' && v && typeof v === 'object' && 't' in (v as object)) return repr(v as PyValue);
  if (typeof v === 'string') return repr({ t: 'str', v });
  if (typeof v === 'number') return String(v);
  if (v && typeof v === 'object' && 'kind' in (v as object)) return dump(v as Node);
  return String(v);
}

/** The same text as Python's `ast.dump(node)`. */
export function dump(node: Node): string {
  const fields = FIELDS[node.kind];
  const parts: string[] = [];
  const record = node as unknown as Record<string, unknown>;
  for (const f of fields) {
    let v = record[f];
    if (f === 'type_ignores') v = [];
    // Python's Constant has its own field called `kind` ('u' for u"..." strings);
    // ours is stored as strKind because `kind` names the node class here.
    if (node.kind === 'Constant' && f === 'kind') v = node.strKind ?? null;
    if (v === undefined || v === null) {
      if (OPTIONAL.has(f)) continue;
      v = [];
    }
    parts.push(`${f}=${dumpValue(f, v)}`);
  }
  return `${node.kind}(${parts.join(', ')})`;
}

/** Children of a node, for drawing the tree. */
export function children(node: Node): { field: string; node: Node }[] {
  const out: { field: string; node: Node }[] = [];
  const record = node as unknown as Record<string, unknown>;
  for (const f of FIELDS[node.kind]) {
    const v = record[f];
    if (Array.isArray(v)) {
      for (const x of v) if (x && typeof x === 'object' && 'kind' in x) out.push({ field: f, node: x as Node });
    } else if (v && typeof v === 'object' && 'kind' in (v as object) && !('t' in (v as object))) {
      out.push({ field: f, node: v as Node });
    }
  }
  return out;
}
