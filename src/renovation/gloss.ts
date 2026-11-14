/** Short form of an official gloss ("ひとつの（…）" → "ひとつの"), for comparing meanings. */
export function shortGloss(g: string | undefined): string {
  return (g ?? '').split(/[（(・／]/)[0];
}
