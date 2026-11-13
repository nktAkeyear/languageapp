import { hasNextSegment } from '../../../activities/day';
import { someoneHome } from '../../../activities/delivery/engine';
import { townOf } from '../../../activities/town/text';
import { wordMarkup } from '../../../core/gamedata';
import type { DeliveryDay, MapCell, Period } from '../../../core/townTypes';
import { useGame } from '../../useGame';
import { FACE_EMOJI } from '../CustomerPanel';
import { SpeakButton, WordText } from '../WordText';
import { COLOUR_CSS } from './Market';

const LANDMARK_ICON: Record<string, string> = {
  harbour: '⚓',
  inn: '🛏️',
  school: '🏫',
  bridge: '🌉',
  bank: '🏦',
  hospital: '🏥',
  market: '🧺',
};
const PERIOD_ICON: Record<Period, string> = { morning: '🌅', afternoon: '☀️', evening: '🌆' };

function useDelivery(): DeliveryDay | null {
  const { townDay } = useGame();
  return townDay?.delivery ?? null;
}

function useTown() {
  const { data } = useGame();
  return data ? townOf(data) : null;
}

/** The customer's slip (target language only; the name is just a name). */
export function Slip({ compact = false }: { compact?: boolean }) {
  const x = useDelivery();
  const town = useTown();
  const { lang } = useGame();
  if (!x || !town) return null;
  const r = town.text.delivery.recipients.find((q) => q.id === x.slip.recipient);
  if (compact)
    return (
      <div className="order-strip note-strip">
        <span aria-hidden>📦</span>
        {x.slip.lines.map((l, i) => (
          <WordText key={i} text={l.text} />
        ))}
      </div>
    );
  return (
    <div className="slip" data-testid="slip">
      <div className="slip-head">
        <span className="small muted">配達票</span>
        <span className="slip-to">
          <span aria-hidden>{r?.avatar}</span> <span lang={lang === 'zh' ? 'zh-CN' : 'en'}>{r?.name}</span>
        </span>
        <SpeakButton text={x.slip.lines.map((l) => l.text).join(' ')} label="" />
      </div>
      <ul className="slip-lines">
        {x.slip.lines.map((l, i) => (
          <li key={i}>
            <WordText text={l.text} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Town map with target-language signs on the landmarks. */
export function TownMap() {
  const g = useGame();
  const x = useDelivery();
  const town = useTown();
  const { data } = g;
  if (!x || !town || !data) return null;
  const d = town.shared.delivery;
  const icon = (lm: string) => (lm === 'temple' ? (data.lang === 'en' ? '⛪' : '🛕') : (LANDMARK_ICON[lm] ?? '🏛️'));
  const plan = x.phase === 'plan';
  const cell = (c: MapCell | undefined, key: string) => {
    if (!c) return <div key={key} className="map-cell map-empty" />;
    const on = x.choice.place === c.id;
    const label = c.landmark ? wordMarkup(data, town.text.delivery.placeWords[c.landmark]) : null;
    return (
      <button
        key={key}
        type="button"
        className={`map-cell ${c.landmark ? 'map-landmark' : 'map-house'} ${on ? 'map-on' : ''}`}
        disabled={!plan}
        onClick={() => g.delivery.choosePlace(c.id)}
        data-place={c.id}
        aria-pressed={on}
        aria-label={c.landmark ? undefined : '家'}
      >
        {c.landmark ? (
          <>
            <span className="map-icon" aria-hidden>
              {icon(c.landmark)}
            </span>
            <span className="map-sign">
              <WordText text={label!} interactive={false} />
            </span>
          </>
        ) : (
          <>
            <span className="map-icon" aria-hidden>
              🏠
            </span>
            <span className="door" style={{ background: COLOUR_CSS[c.door ?? 'red'] }} aria-hidden />
          </>
        )}
        {on ? (
          <span className="map-pin" aria-hidden>
            📦
          </span>
        ) : null}
      </button>
    );
  };
  const row = (r: number) => Array.from({ length: d.cols }, (_, col) => cell(d.map.find((c) => c.col === col && c.row === r), `${r}-${col}`));
  return (
    <div className="town-map" style={{ ['--cols' as string]: d.cols }}>
      <div className="map-row">{row(0)}</div>
      <div className="map-row">{row(1)}</div>
      <div className="street" aria-hidden>
        <span>🚶</span>
        <span>🐎</span>
        <span>🚶‍♀️</span>
      </div>
      <div className="map-row">{row(2)}</div>
      <div className="map-row">{row(3)}</div>
      <div className="sea" aria-hidden>
        🌊 ⛵ 🌊
      </div>
    </div>
  );
}

/** Clock slots (language-neutral icons + digits). */
export function TimePicker() {
  const g = useGame();
  const x = useDelivery();
  const town = useTown();
  if (!x || !town || x.phase !== 'plan') return null;
  return (
    <div className="time-picker" role="group" aria-label="届ける時間">
      {town.shared.delivery.slots.map((s) => (
        <button
          key={s.hour}
          type="button"
          className={`seg-btn time-btn ${x.choice.hour === s.hour ? 'seg-on' : ''}`}
          aria-pressed={x.choice.hour === s.hour}
          data-hour={s.hour}
          onClick={() => g.delivery.chooseHour(s.hour)}
        >
          <span aria-hidden>{PERIOD_ICON[s.period]}</span> {s.hour}:00
        </button>
      ))}
    </div>
  );
}

/** Plan → knock → door → result. */
export function DeliveryActions() {
  const g = useGame();
  const x = useDelivery();
  const town = useTown();
  const { progress } = g;
  if (!x || !town || !progress) return null;
  const persons = town.shared.delivery.persons;
  if (x.phase === 'plan') {
    const ready = !!x.choice.place && x.choice.hour !== null;
    return (
      <div className="delivery-actions">
        <div className="small muted">
          {x.choice.place ? '行き先：地図に📦の印' : '地図で届け先を選ぶ'}・{x.choice.hour !== null ? `${x.choice.hour}:00 に行く` : '時間を選ぶ'}
        </div>
        <button type="button" className="btn btn-primary btn-big" data-testid="depart" disabled={!ready} onClick={() => g.delivery.depart()}>
          📦 届けに出発する
        </button>
      </div>
    );
  }
  if (x.phase === 'knock')
    return (
      <div className="door-scene">
        <div className="door-big" aria-hidden>
          🚪
        </div>
        <div className="small muted">{x.choice.hour}:00、家の前に着いた。ノックしよう。</div>
        <div className="row-wrap">
          {[1, 2, 3].map((n) => (
            <button key={n} type="button" className="btn btn-big" data-knock={n} onClick={() => g.delivery.knock(n)}>
              {'✊'.repeat(n)} ×{n}
            </button>
          ))}
        </div>
      </div>
    );
  if (x.phase === 'door') {
    const home = someoneHome(x);
    return (
      <div className="door-scene">
        {home ? (
          <>
            <div className="small muted">ドアが開いた。誰に渡す？</div>
            <div className="row-wrap people">
              {x.household.map((id) => (
                <button key={id} type="button" className="btn btn-big person" data-person={id} onClick={() => g.delivery.handOver({ person: id })}>
                  <span className="person-icon">{persons.find((p) => p.id === id)?.icon}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="door-big" aria-hidden>
              🚪💤
            </div>
            <div className="small muted">……誰も出てこない。</div>
            <div className="row-wrap">
              <button type="button" className="btn btn-big" data-absent="door" onClick={() => g.delivery.handOver({ absent: 'door' })}>
                🚪 戸口に置いていく
              </button>
              <button type="button" className="btn btn-big" data-absent="neighbour" onClick={() => g.delivery.handOver({ absent: 'neighbour' })}>
                🏘️ となりの人に預ける
              </button>
              <button type="button" className="btn btn-big" data-absent="back" onClick={() => g.delivery.handOver({ absent: 'back' })}>
                ↩ 持ち帰る
              </button>
            </div>
          </>
        )}
      </div>
    );
  }
  const r = x.result!;
  const who = town.text.delivery.recipients.find((q) => q.id === x.slip.recipient);
  return (
    <div className="delivery-result" data-testid="delivery-result">
      <div className="customer">
        <div className="avatar" aria-hidden>
          <span className="avatar-emoji">{who?.avatar}</span>
          <span className="face">{FACE_EMOJI[r.face]}</span>
        </div>
      </div>
      <div className="bubble bubble-reply">
        <div className="order-line">
          <WordText text={r.reaction} className="reaction-text" />
          <SpeakButton text={r.reaction} label="" />
        </div>
      </div>
      <div className={`rep-delta ${r.repDelta > 0 ? 'up' : r.repDelta < 0 ? 'down' : ''}`}>
        評判 {r.repDelta > 0 ? `+${r.repDelta}` : r.repDelta}
        {r.tip ? `　🪙+${r.tip}` : ''}
      </div>
      {hasNextSegment(progress) ? (
        <button type="button" className="btn btn-primary btn-big" onClick={() => g.nextSegment()}>
          次へ
        </button>
      ) : (
        <button type="button" className="btn btn-primary btn-big" data-testid="end-day" onClick={() => g.closeDay()}>
          今日を終える（次の日へ）
        </button>
      )}
    </div>
  );
}
