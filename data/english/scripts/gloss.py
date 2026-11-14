"""Automatic gloss extraction from EJDict (CC0).  Picks senses compatible with the POS,
keeps the emphasised (『』) key terms, strips notes, and shortens to a learner-style gloss."""
import re
BRK=re.compile(r"[\(（][^\)）]*[\)）]")
ANG=re.compile(r"《[^》]*》")
SQ=re.compile(r"\[[^\]]*\]|［[^］]*］")
VERB_END=tuple("るうくぐすつぬぶむ")
def _clean_noise(s):
    s=ANG.sub("",s); s=SQ.sub("",s)
    s=re.sub(r"\([A-Za-z][^)]*\)","",s)
    return s
def split_senses(entry):
    # follow "=other" redirects handled by caller
    return [x.strip() for x in entry.split(" / ") if x.strip()]
def sense_class(raw):
    s=raw.strip()
    # markers
    m=re.match(r"^((?:〈[^〉]*〉|《[^》]*》|\s)*)",s)
    marks=m.group(1)
    rest=s[len(marks):]
    if re.search(r"〈[CU]〉|〈[CU]\.?〉",marks) : return 'n'
    if re.search(r"《the ?~》|《a ?~》|《複数形で》|《集合的に》",marks): return 'n'
    r2=BRK.sub("",rest).strip()
    if r2.startswith("…") or re.match(r"^〈",marks and rest or rest) or marks.count("〈")>0:
        # transitive-like "…を" or object marker => verb;  "…の"/"…な" => adjective ; "…に" ambiguous
        if re.match(r"^…の|^…な|^…と同じ",r2): return 'a'
        return 'v'
    key=re.sub(r"[『』]","",r2)
    key=re.split(r"[,;、]",key)[0].strip()
    if not key: return '?'
    if key.endswith(("的な","な","い","の","である","だ")): return 'a'
    if key.endswith(("く","に","と")) and not key.endswith(("書く","行く","引く","開く","着く","動く","働く","置く","続く","聞く","歩く","磨く","解く","描く","咲く","沸く","巻く","焼く","吹く","拭く","泣く","届く","敷く","効く","突く","割く","抱く","導く")):
        if key.endswith(("く","に")): return 'r'
    if key.endswith(VERB_END) and re.search(r"[ぁ-ん]",key[-2:]) : return 'v'
    return 'n'
def _terms(sense):
    """Return list of key terms (strings) for a sense."""
    s=_clean_noise(sense)
    keys=[x for k in re.findall(r"『([^』]+)』",s) for x in re.split(r"[,、]|(?<![ァ-ヶー])・|・(?![ァ-ヶー])",k)]
    base=s
    base=re.sub(r"〈[^〉]*〉","",base)
    if keys:
        out=[]
        for k in keys:
            k=_clean_noise(k); k=BRK.sub("",k).strip(" ,;、")
            out.append(k)
        # also append unemphasised alternatives after the keys? keep only emphasised
        terms=out
    else:
        b=BRK.sub("",base)
        b=re.sub(r"[『』]","",b)
        b=re.split(r"[:：]",b)[0]
        terms=[t.strip() for t in re.split(r"[,;、]|(?<![ァ-ヶー])・|・(?![ァ-ヶー])",b) if t.strip()]
    res=[]
    for t in terms:
        t=re.sub(r"^…(?:[をがとへで]|に(?!も))\s*","",t)
        t=t.lstrip("…")
        t=re.sub(r"^{[^}]*}","",t)
        t=re.sub(r"^を(?=[ぁ-んァ-ヶ一-龥])","",t)
        t=t.strip("…・ ").strip()
        t=re.sub(r"^[をにがと](?=[^\s])","",t) if False else t
        if not t or re.search(r"[A-Za-z]{3,}",t): 
            t=re.sub(r"\(?[A-Za-z .'\-]+\)?","",t).strip()
        if t and len(t)<=18: res.append(t)
    return res
LAST_MATCH=[True]
VERBISH=re.compile(r"[ぁ-ん][るうくぐすつぬぶむ]$")
def good_term(t,pos):
    if t.startswith(("の過去","過去","形","動")) and len(t)<=8 and "分詞" in t or t.startswith("の過去"): return False
    if "." in t or "．" in t: return False
    if "=" in t or t.strip() in ("の","を","に","が","で","と") or len(t)<2 and not re.search(r"[一-龥]",t): return False
    if re.search(r"[)）(（《》〈〉『』]",t): return False
    if re.fullmatch(r"[A-Za-z .'\-]+",t): return False
    if pos=='noun' and VERBISH.search(t) and not t.endswith(("ある","いる")): return False
    return True
def make_gloss(entry, pos, maxlen=26, want=3, strict=True):
    LAST_MATCH[0]=True
    if entry is None: return None
    senses=split_senses(entry)
    want_cls={'noun':'n','verb':'v','adjective':'a','adverb':'r'}.get(pos)
    cls=[(sense_class(s),s) for s in senses]
    pick=[s for c,s in cls if c==want_cls] if want_cls else [s for c,s in cls]
    if not pick:
        # fall back: all senses (flagged as POS mismatch)
        LAST_MATCH[0]=not (want_cls in ('n','v') and any(c in ('n','v') for c,_ in cls))
        pick=senses
    out=[]
    for s in pick[:4]:
        ts=_terms(s)
        ts=[t for t in ts if (good_term(t,pos) if strict else True)]
        if not ts: continue
        # first sense can contribute 2 terms, others 1
        take=2 if not out else 1
        for t in ts[:take]:
            if t not in out and not any(t in o or o in t for o in out): out.append(t)
        if len(out)>=want: break
    g="；".join(out[:want])
    while len("；".join(out))>maxlen and len(out)>1: out.pop()
    g="；".join(out)
    if not g and strict: return make_gloss(entry,pos,maxlen,want,strict=False)
    return g or None
