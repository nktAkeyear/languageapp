"""Apply the level overrides (overrides/levels.tsv) and additions (overrides/additions.tsv) onto vocab.json.

Run AFTER scripts/apply_review.py (which sets ja/domains), e.g.
    python3 scripts/apply_review.py && python3 scripts/apply_levels.py && python3 -I scripts/validate.py

levels.tsv     word <TAB> pos <TAB> eiken <TAB> toeic <TAB> note
    pos "*" = every entry of that word; word match is case-insensitive.
    eiken / toeic "=" = leave as is; toeic "null" = no TOEIC band. Later rows win. Idempotent.
additions.tsv  word <TAB> pos <TAB> eiken <TAB> toeic <TAB> cefr <TAB> ja <TAB> domains(comma-separated)
    Adds an entry unless (word,pos) already exists. freq = rank in sources/wordfreq-derived/en_top60k.tsv,
    else 60000+len(word) (same fallback as build_vocab.py).
The file is re-sorted with the build's key (eiken grade, freq, word) and written with the same JSON format as apply_review.py.
"""
import json, os, sys
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(here)
EIKEN = ['5', '4', '3', 'pre2', '2', 'pre1', '1']
TOEIC = {'400': 400, '500': 500, '600': 600, '730': 730, '860': 860, '990': 990, 'null': None}
vocab = json.load(open(os.path.join(root, 'vocab.json'), encoding='utf-8'))
valid_dom = {d['id'] for d in json.load(open(os.path.join(root, 'domains.json'), encoding='utf-8'))}

def rows(name, ncol):
    for n, line in enumerate(open(os.path.join(root, 'overrides', name), encoding='utf-8'), 1):
        if not line.strip() or line.startswith('#'):
            continue
        c = line.rstrip('\n').split('\t')
        if len(c) < ncol:
            sys.exit(f'{name}:{n}: expected {ncol} columns, got {len(c)}')
        yield n, c

# ---- levels
by_word = {}
for e in vocab:
    by_word.setdefault(e['word'].lower(), []).append(e)
changed = missing = capped = 0
CEFR_CAP = {'5': 'A2', '4': 'A2', '3': 'B1'}   # a C1/C2 label cannot stay on an entry lowered to 英検 5-3 (validate.py rule)
for n, (w, pos, eik, toe, *_rest) in rows('levels.tsv', 4):
    if eik != '=' and eik not in EIKEN:
        sys.exit(f'levels.tsv:{n}: bad eiken {eik}')
    if toe != '=' and toe not in TOEIC:
        sys.exit(f'levels.tsv:{n}: bad toeic {toe}')
    hit = [e for e in by_word.get(w.lower(), []) if pos == '*' or e['pos'] == pos]
    if not hit:
        print(f'levels.tsv:{n}: no entry {w}/{pos}'); missing += 1
        continue
    for e in hit:
        new_e = e['eiken'] if eik == '=' else eik
        new_t = e['toeic'] if toe == '=' else TOEIC[toe]
        if (new_e, new_t) != (e['eiken'], e['toeic']):
            e['eiken'], e['toeic'] = new_e, new_t
            changed += 1
        if e['eiken'] in CEFR_CAP and e['cefr'] in ('C1', 'C2'):
            e['cefr'] = CEFR_CAP[e['eiken']]
            capped += 1

# ---- additions
freq = {}
p = os.path.join(root, 'sources', 'wordfreq-derived', 'en_top60k.tsv')
if os.path.exists(p):
    for line in open(p, encoding='utf-8'):
        c = line.rstrip('\n').split('\t')
        if len(c) >= 2 and c[0].isdigit():
            freq.setdefault(c[1].lower(), int(c[0]))
have = {(e['word'], e['pos']) for e in vocab}
added = 0
for n, (w, pos, eik, toe, cefr, ja, dom, *_rest) in rows('additions.tsv', 7):
    doms = dom.split(',')
    if eik not in EIKEN or toe not in TOEIC or any(d not in valid_dom for d in doms):
        sys.exit(f'additions.tsv:{n}: bad eiken/toeic/domain for {w}')
    if (w, pos) in have:
        continue
    vocab.append({'word': w, 'pos': pos, 'eiken': eik, 'toeic': TOEIC[toe], 'cefr': cefr, 'ja': ja,
                  'domains': doms, 'freq': freq.get(w.lower(), 60000 + len(w))})
    have.add((w, pos)); added += 1

vocab.sort(key=lambda e: (EIKEN.index(e['eiken']), e['freq'], e['word']))
json.dump(vocab, open(os.path.join(root, 'vocab.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print(f'levels: {changed} entries changed, {capped} cefr labels capped, {missing} rows matched nothing; additions: {added} new; {len(vocab)} entries')
