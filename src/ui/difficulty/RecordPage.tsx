/**
 * 手帳 → 学習の記録: the measured indicators over the days, the current difficulty in words, the
 * controller's last decision and the qualification estimate history. Data: LangProgress.difficulty
 * (src/core/difficulty.ts, src/core/metrics.ts).
 */
import { describeDifficulty, examCount, levelName, PACES, planKnobs, WINDOW_DAYS } from '../../core/difficulty';
import { rollingRatio, series, windowStats } from '../../core/metrics';
import { useGame } from '../useGame';
import { LineChart, SERIES_COLOURS as C } from './Charts';
import './difficulty.css';

const pct = (v: number) => `${Math.round(v * 100)}%`;

export function RecordLeft({ onSettings }: { onSettings?: () => void }) {
  const { data, progress } = useGame();
  if (!data || !progress) return null;
  const d = progress.difficulty;
  const h = d?.history ?? [];
  const w = windowStats(h, WINDOW_DAYS);
  const k = planKnobs(data, progress);
  const lang = data.lang;
  const maxLv = examCount(lang);
  const est = series(h, (m) => m.est);
  const target = d?.target ?? null;
  // Scale to where the estimate actually is (a flat line under far-off levels says nothing).
  const estMax = Math.max(0, ...est.map((p) => p.v ?? 0));
  const estTop = Math.min(maxLv, Math.max(1, Math.ceil(estMax + 0.05)));
  const estTicks =
    estTop === 1
      ? [0, 0.5, 1].map((v) => ({ v, label: v === 0 ? '0' : v === 1 ? levelName(lang, 1).replace('英検', '') : '半分' }))
      : Array.from({ length: estTop + 1 }, (_, i) => ({ v: i, label: i === 0 ? '0' : levelName(lang, i).replace('英検', '') }));
  return (
    <div className="drec">
      <h2 className="page-heading">学習の記録</h2>
      <div className="drec-state">
        <div className="hand small muted">いまの難しさ</div>
        <div className="drec-main" data-testid="difficulty-state">
          {describeDifficulty(data, progress)}
        </div>
        <div className="hand small">
          始めた目安：{levelName(lang, d?.start ?? 0)}・進み方：{PACES[d?.pace ?? 'normal'].label}・自動調整：{d ? (d.adaptive ? 'あり' : 'なし') : 'あり'}
          {d?.adaptive && d.adj ? `（${d.adj < 0 ? 'ゆっくり側' : '速め側'} ${Math.round(Math.abs(d.adj) * 100)}%）` : ''}
        </div>
        {d?.lastReason ? <p className="hand small drec-reason">きのうの見直し：{d.lastReason}</p> : null}
        <div className="drec-tiles">
          <Tile label={`最近${w.days || WINDOW_DAYS}日の一回目の正解`} value={w.accuracy === null ? '—' : pct(w.accuracy)} />
          <Tile label="新しい言葉（1日の上限）" value={`${k.budget}語`} />
          <Tile label="お客さん／日" value={`${k.customers}人`} />
          <Tile label="1日の確定" value={w.days ? `${Math.round(w.confirmedPerDay * 10) / 10}語` : '—'} />
        </div>
        {onSettings ? (
          <button type="button" className="btn btn-small" onClick={onSettings} data-testid="open-level-from-record">
            レベル設定を開く
          </button>
        ) : null}
      </div>
      <LineChart
        title="資格の目安の推移"
        series={[{ key: 'est', label: '目安', colour: C.a, points: est }]}
        yMin={0}
        yMax={estTop}
        yTicks={estTicks}
        refLine={target && target <= estTop ? { v: target, label: `目標 ${levelName(lang, target)}` } : undefined}
        format={(v) => (v < 1 ? `${levelName(lang, 1)}の${Math.round(v * 100)}%` : `${levelName(lang, Math.floor(v))}＋${Math.round((v % 1) * 100)}%`)}
        note={`身についた語数を、資格の語彙一覧と比べた目安（80%で到達）。${target && target > estTop ? `目標の${levelName(lang, target)}はこの図の上の先です。` : ''}`}
      />
      {d?.changes.length ? (
        <div className="drec-changes">
          <div className="hand small muted">設定を変えた日</div>
          <ul>
            {d.changes.slice(-6).map((c, i) => (
              <li key={i} className="hand small">
                {c.day}日目：{levelName(lang, c.start)}・{PACES[c.pace].label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="drec-tile">
      <div className="drec-tile-v">{value}</div>
      <div className="drec-tile-l">{label}</div>
    </div>
  );
}

export function RecordRight() {
  const { progress } = useGame();
  if (!progress) return null;
  const h = progress.difficulty?.history ?? [];
  const R = 3;
  return (
    <div className="drec">
      <LineChart
        title="一回目でぴったり出せた割合（3日平均）"
        series={[
          { key: 'all', label: 'ぜんぶ', colour: C.main, points: rollingRatio(h, (m) => m.ftOk, (m) => m.ft, R) },
          { key: 'new', label: '新しい言葉入り', colour: C.a, points: rollingRatio(h, (m) => m.newOk, (m) => m.newN, R) },
          { key: 'rev', label: '復習', colour: C.b, points: rollingRatio(h, (m) => m.revOk, (m) => m.revN, R), dashed: true },
        ]}
        yMin={0}
        yMax={1}
        yTicks={[0, 0.5, 1].map((v) => ({ v, label: pct(v) }))}
        band={{ from: 0.6, to: 0.9, label: 'ちょうどよい帯' }}
        format={pct}
      />
      <LineChart title="その日に確定した言葉" series={[{ key: 'conf', label: '確定', colour: C.a, bars: true, points: series(h, (m) => m.conf) }]} format={(v) => `${Math.round(v)}語`} />
      <LineChart
        title="検証：確定1ページあたりの押印回数"
        series={[{ key: 'v', label: '押印／確定', colour: C.a, points: rollingRatio(h, (m) => m.vA, (m) => m.vS, R) }]}
        format={(v) => `${Math.round(v * 10) / 10}回`}
        empty="まだ検証ページを確定していません"
      />
      <LineChart
        title="市場と配達（3日平均）"
        series={[
          { key: 'm', label: '市場：メモどおり買えた', colour: C.a, points: rollingRatio(h, (m) => m.mOk, (m) => m.mN, R) },
          { key: 'd', label: '配達：うまく届いた', colour: C.b, points: rollingRatio(h, (m) => m.dOk, (m) => m.dN, R), dashed: true },
        ]}
        yMin={0}
        yMax={1}
        yTicks={[0, 0.5, 1].map((v) => ({ v, label: pct(v) }))}
        format={pct}
        empty="市場や配達はまだ始まっていません"
      />
      <LineChart
        title="復習の取りこぼし（期日の来た言葉のうち、間違えた割合・3日平均）"
        series={[{ key: 'l', label: '取りこぼし', colour: C.b, points: rollingRatio(h, (m) => m.lapsed, (m) => m.dueN, R) }]}
        yMin={0}
        yMax={1}
        yTicks={[0, 0.5, 1].map((v) => ({ v, label: pct(v) }))}
        format={pct}
      />
      <LineChart
        title="1人のお客さんにかかった時間"
        series={[{ key: 's', label: '秒', colour: C.a, points: series(h, (m) => (m.sec > 0 ? m.sec : null)) }]}
        format={(v) => `${Math.round(v)}秒`}
        empty="まだ測っていません"
      />
      <p className="hand small muted">※ 一回目の正解率は、同じお客さんへの「やり直し」を数えません。のぞき見 {h.reduce((s, m) => s + m.peeks, 0)} 回・やり直し {h.reduce((s, m) => s + m.retries, 0)} 回。</p>
    </div>
  );
}
