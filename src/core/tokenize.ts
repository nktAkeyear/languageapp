import type { Lang, LexEntry, Token } from './types';

/**
 * Tokenizer: maps running text to lexicon ids.
 *
 * - `{surface|id}` markup forces a mapping (use for ambiguous words, e.g. "a {cold|cold_illness}").
 * - en: words (letters + apostrophes) are matched case-insensitively, longest multi-word
 *   match first (up to 3 words), against headwords + `forms`.
 * - zh: greedy longest match over characters (up to 6) against headwords + forms.
 * Unmatched words become tokens without id; the validator reports them.
 */
export interface LexIndex {
  lang: Lang;
  byId: Map<string, LexEntry>;
  bySurface: Map<string, string>;
  maxLen: number;
}

export function buildLexIndex(lang: Lang, lexicon: LexEntry[]): LexIndex {
  const byId = new Map<string, LexEntry>();
  const bySurface = new Map<string, string>();
  let maxLen = 1;
  for (const e of lexicon) {
    byId.set(e.id, e);
    for (const s of [e.text, ...(e.forms ?? [])]) {
      const key = lang === 'en' ? s.toLowerCase() : s;
      if (!bySurface.has(key)) bySurface.set(key, e.id);
      const len = lang === 'en' ? key.split(' ').length : [...key].length;
      maxLen = Math.max(maxLen, len);
    }
  }
  return { lang, byId, bySurface, maxLen };
}

const MARKUP = /\{([^{}|]+)\|([^{}|]+)\}/g;

/** Remove `{surface|id}` markup, leaving plain text (for display / speech). */
export function stripMarkup(text: string): string {
  return text.replace(MARKUP, '$1');
}

export function tokenize(text: string, index: LexIndex): Token[] {
  const out: Token[] = [];
  let last = 0;
  MARKUP.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = MARKUP.exec(text))) {
    if (m.index > last) out.push(...tokenizePlain(text.slice(last, m.index), index));
    out.push({ text: m[1], id: index.byId.has(m[2]) ? m[2] : undefined, ...(index.byId.has(m[2]) ? {} : { bad: m[2] }) } as Token);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(...tokenizePlain(text.slice(last), index));
  return out;
}

function tokenizePlain(text: string, index: LexIndex): Token[] {
  return index.lang === 'en' ? tokenizeEn(text, index) : tokenizeZh(text, index);
}

const EN_WORD = /[A-Za-z][A-Za-z']*/g;

function tokenizeEn(text: string, index: LexIndex): Token[] {
  // Split into word and non-word chunks.
  const chunks: { text: string; word: boolean }[] = [];
  let last = 0;
  EN_WORD.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = EN_WORD.exec(text))) {
    if (m.index > last) chunks.push({ text: text.slice(last, m.index), word: false });
    chunks.push({ text: m[0], word: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) chunks.push({ text: text.slice(last), word: false });

  const out: Token[] = [];
  let i = 0;
  while (i < chunks.length) {
    const c = chunks[i];
    if (!c.word) {
      out.push({ text: c.text });
      i++;
      continue;
    }
    let matched = false;
    // Try multi-word matches: word (space word)*, only across single-space separators.
    for (let n = index.maxLen; n >= 1; n--) {
      const parts: string[] = [];
      let j = i;
      let ok = true;
      for (let k = 0; k < n; k++) {
        if (j >= chunks.length || !chunks[j].word) {
          ok = false;
          break;
        }
        parts.push(chunks[j].text);
        if (k < n - 1) {
          if (j + 1 >= chunks.length || chunks[j + 1].text !== ' ') {
            ok = false;
            break;
          }
          j += 2;
        } else j += 1;
      }
      if (!ok) continue;
      const surface = parts.join(' ');
      const id = index.bySurface.get(surface.toLowerCase());
      if (id) {
        out.push({ text: surface, id });
        i = j;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out.push({ text: c.text });
      i++;
    }
  }
  return out;
}

const CJK = /[㐀-鿿]/;

function tokenizeZh(text: string, index: LexIndex): Token[] {
  const chars = [...text];
  const out: Token[] = [];
  let i = 0;
  let pending = '';
  const flush = () => {
    if (pending) out.push({ text: pending });
    pending = '';
  };
  while (i < chars.length) {
    let matched = false;
    if (CJK.test(chars[i])) {
      for (let n = Math.min(index.maxLen, chars.length - i); n >= 1; n--) {
        const s = chars.slice(i, i + n).join('');
        const id = index.bySurface.get(s);
        if (id) {
          flush();
          out.push({ text: s, id });
          i += n;
          matched = true;
          break;
        }
      }
    }
    if (!matched) {
      // Unmatched CJK chars are emitted one by one so the validator can name them.
      if (CJK.test(chars[i])) {
        flush();
        out.push({ text: chars[i] });
      } else pending += chars[i];
      i++;
    }
  }
  flush();
  return out;
}

/** Tokens that should have mapped to the lexicon but did not. */
export function unknownTokens(tokens: Token[], lang: Lang): string[] {
  const bad: string[] = [];
  for (const t of tokens) {
    const anyT = t as Token & { bad?: string };
    if (anyT.bad) bad.push(`{${t.text}|${anyT.bad}}`);
    else if (!t.id) {
      if (lang === 'en' ? /[A-Za-z]/.test(t.text) : CJK.test(t.text)) bad.push(t.text);
    }
  }
  return bad;
}

export function tokenIds(tokens: Token[]): string[] {
  const s = new Set<string>();
  for (const t of tokens) if (t.id) s.add(t.id);
  return [...s];
}
