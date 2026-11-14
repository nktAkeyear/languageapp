/**
 * Node-side loading of the compiled English lists (tests, validate-content, simulate, the Vite
 * plugin). Never imported by browser code. Missing / broken files give empty lists plus a note.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { indexLists, packLists, readGrammar, readPhrases, readVocab, setEnglishLists, type EnglishLists } from './lists';

export const LISTS_DIR = resolve(process.cwd(), 'data/english');

function readJson(file: string, notes: string[]): unknown {
  if (!existsSync(file)) {
    notes.push(`${file}: not there (yet)`);
    return [];
  }
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    notes.push(`${file}: cannot parse (${e instanceof Error ? e.message.slice(0, 80) : e}) — treated as empty`);
    return [];
  }
}

export function readEnglishLists(dir = LISTS_DIR): EnglishLists {
  const notes: string[] = [];
  const vocab = readVocab(readJson(join(dir, 'vocab.json'), notes));
  const phrases = readPhrases(readJson(join(dir, 'phrases.json'), notes));
  const grammar = readGrammar(readJson(join(dir, 'grammar.json'), notes));
  notes.unshift(`vocab ${vocab.length}, phrases ${phrases.length}, grammar ${grammar.length}`);
  return indexLists(vocab, phrases, grammar, notes);
}

/** Read the lists from disk and make them the game's lists. */
export function loadEnglishListsFromDisk(dir = LISTS_DIR): EnglishLists {
  const l = readEnglishLists(dir);
  setEnglishLists(l);
  return l;
}

/** The packed, gzipped, base64 form the browser build inlines. */
export function packedListsBase64(dir = LISTS_DIR): { b64: string; raw: number; packed: number; gz: number; counts: [number, number, number]; notes: string[] } {
  const l = readEnglishLists(dir);
  const json = JSON.stringify(packLists(l.vocab, l.phrases, l.grammar));
  const gz = gzipSync(Buffer.from(json, 'utf8'), { level: 9 });
  let raw = 0;
  for (const f of ['vocab.json', 'phrases.json', 'grammar.json']) {
    try {
      raw += readFileSync(join(dir, f)).length;
    } catch {
      /* missing */
    }
  }
  return { b64: gz.toString('base64'), raw, packed: Buffer.byteLength(json), gz: gz.length, counts: [l.vocab.length, l.phrases.length, l.grammar.length], notes: l.notes };
}
