/**
 * The day's chrome that never covers the scene (v6):
 *
 * - DayParts: the day-part indicator (始業前 / 業務中 / 業務後) shown in every scene's HUD;
 * - NoticePin + NoticePanel: today's notices pinned in the scene (a paper on a nail with an unread mark) — the
 *   Japanese notes of the day (what opened, a new rank, what arrived) and the story cards that came with the
 *   morning (a chapter title, a visitor, a delivery note, a paper). Nothing opens by itself: the player opens
 *   the pin when they want; the panel sits at the side and never blocks the work;
 * - DayBanner: a one-line strip at the top when a day begins (and when ordered supplies arrive), which never
 *   takes a click and goes away by itself.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DAY_PARTS, dayPart } from '../../activities/day';
import type { GameData } from '../../core/gamedata';
import type { LangProgress } from '../../core/save';
import { deferredCards, sortedChapters } from '../../story/engine';
import { storyOf } from '../../story/text';
import { jobDay } from '../../jobs/engine';
import { personOf } from '../story/people';
import { sfx } from '../sound';
import { useGame } from '../useGame';
import { useMobile } from '../layout';
import { useStoryUi } from '../story/StoryUi';
import './daychrome.css';

const KANJI = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

/** The day-part indicator: 「N日目」 and the three parts with the current one marked. */
export function DayParts({ className = '', compact = false, vertical = false }: { className?: string; compact?: boolean; vertical?: boolean }) {
  const { progress } = useGame();
  if (!progress) return null;
  const part = progress.today ? dayPart(progress) : 0;
  const over = (jobDay(progress)?.part ?? 0) > 2;
  return (
    <div className={`dayparts ${compact ? 'dayparts-compact' : ''} ${vertical ? 'dayparts-vertical' : ''} ${className}`} data-testid="day-parts" data-part={part} aria-label={`${progress.day}日目・${DAY_PARTS[part]}`}>
      {vertical ? null : <span className="dp-day">{progress.day}日目</span>}
      <ol className="dp-list">
        {DAY_PARTS.map((n, i) => (
          <li key={n} className={`dp-part ${i === part && !over ? 'dp-cur' : i < part || over ? 'dp-done' : ''}`} aria-current={i === part && !over ? 'step' : undefined}>
            {n}
          </li>
        ))}
      </ol>
    </div>
  );
}

export interface NoticeItem {
  key: string;
  kind: 'note' | 'story';
  title: string;
  text?: string;
  /** Story cards: open the card (index in the queue) with this label. */
  open?: { index: number; label: string };
}

/** Today's notices: the day's Japanese notes and the story cards waiting in the scene. */
export function dayNotices(data: GameData, p: LangProgress): NoticeItem[] {
  const out: NoticeItem[] = [];
  const seen = new Set<string>();
  const notes = [...(p.today?.notes ?? []), ...(p.townDay?.day === p.day ? p.townDay.notes : []), ...(jobDay(p)?.notes ?? [])];
  for (const n of notes) {
    if (seen.has(n)) continue;
    seen.add(n);
    out.push({ key: `n:${p.day}:${n.slice(0, 40)}`, kind: 'note', title: n });
  }
  const story = storyOf(data);
  if (story)
    for (const { card, index } of deferredCards(p)) {
      if (card.kind === 'chapter') {
        const chs = sortedChapters(story);
        const i = Math.max(0, chs.findIndex((c) => c.id === card.chapter));
        const t = story.text.chapters[card.chapter];
        const aboveZero = p.stage > (data.stages[0]?.stage ?? 1);
        out.push({ key: `c:${card.chapter}`, kind: 'story', title: `第${KANJI[i]}章「${t?.titleJa ?? ''}」`, text: (aboveZero && t?.introAboveZeroJa) || t?.introJa, open: { index, label: '章の扉を見る' } });
      } else if (card.kind === 'doc') {
        const t = story.text.docs[card.doc];
        out.push({ key: `d:${card.doc}`, kind: 'story', title: `「${t?.titleJa ?? '書類'}」が届いている`, text: '書類箱に入っている。', open: { index, label: '手に取る' } });
      } else if (card.kind === 'scene') {
        const b = story.shared.beats.find((x) => x.id === card.beat);
        const t = story.text.beats[card.beat];
        if (card.request) out.push({ key: `r:${card.beat}`, kind: 'story', title: '戸口に置き手紙がある（配達の頼み）', open: { index, label: '読む' } });
        else {
          const lines = (card.outcome === 'good' && t?.linesGood) || (card.outcome === 'poor' && t?.linesPoor) || t?.lines || [];
          const someone = lines.some((l) => 'say' in l) || !!b?.choice?.length;
          const who = b && someone ? personOf(data, story, b.character).name : '';
          out.push({ key: `s:${card.beat}`, kind: 'story', title: who ? `${who}が来ている` : '朝のできごと', open: { index, label: who ? '話を聞く' : '見る' } });
        }
      } else if (card.kind === 'reply') {
        out.push({ key: `y:${card.beat}`, kind: 'story', title: 'つづきの話', open: { index, label: '聞く' } });
      }
    }
  return out;
}

const READ_KEY = 'minato-chabou-notices-read';

function loadRead(lang: string, day: number): string[] {
  try {
    const all = JSON.parse(localStorage.getItem(READ_KEY) ?? '{}') as Record<string, { day: number; keys: string[] }>;
    const r = all[lang];
    return r && r.day === day ? r.keys : [];
  } catch {
    return [];
  }
}

function saveRead(lang: string, day: number, keys: string[]): void {
  try {
    const all = JSON.parse(localStorage.getItem(READ_KEY) ?? '{}') as Record<string, { day: number; keys: string[] }>;
    all[lang] = { day, keys };
    localStorage.setItem(READ_KEY, JSON.stringify(all));
  } catch {
    /* per-browser convenience only */
  }
}

/** Today's notices with their unread state (notes: read once the panel showed them; story cards: until opened). */
export function useNotices() {
  const g = useGame();
  const { data, progress, lang } = g;
  const day = progress?.day ?? 0;
  const [read, setRead] = useState<string[]>(() => (lang ? loadRead(lang, day) : []));
  useEffect(() => {
    if (lang) setRead(loadRead(lang, day));
  }, [lang, day]);
  const items = useMemo(() => (data && progress ? dayNotices(data, progress) : []), [data, progress]);
  const unread = items.filter((i) => i.kind === 'story' || !read.includes(i.key)).length;
  const markRead = () => {
    if (!lang) return;
    const keys = [...new Set([...read, ...items.filter((i) => i.kind === 'note').map((i) => i.key)])];
    setRead(keys);
    saveRead(lang, day, keys);
  };
  return { items, unread, read, markRead };
}

/** The notice pinned in the scene: a paper on a nail with the number of unread notices. */
export function NoticePin({ className = '' }: { className?: string }) {
  const n = useNotices();
  const [open, setOpen] = useState(false);
  if (!n.items.length) return null;
  return (
    <>
      <button
        type="button"
        className={`notice-pin ${n.unread ? 'notice-unread' : ''} ${className}`}
        onClick={() => {
          sfx('paper');
          setOpen(!open);
        }}
        aria-expanded={open}
        aria-label={`今日の知らせ${n.unread ? `（まだ読んでいないもの ${n.unread}）` : ''}`}
        data-testid="notice-pin"
      >
        <span className="np-nail" aria-hidden />
        <span className="np-paper" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="np-label">知らせ</span>
        {n.unread ? (
          <span className="np-dot" data-testid="notice-unread">
            {n.unread}
          </span>
        ) : null}
      </button>
      {open ? <NoticePanel n={n} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

/** The notices, at the side of the screen (non-modal: the scene stays usable). */
export function NoticePanel({ n, onClose }: { n: ReturnType<typeof useNotices>; onClose: () => void }) {
  const g = useGame();
  const su = useStoryUi();
  const mobile = useMobile();
  const marked = useRef(false);
  useEffect(() => {
    if (!marked.current) {
      marked.current = true;
      n.markRead();
    }
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const panel = (
    <aside className={`notice-panel ${mobile ? 'notice-sheet' : ''}`} aria-label="今日の知らせ" data-testid="notice-panel">
      <div className="np-head">
        <span className="np-title">今日の知らせ</span>
        <button type="button" className="np-x" onClick={onClose} aria-label="閉じる" data-testid="notice-close">
          ×
        </button>
      </div>
      {n.items.length ? null : <p className="np-empty hand">今日の知らせはない。</p>}
      <ul className="np-items">
        {n.items.map((it) => (
          <li key={it.key} className={`np-item np-${it.kind} ${it.kind === 'note' && !n.read.includes(it.key) ? 'np-new' : ''}`}>
            <p className="np-text">{it.title}</p>
            {it.text ? <p className="np-sub">{it.text}</p> : null}
            {it.open ? (
              <button
                type="button"
                className="btn btn-small np-open"
                data-testid="notice-open"
                onClick={() => {
                  sfx('pickup');
                  su.closeBox();
                  g.openStoryCard(it.open!.index);
                  onClose();
                }}
              >
                {it.open.label}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </aside>
  );
  return createPortal(panel, document.body);
}

/**
 * A one-line strip at the top: the day and its part when a day begins (with the chapter's title or how many
 * notices are pinned), and supplies arriving during working hours. Never takes a click; it goes by itself.
 */
export function DayBanner() {
  const g = useGame();
  const { data, progress, lang } = g;
  const [show, setShow] = useState<{ id: string; text: string } | null>(null);
  const shown = useRef(new Set<string>());
  const arrived = progress?.townDay?.arrived?.length ?? 0;
  const dayKey = progress && lang ? `${lang}:${progress.day}` : '';
  // Not while the night's ledger is still open (the next day is already planned behind it).
  const night = !!progress?.story?.cards.some((c) => c.kind === 'ledger');
  const atStart = !!progress && !night && progress.today?.phase !== 'closed' && dayPart(progress) === 0;
  useEffect(() => {
    if (!data || !progress || !dayKey || !atStart || shown.current.has(dayKey)) return;
    shown.current.add(dayKey);
    const items = dayNotices(data, progress);
    const ch = items.find((i) => i.key.startsWith('c:'));
    const tail = ch ? `　${ch.title}` : items.length ? `　知らせ ${items.length} 件（📌 から読める）` : '';
    setShow({ id: dayKey, text: `${progress.day}日目・始業前${tail}` });
  }, [dayKey, atStart]); // eslint-disable-line react-hooks/exhaustive-deps
  const prevArrived = useRef(arrived);
  useEffect(() => {
    if (arrived > prevArrived.current) {
      sfx('bell');
      setShow({ id: `a${arrived}:${dayKey}`, text: '注文した品が届いた。棚に並べた。' });
    }
    prevArrived.current = arrived;
  }, [arrived]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!show) return;
    const t = window.setTimeout(() => setShow(null), 5200);
    return () => clearTimeout(t);
  }, [show]);
  if (!show) return null;
  return (
    <div key={show.id} className="day-banner" role="status" aria-live="polite" data-testid="day-banner">
      {show.text}
    </div>
  );
}
