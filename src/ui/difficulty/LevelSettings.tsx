/**
 * レベル設定: choose the difficulty per language by qualification benchmark (start level, target),
 * pace, the adaptive controller and assists. Opened at a new game (title screen), from ⚙ 設定,
 * from the notebook's 現在地 / 学習の記録 pages. Logic: src/core/difficulty.ts.
 *
 * `openLevelSettings()` can be called from anywhere; `<LevelSettingsHost />` (mounted once in
 * App.tsx) renders the sheet.
 */
import { useEffect, useMemo, useState } from 'react';
import {
  applyStartLevel,
  defaultDifficulty,
  describeChange,
  levelName,
  PACES,
  setDifficultyOptions,
  startOptions,
  targetOptions,
  type Assists,
  type AudioFreq,
  type LevelChangeSummary,
  type Pace,
  type PinyinMode,
} from '../../core/difficulty';
import { newProgress } from '../../core/save';
import type { Lang } from '../../core/types';
import { Overlay } from '../components/Overlay';
import { LANG_JA } from '../components/Settings';
import { useMobile } from '../layout';
import { gameData, useGame } from '../useGame';
import { Placement } from './Placement';
import './difficulty.css';

// ------------------------------------------------------------------------------------- open / host

type OpenReq = { newLang?: Lang };
const listeners = new Set<(r: OpenReq | null) => void>();
export function openLevelSettings(req: OpenReq = {}): void {
  listeners.forEach((f) => f(req));
}

export function LevelSettingsHost() {
  const [req, setReq] = useState<OpenReq | null>(null);
  const mobile = useMobile();
  useEffect(() => {
    listeners.add(setReq);
    return () => void listeners.delete(setReq);
  }, []);
  if (!req) return null;
  return (
    // Above an open book (the sheet can be opened from the notebook).
    <div className="lvs-host">
      <Overlay variant={mobile ? 'sheet' : 'modal'} onClose={() => setReq(null)}>
        <LevelSettings newLang={req.newLang} onClose={() => setReq(null)} />
      </Overlay>
    </div>
  );
}

/** ⚙ 設定 section: a button that opens this sheet. */
export function LevelSettingsSection({ onCloseSettings }: { onCloseSettings: () => void }) {
  const g = useGame();
  if (!g.lang) return null;
  const d = g.progress?.difficulty;
  return (
    <section>
      <h3>レベル設定（難易度）</h3>
      <p className="small muted">
        {LANG_JA[g.lang]}：{levelName(g.lang, d?.start ?? 0)}・{PACES[d?.pace ?? 'normal'].label}・自動調整{d && !d.adaptive ? 'なし' : 'あり'}
      </p>
      <button
        type="button"
        className="btn"
        data-testid="open-level-settings"
        onClick={() => {
          onCloseSettings();
          openLevelSettings();
        }}
      >
        資格の目安・進み方・手助けを変える
      </button>
    </section>
  );
}

// ------------------------------------------------------------------------------------- the sheet

const PINYIN: [PinyinMode | 'settings', string][] = [
  ['settings', '設定に従う'],
  ['always', 'いつも'],
  ['unconfirmed', '確定していない言葉だけ'],
  ['never', '出さない'],
];
const AUDIO: [AudioFreq, string][] = [
  ['off', 'なし'],
  ['normal', 'ふつう'],
  ['many', '多め'],
];

export function LevelSettings({ newLang, onClose }: { newLang?: Lang; onClose: () => void }) {
  const g = useGame();
  const lang = newLang ?? g.lang;
  const isNew = !!newLang;
  const data = lang ? gameData(lang) : null;
  const progress = isNew ? null : g.progress;
  const cur = progress?.difficulty ?? defaultDifficulty();
  const [start, setStart] = useState(cur.start);
  const [target, setTarget] = useState<number | null>(cur.target);
  const [pace, setPace] = useState<Pace>(cur.pace);
  const [adaptive, setAdaptive] = useState(cur.adaptive);
  const [assists, setAssists] = useState<Assists>(cur.assists);
  const [yardstick, setYardstick] = useState<'eiken' | 'toeic'>(cur.yardstick ?? 'eiken');
  const [toeicTarget, setToeicTarget] = useState<number | null>(cur.toeicTarget ?? null);
  const [placing, setPlacing] = useState(false);
  const [suggested, setSuggested] = useState<number | null>(null);
  const [done, setDone] = useState<string[] | null>(null);
  const fresh = useMemo(() => (lang ? newProgress(lang) : null), [lang]);
  const preview = useMemo<LevelChangeSummary | null>(() => {
    if (!data || !progress || start === cur.start) return null;
    const p = structuredClone(progress);
    return applyStartLevel(data, p, start);
  }, [data, progress, start, cur.start]);
  if (!lang || !data || !fresh) return null;
  const starts = startOptions(data);
  const targets = targetOptions(data, progress ?? fresh);
  const zh = lang === 'zh';
  const setA = (a: Partial<Assists>) => setAssists((x) => ({ ...x, ...a }));

  if (placing)
    return (
      <Placement
        data={data}
        onCancel={() => setPlacing(false)}
        onDone={(lvl) => {
          setPlacing(false);
          setSuggested(lvl);
          setStart(lvl);
        }}
      />
    );

  if (done)
    return (
      <div className="lvs" data-testid="level-done">
        <h2 className="lvs-title">レベル設定を変えました</h2>
        <ul className="lvs-summary">
          {done.map((l) => (
            <li key={l} className="hand">
              {l}
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          とじる
        </button>
      </div>
    );

  const confirm = () => {
    const opts = { pace, adaptive, target, assists, ...(lang === 'en' ? { yardstick, toeicTarget } : {}) };
    if (isNew) {
      g.newGame(lang, (p, d) => {
        setDifficultyOptions(p, opts);
        if (start > 0) applyStartLevel(d, p, start);
      });
      onClose();
      return;
    }
    let summary: LevelChangeSummary | null = null;
    g.mutateProgress((p, d) => {
      setDifficultyOptions(p, opts);
      if (start !== (p.difficulty?.start ?? 0)) summary = applyStartLevel(d, p, start);
    });
    setDone(summary ? describeChange(data, summary) : ['進み方・目標・手助けを保存しました。']);
  };

  const startStage = starts.find((o) => o.level === start)?.stage ?? 1;
  return (
    <div className="lvs" data-testid="level-settings">
      <div className="lvs-head">
        <h2 className="lvs-title">レベル設定 — {LANG_JA[lang]}</h2>
        <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="閉じる">
          ✕
        </button>
      </div>
      <p className="small muted">資格の目安で難しさを決めます。あとからいつでも変えられます（⚙ 設定・手帳の「現在地」から）。</p>

      <section className="lvs-sec">
        <h3>現在の実力の目安</h3>
        <div className="lvs-cards" role="radiogroup" aria-label="現在の実力の目安">
          {starts.map((o) => (
            <button
              key={o.level}
              type="button"
              role="radio"
              aria-checked={start === o.level}
              disabled={!o.available}
              className={`lvs-card ${start === o.level ? 'on' : ''}`}
              onClick={() => setStart(o.level)}
              data-testid={`start-${o.level}`}
            >
              <span className="lvs-card-l">{o.label}</span>
              <span className="lvs-card-e">{o.available ? o.equiv : '未対応'}</span>
              {suggested === o.level ? <span className="lvs-badge">腕だめしの結果</span> : null}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-small" onClick={() => setPlacing(true)} data-testid="placement-start">
          腕だめしで決める（注文をいくつか読むだけ・任意）
        </button>
        <p className="small lvs-explain">
          {start === 0
            ? '最初の一杯から。言葉はすべてゲームの中で出会って、検証して覚えます。'
            : `${levelName(lang, start)}までの言葉は「知っているはず（未確認）」として扱い、易しい言葉ばかりの注文は省きます。答え（意味）は表示されません。手帳では未確認のまま並び、自分の推測を書いて検証ページで確かめると「確」になります（一語ずつ取り消しも可）。店は第${startStage}段階から。棚の品の名前など、まだ知らない言葉の入った最初の注文はそのまま出てきます。物語は最初の手紙から、少し詰めて進みます。`}
        </p>
        {preview ? (
          <ul className="lvs-preview small" data-testid="level-preview">
            {describeChange(data, preview).map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        ) : null}
        {starts.some((o) => !o.available) ? <p className="small muted">それより上のレベルは、ゲームの内容がまだ届いていないため選べません。</p> : null}
      </section>

      <section className="lvs-sec">
        <h3>目標</h3>
        <div className="lvs-targets" role="radiogroup" aria-label="目標">
          <label className={`lvs-target ${target === null ? 'on' : ''}`}>
            <input type="radio" name="target" checked={target === null} onChange={() => setTarget(null)} />
            <span>決めない</span>
          </label>
          {targets.map((o) => (
            <label key={o.level} className={`lvs-target ${target === o.level ? 'on' : ''} ${o.available ? '' : 'off'}`} data-testid={`target-${o.level}`}>
              <input type="radio" name="target" disabled={!o.available} checked={target === o.level} onChange={() => setTarget(o.level)} />
              <span className="lvs-target-l">{o.label}</span>
              <span className="lvs-target-e small muted">{o.equiv}</span>
              {o.available ? (
                <span className="lvs-mini" title={`ゲームにある語：一覧の約${Math.round(o.progress.ceiling * 100)}%`}>
                  <span className="lvs-mini-ceil" style={{ width: `${Math.round(o.progress.ceiling * 100)}%` }} />
                  <span className="lvs-mini-fill" style={{ width: `${Math.round(o.progress.ratio * 100)}%` }} />
                </span>
              ) : (
                <span className="small lvs-na">未対応</span>
              )}
            </label>
          ))}
        </div>
        {target ? <p className="small lvs-explain">{targets.find((o) => o.level === target)?.note}</p> : null}
      </section>

      {lang === 'en' ? (
        <section className="lvs-sec" data-testid="yardstick-sec">
          <h3>ものさし（英検／TOEIC）</h3>
          <div className="lvs-cards" role="radiogroup" aria-label="ものさし">
            <button type="button" role="radio" aria-checked={yardstick === 'eiken'} className={`lvs-card ${yardstick === 'eiken' ? 'on' : ''}`} onClick={() => setYardstick('eiken')} data-testid="yard-eiken">
              <span className="lvs-card-l">英検</span>
              <span className="lvs-card-e">学校で習う順番（5級→1級）。言葉はやさしい級から。</span>
            </button>
            <button type="button" role="radio" aria-checked={yardstick === 'toeic'} className={`lvs-card ${yardstick === 'toeic' ? 'on' : ''}`} onClick={() => setYardstick('toeic')} data-testid="yard-toeic">
              <span className="lvs-card-l">TOEIC</span>
              <span className="lvs-card-e">仕事の英語（〜400→〜990）。事務や接客の職場と、仕事の決まり文句を先に。</span>
            </button>
          </div>
          {yardstick === 'toeic' ? (
            <label className="field">
              TOEIC の目標
              <select value={toeicTarget ?? ''} onChange={(e) => setToeicTarget(e.target.value ? Number(e.target.value) : null)} data-testid="toeic-target">
                <option value="">決めない</option>
                {[400, 500, 600, 730, 860, 990].map((b) => (
                  <option key={b} value={b}>
                    〜{b}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <p className="small muted">手帳の「現在地」では、どちらのものさしでも（並べても）進み具合を見られます。どの仕事で何を学べるかは、町の掲示板に出ています。</p>
        </section>
      ) : null}

      <section className="lvs-sec">
        <h3>進み方</h3>
        <div className="lvs-cards lvs-cards-3" role="radiogroup" aria-label="進み方">
          {(Object.keys(PACES) as Pace[]).map((k) => (
            <button key={k} type="button" role="radio" aria-checked={pace === k} className={`lvs-card ${pace === k ? 'on' : ''}`} onClick={() => setPace(k)} data-testid={`pace-${k}`}>
              <span className="lvs-card-l">{PACES[k].label}</span>
              <span className="lvs-card-e">{PACES[k].desc}</span>
            </button>
          ))}
        </div>
        <label className="check">
          <input type="checkbox" checked={adaptive} onChange={(e) => setAdaptive(e.target.checked)} data-testid="adaptive" />
          自動で調整する（おすすめ）
        </label>
        <p className="small muted">
          一回目でぴったり出せた割合が続けて6割を切るとゆっくりに（新しい言葉を減らし、復習を増やし、次の段階を遅らせる）、9割を超えると少し速めに。変化は一日一歩ずつ。手帳の「記録」で理由が見られます。
        </p>
      </section>

      <section className="lvs-sec">
        <h3>手助け</h3>
        {zh ? (
          <label className="field">
            ピンイン
            <select value={assists.pinyin ?? 'settings'} onChange={(e) => setA({ pinyin: e.target.value === 'settings' ? undefined : (e.target.value as PinyinMode) })} data-testid="assist-pinyin">
              {PINYIN.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="check">
          <input type="checkbox" checked={assists.peek} onChange={(e) => setA({ peek: e.target.checked })} data-testid="assist-peek" />
          確定していない言葉の意味を、手帳でのぞき見できる（1回 評判 −1）
        </label>
        <label className="check">
          <input type="checkbox" checked={assists.markMistake} onChange={(e) => setA({ markMistake: e.target.checked })} data-testid="assist-mark" />
          うまくいかなかったとき、注文のどの言葉が原因だったか印をつける
        </label>
        <label className="check">
          <input type="checkbox" checked={assists.retry} onChange={(e) => setA({ retry: e.target.checked })} data-testid="assist-retry" />
          うまくいかなかったとき、同じお客さんにもう一度つくれる（評判は減らない）
        </label>
        <label className="field">
          声だけの注文
          <span className="index-tabs small-tabs" role="group">
            {AUDIO.map(([v, l]) => (
              <button key={v} type="button" className={`index-tab ${assists.audio === v ? 'on' : ''}`} aria-pressed={assists.audio === v} onClick={() => setA({ audio: v })} data-testid={`assist-audio-${v}`}>
                {l}
              </button>
            ))}
          </span>
        </label>
        <label className="check">
          <input type="checkbox" checked={assists.slowSpeech} onChange={(e) => setA({ slowSpeech: e.target.checked })} data-testid="assist-slow" />
          ゆっくり話してもらう
        </label>
      </section>

      <div className="lvs-foot">
        <button type="button" className="btn" onClick={onClose}>
          やめる
        </button>
        <button type="button" className="btn btn-primary btn-big" onClick={confirm} data-testid="level-confirm">
          {isNew ? 'この設定で始める' : '決める'}
        </button>
      </div>
    </div>
  );
}
