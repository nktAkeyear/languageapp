/**
 * The clinic's reception (a paper-desk job with the same grammar): the Back room keeps the desk supplies (folders,
 * ink, paper, cards — counted, ordered on the same order form); the Front is the desk: the person and their words
 * on the big card, an in-tray of documents with the active one enlarged, the pen (circle a line) and the stamps in
 * the dock. Tasks are the existing jobs engine's (src/jobs): sort, check, respond (reply / message pad / book).
 */
import { useEffect, useMemo, useState } from 'react';
import { plain } from '../../core/gamedata';
import { currentShift, currentTask, jobById, jobContent } from '../../jobs/engine';
import { personOf } from '../../jobs/templates';
import type { CheckDoc, TaskAnswer, TaskInstance } from '../../jobs/types';
import { CustomerArt, expressionFor, lookFor } from '../../ui/art/customer';
import { clinicNext, clinicSubmit, closeWork, endDay, goRoom, morningNote, openWork, supplyFor } from '../logic/day';
import { CLINIC_SUPPLIES } from '../logic/catalog';
import { DoorArt } from './art';
import { Icon, ListenButton, ReadingCard, Words } from './bits';
import { Shelf, Summary, DeskObjects, WallObjects } from './back';
import { CrateDrop, Dock, Frame, Receipts, type Primary } from './frame';
import { useGame, useS } from './store';

const SUPPLY_JA: Record<string, string> = { folder: '紙ばさみ', ink: 'インク', paper: '伝言用紙', card: '予約カード' };

export function ClinicBack() {
  const s = useS();
  const { data, act, layout } = useGame();
  const part = s.day.part;
  const lines = morningNote(data, s);
  const primary: Primary =
    part === 0
      ? { label: '受付を開ける', onClick: () => act((st, c) => openWork(st, c)), id: 'open-shop' }
      : part === 2
        ? { label: '一日を終える', onClick: () => act((st, c) => endDay(st, c)), id: 'end-day' }
        : { label: '受付に出る', onClick: () => act((st) => void goRoom(st, 'front')), id: 'to-front' };
  return (
    <Frame roomClass={`room-back clinic ${part === 2 ? 'evening' : ''}`} dock={<Dock primary={primary} />}>
      <div className={`back back-${layout}`}>
        <div className="wall-note">
          {part === 2 ? (
            <Summary />
          ) : (
            <ReadingCard kind="note" who={<span className="ja-label">受付主任のメモ</span>} tools={<ListenButton text={lines.join(' ')} />}>
              {lines.map((l, i) => (
                <p key={i} className={i === 0 ? 'note-first' : 'note-line'}>
                  <Words text={l} />
                </p>
              ))}
              <p className="ja-label note-help">机の上の品は仕事で減る：書類の振り分けに紙ばさみ、はんこにインク、伝言に用紙、予約にカード。</p>
            </ReadingCard>
          )}
            {layout === 'desk' ? <WallObjects /> : null}
        </div>
        <div className="wall-right">
          <Shelf />
          {layout === 'desk' ? (
            <button className={`door ${part === 0 ? 'door-live' : ''}`} disabled={part !== 0} onClick={() => act((st, c) => openWork(st, c))} aria-label="受付を開ける">
              <DoorArt sign={part === 0 ? '準備中' : part === 1 ? '受付中' : '終了'} lit={part === 1} />
              {part === 0 ? <span className="door-label">札を返して受付開始</span> : null}
            </button>
          ) : null}
        </div>
        <div className="workbench">
          <DeskObjects wall={layout === 'desk'} />
          <CrateDrop persistentToday={part === 0} />
        </div>
      </div>
    </Frame>
  );
}

// ------------------------------------------------------------------------------------------------ the desk

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

export function ClinicDesk() {
  const s = useS();
  const { data, act, layout, reduced, openOrder } = useGame();
  const sh = currentShift(s.p);
  const task = currentTask(s.p);
  const job = jobById(data, 'clinic')!;
  const jc = jobContent(data, job)!;
  const part = s.day.part;
  const [work, setWork] = useState<Work | null>(() => freshWork(task));
  const [blocked, setBlocked] = useState<string | null>(null);
  const [reveal, setReveal] = useState(false);
  const [talk, setTalk] = useState(false);
  const key = task ? `${task.key}-${sh?.index}` : 'none';
  useEffect(() => {
    setWork(freshWork(task));
    setBlocked(null);
    setReveal(false);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const phaseKey = `${key}-${sh?.phase}`;
  useEffect(() => {
    if (reduced) return;
    setTalk(true);
    const id = window.setTimeout(() => setTalk(false), 1400);
    return () => window.clearTimeout(id);
  }, [phaseKey, reduced]);

  if (part !== 1 || !sh) return <DeskClosed />;
  const result = sh.phase === 'result' ? sh.results[sh.results.length - 1] : null;
  const done = sh.phase === 'done';
  const person = task ? personOf(data, jc, task.handover ? jc.boss : task.person) : personOf(data, jc, jc.boss);
  const look = lookFor(person.id, person.avatar);
  const ex = result ? expressionFor(result.face, null) : 'neutral';
  const hidden = !!task?.audioOnly && !reveal && !result;
  const locked = !!result || done;

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
  const sup = task ? supplyFor(task) : null;

  let primary: Primary | null = null;
  let extra: React.ReactNode = null;
  if (done) primary = { label: '受付を閉める', onClick: () => act((st) => closeWork(st)), id: 'close-shop' };
  else if (result) primary = { label: sh.index + 1 >= sh.tasks.length ? '仕事を終える' : '次の人', onClick: () => act((st, c) => clinicNext(st, c)), id: 'next' };
  else if (task?.spec.arch === 'check' && work?.arch === 'check') {
    const sp = task.spec;
    const needFix = !!sp.fixOptions?.length;
    extra = (
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
    primary = { label: task?.spec.arch === 'sort' ? '振り分けて渡す' : task?.spec.arch === 'respond' && task.spec.msg.kind === 'speech' ? 'こう答える' : '渡す', onClick: () => submit(a), disabled: !a, id: 'submit' };
  }

  return (
    <Frame roomClass="room-front desk-room" dock={<Dock primary={primary} extra={extra} />}>
      <div className={`front front-${layout} clinic-desk`}>
        <section className="ask">
          <div className={`person ${result ? `face-${result.face}` : ''}`} key={person.id}>
            <CustomerArt look={look} ex={ex} pose={result ? 'open' : 'rest'} talking={talk} />
          </div>
          <ReadingCard
            who={
              <>
                <span className="who-name" lang="en">{person.name}</span>
                <span className="ja-label">{done ? '今日の仕事はここまで' : `${sh.index + 1}件目／${sh.tasks.length}件`}</span>
              </>
            }
            tools={
              <>
                <ListenButton text={result ? result.reaction : done ? sh.endLine : task?.say ?? ''} />
                {task?.audioOnly && !result ? (
                  <button className="btn-quiet" onClick={() => setReveal((x) => !x)}>
                    {reveal ? '文字を隠す' : '文字で読む'}
                  </button>
                ) : null}
              </>
            }
          >
            {done ? (
              <p className="said">
                <Words text={sh.endLine || 'Thank you. See you tomorrow.'} />
              </p>
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
          </ReadingCard>
        </section>
        <section className={`surface paper-desk ${locked ? 'locked' : ''}`} aria-label="机">
          {task && work && !done ? <TaskSurface task={task} work={work} setWork={setWork} locked={locked} hidden={hidden} /> : <div className="desk-empty ja-body">机の上は片づいた。</div>}
          <div className="front-side">
            {blocked ? (
              <div className="blocked" role="alert">
                <p>{SUPPLY_JA[blocked] ?? blocked}が切れている。注文書で頼むと、すぐ届く。</p>
                <button className="btn-secondary" id="order-supply" onClick={() => openOrder({ [blocked]: 1 })}>
                  <Icon name="form" size={18} /> 注文書で頼む
                </button>
              </div>
            ) : sup && !locked ? (
              <p className="ja-label uses">この仕事で使う：{SUPPLY_JA[sup]} 1</p>
            ) : null}
            <Receipts compact />
            <CrateDrop />
          </div>
        </section>
      </div>
    </Frame>
  );
}

function DeskClosed() {
  const s = useS();
  const { act } = useGame();
  const part = s.day.part;
  const primary: Primary = part === 0 ? { label: '受付を開ける', onClick: () => act((st, c) => openWork(st, c)), id: 'open-shop' } : { label: '作業場へ', onClick: () => act((st) => void goRoom(st, 'back')) };
  return (
    <Frame roomClass={`room-front closed ${part === 2 ? 'evening' : ''}`} dock={<Dock primary={primary} />}>
      <div className="front-closed">
        <DoorArt sign={part === 0 ? '準備中' : '終了'} lit={false} />
        <p className="ja-body">{part === 0 ? 'まだ受付を開けていない。' : '今日の受付は終わった。'}</p>
      </div>
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
