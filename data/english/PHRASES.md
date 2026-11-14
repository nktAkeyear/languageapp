# 英語の言い回し・文法リスト(英検 / TOEIC L&R レベル別)

このファイルは `phrases.json` と `grammar.json` から `scripts/gen_md.py` で自動生成された要約です。
元データの編集は `scripts/src/*.txt` で行い、`scripts/build.py` → `scripts/validate.py` → `scripts/gen_md.py` の順に実行してください。

## 1. 目的と方法

- 英検 5級〜1級、および TOEIC L&R のスコア帯(〜400 / 〜500 / 〜600 / 〜730 / 〜860 / 〜990)ごとに、学習者が使えるべき**言い回し(phrases)**と**文法項目(grammar)**を整理した。
- 英検・TOEIC とも公式の語句リストは公表されていない。市販の単語帳・熟語帳は複写していない。**英検の級の説明、各級が対応する学校カリキュラム、TOEIC の Part 1〜7 の典型場面についての著者(AI)の知識から独自に編纂**した。
- 各項目に **英検グレード**(その表現が最初に必要になる最低級)と **TOEIC 帯**(その表現が必要になる目安のスコア帯。日常会話中心で TOEIC では問われにくいものは `null` 可)を別々に付けた。
- 例文は、町の店・宿・郵便局・診療所・事務所・港などで人が言いそうな自然な文を目指して書いた(ゲーム内会話の素材用)。

### 英検グレードの目安

| グレード | 目安の学習段階 |
|---|---|
| 5級 | 中学1年 |
| 4級 | 中学2年 |
| 3級 | 中学3年 |
| 準2級 | 高校中級 |
| 2級 | 高校卒業 |
| 準1級 | 大学中級 |
| 1級 | 大学上級 |


### TOEIC 帯が想定する場面

| 帯 | 想定される出題・場面 |
|---|---|
| 〜400 | Part 1-2 の基本的な写真描写・短い応答、簡単な掲示・案内(日常場面) |
| 〜500 | Part 3-4 の短い会話・アナウンス、Part 5 の基本文法、簡単なメール・お知らせ |
| 〜600 | Part 3-4 の日常的な職場・店・旅行場面、Part 5/6 の品詞・時制、Part 7 の短い文書 |
| 〜730 | Part 5/6 の接続詞・前置詞・関係詞の判別、Part 7 の複数文書、会議・出張・注文・苦情対応 |
| 〜860 | Part 7 の長文・複数文書、契約・財務・人事・物流などの専門的ビジネス語彙、イディオム的な会話 |
| 〜990 | ほぼ満点水準。法務・財務の文語的定型表現、慣用句・含意を含む会話、高度な論理展開 |


## 2. 注意点(必ずお読みください)

1. **レベルはすべて推定値**である。公式に定められたものではなく、同じ表現でも文脈・用法によって要求水準は変わる。特に 英検準1級/1級・TOEIC 860/990 の境界は主観が大きい。
2. 英検と TOEIC は性質が異なる(英検=学校英語・技能別試験、TOEIC=ビジネス場面のリスニング・リーディング)。そのため **英検グレードと TOEIC 帯は機械的に対応させていない**。日常会話の表現(例: `Take care.`)は低い英検級で必要だが TOEIC 帯は低め、ビジネス定型(例: `effective immediately`)は英検では準2〜2級でも TOEIC では 730 以上、など。
3. TOEIC 帯は、元データでは各項目に最初の目安を付けた上で、`build.py` のルール(3級の句動詞・イディオム・談話標識・パターンは 400→500、2級のコロケーション・句動詞・イディオム・談話標識は 730→600)で一部を機械的に調整している。**項目ごとの個別検証ではない**。
4. 例文は AI が作成したもので、英語母語話者・日本語の専門家による校閲は受けていない。使用語彙が項目のレベル以下に収まっているかは機械的に検証していない(町の場面を優先したため、5級の例文に harbor などやや上の語が含まれる)。
5. 目標件数(累積 150 / 300 / 500 / 900 / 1,400 / 2,000 / 2,600)に対し、実際の収録数は下表のとおり**上位級ほど目標に届いていない**。

## 3. 件数

### 3.1 英検グレード別(新規 / 累積 / 目標累積)

| グレード | 新規 | 累積 | 目標累積 |
|---|---|---|---|
| 5級 | 167 | 167 | 150 |
| 4級 | 159 | 326 | 300 |
| 3級 | 171 | 497 | 500 |
| 準2級 | 231 | 728 | 900 |
| 2級 | 293 | 1021 | 1400 |
| 準1級 | 253 | 1274 | 2000 |
| 1級 | 173 | 1447 | 2600 |


### 3.2 英検グレード × 種類

| グレード | 定型表現 | 句動詞 | イディオム | コロケーション | 文型パターン | 談話標識 | ビジネス | 計 |
|---|---|---|---|---|---|---|---|---|
| 5級 | 122 | 10 | 2 | 22 | 11 | 0 | 0 | 167 |
| 4級 | 70 | 17 | 10 | 23 | 31 | 8 | 0 | 159 |
| 3級 | 50 | 24 | 13 | 37 | 39 | 8 | 0 | 171 |
| 準2級 | 43 | 23 | 13 | 29 | 32 | 11 | 80 | 231 |
| 2級 | 44 | 30 | 15 | 37 | 33 | 20 | 114 | 293 |
| 準1級 | 12 | 31 | 27 | 35 | 20 | 11 | 117 | 253 |
| 1級 | 7 | 23 | 30 | 29 | 24 | 14 | 46 | 173 |
| 計 | 348 | 158 | 110 | 212 | 190 | 72 | 357 | 1447 |


### 3.3 TOEIC 帯 × 種類

| 帯 | 定型表現 | 句動詞 | イディオム | コロケーション | 文型パターン | 談話標識 | ビジネス | 計 |
|---|---|---|---|---|---|---|---|---|
| 〜400 | 212 | 27 | 12 | 81 | 42 | 8 | 0 | 382 |
| 〜500 | 72 | 24 | 13 | 1 | 39 | 8 | 28 | 185 |
| 〜600 | 1 | 53 | 28 | 66 | 32 | 31 | 53 | 264 |
| 〜730 | 44 | 0 | 0 | 0 | 33 | 0 | 113 | 190 |
| 〜860 | 12 | 31 | 27 | 35 | 20 | 11 | 117 | 253 |
| 〜990 | 7 | 23 | 30 | 29 | 24 | 14 | 46 | 173 |


### 3.4 英検グレード × TOEIC 帯

| グレード | 〜400 | 〜500 | 〜600 | 〜730 | 〜860 | 〜990 |
|---|---|---|---|---|---|---|
| 5級 | 167 | 0 | 0 | 0 | 0 | 0 |
| 4級 | 159 | 0 | 0 | 0 | 0 | 0 |
| 3級 | 56 | 115 | 0 | 0 | 0 | 0 |
| 準2級 | 0 | 70 | 161 | 0 | 0 | 0 |
| 2級 | 0 | 0 | 103 | 190 | 0 | 0 |
| 準1級 | 0 | 0 | 0 | 0 | 253 | 0 |
| 1級 | 0 | 0 | 0 | 0 | 0 | 173 |


### 3.5 文法項目数

| グレード | 5級 | 4級 | 3級 | 準2級 | 2級 | 準1級 | 1級 | 計 |
|---|---|---|---|---|---|---|---|---|
| 項目数 | 28 | 31 | 42 | 60 | 67 | 36 | 34 | 298 |


| TOEIC 帯 | 〜400 | 〜500 | 〜600 | 〜730 | 〜860 | 〜990 | 計 |
|---|---|---|---|---|---|---|---|
| 項目数 | 58 | 26 | 18 | 116 | 46 | 34 | 298 |


## 4. 文法項目の進行表

### 4.1 英検グレード別

**5級(中学1年・28項目)**: be動詞の現在形、be動詞の否定文・疑問文、一般動詞の現在形、do / does を使う疑問文・否定文、3単現のs、名詞の複数形、冠詞(a / an / the)、人称代名詞(主格・目的格・所有格)、所有格('s)、this / that / these / those、命令文、Let's ...(誘い)、疑問詞を使った疑問文、how many / how much、can(能力・許可)、現在進行形、過去形(be動詞・規則動詞)、過去形(不規則動詞)、過去形の否定文・疑問文、There is / There are、場所・時の前置詞(in / on / at)、頻度の副詞、数えられる名詞・数えられない名詞(基本)、数と序数、like / want / need などの基本動詞、形容詞の位置、時を表す語句、and / but / or

**4級(中学2年・31項目)**: be going to(予定・予測)、will(未来・意志)、must / have to(義務)、must not と don't have to、should(助言)、may(許可・可能性)、would like(丁寧な希望)、不定詞の名詞的用法、不定詞の副詞的用法(目的)、不定詞の形容詞的用法、動名詞(目的語)、動名詞(主語)、不定詞・動名詞のどちらをとるか、比較級、最上級、as ... as(同等比較)、不規則な比較級・最上級、過去進行形、when / because / if(副詞節)、that節、so ... that、too ... to、something / anything + 形容詞、感嘆文、動詞・前置詞のあとの目的格、受動態(基本)、here / there など場所の副詞、had to(過去の義務)、SVOO文型、SVC文型(look / feel など)、call / name(SVOC)

**3級(中学3年・42項目)**: 現在完了(経験)、現在完了(完了・結果)、現在完了(継続)、現在完了進行形、受動態(過去・未来・助動詞)、受動態(by + 行為者)、関係代名詞(who / which / that)、関係代名詞の省略(目的格)、関係副詞(where / when)、間接疑問文、付加疑問文、分詞の形容詞的用法、感情を表す分詞形容詞、SVO + to不定詞、It is ... to V(形式主語)、使役・知覚(make / let / help)、I wish + 仮定法過去、条件文(現実的)、時の接続詞、前置詞と接続詞(during / while 等)、時の前置詞 since / for / during、前置詞 + 動名詞、used to(以前は…した)、be used to -ing(…に慣れている)、So do I / Neither do I、再帰代名詞(-self)、each / every / all / both、few / a few / little / a little、many / much / a lot of、enough / too / very、as soon as / until / by(時)、whether / if(…かどうか)、相関接続詞(基本)、品詞の選択:名詞の語尾、品詞の選択:形容詞の語尾、品詞の選択:副詞(-ly)、品詞の選択:動詞・動名詞、連結動詞のあとの形容詞(become / remain / seem)、分詞形容詞(-ing と -ed の選択)、代名詞の格の選択、所有格と所有代名詞、再帰代名詞の用法

**準2級(高校中級・60項目)**: 過去完了、過去完了進行形、未来完了、未来進行形、時制の一致、話法(直接・間接)、仮定法過去、仮定法のwere、条件文(現実と非現実)、助動詞 + have p.p.、助動詞(確信度)、関係代名詞 what、関係代名詞 whose、前置詞 + 関係代名詞、非制限用法(関係詞の継続用法)、比較級の相関(the more ..., the better)、比較級の強調(much / far / even)、倍数表現、最上級 + ever / one of the、分詞構文(基本)、完了分詞構文(having + p.p.)、付帯状況 with、使役(have / get + O + p.p. / V)、知覚動詞、remember / forget / stop + to V / -ing、It is said that ...(受動態の形式主語)、be to V(予定・義務)、be about to / be likely to、not only A but also B、either / neither / both(代名詞)、some / any / no / none、so / such の使い分け、譲歩の前置詞と接続詞、because と because of、前置詞・接続詞・副詞の選択(because of / because / however)、接続副詞と接続詞(however / although)、時の前置詞の選択(by / until / within / during / for)、理由・譲歩の前置詞、between と among、動詞 + 前置詞の定型(responsible for / depend on)、時制と時を表す語句の一致(yesterday / since / by the time)、主語と動詞の一致(間に挟まる語句)、能動態と受動態の選択、動詞のあとの不定詞・動名詞の選択(agree to / avoid -ing)、関係代名詞の選択、who と whom、数量詞の選択(number / amount / many / much)、比較級・最上級の形の選択、相関接続詞の組(Part 5)、such / so / very / too、already / yet / still / just の位置と時制、most / almost / mostly、whether と if、other / another / the other、each / every の単複、限定詞の選択、前置詞のあとの形(in addition to / look forward to)、複合名詞(名詞 + 名詞)、Part 6の文挿入:つなぎ表現、お知らせ文での時制と態

**2級(高校卒業・67項目)**: 仮定法過去完了、混合仮定法、if を使わない仮定(otherwise / but for)、as if(まるで…のように)、I wish + 仮定法過去完了、If it were not for ...(…がなければ)、It is time + 仮定法過去、wish と hope の違い、分詞構文(接続詞の意味)、独立分詞構文、分詞構文の否定、否定副詞の倒置、So / Neither の倒置、Only + 副詞句の倒置、if の省略による倒置、強調構文(It is ... that ...)、疑問詞を使った分裂文、同格の that 節、which が前の文全体を受ける、複合関係詞(whoever / whatever)、複合関係副詞(however / wherever / whenever)、no matter what / how、譲歩・対比の接続詞、完了不定詞、動名詞の受動・完了形、動名詞の意味上の主語、不定詞の否定・独立不定詞、get 受動態、二重目的語の受動態、助動詞・進行形の受動態、句動詞の受動態、使役動詞の整理、It takes / spend / cost の使い分け、borrow / lend / rent などの使い分け、make と do の使い分け、say / tell / speak / talk、他動詞と自動詞(raise / rise / lay / lie)、used to と would(過去の習慣)、had better、would rather、need / dare(助動詞用法)、ought to、提案・要求を表す動詞のあとの原形(仮定法現在)、形容詞のあとの that 節の原形、名詞 + to V / that(decision, plan, etc.)、副詞の位置、enough / too の語順、間接目的語の語順、省略と代用(so / not / one / do so)、並列構造、付加疑問文の応用、名詞節、There + 動詞のバリエーション、So do I / Neither do I(複雑な時制)、the + 形容詞(…の人々)、分数・割合の表現、比較級・最上級の誤用、the same as / similar to / different from、prefer の構文、It is no use -ing / be worth -ing / cannot help -ing、疑問詞 + to 不定詞、spend / be busy -ing、prevent O from -ing、感謝・非難の for、regret / remember の使い分け、慣用的な前置詞(in charge of / at no cost)、関係副詞・複合関係詞(wherever / whenever)

**準1級(大学中級・36項目)**: If ... were to / should(未来の仮定)、as if + 過去完了、It's time + 過去形 / would rather + 過去形、suppose / what if、otherwise(過去への仮定)、So + 形容詞 + 倒置、否定の副詞句の倒置、場所を表す副詞の倒置、not so much A as B、no more than / no less than、more A than B(AというよりB)、2つのうちより…、まして…ない、最上級の慣用表現、having been + p.p.、付帯状況(with + O + C)、原形不定詞を伴う慣用句、in order to / so as to、too ... to / enough to の受動的意味、擬似関係代名詞(as / but)、what + 前置詞、先行詞に all / only などがつく場合は that、前置詞が文末の関係詞節、名詞化表現(the + 名詞 + of)、無生物主語構文、may well / might as well、the 比較級 の変形、It is + 形容詞(人の性質) + of + 人 + to V、for + 人 + to V の用法、have + O + V-ing(させておく)、There is no -ing、on -ing(…するとすぐに)、a number of / the number of の呼応、主語と動詞の一致(複雑な主語)、集合名詞の一致、neither A nor B の動詞の一致

**1級(大学上級・34項目)**: 文語的な倒置(Not until / No sooner)、So / Such で始まる倒置、譲歩の倒置(Young as he is, ...)、倒置による仮定(正式)、仮定法現在の固定表現、要求を表す that 節の受動態、could have p.p. / might have p.p.、形式主語 it の that 節、名詞 + 前置詞のコロケーション、比較節の省略、独立構文(with + 形容詞 / being 省略)、接続詞 + 分詞、挿入節、All + S + V + is ...、強調構文(副詞句)、名詞 + of(量を表す名詞)、不可算名詞(information / advice / equipment)、時・条件の副詞節の現在形(応用)、歴史的現在・物語の時制、状態動詞は進行形にしない、現在進行形で苛立ち(always)、代名詞による指示(this / that / such)、強意の do、否定の範囲・二重否定、主語と動詞の一致(複雑な場合)、冠詞の省略(慣用表現)、相関接続詞の倒置、wh-ever(いったい)、省略表現(if any / if necessary)、準否定語、lest / for fear that、条件の接続詞、notwithstanding / albeit、関係詞節の短縮(分詞 / 形容詞句)

### 4.2 TOEIC 帯別

**〜400(58項目)**: be動詞の現在形、be動詞の否定文・疑問文、一般動詞の現在形、do / does を使う疑問文・否定文、3単現のs、名詞の複数形、冠詞(a / an / the)、人称代名詞(主格・目的格・所有格)、所有格('s)、this / that / these / those、命令文、Let's ...(誘い)、疑問詞を使った疑問文、how many / how much、can(能力・許可)、現在進行形、過去形(be動詞・規則動詞)、過去形(不規則動詞)、過去形の否定文・疑問文、There is / There are、場所・時の前置詞(in / on / at)、頻度の副詞、数えられる名詞・数えられない名詞(基本)、数と序数、like / want / need などの基本動詞、形容詞の位置、時を表す語句、and / but / or、be going to(予定・予測)、will(未来・意志)、must / have to(義務)、must not と don't have to、should(助言)、may(許可・可能性)、would like(丁寧な希望)、不定詞の名詞的用法、不定詞の副詞的用法(目的)、不定詞の形容詞的用法、動名詞(目的語)、動名詞(主語)、比較級、最上級、as ... as(同等比較)、不規則な比較級・最上級、過去進行形、when / because / if(副詞節)、that節、so ... that、too ... to、something / anything + 形容詞、感嘆文、動詞・前置詞のあとの目的格、受動態(基本)、here / there など場所の副詞、had to(過去の義務)、SVOO文型、SVC文型(look / feel など)、call / name(SVOC)

**〜500(26項目)**: 不定詞・動名詞のどちらをとるか、現在完了(経験)、現在完了(完了・結果)、現在完了(継続)、受動態(過去・未来・助動詞)、関係代名詞(who / which / that)、関係代名詞の省略(目的格)、間接疑問文、付加疑問文、分詞の形容詞的用法、SVO + to不定詞、It is ... to V(形式主語)、使役・知覚(make / let / help)、I wish + 仮定法過去、条件文(現実的)、前置詞 + 動名詞、used to(以前は…した)、be used to -ing(…に慣れている)、So do I / Neither do I、enough / too / very、as soon as / until / by(時)、whether / if(…かどうか)、相関接続詞(基本)、品詞の選択:名詞の語尾、品詞の選択:形容詞の語尾、品詞の選択:副詞(-ly)

**〜600(18項目)**: 現在完了進行形、受動態(by + 行為者)、関係副詞(where / when)、感情を表す分詞形容詞、時の接続詞、前置詞と接続詞(during / while 等)、時の前置詞 since / for / during、再帰代名詞(-self)、each / every / all / both、few / a few / little / a little、many / much / a lot of、品詞の選択:動詞・動名詞、連結動詞のあとの形容詞(become / remain / seem)、分詞形容詞(-ing と -ed の選択)、代名詞の格の選択、所有格と所有代名詞、過去完了、過去完了進行形

**〜730(116項目)**: 再帰代名詞の用法、未来完了、未来進行形、時制の一致、話法(直接・間接)、仮定法過去、仮定法のwere、条件文(現実と非現実)、助動詞 + have p.p.、助動詞(確信度)、関係代名詞 what、関係代名詞 whose、非制限用法(関係詞の継続用法)、比較級の相関(the more ..., the better)、比較級の強調(much / far / even)、倍数表現、最上級 + ever / one of the、分詞構文(基本)、完了分詞構文(having + p.p.)、付帯状況 with、知覚動詞、remember / forget / stop + to V / -ing、It is said that ...(受動態の形式主語)、be to V(予定・義務)、be about to / be likely to、not only A but also B、either / neither / both(代名詞)、some / any / no / none、so / such の使い分け、譲歩の前置詞と接続詞、because と because of、前置詞・接続詞・副詞の選択(because of / because / however)、接続副詞と接続詞(however / although)、時の前置詞の選択(by / until / within / during / for)、理由・譲歩の前置詞、between と among、動詞 + 前置詞の定型(responsible for / depend on)、時制と時を表す語句の一致(yesterday / since / by the time)、主語と動詞の一致(間に挟まる語句)、能動態と受動態の選択、動詞のあとの不定詞・動名詞の選択(agree to / avoid -ing)、関係代名詞の選択、who と whom、数量詞の選択(number / amount / many / much)、比較級・最上級の形の選択、相関接続詞の組(Part 5)、such / so / very / too、already / yet / still / just の位置と時制、most / almost / mostly、whether と if、other / another / the other、each / every の単複、限定詞の選択、仮定法過去完了、混合仮定法、if を使わない仮定(otherwise / but for)、as if(まるで…のように)、I wish + 仮定法過去完了、If it were not for ...(…がなければ)、It is time + 仮定法過去、wish と hope の違い、分詞構文(接続詞の意味)、独立分詞構文、分詞構文の否定、否定副詞の倒置、So / Neither の倒置、if の省略による倒置、強調構文(It is ... that ...)、疑問詞を使った分裂文、同格の that 節、which が前の文全体を受ける、複合関係詞(whoever / whatever)、複合関係副詞(however / wherever / whenever)、no matter what / how、譲歩・対比の接続詞、完了不定詞、動名詞の受動・完了形、動名詞の意味上の主語、不定詞の否定・独立不定詞、get 受動態、二重目的語の受動態、助動詞・進行形の受動態、句動詞の受動態、使役動詞の整理、It takes / spend / cost の使い分け、borrow / lend / rent などの使い分け、make と do の使い分け、say / tell / speak / talk、他動詞と自動詞(raise / rise / lay / lie)、used to と would(過去の習慣)、had better、would rather、need / dare(助動詞用法)、ought to、提案・要求を表す動詞のあとの原形(仮定法現在)、形容詞のあとの that 節の原形、副詞の位置、enough / too の語順、間接目的語の語順、省略と代用(so / not / one / do so)、並列構造、付加疑問文の応用、名詞節、There + 動詞のバリエーション、So do I / Neither do I(複雑な時制)、the + 形容詞(…の人々)、分数・割合の表現、比較級・最上級の誤用、the same as / similar to / different from、prefer の構文、It is no use -ing / be worth -ing / cannot help -ing、疑問詞 + to 不定詞、spend / be busy -ing、prevent O from -ing、感謝・非難の for、regret / remember の使い分け

**〜860(46項目)**: 前置詞 + 関係代名詞、使役(have / get + O + p.p. / V)、前置詞のあとの形(in addition to / look forward to)、複合名詞(名詞 + 名詞)、Part 6の文挿入:つなぎ表現、お知らせ文での時制と態、Only + 副詞句の倒置、名詞 + to V / that(decision, plan, etc.)、慣用的な前置詞(in charge of / at no cost)、関係副詞・複合関係詞(wherever / whenever)、If ... were to / should(未来の仮定)、as if + 過去完了、It's time + 過去形 / would rather + 過去形、suppose / what if、otherwise(過去への仮定)、So + 形容詞 + 倒置、否定の副詞句の倒置、場所を表す副詞の倒置、not so much A as B、no more than / no less than、more A than B(AというよりB)、2つのうちより…、まして…ない、最上級の慣用表現、having been + p.p.、付帯状況(with + O + C)、原形不定詞を伴う慣用句、in order to / so as to、too ... to / enough to の受動的意味、擬似関係代名詞(as / but)、what + 前置詞、先行詞に all / only などがつく場合は that、前置詞が文末の関係詞節、名詞化表現(the + 名詞 + of)、無生物主語構文、may well / might as well、the 比較級 の変形、It is + 形容詞(人の性質) + of + 人 + to V、for + 人 + to V の用法、have + O + V-ing(させておく)、There is no -ing、on -ing(…するとすぐに)、a number of / the number of の呼応、主語と動詞の一致(複雑な主語)、集合名詞の一致、neither A nor B の動詞の一致

**〜990(34項目)**: 文語的な倒置(Not until / No sooner)、So / Such で始まる倒置、譲歩の倒置(Young as he is, ...)、倒置による仮定(正式)、仮定法現在の固定表現、要求を表す that 節の受動態、could have p.p. / might have p.p.、形式主語 it の that 節、名詞 + 前置詞のコロケーション、比較節の省略、独立構文(with + 形容詞 / being 省略)、接続詞 + 分詞、挿入節、All + S + V + is ...、強調構文(副詞句)、名詞 + of(量を表す名詞)、不可算名詞(information / advice / equipment)、時・条件の副詞節の現在形(応用)、歴史的現在・物語の時制、状態動詞は進行形にしない、現在進行形で苛立ち(always)、代名詞による指示(this / that / such)、強意の do、否定の範囲・二重否定、主語と動詞の一致(複雑な場合)、冠詞の省略(慣用表現)、相関接続詞の倒置、wh-ever(いったい)、省略表現(if any / if necessary)、準否定語、lest / for fear that、条件の接続詞、notwithstanding / albeit、関係詞節の短縮(分詞 / 形容詞句)

TOEIC Part 5/6 向けの項目(品詞の選択、前置詞と接続詞、時制の一致、代名詞の格、関係代名詞の選択など)は、名前が `TOEIC Part 5:` / `TOEIC Part 6:` で始まる項目として個別に収録している。

## 5. 代表的な表現(各25前後)

グレード・帯ごとに、種類の割合に応じて均等間隔で機械的に選んだもの(人手のベスト選抜ではない)。

### 5.1 英検グレード別

#### 5級(中学1年)

| 表現 | 意味 | 種類 |
|---|---|---|
| `Good evening.` | こんばんは | 定型表現 |
| `And you?` | あなたは? | 定型表現 |
| `Thanks.` | ありがとう(くだけて) | 定型表現 |
| `No, thank you.` | いいえ、結構です | 定型表現 |
| `Look at this.` | これを見て | 定型表現 |
| `What's your name?` | お名前は? | 定型表現 |
| `How many?` | いくつ? | 定型表現 |
| `Yes, it is.` | はい、そうです(it) | 定型表現 |
| `Pardon?` | 何とおっしゃいましたか | 定型表現 |
| `Happy birthday!` | 誕生日おめでとう | 定型表現 |
| `I'm hungry.` | おなかがすきました | 定型表現 |
| `I have a cold.` | 風邪をひいています | 定型表現 |
| `Can you ...?` | …できますか(依頼) | 定型表現 |
| `Who is that?` | あれはだれですか | 定型表現 |
| `It's in front of ...` | …の前です | 定型表現 |
| `Anything else?` | ほかに何かありますか | 定型表現 |
| `That's good.` | それはいいね | 定型表現 |
| `I'm home.` | ただいま | 定型表現 |
| `put on` | 着る・身につける | 句動詞 |
| `every day` | 毎日 | イディオム |
| `watch TV` | テレビを見る | コロケーション |
| `read a book` | 本を読む | コロケーション |
| `take a picture` | 写真をとる | コロケーション |
| `It's a ...` | それは…です | 文型パターン |
| `at ... o'clock` | …時に | 文型パターン |


#### 4級(中学2年)

| 表現 | 意味 | 種類 |
|---|---|---|
| `Can I have ..., please?` | …をいただけますか | 定型表現 |
| `That sounds good.` | いいですね | 定型表現 |
| `What's the matter?` | どうしましたか | 定型表現 |
| `How was your weekend?` | 週末はどうでしたか | 定型表現 |
| `How long does it take?` | どのくらいかかりますか | 定型表現 |
| `Do you have a bigger size?` | もっと大きいサイズはありますか | 定型表現 |
| `For here or to go?` | 店内ですか、お持ち帰りですか | 定型表現 |
| `Thanks for calling.` | お電話ありがとうございます | 定型表現 |
| `Make yourself at home.` | くつろいでください | 定型表現 |
| `I'll be back soon.` | すぐ戻ります | 定型表現 |
| `get off` | 降りる | 句動詞 |
| `give up` | あきらめる | 句動詞 |
| `come from` | …の出身である | 句動詞 |
| `on foot` | 徒歩で | イディオム |
| `in the afternoon` | 午後に | イディオム |
| `take a walk` | 散歩する | コロケーション |
| `catch a fish` | 魚をとる | コロケーション |
| `get to the station` | 駅に着く | コロケーション |
| `a slice of cake` | ケーキ1切れ | コロケーション |
| `I have to ...` | …しなければなりません | 文型パターン |
| `I'm good at ...` | …が得意です | 文型パターン |
| `as ... as ...` | …と同じくらい… | 文型パターン |
| `enough ... to ...` | …するのに十分な… | 文型パターン |
| `Do you know where ...?` | …がどこか知っていますか | 文型パターン |
| `first` | まず | 談話標識 |


#### 3級(中学3年)

| 表現 | 意味 | 種類 |
|---|---|---|
| `Sorry to keep you waiting.` | お待たせしてすみません | 定型表現 |
| `It was nice talking to you.` | お話しできてよかったです | 定型表現 |
| `You should ...` | …したほうがいい | 定型表現 |
| `Could you tell me how to get to ...?` | …への行き方を教えてください | 定型表現 |
| `I'd like to check in.` | チェックインしたいのですが | 定型表現 |
| `Is there any discount?` | 割引はありますか | 定型表現 |
| `By air or by sea?` | 航空便ですか船便ですか | 定型表現 |
| `look up` | 調べる | 句動詞 |
| `call back` | 折り返し電話する | 句動詞 |
| `bring up` | 育てる | 句動詞 |
| `work out` | うまくいく・運動する | 句動詞 |
| `in time` | 間に合って | イディオム |
| `a lot of fun` | とても楽しい | イディオム |
| `take medicine` | 薬を飲む | コロケーション |
| `pay attention to` | …に注意を払う | コロケーション |
| `get tired` | 疲れる | コロケーション |
| `strong wind` | 強風 | コロケーション |
| `be proud of` | …を誇りに思う | コロケーション |
| `I've already ...` | もう…しました | 文型パターン |
| `the book that ...` | …の本 | 文型パターン |
| `finish ...ing` | …し終える | 文型パターン |
| `help someone ...` | …が…するのを手伝う | 文型パターン |
| `so that I can ...` | …するために | 文型パターン |
| `The more ..., the better` | …すればするほど… | 文型パターン |
| `though` | …だが | 談話標識 |


#### 準2級(高校中級)

| 表現 | 意味 | 種類 |
|---|---|---|
| `I was wondering if you could ...` | …していただけないかと | 定型表現 |
| `I couldn't agree more.` | 大賛成です | 定型表現 |
| `Could you recommend ...?` | …を勧めていただけますか | 定型表現 |
| `Do you have this in another color?` | 別の色はありますか | 定型表現 |
| `How often does the bus run?` | バスは何分おきに来ますか | 定型表現 |
| `put off` | 延期する | 句動詞 |
| `get over` | 乗り越える | 句動詞 |
| `out of date` | 時代遅れの | イディオム |
| `all the time` | いつも | イディオム |
| `fall asleep` | 寝入る | コロケーション |
| `for sale` | 売り物の | コロケーション |
| `heavy traffic` | 交通渋滞 | コロケーション |
| `It's worth ...ing` | …する価値がある | 文型パターン |
| `rather than ...` | …よりむしろ | 文型パターン |
| `not as ... as ...` | …ほど…ない | 文型パターン |
| `on the whole` | 全体として | 談話標識 |
| `I look forward to hearing from you.` | ご連絡をお待ちしております | ビジネス |
| `The meeting is scheduled for ...` | 会議は…に予定されています | ビジネス |
| `Please keep your receipt.` | 領収書を保管してください | ビジネス |
| `The store will be open until ...` | 店は…まで営業します | ビジネス |
| `Please fasten your seat belt.` | シートベルトをお締めください | ビジネス |
| `Could you fill out this form?` | この用紙に記入いただけますか | ビジネス |
| `The air conditioner isn't working.` | エアコンが動きません | ビジネス |
| `I'll send it by tomorrow.` | 明日までに送ります | ビジネス |
| `I'm in charge of ...` | …を担当しています | ビジネス |


#### 2級(高校卒業)

| 表現 | 意味 | 種類 |
|---|---|---|
| `I'm afraid there's been a misunderstanding.` | 行き違いがあったようです | 定型表現 |
| `Let me get this straight.` | 整理させてください | 定型表現 |
| `There's a problem with ...` | …に問題があります | 定型表現 |
| `Good for you!` | よかったね | 定型表現 |
| `end up` | 結局…になる | 句動詞 |
| `pay off` | 完済する・報われる | 句動詞 |
| `take up` | 始める・占める | 句動詞 |
| `in the meantime` | その間に | イディオム |
| `make a deal` | 取引をする | コロケーション |
| `in installments` | 分割で | コロケーション |
| `a reasonable price` | 手頃な価格 | コロケーション |
| `provided that ...` | …という条件で | 文型パターン |
| `The reason why ... is that ...` | …な理由は…だ | 文型パターン |
| `be eligible for ...` | …の資格がある | 文型パターン |
| `accordingly` | それに応じて | 談話標識 |
| `to sum up` | 要約すると | 談話標識 |
| `We regret to inform you that ...` | 残念ながら…をお知らせします | ビジネス |
| `subject to change` | 変更されることがあります | ビジネス |
| `We have received your payment.` | お支払いを確認しました | ビジネス |
| `Could you spell that, please?` | 綴りを教えてください | ビジネス |
| `I'm in favor of ...` | …に賛成です | ビジネス |
| `a significant increase in ...` | …の大幅な増加 | ビジネス |
| `The warranty has expired.` | 保証が切れています | ビジネス |
| `go over budget` | 予算を超える | ビジネス |
| `an emergency exit` | 非常口 | ビジネス |


#### 準1級(大学中級)

| 表現 | 意味 | 種類 |
|---|---|---|
| `Let's agree to disagree.` | 意見の違いは認めましょう | 定型表現 |
| `come down with` | (病気に)かかる | 句動詞 |
| `live up to` | 期待に応える | 句動詞 |
| `take on` | 引き受ける・雇う | 句動詞 |
| `get the hang of it` | コツをつかむ | イディオム |
| `the last straw` | 堪忍袋の緒が切れる原因 | イディオム |
| `no matter what` | 何があっても | イディオム |
| `pose a threat` | 脅威となる | コロケーション |
| `in view of ...` | …を考えると | コロケーション |
| `public opinion` | 世論 | コロケーション |
| `What matters is ...` | 大切なのは… | 文型パターン |
| `whenever possible` | 可能な限り | 文型パターン |
| `admittedly` | 確かに | 談話標識 |
| `We appreciate your understanding.` | ご理解に感謝します | ビジネス |
| `Proceeds will go to ...` | 収益は…に寄付されます | ビジネス |
| `Non-refundable` | 返金不可 | ビジネス |
| `a target audience` | 対象顧客層 | ビジネス |
| `meet the deadline` | 締め切りに間に合う | ビジネス |
| `a merger` | 合併 | ビジネス |
| `a landlord` | 大家 | ビジネス |
| `a tracking number` | 追跡番号 | ビジネス |
| `a technical support team` | 技術サポートチーム | ビジネス |
| `a renovation project` | 改装計画 | ビジネス |
| `I'll get back to you by ...` | …までに折り返します | ビジネス |
| `a legal requirement` | 法的要件 | ビジネス |


#### 1級(大学上級)

| 表現 | 意味 | 種類 |
|---|---|---|
| `Far be it from me to ...` | 私が…するなどとんでもない | 定型表現 |
| `bear out` | 裏付ける | 句動詞 |
| `hinge on` | …次第である | 句動詞 |
| `smooth over` | 丸く収める | 句動詞 |
| `face the music` | 報いを受ける | イディオム |
| `rub salt in the wound` | 傷口に塩を塗る | イディオム |
| `a drop in the bucket` | 焼け石に水 | イディオム |
| `for the most part` | 大部分は | イディオム |
| `a moot point` | 議論の余地のある点 | コロケーション |
| `set a precedent` | 前例を作る | コロケーション |
| `a vested interest` | 既得権益 | コロケーション |
| `a poor harvest` | 不作 | コロケーション |
| `Only then did I realize ...` | そのとき初めて…と気づいた | 文型パターン |
| `be reluctant to ...` | …したがらない | 文型パターン |
| `be tantamount to ...` | …に等しい | 文型パターン |
| `As is often the case, ...` | よくあることだが | 文型パターン |
| `inasmuch as ...` | …であるから | 談話標識 |
| `for all that` | それにもかかわらず | 談話標識 |
| `Enclosed herewith is ...` | 同封しております | ビジネス |
| `shall not be held responsible for ...` | …の責任を負わない | ビジネス |
| `a stakeholder` | 利害関係者 | ビジネス |
| `downsize` | 規模を縮小する | ビジネス |
| `subject to approval` | 承認を条件として | ビジネス |
| `Please accept our heartfelt condolences.` | 心よりお悔やみ申し上げます | ビジネス |
| `a tender` | 入札 | ビジネス |


### 5.2 TOEIC 帯別

#### 〜400

| 表現 | 意味 | 種類 |
|---|---|---|
| `How are you?` | お元気ですか | 定型表現 |
| `Here you are.` | はい、どうぞ(手渡し) | 定型表現 |
| `How old are you?` | 何歳ですか | 定型表現 |
| `Pardon?` | 何とおっしゃいましたか | 定型表現 |
| `I'm tired.` | 疲れました | 定型表現 |
| `Where are you going?` | どこへ行くの? | 定型表現 |
| `How about you?` | あなたはどう? | 定型表現 |
| `What would you like?` | 何になさいますか | 定型表現 |
| `What's wrong?` | どうしたの | 定型表現 |
| `It takes ten minutes.` | 10分かかります | 定型表現 |
| `Hold on, please.` | 少々お待ちください(電話) | 定型表現 |
| `I forgot my umbrella.` | 傘を忘れました | 定型表現 |
| `How about going to ...?` | …に行くのはどう? | 定型表現 |
| `take off` | 脱ぐ | 句動詞 |
| `take care of` | 世話をする | 句動詞 |
| `for example` | 例えば | イディオム |
| `wash my hands` | 手を洗う | コロケーション |
| `take a walk` | 散歩する | コロケーション |
| `a cup of tea` | お茶1杯 | コロケーション |
| `pay attention to` | …に注意を払う | コロケーション |
| `at least` | 少なくとも | コロケーション |
| `I go to ... by bus.` | バスで…へ行きます | 文型パターン |
| `I'm not good at ...` | …が苦手です | 文型パターン |
| `because ...` | なぜなら… | 文型パターン |
| `first` | まず | 談話標識 |


#### 〜500

| 表現 | 意味 | 種類 |
|---|---|---|
| `Where does it hurt?` | どこが痛みますか | 定型表現 |
| `I'd like to check in.` | チェックインしたいのですが | 定型表現 |
| `Can I get a refund?` | 返金してもらえますか | 定型表現 |
| `I'd like to withdraw some money.` | お金を引き出したいのですが | 定型表現 |
| `I really appreciate it.` | 本当に感謝します | 定型表現 |
| `It doesn't matter.` | かまいません | 定型表現 |
| `What's included?` | 何が含まれますか | 定型表現 |
| `It doesn't fit.` | サイズが合いません | 定型表現 |
| `The next ferry leaves at ...` | 次のフェリーは…に出ます | 定型表現 |
| `take out` | 取り出す・持ち帰る | 句動詞 |
| `show up` | 現れる | 句動詞 |
| `drop by` | 立ち寄る | 句動詞 |
| `in time` | 間に合って | イディオム |
| `a lot of fun` | とても楽しい | イディオム |
| `do business` | 商売をする | コロケーション |
| `I've already ...` | もう…しました | 文型パターン |
| `I was told to ...` | …するように言われた | 文型パターン |
| `decide to ...` | …することに決める | 文型パターン |
| `I wish I could ...` | …できたらなあ | 文型パターン |
| `The more ..., the better` | …すればするほど… | 文型パターン |
| `though` | …だが | 談話標識 |
| `Please find attached ...` | …を添付いたします | ビジネス |
| `We apologize for the delay.` | 遅れをお詫びします | ビジネス |
| `Let me check and get back to you.` | 確認して折り返します | ビジネス |
| `No smoking.` | 禁煙 | ビジネス |


#### 〜600

| 表現 | 意味 | 種類 |
|---|---|---|
| `How can I get to ... from here?` | ここから…へはどう行けばいいですか | 定型表現 |
| `put off` | 延期する | 句動詞 |
| `catch up with` | 追いつく | 句動詞 |
| `count on` | 頼りにする | 句動詞 |
| `look over` | 目を通す | 句動詞 |
| `stand for` | 表す | 句動詞 |
| `up to date` | 最新の | イディオム |
| `on the other hand` | 他方で(句) | イディオム |
| `once in a while` | ときどき | イディオム |
| `come true` | 実現する | コロケーション |
| `by mistake` | 間違って | コロケーション |
| `make an offer` | 申し出る | コロケーション |
| `on credit` | クレジットで | コロケーション |
| `a reasonable price` | 手頃な価格 | コロケーション |
| `It's worth ...ing` | …する価値がある | 文型パターン |
| `rather than ...` | …よりむしろ | 文型パターン |
| `not as ... as ...` | …ほど…ない | 文型パターン |
| `on the whole` | 全体として | 談話標識 |
| `consequently` | その結果 | 談話標識 |
| `to begin with` | まず初めに | 談話標識 |
| `Free shipping on orders over ...` | …以上のご注文は送料無料 | ビジネス |
| `Please have your ticket ready.` | 切符をご用意ください | ビジネス |
| `Do you have any vacancies?` | 空室はありますか | ビジネス |
| `The deadline is ...` | 締め切りは…です | ビジネス |
| `I'm in charge of ...` | …を担当しています | ビジネス |


#### 〜730

| 表現 | 意味 | 種類 |
|---|---|---|
| `I'm terribly sorry.` | 本当に申し訳ありません | 定型表現 |
| `I see what you mean.` | おっしゃる意味はわかります | 定型表現 |
| `What I mean is ...` | つまり… | 定型表現 |
| `I'll show you to your room.` | お部屋にご案内します | 定型表現 |
| `You need to see a specialist.` | 専門医に診てもらう必要があります | 定型表現 |
| `That's a relief.` | ほっとしました | 定型表現 |
| `as long as ...` | …である限り | 文型パターン |
| `as ... as possible` | できるだけ… | 文型パターン |
| `be likely to ...` | …しそうだ | 文型パターン |
| `be satisfied with ...` | …に満足している | 文型パターン |
| `Please be advised that ...` | …ということをご承知おきください | ビジネス |
| `Feel free to call me.` | お気軽にお電話ください | ビジネス |
| `subject to change` | 変更されることがあります | ビジネス |
| `We would like to invite you to ...` | …にご招待いたします | ビジネス |
| `We will look into the matter.` | その件を調べます | ビジネス |
| `Let me put you through to ...` | …におつなぎします | ビジネス |
| `Are you available on ...?` | …はご都合いかがですか | ビジネス |
| `I'm in favor of ...` | …に賛成です | ビジネス |
| `within budget` | 予算内で | ビジネス |
| `quarterly report` | 四半期報告 | ビジネス |
| `terms and conditions` | 契約条件 | ビジネス |
| `a job interview` | 就職面接 | ビジネス |
| `draw up a contract` | 契約書を作成する | ビジネス |
| `be reimbursed for ...` | …の払い戻しを受ける | ビジネス |
| `a leaflet` | チラシ | ビジネス |


#### 〜860

| 表現 | 意味 | 種類 |
|---|---|---|
| `Let's agree to disagree.` | 意見の違いは認めましょう | 定型表現 |
| `come down with` | (病気に)かかる | 句動詞 |
| `live up to` | 期待に応える | 句動詞 |
| `take on` | 引き受ける・雇う | 句動詞 |
| `get the hang of it` | コツをつかむ | イディオム |
| `the last straw` | 堪忍袋の緒が切れる原因 | イディオム |
| `no matter what` | 何があっても | イディオム |
| `pose a threat` | 脅威となる | コロケーション |
| `in view of ...` | …を考えると | コロケーション |
| `public opinion` | 世論 | コロケーション |
| `What matters is ...` | 大切なのは… | 文型パターン |
| `whenever possible` | 可能な限り | 文型パターン |
| `admittedly` | 確かに | 談話標識 |
| `We appreciate your understanding.` | ご理解に感謝します | ビジネス |
| `Proceeds will go to ...` | 収益は…に寄付されます | ビジネス |
| `Non-refundable` | 返金不可 | ビジネス |
| `a target audience` | 対象顧客層 | ビジネス |
| `meet the deadline` | 締め切りに間に合う | ビジネス |
| `a merger` | 合併 | ビジネス |
| `a landlord` | 大家 | ビジネス |
| `a tracking number` | 追跡番号 | ビジネス |
| `a technical support team` | 技術サポートチーム | ビジネス |
| `a renovation project` | 改装計画 | ビジネス |
| `I'll get back to you by ...` | …までに折り返します | ビジネス |
| `a legal requirement` | 法的要件 | ビジネス |


#### 〜990

| 表現 | 意味 | 種類 |
|---|---|---|
| `Far be it from me to ...` | 私が…するなどとんでもない | 定型表現 |
| `bear out` | 裏付ける | 句動詞 |
| `hinge on` | …次第である | 句動詞 |
| `smooth over` | 丸く収める | 句動詞 |
| `face the music` | 報いを受ける | イディオム |
| `rub salt in the wound` | 傷口に塩を塗る | イディオム |
| `a drop in the bucket` | 焼け石に水 | イディオム |
| `for the most part` | 大部分は | イディオム |
| `a moot point` | 議論の余地のある点 | コロケーション |
| `set a precedent` | 前例を作る | コロケーション |
| `a vested interest` | 既得権益 | コロケーション |
| `a poor harvest` | 不作 | コロケーション |
| `Only then did I realize ...` | そのとき初めて…と気づいた | 文型パターン |
| `be reluctant to ...` | …したがらない | 文型パターン |
| `be tantamount to ...` | …に等しい | 文型パターン |
| `As is often the case, ...` | よくあることだが | 文型パターン |
| `inasmuch as ...` | …であるから | 談話標識 |
| `for all that` | それにもかかわらず | 談話標識 |
| `Enclosed herewith is ...` | 同封しております | ビジネス |
| `shall not be held responsible for ...` | …の責任を負わない | ビジネス |
| `a stakeholder` | 利害関係者 | ビジネス |
| `downsize` | 規模を縮小する | ビジネス |
| `subject to approval` | 承認を条件として | ビジネス |
| `Please accept our heartfelt condolences.` | 心よりお悔やみ申し上げます | ビジネス |
| `a tender` | 入札 | ビジネス |


## 6. 機能(functions)とドメイン(domains)

機能タグ: description(271)、reporting(102)、instruction(96)、request(88)、inquiry(80)、offer(56)、narration(51)、announcement(48)、suggestion(46)、cause/effect(36)、opinion(34)、thanks(28)、apology(28)、hedging(28)、directions(27)、warning(27)、agreement(26)、scheduling(26)、complaint(25)、greeting(22)、farewell(22)、obligation(21)、clarification(20)、ordering(17)、concession(16)、praise(15)、permission(15)、sympathy(14)、prediction(13)、emotion(13)、preference(12)、payment(12)、addition(12)、refusal(11)、summarizing(11)、contrast(10)、comparison(9)、condition(9)、emphasis(9)、disagreement(8)、introduction(7)、ability(7)、sequencing(7)、confirmation(7)、negotiation(6)、invitation(5)、congratulation(5)、regret(2)

ドメインタグ: society(223)、office(143)、transport(104)、shopping(82)、meetings(73)、food(70)、sales(63)、finance(63)、weather(60)、health(50)、law(49)、sea(48)、school(43)、money(43)、hotel(42)、abstract(41)、housing(40)、hr(40)、travel(29)、family(27)、emotion(24)、logistics(22)、body(21)、arts(20)、technology(18)、clothing(16)、cooking(16)、nature(12)、post(11)、media(7)、science(7)、farming(3)、crafts(2)

