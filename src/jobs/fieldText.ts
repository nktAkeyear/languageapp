/** A label that does not read as a noun after "the" ("By", "Send by", "Who", "Room, a night"). */
const NOT_NOUN = /^(to|by|from|inside|outside|who|why|what|when|where|how|send|pay|leave|arrive|come|sign|signed|please|they|wants|needs|bring|keep|ready|sent|paid|arrived|coming|only|in|on|at)\b|\b(by|at|to|for|from|before|in)$|,/i;
const PROPER = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December)\b|\|@\}/;

/**
 * A paper's field label in running text after "the": lowercased when it reads as a noun ("the tracking number"),
 * kept for a proper noun ("the Monday"), quoted as a line when it does not read as a noun ("the “By” line", not
 * "the by").
 */
export function fieldInText(label: string): string {
  if (NOT_NOUN.test(label.replace(/\{([^{}|]+)\|[^{}]*\}/g, '$1'))) return `“${label}” line`;
  if (PROPER.test(label)) return label;
  return /^[A-Z][a-z]/.test(label) ? label[0].toLowerCase() + label.slice(1) : label;
}
