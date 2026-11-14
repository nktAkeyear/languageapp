import { useState } from 'react';
import { useGame } from '../useGame';
import { sfx } from '../sound';

/** Japanese notes for newly opened town activities / levels, as a paper on the first segment of the day. */
export function TownNoticePaper() {
  const { townDay } = useGame();
  const [hidden, setHidden] = useState('');
  if (!townDay || townDay.seg !== 0 || !townDay.notes.length || townDay.segments[0] === 'shop' || hidden === `${townDay.day}`) return null;
  return (
    <div className="letter town-notice" role="dialog" aria-label="今日の知らせ">
      <div className="letter-title">今日の知らせ</div>
      {townDay.notes.map((n) => (
        <p key={n}>{n}</p>
      ))}
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          sfx('page');
          setHidden(`${townDay.day}`);
        }}
      >
        わかった
      </button>
    </div>
  );
}
