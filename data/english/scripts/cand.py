# candidate generation (exploratory + reused by build_vocab)
import csv, json, re, math, os, collections
os.environ.setdefault("NLTK_DATA","/tmp/claude-0/nltk")
from nltk.corpus import wordnet as wn
SRC=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","sources")
POSMAP={'noun':'noun','verb':'verb','adjective':'adjective','adverb':'adverb','pronoun':'pronoun','preposition':'preposition','determiner':'determiner','conjunction':'conjunction','number':'numeral','modal auxiliary':'auxiliary','be-verb':'verb','do-verb':'verb','have-verb':'verb','interjection':'interjection','infinitive-to':'particle','vern':'verb'}
WNPOS={'noun':'n','verb':'v','adjective':'a','adverb':'r'}
def read_cefrj():
    out=[]
    for fn,extra in (("cefrj/cefrj-vocabulary-profile-1.5.csv","cefrj"),("cefrj/octanove-vocabulary-profile-c1c2-1.0.csv","octanove")):
        for r in csv.DictReader(open(os.path.join(SRC,fn),encoding="utf-8")):
            hw=r['headword'].strip()
            hw=hw.split('/')[0].strip()   # first spelling variant
            out.append((hw,POSMAP.get(r['pos'].strip(),r['pos'].strip()),r['CEFR'].strip(),extra))
    return out
def read_ngsl31k():
    d={}
    for l in open(os.path.join(SRC,"ngsl-adapted/NGSL-31k-lemmas.txt"),encoding="utf-8"):
        if l.startswith('#') or not l.strip(): continue
        w,r=l.rstrip('\n').split('\t'); d[w]=int(r)
    return d
def read_ngsl_core():
    d={}
    for l in open(os.path.join(SRC,"ngsl-adapted/NGSL-1.2-forms.txt"),encoding="utf-8"):
        if l.startswith('#') or not l.strip(): continue
        w,r=l.rstrip('\n').split('\t'); d[w]=int(r)
    return d
def read_lists():
    d={}
    for n in ('tsl','bsl','nawl'):
        j=json.load(open(os.path.join(SRC,f"bsl-nawl-ngsl-tsl-processed/{n}.json"),encoding="utf-8"))
        d[n]={x['entry'].lower():x['rank'] for x in j}
    return d
def read_freq():
    d={}
    for l in list(open(os.path.join(SRC,"wordfreq-derived/en_top60k.tsv"),encoding="utf-8"))[1:]:
        r,w,z=l.split('\t'); d[w]=(int(r),float(z))
    return d

import lemminflect
def build_lemma_freq(freq):
    lf=collections.defaultdict(float)
    for w,(r,z) in freq.items():
        if not re.fullmatch(r"[a-z]+",w): continue
        cands={w}
        for ls in lemminflect.getAllLemmas(w).values(): cands.update(ls)
        cands={c for c in cands if c in freq or c==w}
        best=max(cands,key=lambda x:freq.get(x,(0,0))[1])
        lf[best]+=10**z
    return lf
def read_ejdict():
    d={}
    import glob
    for fn in sorted(glob.glob(os.path.join(SRC,"ejdict/*.txt"))):
        for l in open(fn,encoding="utf-8"):
            if '\t' not in l: continue
            w,m=l.rstrip('\n').split('\t',1)
            for ww in w.split(','): d.setdefault(ww.strip(),m)
    return d
def is_proper_only(w):
    ss=wn.synsets(w)
    if not ss: return True
    return all(s.instance_hypernyms() for s in ss)
