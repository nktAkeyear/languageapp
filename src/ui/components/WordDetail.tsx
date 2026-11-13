import { useEffect, useState } from 'react';
import { useGame } from '../useGame';
import { SpeakButton, WordText } from './WordText';

/** Everything the notebook knows about one word: audio, status, memo, sentences. */
export function WordDetail({ id, onClose }: { id: string; onClose?: () => void }) {
  const { data, progress, setMemo } = useGame();
  const entry = data?.lex.byId.get(id);
  const st = progress?.words[id];
  const [memo, setLocal] = useState(st?.memo ?? '');
  useEffect(() => setLocal(st?.memo ?? ''), [id, st?.memo]);
  if (!data || !entry) return null;
  const zh = data.lang === 'zh';
  return (
    <div className="word-detail">
      <div className="wd-head">
        <div>
          <div className="wd-text" lang={zh ? 'zh-CN' : 'en'}>
            {entry.text}
          </div>
          {zh && entry.pinyin ? <div className="wd-pinyin">{entry.pinyin}</div> : null}
        </div>
        <SpeakButton text={entry.text} label="" />
        {onClose ? (
          <button type="button" className="btn btn-ghost wd-close" onClick={onClose} aria-label="閉じる">
            ✕
          </button>
        ) : null}
      </div>
      <div className="wd-status">
        {st?.confirmed ? (
          <span className="chip chip-ok">
            確定：{entry.emoji ? `${entry.emoji} ` : ''}
            {entry.gloss}
          </span>
        ) : (
          <span className="chip">未確定</span>
        )}
        <span className="muted small">
          出会った回数 {st?.seen ?? 0}・うまく使えた回数 {st?.correct ?? 0}
        </span>
      </div>
      <label className="wd-memo">
        <span className="small muted">自分のメモ（推測）</span>
        <textarea
          value={memo}
          rows={2}
          placeholder="たぶん「〜」という意味？"
          onChange={(e) => setLocal(e.target.value)}
          onBlur={() => memo !== (st?.memo ?? '') && setMemo(id, memo)}
        />
      </label>
      {memo !== (st?.memo ?? '') ? (
        <button type="button" className="btn btn-small" onClick={() => setMemo(id, memo)}>
          メモを保存
        </button>
      ) : null}
      {st?.contexts.length ? (
        <div className="wd-contexts">
          <div className="small muted">見かけた文</div>
          <ul>
            {st.contexts.map((c) => (
              <li key={c}>
                <WordText text={c} />
                <SpeakButton text={c} label="" />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
