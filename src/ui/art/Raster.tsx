/**
 * Pre-rasterised static art. The big textured layers (plaster and wood grain drawn with SVG
 * turbulence filters) never change while a scene is up, but anything animated in the same paint
 * layer — a wave in the window, a customer blinking, the lamp — makes the browser repaint the
 * region underneath, re-running those filters every frame (very costly on phones).
 *
 * <Raster> renders its SVG once, serialises it together with the shared art definitions
 * (gradients, filters, see defs.tsx) into a standalone SVG document and shows it as an <img>:
 * the browser rasterises the filters once and from then on only copies pixels. When the SVG's
 * markup changes (time of day, paint), it is re-serialised. Falls back to the live SVG wherever
 * serialisation is not possible.
 */
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

let defsCache: { key: string; markup: string } | null = null;

function sharedDefs(): string {
  const el = document.querySelector('svg.art-defs defs');
  if (!el) return '';
  const markup = el.innerHTML;
  if (defsCache?.key !== markup) defsCache = { key: markup, markup };
  return defsCache.markup;
}

/** CSS custom properties used inside the art (an image document cannot see the page's CSS). */
function resolveVars(svg: string): string {
  if (!svg.includes('var(--')) return svg;
  const cs = getComputedStyle(document.documentElement);
  return svg.replace(/var\((--[\w-]+)\)/g, (_m, name: string) => cs.getPropertyValue(name).trim().replace(/"/g, "'") || 'serif');
}

const urlCache = new Map<string, string>();

function toDataUrl(svgMarkup: string): string | null {
  const cached = urlCache.get(svgMarkup);
  if (cached) return cached;
  const open = svgMarkup.match(/^<svg\b[^>]*>/);
  if (!open) return null;
  let head = open[0];
  if (!head.includes('xmlns=')) head = head.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  const body = svgMarkup.slice(open[0].length);
  const doc = resolveVars(`${head}<defs>${sharedDefs()}</defs>${body}`);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(doc)}`;
  if (urlCache.size > 24) urlCache.clear();
  urlCache.set(svgMarkup, url);
  return url;
}

export function Raster({ children, className = 'backdrop', label }: { children: ReactNode; className?: string; label?: string }) {
  const live = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [markup, setMarkup] = useState('');
  // Render the live SVG (hidden once an image exists) and serialise it after every change.
  useLayoutEffect(() => {
    const el = live.current;
    if (!el) return;
    const svg = el.querySelector('svg');
    if (!svg) {
      if (markup) {
        setMarkup('');
        setSrc(null);
      }
      return;
    }
    const m = svg.outerHTML;
    if (m === markup) return;
    setMarkup(m);
    try {
      setSrc(toDataUrl(m));
    } catch {
      setSrc(null);
    }
  });
  return (
    <>
      {src ? <img className={`${className} raster`} src={src} alt="" aria-hidden draggable={false} data-raster={label} /> : null}
      <div ref={live} className="raster-src" style={src ? { display: 'none' } : { display: 'contents' }} aria-hidden>
        {children}
      </div>
    </>
  );
}
