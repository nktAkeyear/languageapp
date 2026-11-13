import type { ReactNode } from 'react';

/** Modal (desktop) or bottom sheet (mobile). */
export function Overlay({ children, onClose, variant }: { children: ReactNode; onClose: () => void; variant: 'modal' | 'sheet' }) {
  return (
    <div className={`overlay overlay-${variant}`} onClick={onClose} role="presentation">
      <div className={`overlay-body overlay-body-${variant}`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
