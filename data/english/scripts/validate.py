#!/usr/bin/env python3
"""Validate phrases.json and grammar.json; print counts. Exit 1 on errors."""
import json, os, re, sys
from collections import Counter, defaultdict

OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EIKEN = ["5", "4", "3", "pre2", "2", "pre1", "1"]
TOEIC = [400, 500, 600, 730, 860, 990]
TYPES = ["formula", "phrasal_verb", "idiom", "collocation", "pattern", "discourse", "business"]
FUNCTIONS = set("""greeting farewell introduction request permission offer suggestion apology thanks opinion
agreement disagreement complaint instruction scheduling ordering payment directions description comparison
cause/effect condition concession hedging negotiation reporting inquiry invitation congratulation sympathy
warning confirmation clarification sequencing contrast addition emphasis summarizing exemplifying ability
preference obligation prediction narration announcement refusal praise regret emotion""".split())
DOMAINS = set("""food cooking health body family school shopping money travel transport hotel nature weather
farming sea crafts clothing housing post office meetings sales finance hr logistics law technology science
media arts emotion society abstract""".split())
TARGET = {"5": 150, "4": 300, "3": 500, "pre2": 900, "2": 1400, "pre1": 2000, "1": 2600}

errors, warnings = [], []


def err(m):
    errors.append(m)


def norm(t):
    return " ".join(re.sub(r"[^a-z0-9 ]", " ", t.lower().replace("...", " ").replace("'", "")).split())


def check_list(item, key, allowed, idx):
    v = item.get(key)
    if not isinstance(v, list) or not v:
        err(f"{idx}: {key} must be a non-empty list")
        return
    for x in v:
        if x not in allowed:
            err(f"{idx}: unknown {key[:-1]} '{x}'")


def main():
    ph = json.load(open(os.path.join(OUT, "phrases.json"), encoding="utf-8"))
    ids, norms = set(), defaultdict(list)
    req = ["id", "text", "type", "eiken", "toeic", "ja", "example", "exampleJa", "functions", "domains"]
    for it in ph:
        i = it.get("id", "?")
        for k in req:
            if k not in it:
                err(f"{i}: missing {k}")
        extra = set(it) - set(req) - {"notes"}
        if extra:
            err(f"{i}: unexpected keys {extra}")
        if i in ids:
            err(f"{i}: duplicate id")
        ids.add(i)
        if it.get("type") not in TYPES:
            err(f"{i}: bad type {it.get('type')}")
        if it.get("eiken") not in EIKEN:
            err(f"{i}: bad eiken {it.get('eiken')}")
        if it.get("toeic") is not None and it.get("toeic") not in TOEIC:
            err(f"{i}: bad toeic {it.get('toeic')}")
        for k in ("text", "ja", "example", "exampleJa"):
            if not str(it.get(k, "")).strip():
                err(f"{i}: empty {k}")
        if not re.search(r"[ぁ-んァ-ン一-龥]", it.get("ja", "")):
            err(f"{i}: ja has no Japanese characters")
        check_list(it, "functions", FUNCTIONS, i)
        check_list(it, "domains", DOMAINS, i)
        norms[norm(it.get("text", ""))].append(i)
    for n, l in norms.items():
        if len(l) > 1:
            err(f"duplicate text (normalized '{n}'): {l}")
    print(f"phrases: {len(ph)} items")

    # tables
    ce = Counter(it["eiken"] for it in ph)
    print("\nPhrases by 英検 grade (new / cumulative / target cumulative)")
    cum = 0
    for g in EIKEN:
        cum += ce[g]
        print(f"  {g:>5}: {ce[g]:4d} / {cum:5d} / {TARGET[g]}")
    print("\nPhrases by 英検 grade x type")
    print("  " + "grade".ljust(6) + "".join(t[:9].rjust(11) for t in TYPES) + "   total")
    for g in EIKEN:
        row = "".join(str(sum(1 for it in ph if it["eiken"] == g and it["type"] == t)).rjust(11) for t in TYPES)
        print("  " + g.ljust(6) + row + str(ce[g]).rjust(8))
    print("\nPhrases by TOEIC band x type")
    print("  " + "band".ljust(6) + "".join(t[:9].rjust(11) for t in TYPES) + "   total")
    for b in TOEIC + [None]:
        sel = [it for it in ph if it["toeic"] == b]
        row = "".join(str(sum(1 for it in sel if it["type"] == t)).rjust(11) for t in TYPES)
        print("  " + str(b if b else "none").ljust(6) + row + str(len(sel)).rjust(8))
    nb = sum(1 for it in ph if it["type"] == "business")
    print(f"\nbusiness items: {nb} (target >= 250)")

    gp = os.path.join(OUT, "grammar.json")
    if os.path.exists(gp):
        gr = json.load(open(gp, encoding="utf-8"))
        gids, gnames = set(), set()
        for it in gr:
            i = it.get("id", "?")
            for k in ["id", "name", "nameJa", "eiken", "toeic", "explainJa", "patterns", "examples"]:
                if k not in it:
                    err(f"{i}: missing {k}")
            extra = set(it) - {"id", "name", "nameJa", "eiken", "toeic", "explainJa", "patterns", "examples",
                               "contrastWith", "commonErrors"}
            if extra:
                err(f"{i}: unexpected keys {extra}")
            if i in gids:
                err(f"{i}: duplicate id")
            gids.add(i)
            if it.get("name", "").lower() in gnames:
                err(f"{i}: duplicate name {it.get('name')}")
            gnames.add(it.get("name", "").lower())
            if it.get("eiken") not in EIKEN:
                err(f"{i}: bad eiken")
            if it.get("toeic") is not None and it.get("toeic") not in TOEIC:
                err(f"{i}: bad toeic")
            if not it.get("patterns"):
                err(f"{i}: no patterns")
            if not it.get("examples"):
                err(f"{i}: no examples")
            for e in it.get("examples", []):
                if not e.get("en") or not e.get("ja"):
                    err(f"{i}: bad example {e}")
            if not re.search(r"[ぁ-んァ-ン一-龥]", it.get("explainJa", "")):
                err(f"{i}: explainJa lacks Japanese")
        print(f"\ngrammar: {len(gr)} points")
        cg = Counter(it["eiken"] for it in gr)
        print("  by 英検: " + ", ".join(f"{g}={cg[g]}" for g in EIKEN))
        ct = Counter(it["toeic"] for it in gr)
        print("  by TOEIC: " + ", ".join(f"{b}={ct[b]}" for b in TOEIC) + f", none={ct[None]}")

    print()
    if errors:
        print(f"ERRORS ({len(errors)}):")
        for e in errors[:80]:
            print("  " + e)
        sys.exit(1)
    print("OK: no schema errors, no duplicate ids/texts.")


if __name__ == "__main__":
    main()
