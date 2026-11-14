/**
 * A tiny arithmetic expression language for computed fields of check templates (content stays plain data:
 * no functions, so it can be cloned, serialised and validated). Numbers, field ids, `+ - * / %`, comparisons
 * `< <= > >= == !=`, `and` / `or`, `cond ? a : b`, parentheses and `round(x)`, `min(a, b)`, `max(a, b)`.
 *
 *   'qty * price'                                    a line total
 *   '(arrive - 1 + nights) % 7 + 1'                  the weekday a stay ends on (1 = Monday)
 *   'days > 7 ? price : days >= 3 ? price / 2 : 0'   a refund by the cancellation rule
 */

type Tok = { t: 'num'; v: number } | { t: 'id'; v: string } | { t: 'op'; v: string };

function lex(src: string): Tok[] {
  const out: Tok[] = [];
  const re = /\s*(?:(\d+(?:\.\d+)?)|([A-Za-z_][A-Za-z0-9_]*)|(<=|>=|==|!=|[-+*/%()<>?:,]))/y;
  let i = 0;
  while (i < src.length) {
    if (/^\s*$/.test(src.slice(i))) break;
    re.lastIndex = i;
    const m = re.exec(src);
    if (!m) throw new Error(`expr: cannot read «${src.slice(i)}» in «${src}»`);
    if (m[1] !== undefined) out.push({ t: 'num', v: Number(m[1]) });
    else if (m[2] !== undefined) out.push(m[2] === 'and' || m[2] === 'or' ? { t: 'op', v: m[2] } : { t: 'id', v: m[2] });
    else out.push({ t: 'op', v: m[3] });
    i = re.lastIndex;
  }
  return out;
}

const BIN: Record<string, [number, (a: number, b: number) => number]> = {
  or: [1, (a, b) => (a || b ? 1 : 0)],
  and: [2, (a, b) => (a && b ? 1 : 0)],
  '==': [3, (a, b) => (a === b ? 1 : 0)],
  '!=': [3, (a, b) => (a !== b ? 1 : 0)],
  '<': [4, (a, b) => (a < b ? 1 : 0)],
  '<=': [4, (a, b) => (a <= b ? 1 : 0)],
  '>': [4, (a, b) => (a > b ? 1 : 0)],
  '>=': [4, (a, b) => (a >= b ? 1 : 0)],
  '+': [5, (a, b) => a + b],
  '-': [5, (a, b) => a - b],
  '*': [6, (a, b) => a * b],
  '/': [6, (a, b) => a / b],
  '%': [6, (a, b) => ((a % b) + b) % b],
};
const FN: Record<string, (...a: number[]) => number> = { round: (x) => Math.round(x), min: Math.min, max: Math.max };

/** Evaluate `src` with the given variables; throws on unknown names or bad syntax (the validator reports it). */
export function evalExpr(src: string, vars: Record<string, number>): number {
  const toks = lex(src);
  let p = 0;
  const peek = () => toks[p];
  const take = (v?: string) => {
    const t = toks[p++];
    if (!t || (v !== undefined && !(t.t === 'op' && t.v === v))) throw new Error(`expr: expected ${v ?? 'a value'} in «${src}»`);
    return t;
  };
  const primary = (): number => {
    const t = take();
    if (t.t === 'num') return t.v;
    if (t.t === 'id') {
      if (peek()?.t === 'op' && peek()!.v === '(') {
        take('(');
        const args: number[] = [];
        if (!(peek()?.t === 'op' && peek()!.v === ')')) {
          args.push(ternary());
          while (peek()?.t === 'op' && peek()!.v === ',') {
            take(',');
            args.push(ternary());
          }
        }
        take(')');
        const f = FN[t.v];
        if (!f) throw new Error(`expr: unknown function ${t.v} in «${src}»`);
        return f(...args);
      }
      if (!(t.v in vars)) throw new Error(`expr: unknown field ${t.v} in «${src}»`);
      return vars[t.v];
    }
    if (t.v === '(') {
      const v = ternary();
      take(')');
      return v;
    }
    if (t.v === '-') return -primary();
    throw new Error(`expr: unexpected ${t.v} in «${src}»`);
  };
  const binary = (min: number): number => {
    let left = primary();
    for (;;) {
      const t = peek();
      if (!t || t.t !== 'op' || !BIN[t.v] || BIN[t.v][0] < min) return left;
      p++;
      const [prec, f] = BIN[t.v];
      left = f(left, binary(prec + 1));
    }
  };
  const ternary = (): number => {
    const c = binary(1);
    if (peek()?.t === 'op' && peek()!.v === '?') {
      take('?');
      const a = ternary();
      take(':');
      const b = ternary();
      return c ? a : b;
    }
    return c;
  };
  const v = ternary();
  if (p !== toks.length) throw new Error(`expr: unexpected ${JSON.stringify(toks[p])} in «${src}»`);
  return v;
}
