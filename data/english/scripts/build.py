#!/usr/bin/env python3
"""Build phrases.json and grammar.json from the pipe-separated sources in scripts/src/.

Phrase line:  eiken|toeic|type|text|ja|example|exampleJa|functions(,)|domains(,)[|notes]
Grammar line: eiken|toeic|name|nameJa|explainJa|patterns(;;)|en=>ja(;;)|contrastWith(;;)|commonErrors(;;)
Lines starting with # or blank are ignored. toeic '-' means null.
"""
import json, os, sys, glob, re

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "src")
OUT = os.path.dirname(HERE)
ORDER = ["5", "4", "3", "pre2", "2", "pre1", "1"]


def split_list(s, sep):
    return [x.strip() for x in s.split(sep) if x.strip()] if s else []


def build_phrases():
    items = []
    for f in sorted(glob.glob(os.path.join(SRC, "p*.txt"))):
        for n, line in enumerate(open(f, encoding="utf-8"), 1):
            line = line.rstrip("\n")
            if not line.strip() or line.startswith("#"):
                continue
            p = line.split("|")
            if len(p) < 9:
                sys.exit(f"{f}:{n}: expected >=9 fields, got {len(p)}: {line[:60]}")
            eiken, toeic, typ, text, ja, ex, exja, funcs, doms = [x.strip() for x in p[:9]]
            d = {
                "text": text, "type": typ, "eiken": eiken,
                "toeic": None if toeic == "-" else int(toeic),
                "ja": ja, "example": ex, "exampleJa": exja,
                "functions": split_list(funcs, ","), "domains": split_list(doms, ","),
            }
            if len(p) > 9 and p[9].strip():
                d["notes"] = p[9].strip()
            items.append(d)
    # TOEIC-band spreading rule (documented in PHRASES.md): the source files give a first-pass band;
    # lexical/idiomatic items of a grade are tested a band lower than the grade's business/formula items.
    for d in items:
        if d["eiken"] == "3" and d["toeic"] == 400 and d["type"] in ("phrasal_verb", "idiom", "discourse", "pattern"):
            d["toeic"] = 500
        if d["eiken"] == "2" and d["toeic"] == 730 and d["type"] in ("phrasal_verb", "idiom", "collocation", "discourse"):
            d["toeic"] = 600
    items.sort(key=lambda d: ORDER.index(d["eiken"]))  # stable: keeps file order within grade
    counters = {}
    out = []
    for d in items:
        counters[d["eiken"]] = counters.get(d["eiken"], 0) + 1
        out.append({"id": f"ph-{d['eiken']}-{counters[d['eiken']]:04d}", **d})
    return out


def build_grammar():
    items = []
    for f in sorted(glob.glob(os.path.join(SRC, "g*.txt"))):
        for n, line in enumerate(open(f, encoding="utf-8"), 1):
            line = line.rstrip("\n")
            if not line.strip() or line.startswith("#"):
                continue
            p = line.split("|")
            if len(p) < 7:
                sys.exit(f"{f}:{n}: expected >=7 fields, got {len(p)}: {line[:60]}")
            eiken, toeic, name, nameja, expl, pats, exs = [x.strip() for x in p[:7]]
            examples = []
            for e in split_list(exs, ";;"):
                if "=>" not in e:
                    sys.exit(f"{f}:{n}: example without =>: {e}")
                en, ja = e.split("=>", 1)
                examples.append({"en": en.strip(), "ja": ja.strip()})
            d = {"name": name, "nameJa": nameja, "eiken": eiken,
                 "toeic": None if toeic == "-" else int(toeic),
                 "explainJa": expl, "patterns": split_list(pats, ";;"), "examples": examples}
            if len(p) > 7 and p[7].strip():
                d["contrastWith"] = split_list(p[7], ";;")
            if len(p) > 8 and p[8].strip():
                d["commonErrors"] = split_list(p[8], ";;")
            items.append(d)
    items.sort(key=lambda d: ORDER.index(d["eiken"]))
    counters = {}
    out = []
    for d in items:
        counters[d["eiken"]] = counters.get(d["eiken"], 0) + 1
        out.append({"id": f"gr-{d['eiken']}-{counters[d['eiken']]:03d}", **d})
    return out


if __name__ == "__main__":
    ph = build_phrases()
    with open(os.path.join(OUT, "phrases.json"), "w", encoding="utf-8") as fh:
        json.dump(ph, fh, ensure_ascii=False, indent=1)
        fh.write("\n")
    print(f"phrases.json: {len(ph)} items")
    if glob.glob(os.path.join(SRC, "g*.txt")):
        gr = build_grammar()
        with open(os.path.join(OUT, "grammar.json"), "w", encoding="utf-8") as fh:
            json.dump(gr, fh, ensure_ascii=False, indent=1)
            fh.write("\n")
        print(f"grammar.json: {len(gr)} items")
