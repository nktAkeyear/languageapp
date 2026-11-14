/**
 * Benches of the make, check and respond archetypes.
 * - Make (the kitchen pass): the pantry, the dish (plate / bowl / box), the cooking station
 *   (pan / pot / grill); tap an item to add a portion, tap it on the dish to take it back.
 * - Check (the desk): papers side by side; read, then stamp 問題なし, or mark the line that is wrong
 *   (and, at higher ranks, choose the right value) and send it back.
 * - Respond: the message (letter, e-mail, phone, memo, or what the person says), then the reply:
 *   choose a reply slip, fill a form with chips, or pick the one free slot on a calendar / the
 *   inn's floors that fits.
 */
import { useState } from 'react';
import { wordMarkup } from '../../core/gamedata';
import type { CheckSpec, MakeSpec, RespondSpec } from '../../jobs/types';
import { SpeakButton, WordText } from '../components/WordText';
import { sfx } from '../sound';
import { useGame } from '../useGame';
import { DocArt, FoodArt } from './art2';
import type { BenchProps } from './JobScene';

// ------------------------------------------------------------------------------------- make

export function MakeBench({ task, jc, result, onSubmit }: BenchProps) {
  const { data } = useGame();
  const spec = task.spec as MakeSpec & { arch: 'make' };
  const bench = jc.make!;
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [vessel, setVessel] = useState<string | null>(null);
  const [method, setMethod] = useState<string | null>(null);
  const done = !!result;
  const pantry = jc.things.filter((t) => !t.tags?.includes('counter'));
  const add = (id: string, d: number) => {
    if (done) return;
    sfx(d > 0 ? 'plop' : 'pickup');
    setCounts((c) => ({ ...c, [id]: Math.max(0, Math.min(bench.max, (c[id] ?? 0) + d)) }));
  };
  const any = Object.values(counts).some((n) => n > 0);
  const vArt = vessel ? (bench.vessels?.find((v) => v.id === vessel)?.art ?? 'plate') : 'plate';
  return (
    <div className="makeb" data-testid="make-bench">
      <div className="makeb-pantry" aria-label="食材">
        {pantry.map((t) => (
          <button key={t.id} type="button" className="makeb-item" onClick={() => add(t.id, 1)} disabled={done} data-thing={t.id}>
            <FoodArt art={t.art} size={50} />
            <span className="makeb-name">
              <WordText text={wordMarkup(data!, t.word)} interactive={false} />
            </span>
          </button>
        ))}
      </div>
      <div className="makeb-stations">
        {bench.vessels?.length ? (
          <div className="makeb-row" aria-label="器">
            {bench.vessels.map((v) => (
              <button key={v.id} type="button" className={`makeb-tool ${vessel === v.id ? 'on' : ''}`} onClick={() => (sfx('clink'), setVessel(vessel === v.id ? null : v.id))} disabled={done} data-vessel={v.id} aria-pressed={vessel === v.id}>
                <FoodArt art={v.art} size={40} />
                <WordText text={wordMarkup(data!, v.word)} interactive={false} />
              </button>
            ))}
          </div>
        ) : null}
        {bench.methods?.length ? (
          <div className="makeb-row" aria-label="調理">
            {bench.methods.map((m) => (
              <button key={m.id} type="button" className={`makeb-tool ${method === m.id ? 'on' : ''}`} onClick={() => (sfx(m.id === 'boil' ? 'simmer' : 'chop'), setMethod(method === m.id ? null : m.id))} disabled={done} data-method={m.id} aria-pressed={method === m.id}>
                <FoodArt art={m.art} size={40} />
                <WordText text={wordMarkup(data!, m.word)} interactive={false} />
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className={`makeb-dish ${method ? `cooked-${method}` : ''}`} aria-label="料理">
        <span className="makeb-vessel">
          <FoodArt art={vArt} size={150} />
        </span>
        <span className="makeb-onplate">
          {Object.entries(counts)
            .filter(([, n]) => n > 0)
            .map(([id, n]) => {
              const t = jc.things.find((x) => x.id === id)!;
              return (
                <button key={id} type="button" className="makeb-portion" onClick={() => add(id, -1)} disabled={done} title="ひとつ戻す">
                  <FoodArt art={t.art} size={34} />
                  <span className="makeb-n">×{n}</span>
                </button>
              );
            })}
        </span>
      </div>
      {!done ? (
        <button type="button" className="cv-btn cv-next js-submit" disabled={!any} onClick={() => onSubmit({ arch: 'make', counts, vessel, method })} data-testid="submit">
          出す
        </button>
      ) : null}
      {done && spec ? null : null}
    </div>
  );
}

// ------------------------------------------------------------------------------------- check

const DOC_ART: Record<string, string> = { card: 'doc_card', ledger: 'doc_book', invoice: 'doc_invoice', order: 'doc_invoice', letter: 'doc_invoice', note: 'doc_invoice', label: 'doc_card', speech: 'doc_card' };

export function CheckDesk({ task, result, onSubmit }: BenchProps) {
  const spec = task.spec as CheckSpec & { arch: 'check' };
  const [field, setField] = useState<string | null>(null);
  const [fix, setFix] = useState<string | null>(null);
  const done = !!result;
  const needFix = !!spec.fixOptions?.length && !!field;
  return (
    <div className="checkd" data-testid="check-desk">
      <div className="checkd-docs" style={{ gridTemplateColumns: `repeat(${spec.docs.filter((d) => d.kind !== 'speech').length}, 1fr)` }}>
        {spec.docs.map((d, i) =>
          d.kind === 'speech' ? null : (
            <div key={i} className={`checkd-doc doc-${d.kind} ${i === spec.target ? 'target' : ''}`} data-doc={i}>
              <div className="checkd-doctitle">
                <DocArt art={DOC_ART[d.kind] ?? 'doc_invoice'} size={26} />
                {d.title ? <WordText text={d.title} interactive={false} /> : null}
                {i === spec.target ? <span className="checkd-tag">確かめる書類</span> : null}
              </div>
              {(d.lines ?? []).map((l, k) => (
                <p key={k} className="checkd-line">
                  <WordText text={l} />
                </p>
              ))}
              {(d.fields ?? []).map((f) => {
                const mark = i === spec.target && field === f.id;
                const truth = done && i === spec.target && spec.wrong === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    className={`checkd-field ${mark ? 'marked' : ''} ${truth ? 'truth' : ''}`}
                    disabled={i !== spec.target || done}
                    onClick={() => {
                      sfx('pickup');
                      setField(field === f.id ? null : f.id);
                      setFix(null);
                    }}
                    data-field={f.id}
                    aria-pressed={mark}
                  >
                    <span className="checkd-label">
                      <WordText text={f.label} interactive={false} />
                    </span>
                    <span className="checkd-value">
                      <WordText text={f.value} interactive={false} />
                    </span>
                  </button>
                );
              })}
            </div>
          ),
        )}
      </div>
      {needFix && !done ? (
        <div className="checkd-fix">
          <span className="hand small">正しくは：</span>
          {spec.fixOptions!.map((o) => (
            <button key={o} type="button" className={`reply-chip ${fix === o ? 'on' : ''}`} onClick={() => setFix(o)} data-fix={o}>
              <WordText text={o} interactive={false} />
            </button>
          ))}
        </div>
      ) : null}
      {!done ? (
        <div className="checkd-actions">
          <button type="button" className="cv-btn checkd-ok" onClick={() => onSubmit({ arch: 'check', verdict: 'ok' })} data-testid="check-ok">
            <span className="checkd-stamp" aria-hidden>
              可
            </span>
            問題なし（はんこを押す）
          </button>
          <button
            type="button"
            className="cv-btn checkd-ng"
            disabled={!field || (needFix && !fix)}
            onClick={() => onSubmit({ arch: 'check', verdict: 'fix', field: field ?? undefined, fix: fix ?? undefined })}
            data-testid="check-fix"
          >
            {field ? '印をつけたところが違う' : '違うところに印をつける'}
          </button>
        </div>
      ) : (
        <p className="hand small muted">{spec.wrong ? '赤い枠：食い違っていたところ。' : 'この書類は合っていた。'}</p>
      )}
    </div>
  );
}

// ------------------------------------------------------------------------------------- respond

const MSG_ART: Record<string, string> = { letter: 'doc_invoice', email: 'doc_email', phone: 'doc_phone', memo: 'doc_invoice' };
const MSG_JA: Record<string, string> = { letter: '手紙', email: 'メール', phone: '電話', memo: 'メモ', speech: '' };

export function RespondDesk({ task, result, onSubmit }: BenchProps) {
  const spec = task.spec as RespondSpec & { arch: 'respond' };
  const [choice, setChoice] = useState<number | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [slot, setSlot] = useState<string | null>(null);
  const done = !!result;
  const showMsg = spec.msg.kind !== 'speech' && !(spec.msg.kind === 'phone' && task.audioOnly && !done);
  const ready = spec.mode === 'choose' ? choice !== null : spec.mode === 'form' ? (spec.fields ?? []).every((f) => fields[f.id]) : !!slot;
  return (
    <div className={`respd respd-${spec.mode}`} data-testid="respond-desk">
      {showMsg ? (
        <div className={`respd-msg msg-${spec.msg.kind}`}>
          <div className="respd-msghead">
            <DocArt art={MSG_ART[spec.msg.kind] ?? 'doc_invoice'} size={28} />
            <span className="hand small">{MSG_JA[spec.msg.kind]}</span>
            {spec.msg.from ? <span className="respd-from">{spec.msg.from}</span> : null}
            <SpeakButton text={spec.msg.lines.join(' ')} label="" className="speak-round" />
          </div>
          {spec.msg.subject ? (
            <div className="respd-subject">
              <WordText text={spec.msg.subject} />
            </div>
          ) : null}
          {spec.msg.lines.map((l, i) => (
            <p key={i} className="respd-line">
              <WordText text={l} />
            </p>
          ))}
        </div>
      ) : null}
      {spec.mode === 'choose' ? (
        <div className="respd-replies" role="radiogroup" aria-label="返事">
          {spec.options!.map((o, i) => (
            <button
              key={i}
              type="button"
              className={`reply-slip ${choice === i ? 'on' : ''} ${done && i === spec.answer ? 'right' : ''} ${done && choice === i && i !== spec.answer ? 'wrong' : ''}`}
              onClick={() => (sfx('paper'), setChoice(i))}
              disabled={done}
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
        <div className="respd-form">
          {spec.fields!.map((f) => (
            <div key={f.id} className={`respd-field ${done && fields[f.id] !== f.answer ? 'wrong' : ''}`}>
              <span className="respd-flabel">
                <WordText text={f.label} interactive={false} />
              </span>
              <span className="respd-chips">
                {f.options.map((o) => (
                  <button key={o} type="button" className={`reply-chip ${fields[f.id] === o ? 'on' : ''} ${done && o === f.answer ? 'right' : ''}`} onClick={() => setFields((x) => ({ ...x, [f.id]: o }))} disabled={done} data-chip={`${f.id}:${o}`}>
                    <WordText text={o} interactive={false} />
                  </button>
                ))}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      {spec.mode === 'slot' && spec.slot ? <SlotGrid slot={spec.slot} pick={slot} onPick={(id) => (sfx('pickup'), setSlot(id))} done={done} /> : null}
      {!done ? (
        <button
          type="button"
          className="cv-btn cv-next js-submit"
          disabled={!ready}
          onClick={() => onSubmit({ arch: 'respond', ...(spec.mode === 'choose' ? { choice: choice ?? undefined } : spec.mode === 'form' ? { fields } : { slot: slot ?? undefined }) })}
          data-testid="submit"
        >
          {spec.mode === 'choose' ? 'こう答える' : spec.mode === 'form' ? '書いて渡す' : 'ここに決める'}
        </button>
      ) : null}
    </div>
  );
}

function SlotGrid({ slot, pick, onPick, done }: { slot: NonNullable<RespondSpec['slot']>; pick: string | null; onPick: (id: string) => void; done: boolean }) {
  return (
    <div className={`slotg slotg-${slot.layout}`} style={{ gridTemplateColumns: `auto repeat(${slot.cols.length}, 1fr)` }} data-testid="slot-grid">
      {slot.layout === 'rooms' ? <span className="slotg-roof" aria-hidden /> : null}
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
                className={`slotg-cell free ${pick === cell.id ? 'on' : ''} ${done && cell.id === slot.answer ? 'right' : ''} ${done && pick === cell.id && cell.id !== slot.answer ? 'wrong' : ''}`}
                onClick={() => onPick(cell.id)}
                disabled={done}
                data-cell={cell.id}
                aria-pressed={pick === cell.id}
              >
                {pick === cell.id ? '●' : ''}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
