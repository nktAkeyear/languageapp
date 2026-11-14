import sys,json,glob; sys.path.insert(0,'.')
from cand import read_lists
l=read_lists(); v=json.load(open('../vocab.json',encoding='utf-8'))
AB={'n':'noun','v':'verb','aj':'adjective','av':'adverb','pr':'preposition','cj':'conjunction','dt':'determiner','pn':'pronoun','ax':'auxiliary','pt':'particle','nm':'numeral','it':'interjection'}
man=set()
for fn in glob.glob('../overrides/gloss_*.txt'):
    for q in open(fn,encoding='utf-8'):
        if q.count('|')>=2: w,p,_=q.split('|',2); man.add((w.lower(),AB.get(p,p)))
name,lo,hi=sys.argv[1],int(sys.argv[2]),int(sys.argv[3])
ab={'noun':'n','verb':'v','adjective':'aj','adverb':'av','preposition':'pr','conjunction':'cj','determiner':'dt','pronoun':'pn','auxiliary':'ax','particle':'pt','numeral':'nm','interjection':'it'}
rk=l[name]
x=[w for w in v if w['word'].lower() in rk and lo<=(rk[w['word'].lower()] or 9999)<hi and (w['word'].lower(),w['pos']) not in man]
x.sort(key=lambda w:rk[w['word'].lower()] or 9999)
print(len(x)); print(' | '.join(f"{w['word']}.{ab[w['pos']]} {w['ja']}" for w in x))
