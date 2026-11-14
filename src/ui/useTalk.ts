import { useEffect, useState } from 'react';

/**
 * A short burst of "talking" whenever `key` changes to a new non-null value: true for `ms`
 * milliseconds (the drawn character's mouth moves while a line appears).
 */
export function useTalkBurst(key: string | null, ms: number): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!key) {
      setOn(false);
      return;
    }
    setOn(true);
    const t = window.setTimeout(() => setOn(false), ms);
    return () => clearTimeout(t);
  }, [key, ms]);
  return on;
}

/** How long reading a line aloud takes, roughly (for the mouth and the word-by-word reveal). */
export function lineMs(text: string, zh: boolean): number {
  const n = text.replace(/\{([^|}]*)\|[^}]*\}/g, '$1').length;
  return Math.min(4200, Math.max(900, n * (zh ? 170 : 58)));
}
