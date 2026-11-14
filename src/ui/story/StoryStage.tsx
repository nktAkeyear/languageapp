/**
 * The story told inside the scene. One card at a time from the save's queue (progress.story.cards):
 *
 * - scene / reply  → a conversation at the counter: the regular (drawn, always the same look),
 *                    their lines in speech bubbles, the player's thoughts as narration strips,
 *                    choices as reply slips the player says.
 * - scene(request) → a note a regular left at the shop (today's delivery is theirs).
 * - chapter        → a title card over the harbour.
 * - doc            → the paper / keepsake appears on the counter, is picked up and read.
 * - ledger         → night: the lamp-lit counter with the ledger book; blowing the lamp out ends
 *                    the day (the next morning follows with a dawn transition).
 *
 * Every card that comes before the ledger in the queue belongs to the evening, so they play in
 * the night shop too. Mounted once at the app root (both layouts).
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { beatById, cardNeedsChoice, sortedChapters, storyChoose, storyDismiss } from '../../story/engine';
import { storyOf, type Story } from '../../story/text';
import type { GameData } from '../../core/gamedata';
import type { LangProgress } from '../../core/save';
import type { SceneLine, StoryCard } from '../../story/types';
import { CustomerArt, type Expression, type Pose } from '../art/customer';
import { plain } from '../../core/gamedata';
import { useSpeaking } from '../speech';
import { lineMs, useTalkBurst } from '../useTalk';

/** Gestures a regular makes while saying a line, by mood (one per line, in turn). */
const GESTURES: Partial<Record<Expression, Pose[]>> & { neutral: Pose[] } = {
  neutral: ['explain', 'rest', 'open', 'heart'],
  happy: ['open', 'explain', 'heart', 'wave'],
  sad: ['heart', 'rest', 'chin'],
  listen: ['chin', 'explain'],
};
import { skyAt } from '../art/sky';
import { SpeakButton, WordText } from '../components/WordText';
import { sfx } from '../sound';
import { useGame } from '../useGame';
import { useUi } from '../uiState';
import { DocBoxView, DocFound } from './Documents';
import { LedgerBook, NightBackdrop } from './NightLedger';
import { personOf } from './people';
import { useStoryHold, useStoryUi } from './StoryUi';
import { CornerHooks } from '../scene/parts';
import './story.css';

export type Act = (fn: (p: LangProgress, d: GameData) => void) => void;

export function StoryStage({ onSettings }: { onSettings?: () => void }) {
  const g = useGame();
  const su = useStoryUi();
  const hold = useStoryHold();
  const data = g.data;
  const p = g.progress;
  const story = data ? storyOf(data) : null;
  if (!data || !p || !story || !p.story) return null;
  const act: Act = (fn) => g.mutateProgress(fn);
  const cards = p.story.cards;
  const card = cards[0];
  const night = cards.some((c) => c.kind === 'ledger');
  if (!card || hold.held) return su.box || su.reading ? <DocBoxView /> : null;
  return <StoryCardStage card={card} cards={cards} data={data} story={story} p={p} act={act} night={night} onSettings={onSettings} />;
}

function StoryCardStage({
  card,
  cards,
  data,
  story,
  p,
  act,
  night,
  onSettings,
}: {
  card: StoryCard;
  cards: StoryCard[];
  data: GameData;
  story: Story;
  p: LangProgress;
  act: Act;
  night: boolean;
  onSettings?: () => void;
}) {
  // While a story card is up, the shop's own customer steps out of view (the close-up replaces them).
  useEffect(() => {
    document.documentElement.dataset.story = card.kind;
    return () => {
      delete document.documentElement.dataset.story;
    };
  }, [card.kind]);
  return (
    <div className={`st-root ${night ? 'st-night' : ''}`} data-testid="story-stage" data-card={card.kind}>
      {night ? <NightBackdrop /> : null}
      <CardView key={cardKey(card, cards.length)} card={card} data={data} story={story} p={p} act={act} night={night} />
      {onSettings ? (
        <div className="st-hooks">
          <CornerHooks onSettings={onSettings} />
        </div>
      ) : null}
    </div>
  );
}

function cardKey(c: StoryCard, n: number): string {
  switch (c.kind) {
    case 'chapter':
      return `ch:${c.chapter}`;
    case 'scene':
      return `sc:${c.beat}:${c.request ? 'rq' : (c.outcome ?? '')}:${n}`;
    case 'reply':
      return `re:${c.beat}:${c.option}`;
    case 'doc':
      return `doc:${c.doc}`;
    case 'ledger':
      return `lg:${c.ledger.day}`;
  }
}

function CardView({ card, data, story, p, act, night }: { card: StoryCard; data: GameData; story: Story; p: LangProgress; act: Act; night: boolean }) {
  switch (card.kind) {
    case 'chapter':
      return <ChapterCard chapterId={card.chapter} story={story} act={act} />;
    case 'scene':
      return card.request ? <RequestNote card={card} data={data} story={story} act={act} /> : <Conversation card={card} data={data} story={story} p={p} act={act} night={night} />;
    case 'reply':
      return <Conversation card={card} data={data} story={story} p={p} act={act} night={night} />;
    case 'doc':
      return <DocFound docId={card.doc} act={act} night={night} />;
    case 'ledger':
      return <LedgerBook ledger={card.ledger} act={act} />;
  }
}

// ------------------------------------------------------------------------------------- conversation

type Entry = { kind: 'say'; who: string; text: string } | { kind: 'narr'; text: string } | { kind: 'me'; text: string };

function toEntries(lines: SceneLine[], speaker: string): Entry[] {
  return lines.map((l) => ('ja' in l ? { kind: 'narr', text: l.ja } : { kind: 'say', who: l.who ?? speaker, text: l.say }));
}

function Conversation({
  card,
  data,
  story,
  p,
  act,
  night,
}: {
  card: Extract<StoryCard, { kind: 'scene' | 'reply' }>;
  data: GameData;
  story: Story;
  p: LangProgress;
  act: Act;
  night: boolean;
}) {
  const ui = useUi();
  const b = beatById(story, card.beat);
  const t = story.text.beats[card.beat];
  const needs = card.kind === 'scene' && cardNeedsChoice(data, p);
  const entries: Entry[] = [];
  if (b && t) {
    if (card.kind === 'scene') {
      const lines = (card.outcome === 'good' && t.linesGood) || (card.outcome === 'poor' && t.linesPoor) || t.lines || [];
      entries.push(...toEntries(lines, b.character));
      if (needs && t.prompt) entries.push({ kind: 'say', who: b.character, text: t.prompt });
    } else {
      const o = t.options?.[card.option];
      if (o) entries.push({ kind: 'me', text: o.text }, { kind: 'say', who: b.character, text: o.reply });
    }
  }
  const [shown, setShown] = useState(1);
  const speakingNow = useSpeaking();
  const talkBurst = useTalkBurst(entries[shown - 1]?.kind === 'say' && !ui.reducedMotion ? `${card.beat}:${shown}` : null, entries[shown - 1]?.kind === 'say' ? lineMs((entries[shown - 1] as { text: string }).text, data.lang === 'zh') : 0);
  const talkRef = useRef<HTMLDivElement>(null);
  const all = shown >= entries.length;
  useLayoutEffect(() => {
    const el = talkRef.current;
    if (el) el.scrollTo?.({ top: el.scrollHeight, behavior: ui.reducedMotion ? 'auto' : 'smooth' });
  }, [shown, ui.reducedMotion]);
  useEffect(() => {
    sfx(entries[shown - 1]?.kind === 'narr' ? 'paper' : 'pickup');
  }, [shown]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!b || !t) return null;
  const visible = entries.slice(0, shown);
  // The one standing at the counter: whoever spoke last (the beat's character before anyone has).
  const lastSay = [...visible].reverse().find((e): e is Extract<Entry, { kind: 'say' }> => e.kind === 'say');
  // A regular's visit happens at the counter, so they stand there; a narrated moment or the
  // aftermath of a delivery shows someone only once they speak.
  const anySay = entries.some((e) => e.kind !== 'narr');
  const speakerId = lastSay?.who ?? (b.kind === 'visit' || anySay ? b.character : '');
  const speaker = speakerId ? personOf(data, story, speakerId) : { name: '', look: null };
  const isReply = card.kind === 'reply';
  const outcome = card.kind === 'scene' ? card.outcome : undefined;
  let ex: Expression = outcome === 'good' ? 'happy' : outcome === 'poor' ? 'sad' : 'neutral';
  if (needs && all) ex = 'listen';
  if (isReply) ex = 'happy';
  // The newest line: the speaker says it (mouth moves, the words appear one by one, a gesture);
  // while the player speaks or thinks, the regular listens.
  const newest = entries[shown - 1];
  const saying = newest?.kind === 'say' ? newest : null;
  const zh = data.lang === 'zh';
  const sayMs = saying && !ui.reducedMotion ? lineMs(saying.text, zh) : 0;
  const voiced = speakingNow !== null && visible.some((e) => e.kind === 'say' && e.who === speakerId && plain(e.text) === speakingNow);
  const talking = (talkBurst && !!saying && saying.who === speakerId) || voiced;
  if (newest?.kind === 'me') ex = 'listen';
  const gestures = GESTURES[ex] ?? GESTURES.neutral;
  const pose: Pose = newest?.kind === 'me' ? 'chin' : saying ? gestures[(shown - 1) % gestures.length] : ex === 'listen' ? 'chin' : 'rest';
  const advance = () => !all && setShown((n) => n + 1);
  const dismiss = () => act((pp, dd) => storyDismiss(dd, pp));
  return (
    <div className={`cv ${night ? 'cv-night' : ''} ${speaker.look ? '' : 'cv-nofig'}`} data-testid={isReply ? 'story-reply' : 'story-scene'} data-beat={card.beat}>
      <div className="cv-dim" aria-hidden />
      {speaker.look ? (
        <div className="cv-figure" key={speakerId}>
          <div className={`cv-figure-body ex-${ex}`}>
            <CustomerArt look={speaker.look} ex={ex} pose={pose} talking={talking} />
          </div>
          <div className="name-card cv-name" lang={data.lang === 'zh' ? 'zh-CN' : 'en'}>
            {speaker.name}
          </div>
        </div>
      ) : null}
      <div className="cv-counter" aria-hidden />
      <div className={`cv-talk ${speaker.look ? '' : 'cv-talk-solo'}`} ref={talkRef} onClick={advance} role="log" aria-live="polite">
        {visible.map((e, i) =>
          e.kind === 'narr' ? (
            <p key={i} className="cv-narr hand">
              {e.text}
            </p>
          ) : e.kind === 'me' ? (
            <div key={i} className="cv-me">
              <span className="cv-me-who">あなた</span>
              <WordText text={e.text} story className="cv-text" />
            </div>
          ) : (
            <div key={i} className={`cv-say ${i === shown - 1 ? 'cv-say-new' : ''}`}>
              {e.who !== speakerId || entries.some((x) => x.kind === 'say' && x.who !== b.character) ? (
                <span className="cv-say-who" lang={data.lang === 'zh' ? 'zh-CN' : 'en'}>
                  {personOf(data, story, e.who).name}
                </span>
              ) : null}
              <WordText text={e.text} story className="cv-text" reveal={i === shown - 1 && sayMs ? sayMs : undefined} />
              <SpeakButton text={e.text} label="" className="speak-round" />
            </div>
          ),
        )}
        <div className="cv-actions" onClick={(e) => e.stopPropagation()}>
          {!all ? (
            <button type="button" className="cv-btn cv-next" onClick={advance} data-testid="story-next">
              つづける <span aria-hidden>▸</span>
            </button>
          ) : needs ? (
            <>
              <div className="cv-ask hand">どう答える？</div>
              <ul className="cv-options" data-testid="story-options">
                {(b.choice ?? []).map((c) => (
                  <li key={c.id} className="cv-option">
                    <WordText text={t.options?.[c.id]?.text ?? ''} story className="cv-text" />
                    <button
                      type="button"
                      className="cv-say-btn"
                      data-option={c.id}
                      onClick={() => {
                        sfx('stamp');
                        act((pp, dd) => storyChoose(dd, pp, c.id));
                      }}
                    >
                      こう言う
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <button type="button" className="cv-btn cv-done" onClick={dismiss} data-testid="story-continue">
              {isReply ? 'うなずく' : 'つづける'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** A delivery beat: the regular left a note at the shop. */
function RequestNote({ card, data, story, act }: { card: Extract<StoryCard, { kind: 'scene' }>; data: GameData; story: Story; act: Act }) {
  const b = beatById(story, card.beat);
  const t = story.text.beats[card.beat];
  useEffect(() => sfx('paper'), []);
  if (!b || !t?.request) return null;
  const who = personOf(data, story, b.character);
  return (
    <div className="cv cv-request" data-testid="story-request">
      <div className="cv-dim" aria-hidden />
      <div className="cv-counter" aria-hidden />
      <div className="note-left">
        <div className="note-paper">
          <div className="note-pin" aria-hidden />
          <WordText text={t.request} story className="cv-text" />
          <SpeakButton text={t.request} label="" className="speak-round" />
        </div>
        <p className="cv-narr hand">戸口に、置き手紙がはさんであった。今日の配達は、{who.name}の頼みだ。</p>
        <button type="button" className="cv-btn cv-done" onClick={() => act((pp, dd) => storyDismiss(dd, pp))}>
          配達票といっしょに持っていく
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------- chapter card

const KANJI = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
const CHAPTER_TIME = [0.02, 0.32, 0.5, 0.76, 0.97];

function ChapterCard({ chapterId, story, act }: { chapterId: string; story: Story; act: Act }) {
  const chapters = sortedChapters(story);
  const i = Math.max(0, chapters.findIndex((c) => c.id === chapterId));
  const t = story.text.chapters[chapterId];
  const { data, progress } = useGame();
  // Started above zero (レベル設定): the shop is already past its first stage, so the first-stage intro does not fit.
  const aboveZero = !!data && !!progress && progress.stage > (data.stages[0]?.stage ?? 1);
  const intro = (aboveZero && t?.introAboveZeroJa) || t?.introJa;
  useEffect(() => sfx('chapter'), []);
  return (
    <div className="chapter-stage" data-testid="story-chapter" role="dialog" aria-label={`第${KANJI[i]}章 ${t?.titleJa ?? ''}`}>
      <HarbourPanorama t={CHAPTER_TIME[i] ?? 0.3} />
      <div className="chapter-sign">
        <div className="chapter-rope" aria-hidden />
        <div className="chapter-board">
          <div className="chapter-no">第{KANJI[i]}章</div>
          <h2 className="chapter-title">{t?.titleJa}</h2>
        </div>
      </div>
      <p className="chapter-intro hand">{intro}</p>
      <button type="button" className="cv-btn chapter-go" onClick={() => act((pp, dd) => storyDismiss(dd, pp))}>
        はじめる
      </button>
    </div>
  );
}

/** The port town across the water at a time of day (chapter cards, transitions). */
export function HarbourPanorama({ t }: { t: number }) {
  const sky = skyAt(t);
  const W = 1600;
  const H = 900;
  const hz = 560;
  const sunY = 120 + (1 - sky.sun) * 420;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="panorama" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="pano-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky.top} />
          <stop offset="1" stopColor={sky.bottom} />
        </linearGradient>
        <linearGradient id="pano-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky.sea} />
          <stop offset="1" stopColor="#1c2f44" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#pano-sky)" />
      <circle cx="1060" cy={sunY} r="70" fill="#fff4d0" opacity="0.95" />
      <circle cx="1060" cy={sunY} r="140" fill="#fff0c0" opacity="0.18" />
      <g fill="#fff" opacity="0.5">
        <ellipse cx="300" cy="180" rx="140" ry="22" />
        <ellipse cx="380" cy="168" rx="80" ry="22" />
        <ellipse cx="1320" cy="250" rx="120" ry="16" />
      </g>
      {/* far hills */}
      <path d={`M0 ${hz - 40} Q200 ${hz - 120} 420 ${hz - 50} Q640 ${hz - 10} 900 ${hz - 60} Q1200 ${hz - 110} 1600 ${hz - 40} L1600 ${hz} L0 ${hz} Z`} fill="#5c7a7a" opacity="0.55" />
      {/* the town on the right: roofs, the shop's lamp, the lighthouse on the left */}
      <g transform={`translate(1120 ${hz})`}>
        {[
          [0, 70, 90, '#a8573a'],
          [80, 100, 120, '#6b4a3a'],
          [190, 80, 100, '#8a5a3a'],
          [260, 120, 140, '#b8452f'],
          [370, 90, 110, '#5c4a62'],
        ].map(([x, w, h, roof], k) => (
          <g key={k} transform={`translate(${x} 0)`}>
            <rect x="0" y={-Number(h)} width={w} height={h} fill="#e9d9b8" stroke="#3a2a1a" strokeWidth="2" />
            <path d={`M-8 ${-Number(h)} L${Number(w) / 2} ${-Number(h) - 46} L${Number(w) + 8} ${-Number(h)} Z`} fill={String(roof)} stroke="#3a2a1a" strokeWidth="2" />
            <rect x={Number(w) / 2 - 10} y={-Number(h) + 30} width="20" height="24" fill={sky.lamp > 0.6 ? '#ffd27a' : '#6a8aa0'} />
          </g>
        ))}
      </g>
      <g transform={`translate(240 ${hz - 150})`}>
        <path d="M14 0 h26 l10 150 h-46 Z" fill="#f2ebe0" stroke="#4a3a2a" strokeWidth="2" />
        <path d="M10 50 h34 M8 100 h38" stroke="#b8442e" strokeWidth="14" />
        <rect x="10" y="-22" width="34" height="24" fill="#3a3430" />
        <circle cx="27" cy="-10" r="8" fill="#ffe08a" className="lighthouse" />
      </g>
      <rect x="0" y={hz} width={W} height={H - hz} fill="url(#pano-sea)" />
      <path d={`M1060 ${hz + 6} L1000 ${H} L1120 ${H} Z`} fill="#fff4d0" opacity={0.18 + sky.sun * 0.1} />
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <path key={k} className="wave" d={`M${-40 + k * 30} ${hz + 30 + k * 48} q40 -10 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0`} stroke="#fff" strokeOpacity="0.28" strokeWidth="3" fill="none" />
      ))}
      <g className="boat" transform={`translate(420 ${hz + 8})`}>
        <path d="M-90 0 L90 0 L64 34 L-64 34 Z" fill="#4a2c18" />
        <line x1="0" y1="0" x2="0" y2="-150" stroke="#2a1a10" strokeWidth="6" />
        <path d="M6 -144 L76 -18 L6 -18 Z" fill="#f4ecd8" />
        <path d="M-6 -130 L-64 -24 L-6 -24 Z" fill="#e9dcc0" />
      </g>
      <path d="M520 260 q14 -14 28 0 q14 -14 28 0 M640 220 q10 -10 20 0 q10 -10 20 0" stroke="#2a2a2a" strokeWidth="4" fill="none" className="gulls" />
    </svg>
  );
}
