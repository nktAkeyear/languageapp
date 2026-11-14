/**
 * Story layer UI: scene / choice / chapter / document / ledger cards (one at a time, from the
 * save's card queue) and the documents collection. Self-contained: mount once per layout with
 * `<StoryLayer variant="modal" | "sheet" />`. All state lives in the save (progress.story).
 */
import { useEffect, useState, type ReactNode } from 'react';
import type { GameData } from '../../../core/gamedata';
import type { LangProgress } from '../../../core/save';
import {
  beatById,
  cardNeedsChoice,
  docLines,
  docReadability,
  sortedChapters,
  storyChoose,
  storyDismiss,
  storyReadDoc,
  storySync,
  STORY_KEY_PREFIX,
} from '../../../story/engine';
import { storyOf, type Story } from '../../../story/text';
import type { Ledger, SceneLine, StoryCard } from '../../../story/types';
import { useGame } from '../../useGame';
import { shortGloss, StorySpeak, StoryText } from './StoryText';
import './story.css';

type Variant = 'modal' | 'sheet';

function Shell({ variant, children, onClose, wide = false }: { variant: Variant; children: ReactNode; onClose?: () => void; wide?: boolean }) {
  return (
    <div className={`st-overlay st-overlay-${variant}`} role="presentation" onClick={onClose}>
      <div className={`st-panel st-panel-${variant} ${wide ? 'st-panel-wide' : ''}`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/** Name + avatar of a story character (customers come from the customer list). */
function who(data: GameData, story: Story, id: string): { name: string; avatar: string } {
  const ch = story.shared.characters.find((c) => c.id === id);
  const cust = ch?.customer ? data.content.customers.find((c) => c.id === ch.customer) : undefined;
  if (cust) return { name: cust.name, avatar: cust.avatar };
  const t = story.text.characters[id];
  return { name: t?.name ?? id, avatar: t?.avatar ?? ch?.avatar ?? '🙂' };
}

function Say({ text, name, avatar }: { text: string; name?: string; avatar?: string }) {
  return (
    <div className="st-say">
      {avatar ? (
        <span className="st-avatar" aria-hidden>
          {avatar}
        </span>
      ) : null}
      <div className="st-bubble">
        {name ? <div className="st-who">{name}</div> : null}
        <StoryText text={text} />
        <StorySpeak text={text} />
      </div>
    </div>
  );
}

function Lines({ lines, data, story, speaker }: { lines: SceneLine[]; data: GameData; story: Story; speaker: string }) {
  return (
    <>
      {lines.map((l, i) => {
        if ('ja' in l)
          return (
            <p key={i} className="st-narration">
              {l.ja}
            </p>
          );
        const w = who(data, story, l.who ?? speaker);
        return <Say key={i} text={l.say} name={w.name} avatar={w.avatar} />;
      })}
    </>
  );
}

function SceneCardView({ card, data, story, p, act }: { card: Extract<StoryCard, { kind: 'scene' }>; data: GameData; story: Story; p: LangProgress; act: Act }) {
  const b = beatById(story, card.beat);
  const t = story.text.beats[card.beat];
  if (!b || !t) return null;
  const w = who(data, story, b.character);
  if (card.request)
    return (
      <div className="st-card st-request" data-testid="story-request">
        <div className="st-kicker">📦 配達の頼みごと</div>
        <div className="st-note">
          <StoryText text={t.request ?? ''} />
          <StorySpeak text={t.request ?? ''} />
        </div>
        <p className="st-narration">今日の配達は、{w.name}の頼みだ。</p>
        <button type="button" className="st-btn st-primary" onClick={() => act((pp, dd) => storyDismiss(dd, pp))}>
          わかった
        </button>
      </div>
    );
  const lines = (card.outcome === 'good' && t.linesGood) || (card.outcome === 'poor' && t.linesPoor) || t.lines || [];
  const needs = cardNeedsChoice(data, p);
  return (
    <div className="st-card st-scene" data-testid="story-scene">
      <Lines lines={lines} data={data} story={story} speaker={b.character} />
      {needs && t.prompt ? (
        <>
          <Say text={t.prompt} name={w.name} avatar={w.avatar} />
          <div className="st-kicker">どう答える？</div>
          <ul className="st-options" data-testid="story-options">
            {(b.choice ?? []).map((c) => (
              <li key={c.id} className="st-option">
                <StoryText text={t.options?.[c.id]?.text ?? ''} />
                <button type="button" className="st-btn st-primary" data-option={c.id} onClick={() => act((pp, dd) => storyChoose(dd, pp, c.id))}>
                  こう言う
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <button type="button" className="st-btn st-primary" onClick={() => act((pp, dd) => storyDismiss(dd, pp))}>
          つづける
        </button>
      )}
    </div>
  );
}

function ReplyCardView({ card, data, story, act }: { card: Extract<StoryCard, { kind: 'reply' }>; data: GameData; story: Story; act: Act }) {
  const b = beatById(story, card.beat);
  const o = story.text.beats[card.beat]?.options?.[card.option];
  if (!b || !o) return null;
  const w = who(data, story, b.character);
  return (
    <div className="st-card st-reply" data-testid="story-reply">
      <div className="st-say st-me">
        <div className="st-bubble st-bubble-me">
          <div className="st-who">あなた</div>
          <StoryText text={o.text} />
        </div>
      </div>
      <Say text={o.reply} name={w.name} avatar={w.avatar} />
      <button type="button" className="st-btn st-primary" onClick={() => act((pp, dd) => storyDismiss(dd, pp))}>
        つづける
      </button>
    </div>
  );
}

function ChapterCardView({ chapterId, story, act }: { chapterId: string; story: Story; act: Act }) {
  const chapters = sortedChapters(story);
  const n = chapters.findIndex((c) => c.id === chapterId) + 1;
  const t = story.text.chapters[chapterId];
  return (
    <div className="st-card st-chapter" data-testid="story-chapter">
      <div className="st-chapter-no">第{n}章</div>
      <h2 className="st-chapter-title">{t?.titleJa}</h2>
      <p className="st-narration">{t?.introJa}</p>
      <button type="button" className="st-btn st-primary" onClick={() => act((pp, dd) => storyDismiss(dd, pp))}>
        はじめる
      </button>
    </div>
  );
}

const KIND_JA: Record<string, string> = { letter: '手紙', note: 'メモ', diary: '日記', postcard: '絵はがき', receipt: '紙切れ', recipe: 'レシピ', gift: '贈り物' };

function DocView({ docId, data, story, p, act }: { docId: string; data: GameData; story: Story; p: LangProgress; act: Act }) {
  const def = story.shared.documents.find((d) => d.id === docId);
  const t = story.text.docs[docId];
  const rec = p.story.docs[docId];
  // Reading counts the words as encountered (once a day).
  useEffect(() => {
    if (rec && rec.lastRead !== p.day) act((pp, dd) => storyReadDoc(dd, pp, docId));
  }, [docId, rec?.lastRead, p.day]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!def || !t) return null;
  const lines = docLines(data, p, docId);
  const now = Math.round(docReadability(data, p, docId) * 100);
  const first = Math.round((rec?.firstPct ?? 0) * 100);
  return (
    <div className="st-doc" data-testid="story-doc" data-doc={docId}>
      <div className="st-doc-head">
        <span className="st-doc-icon" aria-hidden>
          {def.icon}
        </span>
        <span className="st-doc-title">{t.titleJa}</span>
        <span className="st-doc-kind">{KIND_JA[def.kind]}</span>
      </div>
      <div className={`st-paper st-paper-${def.kind}`}>
        {lines.map((l, i) => (
          <p key={i} className="st-doc-line">
            <StoryText text={l} glossed />
          </p>
        ))}
      </div>
      <div className="st-meter" title="意味を確定した言葉の割合">
        <span className="st-meter-bar">
          <span style={{ width: `${now}%` }} />
        </span>
        <span className="st-meter-txt" data-testid="story-readability">
          確定した言葉 {now}%{rec && first !== now ? `（見つけたとき ${first}%）` : ''}
        </span>
        <StorySpeak text={lines.join(' ')} />
      </div>
    </div>
  );
}

function LedgerView({ ledger, data, story, act }: { ledger: Ledger; data: GameData; story: Story; act?: Act }) {
  const sign = (n: number) => (n > 0 ? `+${n}` : `${n}`);
  return (
    <div className="st-card st-ledger" data-testid="story-ledger">
      <h2 className="st-ledger-title">{ledger.day}日目の帳簿</h2>
      <table className="st-ledger-table">
        <tbody>
          <tr>
            <th>売り上げ</th>
            <td>🪙 +{ledger.takings}</td>
          </tr>
          <tr>
            <th>仕入れ</th>
            <td>🪙 −{ledger.expenses}</td>
          </tr>
          <tr>
            <th>財布</th>
            <td>🪙 {ledger.money}</td>
          </tr>
          <tr>
            <th>評判</th>
            <td>{sign(ledger.repDelta)}</td>
          </tr>
          <tr>
            <th>お客</th>
            <td>
              {ledger.served}人（ぴったり {ledger.perfect}）
            </td>
          </tr>
        </tbody>
      </table>
      {ledger.met.length ? (
        <div className="st-ledger-row">
          <span className="st-ledger-label">今日の顔ぶれ</span>
          <span className="st-faces">
            {ledger.met.map((id) => {
              const w = who(data, story, id);
              return (
                <span key={id} className="st-face" title={w.name}>
                  <span aria-hidden>{w.avatar}</span>
                  <span lang={data.lang === 'zh' ? 'zh-CN' : 'en'}>{w.name}</span>
                </span>
              );
            })}
          </span>
        </div>
      ) : null}
      {ledger.confirmed.length ? (
        <div className="st-ledger-row">
          <span className="st-ledger-label">意味がわかった言葉</span>
          <span className="st-words">
            {ledger.confirmed.map((id) => {
              const e = data.lex.byId.get(id);
              return (
                <span key={id} className="st-word">
                  <span lang={data.lang === 'zh' ? 'zh-CN' : 'en'}>{e?.text}</span> <span className="st-word-gloss">{shortGloss(e?.gloss)}</span>
                </span>
              );
            })}
          </span>
        </div>
      ) : null}
      {ledger.docs.length ? (
        <div className="st-ledger-row">
          <span className="st-ledger-label">見つけたもの</span>
          <span>
            {ledger.docs.map((id) => {
              const def = story.shared.documents.find((d) => d.id === id);
              return (
                <span key={id} className="st-face">
                  {def?.icon} {story.text.docs[id]?.titleJa}
                </span>
              );
            })}
          </span>
        </div>
      ) : null}
      {ledger.hooks.length ? (
        <div className="st-hooks">
          {ledger.hooks.map((h, i) => (
            <p key={i} className="st-narration">
              {h}
            </p>
          ))}
        </div>
      ) : null}
      {act ? (
        <button type="button" className="st-btn st-primary" data-testid="story-ledger-close" onClick={() => act((pp, dd) => storyDismiss(dd, pp))}>
          灯りを消す
        </button>
      ) : null}
    </div>
  );
}

function Collection({ data, story, p, act, onClose }: { data: GameData; story: Story; p: LangProgress; act: Act; onClose: () => void }) {
  const found = story.shared.documents.filter((d) => p.story.docs[d.id]).sort((a, b) => p.story.docs[a.id].day - p.story.docs[b.id].day);
  const [open, setOpen] = useState<string | null>(null);
  const [ledger, setLedger] = useState(false);
  return (
    <div className="st-collection" data-testid="story-collection">
      <div className="st-collection-head">
        {open || ledger ? (
          <button
            type="button"
            className="st-btn"
            onClick={() => {
              setOpen(null);
              setLedger(false);
            }}
          >
            ← 書類箱
          </button>
        ) : (
          <h2>書類箱</h2>
        )}
        <button type="button" className="st-btn" onClick={onClose} aria-label="閉じる">
          ✕
        </button>
      </div>
      {open ? (
        <DocView docId={open} data={data} story={story} p={p} act={act} />
      ) : ledger && p.story.lastLedger ? (
        <LedgerView ledger={p.story.lastLedger} data={data} story={story} />
      ) : (
        <>
          <ul className="st-doc-list">
            {found.map((d) => {
              const rec = p.story.docs[d.id];
              const pct = Math.round(docReadability(data, p, d.id) * 100);
              return (
                <li key={d.id}>
                  <button type="button" className="st-doc-item" data-doc={d.id} onClick={() => setOpen(d.id)}>
                    <span className="st-doc-icon" aria-hidden>
                      {d.icon}
                    </span>
                    <span className="st-doc-item-title">
                      {story.text.docs[d.id]?.titleJa}
                      {rec.reads === 0 ? <span className="st-new">新</span> : null}
                    </span>
                    <span className="st-doc-item-meta">
                      {rec.day}日目・{pct}%
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {!found.length ? <p className="st-narration">まだ何もない。</p> : null}
          {p.story.lastLedger ? (
            <button type="button" className="st-btn" onClick={() => setLedger(true)}>
              📒 ゆうべの帳簿
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}

type Act = (fn: (p: LangProgress, d: GameData) => void) => void;

export function StoryLayer({ variant }: { variant: Variant }) {
  const g = useGame();
  const [collection, setCollection] = useState(false);
  const data = g.data;
  const p = g.progress;
  const story = data ? storyOf(data) : null;
  // Resolve a story delivery as soon as it has been handed over.
  const x = p?.townDay?.delivery;
  const storyDelivery = !!x && x.phase === 'result' && x.slip.key.startsWith(STORY_KEY_PREFIX) && p?.story?.beats[x.slip.key.slice(STORY_KEY_PREFIX.length)]?.status === 'planned';
  useEffect(() => {
    if (storyDelivery) g.mutateProgress((pp, dd) => void storySync(dd, pp));
  }, [storyDelivery]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!data || !p || !story || !p.story) return null;
  const act: Act = (fn) => g.mutateProgress(fn);
  const card = p.story.cards[0];
  const docs = Object.keys(p.story.docs).length;
  const unread = Object.values(p.story.docs).some((d) => d.reads === 0);
  return (
    <>
      {docs ? (
        <button type="button" className={`st-fab st-fab-${variant}`} data-testid="story-docs-button" onClick={() => setCollection(true)}>
          📜 <span className="st-fab-label">書類</span> {docs}
          {unread ? <span className="st-dot" aria-label="未読" /> : null}
        </button>
      ) : null}
      {card ? (
        <Shell variant={variant} wide={card.kind === 'doc'}>
          {card.kind === 'chapter' ? (
            <ChapterCardView chapterId={card.chapter} story={story} act={act} />
          ) : card.kind === 'scene' ? (
            <SceneCardView card={card} data={data} story={story} p={p} act={act} />
          ) : card.kind === 'reply' ? (
            <ReplyCardView card={card} data={data} story={story} act={act} />
          ) : card.kind === 'doc' ? (
            <div className="st-card" data-testid="story-found">
              <div className="st-kicker">{story.text.docs[card.doc]?.foundJa ?? '書類箱にしまった。'}</div>
              <DocView docId={card.doc} data={data} story={story} p={p} act={act} />
              <button type="button" className="st-btn st-primary" onClick={() => act((pp, dd) => storyDismiss(dd, pp))}>
                しまう
              </button>
            </div>
          ) : (
            <LedgerView ledger={card.ledger} data={data} story={story} act={act} />
          )}
        </Shell>
      ) : collection ? (
        <Shell variant={variant} onClose={() => setCollection(false)} wide>
          <Collection data={data} story={story} p={p} act={act} onClose={() => setCollection(false)} />
        </Shell>
      ) : null}
    </>
  );
}
