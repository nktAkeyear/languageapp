/**
 * Papers as the documents they are: an invoice (letterhead band, ruled table, the total double-underlined), an
 * order form (boxed fields), the inn's register book (ruled page, handwritten entries), a letter (cream paper,
 * handwriting), a notice pinned to the board, an index card, a parcel tag on its string, an e-mail on a screen,
 * a recipe card. In-world text only (target language); the marks the player makes are drawn: a red pen circle
 * round a line, a rubber-stamp imprint (✓ / ✗, no words).
 */
import type { ReactNode } from 'react';
import type { CheckDoc } from '../../jobs/types';
import { WordText } from '../components/WordText';

export type PaperKind = CheckDoc['kind'] | 'email' | 'memo' | 'phone' | 'recipe' | 'menu';

/** A red pen ellipse drawn round its parent (the circled line). */
export function PenCircle({ tone = 'red' }: { tone?: 'red' | 'green' }) {
  return (
    <svg className={`pen-circle pen-${tone}`} viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden>
      <path d="M 38 4 A 47 17 0 1 1 26 6 L 40 2" pathLength={100} />
    </svg>
  );
}

/** A rubber-stamp imprint: a ring with a tick (approved) or a cross (sent back). */
export function StampMark({ ok }: { ok: boolean }) {
  return (
    <svg className={`stamp-mark ${ok ? 'ok' : 'ng'}`} viewBox="0 0 80 80" aria-hidden>
      <circle cx="40" cy="40" r="34" />
      <circle cx="40" cy="40" r="28" className="inner" />
      {ok ? <path d="M24 42 l11 11 l22 -26" /> : <path d="M27 27 L53 53 M53 27 L27 53" />}
    </svg>
  );
}

export interface PaperField {
  id: string;
  label: string;
  value: string;
}

export interface PaperProps {
  kind: PaperKind;
  title?: string;
  fields?: PaperField[];
  lines?: string[];
  /** Extra header lines (an e-mail's From / Subject). */
  head?: { from?: string; subject?: string };
  /** The paper the player checks (its lines can be circled). */
  target?: boolean;
  /** The circled line, the line found wrong after the result. */
  marked?: string | null;
  truth?: string | null;
  /** Stamp imprint after handing in. */
  stamped?: 'ok' | 'ng' | null;
  onField?: (id: string) => void;
  disabled?: boolean;
  /** Words in lines are clickable (gloss / notebook). */
  interactiveLines?: boolean;
  children?: ReactNode;
  className?: string;
  dataDoc?: number;
}

const BIG = new Set(['total', 'refund']);

export function Paper(p: PaperProps) {
  const kind = p.kind;
  const fieldRow = (f: PaperField) => {
    const mark = p.marked === f.id;
    const truth = p.truth === f.id;
    const inner = (
      <>
        <span className="pp-label">
          <WordText text={f.label} interactive={false} />
        </span>
        <span className="pp-lead" aria-hidden />
        <span className="pp-value">
          <WordText text={f.value} interactive={false} />
        </span>
        {mark ? <PenCircle /> : null}
        {truth && !mark ? <PenCircle tone="green" /> : null}
      </>
    );
    const cls = `pp-field ${BIG.has(f.id) ? 'pp-total' : ''} ${mark ? 'marked' : ''} ${truth ? 'truth' : ''}`;
    return p.target && p.onField ? (
      <button key={f.id} type="button" className={cls} disabled={p.disabled} onClick={() => p.onField!(f.id)} data-field={f.id} aria-pressed={mark}>
        {inner}
      </button>
    ) : (
      <div key={f.id} className={cls} data-field-ref={f.id}>
        {inner}
      </div>
    );
  };
  return (
    <div className={`jpaper paper-${kind} ${p.target ? 'target' : ''} ${p.className ?? ''}`} data-doc={p.dataDoc} lang="en">
      {kind === 'note' || kind === 'memo' ? <span className="pp-pin" aria-hidden /> : null}
      {kind === 'label' ? <span className="pp-hole" aria-hidden /> : null}
      {kind === 'email' ? (
        <div className="pp-mailbar" aria-hidden>
          <span />
          <span />
          <span />
        </div>
      ) : null}
      {p.head?.from || p.head?.subject ? (
        <div className="pp-mailhead">
          {p.head.from ? (
            <div>
              <b>From:</b> <WordText text={p.head.from} interactive={false} />
            </div>
          ) : null}
          {p.head.subject ? (
            <div>
              <b>Subject:</b> <WordText text={p.head.subject} interactive={false} />
            </div>
          ) : null}
        </div>
      ) : null}
      {p.title ? (
        <div className="pp-title">
          <WordText text={p.title} interactive={false} />
        </div>
      ) : null}
      {(p.lines ?? []).length ? (
        <div className="pp-lines">
          {(p.lines ?? []).map((l, i) =>
            l.trim() ? (
              <p key={i} className="pp-line">
                <WordText text={l} interactive={p.interactiveLines !== false} />
              </p>
            ) : null,
          )}
        </div>
      ) : null}
      {(p.fields ?? []).length ? <div className="pp-fields">{(p.fields ?? []).map(fieldRow)}</div> : null}
      {p.children}
      {p.stamped ? <StampMark ok={p.stamped === 'ok'} /> : null}
    </div>
  );
}

/** Which kind of paper a message is. */
export function msgPaperKind(kind: string): PaperKind {
  return kind === 'email' ? 'email' : kind === 'memo' ? 'memo' : kind === 'letter' ? 'letter' : kind === 'phone' ? 'phone' : 'note';
}

/** A request that is really a card / board / note ("Recipe card: …", "Menu: …", "A note from the chef: …"). */
export function paperFromSay(say: string): { kind: PaperKind; title: string; lines: string[] } | null {
  const m = /^(Recipe card|Recipe|Menu|A note from the chef|The chef says)\s*:\s*(.*)$/s.exec(say.trim());
  if (!m) return null;
  const kind: PaperKind = m[1].startsWith('Recipe') ? 'recipe' : m[1] === 'Menu' ? 'menu' : 'note';
  const body = m[2]
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return { kind, title: m[1], lines: body };
}
