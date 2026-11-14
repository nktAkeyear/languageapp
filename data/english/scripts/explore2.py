import sys; sys.path.insert(0,'.')
from cand import *
freq=read_freq(); lf=build_lemma_freq(freq)
rank={w:i for i,(w,_) in enumerate(sorted(lf.items(),key=lambda x:-x[1]),1)}
ej=read_ejdict(); print('ejdict',len(ej))
c=read_cefrj()
single=[x for x in c if re.fullmatch(r"[A-Za-z]+",x[0])]
print(len(single),'single;', sum(1 for x in single if x[0].lower() in ej or x[0] in ej),'in ejdict')
print([x[0] for x in single if x[0].lower() not in ej][:80])
miss=[w for w,r in rank.items() if r<=14000 and w not in {x[0].lower() for x in c} and re.fullmatch('[a-z]{2,}',w) and not is_proper_only(w) and w in ej]
print(len(miss)); print(miss[:300])
import pickle; pickle.dump((lf,rank),open('/tmp/claude-0/lf.pkl','wb'))
