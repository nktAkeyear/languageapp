/**
 * Moving through the day: a short full-screen passage of light between the segments (morning
 * market → shop at midday → afternoon delivery), dusk when the shop closes for the night, and
 * dawn when the lamp has been blown out and the next day begins. Purely presentational; it
 * never blocks input and is skipped with prefers-reduced-motion.
 */
import { useEffect, useRef, useState } from 'react';
import { currentSegment } from '../../activities/day';
import { jobView } from '../../jobs/engine';
import type { ActivityKind } from '../../core/townTypes';
import { skyAt } from '../art/sky';
import { sfx } from '../sound';
import { useGame } from '../useGame';
import { useUi } from '../uiState';

type Kind = 'dawn' | 'seg' | 'dusk';
const SEG: Record<ActivityKind, { label: string; sub: string; t: number }> = {
  market: { label: '朝', sub: '市場へ', t: 0.04 },
  shop: { label: '昼', sub: '茶房を開ける', t: 0.35 },
  delivery: { label: '夕方', sub: '配達へ', t: 0.72 },
};

export function DayTransition() {
  const g = useGame();
  const ui = useUi();
  const p = g.progress;
  const night = !!p?.story?.cards.some((c) => c.kind === 'ledger');
  const seg = p ? currentSegment(p) : 'shop';
  const key = !p || !g.lang ? null : `${g.lang}|${night ? 'night' : `${p.day}:${seg}`}`;
  const prev = useRef(key);
  const [show, setShow] = useState<{ id: number; kind: Kind; label: string; sub: string; t: number } | null>(null);
  const n = useRef(0);
  useEffect(() => {
    const was = prev.current;
    prev.current = key;
    if (!was || !key || was === key || ui.reducedMotion) return;
    if (was.split('|')[0] !== key.split('|')[0]) return; // language switch
    const a = was.split('|')[1];
    const b = key.split('|')[1];
    // A new chapter opens the morning with its own title card over the harbour: no dawn passage on
    // top of it (it would hide the card for its first seconds).
    if (b !== 'night' && p?.story?.cards[0]?.kind === 'chapter') return;
    let next: { kind: Kind; label: string; sub: string; t: number };
    if (b === 'night') next = { kind: 'dusk', label: '夜', sub: '店じまい', t: 1 };
    else if (a === 'night' || a.split(':')[0] !== b.split(':')[0])
      next = { kind: 'dawn', label: `${p!.day}日目`, sub: `朝・${p && jobView(p) === 'hub' ? '町へ出る' : seg === 'market' ? '市場へ' : '茶房を開ける'}`, t: 0 };
    else next = { kind: 'seg', ...SEG[seg] };
    n.current++;
    setShow({ id: n.current, ...next });
    sfx(next.kind === 'dawn' ? 'dawn' : next.kind === 'dusk' ? 'dusk' : 'whoosh');
    const timer = window.setTimeout(() => setShow(null), next.kind === 'dawn' ? 2100 : 1500);
    return () => clearTimeout(timer);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!show) return null;
  const sky = show.kind === 'dusk' ? { top: 'rgb(30,30,70)', bottom: 'rgb(200,110,80)' } : skyAt(show.t);
  return (
    <div key={show.id} className={`tr tr-${show.kind}`} aria-hidden data-testid="transition">
      <div className="tr-sky" style={{ background: `linear-gradient(${sky.top}, ${sky.bottom})` }} />
      <svg viewBox="0 0 400 220" className="tr-arc">
        <path d="M20 200 A180 180 0 0 1 380 200" stroke="#fff" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="4 8" fill="none" />
        <g transform={`translate(${200 + Math.cos(((180 - show.t * 180) * Math.PI) / 180) * 180} ${200 - Math.max(0.12, Math.sin(((180 - show.t * 180) * Math.PI) / 180)) * 180})`}>
          <g className="tr-sun">
            <circle cx="0" cy="0" r={show.kind === 'dusk' ? 14 : 18} fill={show.kind === 'dusk' ? '#f4f0dc' : '#fff4c8'} />
            <circle cx="0" cy="0" r="34" fill="#fff4c8" opacity={show.kind === 'dusk' ? 0.1 : 0.25} />
            {show.kind === 'dusk' ? <circle cx="6" cy="-4" r="12" fill="rgb(40,40,80)" /> : null}
          </g>
        </g>
        <path d="M0 200 Q100 176 200 196 Q300 178 400 200 L400 220 L0 220 Z" fill="#2a160a" opacity="0.5" />
      </svg>
      <div className="tr-label">
        <span className="tr-big">{show.label}</span>
        <span className="tr-sub">{show.sub}</span>
      </div>
    </div>
  );
}
