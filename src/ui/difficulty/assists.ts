/**
 * Pure helpers for the 手帳助け (assists) chosen in レベル設定 (src/core/difficulty.ts).
 * Kept free of React / scene imports so low-level components (WordText, VerifyPage) can use them.
 */
import type { LangProgress } from '../../core/save';

/**
 * Is the pinyin shown over this word? The per-language assist wins when set
 * (always / only unconfirmed words / never); otherwise 設定's 「ピンインを表示する」.
 */
export function pinyinShown(showPinyin: boolean, p: LangProgress | null | undefined, wordId: string | undefined): boolean {
  const mode = p?.difficulty?.assists.pinyin;
  if (!mode) return showPinyin;
  if (mode === 'always') return true;
  if (mode === 'never') return false;
  return !(wordId && p?.words[wordId]?.confirmed);
}
