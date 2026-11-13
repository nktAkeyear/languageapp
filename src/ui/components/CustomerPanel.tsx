import { useEffect, useRef, useState } from 'react';
import { currentOrder } from '../../activities/shop/engine';
import { plain } from '../../core/gamedata';
import type { Face } from '../../core/types';
import { speak, useSpeechAvailable } from '../speech';
import { useGame } from '../useGame';
import { SpeakButton, WordText } from './WordText';

export const FACE_EMOJI: Record<Face, string> = {
  delighted: '😄',
  happy: '🙂',
  neutral: '😐',
  puzzled: '🤔',
  sad: '😞',
  angry: '😠',
};

/** Current customer, their order (or reaction), and the end-of-day summary. */
export function CustomerPanel({ onNext }: { onNext?: () => void }) {
  const g = useGame();
  const { data, progress, lang, settings } = g;
  const voice = useSpeechAvailable(lang ?? 'en');
  const [notesHidden, setNotesHidden] = useState(false);
  const spokenKey = useRef<string>('');
  const t = progress?.today;
  const order = progress ? currentOrder(progress) : null;

  // Audio-only orders are read out automatically when the customer arrives.
  useEffect(() => {
    if (!order || !lang || t?.phase !== 'order' || !order.audioOnly || !voice) return;
    const k = `${t.day}:${t.index}`;
    if (spokenKey.current === k) return;
    spokenKey.current = k;
    speak(plain(order.text), lang, settings.speechRate);
  }, [order, lang, t?.phase, t?.day, t?.index, voice, settings.speechRate]);

  if (!data || !progress || !t) return null;

  if (t.phase === 'closed') return <DaySummary />;
  if (!order) return null;

  const customer = data.content.customers.find((c) => c.id === order.customer);
  const result = t.phase === 'reaction' ? t.results[t.results.length - 1] : null;
  const hideText = order.audioOnly && voice && !result;

  return (
    <div className="customer-panel">
      {t.notes.length > 0 && t.index === 0 && !notesHidden && t.phase === 'order' ? (
        <div className="notice">
          <div className="notice-title">今日の知らせ</div>
          {t.notes.map((n) => (
            <p key={n}>{n}</p>
          ))}
          <button type="button" className="btn btn-small" onClick={() => setNotesHidden(true)}>
            わかった
          </button>
        </div>
      ) : null}
      <div className="customer">
        <div className="avatar" aria-hidden>
          <span className="avatar-emoji">{customer?.avatar ?? '🧑'}</span>
          <span className="face">{FACE_EMOJI[result?.face ?? 'neutral']}</span>
        </div>
        <div className="customer-name" lang={lang === 'zh' ? 'zh-CN' : 'en'}>
          {customer?.name}
          {order.returning ? <span className="chip chip-small">再来店</span> : null}
        </div>
        <div className="queue-dots" aria-label={`${t.index + 1} 人目 / ${t.queue.length} 人`}>
        {t.queue.map((_q, i) => {
          const r = t.results[i];
          return (
            <span key={i} className={`dot ${i === t.index ? 'dot-cur' : ''}`}>
              {r ? FACE_EMOJI[r.face] : i === t.index ? '●' : '○'}
            </span>
          );
        })}
      </div>
      </div>
      <div className="bubble">
        {hideText ? (
          <div className="audio-only">
            <div className="small muted">声だけの注文（出したあとで文字が見えます）</div>
            <SpeakButton text={order.text} label="もう一度聞く" big />
          </div>
        ) : (
          <div className="order-line">
            <WordText text={order.text} className="order-text" />
            <SpeakButton text={order.text} />
          </div>
        )}
        {order.audioOnly && !voice && !result ? (
          <div className="small muted">（この環境では音声が使えないため、文字で表示しています）</div>
        ) : null}
      </div>
      {result ? (
        <div className="reaction">
          <div className="bubble bubble-reply">
            <div className="order-line">
              <WordText text={result.reaction} className="reaction-text" />
              <SpeakButton text={result.reaction} label="" />
            </div>
          </div>
          <div className={`rep-delta ${result.repDelta > 0 ? 'up' : result.repDelta < 0 ? 'down' : ''}`}>
            評判 {result.repDelta > 0 ? `+${result.repDelta}` : result.repDelta}
          </div>
          <button
            type="button"
            className="btn btn-primary btn-big"
            onClick={() => {
              g.next();
              onNext?.();
            }}
          >
            {t.index + 1 < t.queue.length ? '次のお客さんへ' : '今日の店じまい'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function DaySummary() {
  const g = useGame();
  const { data, progress } = g;
  if (!data || !progress?.today) return null;
  const t = progress.today;
  const rep = t.results.reduce((s, r) => s + r.repDelta, 0);
  const returning = progress.returns.length;
  return (
    <div className="summary">
      <h2>{t.day}日目 の店じまい</h2>
      <div className="summary-faces">
        {t.results.map((r, i) => {
          const c = data.content.customers.find((x) => x.id === r.customer);
          return (
            <span key={i} className="summary-face" title={c?.name}>
              <span>{c?.avatar}</span>
              <span>{FACE_EMOJI[r.face]}</span>
            </span>
          );
        })}
      </div>
      <p>
        今日の評判の変化：<strong>{rep >= 0 ? `+${rep}` : rep}</strong>（現在 {progress.reputation}）
      </p>
      {returning ? <p className="muted">満足しなかったお客さんが {returning} 人。また来るかもしれない。</p> : null}
      <p className="muted small">出会った言葉は手帳に記録されています。</p>
      <button type="button" className="btn btn-primary btn-big" onClick={() => g.closeDay()}>
        次の日へ
      </button>
    </div>
  );
}
