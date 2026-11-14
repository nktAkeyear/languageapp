/**
 * 腕だめし (placement check), played like the shop: a customer at the counter says an order
 * (target language only), three cups stand ready — labelled like the shelf — and the player hands
 * one over, or shrugs. Items and the suggestion: src/core/placement.ts. The player confirms the
 * suggested starting level in the レベル設定 sheet.
 */
import { useMemo, useState } from 'react';
import { wordText, type GameData } from '../../core/gamedata';
import { levelName } from '../../core/difficulty';
import { placementItems, placementSuggestion } from '../../core/placement';
import type { Brew, IngredientId } from '../../core/types';
import { CustomerArt, lookFor } from '../art/customer';
import { PieceArt } from '../art/ingredients';
import { ColdBasinArt, HourglassArt, KettleArt, PotArt, SpoonArt } from '../art/tools';
import { plain } from '../../core/gamedata';
import { speak, useSpeechAvailable } from '../speech';
import { SpeakerGlyph } from '../components/WordText';
import './difficulty.css';

function OrderLine({ data, text }: { data: GameData; text: string }) {
  const zh = data.lang === 'zh';
  return (
    <span className="tl pl-order" lang={zh ? 'zh-CN' : 'en'}>
      {data.tokens(text).map((t, i) => {
        if (!t.id) return <span key={i}>{t.text}</span>;
        const e = data.lex.byId.get(t.id);
        return zh && e?.pinyin ? (
          <ruby key={i} className="w">
            {t.text}
            <rt>{e.pinyin}</rt>
          </ruby>
        ) : (
          <span key={i} className="w">
            {t.text}
          </span>
        );
      })}
    </span>
  );
}

function Label({ data, id }: { data: GameData; id: string | undefined }) {
  if (!id) return null;
  return (
    <span className="pl-label" lang={data.lang === 'zh' ? 'zh-CN' : 'en'}>
      {wordText(data, id)}
    </span>
  );
}

function Cup({ data, brew }: { data: GameData; brew: Brew }) {
  const ings = (Object.entries(brew.counts) as [IngredientId, number][]).filter(([, n]) => n > 0);
  return (
    <span className="pl-cup">
      <svg viewBox="0 0 60 44" className="pl-glass" aria-hidden>
        <path d="M8 4 h44 l-5 34 q-1 4 -5 4 h-24 q-4 0 -5 -4 Z" fill={brew.temp === 'cold' ? '#dcecf3' : '#f4e2c4'} stroke="#6b4222" strokeWidth="2" />
        {brew.temp === 'hot' ? <path d="M22 0 q3 -4 0 -8 M32 0 q3 -4 0 -8 M42 0 q3 -4 0 -8" stroke="#9a8a78" strokeWidth="1.5" fill="none" transform="translate(-4 2)" /> : null}
      </svg>
      <span className="pl-rows">
        {ings.map(([ing, n]) => (
          <span key={ing} className="pl-row">
            <svg viewBox="-20 -20 40 40" className="chit-piece" aria-hidden>
              <PieceArt ing={ing} />
            </svg>
            <Label data={data} id={data.ingText.get(ing)?.word} />
            <span className="pl-n">×{n}</span>
          </span>
        ))}
        {brew.temp ? (
          <span className="pl-row pl-mark">
            <span className="pl-tool">{brew.temp === 'hot' ? <KettleArt active={false} /> : <ColdBasinArt active={false} />}</span>
            <Label data={data} id={data.content.temperatureWords[brew.temp]} />
          </span>
        ) : null}
        {brew.method ? (
          <span className="pl-row pl-mark">
            <span className="pl-tool">{brew.method === 'steep' ? <HourglassArt active={false} /> : brew.method === 'boil' ? <PotArt active={false} /> : <SpoonArt active={false} />}</span>
            <Label data={data} id={data.content.methodWords[brew.method]} />
          </span>
        ) : null}
      </span>
    </span>
  );
}

export function Placement({ data, onDone, onCancel }: { data: GameData; onDone: (level: number) => void; onCancel: () => void }) {
  const items = useMemo(() => placementItems(data, Date.now()), [data]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const voice = useSpeechAvailable(data.lang);
  const i = answers.length;
  const item = items[i];
  if (!item) {
    const r = placementSuggestion(items, answers);
    return (
      <div className="lvs pl" data-testid="placement-result">
        <h2 className="lvs-title">腕だめしの結果</h2>
        <ul className="pl-results">
          {r.perLevel.map((x) => (
            <li key={x.level} className="hand">
              {levelName(data.lang, x.level)}くらいの注文：{x.total} 人中 {x.correct} 人にぴったり
            </li>
          ))}
        </ul>
        <p className="pl-suggest">
          おすすめの始め方：<b data-testid="placement-suggestion">{levelName(data.lang, r.level)}</b>
        </p>
        <p className="small muted">その段階のすべての注文にぴったり出せたところまでを目安にしています（迷ったら低めに。あとから上げられます）。</p>
        <div className="lvs-foot">
          <button type="button" className="btn" onClick={onCancel}>
            使わない
          </button>
          <button type="button" className="btn btn-primary" onClick={() => onDone(r.level)} data-testid="placement-use">
            この目安にする
          </button>
        </div>
      </div>
    );
  }
  const c = data.content.customers.find((x) => x.id === item.customer) ?? data.content.customers[i % data.content.customers.length];
  return (
    <div className="lvs pl" data-testid="placement">
      <div className="lvs-head">
        <h2 className="lvs-title">腕だめし</h2>
        <span className="small muted">
          {i + 1} / {items.length}
        </span>
      </div>
      <div className="pl-counter">
        <div className="pl-customer" aria-hidden>
          <CustomerArt look={lookFor(c.id, c.avatar)} ex="neutral" />
        </div>
        <div className="bubble-paper pl-bubble">
          <OrderLine data={data} text={item.text} />
          {voice ? (
            <button type="button" className="btn speak speak-round" onClick={() => speak(plain(item.text), data.lang)} aria-label="読み上げる">
              <SpeakerGlyph />
            </button>
          ) : null}
        </div>
      </div>
      <div className="pl-cups" role="group" aria-label="どのカップを出す？">
        {item.cups.map((cup, k) => (
          <button key={k} type="button" className="pl-cupbtn" onClick={() => setAnswers([...answers, k])} data-testid={`pl-cup-${k}`}>
            <Cup data={data} brew={cup} />
            <span className="pl-give">これを出す</span>
          </button>
        ))}
      </div>
      <div className="lvs-foot">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          やめる
        </button>
        <button type="button" className="btn" onClick={() => setAnswers([...answers, null])} data-testid="pl-skip">
          わからない
        </button>
      </div>
    </div>
  );
}
