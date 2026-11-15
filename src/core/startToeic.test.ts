import { beforeAll, describe, expect, it } from 'vitest';
import { CONTENT, SHARED } from '../content';
import { buildGameData, type GameData } from './gamedata';
import { applyStartLevel, START_TOEIC, startWords, wordLevel } from './difficulty';
import { newProgress } from './save';
import { loadEnglishListsFromDisk } from '../curriculum/node';
import { withLists } from '../curriculum/apply';
import { listsLoaded } from '../curriculum/lists';

let data: GameData;
beforeAll(() => {
  loadEnglishListsFromDisk();
  data = buildGameData(withLists(CONTENT.en), SHARED);
});

describe('a start chosen as a TOEIC band assumes words by their TOEIC band', () => {
  it('every band seeds exactly the words of its band and below (〜860 and 〜990 differ), nothing confirmed or sealed', () => {
    if (!listsLoaded()) return; // without data/english the bands fall back to the 英検 equivalents
    const sizes: number[] = [];
    for (const { band } of START_TOEIC) {
      const p = newProgress('en');
      applyStartLevel(data, p, 0, { toeic: band });
      const seeded = Object.entries(p.words).filter(([, w]) => w.seeded).map(([id]) => id);
      const want = data.content.lexicon.filter((e) => e.toeic && e.toeic <= band).map((e) => e.id);
      // every word of the band and below is assumed (the few untagged words follow the 英検 equivalent)
      for (const id of want) expect(seeded, `${band} ${id}`).toContain(id);
      for (const id of seeded) {
        const e = data.lex.byId.get(id)!;
        if (e.toeic) expect(e.toeic, `${band} ${id}`).toBeLessThanOrEqual(band);
      }
      expect(Object.values(p.words).some((w) => w.confirmed)).toBe(false);
      expect(Object.values(p.verification).some((v) => v.solved)).toBe(false);
      expect(p.difficulty!.startToeic).toBe(band);
      sizes.push(seeded.length);
    }
    // strictly more words for each higher band
    for (let i = 1; i < sizes.length; i++) expect(sizes[i], `band ${START_TOEIC[i].band}`).toBeGreaterThan(sizes[i - 1]);
    expect(startWords(data, 6, 860).length).toBeLessThan(startWords(data, 7, 990).length);
  });

  it('changing between bands is exact: down takes back the higher band’s words, up seeds them', () => {
    if (!listsLoaded()) return;
    const p = newProgress('en');
    applyStartLevel(data, p, 0, { toeic: 990 });
    const hi = Object.values(p.words).filter((w) => w.seeded).length;
    applyStartLevel(data, p, 0, { toeic: 860 });
    const mid = Object.entries(p.words).filter(([, w]) => w.seeded);
    expect(mid.length).toBeLessThan(hi);
    for (const [id] of mid) expect(data.lex.byId.get(id)!.toeic ?? 0).toBeLessThanOrEqual(860);
    applyStartLevel(data, p, 0, { toeic: 990 });
    expect(Object.values(p.words).filter((w) => w.seeded).length).toBe(hi);
  });

  it('a 英検 start still seeds by 英検 grade', () => {
    const p = newProgress('en');
    applyStartLevel(data, p, 5);
    const seeded = Object.entries(p.words).filter(([, w]) => w.seeded).map(([id]) => data.lex.byId.get(id)!);
    expect(seeded.length).toBeGreaterThan(0);
    expect(seeded.every((e) => wordLevel('en', e) >= 1 && wordLevel('en', e) <= 5)).toBe(true);
  });
});
