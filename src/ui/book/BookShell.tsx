/**
 * A physical book opened over the scene: leather cover, two paper pages (one on phones),
 * ribbon bookmarks, page-turn animation + sound whenever `turnKey` changes.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useMobile } from '../layout';
import { sfx } from '../sound';
import { useUi } from '../uiState';

export interface Ribbon {
  id: string;
  label: string;
  on: boolean;
  dot?: boolean;
  onClick(): void;
}

export function BookShell({
  kind,
  label,
  ribbons,
  left,
  right,
  showRight,
  onBack,
  backLabel = '‹ もどる',
  turnKey,
  onClose,
}: {
  kind: 'recipe' | 'notebook';
  label: string;
  ribbons?: Ribbon[];
  left: ReactNode;
  right: ReactNode;
  /** Phone: show the right-hand page instead of the left-hand one. */
  showRight: boolean;
  onBack?: () => void;
  backLabel?: string;
  turnKey: string;
  onClose: () => void;
}) {
  const mobile = useMobile();
  const ui = useUi();
  const [turn, setTurn] = useState(0);
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd');
  const prev = useRef(turnKey);
  useEffect(() => {
    if (prev.current === turnKey) return;
    setDir(turnKey < prev.current ? 'back' : 'fwd');
    prev.current = turnKey;
    sfx('page');
    if (!ui.reducedMotion) setTurn((t) => t + 1);
  }, [turnKey, ui.reducedMotion]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  return (
    <div className={`book-overlay book-${kind} ${mobile ? 'book-mobile' : ''}`} onClick={onClose} role="presentation">
      <div className="book-open" role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
        {ribbons ? (
          <div className="ribbons" role="tablist">
            {ribbons.map((r) => (
              <button key={r.id} type="button" role="tab" aria-selected={r.on} className={`ribbon ${r.on ? 'on' : ''}`} onClick={r.onClick} data-tab={r.id}>
                {r.label}
                {r.dot ? <span className="ribbon-dot" aria-label="新しい" /> : null}
              </button>
            ))}
          </div>
        ) : null}
        <button type="button" className="book-close" onClick={onClose} aria-label="本を閉じる" data-testid="close-book">
          ✕
        </button>
        <div className="book-cover">
          {mobile ? (
            <div className="paper page-single">
              {showRight && onBack ? (
                <button type="button" className="page-back" onClick={onBack}>
                  {backLabel}
                </button>
              ) : null}
              <div key={showRight ? `r${turnKey}` : 'l'} className={`page-scroll ${turn ? 'page-slide' : ''}`}>
                {showRight ? right : left}
              </div>
            </div>
          ) : (
            <div className="spread">
              <div className="paper page-l">
                <div className="page-scroll">{left}</div>
              </div>
              <div className="gutter" aria-hidden />
              <div className="paper page-r">
                <div key={turnKey} className="page-scroll">
                  {right}
                </div>
                {turn ? <div key={turn} className={`leaf leaf-${dir}`} aria-hidden /> : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
