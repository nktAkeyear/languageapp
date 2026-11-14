/**
 * Which words belong to which job: statically, every word a job's content uses (its own lexicon,
 * its task / template / reaction / line texts, its things and bins); the tea house owns the
 * original game's words (shop, market, delivery, story, catalogue). Dynamically, words met in a
 * job's tasks are recorded in `JobsState.wordJobs` (the notebook's job filter uses both).
 */
import type { GameData } from '../core/gamedata';
import { tokenIds } from '../core/tokenize';
import type { JobContent, JobDef, TaskTemplate } from './types';

const PH = /\{[A-Za-z][A-Za-z0-9_]*\}/g;

/** All in-world texts of a job's content (template placeholders removed). */
export function jobContentTexts(jc: JobContent): string[] {
  const out: string[] = [jc.sign];
  for (const t of jc.tasks) {
    if (t.say) out.push(t.say);
    switch (t.arch) {
      case 'sort':
        out.push(...t.items.map((i) => i.text));
        break;
      case 'check':
        for (const d of t.docs) out.push(...(d.title ? [d.title] : []), ...(d.lines ?? []), ...(d.fields ?? []).flatMap((f) => [f.label, f.value]));
        out.push(...(t.fixOptions ?? []));
        break;
      case 'respond':
        out.push(...(t.msg.subject ? [t.msg.subject] : []), ...t.msg.lines, ...(t.options ?? []), ...(t.fields ?? []).flatMap((f) => [f.label, ...f.options]));
        if (t.slot) out.push(...t.slot.rows.map((r) => r.label), ...t.slot.cols.map((c) => c.label), ...t.slot.cells.filter((c) => c.busy).map((c) => c.busy!));
        break;
      default:
        break;
    }
  }
  for (const t of jc.templates) out.push(...templateTexts(t));
  for (const q of Object.values(jc.qa ?? {})) for (const x of q) out.push(x.q, x.a);
  out.push(...jc.reactions.map((r) => r.text), ...jc.lines.map((l) => l.text));
  for (const b of jc.sort?.bins ?? []) out.push(b.label, b.ref);
  if (jc.trade?.board) out.push(jc.trade.board);
  return out.map((s) => s.replace(PH, ' '));
}

export function templateTexts(t: TaskTemplate): string[] {
  const out: string[] = t.say ? [t.say] : [];
  if (t.arch === 'sort') out.push(...t.patterns.map((p) => p.text));
  if (t.arch === 'check') {
    out.push(...t.fields.flatMap((f) => [f.label, ...f.values]));
    for (const d of t.docs) out.push(...(d.title ? [d.title] : []), ...(d.lines ?? []));
  }
  if (t.arch === 'respond' && 'want' in t) {
    out.push(...t.want.map((w) => w.text), ...t.avoid.map((a) => a.text), ...t.busy, ...(t.open ?? []), ...(t.close ?? []), ...t.rows.map((r) => r.label), ...t.cols.map((c) => c.label));
  }
  return out;
}

const cache = new WeakMap<GameData, Map<string, Set<string>>>();

export function jobVocab(data: GameData, job: JobDef): Set<string> {
  let m = cache.get(data);
  if (!m) {
    m = new Map();
    cache.set(data, m);
  }
  const hit = m.get(job.id);
  if (hit) return hit;
  const s = new Set<string>();
  if (job.legacy) {
    const own = new Set<string>();
    for (const j of data.content.jobs ?? []) for (const e of j.content[data.lang]?.lexicon ?? []) own.add(e.id);
    for (const e of data.content.lexicon) if (!own.has(e.id)) s.add(e.id);
  } else {
    const jc = job.content[data.lang];
    if (jc) {
      for (const e of jc.lexicon) s.add(e.id);
      for (const t of jc.things) s.add(t.word);
      for (const v of [...(jc.make?.vessels ?? []), ...(jc.make?.methods ?? [])]) s.add(v.word);
      for (const txt of jobContentTexts(jc)) for (const id of tokenIds(data.tokens(txt))) s.add(id);
    }
  }
  m.set(job.id, s);
  return s;
}

/** Jobs a word belongs to (static content membership ∪ where it was met). */
export function wordJobs(data: GameData, met: Record<string, string[]> | undefined, id: string): string[] {
  const out = new Set(met?.[id] ?? []);
  for (const j of data.content.jobs ?? []) if (jobVocab(data, j).has(id)) out.add(j.id);
  return [...out];
}
