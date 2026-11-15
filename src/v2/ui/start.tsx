/**
 * Start: English, and where to start from (every 英検 grade or a TOEIC band). Assumed-known words never show a
 * meaning; they are confirmed like any word, on their verification page.
 */
import { useState } from 'react';
import { levelEquiv, levelName, START_TOEIC, startOptions } from '../../core/difficulty';
import { newGame } from '../logic/day';
import { useGame } from './store';

type Choice = { level: number; toeic: number | null };

export function Start() {
  const { data, start, ctx, layout } = useGame();
  const opts = startOptions(data).filter((o) => o.available);
  const [pick, setPick] = useState<Choice>({ level: 0, toeic: null });
  const [busy, setBusy] = useState(false);
  const label = pick.toeic ? `TOEIC 〜${pick.toeic}` : levelName('en', pick.level);
  const go = () => {
    setBusy(true);
    window.setTimeout(() => start(newGame(ctx(), pick)), 10);
  };
  return (
    <div className={`start start-${layout}`}>
      <div className="start-paper">
        <h1>
          港町の調香茶房 <span className="v2">新しい画面（試作）</span>
        </h1>
        <p className="ja-body">翻訳のない港町で、働きながら英語を読み解く。言葉の意味は、絵と前後とお客さんの反応から自分で推測し、帳面に書き、検証ページで確かめる。</p>
        <div className="start-lang">
          <span className="ja-label">学ぶ言葉</span>
          <span className="lang-chip on">英語</span>
        </div>
        <fieldset className="levels">
          <legend className="ja-label">いまの実力（ここまでの言葉は「知っているはず」として扱う。意味は表示しない）</legend>
          <div className="level-grid">
            {opts.map((o) => (
              <button key={`e${o.level}`} className={`level ${pick.level === o.level && !pick.toeic ? 'on' : ''}`} aria-pressed={pick.level === o.level && !pick.toeic} onClick={() => setPick({ level: o.level, toeic: null })}>
                <b>{o.label}</b>
                <span>{o.level ? levelEquiv('en', o.level).split('・')[0] : '初めて学ぶ'}</span>
              </button>
            ))}
          </div>
          <div className="level-grid toeic">
            {START_TOEIC.map((t) => (
              <button key={`t${t.band}`} className={`level ${pick.toeic === t.band ? 'on' : ''}`} aria-pressed={pick.toeic === t.band} onClick={() => setPick({ level: t.level, toeic: t.band })}>
                <b>TOEIC 〜{t.band}</b>
                <span>{levelName('en', t.level)}相当</span>
              </button>
            ))}
          </div>
        </fieldset>
        <button className="btn-primary start-go" id="start-game" onClick={go} disabled={busy}>
          {busy ? '準備しています…' : `${label}ではじめる`}
        </button>
      </div>
    </div>
  );
}
