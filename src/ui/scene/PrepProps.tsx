/**
 * 始業前 as things in the room, never a paper on top: the door's 準備中 card is turned to 営業中 to open (the
 * tea house), a hanging 準備中 sign over the counter is turned to begin a shift (a workplace); the market basket
 * hangs by the door with the day's shopping note pinned above it; the town map on the wall leads out into the
 * town. On the first days the card carries a small label and a pulsing ring (a few beats, then still; under
 * reduced motion a still ring); the basket and the map always carry a small Japanese label.
 *
 * Motion: the card turns over (rotateY, --dur-base ≈ 320 ms, ease-out) and the action follows when it has
 * turned; under reduced motion the card's face changes at once (a short crossfade) and the action follows.
 */
import { useEffect, useRef, useState } from 'react';
import { marketAccess, marketDay, teaPart } from '../../activities/day';
import { jobDay } from '../../jobs/engine';
import { WordText } from '../components/WordText';
import { sfx } from '../sound';
import { useGame } from '../useGame';
import { useReducedMotion } from '../uiState';

/** The days on which the props carry a written hint (after that the room speaks for itself). */
export const HINT_DAYS = 3;

/**
 * A sign that is turned over to start working hours: 準備中 on the front, 営業中 on the back. `hint`: a pulsing
 * ring (a few beats) and `label` under it on the first days.
 */
export function OpenSign({
  onOpen,
  label,
  hint,
  sub,
  testid,
  className = '',
  aria,
}: {
  onOpen: () => void;
  label?: string | null;
  hint?: boolean;
  sub?: string;
  testid: string;
  className?: string;
  aria: string;
}) {
  const rm = useReducedMotion();
  const [turned, setTurned] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => () => void (timer.current && window.clearTimeout(timer.current)), []);
  return (
    <button
      type="button"
      className={`open-sign ${turned ? 'turned' : ''} ${hint && !turned ? 'hinting' : ''} ${rm ? 'rm' : ''} ${className}`}
      data-testid={testid}
      aria-label={aria}
      disabled={turned}
      onClick={() => {
        if (turned) return;
        setTurned(true);
        sfx('bell');
        timer.current = window.setTimeout(onOpen, rm ? 120 : 340);
      }}
    >
      <span className="os-string" aria-hidden />
      <span className="os-card" aria-hidden>
        <span className="os-face os-front">準備中</span>
        <span className="os-face os-back">営業中</span>
      </span>
      {sub ? <span className="os-sub hand">{sub}</span> : null}
      {label ? <span className="os-label hand">{label}</span> : null}
    </button>
  );
}

/** A small framed map of the town on the wall: out into the town (to work elsewhere today). */
export function TownMapProp({ onGo, className = '', label = '町へ' }: { onGo: () => void; className?: string; label?: string }) {
  return (
    <button type="button" className={`wall-map ${className}`} data-testid="to-town" aria-label="町へ出る（ほかの仕事場へ）" onClick={() => (sfx('steps'), onGo())}>
      <svg viewBox="0 0 80 60" className="wall-map-art" aria-hidden>
        <rect x="2" y="2" width="76" height="56" rx="2" fill="#f2e6c8" stroke="#6b4a2a" strokeWidth="4" />
        <path d="M50 4 C46 20 54 34 48 56" stroke="#5f9ab8" strokeWidth="5" fill="none" />
        <path d="M6 32 H74" stroke="#cdb48a" strokeWidth="4" />
        {[
          [12, 12],
          [26, 14],
          [14, 40],
          [30, 42],
          [58, 14],
          [64, 40],
        ].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="9" height="8" fill={['#b8573a', '#3d4a5a', '#7aa88a', '#d9b54a'][i % 4]} stroke="#3a2a1a" strokeWidth="1.2" />
        ))}
        <circle cx="66" cy="18" r="3" fill="#b8322a" />
      </svg>
      <span className="prop-label hand">{label}</span>
    </button>
  );
}

/** The tea house before opening: the door's card, the market basket under the day's note, the town map. */
export function ShopPrep({ mobile = false }: { mobile?: boolean }) {
  const g = useGame();
  const { progress, townDay } = g;
  const [why, setWhy] = useState<string | null>(null);
  if (!progress?.today || !progress.townDay || teaPart(progress) !== 0 || progress.today.phase === 'closed') return null;
  const acc = marketAccess(progress);
  const md = townDay?.market;
  const trips = md?.trips ?? 0;
  const town = !!jobDay(progress);
  const first = progress.day <= HINT_DAYS;
  const market = !!acc && marketDay(progress);
  return (
    <div className={`shop-prep ${mobile ? 'm' : 'd'}`} data-testid="prep-props">
      <OpenSign
        className="sp-door"
        testid="open-shop"
        aria="店を開ける（扉の札を「営業中」に返す）"
        hint={first}
        label={first ? '札を返して開店' : null}
        onOpen={() => g.day.openShop()}
      />
      {market && md && md.lines.length ? (
        <div className="sp-note" data-testid="shopping-note">
          <span className="sp-note-pin" aria-hidden />
          <div className="sp-note-title">
            <WordText text={md.title} />
          </div>
          <ul>
            {md.lines.map((l) => (
              <li key={l.good + (l.variant ?? '')}>
                <WordText text={l.text} />
              </li>
            ))}
          </ul>
          {md.tips.map((t) => (
            <p key={t} className="sp-note-tip">
              <WordText text={t} />
            </p>
          ))}
        </div>
      ) : null}
      {market ? (
        <button
          type="button"
          className="sp-basket"
          data-testid="go-market"
          aria-label={trips ? 'もう一度市場へ行く' : '市場へ買い出しに行く'}
          onClick={() => {
            sfx('steps');
            setWhy(g.day.goMarket());
          }}
        >
          <svg viewBox="0 0 90 80" className="sp-basket-art" aria-hidden>
            <path d="M18 34 Q45 -6 72 34" fill="none" stroke="#7a4a24" strokeWidth="5" />
            <path d="M8 34 H82 L74 74 H16 Z" fill="#c49a5e" stroke="#5a3418" strokeWidth="3" />
            {[0, 1, 2, 3].map((r) => (
              <path key={r} d={`M${10 + r * 2} ${44 + r * 8} H${80 - r * 2}`} stroke="#8a6436" strokeWidth="2" />
            ))}
            {[0, 1, 2, 3, 4, 5].map((c) => (
              <path key={c} d={`M${20 + c * 10} 36 L${22 + c * 9} 72`} stroke="#8a6436" strokeWidth="2" />
            ))}
          </svg>
          <span className="prop-label hand">{trips ? 'もう一度市場へ' : '市場へ'}</span>
        </button>
      ) : null}
      {town ? <TownMapProp className="sp-map" onGo={() => g.jobs.toTown()} /> : null}
      {why ? (
        <p className="sp-why hand" role="status">
          {why}
        </p>
      ) : null}
    </div>
  );
}
