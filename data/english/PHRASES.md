# 英語の言い回し・文法リスト(英検 / TOEIC L&R レベル別)

このファイルは `phrases.json` と `grammar.json` から `scripts/gen_md.py` で自動生成された要約です。
元データの編集は `scripts/src/*.txt` で行い、`scripts/build.py` → `scripts/validate_phrases.py` → `scripts/gen_md.py` の順に実行してください。

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
3. TOEIC 帯は、**項目ごとに個別に判断して**元データ(`scripts/src/*.txt`)に付けている。`build.py` による機械的な調整は行わない。基準は「TOEIC L&R の職場・店・旅行などの場面で、その表現がどの程度の頻度で出る・知っているべきか」であり、英検グレードとは独立している。文学的・学術的・口語的すぎて TOEIC ではまず問われないものは `null` とした。ただし判断は一人(AI)による主観的なもので、公式な根拠はない。
4. 例文は AI が作成したもので、英語母語話者・日本語の専門家による校閲は受けていない。5級〜3級の例文は、語彙が基本語に収まるよう見直した(harbor・fisherman・ferry など場面色の強い語は、項目自体に必要な場合を除き置き換えた)が、機械的な語彙判定は参考値にとどまる。全体のうち約300項目を読み直して誤りを修正したが、残りは未校閲である。
5. 目標件数(累積 150 / 300 / 500 / 900 / 1,400 / 2,000 / 2,600)は下表の「目標累積」と比較できる。級の見直し(下位級への移動)を行ったため、新規件数は級ごとの当初計画とは一致しない。

## 3. 件数

### 3.1 英検グレード別(新規 / 累積 / 目標累積)

| グレード | 新規 | 累積 | 目標累積 |
|---|---|---|---|
| 5級 | 167 | 167 | 150 |
| 4級 | 159 | 326 | 300 |
| 3級 | 173 | 499 | 500 |
| 準2級 | 411 | 910 | 900 |
| 2級 | 531 | 1441 | 1400 |
| 準1級 | 564 | 2005 | 2000 |
| 1級 | 575 | 2580 | 2600 |


### 3.2 英検グレード × 種類

| グレード | 定型表現 | 句動詞 | イディオム | コロケーション | 文型パターン | 談話標識 | ビジネス | 計 |
|---|---|---|---|---|---|---|---|---|
| 5級 | 122 | 10 | 2 | 22 | 11 | 0 | 0 | 167 |
| 4級 | 70 | 17 | 10 | 23 | 31 | 8 | 0 | 159 |
| 3級 | 52 | 24 | 13 | 37 | 39 | 8 | 0 | 173 |
| 準2級 | 75 | 55 | 35 | 67 | 53 | 22 | 104 | 411 |
| 2級 | 53 | 86 | 49 | 80 | 63 | 37 | 163 | 531 |
| 準1級 | 34 | 87 | 83 | 112 | 46 | 26 | 176 | 564 |
| 1級 | 25 | 92 | 114 | 135 | 69 | 45 | 95 | 575 |
| 計 | 431 | 371 | 306 | 476 | 312 | 146 | 538 | 2580 |


### 3.3 TOEIC 帯 × 種類

| 帯 | 定型表現 | 句動詞 | イディオム | コロケーション | 文型パターン | 談話標識 | ビジネス | 計 |
|---|---|---|---|---|---|---|---|---|
| 〜400 | 187 | 32 | 22 | 54 | 58 | 9 | 6 | 368 |
| 〜500 | 96 | 28 | 16 | 39 | 26 | 10 | 79 | 294 |
| 〜600 | 57 | 82 | 52 | 69 | 56 | 36 | 115 | 467 |
| 〜730 | 32 | 50 | 18 | 69 | 39 | 11 | 156 | 375 |
| 〜860 | 21 | 81 | 100 | 132 | 57 | 31 | 88 | 510 |
| 〜990 | 6 | 44 | 27 | 50 | 35 | 31 | 92 | 285 |
| なし | 32 | 54 | 71 | 63 | 41 | 18 | 2 | 281 |


### 3.4 英検グレード × TOEIC 帯

| グレード | 〜400 | 〜500 | 〜600 | 〜730 | 〜860 | 〜990 |
|---|---|---|---|---|---|---|
| 5級 | 148 | 0 | 0 | 0 | 0 | 0 |
| 4級 | 100 | 50 | 1 | 0 | 0 | 0 |
| 3級 | 104 | 26 | 33 | 1 | 0 | 0 |
| 準2級 | 16 | 182 | 158 | 39 | 0 | 0 |
| 2級 | 0 | 26 | 219 | 176 | 98 | 1 |
| 準1級 | 0 | 10 | 56 | 159 | 295 | 29 |
| 1級 | 0 | 0 | 0 | 0 | 117 | 255 |


### 3.5 文法項目数

| グレード | 5級 | 4級 | 3級 | 準2級 | 2級 | 準1級 | 1級 | 計 |
|---|---|---|---|---|---|---|---|---|
| 項目数 | 28 | 31 | 43 | 65 | 67 | 34 | 34 | 302 |


| TOEIC 帯 | 〜400 | 〜500 | 〜600 | 〜730 | 〜860 | 〜990 | 計 |
|---|---|---|---|---|---|---|---|
| 項目数 | 36 | 57 | 70 | 62 | 46 | 14 | 302 |


## 4. 文法項目の進行表

### 4.1 英検グレード別

**5級(中学1年・28項目)**: be動詞の現在形、be動詞の否定文・疑問文、一般動詞の現在形、do / does を使う疑問文・否定文、3単現のs、名詞の複数形、冠詞(a / an / the)、人称代名詞(主格・目的格・所有格)、所有格('s)、this / that / these / those、命令文、Let's ...(誘い)、疑問詞を使った疑問文、how many / how much、can(能力・許可)、現在進行形、過去形(be動詞・規則動詞)、過去形(不規則動詞)、過去形の否定文・疑問文、There is / There are、場所・時の前置詞(in / on / at)、頻度の副詞、数えられる名詞・数えられない名詞(基本)、数と序数、like / want / need などの基本動詞、形容詞の位置、時を表す語句、and / but / or

**4級(中学2年・31項目)**: be going to(予定・予測)、will(未来・意志)、must / have to(義務)、must not と don't have to、should(助言)、may(許可・可能性)、would like(丁寧な希望)、不定詞の名詞的用法、不定詞の副詞的用法(目的)、不定詞の形容詞的用法、動名詞(目的語)、動名詞(主語)、不定詞・動名詞のどちらをとるか、比較級、最上級、as ... as(同等比較)、不規則な比較級・最上級、過去進行形、when / because / if(副詞節)、that節、so ... that、too ... to、something / anything + 形容詞、感嘆文、動詞・前置詞のあとの目的格、受動態(基本)、here / there など場所の副詞、had to(過去の義務)、SVOO文型、SVC文型(look / feel など)、call / name(SVOC)

**3級(中学3年・43項目)**: 現在完了(経験)、現在完了(完了・結果)、現在完了(継続)、現在完了進行形、受動態(過去・未来・助動詞)、受動態(by + 行為者)、関係代名詞(who / which / that)、関係代名詞の省略(目的格)、関係副詞(where / when)、間接疑問文、付加疑問文、分詞の形容詞的用法、感情を表す分詞形容詞、SVO + to不定詞、It is ... to V(形式主語)、使役・知覚(make / let / help)、I wish + 仮定法過去、条件文(現実的)、時の接続詞、前置詞と接続詞(during / while 等)、時の前置詞 since / for / during、前置詞 + 動名詞、used to(以前は…した)、be used to -ing(…に慣れている)、So do I / Neither do I、再帰代名詞(-self)、each / every / all / both、few / a few / little / a little、many / much / a lot of、enough / too / very、as soon as / until / by(時)、whether / if(…かどうか)、相関接続詞(基本)、品詞の選択:名詞の語尾、品詞の選択:形容詞の語尾、品詞の選択:副詞(-ly)、to のあとの動詞の原形(不定詞)、前置詞のあとの -ing 形、助動詞のあとの動詞の原形、連結動詞のあとの形容詞(become / remain / seem)、分詞形容詞(-ing と -ed の選択)、代名詞の格の選択(主格・目的格・所有格)、所有格と所有代名詞

**準2級(高校中級・65項目)**: 過去完了、過去完了進行形、未来完了、未来進行形、時制の一致、話法(直接・間接)、仮定法過去、仮定法のwere、条件文(現実と非現実)、助動詞 + have p.p.、助動詞(確信度)、関係代名詞 what、関係代名詞 whose、前置詞 + 関係代名詞、非制限用法(関係詞の継続用法)、比較級の相関(the more ..., the better)、比較級の強調(much / far / even)、倍数表現、最上級の構文(one of the + 最上級 + 複数名詞)、分詞構文(基本)、完了分詞構文(having + p.p.)、付帯状況 with、使役(have / get + O + p.p. / V)、知覚動詞、remember / forget / stop + to V / -ing、It is said that ...(受動態の形式主語)、be to V(予定・義務)、be about to / be likely to、not only A but also B、either / neither / both(代名詞)、some / any / no / none、so と such の使い分け、譲歩の前置詞と接続詞、because と because of、during と while(前置詞と接続詞)、接続副詞と接続詞(however / although)、within と in / for(期間の表し方)、理由を表す前置詞句(due to / owing to / thanks to)、between と among、形容詞 + 前置詞の組み合わせ、動詞 + 前置詞の組み合わせ、過去を表す語句と過去形(yesterday / last / ago)、by the time(…するまでに)と時制、主語と動詞の一致(間に挟まる語句)、能動態と受動態の選択、動名詞だけをとる動詞、不定詞だけをとる動詞、who と whom、number と amount(可算・不可算)、比較級の選択、最上級の選択、already と yet、still / just / recently の使い分け、most / almost / mostly、whether と if、other / another / the other、each / every のあとの単数名詞、冠詞の選択、前置詞の to のあとの -ing 形、複合名詞(名詞 + 名詞)、Part 6の文挿入:逆接のつなぎ表現、Part 6の文挿入:追加のつなぎ表現、Part 6の文挿入:結果のつなぎ表現、お知らせ文の未来表現(will / be scheduled to)、お知らせ文の完了表現(has been + p.p.)

**2級(高校卒業・67項目)**: 仮定法過去完了、混合仮定法、if を使わない仮定(otherwise / but for)、as if(まるで…のように)、I wish + 仮定法過去完了、If it were not for ...(…がなければ)、It is time + 仮定法過去、wish と hope の違い、分詞構文(接続詞の意味)、独立分詞構文、分詞構文の否定、否定副詞の倒置、So / Neither の倒置、Only + 副詞句の倒置、if の省略による倒置、強調構文(It is ... that ...)、疑問詞を使った分裂文、同格の that 節、which が前の文全体を受ける、複合関係詞(whoever / whatever)、複合関係副詞(however / wherever / whenever)、no matter what / how、譲歩・対比の接続詞、完了不定詞、動名詞の受動・完了形、動名詞の意味上の主語、不定詞の否定・独立不定詞、get 受動態、二重目的語の受動態、助動詞・進行形の受動態、句動詞の受動態、使役動詞の整理、It takes / spend / cost の使い分け、borrow / lend / rent などの使い分け、make と do の使い分け、say / tell / speak / talk、他動詞と自動詞(raise / rise / lay / lie)、used to と would(過去の習慣)、had better、would rather、need / dare(助動詞用法)、ought to、提案・要求を表す動詞のあとの原形(仮定法現在)、形容詞のあとの that 節の原形、名詞 + to V / that(decision, plan, etc.)、副詞の位置、enough / too の語順、間接目的語の語順、省略と代用(so / not / one / do so)、並列構造、付加疑問文の応用、名詞節、There + 動詞のバリエーション、So do I / Neither do I(複雑な時制)、the + 形容詞(…の人々)、分数・割合の表現、比較級・最上級の誤用、the same as / similar to / different from、prefer の構文、It is no use -ing / be worth -ing / cannot help -ing、疑問詞 + to 不定詞、spend / be busy -ing、prevent O from -ing、感謝・非難の for、regret / remember の使い分け、慣用的な前置詞句(in charge of / on behalf of)、慣用的な前置詞句(in response to / in addition to)

**準1級(大学中級・34項目)**: If ... were to / should(未来の仮定)、as if + 過去完了、It's time + 過去形 / would rather + 過去形、suppose / what if、otherwise(過去への仮定)、So + 形容詞 + 倒置、否定の副詞句の倒置、場所を表す副詞の倒置、not so much A as B、no more than / no less than、more A than B(AというよりB)、2つのうちより…、まして…ない、最上級の慣用表現、having been + p.p.、付帯状況(with + O + C)、原形不定詞を伴う慣用句、in order to / so as to、too ... to / enough to の受動的意味、擬似関係代名詞(as / but)、what we call(いわゆる)、先行詞に all / only などがつく場合は that、前置詞が文末の関係詞節、名詞化表現(the + 名詞 + of)、無生物主語構文、may well / might as well、It is + 形容詞(人の性質) + of + 人 + to V、It is + 形容詞 + for + 人 + to V(状況を表す形容詞)、have + O + V-ing(させておく)、There is no -ing、on -ing(…するとすぐに)、a number of / the number of の呼応、集合名詞の一致、neither A nor B の動詞の一致

**1級(大学上級・34項目)**: 文語的な倒置(Not until / No sooner)、So / Such で始まる倒置、譲歩の倒置(Young as he is, ...)、倒置による仮定(正式)、仮定法現在の固定表現、要求を表す that 節の受動態、could have p.p. / might have p.p.、形式主語 it の that 節、名詞 + 前置詞のコロケーション、比較節の省略、独立構文(with + 形容詞 / being 省略)、接続詞 + 分詞、挿入節、All + S + V + is ...、強調構文(副詞句)、名詞 + of(量を表す名詞)、不可算名詞(information / advice / equipment)、時・条件の副詞節の現在形(応用)、歴史的現在・物語の時制、状態動詞は進行形にしない、現在進行形で苛立ち(always)、代名詞による指示(this / that / such)、強意の do、否定の範囲・二重否定、主語と動詞の一致(複雑な場合)、無冠詞の慣用表現(by + 乗り物 / go to bed)、相関接続詞の倒置、wh- + on earth(いったい…)、省略表現(if any / if necessary)、準否定語、lest / for fear that、条件の接続詞、notwithstanding / albeit、関係詞節の短縮(分詞 / 形容詞句)

### 4.2 TOEIC 帯別

**〜400(36項目)**: be動詞の現在形、be動詞の否定文・疑問文、一般動詞の現在形、do / does を使う疑問文・否定文、3単現のs、名詞の複数形、冠詞(a / an / the)、人称代名詞(主格・目的格・所有格)、所有格('s)、this / that / these / those、命令文、Let's ...(誘い)、疑問詞を使った疑問文、how many / how much、can(能力・許可)、現在進行形、過去形(be動詞・規則動詞)、過去形(不規則動詞)、過去形の否定文・疑問文、There is / There are、場所・時の前置詞(in / on / at)、頻度の副詞、数えられる名詞・数えられない名詞(基本)、数と序数、like / want / need などの基本動詞、形容詞の位置、時を表す語句、and / but / or、be going to(予定・予測)、will(未来・意志)、would like(丁寧な希望)、不規則な比較級・最上級、動詞・前置詞のあとの目的格、here / there など場所の副詞、many / much / a lot of、make と do の使い分け

**〜500(57項目)**: must / have to(義務)、must not と don't have to、should(助言)、may(許可・可能性)、不定詞の名詞的用法、不定詞の副詞的用法(目的)、不定詞の形容詞的用法、動名詞(目的語)、動名詞(主語)、不定詞・動名詞のどちらをとるか、比較級、最上級、as ... as(同等比較)、過去進行形、when / because / if(副詞節)、that節、受動態(基本)、had to(過去の義務)、SVC文型(look / feel など)、現在完了(経験)、現在完了(完了・結果)、現在完了(継続)、受動態(過去・未来・助動詞)、受動態(by + 行為者)、関係代名詞(who / which / that)、間接疑問文、It is ... to V(形式主語)、条件文(現実的)、時の接続詞、時の前置詞 since / for / during、So do I / Neither do I、再帰代名詞(-self)、each / every / all / both、few / a few / little / a little、enough / too / very、as soon as / until / by(時)、相関接続詞(基本)、品詞の選択:名詞の語尾、品詞の選択:形容詞の語尾、品詞の選択:副詞(-ly)、助動詞のあとの動詞の原形、代名詞の格の選択(主格・目的格・所有格)、最上級の構文(one of the + 最上級 + 複数名詞)、some / any / no / none、because と because of、during と while(前置詞と接続詞)、過去を表す語句と過去形(yesterday / last / ago)、already と yet、each / every のあとの単数名詞、冠詞の選択、It takes / spend / cost の使い分け、borrow / lend / rent などの使い分け、say / tell / speak / talk、had better、enough / too の語順、比較級・最上級の誤用、感謝・非難の for

**〜600(70項目)**: so ... that、too ... to、something / anything + 形容詞、SVOO文型、call / name(SVOC)、現在完了進行形、関係代名詞の省略(目的格)、関係副詞(where / when)、付加疑問文、分詞の形容詞的用法、感情を表す分詞形容詞、SVO + to不定詞、使役・知覚(make / let / help)、前置詞と接続詞(during / while 等)、前置詞 + 動名詞、used to(以前は…した)、be used to -ing(…に慣れている)、whether / if(…かどうか)、to のあとの動詞の原形(不定詞)、前置詞のあとの -ing 形、連結動詞のあとの形容詞(become / remain / seem)、分詞形容詞(-ing と -ed の選択)、所有格と所有代名詞、過去完了、話法(直接・間接)、条件文(現実と非現実)、助動詞(確信度)、関係代名詞 what、関係代名詞 whose、比較級の相関(the more ..., the better)、比較級の強調(much / far / even)、倍数表現、be about to / be likely to、either / neither / both(代名詞)、so と such の使い分け、譲歩の前置詞と接続詞、within と in / for(期間の表し方)、主語と動詞の一致(間に挟まる語句)、能動態と受動態の選択、動名詞だけをとる動詞、不定詞だけをとる動詞、比較級の選択、最上級の選択、still / just / recently の使い分け、most / almost / mostly、other / another / the other、Part 6の文挿入:追加のつなぎ表現、お知らせ文の未来表現(will / be scheduled to)、So / Neither の倒置、譲歩・対比の接続詞、get 受動態、助動詞・進行形の受動態、would rather、ought to、副詞の位置、間接目的語の語順、付加疑問文の応用、名詞節、So do I / Neither do I(複雑な時制)、the same as / similar to / different from、prefer の構文、疑問詞 + to 不定詞、spend / be busy -ing、prevent O from -ing、in order to / so as to、a number of / the number of の呼応、不可算名詞(information / advice / equipment)、時・条件の副詞節の現在形(応用)、状態動詞は進行形にしない、主語と動詞の一致(複雑な場合)

**〜730(62項目)**: I wish + 仮定法過去、過去完了進行形、未来完了、未来進行形、時制の一致、仮定法過去、仮定法のwere、助動詞 + have p.p.、非制限用法(関係詞の継続用法)、分詞構文(基本)、使役(have / get + O + p.p. / V)、知覚動詞、remember / forget / stop + to V / -ing、It is said that ...(受動態の形式主語)、be to V(予定・義務)、not only A but also B、接続副詞と接続詞(however / although)、理由を表す前置詞句(due to / owing to / thanks to)、between と among、形容詞 + 前置詞の組み合わせ、動詞 + 前置詞の組み合わせ、by the time(…するまでに)と時制、number と amount(可算・不可算)、whether と if、複合名詞(名詞 + 名詞)、Part 6の文挿入:逆接のつなぎ表現、Part 6の文挿入:結果のつなぎ表現、お知らせ文の完了表現(has been + p.p.)、仮定法過去完了、as if(まるで…のように)、I wish + 仮定法過去完了、wish と hope の違い、分詞構文(接続詞の意味)、疑問詞を使った分裂文、which が前の文全体を受ける、複合関係詞(whoever / whatever)、複合関係副詞(however / wherever / whenever)、no matter what / how、不定詞の否定・独立不定詞、二重目的語の受動態、句動詞の受動態、使役動詞の整理、他動詞と自動詞(raise / rise / lay / lie)、used to と would(過去の習慣)、名詞 + to V / that(decision, plan, etc.)、省略と代用(so / not / one / do so)、並列構造、There + 動詞のバリエーション、the + 形容詞(…の人々)、分数・割合の表現、It is no use -ing / be worth -ing / cannot help -ing、regret / remember の使い分け、suppose / what if、no more than / no less than、前置詞が文末の関係詞節、It is + 形容詞(人の性質) + of + 人 + to V、It is + 形容詞 + for + 人 + to V(状況を表す形容詞)、集合名詞の一致、neither A nor B の動詞の一致、could have p.p. / might have p.p.、名詞 + of(量を表す名詞)、無冠詞の慣用表現(by + 乗り物 / go to bed)

**〜860(46項目)**: 前置詞 + 関係代名詞、完了分詞構文(having + p.p.)、付帯状況 with、who と whom、前置詞の to のあとの -ing 形、混合仮定法、if を使わない仮定(otherwise / but for)、If it were not for ...(…がなければ)、It is time + 仮定法過去、分詞構文の否定、if の省略による倒置、強調構文(It is ... that ...)、同格の that 節、完了不定詞、動名詞の受動・完了形、動名詞の意味上の主語、提案・要求を表す動詞のあとの原形(仮定法現在)、形容詞のあとの that 節の原形、慣用的な前置詞句(in charge of / on behalf of)、慣用的な前置詞句(in response to / in addition to)、If ... were to / should(未来の仮定)、as if + 過去完了、It's time + 過去形 / would rather + 過去形、otherwise(過去への仮定)、not so much A as B、2つのうちより…、having been + p.p.、付帯状況(with + O + C)、too ... to / enough to の受動的意味、what we call(いわゆる)、先行詞に all / only などがつく場合は that、名詞化表現(the + 名詞 + of)、無生物主語構文、may well / might as well、on -ing(…するとすぐに)、形式主語 it の that 節、名詞 + 前置詞のコロケーション、接続詞 + 分詞、All + S + V + is ...、代名詞による指示(this / that / such)、強意の do、否定の範囲・二重否定、省略表現(if any / if necessary)、準否定語、条件の接続詞、関係詞節の短縮(分詞 / 形容詞句)

**〜990(14項目)**: 独立分詞構文、否定副詞の倒置、Only + 副詞句の倒置、need / dare(助動詞用法)、So + 形容詞 + 倒置、否定の副詞句の倒置、more A than B(AというよりB)、最上級の慣用表現、倒置による仮定(正式)、要求を表す that 節の受動態、独立構文(with + 形容詞 / being 省略)、挿入節、強調構文(副詞句)、相関接続詞の倒置

TOEIC Part 5/6 向けの項目(品詞の選択、前置詞と接続詞、時制、代名詞の格、数量表現など)は、名前が `TOEIC Part 5:` / `TOEIC Part 6:` で始まる項目として収録している。1つの項目には1つの規則だけを入れ、複数の規則をまとめていたものは分割した。

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
| `Thank you for waiting.` | お待たせしました | 定型表現 |
| `I'm afraid we're sold out.` | あいにく売り切れです | 定型表現 |
| `Why don't we ...?` | …しませんか | 定型表現 |
| `Take this medicine twice a day.` | この薬を1日2回飲んでください | 定型表現 |
| `A one-way ticket, please.` | 片道切符をください | 定型表現 |
| `Is breakfast included?` | 朝食は含まれていますか | 定型表現 |
| `I'd like to exchange this.` | これを交換したいのですが | 定型表現 |
| `Can I open an account?` | 口座を開けますか | 定型表現 |
| `take out` | 取り出す・持ち帰る | 句動詞 |
| `show up` | 現れる | 句動詞 |
| `drop by` | 立ち寄る | 句動詞 |
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
| `Take it easy.` | 無理しないで | 定型表現 |
| `I'm sorry for being late.` | 遅れてすみません | 定型表現 |
| `Could you split the bill?` | 別々に払えますか | 定型表現 |
| `The sea is rough today.` | 今日は海が荒れています | 定型表現 |
| `What a pity!` | なんて残念な | 定型表現 |
| `sign up for` | …に申し込む | 句動詞 |
| `calm down` | 落ち着く | 句動詞 |
| `get in` | (車などに)乗り込む | 句動詞 |
| `by the end of ...` | …の終わりまでに | イディオム |
| `out of breath` | 息を切らして | イディオム |
| `run a shop` | 店を経営する | コロケーション |
| `a traffic jam` | 渋滞 | コロケーション |
| `make a wish` | 願い事をする | コロケーション |
| `lose weight` | やせる | コロケーション |
| `be willing to ...` | 喜んで…する | 文型パターン |
| `the same ... as ...` | …と同じ… | 文型パターン |
| `be sure to ...` | 必ず…する | 文型パターン |
| `on the whole` | 全体として | 談話標識 |
| `actually` | 実は | 談話標識 |
| `I'd be happy to ...` | 喜んで…します | ビジネス |
| `Let me check and get back to you.` | 確認して折り返します | ビジネス |
| `I'd like to place an order.` | 注文をしたいのですが | ビジネス |
| `Please arrive ten minutes early.` | 10分前にお越しください | ビジネス |
| `Let's get started.` | 始めましょう | ビジネス |
| `Please line up here.` | こちらに並んでください | ビジネス |


#### 2級(高校卒業)

| 表現 | 意味 | 種類 |
|---|---|---|
| `I'm not so sure.` | あまり確信がありません | 定型表現 |
| `It's out of my hands.` | 私にはどうにもできません | 定型表現 |
| `get through` | 切り抜ける・電話が通じる | 句動詞 |
| `drop off` | 届ける・減る | 句動詞 |
| `get down to` | (仕事などに)取りかかる | 句動詞 |
| `tell off` | 叱る | 句動詞 |
| `once in a while` | ときどき | イディオム |
| `to a large extent` | 大部分は | イディオム |
| `take responsibility for` | …の責任を取る | コロケーション |
| `a good deal` | お買い得 | コロケーション |
| `lose sight of` | 見失う | コロケーション |
| `set an example` | 手本を示す | コロケーション |
| `no later than ...` | 遅くとも…までに | 文型パターン |
| `be familiar with ...` | …に詳しい | 文型パターン |
| `the moment ...` | …するとすぐに | 文型パターン |
| `in contrast` | 対照的に | 談話標識 |
| `strictly speaking` | 厳密に言えば | 談話標識 |
| `Thank you for your inquiry.` | お問い合わせありがとうございます | ビジネス |
| `We have received your payment.` | お支払いを確認しました | ビジネス |
| `I have a conflict.` | 予定が重なっています | ビジネス |
| `annual meeting` | 年次総会 | ビジネス |
| `draw up a contract` | 契約書を作成する | ビジネス |
| `We look forward to serving you.` | ご利用をお待ちしております | ビジネス |
| `a user manual` | 取扱説明書 | ビジネス |
| `Shipping is included.` | 送料込みです | ビジネス |


#### 準1級(大学中級)

| 表現 | 意味 | 種類 |
|---|---|---|
| `Let me sleep on it.` | 一晩考えさせてください | 定型表現 |
| `You can say that again.` | まったくそのとおり | 定型表現 |
| `cut back on` | 削減する | 句動詞 |
| `chip in` | (お金を)出し合う・協力する | 句動詞 |
| `hold on to` | しっかりつかむ・手放さない | 句動詞 |
| `stop by` | 立ち寄る | 句動詞 |
| `in the wake of ...` | …の後に | イディオム |
| `to say the least` | 控えめに言っても | イディオム |
| `on the same page` | 認識が一致して | イディオム |
| `go all out` | 全力を尽くす | イディオム |
| `a vital role` | 重要な役割 | コロケーション |
| `by means of ...` | …によって | コロケーション |
| `a compelling reason` | やむにやまれぬ理由 | コロケーション |
| `disposable income` | 可処分所得 | コロケーション |
| `withdraw an offer` | 申し出を撤回する | コロケーション |
| `What is more, ...` | さらに | 文型パターン |
| `in proportion to ...` | …に比例して | 文型パターン |
| `in a sense` | ある意味で | 談話標識 |
| `we are unable to accommodate ...` | …に対応できません | ビジネス |
| `a complimentary ...` | 無料の… | ビジネス |
| `a tax refund` | 税金の還付 | ビジネス |
| `table the discussion` | 議論を先送りする | ビジネス |
| `a bank statement` | 銀行の取引明細 | ビジネス |
| `a bill of lading` | 船荷証券 | ビジネス |
| `a cancellation fee` | キャンセル料 | ビジネス |


#### 1級(大学上級)

| 表現 | 意味 | 種類 |
|---|---|---|
| `I trust this finds you well.` | お元気でお過ごしのことと存じます | 定型表現 |
| `pore over` | 熟読する | 句動詞 |
| `come to terms with` | (事実などを)受け入れる | 句動詞 |
| `mark down` | 値下げする | 句動詞 |
| `stand in for` | 代理を務める | 句動詞 |
| `on the fence` | 態度を決めかねて | イディオム |
| `call a spade a spade` | はっきりものを言う | イディオム |
| `grasp at straws` | わらにもすがる | イディオム |
| `out of the woods` | 危機を脱して | イディオム |
| `the writing is on the wall` | 破局の兆しは明らかだ | イディオム |
| `a vested interest` | 既得権益 | コロケーション |
| `soaring costs` | 急騰するコスト | コロケーション |
| `a plea bargain` | 司法取引 | コロケーション |
| `a groundbreaking discovery` | 画期的な発見 | コロケーション |
| `a blind spot` | 盲点 | コロケーション |
| `an exorbitant price` | 法外な値段 | コロケーション |
| `be conducive to ...` | …に役立つ | 文型パターン |
| `Young as he is, ...` | 彼は若いけれども | 文型パターン |
| `barring ...` | …がなければ | 文型パターン |
| `be that as it may` | それはそうとして | 談話標識 |
| `in its own right` | それ自体で・独自に | 談話標識 |
| `due diligence` | デューデリジェンス(適正評価) | ビジネス |
| `a patent application` | 特許出願 | ビジネス |
| `restructuring` | 再編・リストラ | ビジネス |
| `collateral` | 担保 | ビジネス |


### 5.2 TOEIC 帯別

#### 〜400

| 表現 | 意味 | 種類 |
|---|---|---|
| `How are you?` | お元気ですか | 定型表現 |
| `Here you are.` | はい、どうぞ(手渡し) | 定型表現 |
| `How much is this?` | これはいくらですか | 定型表現 |
| `Me, too.` | 私もです | 定型表現 |
| `I want ...` | …がほしい | 定型表現 |
| `Turn right.` | 右に曲がって | 定型表現 |
| `That's good.` | それはいいね | 定型表現 |
| `That sounds good.` | いいですね | 定型表現 |
| `What do you do?` | お仕事は何ですか | 定型表現 |
| `Speaking.` | 私です(電話) | 定型表現 |
| `It was nice talking to you.` | お話しできてよかったです | 定型表現 |
| `How can I get to ... from here?` | ここから…へはどう行けばいいですか | 定型表現 |
| `turn on` | つける | 句動詞 |
| `put away` | 片付ける | 句動詞 |
| `on time` | 時間どおりに | イディオム |
| `listen to music` | 音楽を聞く | コロケーション |
| `write a letter` | 手紙を書く | コロケーション |
| `pay attention to` | …に注意を払う | コロケーション |
| `be famous for` | …で有名だ | コロケーション |
| `I go to ... by bus.` | バスで…へ行きます | 文型パターン |
| `as ... as ...` | …と同じくらい… | 文型パターン |
| `the man who ...` | …する男性 | 文型パターン |
| `help someone ...` | …が…するのを手伝う | 文型パターン |
| `first` | まず | 談話標識 |
| `Staff only.` | 関係者以外立入禁止 | ビジネス |


#### 〜500

| 表現 | 意味 | 種類 |
|---|---|---|
| `Here's your change.` | おつりです | 定型表現 |
| `How long will it take?` | どのくらいかかりますか(所要) | 定型表現 |
| `I'd like to check in.` | チェックインしたいのですが | 定型表現 |
| `Is there anything I can do for you?` | 何かお手伝いできますか | 定型表現 |
| `It's not your fault.` | あなたのせいではありません | 定型表現 |
| `How would you like to pay?` | お支払いはどうなさいますか | 定型表現 |
| `What can I get you?` | 何をお持ちしましょうか | 定型表現 |
| `Make yourself comfortable.` | 楽にしてください | 定型表現 |
| `find out about` | …について知る | 句動詞 |
| `eat out` | 外食する | 句動詞 |
| `so far` | 今までのところ | イディオム |
| `in public` | 人前で・公共の場で | イディオム |
| `have a fever` | 熱がある | コロケーション |
| `a part-time job` | アルバイト | コロケーション |
| `tell the truth` | 本当のことを言う | コロケーション |
| `how to ...` | …のしかた | 文型パターン |
| `not as ... as ...` | …ほど…ない | 文型パターン |
| `unfortunately` | 残念ながら | 談話標識 |
| `Thank you for contacting us.` | お問い合わせありがとうございます | ビジネス |
| `Your order has been shipped.` | ご注文の品は発送されました | ビジネス |
| `The store will be open until ...` | 店は…まで営業します | ビジネス |
| `Please have your ticket ready.` | 切符をご用意ください | ビジネス |
| `Your total comes to ...` | 合計は…になります | ビジネス |
| `Please present your ticket.` | チケットをご提示ください | ビジネス |
| `Your request has been received.` | ご依頼を受け付けました | ビジネス |


#### 〜600

| 表現 | 意味 | 種類 |
|---|---|---|
| `What's the exchange rate today?` | 今日の為替レートは? | 定型表現 |
| `I can't thank you enough.` | 感謝しきれません | 定型表現 |
| `That sounds reasonable.` | 妥当ですね | 定型表現 |
| `turn up` | 現れる・音量を上げる | 句動詞 |
| `come up` | 持ち上がる | 句動詞 |
| `go over` | 見直す・確認する | 句動詞 |
| `fit in` | なじむ・都合をつける | 句動詞 |
| `at once` | すぐに・同時に | イディオム |
| `on the rise` | 増加している | イディオム |
| `on the house` | 店のおごりで | イディオム |
| `run out of time` | 時間がなくなる | コロケーション |
| `have an accident` | 事故に遭う | コロケーション |
| `take advantage of` | …を活用する | コロケーション |
| `a wide selection of` | 豊富な品ぞろえの | コロケーション |
| `I'm supposed to ...` | …することになっている | 文型パターン |
| `be afraid that ...` | (残念ながら)…と思う | 文型パターン |
| `be satisfied with ...` | …に満足している | 文型パターン |
| `in other words` | 言い換えれば | 談話標識 |
| `regarding` | …に関して | 談話標識 |
| `I'd like a late check-out.` | レイトチェックアウトをお願いします | ビジネス |
| `The shipment is expected to arrive on ...` | 荷物は…に到着予定です | ビジネス |
| `We're on schedule.` | 予定どおりです | ビジネス |
| `a press release` | プレスリリース | ビジネス |
| `a grand opening` | グランドオープン | ビジネス |
| `a delivery date` | 納期 | ビジネス |


#### 〜730

| 表現 | 意味 | 種類 |
|---|---|---|
| `Hang in there.` | がんばって | 定型表現 |
| `It's a deal.` | それで決まりです | 定型表現 |
| `use up` | 使い切る | 句動詞 |
| `speak up` | 大きな声で話す | 句動詞 |
| `give in` | 屈する・降参する | 句動詞 |
| `under pressure` | プレッシャーを受けて | イディオム |
| `take responsibility for` | …の責任を取る | コロケーション |
| `a reasonable price` | 手頃な価格 | コロケーション |
| `raise awareness` | 意識を高める | コロケーション |
| `a serious shortage` | 深刻な不足 | コロケーション |
| `face a challenge` | 課題に直面する | コロケーション |
| `depending on ...` | …によって | 文型パターン |
| `no later than ...` | 遅くとも…までに | 文型パターン |
| `What if ...?` | もし…だったらどうする | 文型パターン |
| `with regard to` | …に関して | 談話標識 |
| `I'm writing to inquire about ...` | …についてお問い合わせします | ビジネス |
| `We will look into the matter.` | その件を調べます | ビジネス |
| `be promoted to ...` | …に昇進する | ビジネス |
| `a reference` | 推薦人・照会先 | ビジネス |
| `Please be assured that ...` | …とご安心ください | ビジネス |
| `a sharp decline` | 急激な減少 | ビジネス |
| `I'd like to propose a toast.` | 乾杯を提案します | ビジネス |
| `a shift schedule` | シフト表 | ビジネス |
| `a product recall` | 製品回収 | ビジネス |
| `a refundable deposit` | 返金可能な保証金 | ビジネス |


#### 〜860

| 表現 | 意味 | 種類 |
|---|---|---|
| `Let me put it this way.` | こう言いましょう | 定型表現 |
| `turn to` | 頼る・(ページを)開く | 句動詞 |
| `back out` | (約束・計画から)手を引く | 句動詞 |
| `play down` | 軽く扱う・控えめに言う | 句動詞 |
| `pin down` | 特定する・確定する | 句動詞 |
| `to date` | 現在までに | イディオム |
| `hit the nail on the head` | 的を射る | イディオム |
| `on cloud nine` | 天にも昇る気持ちで | イディオム |
| `wear many hats` | いくつもの役目をこなす | イディオム |
| `on the back burner` | 後回しで | イディオム |
| `have a tendency to` | …する傾向がある | コロケーション |
| `for the sake of ...` | …のために | コロケーション |
| `sustainable development` | 持続可能な開発 | コロケーション |
| `an unprecedented scale` | 前例のない規模 | コロケーション |
| `an upward trend` | 上昇傾向 | コロケーション |
| `a key player` | 重要な担い手 | コロケーション |
| `be in the habit of ...ing` | …する習慣がある | 文型パターン |
| `It is widely believed that ...` | …と広く信じられている | 文型パターン |
| `in contrast to ...` | …と対照的に | 文型パターン |
| `that is to say` | つまり | 談話標識 |
| `alternatively` | あるいは | 談話標識 |
| `draw up a contract` | 契約書を作成する | ビジネス |
| `We sincerely apologize for any inconvenience this may cause.` | ご迷惑をおかけしたことを深くお詫びします | ビジネス |
| `table the discussion` | 議論を先送りする | ビジネス |
| `an inspection report` | 検査報告書 | ビジネス |


#### 〜990

| 表現 | 意味 | 種類 |
|---|---|---|
| `I'd be most grateful if ...` | …していただけると大変ありがたいです | 定型表現 |
| `sign off on` | 承認する | 句動詞 |
| `chalk up` | (成績・得点を)記録する | 句動詞 |
| `grapple with` | 取り組む・格闘する | 句動詞 |
| `stem from` | …に由来する | 句動詞 |
| `bend over backwards` | 最大限の努力をする | イディオム |
| `raise the bar` | 基準を引き上げる | イディオム |
| `a stark contrast` | 際立った対照 | コロケーション |
| `undergo a transformation` | 変貌を遂げる | コロケーション |
| `file a lawsuit` | 訴訟を起こす | コロケーション |
| `quell a rumor` | うわさを鎮める | コロケーション |
| `be superior to ...` | …より優れている | 文型パターン |
| `for fear that ...` | …を恐れて | 文型パターン |
| `barring ...` | …がなければ | 文型パターン |
| `insofar as ...` | …である限りにおいて | 談話標識 |
| `per se` | それ自体は | 談話標識 |
| `by way of ...` | …として・…経由で | 談話標識 |
| `R.S.V.P.` | ご返事をお願いします | ビジネス |
| `a letter of intent` | 基本合意書 | ビジネス |
| `a liability waiver` | 免責同意書 | ビジネス |
| `royalties` | 著作権使用料・ロイヤルティ | ビジネス |
| `operating expenses` | 営業費用 | ビジネス |
| `an equal opportunity employer` | 機会均等雇用主 | ビジネス |
| `a debtor` | 債務者 | ビジネス |
| `an endorsement` | 裏書・推薦 | ビジネス |


## 6. 機能(functions)とドメイン(domains)

機能タグ: description(579)、reporting(287)、instruction(151)、request(134)、narration(106)、inquiry(98)、offer(90)、suggestion(85)、announcement(71)、opinion(64)、cause/effect(59)、complaint(53)、warning(52)、hedging(47)、agreement(44)、apology(41)、obligation(40)、praise(38)、thanks(37)、clarification(36)、directions(29)、summarizing(28)、emphasis(27)、scheduling(26)、concession(25)、greeting(24)、farewell(23)、refusal(22)、sympathy(21)、addition(21)、permission(20)、prediction(19)、contrast(18)、ordering(17)、emotion(17)、condition(17)、preference(15)、comparison(15)、sequencing(14)、disagreement(12)、payment(12)、introduction(11)、invitation(9)、confirmation(9)、negotiation(8)、ability(7)、regret(6)、congratulation(5)、exemplifying(4)

ドメインタグ: society(358)、office(240)、sales(166)、finance(152)、meetings(143)、shopping(129)、law(125)、transport(124)、hr(106)、food(103)、weather(85)、sea(79)、health(73)、emotion(72)、hotel(70)、housing(68)、travel(63)、money(63)、school(60)、abstract(58)、family(42)、logistics(38)、technology(34)、arts(28)、cooking(25)、body(22)、farming(22)、nature(20)、clothing(19)、science(19)、media(16)、post(14)、crafts(9)

