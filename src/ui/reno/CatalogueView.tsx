/**
 * The carpenter's catalogue (店の改装), opened like the books. Everything on the sheet is in the
 * target language — the heading, the names, the sales lines, the prices — with drawings; reading
 * it is part of the decipherment. Japanese chrome is limited to the buttons and the stamps.
 *
 * Left page: the order sheet (every entry that has appeared, with its drawing, name and price).
 * Right page: one entry — the drawing large, its lines (clickable words, listen), the price, and
 * 注文する. Orders arrive the next morning (src/renovation/engine.ts).
 */
import { useEffect, useState } from 'react';
import { catalogue, priceText, renoCancel, renoMarkSeen, renoOrder, renoRead, renoShared, renoText } from '../../renovation/engine';
import type { UpgradeId } from '../../renovation/types';
import { UpgradeIcon } from '../art/reno';
import { BookShell } from '../book/BookShell';
import { SpeakButton, WordText } from '../components/WordText';
import { sfx } from '../sound';
import { useGame } from '../useGame';
import { useUi } from '../uiState';
import './reno.css';

export function CatalogueView() {
  const g = useGame();
  const ui = useUi();
  const { data, progress } = g;
  const [sel, setSel] = useState<UpgradeId | null>(null);
  const [msg, setMsg] = useState('');
  // What was new when the sheet was opened keeps its mark while it stays open.
  const [seenBefore] = useState(() => progress?.reno?.seen ?? []);
  // Opening the sheet: the new entries have been seen; the list counts as read (once a day).
  useEffect(() => {
    g.mutateProgress((p, d) => {
      renoRead(d, p, 'list');
      renoMarkSeen(d, p);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    setMsg('');
    if (sel) g.mutateProgress((p, d) => renoRead(d, p, sel));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel]);
  if (!data || !progress) return null;
  const text = renoText(data);
  const shared = renoShared(data);
  if (!text || !shared) return null;
  const entries = catalogue(data, progress);
  const money = progress.town.money;
  const cur = entries.find((e) => e.def.id === sel) ?? null;

  const left = (
    <div className="ct-sheet" data-testid="catalogue">
      <header className="ct-head">
        <div className="ct-title">
          <WordText text={text.title} />
          <SpeakButton text={text.title} label="" className="speak-round speak-small" />
        </div>
        <div className="ct-sub">
          <WordText text={text.subtitle} />
        </div>
        <div className="ct-purse" title="財布">
          <span className="coin-glyph" aria-hidden /> {money}
        </div>
      </header>
      <ul className="ct-grid">
        {entries.map((e) => (
          <li key={e.def.id}>
            <button
              type="button"
              className={`ct-card ${sel === e.def.id ? 'on' : ''} ct-${e.status} ${e.status === 'available' && !e.affordable ? 'ct-dear' : ''}`}
              onClick={() => setSel(e.def.id)}
              data-upgrade={e.def.id}
              aria-pressed={sel === e.def.id}
            >
              <UpgradeIcon id={e.def.id} className="ct-pic" />
              <span className="ct-name">
                <WordText text={text.upgrades[e.def.id].name} interactive={false} />
              </span>
              <span className="ct-price">
                <WordText text={priceText(data, e.def.price)} interactive={false} />
              </span>
              {e.status === 'owned' ? (
                <span className="ct-stamp ct-stamp-owned" aria-label="店にある">
                  済
                </span>
              ) : e.status === 'ordered' ? (
                <span className="ct-stamp ct-stamp-ordered" aria-label="注文済み（明日の朝に届く）">
                  明朝
                </span>
              ) : !seenBefore.includes(e.def.id) ? (
                <span className="ct-new" aria-label="新しい">
                  新
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  const order = () => {
    if (!cur) return;
    let err: string | null = null;
    g.mutateProgress((p, d) => {
      err = renoOrder(d, p, cur.def.id);
    });
    if (err) {
      sfx('fail');
      setMsg(err);
    } else {
      sfx('coin');
      window.setTimeout(() => sfx('stamp'), 180);
      setMsg('');
    }
  };
  const cancel = () => {
    if (!cur) return;
    g.mutateProgress((p, d) => void renoCancel(d, p, cur.def.id));
    sfx('coin');
  };
  const orderedToday = !!cur && (progress.reno?.orders ?? []).some((o) => o.id === cur.def.id && o.day === progress.day);
  const after = cur ? money - cur.def.price : money;

  const right = cur ? (
    <article className="ct-page" data-upgrade={cur.def.id}>
      <UpgradeIcon id={cur.def.id} className="ct-big" />
      <h3 className="ct-page-name">
        <WordText text={text.upgrades[cur.def.id].name} />
        <SpeakButton text={text.upgrades[cur.def.id].name} label="" className="speak-round speak-small" />
      </h3>
      <ul className="ct-lines">
        {text.upgrades[cur.def.id].lines.map((l) => (
          <li key={l}>
            <WordText text={l} />
            <SpeakButton text={l} label="" className="speak-round speak-small" />
          </li>
        ))}
      </ul>
      <div className="ct-tag">
        <WordText text={priceText(data, cur.def.price)} />
      </div>
      <div className="ct-actions">
        {cur.status === 'available' ? (
          <>
            <button type="button" className="cv-btn cv-next ct-order" onClick={order} disabled={!cur.affordable} data-testid="order">
              注文する
            </button>
            {!cur.affordable ? <p className="hand small ct-note">財布の中身が足りない。</p> : after < shared.keepForMarket ? <p className="hand small ct-note">これを買うと、市場で仕入れるお金が心細い。</p> : null}
          </>
        ) : cur.status === 'ordered' ? (
          <>
            <p className="hand ct-note">注文した。明日の朝に届く。</p>
            {orderedToday ? (
              <button type="button" className="cv-btn ct-cancel" onClick={cancel} data-testid="cancel-order">
                注文を取り消す
              </button>
            ) : null}
          </>
        ) : (
          <p className="hand ct-note">もう店にある。</p>
        )}
        {msg ? <p className="hand small ct-note ct-err">{msg}</p> : null}
      </div>
    </article>
  ) : (
    <div className="ct-intro">
      <UpgradeIcon id="bench" className="ct-intro-pic" />
      <p className="hand">大工の店が置いていった注文表。絵と値段と、短い説明が書いてある。</p>
      <p className="hand muted">品を選ぶと詳しいページが開く。注文した品は、次の朝に届く。</p>
    </div>
  );

  return (
    <BookShell
      kind="catalogue"
      label="改装のカタログ"
      left={left}
      right={right}
      showRight={!!cur}
      onBack={() => setSel(null)}
      backLabel="‹ 一覧"
      turnKey={cur ? `c${String(entries.indexOf(cur)).padStart(3, '0')}` : 'c---'}
      onClose={() => ui.closeBook()}
    />
  );
}
