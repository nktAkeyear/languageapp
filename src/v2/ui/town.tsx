/**
 * The town: the nine workplaces as signboards. Desktop: on a small drawn harbour map; phone: a list of
 * signboards first (the map behind a tab). Two are open in v2 (the tea house, the clinic); the other seven are
 * shown as 移行中 (being moved to the new screens) and cannot be entered.
 */
import { useState } from 'react';
import { jobHoursJa, jobsOf, rankName } from '../../jobs/engine';
import type { JobDef } from '../../jobs/types';
import { chooseWorkplace, goRoom } from '../logic/day';
import type { WorkplaceId } from '../logic/catalog';
import { HarbourArt } from './art';
import { Icon } from './bits';
import { plain } from '../../core/gamedata';
import { Dock, Frame, PLACE, rankOf } from './frame';
import { useGame, useS } from './store';

const PORTED = new Set<string>(['teahouse', 'clinic']);
/** Where each signboard stands on the desktop map (percent of the map). */
const SPOT: Record<string, [number, number]> = {
  teahouse: [14, 70],
  inn: [14, 40],
  post: [44, 12],
  office: [70, 12],
  news: [44, 40],
  townhall: [70, 40],
  clinic: [44, 70],
  academy: [70, 70],
  kitchen: [14, 12],
};

export function Town() {
  const s = useS();
  const { data, act, layout } = useGame();
  const jobs = jobsOf(data);
  const [sel, setSel] = useState<string | null>(null);
  const [tab, setTab] = useState<'list' | 'map'>('list');
  const part = s.day.part;
  const job = sel ? jobs.find((j) => j.id === sel) ?? null : null;
  const back = () => act((st) => void goRoom(st, 'back'));
  const board = (j: JobDef) => <Signboard key={j.id} j={j} on={sel === j.id} onClick={() => setSel(j.id)} />;
  return (
    <Frame roomClass="room-town" dock={<Dock primary={{ label: `${PLACE[s.day.workplace].short}に戻る`, onClick: back, id: 'back-to-work' }} middle={<span className="ja-label town-hint">{part === 0 ? '今日の職場を選び直せる（始業前）' : '明日の朝に行く職場を選べる（業務後）'}</span>} />}>
      <div className={`town town-${layout}`}>
        {layout === 'phone' ? (
          <div className="town-tabs" role="tablist">
            <button role="tab" aria-selected={tab === 'list'} className={tab === 'list' ? 'on' : ''} onClick={() => setTab('list')}>
              看板の一覧
            </button>
            <button role="tab" aria-selected={tab === 'map'} className={tab === 'map' ? 'on' : ''} onClick={() => setTab('map')}>
              地図
            </button>
          </div>
        ) : null}
        {layout === 'phone' && tab === 'list' ? (
          <ul className="sign-list">{jobs.map((j) => <li key={j.id}>{board(j)}</li>)}</ul>
        ) : (
          <div className="town-map">
            <HarbourArt />
            {jobs.map((j) => {
              const [x, y] = SPOT[j.id] ?? [50, 50];
              return (
                <div key={j.id} className="spot" style={{ left: `${x}%`, top: `${y}%` }}>
                  {board(j)}
                </div>
              );
            })}
          </div>
        )}
        {job ? <JobCard j={job} part={part} onClose={() => setSel(null)} onChoose={(wp) => act((st, c) => chooseWorkplace(st, c, wp))} /> : null}
      </div>
    </Frame>
  );
}

function Signboard({ j, on, onClick }: { j: JobDef; on: boolean; onClick: () => void }) {
  const s = useS();
  const ported = PORTED.has(j.id);
  const sign = j.content.en?.sign ?? '';
  const today = s.day.workplace === j.id;
  const tomorrow = s.next === j.id && s.day.part === 2;
  return (
    <button className={`signboard ${ported ? '' : 'moving'} ${on ? 'on' : ''} ${today ? 'today' : ''}`} onClick={onClick} aria-label={`${j.nameJa}${ported ? '' : '（移行中）'}`}>
      <span className="sb-sign" lang="en">
        {sign ? plain(sign) : 'Harbour Tea House'}
      </span>
      <span className="sb-ja">{j.nameJa}</span>
      <span className="sb-meta">
        {ported ? (
          <>
            <span className="pips" aria-hidden>
              {[1, 2, 3, 4, 5].map((i) => (
                <i key={i} className={i <= rankOf(s, j.id) ? 'on' : ''} />
              ))}
            </span>
            <span>{today ? '今日の職場' : tomorrow ? '明日の職場' : jobHoursJa(j)}</span>
          </>
        ) : (
          <span className="moving-tag">移行中</span>
        )}
      </span>
    </button>
  );
}

function JobCard({ j, part, onClose, onChoose }: { j: JobDef; part: number; onClose: () => void; onChoose: (wp: WorkplaceId) => void }) {
  const s = useS();
  const ported = PORTED.has(j.id);
  const wp = j.id as WorkplaceId;
  const rank = rankOf(s, j.id);
  return (
    <div className="job-card paper" role="dialog" aria-label={j.nameJa}>
      <header>
        <h3>{j.nameJa}</h3>
        <button className="icon-btn" onClick={onClose} aria-label="閉じる">
          <Icon name="close" />
        </button>
      </header>
      {ported ? (
        <>
          <p className="ja-body">{j.blurbJa.split('。')[0]}。</p>
          <p className="ja-label">
            位：{rankName(rank)}（{rank}）・{jobHoursJa(j)}
          </p>
          {part === 0 ? (
            s.day.workplace === wp ? (
              <p className="ja-label">今日はここで働く。</p>
            ) : (
              <button className="btn-primary" id={`work-${wp}`} onClick={() => onChoose(wp)}>
                今日はここで働く
              </button>
            )
          ) : part === 2 ? (
            s.next === wp ? (
              <p className="ja-label">明日の朝はここから始まる。</p>
            ) : (
              <button className="btn-secondary" id={`next-${wp}`} onClick={() => onChoose(wp)}>
                明日はここで働く
              </button>
            )
          ) : null}
        </>
      ) : (
        <p className="ja-body">移行中：この職場は新しい画面への移し替えがまだ。旧版では遊べます。</p>
      )}
    </div>
  );
}
