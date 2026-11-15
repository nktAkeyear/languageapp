/**
 * The town (hub): the illustrated map, extended across the bridge by the east quarter where the
 * new workplaces stand. Workplaces are buildings: tap one to see the job and work there for this
 * part of the day; the job board on the main street lists every job with its rank and what it
 * teaches. "家に帰る" ends the day (the night's ledger). Phone: the map as an overview with
 * markers, and the workplaces as a list of signboards.
 */
import { useLayoutEffect, useRef, useState } from 'react';
import { townOf } from '../../activities/town/text';
import { jobDay, jobHasDay, jobHasEvening, jobHasNew, jobHoursJa, jobOffered, jobOpenAt, jobsOf, rankName, rankStatus, recommendJobs, TEAHOUSE } from '../../jobs/engine';
import { marketAccess } from '../../activities/day';
import type { JobDayState } from '../../jobs/types';
import type { LangProgress } from '../../core/save';
import { DayParts, NoticePin } from '../components/DayChrome';
import type { JobDef } from '../../jobs/types';
import { skyAt } from '../art/sky';
import { MAP_W } from '../art/town';
import { WordText } from '../components/WordText';
import { useMobile } from '../layout';
import { BookProps, CornerHooks } from '../scene/parts';
import { useStageScale } from '../scene/ShopScene';
import { sfx } from '../sound';
import { useGame } from '../useGame';
import { BUILDINGS, BuildingFront, HUB_H, HUB_W, HubMapArt } from './art';
import { JobBoard } from './JobBoard';
import { GoodsShelf, LevelTag } from './bits';

const PART_T = [0.08, 0.36, 0.68, 0.86];

/** Has the player worked at this workplace today (as today's workplace, after it began, or as the evening shift)? */
function workedToday(p: LangProgress, d: JobDayState, j: JobDef): boolean {
  if (d.log.some((l) => l.job === j.id) || d.evening === j.id) return true;
  if (d.work !== j.id) return false;
  return j.legacy ? (p.townDay?.part ?? 0) > 0 : d.part > 0;
}

export function TownHub({ onSettings }: { onSettings: () => void }) {
  const g = useGame();
  const mobile = useMobile();
  const { ref, scale } = useStageScale(HUB_W, 1000);
  const [sel, setSel] = useState<string | null>(null);
  const [board, setBoard] = useState(false);
  const { data, progress } = g;
  const day = progress ? jobDay(progress) : null;
  if (!data || !progress || !day) return null;
  const town = townOf(data);
  const sky = skyAt(PART_T[Math.min(3, day.part)]);
  const over = day.part > 2;
  const jobs = jobsOf(data);
  const work = jobs.find((j) => j.id === day.work);
  const next = jobs.find((j) => j.id === (progress.jobs?.next ?? TEAHOUSE));
  const mk = day.part === 2 ? marketAccess(progress, 'hub') : null;
  const status = (
    <div className="hub-status">
      <DayParts className="hub-dayparts" />
      <div className="hub-work small" data-testid="hub-work">
        {day.part === 0 ? `今日の仕事場：${work?.nameJa ?? ''}` : `明日の仕事場：${next?.nameJa ?? '茶房'}`}
      </div>
      <div className="hub-coins" title="財布">
        <span aria-hidden>🪙</span> {progress.town.money}
      </div>
      <NoticePin className="hub-notice" />
      <button type="button" className="cv-btn hub-boardbtn" data-testid="open-board" onClick={() => (sfx('paper'), setBoard(true))}>
        掲示板を見る
      </button>
      {day.part === 0 ? (
        <button type="button" className="cv-btn cv-next hub-home" data-testid="back-to-work" onClick={() => (sfx('steps'), g.jobs.back())}>
          {work?.nameJa ?? '仕事場'}に戻る
        </button>
      ) : (
        <>
          {mk ? (
            <button type="button" className="cv-btn hub-market" data-testid="go-market" disabled={!!mk.why} title={mk.why ?? undefined} onClick={() => (sfx('steps'), g.day.goMarket('hub'))}>
              市場へ（明日の分）
            </button>
          ) : null}
          <button
            type="button"
            className="cv-btn cv-next hub-home"
            data-testid="go-home"
            onClick={() => {
              sfx('steps');
              g.closeDay();
            }}
          >
            家に帰って帳簿をつける
          </button>
        </>
      )}
    </div>
  );
  const card = sel ? <WorkplaceCard id={sel} onClose={() => setSel(null)} onBoard={() => setBoard(true)} /> : null;
  const hotspots = (
    <>
      {jobs.map((j) => {
        const b = BUILDINGS[j.building];
        if (!b) return null;
        const offered = jobOffered(progress, j);
        const done = workedToday(progress, day, j);
        const sign = j.legacy ? null : j.content[data.lang]?.sign;
        const open = offered && !over && jobOpenAt(j, day.part);
        const fresh = jobHasNew(data, progress, j);
        const rank = progress.jobs?.jobs[j.id]?.rank ?? 1;
        return (
          <button
            key={j.id}
            type="button"
            className={`hub-spot ${offered ? '' : 'closed'} ${done ? 'done' : ''} ${open ? 'open' : 'shut'} ${sel === j.id ? 'on' : ''}`}
            style={{ left: `${(b.x / HUB_W) * 100}%`, top: `${(b.y / HUB_H) * 100}%`, width: `${(b.w / HUB_W) * 100}%`, height: `${(b.h / HUB_H) * 100}%` }}
            onClick={() => {
              sfx('pickup');
              setSel(j.id);
            }}
            data-job={j.id}
            aria-label={j.nameJa}
          >
            <span className="hub-sign">
              {sign ? <WordText text={sign} interactive={false} /> : <span>{j.icon}</span>}
              <span className="hub-signja">{j.nameJa}</span>
              {offered ? <SpotBadges open={open} done={!!done} fresh={fresh} rank={rank} hours={jobHoursJa(j)} /> : null}
            </span>
          </button>
        );
      })}
      <button
        type="button"
        className="hub-spot hub-spot-board"
        style={{ left: `${(BUILDINGS.board.x / HUB_W) * 100}%`, top: `${(BUILDINGS.board.y / HUB_H) * 100}%`, width: `${(BUILDINGS.board.w / HUB_W) * 100}%`, height: `${(BUILDINGS.board.h / HUB_H) * 100}%` }}
        onClick={() => (sfx('paper'), setBoard(true))}
        aria-label="仕事の掲示板"
      >
        <span className="hub-sign">
          <span className="hub-signja">掲示板</span>
        </span>
      </button>
      <span className="hub-lot" style={{ left: `${(BUILDINGS.lot.x / HUB_W) * 100}%`, top: `${((BUILDINGS.lot.y + 150) / HUB_H) * 100}%` }}>
        新しい仕事場を建設中
      </span>
    </>
  );
  const map = (
    <div className="hub-map" data-testid="town-hub">
      <svg viewBox={`0 0 ${HUB_W} ${HUB_H}`} className="hub-map-art" aria-hidden>
        <HubMapArt cells={town?.shared.delivery.map ?? []} temple={data.lang === 'en' ? 'church' : 'pagoda'} tint={sky.bottom} />
        <rect width={HUB_W} height={HUB_H} fill={sky.top} opacity={over ? 0.35 : 0.06} />
      </svg>
      {hotspots}
      <span className="hub-river-note" style={{ left: `${((MAP_W + 10) / HUB_W) * 100}%` }} aria-hidden>
        東の新しい町
      </span>
    </div>
  );
  const boardSheet = board ? <JobBoard onClose={() => setBoard(false)} /> : null;
  if (mobile)
    return (
      <div className="m-hub">
        <header className="m-hub-head">
          <span className="m-hub-title">町</span>
          {status}
        </header>
        <ZoomMap>{map}</ZoomMap>
        <section className="m-hub-list" aria-label="仕事場">
          {jobs.map((j) => (
            <WorkplaceRow key={j.id} job={j} onOpen={() => setSel(j.id)} />
          ))}
        </section>
        <div className="m-hub-books">
          <BookProps compact />
        </div>
        <div className="m-hub-hooks">
          <CornerHooks onSettings={onSettings} />
        </div>
        {card}
        {boardSheet}
      </div>
    );
  return (
    <div className="scene-viewport hub-viewport" ref={ref}>
      <div className="stage hub-stage" style={{ width: HUB_W, height: 1000, transform: `translate(-50%, -50%) scale(${scale})` }}>
        <div className="hub-mapwrap">{map}</div>
        <div className="hub-bottom">{status}</div>
        <div className="hub-books">
          <BookProps compact />
        </div>
        <GoodsShelf className="hub-goods" />
        {card}
        <CornerHooks onSettings={onSettings} />
      </div>
      {boardSheet}
    </div>
  );
}

/** At a glance on a workplace: open now (or its hours), the player's rank there, something new waiting. */
function SpotBadges({ open, done, fresh, rank, hours }: { open: boolean; done: boolean; fresh: boolean; rank: number; hours: string }) {
  return (
    <span className="hub-badges">
      <span className={`hub-badge ${open && !done ? 'b-open' : 'b-shut'}`}>{done ? '済' : open ? '営業中' : `${hours}`}</span>
      <span className="hub-badge b-rank" title={`位：${rankName(rank)}`}>
        {'●'.repeat(rank)}
        <span className="b-rank-off">{'○'.repeat(Math.max(0, 5 - rank))}</span>
      </span>
      {fresh ? <span className="hub-badge b-new">新</span> : null}
    </span>
  );
}

/**
 * The phone's town map: the whole town first; a tap zooms into that spot (signs legible, pan with a finger),
 * 全体を見る zooms back out — as on the delivery map. A tap on a workplace while zoomed opens it.
 */
function ZoomMap({ children }: { children: React.ReactNode }) {
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const Z = 2.6;
  useLayoutEffect(() => {
    const el = box.current;
    if (!el || !zoom) return;
    el.scrollLeft = zoom.x * el.scrollWidth - el.clientWidth / 2;
    el.scrollTop = zoom.y * el.scrollHeight - el.clientHeight / 2;
  }, [zoom]);
  // Zoomed out, the whole map is one target ("tap to zoom"): the small buildings on it are not buttons
  // (inert: not tappable, not focusable) — every tappable target on the phone stays finger-sized.
  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    if (zoom) el.removeAttribute('inert');
    else el.setAttribute('inert', '');
  }, [zoom]);
  const zoomAt = (x: number, y: number) => {
    sfx('whoosh');
    setZoom({ x, y });
  };
  return (
    <div className={`m-hub-zoom ${zoom ? 'zoomed' : ''}`}>
      <div
        ref={box}
        className="m-hub-zoombox"
        role={zoom ? undefined : 'button'}
        tabIndex={zoom ? undefined : 0}
        aria-label={zoom ? undefined : '町の地図：押した所を大きくする'}
        onClickCapture={(e) => {
          if (zoom) return;
          // First tap: zoom into the spot (do not open a workplace yet).
          const r = e.currentTarget.getBoundingClientRect();
          e.stopPropagation();
          e.preventDefault();
          zoomAt((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
        }}
        onKeyDown={(e) => {
          if (zoom || (e.key !== 'Enter' && e.key !== ' ')) return;
          e.preventDefault();
          zoomAt(0.5, 0.5);
        }}
        data-testid="hub-zoom"
      >
        <div ref={inner} className="m-hub-zoominner" style={zoom ? { width: `${Z * 100}%` } : undefined}>
          {children}
        </div>
      </div>
      {zoom ? (
        <button type="button" className="btn btn-small m-hub-zoomout" onClick={() => (sfx('whoosh'), setZoom(null))} data-testid="hub-zoom-out">
          全体を見る
        </button>
      ) : (
        <span className="m-hub-zoomhint">地図を押すと大きくなる</span>
      )}
    </div>
  );
}

function WorkplaceRow({ job, onOpen }: { job: JobDef; onOpen: () => void }) {
  const g = useGame();
  const p = g.progress!;
  const data = g.data!;
  const day = jobDay(p)!;
  const offered = jobOffered(p, job);
  const rs = rankStatus(data, p, job);
  const done = workedToday(p, day, job);
  const sign = job.legacy ? null : job.content[data.lang]?.sign;
  const open = offered && day.part <= 2 && jobOpenAt(job, day.part);
  const fresh = jobHasNew(data, p, job);
  return (
    <button type="button" className={`m-hub-row ${offered ? '' : 'closed'} ${done ? 'done' : ''} ${open ? 'open' : 'shut'}`} onClick={() => (sfx('pickup'), onOpen())} data-job={job.id}>
      <BuildingFront id={job.building} />
      <span className="m-hub-rowtext">
        <span className="m-hub-rowname">
          {job.nameJa}
          {sign ? (
            <span className="m-hub-rowsign">
              <WordText text={sign} interactive={false} />
            </span>
          ) : null}
        </span>
        <span className="m-hub-rowrank">{offered ? `位：${rankName(rs.rank)}（${rs.rank}）` : 'まだ募集していない'}</span>
        {offered ? <SpotBadges open={open} done={!!done} fresh={fresh} rank={rs.rank} hours={jobHoursJa(job)} /> : null}
      </span>
    </button>
  );
}

/**
 * The card shown for a tapped workplace: the job, its rank and what it teaches. Before opening: work here today
 * (the day moves there); after closing: a second shift here (when it is open in the evening), and "work here
 * from tomorrow".
 */
function WorkplaceCard({ id, onClose, onBoard }: { id: string; onClose: () => void; onBoard: () => void }) {
  const g = useGame();
  const [why, setWhy] = useState<string | null>(null);
  const data = g.data!;
  const p = g.progress!;
  const job = jobsOf(data).find((j) => j.id === id);
  const day = jobDay(p);
  if (!job || !day) return null;
  const rs = rankStatus(data, p, job);
  const offered = jobOffered(p, job);
  const doneToday = workedToday(p, day, job);
  const over = day.part > 2;
  const rec = recommendJobs(data, p).includes(job.id);
  const isWork = day.work === job.id;
  const isNext = (p.jobs?.next ?? TEAHOUSE) === job.id;
  const teaNote = job.legacy ? (day.part === 0 ? '一日をここで：始業前の買い出し・店・業務後の配達' : '業務後に店だけ開ける（奥の部屋の品で出す。一杯ごとに少しかかる）') : '';
  const canToday = offered && day.part === 0 && jobHasDay(job);
  const canEvening = offered && day.part === 2 && jobHasEvening(job) && !doneToday && !isWork && !day.evening;
  const canNext = offered && day.part === 2 && jobHasDay(job) && !isNext;
  const state = !offered
    ? 'まだ募集していない'
    : over
      ? '今日の仕事はおしまい'
      : day.part === 2
        ? doneToday || isWork
          ? '今日はここで働いた'
          : day.evening
            ? '業務後のひと仕事は、今日はもう済んだ'
            : jobHasEvening(job)
              ? ''
              : `業務後は閉まっている（${jobHoursJa(job)}）`
        : day.part === 0 && !jobHasDay(job)
          ? `日中の仕事はない（${jobHoursJa(job)}）`
          : '';
  return (
    <div className="hub-card" role="dialog" aria-label={job.nameJa} data-testid="workplace-card">
      <button type="button" className="hub-card-x" onClick={onClose} aria-label="閉じる">
        ×
      </button>
      <div className="hub-card-head">
        <BuildingFront id={job.building} />
        <div>
          <h3>
            {job.nameJa} {rec ? <span className="hub-rec">おすすめ</span> : null}
          </h3>
          <div className="hub-card-rank">
            位：<b>{rankName(rs.rank)}</b>（{rs.rank}/{job.ranks.length}） <LevelTag job={job} rank={rs.rank} />
          </div>
        </div>
      </div>
      <p className="hub-card-blurb">{job.blurbJa}</p>
      {!job.legacy ? (
        <p className="hub-card-note">
          仕事の時間：{jobHoursJa(job)}
          {jobHasNew(data, p, job) ? '　・新しい仕事が待っている' : ''}
        </p>
      ) : null}
      {job.legacy && !over && (canToday || canEvening) ? <p className="hub-card-note">{teaNote}</p> : null}
      {why ? <p className="hub-card-why">{why}</p> : null}
      <div className="hub-card-actions">
        <button type="button" className="btn" onClick={onBoard}>
          掲示板でくわしく
        </button>
        {canNext ? (
          <button
            type="button"
            className="btn"
            data-testid="work-next"
            onClick={() => {
              sfx('pickup');
              const r = g.jobs.chooseNext(job.id);
              setWhy(r ?? `明日からは${job.nameJa}で一日を始める。`);
            }}
          >
            明日はここで働く
          </button>
        ) : null}
        {canToday || canEvening ? (
          <button
            type="button"
            className="btn btn-primary"
            data-testid="work-here"
            onClick={() => {
              sfx('bell');
              const r = g.jobs.choose(job.id);
              if (r) setWhy(r);
            }}
          >
            {canEvening ? '業務後にここで働く' : isWork ? 'ここに戻る' : '今日はここで働く'}
          </button>
        ) : state ? (
          <span className="hub-card-state">{state}</span>
        ) : null}
      </div>
    </div>
  );
}
