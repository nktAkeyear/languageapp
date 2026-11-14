#!/usr/bin/env python3
"""Build data/english/vocab.json from open sources + rules.  Run with the venv python
(needs nltk+WordNet data, lemminflect, see sources/README.md):
    python build_vocab.py
Inputs : ../sources/*, ../overrides/*
Outputs: ../vocab.json, ../build/stats.json, ../build/missing_gloss.txt"""
import sys, os, json, re, math, collections
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,HERE)
from cand import *
from lemminflect import getAllLemmas
from gloss import make_gloss, LAST_MATCH
import domains as D
OUT=os.path.join(HERE,"..")
OV=os.path.join(OUT,"overrides")
os.makedirs(os.path.join(OUT,"build"),exist_ok=True)

def tsv(fn,n):
    out=[]
    p=os.path.join(OV,fn)
    if not os.path.exists(p): return out
    for l in open(p,encoding="utf-8"):
        if l.startswith('#') or not l.strip(): continue
        parts=l.rstrip('\n').split('\t')
        if len(parts)>=n: out.append(parts)
    return out
BLOCK={l.strip().lower() for l in open(os.path.join(OV,"block.txt"),encoding="utf-8") if l.strip() and not l.startswith('#')} if os.path.exists(os.path.join(OV,"block.txt")) else set()

freq=read_freq(); n31=read_ngsl31k(); core=read_ngsl_core(); lists=read_lists(); ej=read_ejdict()
tsl,bsl,nawl=lists['tsl'],lists['bsl'],lists['nawl']
# ---- lemma frequency ranks
def lemma_of(w):
    o=set()
    for pos,ls in getAllLemmas(w).items():
        for l in ls:
            if l!=w and l in freq and freq[l][1]>=freq[w][1]-3.0: o.add(l)
    return o
lf=collections.defaultdict(float)
INFL={}
for w,(r,z) in freq.items():
    if not re.fullmatch(r"[a-z]+",w): continue
    o=lemma_of(w)
    if o: INFL[w]=max(o,key=lambda x:freq[x][1])
    lf[INFL.get(w,w)]+=10**z
rank={w:i for i,(w,_) in enumerate(sorted(lf.items(),key=lambda x:-x[1]),1)}

def ej_entry(word,variants=()):
    for w in [word]+list(variants)+[word.lower()]:
        e=ej.get(w)
        for _ in range(3):
            if e and e.startswith('='):
                m=re.match(r"=\s*([A-Za-z\-' ]+)",e)
                if m and m.group(1).strip() in ej: e=ej[m.group(1).strip()]; continue
            break
        if e and not e.startswith('='): return e
    return None

# ---- candidates
ents={}   # (word,pos)-> dict
def add(word,pos,cefr,src,variants=()):
    k=(word,pos)
    if k in ents: 
        ents[k]['src'].add(src); return
    ents[k]={'word':word,'pos':pos,'cefr':cefr,'src':{src},'variants':variants}
RX=re.compile(r"^[A-Za-z][A-Za-z'\-]*$")
import csv
for fn,src in (("cefrj/cefrj-vocabulary-profile-1.5.csv","cefrj"),("cefrj/octanove-vocabulary-profile-c1c2-1.0.csv","octanove")):
    for r in csv.DictReader(open(os.path.join(SRC,fn),encoding="utf-8")):
        parts=[p.strip() for p in r['headword'].split('/')]
        hw=parts[0]; pos=POSMAP.get(r['pos'].strip(),r['pos'].strip())
        if pos not in ('noun','verb','adjective','adverb','pronoun','preposition','determiner','conjunction','numeral','auxiliary','interjection','particle'): continue
        if not RX.match(hw): continue
        if hw.isupper() and len(hw)>1: continue
        if hw.lower() in BLOCK: continue
        if hw[0].isupper() and hw.lower() not in ('i',): pass  # keep proper (months, days, nationalities)
        elif hw=='I' : pass
        if pos in ('noun','verb','adjective','adverb') and not wn.synsets(hw.lower(),pos=WNPOS[pos]):
            alt=None
            for q in ('noun','verb','adjective','adverb'):
                if wn.synsets(hw.lower(),pos=WNPOS[q]): alt=alt or q
            if alt: pos=alt
        add(hw,pos,r['CEFR'].strip(),src,tuple(parts[1:]))
cj_words={w.lower() for (w,p) in ents}
for e_ in ents.values():
    for v_ in e_['variants']: cj_words.add(v_.lower())
def has_instance(w):
    return any(s.instance_hypernyms() for s in wn.synsets(w))
VULG=re.compile(r"性交|陰茎|膣|売春|わいせつ|陰部|ののしり|卑|男色|同性愛|麻薬|マスターベーション|精液|睾丸|尻|乳首|排尿|大便|肛門|《禁句》|淫|娼|ホモ|生殖器|ちんぽ|まんこ")
def amer(w):
    out=[]
    for a,b in (("our","or"),("ise","ize"),("isation","ization"),("ising","izing"),("tre","ter"),("ogue","og"),("yse","yze"),("ence","ense"),("ae","e"),("ll","l")):
        if w.endswith(a): out.append(w[:-len(a)]+b)
    return out
# extras
def wn_pos(w):
    wt={'noun':0,'verb':0,'adjective':0,'adverb':0}
    for s in wn.synsets(w):
        if s.instance_hypernyms(): continue
        p={'n':'noun','v':'verb','a':'adjective','s':'adjective','r':'adverb'}[s.pos()]
        for l in s.lemmas():
            if l.name().lower()==w: wt[p]+=l.count()+0.3
    best=max(wt,key=wt.get)
    return best if wt[best]>0 else None
ex_cut=int(os.environ.get("EX_RANK","22000"))
EX_R=int(os.environ.get("EX_R","8500")); EX_N=int(os.environ.get("EX_N","12000"))
def is_infl(w):
    if w in core and w not in INFL: return False
    o=lemma_of(w)
    return bool(o)
extra=[]
for w,r in sorted(rank.items(),key=lambda x:x[1]):
    if r>ex_cut: break
    if w in cj_words or w in BLOCK or not re.fullmatch(r"[a-z]{3,}",w): continue
    if is_infl(w): continue
    e=ej_entry(w)
    if not e or re.match(r"^[《\[(A-Za-z=]",e) and (e.startswith('《略') or e.startswith('=')): continue
    if D.wn.synsets(w)==[] or is_proper_only(w): continue
    flagged=(w in tsl or w in bsl or w in nawl or w in core)
    if VULG.search(e[:200]): continue
    if not flagged and has_instance(w): continue
    if any(a in rank and a!=w and (a in cj_words or rank[a]<rank[w]) for a in amer(w)): continue
    if not flagged and not (r<=EX_R and w in n31 and n31[w]<=EX_N): continue
    p=wn_pos(w)
    if not p: continue
    extra.append((w,p,r))
def est_cefr(r):
    return 'B1' if r<=3000 else 'B2' if r<=7000 else 'C1' if r<=13000 else 'C2'
for w,p,r in extra: add(w,p,est_cefr(r),'freq')
print("candidates",len(ents),"extras",len(extra),file=sys.stderr)

# ---- fill fields
BASE={'A1':0,'A2':1,'B1':2,'B2':3,'C1':4,'C2':5}
EIKEN=['5','4','3','pre2','2','pre1','1']
CUM=[600,1300,2100,3600,5100,7500]
rows=list(ents.values())
for e in rows:
    w=e['word'].lower()
    e['freqrank']=rank.get(w, 60000+len(w))
# percentile within CEFR level by rank
grp=collections.defaultdict(list)
for e in rows: grp[e['cefr']].append(e)
for c,l in grp.items():
    l.sort(key=lambda e:(e['freqrank']))
    for i,e in enumerate(l): e['pct']=i/len(l)
OVERLAP=1.35
for e in rows: e['ekey']=BASE[e['cefr']]+OVERLAP*e['pct']
# frequency-lowering bonus for core-school lists (EJDict 850/2000 basic lists)
def readlist(n):
    p=os.path.join(SRC,f"ejdict-frequency/{n}.txt")
    return {l.strip() for l in open(p,encoding='utf-8')} if os.path.exists(p) else set()
L850,L2000=readlist(850),readlist(2000)
for e in rows:
    w=e['word'].lower()
    if w in L850: e['ekey']-=0.25
    elif w in L2000: e['ekey']-=0.10
CONCRETE={"noun.food","noun.animal","noun.body","noun.plant","noun.artifact","noun.person","noun.object","noun.time","noun.location","noun.natural_object"}
def concrete(e):
    if e['pos']!='noun': return False
    ss=[x for x in wn.synsets(e['word'].lower(),pos='n') if not x.instance_hypernyms()][:1]
    return bool(ss) and ss[0].lexname() in CONCRETE
for e in rows:
    if e['cefr'] in ('A1','A2') and concrete(e): e['ekey']-=0.35 if e['cefr']=='A1' else 0.25
lev_over={ (w.lower(),p):(eik,toe) for w,p,eik,toe in tsv("levels.tsv",4)}
rows.sort(key=lambda e:(e['ekey'],e['freqrank'],e['word']))
for i,e in enumerate(rows):
    g=0
    while g<6 and i>=CUM[g]: g+=1
    e['eiken']=EIKEN[g]
# ---- TOEIC
def tscore(e):
    w=e['word'].lower(); r=e['freqrank']
    s=math.log(r)
    if w in tsl: s-=0.6+0.6*(1-min(tsl[w] or 1300,1300)/1300)
    if w in bsl: s-=0.5+0.4*(1-min(bsl[w] or 1200,1200)/1200)
    if w in nawl and w not in tsl and w not in bsl: s+=0.35
    return s
for e in rows: e['ts']=tscore(e)
TCUM=[(400,1500),(500,2500),(600,3500),(730,5000),(860,6800),(990,8800)]
order=sorted(rows,key=lambda e:(e['ts'],e['freqrank']))
for i,e in enumerate(order):
    b=None
    for band,c in TCUM:
        if i<c: b=band; break
    e['toeic']=b
EKEYCAP={'5':400,'4':500,'3':600}
for e in rows:
    w=e['word'].lower()
    cap=EKEYCAP.get(e['eiken'])
    if cap and (e['toeic'] is None or e['toeic']>cap): e['toeic']=cap
    if e['eiken'] in('pre2','2') and e['toeic'] is None: e['toeic']=990 if e['eiken']=='2' else 860
# ---- gloss + domains
manual={ (w.lower(),p):ja for w,p,ja in tsv("gloss.tsv",3)}
manual_any={}
for (w_,p_),ja_ in manual.items(): manual_any.setdefault(w_,ja_)
import glob as _g
_AB={'n':'noun','v':'verb','aj':'adjective','av':'adverb','pr':'preposition','cj':'conjunction','dt':'determiner','pn':'pronoun','ax':'auxiliary','pt':'particle','nm':'numeral','it':'interjection'}
for fn_ in sorted(_g.glob(os.path.join(OV,"gloss_*.txt"))):
    for l_ in open(fn_,encoding="utf-8"):
        l_=l_.rstrip("\n")
        if not l_ or l_.startswith("#") or l_.count("|")<2: continue
        w_,p_,ja_=l_.split("|",2)
        manual[(w_.lower(),_AB.get(p_,p_))]=ja_
dom_over={ (w.lower(),p):[d for d in ds.split(',')] for w,p,ds in tsv("domains.tsv",3)}
final=[]; missing=[]; mismatch=[]
def fallback_gloss(w,pos):
    # derived forms from base entries
    for suf,rep,kind in (("ly","","adv"),("ily","y","adv"),("ness","","n"),("ment","","n")):
        if w.endswith(suf) and len(w)>len(suf)+2:
            b=w[:-len(suf)]+rep
            for bb in (b,b+"e"):
                e=ej_entry(bb)
                if e:
                    pp={'adv':'adjective','n':'adjective'}[kind]
                    if kind=='n': pp='noun'
                    g=make_gloss(e,pp)
                    if g and kind=='adv': return g.split('；')[0]+"に" if not g.split('；')[0].endswith(("に","く")) else g.split('；')[0]
                    if g and kind=='n': return g.split('；')[0]
    return None
for e in rows:
    w=e['word']; pos=e['pos']; k=(w.lower(),pos)
    g=manual.get(k) or manual.get((w.lower(),'*'))
    if not g and w.lower() in manual_any and pos in('noun','verb','adjective','adverb') and e['src']<= {'cefrj','octanove'}: g=manual_any[w.lower()]
    if not g:
        ent=ej_entry(w,e['variants'])
        g=make_gloss(ent,pos) if ent else None
        if g and not LAST_MATCH[0] and pos in ('noun','verb','adjective','adverb'): mismatch.append((w,pos,g)); e['mismatch']=True
        if not g: g=fallback_gloss(w.lower(),pos)
    if not g or re.search(r"[A-Za-z]{4,}",g):
        missing.append((w,pos,g)); 
        if not g: continue
    ent=ej_entry(w,e['variants'])
    ds=dom_over.get(k) or D.infer(w,pos,ent,w.lower() in tsl,w.lower() in bsl)
    eik,toe=e['eiken'],e['toeic']
    if k in lev_over:
        eik=lev_over[k][0]; toe=None if lev_over[k][1] in('null','') else int(lev_over[k][1])
    final.append({"word":w,"pos":pos,"eiken":eik,"toeic":toe,"cefr":e['cefr'],"ja":g,"domains":ds,"freq":e['freqrank']})
for x_ in final: pass
with open(os.path.join(OUT,"build","mismatch.tsv"),"w",encoding="utf-8") as f:
    for w,p,g in mismatch: f.write(f"{w}\t{p}\t{g}\n")
final.sort(key=lambda x:(EIKEN.index(x['eiken']),x['freq'],x['word']))
json.dump(final,open(os.path.join(OUT,"vocab.json"),"w",encoding="utf-8"),ensure_ascii=False,indent=0)
with open(os.path.join(OUT,"build","missing_gloss.txt"),"w",encoding="utf-8") as f:
    for w,p,g in missing: f.write(f"{w}\t{p}\t{g or ''}\n")
print("entries",len(final),"missing/flagged",len(missing),file=sys.stderr)
c=collections.Counter(x['eiken'] for x in final); print({k:c[k] for k in EIKEN},file=sys.stderr)
c=collections.Counter(x['toeic'] for x in final); print(dict(c),file=sys.stderr)
