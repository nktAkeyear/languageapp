#!/usr/bin/env python3
"""Generate PHRASES.md (Japanese summary) from phrases.json and grammar.json."""
import json, os
from collections import Counter, defaultdict

OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ph = json.load(open(os.path.join(OUT, "phrases.json"), encoding="utf-8"))
gr = json.load(open(os.path.join(OUT, "grammar.json"), encoding="utf-8"))
EIKEN = ["5", "4", "3", "pre2", "2", "pre1", "1"]
EN = {"5": "5級", "4": "4級", "3": "3級", "pre2": "準2級", "2": "2級", "pre1": "準1級", "1": "1級"}
LV = {"5": "中学1年", "4": "中学2年", "3": "中学3年", "pre2": "高校中級", "2": "高校卒業", "pre1": "大学中級", "1": "大学上級"}
TOEIC = [400, 500, 600, 730, 860, 990]
TB = {400: "〜400", 500: "〜500", 600: "〜600", 730: "〜730", 860: "〜860", 990: "〜990"}
TYPES = ["formula", "phrasal_verb", "idiom", "collocation", "pattern", "discourse", "business"]
TJ = {"formula": "定型表現", "phrasal_verb": "句動詞", "idiom": "イディオム", "collocation": "コロケーション",
      "pattern": "文型パターン", "discourse": "談話標識", "business": "ビジネス"}
TOEIC_SCOPE = {
    400: "Part 1-2 の基本的な写真描写・短い応答、簡単な掲示・案内(日常場面)",
    500: "Part 3-4 の短い会話・アナウンス、Part 5 の基本文法、簡単なメール・お知らせ",
    600: "Part 3-4 の日常的な職場・店・旅行場面、Part 5/6 の品詞・時制、Part 7 の短い文書",
    730: "Part 5/6 の接続詞・前置詞・関係詞の判別、Part 7 の複数文書、会議・出張・注文・苦情対応",
    860: "Part 7 の長文・複数文書、契約・財務・人事・物流などの専門的ビジネス語彙、イディオム的な会話",
    990: "ほぼ満点水準。法務・財務の文語的定型表現、慣用句・含意を含む会話、高度な論理展開",
}


def pick(items, n=25):
    by = defaultdict(list)
    for it in items:
        by[it["type"]].append(it)
    total = len(items)
    if total <= n:
        return items
    quota = {t: max(1, round(n * len(v) / total)) for t, v in by.items()}
    while sum(quota.values()) > n:
        t = max(quota, key=lambda k: quota[k])
        quota[t] -= 1
    while sum(quota.values()) < n:
        t = max(by, key=lambda k: len(by[k]) / quota[k])
        quota[t] += 1
    res = []
    for t, v in by.items():
        k = min(quota[t], len(v))
        step = len(v) / k
        res += [v[int(i * step + step / 2)] for i in range(k)]
    return sorted(res, key=lambda it: TYPES.index(it["type"]))


def table(header, rows):
    s = "| " + " | ".join(header) + " |\n|" + "|".join(["---"] * len(header)) + "|\n"
    for r in rows:
        s += "| " + " | ".join(str(x) for x in r) + " |\n"
    return s + "\n"


L = []
w = L.append
w("# 英語の言い回し・文法リスト(英検 / TOEIC L&R レベル別)\n")
w("このファイルは `phrases.json` と `grammar.json` から `scripts/gen_md.py` で自動生成された要約です。")
w("元データの編集は `scripts/src/*.txt` で行い、`scripts/build.py` → `scripts/validate_phrases.py` → `scripts/gen_md.py` の順に実行してください。\n")
w("## 1. 目的と方法\n")
w("- 英検 5級〜1級、および TOEIC L&R のスコア帯(〜400 / 〜500 / 〜600 / 〜730 / 〜860 / 〜990)ごとに、学習者が使えるべき**言い回し(phrases)**と**文法項目(grammar)**を整理した。")
w("- 英検・TOEIC とも公式の語句リストは公表されていない。市販の単語帳・熟語帳は複写していない。**英検の級の説明、各級が対応する学校カリキュラム、TOEIC の Part 1〜7 の典型場面についての著者(AI)の知識から独自に編纂**した。")
w("- 各項目に **英検グレード**(その表現が最初に必要になる最低級)と **TOEIC 帯**(その表現が必要になる目安のスコア帯。日常会話中心で TOEIC では問われにくいものは `null` 可)を別々に付けた。")
w("- 例文は、町の店・宿・郵便局・診療所・事務所・港などで人が言いそうな自然な文を目指して書いた(ゲーム内会話の素材用)。\n")
w("### 英検グレードの目安\n")
w(table(["グレード", "目安の学習段階"], [[EN[g], LV[g]] for g in EIKEN]))
w("### TOEIC 帯が想定する場面\n")
w(table(["帯", "想定される出題・場面"], [[TB[b], TOEIC_SCOPE[b]] for b in TOEIC]))
w("## 2. 注意点(必ずお読みください)\n")
w("1. **レベルはすべて推定値**である。公式に定められたものではなく、同じ表現でも文脈・用法によって要求水準は変わる。特に 英検準1級/1級・TOEIC 860/990 の境界は主観が大きい。")
w("2. 英検と TOEIC は性質が異なる(英検=学校英語・技能別試験、TOEIC=ビジネス場面のリスニング・リーディング)。そのため **英検グレードと TOEIC 帯は機械的に対応させていない**。日常会話の表現(例: `Take care.`)は低い英検級で必要だが TOEIC 帯は低め、ビジネス定型(例: `effective immediately`)は英検では準2〜2級でも TOEIC では 730 以上、など。")
w("3. TOEIC 帯は、**項目ごとに個別に判断して**元データ(`scripts/src/*.txt`)に付けている。`build.py` による機械的な調整は行わない。基準は「TOEIC L&R の職場・店・旅行などの場面で、その表現がどの程度の頻度で出る・知っているべきか」であり、英検グレードとは独立している。文学的・学術的・口語的すぎて TOEIC ではまず問われないものは `null` とした。ただし判断は一人(AI)による主観的なもので、公式な根拠はない。")
w("4. 例文は AI が作成したもので、英語母語話者・日本語の専門家による校閲は受けていない。5級〜3級の例文は、語彙が基本語に収まるよう見直した(harbor・fisherman・ferry など場面色の強い語は、項目自体に必要な場合を除き置き換えた)が、機械的な語彙判定は参考値にとどまる。全体のうち約300項目を読み直して誤りを修正したが、残りは未校閲である。")
w("5. 目標件数(累積 150 / 300 / 500 / 900 / 1,400 / 2,000 / 2,600)は下表の「目標累積」と比較できる。級の見直し(下位級への移動)を行ったため、新規件数は級ごとの当初計画とは一致しない。\n")
w("## 3. 件数\n")
w("### 3.1 英検グレード別(新規 / 累積 / 目標累積)\n")
tgt = {"5": 150, "4": 300, "3": 500, "pre2": 900, "2": 1400, "pre1": 2000, "1": 2600}
ce = Counter(it["eiken"] for it in ph)
cum = 0
rows = []
for g in EIKEN:
    cum += ce[g]
    rows.append([EN[g], ce[g], cum, tgt[g]])
w(table(["グレード", "新規", "累積", "目標累積"], rows))
w("### 3.2 英検グレード × 種類\n")
rows = []
for g in EIKEN:
    rows.append([EN[g]] + [sum(1 for it in ph if it["eiken"] == g and it["type"] == t) for t in TYPES] + [ce[g]])
rows.append(["計"] + [sum(1 for it in ph if it["type"] == t) for t in TYPES] + [len(ph)])
w(table(["グレード"] + [TJ[t] for t in TYPES] + ["計"], rows))
w("### 3.3 TOEIC 帯 × 種類\n")
rows = []
for b in TOEIC:
    sel = [it for it in ph if it["toeic"] == b]
    rows.append([TB[b]] + [sum(1 for it in sel if it["type"] == t) for t in TYPES] + [len(sel)])
nn = [it for it in ph if it["toeic"] is None]
if nn:
    rows.append(["なし"] + [sum(1 for it in nn if it["type"] == t) for t in TYPES] + [len(nn)])
w(table(["帯"] + [TJ[t] for t in TYPES] + ["計"], rows))
w("### 3.4 英検グレード × TOEIC 帯\n")
rows = []
for g in EIKEN:
    rows.append([EN[g]] + [sum(1 for it in ph if it["eiken"] == g and it["toeic"] == b) for b in TOEIC])
w(table(["グレード"] + [TB[b] for b in TOEIC], rows))
w("### 3.5 文法項目数\n")
cg = Counter(it["eiken"] for it in gr)
ct = Counter(it["toeic"] for it in gr)
w(table(["グレード"] + [EN[g] for g in EIKEN] + ["計"], [["項目数"] + [cg[g] for g in EIKEN] + [len(gr)]]))
w(table(["TOEIC 帯"] + [TB[b] for b in TOEIC] + ["計"], [["項目数"] + [ct[b] for b in TOEIC] + [len(gr)]]))
w("## 4. 文法項目の進行表\n")
w("### 4.1 英検グレード別\n")
for g in EIKEN:
    sel = [it for it in gr if it["eiken"] == g]
    w(f"**{EN[g]}({LV[g]}・{len(sel)}項目)**: " + "、".join(f"{it['nameJa']}" for it in sel) + "\n")
w("### 4.2 TOEIC 帯別\n")
for b in TOEIC:
    sel = [it for it in gr if it["toeic"] == b]
    w(f"**{TB[b]}({len(sel)}項目)**: " + "、".join(f"{it['nameJa']}" for it in sel) + "\n")
w("TOEIC Part 5/6 向けの項目(品詞の選択、前置詞と接続詞、時制、代名詞の格、数量表現など)は、名前が `TOEIC Part 5:` / `TOEIC Part 6:` で始まる項目として収録している。1つの項目には1つの規則だけを入れ、複数の規則をまとめていたものは分割した。\n")
w("## 5. 代表的な表現(各25前後)\n")
w("グレード・帯ごとに、種類の割合に応じて均等間隔で機械的に選んだもの(人手のベスト選抜ではない)。\n")
w("### 5.1 英検グレード別\n")
for g in EIKEN:
    sel = pick([it for it in ph if it["eiken"] == g])
    w(f"#### {EN[g]}({LV[g]})\n")
    w(table(["表現", "意味", "種類"], [[f"`{it['text']}`", it["ja"], TJ[it["type"]]] for it in sel]))
w("### 5.2 TOEIC 帯別\n")
for b in TOEIC:
    sel = pick([it for it in ph if it["toeic"] == b])
    w(f"#### {TB[b]}\n")
    w(table(["表現", "意味", "種類"], [[f"`{it['text']}`", it["ja"], TJ[it["type"]]] for it in sel]))
w("## 6. 機能(functions)とドメイン(domains)\n")
fc = Counter(f for it in ph for f in it["functions"])
dc = Counter(d for it in ph for d in it["domains"])
w("機能タグ: " + "、".join(f"{k}({v})" for k, v in fc.most_common()) + "\n")
w("ドメインタグ: " + "、".join(f"{k}({v})" for k, v in dc.most_common()) + "\n")
open(os.path.join(OUT, "PHRASES.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")
print("PHRASES.md written", len("\n".join(L)))
