/**
 * 現在地 with two yardsticks (en): progress per 英検 grade and per TOEIC band, computed against the
 * compiled lists (data/english) — mastered ÷ list size, with the ceiling the playable content can
 * currently teach drawn as a dashed mark — overall or for one job (its domains and its words).
 * Honest about what is not covered. Also the per-job table for 学習の記録.
 */
import { useMemo, useState } from 'react';
import { yardstickReport, type StepRow, type YardstickReport } from '../../curriculum/curriculum';
import { listsLoaded, englishLists } from '../../curriculum/lists';
import { yardstickOf, jobsOf, rankName, rankStatus } from '../../jobs/engine';
import { jobVocab } from '../../jobs/vocab';
import type { Yardstick } from '../../curriculum/yardsticks';
import { useGame } from '../useGame';

type Mode = Yardstick | 'both';

function StepBar({ row }: { row: StepRow }) {
  const r = (x: number) => `${Math.round(x * 1000) / 10}%`;
  return (
    <div className="ys-row" data-step={row.key}>
      <span className="ys-label">{row.label}</span>
      <span className="ys-track" role="progressbar" aria-valuenow={Math.round(row.ratio * 100)} aria-valuemin={0} aria-valuemax={100}>
        <span className="ys-ceil" style={{ width: r(row.ceiling) }} />
        <span className="ys-fill" style={{ width: row.mastered ? `max(${r(row.ratio)}, 2px)` : '0' }} />
      </span>
      <span className="ys-num" title={`身についた ${row.mastered}／一覧 ${row.list}（ゲームで学べる ${row.inGame}）`}>
        {row.mastered}/{row.list}
        <span className="ys-in">（学べる {row.inGame}）</span>
      </span>
    </div>
  );
}

function Report({ rep, title }: { rep: YardstickReport; title: string }) {
  return (
    <div className="ys-report" data-testid={`ys-${rep.yardstick}`}>
      <h4 className="hand">{title}</h4>
      {rep.rows.map((r) => (
        <StepBar key={r.key} row={r} />
      ))}
      {rep.fromLists ? (
        <p className="hand small muted ys-foot">
          濃い帯＝身についた語、点線の枠＝このゲームで今学べる語（一覧のうち）。それより右は、まだどの仕事にも出てこない語です。
          {rep.phrases.list ? ` 決まり文句 ${rep.phrases.inGame}/${rep.phrases.list}・文法 ${rep.grammar.inGame}/${rep.grammar.list} がゲームの内容で扱われています。` : ''}
        </p>
      ) : (
        <p className="hand small ys-note">{rep.note}</p>
      )}
    </div>
  );
}

/** The 現在地 panel for English: choose the yardstick (or both side by side) and the scope. */
export function YardstickPanel() {
  const { data, progress } = useGame();
  const [mode, setMode] = useState<Mode>(() => (progress ? yardstickOf(progress) : 'eiken'));
  const [scope, setScope] = useState<string>('all');
  const jobs = data ? jobsOf(data) : [];
  const job = jobs.find((j) => j.id === scope);
  const vocab = useMemo(() => (data && job ? jobVocab(data, job) : undefined), [data, job]);
  if (!data || !progress) return null;
  const sc = job ? { domains: job.legacy ? undefined : job.domains, vocab } : {};
  const eik = mode !== 'toeic' ? yardstickReport(data, progress, 'eiken', sc) : null;
  const toe = mode !== 'eiken' ? yardstickReport(data, progress, 'toeic', sc) : null;
  return (
    <div className="ys" data-testid="yardsticks">
      <div className="ys-tools">
        <div className="index-tabs small-tabs" role="group" aria-label="ものさし">
          {(
            [
              ['eiken', '英検'],
              ['toeic', 'TOEIC'],
              ['both', '並べる'],
            ] as [Mode, string][]
          ).map(([k, l]) => (
            <button key={k} type="button" className={`index-tab ${mode === k ? 'on' : ''}`} aria-pressed={mode === k} onClick={() => setMode(k)} data-ys={k}>
              {l}
            </button>
          ))}
        </div>
        <select className="ys-scope" value={scope} onChange={(e) => setScope(e.target.value)} aria-label="範囲" data-testid="ys-scope">
          <option value="all">すべての言葉</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.nameJa}
            </option>
          ))}
        </select>
      </div>
      {!listsLoaded() ? <p className="hand small ys-note">語彙一覧（data/english）が読み込まれていません。ゲーム内の目安タグで表示しています。</p> : null}
      {job && !job.legacy ? <p className="hand small muted">「{job.nameJa}」の分野（{job.domains.join('・')}）の語彙一覧と、その仕事に出てくる言葉で数えています。</p> : null}
      {job?.legacy ? <p className="hand small muted">茶房（市場・配達・物語を含む）に出てくる言葉で数えています。</p> : null}
      <div className={`ys-grid ${mode === 'both' ? 'ys-both' : ''}`}>
        {eik ? <Report rep={eik} title="英検（級ごと・累計）" /> : null}
        {toe ? <Report rep={toe} title="TOEIC（スコア帯ごと・累計）" /> : null}
      </div>
      {listsLoaded() ? <p className="hand small muted">一覧：{englishLists().notes[0]}</p> : null}
    </div>
  );
}

/** 学習の記録: one row per job — rank, tasks, how many went well, its words confirmed. */
export function JobRecordTable() {
  const { data, progress } = useGame();
  if (!data || !progress || !progress.jobs) return null;
  const rows = jobsOf(data).filter((j) => progress.jobs?.jobs[j.id]);
  if (!rows.length) return null;
  return (
    <div className="jrec" data-testid="job-record">
      <h4 className="hand">仕事ごとの記録</h4>
      <table className="map-table jrec-table">
        <thead>
          <tr>
            <th>仕事</th>
            <th>位</th>
            <th>仕事の数</th>
            <th>うまく</th>
            <th>言葉（確定/全体）</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((j) => {
            const jp = progress.jobs!.jobs[j.id];
            const rs = rankStatus(data, progress, j);
            return (
              <tr key={j.id}>
                <th>
                  {j.icon} {j.nameJa}
                </th>
                <td>
                  {rankName(rs.rank)}（{rs.rank}）
                </td>
                <td>{jp.tasks}</td>
                <td>{jp.tasks ? `${Math.round((jp.good / jp.tasks) * 100)}%` : '—'}</td>
                <td>
                  {rs.words}/{rs.vocab}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
