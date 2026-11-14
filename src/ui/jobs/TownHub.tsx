/**
 * The town (hub): the illustrated map, extended across the bridge by the east quarter where the
 * new workplaces stand. Workplaces are buildings: tap one to see the job and work there for this
 * part of the day; the job board on the main street lists every job with its rank and what it
 * teaches. "家に帰る" ends the day (the night's ledger). Phone: the map as an overview with
 * markers, and the workplaces as a list of signboards.
 */
import { useState } from 'react';
import { townOf } from '../../activities/town/text';
import { jobDay, jobOffered, jobsOf, PART_NAMES, rankName, rankStatus, recommendJobs } from '../../jobs/engine';
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

export function TownHub({ onSettings }: { onSettings: () => void }) {
  const g = useGame();
  const mobile = useMobile();
  const { ref, scale } = useStageScale(HUB_W, 1000);
  const [sel, setSel] = useState<string | null>(null);
  const [board, setBoard] = useState(false);
  const [notesSeen, setNotesSeen] = useState('');
  const { data, progress } = g;
  const day = progress ? jobDay(progress) : null;
  if (!data || !progress || !day) return null;
  const town = townOf(data);
  const sky = skyAt(PART_T[Math.min(3, day.part)]);
  const over = day.part > 2;
  const jobs = jobsOf(data);
  const notesKey = `${progress.day}`;
  const showNotes = day.notes.length > 0 && notesSeen !== notesKey;
  const status = (
    <div className="hub-status">
      <div className="hub-when">
        <span className="hub-day">{progress.day}日目</span>
        <span className="hub-part">{over ? '夜' : PART_NAMES[day.part]}</span>
      </div>
      <div className="hub-parts" aria-label="今日の仕事">
        {PART_NAMES.map((n, i) => {
          const l = day.log.find((x) => x.part === i) ?? (day.tea !== 'none' && i >= 0 ? null : null);
          const j = l ? jobs.find((x) => x.id === l.job) : null;
          return (
            <span key={n} className={`hub-partchip ${i === day.part ? 'now' : ''} ${l ? 'done' : ''}`}>
              {n}
              {j ? <span className="hub-partjob">{j.icon}</span> : null}
            </span>
          );
        })}
      </div>
      <div className="hub-coins" title="財布">
        <span aria-hidden>🪙</span> {progress.town.money}
      </div>
      <button type="button" className="cv-btn hub-boardbtn" data-testid="open-board" onClick={() => (sfx('paper'), setBoard(true))}>
        掲示板を見る
      </button>
      <button
        type="button"
        className={`cv-btn ${over ? 'cv-next' : ''} hub-home`}
        data-testid="go-home"
        onClick={() => {
          sfx('steps');
          g.closeDay();
        }}
      >
        {over ? '家に帰って帳簿をつける' : '今日はもう帰る'}
      </button>
    </div>
  );
  const notes = showNotes ? (
    <div className="letter hub-notes" role="dialog" aria-label="今日の知らせ">
      <div className="letter-title">今日の知らせ</div>
      {day.notes.map((n) => (
        <p key={n}>{n}</p>
      ))}
      <button type="button" className="btn btn-primary" onClick={() => (sfx('page'), setNotesSeen(notesKey))}>
        わかった
      </button>
    </div>
  ) : null;
  const card = sel ? <WorkplaceCard id={sel} onClose={() => setSel(null)} onBoard={() => setBoard(true)} /> : null;
  const hotspots = (
    <>
      {jobs.map((j) => {
        const b = BUILDINGS[j.building];
        if (!b) return null;
        const offered = jobOffered(progress, j);
        const done = day.log.some((l) => l.job === j.id) || (j.legacy && day.tea !== 'none');
        const sign = j.legacy ? null : j.content[data.lang]?.sign;
        return (
          <button
            key={j.id}
            type="button"
            className={`hub-spot ${offered ? '' : 'closed'} ${done ? 'done' : ''} ${sel === j.id ? 'on' : ''}`}
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
            </span>
            {done ? <span className="hub-done" aria-hidden>✓</span> : null}
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
        {map}
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
        {notes}
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
        {notes}
        <CornerHooks onSettings={onSettings} />
      </div>
      {boardSheet}
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
  const done = day.log.some((l) => l.job === job.id) || (job.legacy && day.tea !== 'none');
  const sign = job.legacy ? null : job.content[data.lang]?.sign;
  return (
    <button type="button" className={`m-hub-row ${offered ? '' : 'closed'} ${done ? 'done' : ''}`} onClick={() => (sfx('pickup'), onOpen())} data-job={job.id}>
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
      </span>
      {done ? <span className="hub-done" aria-hidden>✓</span> : null}
    </button>
  );
}

/** The card shown for a tapped workplace: the job, its rank and what it teaches; work here. */
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
  const doneToday = day.log.some((l) => l.job === job.id) || (job.legacy && day.tea !== 'none');
  const over = day.part > 2;
  const rec = recommendJobs(data, p).includes(job.id);
  const teaParts = job.legacy ? (day.part === 0 ? '朝の市場・昼の店・夕方の配達' : day.part === 1 ? '昼の店（今日は市場なし）・夕方の配達' : '店だけ（今日は市場も配達もなし）') : '';
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
      {job.legacy && !doneToday && !over ? <p className="hub-card-note">今から開けると：{teaParts}</p> : null}
      {why ? <p className="hub-card-why">{why}</p> : null}
      <div className="hub-card-actions">
        <button type="button" className="btn" onClick={onBoard}>
          掲示板でくわしく
        </button>
        {offered && !doneToday && !over ? (
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
            ここで働く（{PART_NAMES[day.part]}）
          </button>
        ) : (
          <span className="hub-card-state">{!offered ? 'まだ募集していない' : doneToday ? '今日はここで働いた' : '今日の仕事はおしまい'}</span>
        )}
      </div>
    </div>
  );
}
