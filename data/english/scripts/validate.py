#!/usr/bin/env python3
"""Validate data/english/vocab.json.  Pure stdlib:  python3 -I validate.py [path/to/vocab.json]
Exit code 0 = all checks passed (warnings allowed), 1 = failure."""
import json, sys, os, re, collections
HERE=os.path.dirname(os.path.abspath(__file__))
path=sys.argv[1] if len(sys.argv)>1 else os.path.join(HERE,"..","vocab.json")
v=json.load(open(path,encoding="utf-8"))
dom=json.load(open(os.path.join(HERE,"..","domains.json"),encoding="utf-8"))
DOMS={d["id"] for d in dom}
EIKEN=["5","4","3","pre2","2","pre1","1"]; TOEIC=[400,500,600,730,860,990,None]
POS={"noun","verb","adjective","adverb","pronoun","preposition","conjunction","determiner","numeral","auxiliary","interjection","particle"}
CEFR={"A1","A2","B1","B2","C1","C2"}
errs=[]; warns=[]
def E(m): errs.append(m)
def W(m): warns.append(m)
KEYS={"word","pos","eiken","toeic","cefr","ja","domains","freq"}
seen=set()
for i,x in enumerate(v):
    ctx=f"#{i} {x.get('word')}/{x.get('pos')}"
    if set(x)!=KEYS: E(f"{ctx}: keys {sorted(set(x)^KEYS)}"); continue
    if not isinstance(x["word"],str) or not re.fullmatch(r"[A-Za-z][A-Za-z'\-]*",x["word"]): E(f"{ctx}: bad word")
    if x["word"]!=x["word"].lower() and not re.fullmatch(r"[A-Z][a-z]+",x["word"]) and x["word"] not in ("I","T-shirt","X-ray","pH"): E(f"{ctx}: odd capitalisation")
    if x["pos"] not in POS: E(f"{ctx}: pos {x['pos']}")
    if x["eiken"] not in EIKEN: E(f"{ctx}: eiken {x['eiken']}")
    if x["toeic"] not in TOEIC: E(f"{ctx}: toeic {x['toeic']}")
    if x["cefr"] not in CEFR: E(f"{ctx}: cefr")
    if not isinstance(x["ja"],str) or not x["ja"].strip(): E(f"{ctx}: empty ja")
    elif len(x["ja"])>40: W(f"{ctx}: long ja ({len(x['ja'])})")
    elif re.search(r"[A-Za-z]{4,}",x["ja"]) and not re.search(r"（.*[A-Za-z].*）",x["ja"]): W(f"{ctx}: latin in ja: {x['ja']}")
    if x["ja"] and re.search(r"[『』〈〉《》]|\s{2,}|^[；,、]|[；,、]$",x["ja"]): E(f"{ctx}: stray marker in ja: {x['ja']}")
    if not isinstance(x["domains"],list) or not (1<=len(x["domains"])<=3) or any(d not in DOMS for d in x["domains"]) or len(set(x["domains"]))!=len(x["domains"]): E(f"{ctx}: domains {x['domains']}")
    if not isinstance(x["freq"],int) or x["freq"]<1: E(f"{ctx}: freq")
    k=(x["word"],x["pos"])
    if k in seen: E(f"{ctx}: duplicate word+pos")
    seen.add(k)
print(f"entries: {len(v)}  errors so far: {len(errs)}")
# counts
ec=collections.Counter(x["eiken"] for x in v); tc=collections.Counter(x["toeic"] for x in v)
RANGE={"5":(500,700),"4":(600,800),"3":(700,900),"pre2":(1200,1800),"2":(1200,1800),"pre1":(1800,2800),"1":(2500,6000)}
for g,(lo,hi) in RANGE.items():
    if not lo<=ec[g]<=hi: E(f"eiken {g}: count {ec[g]} outside [{lo},{hi}]")
TR={400:(1200,2000),500:(900,1700),600:(900,1700),730:(900,1700),860:(1300,2400),990:(1300,2600),None:(1000,3500)}
for b,(lo,hi) in TR.items():
    if not lo<=tc[b]<=hi: E(f"toeic {b}: count {tc[b]} outside [{lo},{hi}]")
if len(v)<10000: E(f"total {len(v)} < 10000")
# cumulative eiken
cum=0; print("cumulative 英検:",end=" ")
for g in EIKEN: cum+=ec[g]; print(f"{g}={cum}",end=" ")
print()
# per-word minimum grade (a word's lowest grade across its entries)
order={g:i for i,g in enumerate(EIKEN)}
minE={}; minT={}
for x in v:
    w=x["word"].lower()
    if w not in minE or order[x["eiken"]]<order[minE[w]]: minE[w]=x["eiken"]
    t=x["toeic"] if x["toeic"] is not None else 10**6
    if w not in minT or t<minT[w]: minT[w]=t
# sanity: most frequent words
byfreq=sorted({x["word"].lower():x["freq"] for x in v}.items(),key=lambda kv:kv[1])
top300=[w for w,_ in byfreq[:300]]
ok=sum(1 for w in top300 if minE[w] in("5","4") )
ok3=sum(1 for w in top300 if minE[w] in("5","4","3"))
okt=sum(1 for w in top300 if minT[w]==400)
print(f"top-300 by frequency (per word, lowest-grade entry): 英検5/4 {ok}/300, 5/4/3 {ok3}/300, TOEIC400 {okt}/300")
if ok3<285: E(f"sanity: only {ok3}/300 of the most frequent words are at 英検5-3")
if ok<240: E(f"sanity: only {ok}/300 at 英検5-4")
if okt<285: E(f"sanity: only {okt}/300 at TOEIC 400")
bad=[w for w in top300 if minE[w] not in("5","4")][:30]
print("  top-300 words not at 5/4:",bad)
# monotonic: median freq rank rises with grade
med={}
for g in EIKEN:
    f=sorted(x["freq"] for x in v if x["eiken"]==g); med[g]=f[len(f)//2]
print("median freq rank per 英検 grade:",med)
seq=[med[g] for g in EIKEN]
if any(b<a for a,b in zip(seq,seq[1:])): E("median frequency rank not monotonic across 英検 grades")
medt={}
for b in TOEIC[:-1]:
    f=sorted(x["freq"] for x in v if x["toeic"]==b); medt[b]=f[len(f)//2]
print("median freq rank per TOEIC band:",medt)
# every domain used
used=collections.Counter(d for x in v for d in x["domains"])
for d in DOMS:
    if used[d]<20: W(f"domain {d} only {used[d]} entries")
# CEFR vs grade sanity
ct=collections.Counter((x["cefr"],x["eiken"]) for x in v)
if any(ct[("C1",g)]+ct[("C2",g)] for g in ("5","4","3")): E("C1/C2 entry assigned to 英検 5-3")
print(f"warnings: {len(warns)}"); [print("  W",m) for m in warns[:25]]
print(f"errors: {len(errs)}"); [print("  E",m) for m in errs[:60]]
sys.exit(1 if errs else 0)
