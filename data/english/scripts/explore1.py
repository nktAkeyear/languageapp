import sys; sys.path.insert(0,'.')
from cand import *
import warnings
freq=read_freq(); n31=read_ngsl31k()
# lemma frequency by summing inflected forms
lf=collections.defaultdict(float)
for w,(r,z) in freq.items():
    if not re.fullmatch(r"[a-z]+",w): continue
    f=10**z
    lemmas=set()
    for p in 'nvar':
        m=wn.morphy(w,p)
        if m: lemmas.add(m)
    if not lemmas: lemmas={w}
    # attribute to the lemma that is most frequent itself among candidates
    best=max(lemmas,key=lambda x:freq.get(x,(10**9,0))[1] if x!=w else freq.get(x,(10**9,0))[1])
    lf[best]+=f
rank={w:i for i,(w,_) in enumerate(sorted(lf.items(),key=lambda x:-x[1]),1)}
print(len(rank)); print([w for w,i in list(rank.items())[:40]])
c=read_cefrj()
sw={x[0].lower() for x in c}
print('cefrj single',len({w for w in sw if re.fullmatch(r"[a-z]+",w)}))
miss=[w for w in rank if rank[w]<=12000 and w not in sw]
print(len(miss)); print(miss[:200])
