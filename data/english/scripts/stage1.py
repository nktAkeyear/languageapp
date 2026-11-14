import sys; sys.path.insert(0,'.')
from cand import *
from lemminflect import getAllLemmas
import statistics
freq=read_freq()
# lemma freq with improved attribution
lf=collections.defaultdict(float)
def lemma_of(w):
    others=set()
    for pos,ls in getAllLemmas(w).items():
        for l in ls:
            if l!=w and l in freq and freq[l][1]>=freq[w][1]-3.0: others.add(l)
    return others
for w,(r,z) in freq.items():
    if not re.fullmatch(r"[a-z]+",w): continue
    o=lemma_of(w)
    tgt=max(o,key=lambda x:freq[x][1]) if o else w
    lf[tgt]+=10**z
ordered=sorted(lf.items(),key=lambda x:-x[1]); rank={w:i for i,(w,_) in enumerate(ordered,1)}
cj=read_cefrj()
by=collections.defaultdict(list)
for w,p,c,s in cj:
    if re.fullmatch(r"[a-z]+",w) and w in rank: by[c].append(rank[w])
for c in sorted(by): 
    v=sorted(by[c]); n=len(v); print(c,n,'p10',v[n//10],'p25',v[n//4],'med',v[n//2],'p75',v[3*n//4],'p90',v[9*n//10])
import pickle; pickle.dump((dict(lf),rank),open('/tmp/claude-0/lf.pkl','wb'))
