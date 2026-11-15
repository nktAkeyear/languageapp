/* Simulator helper: print and close the story cards (scenes, choices, documents, ledger). */
import type { GameData } from '../src/core/gamedata';
import { plain } from '../src/core/gamedata';
import type { LangProgress } from '../src/core/save';
import { beatById, cardNeedsChoice, docLines, storyChoose, storyDismiss, storyOpen, storyState } from '../src/story/engine';
import { storyOf } from '../src/story/text';

export function storyLog(data: GameData, p: LangProgress, choice: number): void {
  const story = storyOf(data);
  if (!story) return;
  const st = storyState(p);
  for (let i = 0; i < 40 && st.cards.length; i++) {
    if (st.cards[0].deferred) storyOpen(p, 0); // waiting in the scene: the player opens it
    const c = st.cards[0];
    if (c.kind === 'chapter') console.log(`  📖 ── ${story.text.chapters[c.chapter]?.titleJa} ──`);
    else if (c.kind === 'doc') console.log(`  📖 document ${c.doc}: ${docLines(data, p, c.doc).map(plain).join(' / ')}`);
    else if (c.kind === 'ledger') {
      const l = c.ledger;
      console.log(
        `  📖 ledger: +${l.takings} −${l.expenses} = ${l.money} coins, rep ${l.repDelta >= 0 ? '+' : ''}${l.repDelta}, met ${l.met.join(',') || '-'}, confirmed ${l.confirmed.length}${l.hooks.length ? `, 「${l.hooks.join(' / ')}」` : ''}`,
      );
    } else if (c.kind === 'reply') {
      const t = story.text.beats[c.beat]?.options?.[c.option];
      console.log(`  📖   → "${plain(t?.text ?? '')}"  ${plain(t?.reply ?? '')}`);
    } else {
      const t = story.text.beats[c.beat];
      const b = beatById(story, c.beat);
      if (c.request) console.log(`  📖 ${c.beat} (delivery request): ${plain(t?.request ?? '')}`);
      else {
        const lines = (c.outcome === 'good' && t?.linesGood) || (c.outcome === 'poor' && t?.linesPoor) || t?.lines || [];
        const said = lines.map((l) => ('say' in l ? plain(l.say) : `（${l.ja}）`)).join(' ');
        console.log(`  📖 ${c.beat}${c.outcome ? ` [${c.outcome}]` : ''}: ${said}${t?.prompt ? `  ❓ ${plain(t.prompt)}` : ''}`);
      }
      if (cardNeedsChoice(data, p) && b?.choice) {
        storyChoose(data, p, b.choice[choice % b.choice.length].id);
        continue;
      }
    }
    storyDismiss(data, p);
  }
}
