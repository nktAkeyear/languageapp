/**
 * 仕事の掲示板: every job of the town — what it teaches, its rank ladder with the 英検 / TOEIC level
 * of each rank's material, the player's progress to the next rank, what the curriculum would teach
 * next there (and, honestly, how much of the lists no job covers yet). Recommendations follow the
 * chosen yardstick (英検: school order; TOEIC: working life first).
 */
import { useMemo } from 'react';
import { selectNext } from '../../curriculum/curriculum';
import { eikenLabel, toeicLabel } from '../../curriculum/yardsticks';
import { jobDay, jobOffered, jobsOf, rankName, rankStatus, recommendJobs, yardstickOf } from '../../jobs/engine';
import type { ArchetypeId, JobDef } from '../../jobs/types';
import { jobVocab } from '../../jobs/vocab';
import { Overlay } from '../components/Overlay';
import { useMobile } from '../layout';
import { useGame } from '../useGame';
import { BuildingFront } from './art';
import { GoodsShelf, RankProgress } from './bits';
import { openLevelSettings } from '../difficulty/LevelSettings';

export const ARCH_JA: Record<ArchetypeId, string> = {
  make: '注文どおりに作る',
  sort: '仕分ける',
  check: '書類を照らし合わせる',
  respond: '応対する',
  trade: '売り買い・おつり',
  deliver: '届ける',
};

export const DOMAIN_JA: Record<string, string> = {
  food: '食べ物', cooking: '料理', health: '健康', body: '体', family: '家族', school: '学校', shopping: '買い物', money: 'お金',
  travel: '旅行', transport: '交通', hotel: '宿泊', nature: '自然', weather: '天気', farming: '農業', sea: '海', crafts: '手仕事',
  clothing: '服', housing: '住まい', post: '郵便', office: '事務', meetings: '会議', sales: '営業', finance: '経理', hr: '人事',
  logistics: '物流', law: '法律', technology: '技術', science: '科学', media: '報道', arts: '芸術', emotion: '気持ち', society: '社会',
  abstract: '抽象語', communication: '連絡',
};

export function JobBoard({ onClose }: { onClose: () => void }) {
  const g = useGame();
  const mobile = useMobile();
  const { data, progress } = g;
  if (!data || !progress) return null;
  const jobs = jobsOf(data);
  const rec = recommendJobs(data, progress);
  const y = yardstickOf(progress);
  const timed = !!progress.jobs?.timed;
  return (
    <Overlay variant={mobile ? 'sheet' : 'modal'} onClose={onClose}>
      <div className="jboard" data-testid="job-board">
        <div className="jboard-head">
          <h2>仕事の掲示板</h2>
          <button type="button" className="btn btn-small" onClick={onClose}>
            閉じる
          </button>
        </div>
        <p className="hand small muted">
          一日は 始業前・業務中・業務後。その日の仕事場は始業前に選べ（町へ出て選び直せる）、業務中はそこで働く。業務後には、夕方も開いている仕事場でもうひと仕事できる（一日一度。茶房は業務後に店だけ開けることもできる）。明日の仕事場は業務後に選んでおける。
          位は「認められた仕事」と「その仕事の言葉を手帳で確定した数」で上がり、上の位ほど長い文・耳だけの注文・二段階の作業が出てくる。
        </p>
        <div className="jboard-yard">
          ものさし：<b>{y === 'toeic' ? 'TOEIC（仕事の英語）' : '英検（学校の順番）'}</b>
          {y === 'toeic' ? '　→ 事務や接客など、仕事の場面の多い職場をおすすめします。' : '　→ やさしい級の言葉から学べる職場をおすすめします。'}
          {data.lang === 'en' ? (
            <button type="button" className="btn btn-small" onClick={() => openLevelSettings()}>
              変える
            </button>
          ) : null}
        </div>
        <label className="jboard-timed">
          <input type="checkbox" checked={timed} onChange={(e) => g.jobs.setTimed(e.target.checked)} data-testid="timed-toggle" /> 時間制限のある仕事も受ける（位が上がると出てくる。間に合わないと少しだけ評価が下がる）
        </label>
        <GoodsShelf className="jboard-goods" />
        <ul className="jboard-list">
          {jobs.map((j) => (
            <JobEntry key={j.id} job={j} recommended={rec.includes(j.id)} />
          ))}
          <li className="jboard-soon">
            <span className="jboard-pin" aria-hidden />
            <b>建設中の仕事場</b>：漁船・畑・診療所・仕立て屋・図書館・駅・銀行・新聞社・大工・市役所 …（準備中）
          </li>
        </ul>
      </div>
    </Overlay>
  );
}

function JobEntry({ job, recommended }: { job: JobDef; recommended: boolean }) {
  const { data, progress } = useGame();
  const d = data!;
  const p = progress!;
  const offered = jobOffered(p, job);
  const rs = rankStatus(d, p, job);
  const day = jobDay(p);
  const vocab = useMemo(() => jobVocab(d, job), [d, job]);
  const sel = useMemo(() => selectNext(d, p, { yardstick: yardstickOf(p), domains: job.domains, vocab, n: 8 }), [d, p, job, vocab]);
  const known = [...vocab].filter((id) => p.words[id]?.confirmed).length;
  const opensIn = p.jobs?.boardOpen ? p.jobs.boardOpen + job.opensAfter - p.day : 0;
  return (
    <li className={`jboard-job ${offered ? '' : 'closed'}`} data-job={job.id}>
      <span className="jboard-pin" aria-hidden />
      <div className="jboard-jobhead">
        <BuildingFront id={job.building} />
        <div>
          <h3>
            {job.icon} {job.nameJa}
            {recommended ? <span className="hub-rec">おすすめ</span> : null}
            {!offered ? <span className="jboard-wait">{opensIn > 0 ? `あと${opensIn}日で募集` : '募集前'}</span> : null}
          </h3>
          <div className="jboard-arch">
            {job.archetypes.map((a) => (
              <span key={a} className="jboard-chip">
                {ARCH_JA[a]}
              </span>
            ))}
            {job.domains.slice(0, 6).map((x) => (
              <span key={x} className="jboard-chip jboard-dom">
                {DOMAIN_JA[x] ?? x}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="jboard-blurb">{job.blurbJa}</p>
      <table className="jboard-ladder">
        <tbody>
          {job.ranks.map((r) => (
            <tr key={r.rank} className={r.rank === rs.rank ? 'now' : r.rank < rs.rank ? 'past' : ''}>
              <th>
                {r.rank}. {rankName(r.rank)}
              </th>
              <td className="jboard-lv">
                {eikenLabel(r.level.eiken)}
                {r.level.toeic ? <span>・{toeicLabel(r.level.toeic)}</span> : null}
              </td>
              <td className="jboard-note">{r.noteJa}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {offered ? <RankProgress job={job} /> : null}
      <div className="jboard-curr">
        この仕事の言葉 {vocab.size} 語（確定 {known}）。
        {sel.teachable.length ? (
          <>
            次に出会いそうな言葉：
            <span lang="en" className="jboard-next">
              {sel.teachable.slice(0, 6).map((t) => d.lex.byId.get(t.id)?.text).join(', ')}
            </span>
          </>
        ) : null}
        {sel.uncoveredCount ? <span className="jboard-honest">（語彙一覧のこの分野のうち {sel.uncoveredCount} 語は、まだどの仕事でも学べません）</span> : null}
      </div>
      {day?.log.some((l) => l.job === job.id) ? <div className="jboard-today">今日ここで働いた。</div> : null}
    </li>
  );
}
