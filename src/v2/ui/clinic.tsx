/**
 * The clinic's reception: ONE screen, the desk seen from the receptionist's chair. The patient stands at the hatch
 * (with the 準備中 / 受付中 card hanging in it) and talks in a big bubble; the supplies stand on the wall shelf, each
 * with its count (folders, ink, message paper, appointment cards); the papers of the current task lie on the desk;
 * the order ledger and the stamps are in their places on the right. Before opening the head clerk's memo lies on
 * the desk; after closing the day's card lies over the room. A task that needs a supply at 0 cannot be handed in:
 * the desk says 在庫 0 and nothing else.
 */
import { useEffect, useMemo, useState } from 'react';
import { plain } from '../../core/gamedata';
import { currentShift, currentTask, jobById, jobContent } from '../../jobs/engine';
import { personOf } from '../../jobs/templates';
import type { CheckDoc, TaskAnswer, TaskInstance } from '../../jobs/types';
import { CustomerArt, expressionFor, lookFor } from '../../ui/art/customer';
import { WindowGroup, LampGroup } from '../../ui/art/shop';
import type { SkyColours } from '../../ui/art/sky';
import { clinicNext, clinicSubmit, morningNote, supplyFor } from '../logic/day';
import { CLINIC_SUPPLIES } from '../logic/catalog';
import { SupplyArt } from './art';
import { Icon, ListenButton, Words } from './bits';
import { Frame } from './frame';
import { At, Bubble, Count, Crate, DayNote, DoorSign, Light, MapFrame, OrderPad, Receipts, SIZE, Stage, SummaryCard, recentArrivals, skyFor, useZeroTap, type Box } from './scene';
import { useGame, useS } from './store';

const SUPPLY_JA: Record<string, string> = { folder: '紙ばさみ', ink: 'インク', paper: '伝言用紙', card: '予約カード' };

type Geo = {
  w: number;
  h: number;
  /** y of the desk's far edge */
  dy: number;
  hatch: Box;
  sign: Box;
  patient: Box;
  bubble: Box;
  bubbleTail: 'left' | 'bottom';
  shelf: Box;
  map: Box;
  lamp: [number, number];
  papers: Box;
  pad: Box;
  actions: Box;
  receipts: Box;
  crate: Box;
  crateTag: Box;
  note: Box;
  summary: Box;
};

const DESK: Geo = {
  ...SIZE.desk,
  dy: 470,
  hatch: [24, 60, 310, 410],
  sign: [106, 76, 146, 110],
  patient: [54, 150, 250, 438],
  bubble: [350, 30, 700, 300],
  bubbleTail: 'left',
  shelf: [1080, 40, 490, 250],
  map: [1460, 316, 110, 112],
  lamp: [1290, 300],
  papers: [350, 346, 900, 584],
  pad: [1270, 470, 160, 270],
  actions: [1262, 750, 320, 180],
  receipts: [1440, 470, 150, 260],
  crate: [40, 720, 230, 150],
  crateTag: [40, 560, 260, 150],
  note: [380, 380, 760, 520],
  summary: [380, 30, 760, 520],
};

const PHONE: Geo = {
  ...SIZE.phone,
  dy: 300,
  hatch: [4, 110, 150, 190],
  sign: [8, 116, 142, 86],
  patient: [18, 150, 124, 217],
  bubble: [6, 6, 388, 178],
  bubbleTail: 'bottom',
  shelf: [158, 186, 238, 110],
  map: [318, 104, 76, 76],
  lamp: [240, 10],
  papers: [4, 306, 392, 434],
  pad: [4, 742, 92, 76],
  actions: [178, 744, 218, 74],
  receipts: [98, 742, 78, 76],
  crate: [270, 312, 120, 80],
  crateTag: [158, 312, 110, 110],
  note: [10, 312, 380, 420],
  summary: [8, 8, 384, 290],
};

/** The reception: tiled wall, the hatch to the waiting room (bench, window), the supply shelf, the desk. */
function ClinicRoom({ g, sky, phone }: { g: Geo; sky: SkyColours; phone: boolean }) {
  const [hx, hy, hw, hh] = g.hatch;
  const [sx, sy, sw, sh] = g.shelf;
  const tile = phone ? 24 : 40;
  return (
    <svg viewBox={`0 0 ${g.w} ${g.h}`} className="scene-svg" preserveAspectRatio="none" aria-hidden>
      <defs>
        <pattern id="v2-ctiles" width={tile} height={tile} patternUnits="userSpaceOnUse">
          <rect width={tile} height={tile} fill="#eef2ea" />
          <rect width={tile} height={tile} fill="none" stroke="#cfd8cc" strokeWidth="2" />
        </pattern>
      </defs>
      <rect width={g.w} height={g.dy + 10} fill="#dce8de" />
      <rect y={g.dy * 0.58} width={g.w} height={g.dy * 0.42 + 10} fill="url(#v2-ctiles)" />
      <rect y={g.dy * 0.58 - 8} width={g.w} height="10" fill="#8aa898" />
      <rect y="0" width={g.w} height={phone ? 14 : 28} fill="#3d6a5a" />
      {/* the hatch: the waiting room behind the glass */}
      <g>
        <rect x={hx} y={hy} width={hw} height={hh} fill="#c9d8cc" />
        <WindowGroup sky={sky} x={hx + hw * 0.52} y={hy + hh * 0.1} w={hw * 0.4} h={hh * 0.36} />
        <rect x={hx} y={hy + hh * 0.62} width={hw} height={hh * 0.38} fill="#b9cabd" />
        <g transform={`translate(${hx + hw * 0.06} ${hy + hh * 0.66})`}>
          <rect width={hw * 0.88} height={hh * 0.05} rx="4" fill="#a8764a" stroke="#4a2c14" strokeWidth="2" />
          <rect y={hh * 0.12} width={hw * 0.88} height={hh * 0.05} rx="4" fill="#a8764a" stroke="#4a2c14" strokeWidth="2" />
        </g>
        <rect x={hx} y={hy} width={hw} height={hh} fill="#fff" opacity="0.08" />
        <rect x={hx} y={hy} width={hw} height={hh} fill="none" stroke="#6e8a7c" strokeWidth={phone ? 8 : 14} />
      </g>
      {/* the supply cabinet on the wall */}
      <g>
        <rect x={sx} y={sy} width={sw} height={sh} rx="6" fill="#8e6a48" stroke="#3a2a1a" strokeWidth="3" />
        <rect x={sx + 8} y={sy + 8} width={sw - 16} height={sh - 16} rx="3" fill="#6b4c32" />
        <rect x={sx - 6} y={sy + sh - 14} width={sw + 12} height="16" rx="3" fill="url(#g-shelfboard)" stroke="#3a1f0e" strokeWidth="1.5" />
      </g>
      {!phone ? (
        <g transform="translate(700 380)">
          {/* the eye chart */}
          <rect width="90" height="80" fill="#fbfaf6" stroke="#5a6a62" strokeWidth="3" />
          {[14, 10, 7].map((s, r) => (
            <path key={r} d={`M${45 - (r + 1) * s * 0.8} ${16 + r * 22} h${(r + 1) * s * 1.6}`} stroke="#2a2118" strokeWidth={s / 2.4} strokeDasharray={`${s} ${s * 0.4}`} />
          ))}
        </g>
      ) : null}
      <LampGroup x={g.lamp[0]} y={g.lamp[1] - (phone ? 0 : 260)} />
    </svg>
  );
}

function ClinicDeskTop({ g, phone }: { g: Geo; phone: boolean }) {
  return (
    <svg viewBox={`0 0 ${g.w} ${g.h}`} className="scene-svg counter-svg" preserveAspectRatio="none" aria-hidden>
      <rect y={g.dy} width={g.w} height={g.h - g.dy} fill="#d9c7a4" />
      <rect y={g.dy} width={g.w} height={g.h - g.dy} fill="url(#g-counter)" opacity="0.35" />
      {Array.from({ length: 6 }, (_, i) => (
        <path key={i} d={`M0 ${g.dy + 40 + i * (phone ? 80 : 90)} H${g.w}`} stroke="#a88e64" strokeWidth="2" opacity="0.35" />
      ))}
      <rect y={g.dy - 10} width={g.w} height="20" fill="#f6f3ea" stroke="#8a9a8e" strokeWidth="3" />
      <rect y={g.dy + 10} width={g.w} height="12" fill="#000" opacity="0.12" />
      {!phone ? (
        <g transform="translate(1520 470)">
          {/* the desk bell */}
          <ellipse cx="0" cy="34" rx="30" ry="7" fill="#4a4a52" />
          <path d="M-22 32 Q-22 4 0 4 Q22 4 22 32 Z" fill="#d9b54a" stroke="#6a4a12" strokeWidth="2.5" />
        </g>
      ) : null}
    </svg>
  );
}

// ------------------------------------------------------------------------------------------------ the work

type Work =
  | { arch: 'sort'; placed: Record<string, string>; pick: string | null }
  | { arch: 'check'; field: string | null; fix: string | null; view: number; stamped?: 'ok' | 'fix' }
  | { arch: 'respond'; choice: number | null; fields: Record<string, string>; slot: string | null };

function freshWork(t: TaskInstance | null): Work | null {
  if (!t) return null;
  const sp = t.spec;
  if (sp.arch === 'sort') return { arch: 'sort', placed: {}, pick: null };
  if (sp.arch === 'check') return { arch: 'check', field: null, fix: null, view: sp.docs.findIndex((_, i) => i !== sp.target) };
  if (sp.arch === 'respond') return { arch: 'respond', choice: null, fields: {}, slot: null };
  return null;
}

export function Clinic() {
  const s = useS();
  const { data, act, layout, reduced, now } = useGame();
  const g = layout === 'phone' ? PHONE : DESK;
  const phone = layout === 'phone';
  const part = s.day.part;
  const sh = currentShift(s.p);
  const task = part === 1 ? currentTask(s.p) : null;
  const job = jobById(data, 'clinic')!;
  const jc = jobContent(data, job)!;
  const [work, setWork] = useState<Work | null>(() => freshWork(task));
  const [blocked, setBlocked] = useState<string | null>(null);
  const [reveal, setReveal] = useState(false);
  const [talk, setTalk] = useState(false);
  const [zero, sayZero] = useZeroTap();
  const key = task ? `${task.key}-${sh?.index}` : 'none';
  useEffect(() => {
    setWork(freshWork(task));
    setBlocked(null);
    setReveal(false);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const phaseKey = `${key}-${sh?.phase}-${part}`;
  useEffect(() => {
    if (reduced) return;
    setTalk(true);
    const id = window.setTimeout(() => setTalk(false), 1400);
    return () => window.clearTimeout(id);
  }, [phaseKey, reduced]);

  const sky = skyFor(s);
  const plus = recentArrivals(s, now, 'clinic');
  const working = part === 1 && !!sh;
  const result = working && sh!.phase === 'result' ? sh!.results[sh!.results.length - 1] : null;
  const done = working && sh!.phase === 'done';
  const person = working ? (task ? personOf(data, jc, task.handover ? jc.boss : task.person) : null) : null;
  const look = person ? lookFor(person.id, person.avatar) : null;
  const ex = result ? expressionFor(result.face, null) : 'neutral';
  const hidden = !!task?.audioOnly && !reveal && !result;
  const locked = !!result || done;
  const sup = task ? supplyFor(task) : null;
  const supOut = !!sup && (s.stock.clinic[sup] ?? 0) <= 0;

  const answer = (): TaskAnswer | null => {
    if (!task || !work) return null;
    const sp = task.spec;
    if (sp.arch === 'sort' && work.arch === 'sort') return sp.items.every((i) => work.placed[i.id]) ? { arch: 'sort', placed: work.placed } : null;
    if (sp.arch === 'respond' && work.arch === 'respond') {
      if (sp.mode === 'choose') return work.choice !== null ? { arch: 'respond', choice: work.choice } : null;
      if (sp.mode === 'form') return (sp.fields ?? []).every((f) => work.fields[f.id]) ? { arch: 'respond', fields: work.fields } : null;
      if (sp.mode === 'slot') return work.slot ? { arch: 'respond', slot: work.slot } : null;
    }
    return null;
  };
  const submit = (a: TaskAnswer | null) => {
    if (!a) return;
    const r = act((st, c) => clinicSubmit(st, c, a));
    if (r && 'reason' in r) setBlocked(r.supply);
    else setBlocked(null);
  };

  let actions: JSX.Element | null = null;
  if (working && sh && !done) {
    if (result)
      actions = (
        <button className="plate" id="next" onClick={() => act((st, c) => clinicNext(st, c))}>
          {sh.index + 1 >= sh.tasks.length ? '見送る' : '次の人'}
        </button>
      );
    else if (task?.spec.arch === 'check' && work?.arch === 'check') {
      const sp = task.spec;
      const needFix = !!sp.fixOptions?.length;
      actions = (
        <div className="stamps" role="group" aria-label="はんこ">
          <button className="stamp-btn ok" id="stamp-ok" onClick={() => (setWork({ ...work, stamped: 'ok' }), submit({ arch: 'check', verdict: 'ok' }))}>
            <Icon name="check" /> 問題なし
          </button>
          <button
            className="stamp-btn fix"
            id="stamp-fix"
            disabled={!work.field || (needFix && !work.fix)}
            onClick={() => work.field && (setWork({ ...work, stamped: 'fix' }), submit({ arch: 'check', verdict: 'fix', field: work.field, fix: work.fix ?? undefined }))}
          >
            <Icon name="pen" /> 違う所あり
          </button>
        </div>
      );
    } else {
      const a = answer();
      actions = (
        <button className="plate" id="submit" onClick={() => submit(a)} disabled={!a}>
          {task?.spec.arch === 'sort' ? '振り分けて渡す' : task?.spec.arch === 'respond' && task.spec.msg.kind === 'speech' ? 'こう答える' : '渡す'}
        </button>
      );
    }
  }

  const lines = part === 0 ? morningNote(data, s) : [];
  const supW = g.shelf[2] / CLINIC_SUPPLIES.length;

  return (
    <Frame>
      <Stage w={g.w} h={g.h} className={`scene scene-${layout} clinic part-${part}`}>
        <ClinicRoom g={g} sky={sky} phone={phone} />
        {person && look ? (
          <At box={g.patient} className={`person ${result ? `face-${result.face}` : ''}`}>
            <div className="person-in" key={person.id}>
              <CustomerArt look={look} ex={ex} pose={result ? 'open' : 'rest'} talking={talk} />
            </div>
          </At>
        ) : null}
        <ClinicDeskTop g={g} phone={phone} />
        <Light part={part} lamp={sky.lamp} lampAt={g.lamp} />
        <DoorSign box={g.sign} open="受付中" />
        <MapFrame box={g.map} />
        <Crate box={g.crate} tagBox={g.crateTag} />

        {/* the supplies, each with its count */}
        <div className="shelf-items" role="group" aria-label="机の備品（数は在庫）">
          {CLINIC_SUPPLIES.map((it, i) => {
            const n = s.stock.clinic[it.id] ?? 0;
            return (
              <At key={it.id} box={[g.shelf[0] + i * supW, g.shelf[1], supW, g.shelf[3]]} className="jar-at supply-at">
                <button className={`jar ${n <= 0 ? 'jar-0' : ''}`} onClick={() => n <= 0 && sayZero(it.id)} aria-label={`${SUPPLY_JA[it.id]} 在庫 ${n}`}>
                  <span className="jar-art">
                    <SupplyArt id={it.id} empty={n <= 0} />
                  </span>
                  <span className="jar-label" lang="en">
                    {data.lex.byId.get(it.word)?.text ?? it.id}
                  </span>
                  <Count n={n} />
                  {plus[it.id] ? <span className="plus">+{plus[it.id]}</span> : null}
                  {zero === it.id ? <span className="zero-tag" role="status">在庫 0</span> : null}
                </button>
              </At>
            );
          })}
        </div>

        {/* the papers of the task, on the desk */}
        {working && sh ? (
          <At box={g.papers} className={`papers-at ${locked ? 'locked' : ''}`}>
            <div className="papers">
              {task && work && !done ? <TaskSurface task={task} work={work} setWork={setWork} locked={locked} hidden={hidden} /> : <div className="desk-empty ja-body">机の上は片づいた。</div>}
            </div>
          </At>
        ) : null}

        <OrderPad box={g.pad} />
        <Receipts box={g.receipts} />
        <At box={g.actions} className="actions-at">
          {sup && !locked && working ? (
            <p className={`uses ${supOut ? 'uses-0' : ''}`} role={blocked ? 'status' : undefined}>
              {SUPPLY_JA[sup]}
              {supOut ? ' 在庫 0' : ` を1つ使う`}
            </p>
          ) : null}
          {actions}
        </At>

        {part === 0 ? <DayNote box={g.note} lines={lines} title="受付主任のメモ" /> : null}

        {working && sh && (person || done) ? (
          <Bubble
            box={g.bubble}
            tail={g.bubbleTail}
            who={
              person ? (
                <>
                  <span className="who-name" lang="en">
                    {person.name}
                  </span>
                  <span className="ja-label">{done ? '' : `${sh.index + 1}件目／${sh.tasks.length}件`}</span>
                </>
              ) : null
            }
            tools={person ? (
              <>
                <ListenButton text={result ? result.reaction : task?.say ?? ''} />
                {task?.audioOnly && !result ? (
                  <button className="btn-quiet" onClick={() => setReveal((x) => !x)}>
                    {reveal ? '文字を隠す' : '文字で読む'}
                  </button>
                ) : null}
              </>
            ) : null}
          >
            {done ? (
              <p className="ja-body quiet-line">今日の受付は、これで全部。</p>
            ) : result ? (
              <>
                {task?.say ? (
                  <p className="said-before">
                    <Words text={task.say} />
                  </p>
                ) : null}
                <p className="said">
                  <Words text={result.reaction} />
                </p>
              </>
            ) : hidden ? (
              <p className="said said-audio">
                <span className="ja-body">声だけの用件。「聞く」で聞く（音声が使えないときは「文字で読む」）。</span>
              </p>
            ) : task?.say ? (
              <p className="said">
                <Words text={task.say} />
              </p>
            ) : (
              <p className="said ja-body">書類が回ってきた。</p>
            )}
          </Bubble>
        ) : null}

        {part === 2 ? <SummaryCard box={g.summary} /> : null}
      </Stage>
    </Frame>
  );
}

// ------------------------------------------------------------------------------------------------ the work itself

function TaskSurface({ task, work, setWork, locked, hidden }: { task: TaskInstance; work: Work; setWork: (w: Work) => void; locked: boolean; hidden: boolean }) {
  const { data } = useGame();
  const job = jobById(data, 'clinic')!;
  const jc = jobContent(data, job)!;
  const sp = task.spec;
  if (sp.arch === 'sort' && work.arch === 'sort') {
    const bins = sp.bins.map((b) => jc.sort?.bins.find((x) => x.id === b) ?? { id: b, label: b, ref: b });
    return (
      <div className="sort">
        <div className="tray in-tray" aria-label="受付箱">
          <span className="ja-label">受付箱（1枚選んで、行き先の札を押す）</span>
          <ul>
            {sp.items.map((it) => {
              const at = work.placed[it.id];
              return (
                <li key={it.id}>
                  <button className={`chart ${work.pick === it.id ? 'picked' : ''} ${at ? 'placed' : ''}`} disabled={locked} onClick={() => setWork({ ...work, pick: it.id })} aria-pressed={work.pick === it.id}>
                    <span className="radio" aria-hidden />
                    <span className="chart-text">
                      <Words text={it.text} live={work.pick === it.id || locked} />
                    </span>
                    {at ? (
                      <span className="chart-to" lang="en">
                        → {bins.find((b) => b.id === at)?.label}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="pockets" aria-label="行き先">
          {bins.map((b) => {
            const n = Object.values(work.placed).filter((x) => x === b.id).length;
            return (
              <button
                key={b.id}
                className="pocket"
                disabled={locked || !work.pick}
                onClick={() => {
                  if (!work.pick) return;
                  const placed = { ...work.placed, [work.pick]: b.id };
                  setWork({ ...work, placed, pick: null });
                }}
              >
                <span className="pocket-label" lang="en">
                  {plain(b.label)}
                </span>
                <span className="pocket-n">{n ? `${n}枚` : ''}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  if (sp.arch === 'check' && work.arch === 'check') {
    const others = sp.docs.map((d, i) => ({ d, i })).filter((x) => x.i !== sp.target);
    const ref = others.find((x) => x.i === work.view) ?? others[0];
    return (
      <div className="check">
        {others.length > 1 ? (
          <div className="doc-tabs" role="tablist" aria-label="ほかの書類">
            {others.map((o) => (
              <button key={o.i} role="tab" aria-selected={o.i === ref?.i} className={o.i === ref?.i ? 'on' : ''} onClick={() => setWork({ ...work, view: o.i })} lang="en">
                {o.d.title ?? 'Paper'}
              </button>
            ))}
          </div>
        ) : null}
        <div className="docs">
          {ref ? <Doc doc={ref.d} small /> : null}
          <Doc
            doc={sp.docs[sp.target]}
            active
            stamped={locked ? work.stamped : undefined}
            circled={work.field}
            onLine={locked ? undefined : (f) => setWork({ ...work, field: work.field === f ? null : f, fix: null })}
          />
        </div>
        {sp.fixOptions?.length && work.field ? (
          <div className="fix">
            <span className="ja-label">正しい値は？</span>
            <div className="opts">
              {sp.fixOptions.map((o) => (
                <button key={o} className={`opt ${work.fix === o ? 'on' : ''}`} disabled={locked} onClick={() => setWork({ ...work, fix: o })} lang="en">
                  {plain(o)}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <p className="ja-label hint">違う行があれば、ペンで丸をつけてから「違う所あり」。同じなら「問題なし」。</p>
      </div>
    );
  }
  if (sp.arch === 'respond' && work.arch === 'respond') {
    const msgDoc = !hidden ? <Message msg={sp.msg} /> : <div className="paper doc doc-hidden ja-body">（声だけ。文字は伏せてある）</div>;
    if (sp.mode === 'choose')
      return (
        <div className="respond">
          {sp.msg.kind === 'speech' && hidden ? null : msgDoc}
          <div className="replies" role="radiogroup" aria-label="返事">
            <span className="ja-label">{sp.msg.kind === 'speech' ? '答える言葉を選ぶ' : '返事の札を選ぶ'}</span>
            {(sp.options ?? []).map((o, i) => (
              <button key={i} role="radio" aria-checked={work.choice === i} className={`reply ${work.choice === i ? 'on' : ''}`} disabled={locked} onClick={() => setWork({ ...work, choice: i })}>
                <span className="radio" aria-hidden />
                <Words text={o} live={work.choice === i || locked} />
              </button>
            ))}
          </div>
        </div>
      );
    if (sp.mode === 'form')
      return (
        <div className="respond">
          {msgDoc}
          <div className="pad" aria-label="伝言用紙">
            <span className="ja-label">伝言用紙（聞いたことを書く）</span>
            {(sp.fields ?? []).map((f) => (
              <div key={f.id} className="pad-row">
                <span className="pad-label" lang="en">
                  <Words text={f.label} />
                </span>
                <div className="opts">
                  {f.options.map((o) => (
                    <button key={o} className={`opt ${work.fields[f.id] === o ? 'on' : ''}`} disabled={locked} onClick={() => setWork({ ...work, fields: { ...work.fields, [f.id]: o } })} lang="en">
                      {plain(o)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    if (sp.mode === 'slot' && sp.slot) {
      const sl = sp.slot;
      return (
        <div className="respond">
          {msgDoc}
          <div className="book-grid" aria-label="予約帳">
            <span className="ja-label">予約帳（空いている枠を一つ選ぶ）</span>
            <table>
              <thead>
                <tr>
                  <th />
                  {sl.cols.map((c) => (
                    <th key={c.id} lang="en">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sl.rows.map((r) => (
                  <tr key={r.id}>
                    <th lang="en">
                      <Words text={r.label} />
                    </th>
                    {sl.cols.map((c) => {
                      const cell = sl.cells.find((x) => x.row === r.id && x.col === c.id);
                      if (!cell) return <td key={c.id} />;
                      return (
                        <td key={c.id}>
                          {cell.busy ? (
                            <span className="busy" lang="en">
                              <Words text={cell.busy} />
                            </span>
                          ) : (
                            <button className={`free ${work.slot === cell.id ? 'on' : ''}`} disabled={locked} onClick={() => setWork({ ...work, slot: cell.id })} aria-label={`${r.label} ${c.label}`}>
                              {work.slot === cell.id ? <Icon name="pen" size={18} /> : null}
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  }
  return null;
}

function Message({ msg }: { msg: { kind: string; from?: string; subject?: string; lines: string[] } }) {
  const kindJa: Record<string, string> = { letter: '手紙', email: 'メール', phone: '電話', memo: '掲示・メモ', speech: '話' };
  return (
    <div className={`paper doc msg msg-${msg.kind}`}>
      <span className="ja-label doc-kind">{kindJa[msg.kind] ?? msg.kind}</span>
      {msg.from ? (
        <p className="msg-from" lang="en">
          <Words text={msg.from} />
        </p>
      ) : null}
      {msg.subject ? (
        <p className="msg-subj" lang="en">
          <Words text={msg.subject} />
        </p>
      ) : null}
      {msg.lines.map((l, i) => (
        <p key={i} className="doc-line">
          <Words text={l} />
        </p>
      ))}
    </div>
  );
}

function Doc({ doc, active, small, circled, onLine, stamped }: { doc: CheckDoc; active?: boolean; small?: boolean; circled?: string | null; onLine?: (field: string) => void; stamped?: 'ok' | 'fix' }) {
  const fields = doc.fields ?? [];
  const lines = useMemo(() => doc.lines ?? [], [doc]);
  return (
    <div className={`paper doc doc-${doc.kind} ${active ? 'doc-active' : ''} ${small ? 'doc-ref' : ''}`}>
      {doc.title ? (
        <h4 className="doc-title" lang="en">
          <Words text={doc.title} />
        </h4>
      ) : null}
      {active ? <span className="ja-label doc-kind">確かめる書類</span> : <span className="ja-label doc-kind">見比べる書類</span>}
      {fields.length ? (
        <dl className="doc-fields">
          {fields.map((f) => (
            <div key={f.id} className={`doc-field ${circled === f.id ? 'circled' : ''}`}>
              <dt lang="en">
                <Words text={f.label} />
              </dt>
              <dd lang="en">
                {onLine ? (
                  <button className="line-btn" onClick={() => onLine(f.id)} aria-pressed={circled === f.id} aria-label={`${plain(f.label)} の行に丸をつける`}>
                    {plain(f.value)}
                  </button>
                ) : (
                  <span className="line-done">
                    <Words text={f.value} />
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {lines.map((l, i) => (
        <p key={i} className="doc-line">
          <Words text={l} />
        </p>
      ))}
      {stamped ? (
        <span className={`imprint imprint-${stamped}`} aria-label={stamped === 'ok' ? '押したはんこ：問題なし' : '押したはんこ：違う所あり'}>
          {stamped === 'ok' ? '問題なし' : '違う所あり'}
        </span>
      ) : null}
    </div>
  );
}

export const CLINIC_SUPPLY_IDS = CLINIC_SUPPLIES.map((c) => c.id);
