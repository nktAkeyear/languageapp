/**
 * Vite plugin: `virtual:english-lists` = the compiled English lists (data/english/*.json),
 * trimmed (src/curriculum/lists.ts packLists), gzipped and base64-inlined, so the single-file
 * build carries them at ~¼ of the raw size and the browser parses them once, lazily
 * (src/curriculum/browser.ts). Missing files → empty lists (the game says so in 現在地).
 */
import type { Plugin } from 'vite';
import { packedListsBase64, LISTS_DIR } from '../src/curriculum/node';

const ID = 'virtual:english-lists';
const RID = '\0' + ID;

export function englishListsPlugin(): Plugin {
  return {
    name: 'english-lists',
    resolveId(id) {
      return id === ID ? RID : null;
    },
    load(id) {
      if (id !== RID) return null;
      const p = packedListsBase64();
      for (const f of ['vocab.json', 'phrases.json', 'grammar.json']) this.addWatchFile(`${LISTS_DIR}/${f}`);
      // eslint-disable-next-line no-console
      console.log(`[english-lists] vocab/phrases/grammar ${p.counts.join('/')}: raw ${(p.raw / 1024).toFixed(0)} KB → packed ${(p.packed / 1024).toFixed(0)} KB → gzip ${(p.gz / 1024).toFixed(0)} KB (base64 ${(p.b64.length / 1024).toFixed(0)} KB)`);
      return `export default ${JSON.stringify({ b64: p.b64, counts: p.counts })};`;
    },
  };
}
