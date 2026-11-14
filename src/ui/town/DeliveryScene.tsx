/**
 * The afternoon delivery as a scene: the slip as paper in hand, an illustrated town map on the
 * table (harbour with ships, the river and its bridge, landmark buildings, houses with coloured
 * doors), the delivery time chosen on a sun dial, a short walk across the map, and the door:
 * knock on it, see who opens, hand the parcel over — the recipient reacts in a speech bubble.
 *
 * Logic is the delivery engine's (src/activities/delivery/engine.ts) through GameApi.delivery.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { hasNextSegment } from '../../activities/day';
import { someoneHome } from '../../activities/delivery/engine';
import { townOf } from '../../activities/town/text';
import { wordMarkup } from '../../core/gamedata';
import type { DeliveryDay, MapCell, PersonId } from '../../core/townTypes';
import { CustomerArt, hasFixedLook, lookFor, type Expression } from '../art/customer';
import { hourTime, skyAt } from '../art/sky';
import {
  CELL_W,
  DOOR_COLOURS,
  DoorFrontArt,
  MAP_H,
  MAP_W,
  MapGroundArt,
  MapHouseArt,
  MapLandmarkArt,
  ROW_H,
  SHOP_POINT,
  STREET_Y,
  SunDialArt,
  cellBox,
  MarketBackdrop,
} from '../art/town';
import { SpeakButton, WordText } from '../components/WordText';
import { useMobile } from '../layout';
import { BookProps, CornerHooks } from '../scene/parts';
import { useStageScale } from '../scene/ShopScene';
import { sfx } from '../sound';
import { useStoryHold } from '../story/StoryUi';
import { useGame } from '../useGame';
import { useUi } from '../uiState';
import { TownNoticePaper } from './common';
import { UpgradeArt } from '../art/reno';
import { useReno } from '../reno/useReno';
import { Raster } from '../art/Raster';
import { lineMs, useTalkBurst } from '../useTalk';

const AFTERNOON = skyAt(0.62);

function useDelivery(): DeliveryDay | null {
  return useGame().townDay?.delivery ?? null;
}
function useTown() {
  const { data } = useGame();
  return data ? townOf(data) : null;
}

// ------------------------------------------------------------------------------------- slip

/** The slip, held in hand (target language only; the name is just a name). */
export function SlipPaper({ compact = false }: { compact?: boolean }) {
  const x = useDelivery();
  const town = useTown();
  const { lang } = useGame();
  const [open, setOpen] = useState(!compact);
  if (!x || !town) return null;
  const r = town.text.delivery.recipients.find((q) => q.id === x.slip.recipient);
  return (
    <div className={`dv-slip ${compact ? 'dv-slip-compact' : ''}`} data-testid="slip">
      <div className="dv-slip-paper">
        <div className="dv-slip-head">
          <span className="dv-slip-kind">配達票</span>
          <span className="dv-slip-to" lang={lang === 'zh' ? 'zh-CN' : 'en'}>
            {r?.name}
          </span>
          <SpeakButton text={x.slip.lines.map((l) => l.text).join(' ')} label="" className="speak-round" />
          {compact ? (
            <button type="button" className="mk-note-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
              {open ? '▴' : '▾'}
            </button>
          ) : null}
        </div>
        <ul className={`dv-slip-lines ${open ? '' : 'dv-slip-peek'}`}>
          {x.slip.lines.map((l, i) => (
            <li key={i}>
              <WordText text={l.text} />
            </li>
          ))}
        </ul>
        <span className="dv-parcel" aria-hidden />
      </div>
      {!compact ? (
        <svg viewBox="0 0 120 120" className="dv-hand" aria-hidden>
          <path d="M8 120 Q10 70 40 60 L84 54 Q96 54 96 62 Q96 70 84 70 L60 72 L98 74 Q110 76 108 86 Q106 94 94 92 L64 92 Q60 110 50 120 Z" fill="#f3d2b3" stroke="#a8764a" strokeWidth="3" />
          <path d="M0 120 L10 64 Q30 60 40 70 L30 120 Z" fill="#3e5a7a" stroke="#2a3e57" strokeWidth="3" />
        </svg>
      ) : null}
    </div>
  );
}

// ------------------------------------------------------------------------------------- map

/** Zoom of the phone map when a district is opened (signs ~2.2× larger). */
const PHONE_ZOOM = 2.2;

/**
 * The illustrated town map; houses and landmarks are buttons (choose where to go).
 * On a phone the map first shows the whole town; a tap zooms into that district (signs become
 * legible, the map can be panned with a finger) and then a tap chooses the house. 全体 goes back.
 */
export function TownMapScene({ walking }: { walking: boolean }) {
  const g = useGame();
  const x = useDelivery();
  const town = useTown();
  const ui = useUi();
  const mobile = useMobile();
  const reno = useReno();
  const [zoom, setZoom] = useState(1);
  const frame = useRef<HTMLDivElement>(null);
  const focus = useRef<{ fx: number; fy: number } | null>(null);
  // Centre the tapped point after zooming in.
  useLayoutEffect(() => {
    const el = frame.current;
    const f = focus.current;
    if (!el) return;
    if (zoom === 1) {
      el.scrollTo({ left: 0, top: 0 });
      return;
    }
    if (!f) return;
    el.scrollTo({ left: f.fx * el.scrollWidth - el.clientWidth / 2, top: f.fy * el.scrollHeight - el.clientHeight / 2 });
    focus.current = null;
  }, [zoom]);
  const { data } = g;
  if (!x || !town || !data) return null;
  const d = town.shared.delivery;
  const plan = x.phase === 'plan';
  const temple = data.lang === 'en' ? 'church' : 'pagoda';
  const dest = x.choice.place ? d.map.find((c) => c.id === x.choice.place) : undefined;
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  const vehicle = reno.has('bicycle') ? 'bicycle' : reno.has('cart') ? 'cart' : null;
  // Walking path: from the shop along the main street to the column, then to the door.
  let path = '';
  if (dest) {
    const b = cellBox(dest.col, dest.row);
    const cx = b.x + CELL_W / 2;
    const street = (STREET_Y[0] + STREET_Y[1]) / 2;
    const doorY = dest.row <= 1 ? b.y + ROW_H - 10 : b.y + 40;
    path = `M${SHOP_POINT.x} ${SHOP_POINT.y} L${cx} ${street} L${cx} ${doorY}`;
  }
  const zoomable = mobile && plan;
  const zoomed = zoomable && zoom > 1;
  const zoomAt = (e: React.MouseEvent) => {
    const el = frame.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    focus.current = { fx: (e.clientX - r.left) / r.width, fy: (e.clientY - r.top) / r.height };
    sfx('page');
    setZoom(PHONE_ZOOM);
  };
  const map = (
    <div className={`dv-map ${zoomed ? 'dv-map-zoomed' : ''}`} data-testid="town-map" style={zoomed ? { width: `${zoom * 100}%` } : undefined}>
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="dv-map-art" aria-hidden>
        <MapGroundArt tint="#ffb070" />
        {/* our shop at the west end of the main street */}
        <g transform={`translate(${SHOP_POINT.x} ${SHOP_POINT.y})`}>
          <rect x="-34" y="-46" width="68" height="46" fill="#e8d0a8" stroke="#3a2a1a" strokeWidth="2.5" />
          <path d="M-44 -44 L0 -74 L44 -44 Z" fill="#4d6a45" stroke="#2a3a22" strokeWidth="2.5" />
          <rect x="-10" y="-30" width="20" height="30" fill="#5e7a6a" stroke="#2a3a22" strokeWidth="2" />
          <g transform="translate(26 -56)">
            <circle r="10" fill="#f6ecd2" stroke="#7a2f1b" strokeWidth="2" />
            <path d="M-5 -1 q5 7 10 0 Z M5 -2 q4 0 3 3" fill="#7a2f1b" stroke="#7a2f1b" strokeWidth="1" />
          </g>
          {vehicle && !(walking && dest) ? (
            <g transform={`translate(-36 ${vehicle === 'bicycle' ? 6 : 4}) scale(0.44)`} className="dv-vehicle">
              <UpgradeArt id={vehicle} />
            </g>
          ) : null}
        </g>
        {d.map.map((c) => {
          const b = cellBox(c.col, c.row);
          return c.landmark ? (
            <MapLandmarkArt key={c.id} lm={c.landmark} x={b.x} y={b.y} temple={temple} />
          ) : (
            <MapHouseArt key={c.id} x={b.x} y={b.y} door={DOOR_COLOURS[c.door ?? 'red']} seed={c.col * 7 + c.row * 3} facing={c.row <= 1 ? 'down' : 'up'} />
          );
        })}
        {dest && walking && !ui.reducedMotion ? (
          <g className="dv-walker">
            <g>
              {vehicle ? (
                <g transform={`translate(${vehicle === 'bicycle' ? -26 : -24} -34) scale(0.34)`}>
                  <UpgradeArt id={vehicle} />
                </g>
              ) : null}
              <circle cy="-30" r="9" fill="#f3d2b3" stroke="#3a2a1a" strokeWidth="2" />
              <path d="M-8 -20 h16 l3 22 h-22 Z" fill="#3e5a7a" stroke="#2a3e57" strokeWidth="2" />
              {vehicle ? null : <rect x="6" y="-14" width="14" height="12" fill="#c49a5e" stroke="#6b4a22" strokeWidth="1.5" />}
              <path d="M-5 2 l-3 10 M5 2 l3 10" stroke="#2a1a10" strokeWidth="3" strokeLinecap="round" />
              <animateMotion dur={vehicle === 'bicycle' ? '1s' : '1.6s'} fill="freeze" path={path} />
            </g>
          </g>
        ) : null}
        {dest && walking ? <path d={path} stroke="#7a2f1b" strokeWidth="5" strokeDasharray="4 12" strokeLinecap="round" fill="none" opacity="0.7" /> : null}
      </svg>
      {d.map.map((c) => {
        const b = cellBox(c.col, c.row);
        const on = x.choice.place === c.id;
        const label = c.landmark ? wordMarkup(data, town.text.delivery.placeWords[c.landmark]) : null;
        return (
          <button
            key={c.id}
            type="button"
            className={`dv-cell ${c.landmark ? 'dv-landmark' : 'dv-house'} ${on ? 'on' : ''}`}
            style={{ left: pct(b.x, MAP_W), top: pct(b.y, MAP_H), width: pct(b.w, MAP_W), height: pct(b.h, MAP_H) }}
            disabled={!plan}
            onClick={(e) => {
              if (zoomable && !zoomed) {
                zoomAt(e);
                return;
              }
              sfx('pickup');
              g.delivery.choosePlace(c.id);
            }}
            data-place={c.id}
            aria-pressed={on}
            aria-label={c.landmark ? undefined : `家（${c.door}のドア）`}
          >
            {label ? (
              <span className="dv-sign">
                <WordText text={label} interactive={false} />
              </span>
            ) : null}
            {on ? <span className="dv-pin" aria-hidden /> : null}
          </button>
        );
      })}
    </div>
  );
  if (!zoomable) return map;
  return (
    <div className={`dv-map-frame ${zoomed ? 'zoomed' : ''}`}>
      <div className="dv-map-scroll" ref={frame}>
        {map}
      </div>
      <button
        type="button"
        className="dv-zoom-btn"
        data-testid="map-zoom"
        onClick={() => {
          sfx('page');
          if (zoomed) setZoom(1);
          else {
            focus.current = { fx: 0.5, fy: 0.5 };
            setZoom(PHONE_ZOOM);
          }
        }}
      >
        {zoomed ? '全体を見る' : '拡大する'}
      </button>
      {!zoomed ? <span className="dv-zoom-hint hand">地図をタップすると、その辺りが大きく見える</span> : null}
    </div>
  );
}

// ------------------------------------------------------------------------------------- dial

/**
 * Angle of a slot on the dial: slots are spread evenly over the arc (morning on the left, evening
 * on the right) with a little gap between the periods, so the labels never overlap.
 */
function slotAngle(slots: { hour: number; period: string }[], hour: number): number {
  const pos: number[] = [];
  let k = 0;
  slots.forEach((s, i) => {
    if (i > 0 && s.period !== slots[i - 1].period) k += 0.6;
    pos.push(k);
    k++;
  });
  const max = pos[pos.length - 1] || 1;
  const i = Math.max(0, slots.findIndex((s) => s.hour === hour));
  return 168 - (pos[i] / max) * 156;
}

/** Choose the time on a sun dial: the slots lie on the sun's arc, morning left, evening right. */
export function TimeDial() {
  const g = useGame();
  const x = useDelivery();
  const town = useTown();
  if (!x || !town) return null;
  const plan = x.phase === 'plan';
  const sel = x.choice.hour;
  const sky = skyAt(sel !== null ? hourTime(sel) : 0.5);
  return (
    <div className="dv-dial" role="group" aria-label="届ける時間">
      <SunDialArt sky={sky} />
      {sel !== null ? (
        <span className="dv-dial-hand" style={{ transform: `rotate(${-slotAngle(town.shared.delivery.slots, sel)}deg)` }} aria-hidden>
          <span />
        </span>
      ) : null}
      {town.shared.delivery.slots.map((s) => {
        const a = (slotAngle(town.shared.delivery.slots, s.hour) * Math.PI) / 180;
        const left = 50 + Math.cos(a) * 45;
        const top = 91 - Math.sin(a) * 68;
        return (
          <button
            key={s.hour}
            type="button"
            className={`dv-slot dv-slot-${s.period} ${sel === s.hour ? 'on' : ''}`}
            style={{ left: `${left}%`, top: `${top}%` }}
            aria-pressed={sel === s.hour}
            disabled={!plan}
            data-hour={s.hour}
            onClick={() => {
              sfx('tick');
              g.delivery.chooseHour(s.hour);
            }}
          >
            {s.hour}:00
          </button>
        );
      })}
    </div>
  );
}

function DepartButton({ onGo }: { onGo: () => void }) {
  const x = useDelivery();
  if (!x || x.phase !== 'plan') return null;
  const ready = !!x.choice.place && x.choice.hour !== null;
  return (
    <button type="button" className="cv-btn cv-next dv-depart" data-testid="depart" disabled={!ready} onClick={onGo}>
      {ready ? '包みを持って出発する' : !x.choice.place ? '地図で届け先を選ぶ' : '時間を選ぶ'}
    </button>
  );
}

// ------------------------------------------------------------------------------------- the door

function personLook(place: string, id: PersonId, icon: string) {
  return lookFor(`${place}:${id}`, icon);
}

function DoorScene() {
  const g = useGame();
  const x = useDelivery()!;
  const town = useTown();
  const ui = useUi();
  const hold = useStoryHold();
  const [knocks, setKnocks] = useState(0);
  const [rap, setRap] = useState(0);
  const { progress } = g;
  const answerTalk = useTalkBurst(x.result ? `dv:${progress?.day}:${x.result.reaction}` : null, lineMs(x.result?.reaction ?? '', g.lang === 'zh'));
  useEffect(() => setKnocks(0), [x.phase]);
  if (!town || !progress) return null;
  const d = town.shared.delivery;
  const cell = d.map.find((c) => c.id === x.choice.place);
  const sky = skyAt(hourTime(x.choice.hour ?? 15));
  const home = someoneHome(x);
  const open = x.phase === 'result' ? !!x.choice.person : x.phase === 'door' && home;
  const r = town.text.delivery.recipients.find((q) => q.id === x.slip.recipient);
  const wall = cell?.landmark ? '#e3d0ad' : ['#efe2c4', '#e8d6b0', '#f2e8d4', '#e4d2b4'][((cell?.col ?? 0) * 7 + (cell?.row ?? 0) * 3) % 4];
  const doorCol = cell?.door ? DOOR_COLOURS[cell.door] : '#6b4222';
  const persons = d.persons;
  // Who stands at the door: the household (door phase), then whoever took the parcel.
  const res = x.result;
  const storyRecipient = !!r && hasFixedLook(r.id);
  const speaker =
    res && (storyRecipient || !x.choice.person)
      ? r
        ? lookFor(r.id, r.avatar)
        : null
      : res && x.choice.person
        ? personLook(x.choice.place ?? '', x.choice.person, persons.find((p) => p.id === x.choice.person)?.icon ?? '🙂')
        : null;
  const ex: Expression = res ? res.face : 'neutral';
  const knock = () => {
    sfx('knock');
    setKnocks((k) => Math.min(5, k + 1));
    setRap((n) => n + 1);
  };
  const back = () => {
    sfx('bell');
    if (hasNextSegment(progress)) g.nextSegment();
    else g.closeDay();
  };
  return (
    <div className="dv-door-scene" data-phase={x.phase}>
      <div className="dv-house">
        <Raster className="doorfront-art" label="door">
          <DoorFrontArt door={doorCol} open={open} wall={wall} sky={sky} />
        </Raster>
        {x.phase === 'knock' ? (
          <button type="button" className="dv-door-hit" onClick={knock} aria-label="ドアをノックする" data-testid="door">
            {knocks ? (
              <span key={rap} className="dv-rap hand" aria-hidden>
                コン
              </span>
            ) : null}
          </button>
        ) : null}
        {x.phase === 'door' && home ? (
          <div className="dv-household">
            {x.household.map((id, i) => {
              const icon = persons.find((p) => p.id === id)?.icon ?? '🙂';
              const n = x.household.length;
              return (
                <button
                  key={id}
                  type="button"
                  className="dv-person"
                  style={{ left: `${52.5 + (i - (n - 1) / 2) * 21}%`, ['--d' as string]: `${i * 0.12}s` }}
                  data-person={id}
                  onClick={() => {
                    sfx('paper');
                    g.delivery.handOver({ person: id });
                  }}
                  aria-label={`${id}に渡す`}
                >
                  <CustomerArt look={personLook(x.choice.place ?? '', id, icon)} ex="neutral" pose="rest" />
                </button>
              );
            })}
          </div>
        ) : null}
        {res && speaker ? (
          <div className="dv-recipient">
            <CustomerArt look={speaker} ex={ex} pose={x.choice.person ? 'hold' : 'rest'} talking={answerTalk} />
            {x.choice.person ? <span className="dv-held-parcel" aria-hidden /> : null}
          </div>
        ) : null}
        {res && !x.choice.person && x.choice.absent === 'door' ? <span className="dv-left-parcel" aria-hidden /> : null}
      </div>
      <div className="dv-door-ui">
        {x.phase === 'knock' ? (
          <div className="dv-ask">
            <p className="cv-narr hand">
              {x.choice.hour}:00、{cell?.landmark ? '建物' : '家'}の前に着いた。ドアをたたこう。{knocks ? `（${knocks}回）` : ''}
            </p>
            <div className="dv-ask-row">
              <button type="button" className="cv-btn" onClick={knock}>
                ノックする
              </button>
              <button
                type="button"
                className="cv-btn cv-next"
                disabled={!knocks}
                data-testid="wait"
                onClick={() => {
                  sfx('pickup');
                  g.delivery.knock(knocks);
                }}
              >
                返事を待つ
              </button>
            </div>
          </div>
        ) : x.phase === 'door' ? (
          home ? (
            <p className="cv-narr hand">ドアが開いた。誰に渡す？</p>
          ) : (
            <div className="dv-ask">
              <p className="cv-narr hand">……誰も出てこない。</p>
              <div className="dv-ask-row">
                <button type="button" className="cv-btn" data-absent="door" onClick={() => g.delivery.handOver({ absent: 'door' })}>
                  戸口に置いていく
                </button>
                <button type="button" className="cv-btn" data-absent="neighbour" onClick={() => g.delivery.handOver({ absent: 'neighbour' })}>
                  となりの家に預ける
                </button>
                <button type="button" className="cv-btn" data-absent="back" onClick={() => g.delivery.handOver({ absent: 'back' })}>
                  持ち帰る
                </button>
              </div>
            </div>
          )
        ) : res ? (
          <div className="dv-result" data-testid="delivery-result">
            <div className="bubble-paper dv-bubble">
              <div className="bubble-line">
                <WordText text={res.reaction} className="reaction-text" />
                <SpeakButton text={res.reaction} label="" className="speak-round" />
              </div>
            </div>
            <div className={`juice-rep dv-juice ${res.repDelta > 0 ? 'up' : res.repDelta < 0 ? 'down' : 'flat'}`}>
              評判 {res.repDelta > 0 ? `+${res.repDelta}` : res.repDelta}
              {res.tip ? (
                <span className="dv-tip">
                  <span className="coin-glyph" aria-hidden />+{res.tip}
                </span>
              ) : null}
            </div>
            {hold.held ? (
              <button type="button" className="cv-btn cv-next" onClick={hold.release} data-testid="story-more">
                話のつづきを聞く ›
              </button>
            ) : (
              <button type="button" className="cv-btn cv-next" data-testid="end-day" onClick={back}>
                {hasNextSegment(progress) ? '次へ' : '店に帰る（今日を終える）'}
              </button>
            )}
          </div>
        ) : null}
      </div>
      {ui.reducedMotion ? null : <span key={rap} className="dv-rap-fx" aria-hidden />}
    </div>
  );
}

// ------------------------------------------------------------------------------------- compositions

export function DeliveryScene({ onSettings }: { onSettings: () => void }) {
  const mobile = useMobile();
  const x = useDelivery();
  const ui = useUi();
  const g = useGame();
  // The short walk across the map after setting off.
  const [walking, setWalking] = useState(false);
  const timer = useRef<number>();
  useEffect(() => () => clearTimeout(timer.current), []);
  if (!x) return null;
  const go = () => {
    sfx('steps');
    if (ui.reducedMotion) {
      g.delivery.depart();
      return;
    }
    setWalking(true);
    timer.current = window.setTimeout(() => {
      setWalking(false);
      g.delivery.depart();
    }, 1700);
  };
  const atDoor = x.phase !== 'plan';
  return mobile ? (
    <div className={`m-town m-delivery ${atDoor ? 'at-door' : ''}`} data-segment="delivery">
      <div className="m-town-bg">
        <MarketBackdrop sky={atDoor ? skyAt(hourTime(x.choice.hour ?? 15)) : AFTERNOON} W={400} H={860} ground={300} />
      </div>
      <div className="m-town-top">
        <SlipPaper compact />
        <CornerHooks onSettings={onSettings} />
      </div>
      {atDoor ? (
        <DoorScene />
      ) : (
        <div className="m-town-main dv-plan">
          <TownMapScene walking={walking} />
          <TimeDial />
          <div className="m-town-row">
            <div className="m-town-books">
              <BookProps compact />
            </div>
            <DepartButton onGo={go} />
          </div>
        </div>
      )}
      <div className="m-paper">
        <TownNoticePaper />
      </div>
    </div>
  ) : (
    <DesktopDelivery onSettings={onSettings} walking={walking} go={go} atDoor={atDoor} hour={x.choice.hour} />
  );
}

function DesktopDelivery({ onSettings, walking, go, atDoor, hour }: { onSettings: () => void; walking: boolean; go: () => void; atDoor: boolean; hour: number | null }) {
  const { ref, scale } = useStageScale(1600, 1000);
  return (
    <div className="scene-viewport town-viewport" ref={ref} data-segment="delivery">
      <div className="stage dv-stage" style={{ width: 1600, height: 1000, transform: `translate(-50%, -50%) scale(${scale})` }}>
        {atDoor ? (
          <>
            <MarketBackdrop sky={skyAt(hourTime(hour ?? 15))} />
            <DoorScene />
            <div className="dv-d-slip dv-d-slip-small">
              <SlipPaper />
            </div>
          </>
        ) : (
          <>
            <div className="dv-table" aria-hidden />
            <div className="dv-d-map">
              <TownMapScene walking={walking} />
            </div>
            <div className="dv-d-slip">
              <SlipPaper />
            </div>
            <div className="dv-d-dial">
              <TimeDial />
              <DepartButton onGo={go} />
            </div>
            <div className="dv-d-books">
              <BookProps compact />
            </div>
            <div className="dv-afternoon" aria-hidden />
          </>
        )}
        <div className="d-paper">
          <TownNoticePaper />
        </div>
        <CornerHooks onSettings={onSettings} />
      </div>
    </div>
  );
}

export type { MapCell };
