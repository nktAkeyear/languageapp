/**
 * Benches of the make, check and respond archetypes, drawn as the workplace's furniture.
 * - Make (the kitchen): the pantry shelves with every ingredient in its jar / crate and a paper label (what the
 *   pantry is out of today stands empty), the stations (the stove with pan / pot / steamer, the grill, the oven),
 *   the rack of plates, bowls, cups …, and the dish on the pass. Drag an ingredient into the dish (or tap it), tap
 *   a portion to take it back; the order things went in is numbered (a recipe card's steps). A request that is a
 *   recipe card / menu / note is pinned up as that paper.
 * - Check (the desk): the papers laid out as the documents they are; circle the line that disagrees with the red
 *   pen (tap it), choose the right value when asked, then stamp: 問題なし (all in order) or 差し戻す (send back).
 *   After handing in, the papers show the player's own pen mark and stamp only (no verdict): what was wrong is in
 *   the person's reply.
 * - Respond: the message as what it is — the telephone (ringing; heard only at higher ranks), an e-mail on the
 *   screen, a letter, a notice on the board — and the reply: reply slips on the counter, the message pad by the
 *   telephone, the wall calendar, the inn's floor board (hang the key on the one free room).
 */
import { useEffect, useState } from 'react';
import { wordMarkup } from '../../core/gamedata';
import type { CheckSpec, MakeSpec, RespondSpec } from '../../jobs/types';
import { SpeakButton, WordText } from '../components/WordText';
import { useSpeechAvailable } from '../speech';
import { sfx } from '../sound';
import { useGame } from '../useGame';
import { useReducedMotion } from '../uiState';
import { FoodArt } from './art2';
import { useDragDrop } from './drag';
import { KeyArt, PenArt, PhoneArt, StampToolArt, StationArt } from './furniture';
import { Paper, paperFromSay, type PaperKind } from './papers';
import type { BenchProps } from './JobScene';

// ------------------------------------------------------------------------------------- make

export function MakeBench({ task, jc, result, onSubmit }: BenchProps) {
  const { data } = useGame();
  const spec = task.spec as MakeSpec & { arch: 'make' };
  const bench = jc.make!;
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [seq, setSeq] = useState<string[]>([]);
  const [vessel, setVessel] = useState<string | null>(null);
  const [method, setMethod] = useState<string | null>(null);
  const [splash, setSplash] = useState(0);
  const done = !!result;
  const pantry = jc.things.filter((t) => !t.tags?.includes('counter') && !t.tags?.includes('delivery'));
  const out = new Set(spec.out ?? []);
  const add = (id: string, d: number) => {
    if (done || (d > 0 && out.has(id))) return;
    sfx(d > 0 ? 'plop' : 'pickup');
    const n = Math.max(0, Math.min(bench.max, (counts[id] ?? 0) + d));
    setCounts({ ...counts, [id]: n });
    // The order things first went in (a recipe card's steps); taking one out entirely forgets its place.
    setSeq(n > 0 ? (seq.includes(id) ? seq : [...seq, id]) : seq.filter((x) => x !== id));
    if (d > 0) setSplash((k) => k + 1);
  };
  const { drag, zone, start } = useDragDrop<string>((item, z) => z === 'dish' && add(item, 1), !done);
  const any = Object.values(counts).some((n) => n > 0);
  const vArt = vessel ? (bench.vessels?.find((v) => v.id === vessel)?.art ?? 'plate') : 'plate';
  const card = paperFromSay(task.say);
  const stations = bench.methods ?? [];
  const groups: { where: string; ms: typeof stations }[] = [];
  for (const m of stations) {
    const w = m.where ?? 'stove';
    const g = groups.find((x) => x.where === w);
    if (g) g.ms.push(m);
    else groups.push({ where: w, ms: [m] });
  }
  const dragged = drag ? pantry.find((t) => t.id === drag.item) : null;
  return (
    <div className="makeb" data-testid="make-bench">
      <div className="makeb-pantry" aria-label="食料の棚">
        {pantry.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`makeb-item ${out.has(t.id) ? 'out' : ''}`}
            onPointerDown={(e) => !out.has(t.id) && start(t.id, e)}
            onClick={() => add(t.id, 1)}
            disabled={done || out.has(t.id)}
            data-thing={t.id}
            data-out={out.has(t.id) ? '1' : undefined}
          >
            <span className="makeb-jar">{out.has(t.id) ? <span className="makeb-empty" aria-hidden /> : <FoodArt art={t.art} size={46} />}</span>
            <span className="makeb-name">
              <WordText text={wordMarkup(data!, t.word)} interactive={false} />
            </span>
          </button>
        ))}
      </div>
      <div className="makeb-stations" aria-label="調理場">
        {groups.map((g) => (
          <div key={g.where} className={`makeb-station st-${g.where}`}>
            {g.ms.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`makeb-tool ${method === m.id ? 'on' : ''}`}
                onClick={() => {
                  sfx(m.id === 'boil' || m.id === 'steam' ? 'simmer' : m.id === 'fry' || m.id === 'grill' ? 'chop' : 'tick');
                  setMethod(method === m.id ? null : m.id);
                }}
                disabled={done}
                data-method={m.id}
                aria-pressed={method === m.id}
              >
                <StationArt kind={m.id} on={method === m.id} />
                <span className="makeb-toolname">
                  <WordText text={wordMarkup(data!, m.word)} interactive={false} />
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
      {bench.vessels?.length ? (
        <div className="makeb-rack" aria-label="器の棚">
          {bench.vessels.map((v) => (
            <button key={v.id} type="button" className={`makeb-vtool ${vessel === v.id ? 'on' : ''}`} onClick={() => (sfx('clink'), setVessel(vessel === v.id ? null : v.id))} disabled={done} data-vessel={v.id} aria-pressed={vessel === v.id}>
              <FoodArt art={v.art} size={44} />
              <WordText text={wordMarkup(data!, v.word)} interactive={false} />
            </button>
          ))}
        </div>
      ) : null}
      {card ? (
        <div className="makeb-card">
          <Paper kind={card.kind} title={card.title} lines={card.lines} />
        </div>
      ) : null}
      <div ref={zone('dish')} className={`makeb-dish ${method ? `cooked-${method}` : ''} ${drag?.over === 'dish' ? 'over' : ''}`} aria-label="料理" data-testid="dish">
        <span className="makeb-pass" aria-hidden />
        <span className="makeb-vessel" key={vArt}>
          <FoodArt art={vArt} size={200} />
        </span>
        <span className="makeb-onplate" key={splash}>
          {seq
            .filter((id) => (counts[id] ?? 0) > 0)
            .map((id, i) => {
              const t = jc.things.find((x) => x.id === id)!;
              return (
                <button key={id} type="button" className="makeb-portion" onClick={() => add(id, -1)} disabled={done} title="ひとつ戻す" data-portion={id}>
                  <FoodArt art={t.art} size={44} />
                  <span className="makeb-n">×{counts[id]}</span>
                  {spec.order?.length ? <span className="makeb-step">{i + 1}</span> : null}
                </button>
              );
            })}
        </span>
        {method ? <span className={`makeb-cooked m-${method}`} aria-hidden /> : null}
      </div>
      {dragged && drag ? (
        <div className="drag-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden>
          <FoodArt art={dragged.art} size={64} />
        </div>
      ) : null}
      {!done ? (
        <button type="button" className="cv-btn cv-next js-submit" disabled={!any} onClick={() => (sfx('serve'), onSubmit({ arch: 'make', counts, vessel, method, seq }))} data-testid="submit">
          出す
        </button>
      ) : null}
    </div>
  );
}

// ------------------------------------------------------------------------------------- check

export function CheckDesk({ task, result, onSubmit }: BenchProps) {
  const spec = task.spec as CheckSpec & { arch: 'check' };
  const [field, setField] = useState<string | null>(null);
  const [fix, setFix] = useState<string | null>(null);
  const [stamping, setStamping] = useState<'ok' | 'ng' | null>(null);
  const rm = useReducedMotion();
  const done = !!result;
  const needFix = !!spec.fixOptions?.length && !!field;
  const papers = spec.docs.map((d, i) => ({ d, i })).filter((x) => x.d.kind !== 'speech');
  const stamp = (ok: boolean) => {
    if (done || stamping) return;
    setStamping(ok ? 'ok' : 'ng');
    sfx('stamp');
    window.setTimeout(() => onSubmit(ok ? { arch: 'check', verdict: 'ok' } : { arch: 'check', verdict: 'fix', field: field ?? undefined, fix: fix ?? undefined }), rm ? 0 : 420);
  };
  return (
    <div className={`checkd n-${papers.length}`} data-testid="check-desk">
      <div className="checkd-docs">
        {papers.map(({ d, i }) => (
          <Paper
            key={i}
            dataDoc={i}
            kind={d.kind}
            title={d.title}
            fields={d.fields}
            lines={d.lines}
            target={i === spec.target}
            marked={i === spec.target ? field : null}
            truth={null}
            stamped={i === spec.target ? stamping : null}
            disabled={done || !!stamping}
            onField={(id) => {
              sfx('write');
              setField(field === id ? null : id);
              setFix(null);
            }}
          >
            {i === spec.target ? <span className="checkd-clip" aria-hidden /> : null}
          </Paper>
        ))}
      </div>
      {needFix && !done ? (
        <div className="checkd-fix">
          <span className="hand small">正しくは：</span>
          {spec.fixOptions!.map((o) => (
            <button key={o} type="button" className={`reply-chip hand-chip ${fix === o ? 'on' : ''}`} onClick={() => (sfx('write'), setFix(o))} data-fix={o}>
              <WordText text={o} interactive={false} />
            </button>
          ))}
        </div>
      ) : null}
      {!done ? (
        <div className="checkd-tools">
          <span className="checkd-pen" aria-hidden>
            <PenArt />
          </span>
          <span className="hand small checkd-hint">{field ? '印をつけた。' : '違う欄があれば、ペンで丸をつける（欄を押す）。'}</span>
          <button type="button" className={`checkd-stamp ok ${stamping === 'ok' ? 'down' : ''}`} onClick={() => stamp(true)} disabled={!!stamping} data-testid="check-ok">
            <StampToolArt ok />
            <span>問題なし</span>
          </button>
          <button type="button" className={`checkd-stamp ng ${stamping === 'ng' ? 'down' : ''}`} disabled={!field || (needFix && !fix) || !!stamping} onClick={() => stamp(false)} data-testid="check-fix">
            <StampToolArt ok={false} />
            <span>差し戻す</span>
          </button>
        </div>
      ) : (
        <p className="hand small muted checkd-after">{stamping === 'ng' ? '差し戻しの判を押して渡した。' : '問題なしの判を押して渡した。'}</p>
      )}
    </div>
  );
}

// ------------------------------------------------------------------------------------- respond

const MSG_JA: Record<string, string> = { letter: '手紙', email: 'メール', phone: '電話', memo: '貼り紙', speech: '' };

export function RespondDesk({ task, result, onSubmit }: BenchProps) {
  const spec = task.spec as RespondSpec & { arch: 'respond' };
  const [choice, setChoice] = useState<number | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [slot, setSlot] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const done = !!result;
  const { lang } = useGame();
  const canSpeak = useSpeechAvailable(lang ?? 'en');
  const phone = spec.msg.kind === 'phone';
  const heardOnly = phone && task.audioOnly && canSpeak && !done;
  // The telephone rings until it is picked up.
  useEffect(() => {
    if (!phone || answered || done) return;
    sfx('bell');
    const t = window.setInterval(() => sfx('bell'), 2600);
    return () => window.clearInterval(t);
  }, [phone, answered, done]);
  const ready = spec.mode === 'choose' ? choice !== null : spec.mode === 'form' ? (spec.fields ?? []).every((f) => fields[f.id]) : !!slot;
  const showText = !phone || (answered && !heardOnly) || done;
  const paperKind: PaperKind = spec.msg.kind === 'email' ? 'email' : spec.msg.kind === 'memo' ? 'memo' : 'letter';
  return (
    <div className={`respd respd-${spec.mode} msgk-${spec.msg.kind}`} data-testid="respond-desk">
      {phone ? (
        <div className={`respd-phone ${answered ? 'answered' : ''}`} data-testid={heardOnly ? 'phone-audio' : 'phone'}>
          <button type="button" className="respd-phone-btn" onClick={() => (sfx('pickup'), setAnswered(true))} disabled={done} aria-label="電話に出る">
            <PhoneArt ringing={!answered && !done} />
          </button>
          {!answered && !done ? <span className="hand small">電話が鳴っている：受話器を取る</span> : null}
          {answered || done ? (
            <div className="respd-receiver">
              <span className="hand small">{heardOnly ? '電話（耳だけで聞く）' : MSG_JA.phone}</span>
              <SpeakButton text={spec.msg.lines.join(' ')} label={heardOnly ? '聞く' : ''} big={heardOnly} className={heardOnly ? '' : 'speak-round'} />
              {showText ? (
                <div className="respd-calltext" lang="en">
                  {spec.msg.lines.map((l, i) => (
                    <p key={i}>
                      <WordText text={l} />
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : spec.msg.kind !== 'speech' ? (
        <div className={`respd-msg msg-${spec.msg.kind}`}>
          <span className="hand small respd-kind">{MSG_JA[spec.msg.kind]}</span>
          <Paper kind={paperKind} lines={spec.msg.lines} head={{ from: spec.msg.from, subject: spec.msg.subject }}>
            <SpeakButton text={spec.msg.lines.join(' ')} label="" className="speak-round paper-speak" />
          </Paper>
        </div>
      ) : null}
      {spec.mode === 'choose' ? (
        <div className="respd-replies" role="radiogroup" aria-label="返事">
          <span className="hand small">{phone ? '電話で答える' : spec.msg.kind === 'speech' ? 'こう答える：' : '返事を選ぶ：'}</span>
          {spec.options!.map((o, i) => (
            <button
              key={i}
              type="button"
              className={`reply-slip ${choice === i ? 'on' : ''}`}
              style={{ ['--tilt' as string]: `${((i * 53) % 5) - 2}deg` }}
              onClick={() => (sfx('paper'), setChoice(i))}
              disabled={done || (phone && !answered)}
              data-option={i}
              role="radio"
              aria-checked={choice === i}
            >
              <WordText text={o} interactive={false} />
            </button>
          ))}
        </div>
      ) : null}
      {spec.mode === 'form' ? (
        <div className="respd-pad" aria-label="伝言メモ">
          <span className="respd-pad-top" aria-hidden />
          {spec.fields!.map((f) => (
            <div key={f.id} className="respd-field">
              <span className="respd-flabel">
                <WordText text={f.label} interactive={false} />
              </span>
              <span className="respd-chips">
                {f.options.map((o) => (
                  <button
                    key={o}
                    type="button"
                    className={`reply-chip hand-chip ${fields[f.id] === o ? 'on' : ''}`}
                    onClick={() => (sfx('write'), setFields((x) => ({ ...x, [f.id]: o })))}
                    disabled={done || (phone && !answered)}
                    data-chip={`${f.id}:${o}`}
                  >
                    <WordText text={o} interactive={false} />
                  </button>
                ))}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      {spec.mode === 'slot' && spec.slot ? <SlotGrid slot={spec.slot} pick={slot} onPick={(id) => (sfx(spec.slot!.layout === 'rooms' ? 'clink' : 'write'), setSlot(id))} done={done} /> : null}
      {!done ? (
        <button
          type="button"
          className="cv-btn cv-next js-submit"
          disabled={!ready}
          onClick={() => onSubmit({ arch: 'respond', ...(spec.mode === 'choose' ? { choice: choice ?? undefined } : spec.mode === 'form' ? { fields } : { slot: slot ?? undefined }) })}
          data-testid="submit"
        >
          {spec.mode === 'choose' ? 'こう答える' : spec.mode === 'form' ? '書いて渡す' : spec.slot?.layout === 'rooms' ? 'この部屋にする' : 'ここに決める'}
        </button>
      ) : null}
    </div>
  );
}

/** The wall calendar (days × times) or the inn's floor board (floors × rooms; the key hangs on the room chosen). */
function SlotGrid({ slot, pick, onPick, done }: { slot: NonNullable<RespondSpec['slot']>; pick: string | null; onPick: (id: string) => void; done: boolean }) {
  const rooms = slot.layout === 'rooms';
  return (
    <div className={`slotg slotg-${slot.layout}`} data-testid="slot-grid">
      {rooms ? <span className="slotg-roof" aria-hidden /> : <span className="slotg-rings" aria-hidden />}
      <div className="slotg-grid" style={{ gridTemplateColumns: `auto repeat(${slot.cols.length}, 1fr)` }}>
        <span className="slotg-corner" />
        {slot.cols.map((c) => (
          <span key={c.id} className="slotg-col">
            <WordText text={c.label} interactive={false} />
          </span>
        ))}
        {slot.rows.map((r) => (
          <div key={r.id} className="slotg-rowwrap" style={{ display: 'contents' }}>
            <span className="slotg-row">
              <WordText text={r.label} interactive={false} />
            </span>
            {slot.cols.map((c) => {
              const cell = slot.cells.find((x) => x.row === r.id && x.col === c.id);
              if (!cell) return <span key={c.id} />;
              return cell.busy ? (
                <span key={c.id} className="slotg-cell busy">
                  <WordText text={cell.busy} interactive={false} />
                </span>
              ) : (
                <button
                  key={c.id}
                  type="button"
                  className={`slotg-cell free ${pick === cell.id ? 'on' : ''}`}
                  onClick={() => onPick(cell.id)}
                  disabled={done}
                  data-cell={cell.id}
                  aria-pressed={pick === cell.id}
                >
                  {pick === cell.id ? rooms ? <KeyArt /> : <span className="slotg-ink">●</span> : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
