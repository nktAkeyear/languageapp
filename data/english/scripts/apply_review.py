"""Apply reviewed glosses/domains (review/out_*.tsv) onto vocab.json. Run after any rebuild of vocab.json."""
import json, glob, os
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(here)
vocab = json.load(open(os.path.join(root, 'vocab.json'), encoding='utf-8'))
valid = {d['id'] for d in json.load(open(os.path.join(root, 'domains.json'), encoding='utf-8'))}
DROP = {('ness', None), ('hearted', None), ('eco', None), ('doc', None)}
rev = {}
for p in sorted(glob.glob(os.path.join(root, 'review', 'out_*.tsv'))):
    for line in open(p, encoding='utf-8'):
        w, pos, ja, dom = line.rstrip('\n').split('\t')
        doms = [d for d in dom.split(',') if d in valid]
        if ja and doms:
            rev[(w, pos)] = (ja, doms)
out, applied = [], 0
for e in vocab:
    if (e['word'], None) in DROP:
        continue
    r = rev.get((e['word'], e['pos']))
    if r:
        e['ja'], e['domains'] = r[0], r[1]
        applied += 1
    out.append(e)
json.dump(out, open(os.path.join(root, 'vocab.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print(f'applied {applied} reviews; {len(vocab)-len(out)} dropped; {len(out)} entries')
