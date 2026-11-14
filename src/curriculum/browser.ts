/**
 * Browser-side loading of the bundled English lists (see scripts/englishLists.ts): base64 →
 * gunzip (DecompressionStream) → JSON → setEnglishLists. Where DecompressionStream is missing the
 * game runs without lists (現在地 says so).
 */
import bundled from 'virtual:english-lists';
import { emptyLists, setEnglishLists, unpackLists, type PackedLists } from './lists';

let started: Promise<void> | null = null;

export function loadBundledLists(): Promise<void> {
  if (started) return started;
  started = (async () => {
    const b = bundled as { b64: string; counts: [number, number, number] };
    if (!b.b64 || !b.counts[0] && !b.counts[1] && !b.counts[2]) {
      setEnglishLists(emptyLists(['このビルドには英語の語彙一覧が入っていません']));
      return;
    }
    try {
      const bin = Uint8Array.from(atob(b.b64), (c) => c.charCodeAt(0));
      const DS = (globalThis as { DecompressionStream?: typeof DecompressionStream }).DecompressionStream;
      if (!DS) throw new Error('DecompressionStream unavailable');
      const stream = new Blob([bin]).stream().pipeThrough(new DS('gzip'));
      const text = await new Response(stream).text();
      setEnglishLists(unpackLists(JSON.parse(text) as PackedLists, [`bundled: vocab ${b.counts[0]}, phrases ${b.counts[1]}, grammar ${b.counts[2]}`]));
    } catch (e) {
      setEnglishLists(emptyLists([`語彙一覧を読み込めませんでした (${e instanceof Error ? e.message : e})`]));
    }
  })();
  return started;
}
