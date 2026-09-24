// Stratum 2: tokens.
//
// A lexer reads characters and groups them into tokens: names, numbers, strings and
// operators, plus the invisible tokens Python uses for layout (NEWLINE, INDENT, DEDENT).
// This is a line-by-line port of CPython 3.11's own `tokenize` module, so for every
// program in tests/corpus it produces exactly the tokens `tokenize` does.

export type TokenType =
  | 'NAME' | 'NUMBER' | 'STRING' | 'OP' | 'NEWLINE' | 'NL' | 'COMMENT'
  | 'INDENT' | 'DEDENT' | 'ENDMARKER' | 'ERRORTOKEN';

/** Positions are [line, column]: lines count from 1, columns from 0, in characters (code points). */
export type Pos = [number, number];

export interface Token {
  type: TokenType;
  string: string;
  start: Pos;
  end: Pos;
}

/** A SyntaxError (or IndentationError) with the place it happened. */
export class PySyntaxError extends Error {
  constructor(
    message: string,
    public readonly line: number,
    public readonly col: number,
    public readonly pyType: 'SyntaxError' | 'IndentationError' = 'SyntaxError',
  ) {
    super(message);
    this.name = pyType;
  }
}

// ---- the regular expressions from Lib/tokenize.py -----------------------------

const group = (...xs: string[]) => '(?:' + xs.join('|') + ')';
const maybe = (...xs: string[]) => group(...xs) + '?';

const Hexnumber = '0[xX](?:_?[0-9a-fA-F])+';
const Binnumber = '0[bB](?:_?[01])+';
const Octnumber = '0[oO](?:_?[0-7])+';
const Decnumber = '(?:0(?:_?0)*|[1-9](?:_?[0-9])*)';
const Intnumber = group(Hexnumber, Binnumber, Octnumber, Decnumber);
const Exponent = '[eE][-+]?[0-9](?:_?[0-9])*';
const Pointfloat = group('[0-9](?:_?[0-9])*\\.(?:[0-9](?:_?[0-9])*)?', '\\.[0-9](?:_?[0-9])*') + maybe(Exponent);
const Expfloat = '[0-9](?:_?[0-9])*' + Exponent;
const Floatnumber = group(Pointfloat, Expfloat);
const Imagnumber = group('[0-9](?:_?[0-9])*[jJ]', Floatnumber + '[jJ]');
const NumberRe = group(Imagnumber, Floatnumber, Intnumber);

// Every combination of the string prefixes r, u, f, b (any case, any order).
const StringPrefix = '(?:[bB][rR]?|[rR][bBfF]?|[fF][rR]?|[uU])?';
const Triple = group(StringPrefix + "'''", StringPrefix + '"""');
const ContStr = group(
  StringPrefix + "'[^\\n'\\\\]*(?:\\\\.[^\\n'\\\\]*)*" + group("'", '\\\\\\r?\\n'),
  StringPrefix + '"[^\\n"\\\\]*(?:\\\\.[^\\n"\\\\]*)*' + group('"', '\\\\\\r?\\n'),
);

const EXACT_TOKENS = [
  '!=', '%', '%=', '&', '&=', '(', ')', '*', '**', '**=', '*=', '+', '+=', ',', '-', '-=', '->',
  '.', '...', '/', '//', '//=', '/=', ':', ':=', ';', '<', '<<', '<<=', '<=', '=', '==', '>', '>=',
  '>>', '>>=', '@', '@=', '[', ']', '^', '^=', '{', '|', '|=', '}', '~',
];
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const Special = group(...[...EXACT_TOKENS].sort().reverse().map(escapeRe));
const Funny = group('\\r?\\n', Special);
const Comment = '#[^\\r\\n]*';
const PseudoExtras = group('\\\\\\r?\\n', '$', Comment, Triple);
const Name = '[\\p{L}\\p{Nl}\\p{Mn}\\p{Mc}\\p{Nd}\\p{Pc}_]+';
const PseudoToken = new RegExp('[ \\f\\t]*(' + group(PseudoExtras, NumberRe, Funny, ContStr, Name) + ')', 'uy');

const endpats: Record<string, RegExp> = {
  "'": /[^'\\]*(?:\\.[^'\\]*)*'/sy,
  '"': /[^"\\]*(?:\\.[^"\\]*)*"/sy,
  "'''": /[^'\\]*(?:(?:\\.|'(?!''))[^'\\]*)*'''/sy,
  '"""': /[^"\\]*(?:(?:\\.|"(?!""))[^"\\]*)*"""/sy,
};

const isIdentStart = (ch: string) => /[\p{L}\p{Nl}_]/u.test(ch);
const isNumStart = (ch: string) => /[0-9]/.test(ch);

/** Column in code points for a UTF-16 index into `line`. */
const col = (line: string, i: number) => {
  let n = 0;
  for (let k = 0; k < i; k++) {
    const c = line.charCodeAt(k);
    if (c < 0xdc00 || c > 0xdfff) n++; // don't count the second half of a surrogate pair
  }
  return n;
};

export function tokenize(source: string): Token[] {
  const lines = source.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  const tokens: Token[] = [];
  const push = (type: TokenType, string: string, start: Pos, end: Pos) =>
    tokens.push({ type, string, start, end });

  let lnum = 0;
  let parenlev = 0;
  let continued = false;
  const indents = [0];
  let contstr = '';
  let contline = '';
  let strstart: Pos = [0, 0];
  let endprog: RegExp | null = null;
  let lastLine = '';

  for (let li = 0; li <= lines.length; li++) {
    const line = li < lines.length ? lines[li] : '';
    lastLine = line || lastLine;
    lnum += 1;
    let pos = 0;
    const max = line.length;

    if (contstr) {
      // inside a string that started on an earlier line
      if (!line) throw new PySyntaxError('unterminated triple-quoted string literal', strstart[0], strstart[1]);
      endprog!.lastIndex = 0;
      const m = endprog!.exec(line);
      if (m) {
        pos = m[0].length;
        push('STRING', contstr + line.slice(0, pos), strstart, [lnum, col(line, pos)]);
        contstr = '';
        contline = '';
      } else {
        contstr += line;
        contline += line;
        continue;
      }
    } else if (parenlev === 0 && !continued) {
      // the start of a new statement: measure the indentation
      if (!line) break;
      let column = 0;
      while (pos < max) {
        const ch = line[pos];
        if (ch === ' ') column += 1;
        else if (ch === '\t') column = (Math.floor(column / 8) + 1) * 8;
        else if (ch === '\f') column = 0;
        else break;
        pos += 1;
      }
      if (pos === max) break;

      if ('#\r\n'.includes(line[pos])) {
        // a blank line or a line holding only a comment
        if (line[pos] === '#') {
          const comment = line.slice(pos).replace(/[\r\n]+$/, '');
          push('COMMENT', comment, [lnum, col(line, pos)], [lnum, col(line, pos + comment.length)]);
          pos += comment.length;
        }
        push('NL', line.slice(pos), [lnum, col(line, pos)], [lnum, col(line, line.length)]);
        continue;
      }

      if (column > indents[indents.length - 1]) {
        indents.push(column);
        push('INDENT', line.slice(0, pos), [lnum, 0], [lnum, col(line, pos)]);
      }
      while (column < indents[indents.length - 1]) {
        if (!indents.includes(column)) {
          throw new PySyntaxError('unindent does not match any outer indentation level', lnum, col(line, pos), 'IndentationError');
        }
        indents.pop();
        push('DEDENT', '', [lnum, col(line, pos)], [lnum, col(line, pos)]);
      }
    } else {
      // a statement continuing inside brackets or after a backslash
      if (!line) {
        throw new PySyntaxError('unexpected end of file inside brackets', lnum - 1, 0);
      }
      continued = false;
    }

    while (pos < max) {
      PseudoToken.lastIndex = pos;
      const m = PseudoToken.exec(line);
      if (m) {
        const start = pos + m[0].length - m[1].length;
        const end = pos + m[0].length;
        pos = end;
        if (start === end) continue;
        const token = line.slice(start, end);
        const initial = line[start];
        const spos: Pos = [lnum, col(line, start)];
        const epos: Pos = [lnum, col(line, end)];

        if (isNumStart(initial) || (initial === '.' && token !== '.' && token !== '...')) {
          push('NUMBER', token, spos, epos);
        } else if (initial === '\r' || initial === '\n') {
          push(parenlev > 0 ? 'NL' : 'NEWLINE', token, spos, epos);
        } else if (initial === '#') {
          push('COMMENT', token, spos, epos);
        } else if (/^[a-zA-Z]{0,2}('''|""")$/.test(token)) {
          const quote = token.slice(-3);
          endprog = endpats[quote];
          endprog.lastIndex = pos;
          const em = endprog.exec(line);
          if (em) {
            pos = pos + em[0].length;
            push('STRING', line.slice(start, pos), spos, [lnum, col(line, pos)]);
          } else {
            strstart = spos;
            contstr = line.slice(start);
            contline = line;
            break;
          }
        } else if (/^[a-zA-Z]{0,2}['"]/.test(token) && /['"]/.test(token)) {
          if (token.endsWith('\n')) {
            throw new PySyntaxError(`unterminated string literal (detected at line ${lnum})`, lnum, col(line, start));
          }
          push('STRING', token, spos, epos);
        } else if (isIdentStart(initial)) {
          push('NAME', token, spos, epos);
        } else if (initial === '\\') {
          continued = true;
        } else {
          if ('([{'.includes(initial)) parenlev += 1;
          else if (')]}'.includes(initial)) parenlev -= 1;
          push('OP', token, spos, epos);
        }
      } else {
        // a character that can't start any token, e.g. a stray quote or `$`
        push('ERRORTOKEN', line[pos], [lnum, col(line, pos)], [lnum, col(line, pos + 1)]);
        pos += 1;
      }
    }
  }
  void contline;

  if (lastLine && !'\r\n'.includes(lastLine[lastLine.length - 1]) && !lastLine.trim().startsWith('#')) {
    push('NEWLINE', '', [lnum - 1, col(lastLine, lastLine.length)], [lnum - 1, col(lastLine, lastLine.length) + 1]);
  }
  for (let i = 1; i < indents.length; i++) push('DEDENT', '', [lnum, 0], [lnum, 0]);
  push('ENDMARKER', '', [lnum, 0], [lnum, 0]);
  return tokens;
}
