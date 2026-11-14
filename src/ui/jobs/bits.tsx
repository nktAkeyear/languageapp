/** Small shared pieces of the jobs UI: level tags, rank progress, the goods store. */
import { GOODS } from '../../content/jobs';
import { rankName, rankStatus } from '../../jobs/engine';
import type { JobDef } from '../../jobs/types';
import { eikenLabel, toeicLabel } from '../../curriculum/yardsticks';
import { useGame } from '../useGame';

/** "英検4級・TOEIC〜400 相当" for a rank's material. */
export function LevelTag({ job, rank }: { job: JobDef; rank: number }) {
  const r = job.ranks.find((x) => x.rank === rank) ?? job.ranks[0];
  return (
    <span className="lvl-tag" title="この位で出てくる内容の目安">
      {eikenLabel(r.level.eiken)}
      {r.level.toeic ? `・${toeicLabel(r.level.toeic)}` : ''}
    </span>
  );
}

export function RankProgress({ job }: { job: JobDef }) {
  const { data, progress } = useGame();
  if (!data || !progress) return null;
  const rs = rankStatus(data, progress, job);
  if (!rs.next) return <div className="rank-prog done">いちばん上の位です。</div>;
  const g = Math.min(1, rs.good / Math.max(1, rs.next.need.good));
  const w = Math.min(1, rs.words / Math.max(1, rs.next.need.words));
  return (
    <div className="rank-prog" data-testid={`rank-prog-${job.id}`}>
      <div className="rank-prog-title">
        次の位「{rankName(rs.next.rank)}」まで <LevelTag job={job} rank={rs.next.rank} />
      </div>
      <div className="rank-prog-row">
        <span>うまくできた仕事</span>
        <span className="rank-bar">
          <span style={{ width: `${g * 100}%` }} />
        </span>
        <span className="rank-num">
          {rs.good}/{rs.next.need.good}
        </span>
      </div>
      <div className="rank-prog-row">
        <span>確定した言葉</span>
        <span className="rank-bar">
          <span style={{ width: `${w * 100}%` }} />
        </span>
        <span className="rank-num">
          {rs.words}/{rs.next.need.words}
        </span>
      </div>
      <div className="rank-prog-note">{rs.next.noteJa}</div>
    </div>
  );
}

/** The town's shared store: goods one job made for another. */
export function GoodsShelf({ className = '' }: { className?: string }) {
  const { progress } = useGame();
  const goods = progress?.jobs?.goods ?? {};
  const have = GOODS.filter((g) => (goods[g.id] ?? 0) > 0);
  if (!have.length) return null;
  return (
    <div className={`goods-shelf ${className}`} aria-label="町の倉庫" data-testid="goods">
      <span className="goods-title">倉庫</span>
      {have.map((g) => (
        <span key={g.id} className="goods-item" title={g.nameJa}>
          <span aria-hidden>{g.icon}</span>
          {g.nameJa} ×{goods[g.id]}
        </span>
      ))}
    </div>
  );
}
