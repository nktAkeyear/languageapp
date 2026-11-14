import json,sys,glob,os
v=json.load(open('../vocab.json',encoding='utf-8'))
ab={'noun':'n','verb':'v','adjective':'aj','adverb':'av','preposition':'pr','conjunction':'cj','determiner':'dt','pronoun':'pn','auxiliary':'ax','particle':'pt','numeral':'nm','interjection':'it'}
AB={'n':'noun','v':'verb','aj':'adjective','av':'adverb','pr':'preposition','cj':'conjunction','dt':'determiner','pn':'pronoun','ax':'auxiliary','pt':'particle','nm':'numeral','it':'interjection'}
man=set()
for fn in glob.glob('../overrides/gloss_*.txt'):
    for l in open(fn,encoding='utf-8'):
        if l.count('|')>=2: w,p,_=l.split('|',2); man.add((w.lower(),AB.get(p,p)))
g=sys.argv[1]; a=int(sys.argv[2]); b=int(sys.argv[3])
x=[w for w in v if w['eiken']==g and (w['word'].lower(),w['pos']) not in man]
print(len(x))
print(' | '.join(f"{w['word']}.{ab[w['pos']]} {w['ja']}" for w in x[a:b]))
