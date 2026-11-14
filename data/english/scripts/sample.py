import json,random,sys,math
v=json.load(open('../vocab.json',encoding='utf-8'))
ab={'noun':'n','verb':'v','adjective':'aj','adverb':'av','preposition':'pr','conjunction':'cj','determiner':'dt','pronoun':'pn','auxiliary':'ax','particle':'pt','numeral':'nm','interjection':'it'}
random.seed(int(sys.argv[1]))
out={}
for g in sys.argv[2].split(','):
    x=[w for w in v if w['eiken']==g]
    k=math.ceil(0.03*len(x)); out[g]=random.sample(x,k)
i=0
for g,l in out.items():
    print('==',g,len(l))
    for w in l:
        i+=1; print(f"{i}. {w['word']}.{ab[w['pos']]} {w['ja']} {','.join(w['domains'])}")
