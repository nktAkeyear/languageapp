#!/usr/bin/env python3
"""Generate VOCAB.md (Japanese summary) and build/stats.json from vocab.json.  Pure stdlib."""
import json, os, glob, collections, math
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.join(HERE,"..")
v=json.load(open(os.path.join(ROOT,"vocab.json"),encoding="utf-8"))
dom=json.load(open(os.path.join(ROOT,"domains.json"),encoding="utf-8"))
DJ={d["id"]:d["ja"] for d in dom}
EIKEN=["5","4","3","pre2","2","pre1","1"]; EJ={"5":"5級","4":"4級","3":"3級","pre2":"準2級","2":"2級","pre1":"準1級","1":"1級"}
TOEIC=[400,500,600,730,860,990,None]; TJ={400:"〜400",500:"〜500",600:"〜600",730:"〜730",860:"〜860",990:"〜990",None:"対象外(null)"}
TARGET={"5":600,"4":1300,"3":2100,"pre2":3600,"2":5100,"pre1":7500,"1":None}
PJ={"noun":"名","verb":"動","adjective":"形","adverb":"副","preposition":"前","conjunction":"接","determiner":"限","pronoun":"代","auxiliary":"助","numeral":"数","interjection":"間","particle":"助"}
CEFRS=["A1","A2","B1","B2","C1","C2"]
# manual-gloss coverage
AB={'n':'noun','v':'verb','aj':'adjective','av':'adverb','pr':'preposition','cj':'conjunction','dt':'determiner','pn':'pronoun','ax':'auxiliary','pt':'particle','nm':'numeral','it':'interjection'}
man=set()
for fn in glob.glob(os.path.join(ROOT,"overrides","gloss_*.txt")):
    for l in open(fn,encoding="utf-8"):
        l=l.rstrip("\n")
        if l.count("|")>=2 and not l.startswith("#"):
            w,p,_=l.split("|",2); man.add((w.lower(),AB.get(p,p)))
for l in open(os.path.join(ROOT,"overrides","gloss.tsv"),encoding="utf-8"):
    if l.startswith("#") or "\t" not in l: continue
    w,p,_=l.rstrip("\n").split("\t",2); man.add((w.lower(),p))
def is_manual(x): return (x["word"].lower(),x["pos"]) in man or any((x["word"].lower(),p) in man for p in ()) 
manual_by=collections.Counter(x["eiken"] for x in v if is_manual(x))
n=len(v)
ec=collections.Counter(x["eiken"] for x in v); tc=collections.Counter(x["toeic"] for x in v)
cross=collections.Counter((x["eiken"],x["toeic"]) for x in v)
cefr_by=collections.Counter((x["eiken"],x["cefr"]) for x in v)
dom_e={g:collections.Counter() for g in EIKEN}; dom_t={b:collections.Counter() for b in TOEIC}
for x in v:
    for d in x["domains"]: dom_e[x["eiken"]][d]+=1; dom_t[x["toeic"]][d]+=1
def reps(lst,k=40):
    lst=sorted(lst,key=lambda x:(x["freq"],x["word"]))
    lst=[x for x in lst if len(x["ja"])<=22]
    if len(lst)<=k: return lst
    step=len(lst)/k
    return [lst[int(i*step+step/2)] for i in range(k)]
def fmt(x): return f"{x['word']}（{PJ.get(x['pos'],x['pos'])}）{x['ja']}"
def table(header,rows):
    out=["| "+" | ".join(header)+" |","|"+"|".join(["---"]*len(header))+"|"]
    for r in rows: out.append("| "+" | ".join(str(c) for c in r)+" |")
    return "\n".join(out)
L=[]
A=L.append
A("# 英語語彙データ（英検×TOEIC×分野）サマリー")
A("")
A(f"`vocab.json`（{n:,} 項目）の人間向け説明。**公式の語彙表は英検にもTOEICにも存在しないため、ここでの「級」「スコア帯」はすべて推定**。個人学習用ゲームの出題・難易度調整の目安としてのみ使うこと。")
A("")
A("## 1. ファイル")
A("- `vocab.json` : 本体。`{word,pos,eiken,toeic,cefr,ja,domains,freq}` の配列。`freq` は頻度順位（1=最頻。wordfreq由来の原形ベース、約4万語中）。")
A("- `domains.json` : 分野タグ35種の定義（日本語名・対象・想定ジョブ）。")
A("- `scripts/` : `build_vocab.py`（生成）, `validate.py`（検証）, `make_report.py`（本ファイル生成）ほか。`overrides/` : 手書きの訳語・ブロックリスト。`sources/` : 取得データ（`sources/README.md` にライセンス）。")
A("- 再生成: venv に `wordfreq nltk lemminflect` と WordNet を用意し `python scripts/build_freq.py sources/wordfreq-derived/en_top60k.tsv && python scripts/build_vocab.py && python3 -I scripts/validate.py && python3 scripts/make_report.py`。")
A("")
A("## 2. 方法")
A("### 2.1 データ源（実際に取得できたもの）")
A(table(["データ","用途","ライセンス"],[
 ["CEFR-J Vocabulary Profile 1.5（東京外国語大・投野研） + Octanove C1/C2","見出し語・品詞・CEFRレベルの骨格（約9,900行→重複除去・単語のみ）","CEFR-J: 出典明記で研究/商用可、Octanove: CC BY-SA 4.0"],
 ["NGSL 1.2 / NGSL 31k（Browne ら）","基本頻出語の補完、31k語の頻度順位","CC BY-SA 4.0"],
 ["TSL / BSL / NAWL（同上）","TOEIC頻出語(TSL)・ビジネス語(BSL)・学術語(NAWL)のフラグと順位","CC BY-SA 4.0（再配布リポジトリ経由、見出し語のみ使用）"],
 ["wordfreq（large英語リスト）","語彙全体の頻度（屈折形を原形に集約した「原形頻度順位」）","CC BY-SA 4.0"],
 ["EJDict-hand","日本語訳の下書き（約45,000項目）","CC0 / パブリックドメイン"],
 ["WordNet 3.0（ビルド時のみ）","品詞の補正、分野タグ推定（上位語・語彙ファイル）","WordNet License"],
]))
A("")
A("取得できなかった／使わなかったもの: newgeneralservicelist.com（プロキシで403）、Oxford 3000/5000（出版社の著作物なので不使用）、学習指導要領の語彙表（再利用可能な公開データが見つからず）、Google 10k／SUBTLEX単体（wordfreq内で代替）。市販単語帳の内容は一切使っていない。")
A("")
A("### 2.2 英検の割り当て規則")
A("1. 候補語: CEFR-J/Octanove の単語（品詞違いは別項目）＋ NGSL・TSL・BSL・NAWL、または頻度上位（原形順位8,500位以内かつNGSL31kで12,000位以内）の語のうち、EJDictに訳があり、WordNetに普通名詞等としてあるもの（固有名詞・卑語・屈折形・英国綴りの重複は除外）。")
A("2. CEFRレベル: CEFR-J/Octanove のラベルをそのまま採用。それ以外の語は原形頻度順位で推定（〜3,000位=B1、〜7,000位=B2、〜13,000位=C1、それ以降=C2）。")
A("3. 順序付け: `key = CEFR基準値(A1=0…C2=5) + 1.35 × (同一CEFR内の頻度パーセンタイル)`。係数1.35により隣接レベルが重なり合う（「A1–A2」のような級の曖昧さを再現）。A1/A2の具体名詞は −0.25〜−0.35、EJDict基本語リスト(850/2000語)は −0.10〜−0.25 の加点（学校で早く習う語を前に出す、学習指導要領の代理指標）。")
A("4. 累積目標で切る: 5級=600、4級=1,300、3級=2,100、準2級=3,600、2級=5,100、準1級=7,500語まで。残りを1級とする。結果としておおむね 5級≒A1、4級≒A1〜A2、3級≒A2、準2級≒A2〜B1、2級≒B1、準1級≒B2、1級≒B2後半〜C2（下表）。")
A("5. 品詞違いの別項目（例: `book` 名/動、`make` 名/動）は項目ごとに級を持つ。**「その単語の級」は同じ単語の項目のうち最も低い級**と読む。")
A("")
A("### 2.3 TOEIC の割り当て規則")
A("- 基礎スコア `s = ln(原形頻度順位)`。TSL収録語は `−(0.8〜1.5)`、BSL収録語は `−(0.8〜1.3)`（順位が高いほど大きく減点）、NAWL収録でTSL/BSLに無い語は `+0.35`（学術語は後ろへ）。")
A("- `s` の昇順で累積 1,500 / 2,500 / 3,500 / 5,000 / 6,800 / 8,800 語を 〜400 / 〜500 / 〜600 / 〜730 / 〜860 / 〜990 に配分。残りは `null`（文学・学術・非常に低頻度などTOEICにほぼ出ない語）。")
A("- 補正: 英検5/4/3級の語は TOEIC 400/500/600 を上限にする（基礎語は必ずスコア帯の下位）。TSL/BSL収録語は `null` にしない。準2・2級語も `null` にしない。")
A("- 以上はTSL/BSLの順位と頻度だけに基づく推定で、実際の出題頻度の検証はしていない。")
A("")
A("### 2.4 日本語訳（`ja`）")
A(f"- 下書き: EJDict-hand の語義から、品詞に合う語義だけを選び、強調訳語（『』）を優先して最大3語・約26字に短縮（`scripts/gloss.py`）。")
A(f"- 手書き: 5〜3級の大半、TOEIC頻出のTSL上位・BSL上位 約450語、EJDictに無い語・機能語・品詞が合わない語など、合計 {sum(manual_by.values()):,} 項目（全体の{100*sum(manual_by.values())/n:.0f}%）は、Claude が学習者向けに書いた訳（`overrides/gloss_*.txt`）。内訳（手書き項目数/その級の項目数）: 5級 {manual_by['5']}/{ec['5']}、4級 {manual_by['4']}/{ec['4']}、3級 {manual_by['3']}/{ec['3']}、準2級 {manual_by['pre2']}/{ec['pre2']}、2級 {manual_by['2']}/{ec['2']}、準1級 {manual_by['pre1']}/{ec['pre1']}、1級 {manual_by['1']}/{ec['1']}。")
A("- 残りは機械抽出のまま（準2級〜1級の大半）。EJDictは古い語義・文語的語義を含むため、それが混ざることがある。")
A("")
A("### 2.5 分野タグ（`domains`）")
A("- 35種の固定タグ（§5）。語ごとに最大3つ。(a) 自作のシード語リスト（`scripts/domain_seeds.py`、各タグ50〜130語）、(b) WordNetの上位語（例: `food.n.01` `disease.n.01`）、(c) 日本語訳中のキーワード、(d) TSL/BSL収録語はしきい値を下げて業務系タグを付与、の得点合計がしきい値を超えたものを採用。どれにも当たらない語は `abstract`（抽象・機能語）。")
A("")
A("## 3. 品質（実測）")
A("`scripts/validate.py` は全項目のスキーマ・重複・件数範囲・基本語の整合性を検査（結果は§3.3）。")
A("### 3.1 訳語のスポットチェック")
A("最終版に近い状態で、各級から3%（計336項目、乱数シード固定: `scripts/sample.py`）を目視。**明らかな誤訳・断片化・品詞違い 18件（5.4%）、軽微な不自然さを含めると約25件（7%）**。内訳: 5級〜3級 約1件/63、準2級 3件/45、2級 2〜3件/45、準1級 6件/72、1級 5件/111。見つかった誤りは個別に修正済みだが、同種の誤りは未修正部分（準1級・1級の機械抽出部分）にまだ残っている。誤りの典型は ①EJDictの古い/別の語義の選択（`summit`「何か」、`romance`「伝奇物語」） ②名詞語に動詞語義が混入 ③-ly副詞・-ness名詞の派生訳の不自然さ。")
A("### 3.2 分野タグのスポットチェック")
A("別に無作為120項目（シード4242、最終版）を目視。`abstract` 以外のタグが付いた約55項目のうち、明らかに不適切なタグを含むものが約15件（27%）、やや怪しいものが約5件。主タグ（先頭）が妥当なのは約85%。`abstract` のみの約65項目のうち、本来は分野を持てる語（`fried` `smoke` `boy` など）が約10件。誤りの典型は多義語（`card`→manufacturing、`raise`→meetings/hr、`liner`→clothing）とWordNetの広い上位語の副作用。`abstract` は全体の約54%で、「分野を持たない語」と「推定できなかった語」が混在している。5〜3級（約2,100項目）は第1語義だけで判定する厳しめの設定にしてある。評価者は1人（Claude）のみ。")
A("### 3.3 自動検証の結果")
A("`python3 -I scripts/validate.py` → エラー0、警告0（全項目のキー・語形・品詞/級/スコア帯/CEFR/分野の値域、(word,pos)重複なし、各級・各帯の件数が許容範囲、級ごとの頻度中央値が単調増加、頻度上位300語の整合性: 英検5〜3級に296語・TOEIC 400に300語）。")
A("")
A("## 4. 件数")
rows=[]; cum=0
for g in EIKEN:
    cum+=ec[g]; rows.append([EJ[g],f"{TARGET[g]:,}" if TARGET[g] else "10,000〜15,000(目安)",ec[g],f"{cum:,}"]+[cefr_by[(g,c)] for c in CEFRS])
A("### 4.1 英検")
A(table(["級","累積目標(語)","項目数","累積項目数"]+CEFRS,rows))
A("")
A("※ 目標は「語数」、こちらは品詞別項目数なので厳密には比較できない。1級は網羅ではなく中核（機械抽出が主）。")
A("")
A("### 4.2 TOEIC")
cum=0; rows=[]
TT={400:1500,500:2500,600:3500,730:5000,860:6800,990:8800}
for b in TOEIC:
    cum+=tc[b]; rows.append([TJ[b],f"{TT[b]:,}" if b else "—",tc[b],f"{cum:,}"])
A(table(["スコア帯","累積目標","項目数","累積項目数"],rows))
A("")
A("### 4.3 クロス集計（行=英検、列=TOEIC）")
A(table(["英検＼TOEIC"]+[TJ[b] for b in TOEIC]+["計"],[[EJ[g]]+[cross[(g,b)] for b in TOEIC]+[ec[g]] for g in EIKEN]+[["計"]+[tc[b] for b in TOEIC]+[n]]))
A("")
A("英検とTOEICは独立に割り当てているため、英検の上位級でもTOEICは低い帯になる語がある（準1級の48語、1級の9語が〜400）。逆に1級語の約半数（1,953語）はTOEIC対象外(null)。")
A("")
A("## 5. 分野タグ（35種）と分布")
A(table(["タグ","日本語名","対象","想定ジョブ"],[[d["id"],d["ja"],d["covers"],d["jobs_hint"]] for d in dom]))
A("")
A("### 5.1 英検の級別（項目数、複数タグを含むため合計は項目数を超える）")
A(table(["分野"]+[EJ[g] for g in EIKEN],[[f"{DJ[d['id']]}"]+[dom_e[g][d['id']] for g in EIKEN] for d in dom]))
A("")
A("### 5.2 TOEICの帯別")
A(table(["分野"]+[TJ[b] for b in TOEIC],[[f"{DJ[d['id']]}"]+[dom_t[b][d['id']] for b in TOEIC] for d in dom]))
A("")
A("読み取りの目安: 5〜4級は food/body/family/school/animals/clothing など生活語、3〜準2級で travel/health/money/hotel/emotion、2級以上で law/finance/science/society/technology が増える。TOEIC 500〜860帯で office/meetings/sales/finance/hr/manufacturing が目立つ（TSL/BSL重み付けの効果）。")
A("")
A("## 6. 各級・各スコア帯の代表語（頻度順位で等間隔に40語）")
for g in EIKEN:
    A(f"### 英検{EJ[g]}（{ec[g]:,}項目）")
    A("、".join(fmt(x) for x in reps([x for x in v if x["eiken"]==g])))
    A("")
for b in TOEIC:
    A(f"### TOEIC {TJ[b]}（{tc[b]:,}項目）")
    A("、".join(fmt(x) for x in reps([x for x in v if x["toeic"]==b])))
    A("")
A("## 7. 既知の弱点・注意")
A("1. **級・スコア帯は推定**。CEFR-JのCEFR付けと頻度に基づく機械的な切り分けであり、実際の英検の出題語彙とは一致しない。特に3級/準2級/2級の境界、1級の下限（B2後半を含む）は±1級程度ずれうる。")
A("2. 準1級・1級（約6,100項目）の訳語は機械抽出が主で、5〜8%前後に誤訳・断片が残る（実測は§3.1）。5級〜4級はほぼ手書きで品質が高いが、日本語ネイティブの専門家が全項目を確認したわけではない。")
A("3. 品詞違いを別項目にしたため、同じ単語が別の級に現れる（`make` 動=5級／名=2級 など）。1語1級の表として使うなら単語ごとの最小値を取ること。")
A("4. 分野タグは自動推定で、不適切なタグを含まない項目は約7割（主タグが妥当なのは約85%）。個々のジョブ・場面に使う前に目視確認を推奨。多義語は主要語義以外の分野が付くことがある。")
A("5. TOEIC帯はTSL/BSL（Browne ら）と頻度の組み合わせによる推定。実際のL&R出題データでの検証は未実施。`null` は「TOEICに出ない」ではなく「出題が期待できる度合いが低い」。")
A("6. 複数語表現（句動詞・熟語・`ice cream` など）は対象外（単語のみ）。英国綴りは米国綴りに統一（CEFR-Jの第一表記）。固有名詞は月・曜日・一部国籍のみ。")
A("7. 英語の基本語でもEJDict-handに項目が無いもの（`story`, `color` 等）は手書き訳で補った。EJDictは古い語義が多く、現代的な語義（`keyboard`=キーボード等）の欠落があるため、TOEIC頻出語の一部は手で直した。")
open(os.path.join(ROOT,"VOCAB.md"),"w",encoding="utf-8").write("\n".join(L)+"\n")
stats={"entries":n,"eiken":{g:ec[g] for g in EIKEN},"toeic":{str(b):tc[b] for b in TOEIC},"manual_glosses":sum(manual_by.values())}
os.makedirs(os.path.join(ROOT,"build"),exist_ok=True)
json.dump(stats,open(os.path.join(ROOT,"build","stats.json"),"w"),ensure_ascii=False,indent=1)
print("wrote VOCAB.md",len("\n".join(L)))
