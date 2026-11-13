/* Content validator: `npm run validate-content`. Exits 1 on errors. */
import { CONTENT, SHARED } from '../src/content';
import { compareLanguages, validateLanguage, validateShared } from '../src/core/validate';
import { LANGS } from '../src/core/types';

let errors = 0;
let warnings = 0;
const shared = validateShared(SHARED);
const print = (label: string, list: string[]) => list.forEach((m) => console.log(`  ${label} ${m}`));
console.log('shared content');
print('ERROR', shared.errors);
print('warn ', shared.warnings);
errors += shared.errors.length;
warnings += shared.warnings.length;

for (const lang of LANGS) {
  const r = validateLanguage(CONTENT[lang], SHARED);
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
