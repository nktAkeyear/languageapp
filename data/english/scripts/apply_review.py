"""Apply reviewed glosses/domains (review/out_*.tsv) onto vocab.json. Run after any rebuild of vocab.json."""
import json, glob, os
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(here)
vocab = json.load(open(os.path.join(root, 'vocab.json'), encoding='utf-8'))
valid = {d['id'] for d in json.load(open(os.path.join(root, 'domains.json'), encoding='utf-8'))}
DROP = {('ness', None), ('hearted', None), ('eco', None), ('doc', None)}
rev = {}
# review/drop.txt: `word<TAB>pos` lines = noise headwords to remove (pos '*' = every entry of the word)
DROPPOS = set()
_dp = os.path.join(root, 'review', 'drop.txt')
if os.path.exists(_dp):
    for line in open(_dp, encoding='utf-8'):
        if line.strip() and not line.startswith('#'):
            c = line.rstrip('\n').split('\t')
            DROPPOS.add((c[0], c[1] if len(c) > 1 else '*'))
for p in sorted(glob.glob(os.path.join(root, 'review', 'out_*.tsv'))):
    for line in open(p, encoding='utf-8'):
        w, pos, ja, dom = line.rstrip('\n').split('\t')
        doms = ['='] if dom == '=' else [d for d in dom.split(',') if d in valid]   # '=' keeps the entry's domains
        if ja and doms:
            rev[(w, pos)] = (ja, doms)
# review/pos.tsv: `word<TAB>oldpos<TAB>newpos` = part-of-speech fixes (if (word,newpos) already exists the old entry is dropped)
POSFIX = {}
_pp = os.path.join(root, 'review', 'pos.tsv')
if os.path.exists(_pp):
    for line in open(_pp, encoding='utf-8'):
        if line.strip() and not line.startswith('#'):
            w, o, n = line.rstrip('\n').split('\t')[:3]
            POSFIX[(w, o)] = n
_have = {(e['word'], e['pos']) for e in vocab}
_kept = []
for e in vocab:
    n = POSFIX.get((e['word'], e['pos']))
    if n:
        if (e['word'], n) in _have:
            continue
        e['pos'] = n
    _kept.append(e)
vocab = _kept
# review/domains.tsv: `word[:pos]<TAB>domains` = domain-tag-only corrections, applied after the ja/domains reviews
DOMFIX = {}
_dd = os.path.join(root, 'review', 'domains.tsv')
if os.path.exists(_dd):
    for line in open(_dd, encoding='utf-8'):
        if line.strip() and not line.startswith('#'):
            k, d = line.rstrip('\n').split('\t')[:2]
            w, _, p = k.partition(':')
            ds = [x for x in d.split(',') if x in valid]
            if ds:
                DOMFIX[(w, p or None)] = ds
out, applied = [], 0
for e in vocab:
    if (e['word'], None) in DROP:
        continue
    if (e['word'], e['pos']) in DROPPOS or (e['word'], '*') in DROPPOS:
        continue
    r = rev.get((e['word'], e['pos']))
    if r:
        e['ja'] = r[0]
        if r[1] != ['=']:
            e['domains'] = r[1]
        applied += 1
    dm = DOMFIX.get((e['word'], e['pos'])) or DOMFIX.get((e['word'], None))
    if dm and e['eiken'] in ('pre1', '1'):   # these fixes were made on the 準1級/1級 entries only
        e['domains'] = dm
    out.append(e)
json.dump(out, open(os.path.join(root, 'vocab.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print(f'applied {applied} reviews; {len(vocab)-len(out)} dropped; {len(out)} entries')
