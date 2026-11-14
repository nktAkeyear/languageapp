/* Content validator: `npm run validate-content`. Exits 1 on errors. */
import { CONTENT, SHARED } from '../src/content';
import { compareLanguages, validateLanguage, validateShared } from '../src/core/validate';
import { LANGS } from '../src/core/types';
import { loadEnglishListsFromDisk } from '../src/curriculum/node';
import { withLists } from '../src/curriculum/apply';
import { reconcileLexicon } from '../src/curriculum/curriculum';

let errors = 0;
let warnings = 0;
const print = (label: string, list: string[]) => list.forEach((m) => console.log(`  ${label} ${m}`));

// The compiled English lists (data/english): tolerant — missing or partial files are reported, not fatal.
const lists = loadEnglishListsFromDisk();
console.log('english lists (data/english)');
print('info ', lists.notes);
if (lists.vocab.length) {
  const rec = reconcileLexicon(CONTENT.en.lexicon, lists);
  console.log(`  info  lexicon ↔ vocab.json: ${rec.matched} of ${CONTENT.en.lexicon.length} lexicon words matched; levels / domains taken from the list`);
  if (rec.missing.length) {
    console.log(`  warn  ${rec.missing.length} lexicon word(s) not in vocab.json: ${rec.missing.join(', ')}`);
    warnings++;
  }
}

const shared = validateShared(SHARED);
console.log('\nshared content');
print('ERROR', shared.errors);
print('warn ', shared.warnings);
errors += shared.errors.length;
warnings += shared.warnings.length;

for (const lang of LANGS) {
  const r = validateLanguage(withLists(CONTENT[lang]), SHARED);
  console.log(`\n${lang}: ${Object.entries(r.stats).map(([k, v]) => `${k}=${v}`).join(' ')}`);
  print('ERROR', r.errors);
  print('warn ', r.warnings);
  errors += r.errors.length;
  warnings += r.warnings.length;
}
const par = compareLanguages(CONTENT.en, CONTENT.zh);
if (par.length) {
  console.log('\nparallel structure (en vs zh)');
  print('warn ', par);
  warnings += par.length;
}
console.log(`\n${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
