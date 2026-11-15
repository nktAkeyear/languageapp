/**
 * Small shared pieces: tappable in-world text, the reading card, drawn icons (one stroke family), the coin count,
 * the listen button.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { plain } from '../../core/gamedata';
import { noteOf } from '../../core/wordbook';
import { speak, speechSupported, findVoice } from '../../ui/speech';
import { useGame } from './store';

/**
 * In-world text: every word opens its notebook page; the player's own meaning is written small under it.
 * `live = false` inside a slip that is picked by tapping it: the words show the player's meanings but the tap picks
 * the slip; once picked, its words open their pages.
 */
export function Words({ text, className, live = true }: { text: string; className?: string; live?: boolean }) {
  const { data, s, openWord, nb } = useGame();
  const toks = data.tokens(text);
  return (
    <span className={`words ${className ?? ''}`} lang="en">
      {toks.map((t, i) => {
        if (!t.id || t.name) return <span key={i}>{t.text}</span>;
        const w = s?.p.words[t.id];
        const guess = s ? noteOf(s.p, t.id).guess : '';
        const conf = !!w?.confirmed;
        const id = t.id;
        if (!live)
          return (
            <span key={i} className={`w w-passive ${conf ? 'w-conf' : ''} ${guess ? 'w-has' : ''}`}>
              <span className="w-t">{t.text}</span>
              {guess ? <span className="w-g" lang="ja">{guess}</span> : null}
            </span>
          );
        return (
          <span
            key={i}
            role="button"
            tabIndex={0}
            className={`w ${conf ? 'w-conf' : ''} ${guess ? 'w-has' : ''} ${nb.open && nb.word === id ? 'w-on' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              openWord(id);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openWord(id);
              }
            }}
          >
            <span className="w-t">{t.text}</span>
            {guess ? <span className="w-g" lang="ja">{guess}</span> : null}
          </span>
        );
      })}
    </span>
  );
}

export function canSpeak(): boolean {
  return speechSupported() && !!findVoice('en');
}

export function ListenButton({ text, label = '聞く' }: { text: string; label?: string }) {
  const [ok, setOk] = useState(canSpeak);
  useEffect(() => {
    const t = window.setTimeout(() => setOk(canSpeak()), 800);
    return () => window.clearTimeout(t);
  }, []);
  if (!ok) return null;
  return (
    <button className="btn-quiet listen" onClick={() => speak(plain(text), 'en')} aria-label={label}>
      <Icon name="speaker" /> <span>{label}</span>
    </button>
  );
}

type IconName = 'book' | 'coin' | 'speaker' | 'door' | 'map' | 'crate' | 'star' | 'starOn' | 'pen' | 'menu' | 'close' | 'back' | 'cart' | 'form' | 'basket' | 'minus' | 'plus' | 'check' | 'stamp';

/** Drawn icons, one stroke weight (2), no emoji. */
export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  let body: ReactNode = null;
  switch (name) {
    case 'book':
      body = (
        <g {...p}>
          <path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5C4.7 20 4 19.3 4 18.5z" />
          <path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H13v16h5.5c.8 0 1.5-.7 1.5-1.5z" />
          <path d="M11 4h2M11 20h2" />
        </g>
      );
      break;
    case 'coin':
      body = (
        <g>
          <circle cx="12" cy="12" r="8.5" fill="#d9a93c" stroke="#7a5414" strokeWidth="2" />
          <circle cx="12" cy="12" r="5" fill="none" stroke="#9a6e1e" strokeWidth="1.5" />
        </g>
      );
      break;
    case 'speaker':
      body = (
        <g {...p}>
          <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
          <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
        </g>
      );
      break;
    case 'door':
      body = (
        <g {...p}>
          <path d="M6 21V4.5c0-.3.2-.5.5-.5h11c.3 0 .5.2.5.5V21" />
          <path d="M3.5 21h17" />
          <circle cx="15" cy="12.5" r="1" fill="currentColor" />
        </g>
      );
      break;
    case 'map':
      body = (
        <g {...p}>
          <path d="M3.5 6.5 9 4.5l6 2 5.5-2v13l-5.5 2-6-2-5.5 2z" />
          <path d="M9 4.5v13M15 6.5v13" />
        </g>
      );
      break;
    case 'crate':
      body = (
        <g {...p}>
          <rect x="3.5" y="7" width="17" height="12.5" rx="1" />
          <path d="M3.5 11.5h17M3.5 15.5h17M8 7v12.5M16 7v12.5" />
          <path d="M6 7l2-3h8l2 3" />
        </g>
      );
      break;
    case 'star':
    case 'starOn':
      body = <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z" {...p} fill={name === 'starOn' ? 'currentColor' : 'none'} />;
      break;
    case 'pen':
      body = (
        <g {...p}>
          <path d="M15.5 4.5l4 4L9 19l-5 1 1-5z" />
          <path d="M13 7l4 4" />
        </g>
      );
      break;
    case 'menu':
      body = <path d="M4.5 7h15M4.5 12h15M4.5 17h15" {...p} />;
      break;
    case 'close':
      body = <path d="M6 6l12 12M18 6 6 18" {...p} />;
      break;
    case 'back':
      body = <path d="M14.5 5.5 8 12l6.5 6.5" {...p} />;
      break;
    case 'cart':
    case 'basket':
      body = (
        <g {...p}>
          <path d="M3.5 9.5h17l-1.8 9.2c-.1.5-.5.8-1 .8H6.3c-.5 0-.9-.3-1-.8z" />
          <path d="M8 9.5 11 4M16 9.5 13 4M9 13v3.5M15 13v3.5M12 13v3.5" />
        </g>
      );
      break;
    case 'form':
      body = (
        <g {...p}>
          <path d="M6.5 3.5h8l4 4v12.5c0 .3-.2.5-.5.5h-11.5c-.3 0-.5-.2-.5-.5V4c0-.3.2-.5.5-.5z" />
          <path d="M14.5 3.5v4h4M9 11h7M9 14.5h7M9 18h4" />
        </g>
      );
      break;
    case 'minus':
      body = <path d="M6 12h12" {...p} strokeWidth={2.5} />;
      break;
    case 'plus':
      body = <path d="M6 12h12M12 6v12" {...p} strokeWidth={2.5} />;
      break;
    case 'check':
      body = <path d="M5 12.5l4.5 4.5L19 7.5" {...p} />;
      break;
    case 'stamp':
      body = (
        <g {...p}>
          <path d="M9.5 3.5h5v6l2.5 2.5v2h-10v-2l2.5-2.5z" />
          <path d="M5 18.5h14v2H5z" />
        </g>
      );
      break;
  }
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      {body}
    </svg>
  );
}

export function Coins({ n }: { n: number }) {
  return (
    <span className="coins" aria-label={`所持金 ${n} 枚`}>
      <Icon name="coin" size={20} />
      <b>{n}</b>
    </span>
  );
}

/** The large paper card everything in-world is read on. */
export function ReadingCard({ who, children, tools, kind = 'speech', className }: { who?: ReactNode; children: ReactNode; tools?: ReactNode; kind?: 'speech' | 'note' | 'paper'; className?: string }) {
  return (
    <section className={`reading reading-${kind} ${className ?? ''}`}>
      {who ? <div className="reading-who">{who}</div> : null}
      <div className="reading-body">{children}</div>
      {tools ? <div className="reading-tools">{tools}</div> : null}
    </section>
  );
}
