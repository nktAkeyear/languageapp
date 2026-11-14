/**
 * Small hand-drawn-looking SVG charts for the 学習の記録 page (no libraries). One y-axis per chart,
 * thin 2px lines, ≥ 8px markers on the last point, a crosshair + readout on hover / tap, a legend
 * whenever there are two or more series, and a table view (<details>) for every chart.
 */
import { useState, type ReactNode } from 'react';

export const SERIES_COLOURS = { main: '#3a2e22', a: '#2f5f9e', b: '#d0782f' };

export interface Series {
  key: string;
  label: string;
  colour: string;
  points: { day: number; v: number | null }[];
  /** Draw as bars instead of a line. */
  bars?: boolean;
  dashed?: boolean;
}

export interface ChartProps {
  title: string;
  series: Series[];
  /** y range; default [0, max]. */
  yMin?: number;
  yMax?: number;
  /** Labelled y ticks (value → text). */
  yTicks?: { v: number; label: string }[];
  /** Shaded band (e.g. the controller's comfortable zone). */
  band?: { from: number; to: number; label: string };
  /** Horizontal reference line (not `ref`: React reserves that prop). */
  refLine?: { v: number; label: string };
  format?: (v: number) => string;
  empty?: string;
  note?: ReactNode;
}

const W = 320;
const H = 120;
const PAD = { l: 34, r: 10, t: 10, b: 20 };

export function LineChart({ title, series, yMin = 0, yMax, yTicks, band, refLine, format = (v) => String(Math.round(v * 10) / 10), empty = 'まだ記録がありません', note }: ChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const days = [...new Set(series.flatMap((s) => s.points.map((p) => p.day)))].sort((a, b) => a - b);
  const vals = series.flatMap((s) => s.points.map((p) => p.v)).filter((v): v is number => v !== null);
  if (!days.length || !vals.length)
    return (
      <figure className="dchart">
        <figcaption className="dchart-title">{title}</figcaption>
        <p className="hand small muted">{empty}</p>
      </figure>
    );
  const top = yMax ?? Math.max(1, ...vals, refLine?.v ?? 0) * 1.1;
  const d0 = days[0];
  const d1 = Math.max(days[days.length - 1], d0 + 1);
  const x = (d: number) => PAD.l + ((d - d0) / (d1 - d0)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - (v - yMin) / (top - yMin || 1)) * (H - PAD.t - PAD.b);
  const ticks = yTicks ?? [yMin, (yMin + top) / 2, top].map((v) => ({ v, label: format(v) }));
  const step = (W - PAD.l - PAD.r) / Math.max(1, d1 - d0);
  const barSeries = series.filter((s) => s.bars);
  const barW = Math.max(2, Math.min(10, step / Math.max(1, barSeries.length) - 2));
  const hoverDay = hover !== null ? days[hover] : null;
  return (
    <figure className="dchart">
      <figcaption className="dchart-title">{title}</figcaption>
      {series.length > 1 ? (
        <div className="dchart-legend">
          {series.map((s) => (
            <span key={s.key}>
              <i style={{ background: s.colour }} className={s.dashed ? 'dashed' : ''} />
              {s.label}
            </span>
          ))}
        </div>
      ) : null}
      <div className="dchart-read hand small" aria-live="polite">
        {hoverDay !== null
          ? `${hoverDay}日目：` +
            series
              .map((s) => {
                const p = s.points.find((q) => q.day === hoverDay);
                return `${series.length > 1 ? s.label + ' ' : ''}${p && p.v !== null ? format(p.v) : '—'}`;
              })
              .join('・')
          : ' '}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="dchart-svg" role="img" aria-label={title} onPointerLeave={() => setHover(null)}>
        {band ? (
          <g>
            <rect x={PAD.l} width={W - PAD.l - PAD.r} y={y(Math.min(top, band.to))} height={Math.max(0, y(band.from) - y(Math.min(top, band.to)))} className="dchart-band" />
            <text x={PAD.l + 3} y={y(band.from) - 3} className="dchart-bandlabel">
              {band.label}
            </text>
          </g>
        ) : null}
        {ticks.map((t) => (
          <g key={t.v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t.v)} y2={y(t.v)} className="dchart-grid" />
            <text x={PAD.l - 4} y={y(t.v) + 3} textAnchor="end" className="dchart-tick">
              {t.label}
            </text>
          </g>
        ))}
        <line x1={PAD.l} x2={W - PAD.r} y1={y(yMin)} y2={y(yMin)} className="dchart-axis" />
        {[d0, d1].map((d) => (
          <text key={d} x={x(d)} y={H - 5} textAnchor={d === d0 ? 'start' : 'end'} className="dchart-tick">
            {d}日目
          </text>
        ))}
        {refLine ? (
          <g>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(refLine.v)} y2={y(refLine.v)} className="dchart-ref" />
            <text x={PAD.l + 3} y={y(refLine.v) - 3} className="dchart-reflabel">
              {refLine.label}
            </text>
          </g>
        ) : null}
        {barSeries.map((s, si) =>
          s.points.map((p) =>
            p.v === null || p.v <= yMin ? null : (
              <rect
                key={`${s.key}${p.day}`}
                x={x(p.day) - (barW * barSeries.length) / 2 + si * (barW + 1)}
                width={barW}
                y={y(p.v)}
                height={Math.max(0, y(yMin) - y(p.v))}
                rx={Math.min(2, barW / 2)}
                fill={s.colour}
              />
            ),
          ),
        )}
        {series
          .filter((s) => !s.bars)
          .map((s) => {
            const segs: string[] = [];
            let cur = '';
            for (const p of s.points) {
              if (p.v === null) {
                if (cur) segs.push(cur);
                cur = '';
                continue;
              }
              cur += `${cur ? 'L' : 'M'}${x(p.day).toFixed(1)},${y(p.v).toFixed(1)}`;
            }
            if (cur) segs.push(cur);
            const last = [...s.points].reverse().find((p) => p.v !== null);
            return (
              <g key={s.key}>
                {segs.map((d, i) => (
                  <path key={i} d={d} fill="none" stroke={s.colour} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={s.dashed ? '4 3' : undefined} />
                ))}
                {last && last.v !== null ? <circle cx={x(last.day)} cy={y(last.v)} r={4} fill={s.colour} stroke="#fbf5e6" strokeWidth={2} /> : null}
              </g>
            );
          })}
        {hoverDay !== null ? <line x1={x(hoverDay)} x2={x(hoverDay)} y1={PAD.t} y2={H - PAD.b} className="dchart-cross" /> : null}
        {days.map((d, i) => (
          <rect key={d} x={x(d) - step / 2} width={Math.max(step, 6)} y={0} height={H} fill="transparent" onPointerEnter={() => setHover(i)} onPointerDown={() => setHover(i)} />
        ))}
      </svg>
      {note ? <div className="hand small muted">{note}</div> : null}
      <details className="dchart-table">
        <summary className="small muted">表で見る</summary>
        <table>
          <thead>
            <tr>
              <th>日</th>
              {series.map((s) => (
                <th key={s.key}>{s.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d}>
                <td>{d}</td>
                {series.map((s) => {
                  const p = s.points.find((q) => q.day === d);
                  return <td key={s.key}>{p && p.v !== null ? format(p.v) : '—'}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
