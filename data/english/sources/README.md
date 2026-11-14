# sources/ — 取得したオープンデータ（外部データは信頼できない入力として扱う）

各サブディレクトリは取得元ごとに分離。`scripts/build_vocab.py` だけがこれらを読む（`python -I` 相当の方針で、実行コードは含まない純データのみ）。

| ディレクトリ | 内容 | 取得元 | ライセンス / 条件 |
|---|---|---|---|
| `cefrj/` | CEFR-J Vocabulary Profile v1.5（A1–B2, 約7,800行）、Octanove Vocabulary Profile C1/C2 v1.0（約2,100行） | https://github.com/openlanguageprofiles/olp-en-cefrj | CEFR-J: 東京外国語大学 投野研究室。研究・商用とも無償、**出典明記が条件**。Octanove C1/C2: CC BY-SA 4.0 |
| `ngsl-adapted/` | NGSL 1.2 の語形表、NGSL 31k 語彙の頻度順位 | https://github.com/InternetEnzyme/textmeter-ngsl （原典: Browne, Culligan & Phillips, New General Service List） | CC BY-SA 4.0（`LICENSE-DATA` 同梱。同リポジトリによる加工版） |
| `bsl-nawl-ngsl-tsl-processed/` | TSL（TOEIC Service List）, BSL（Business Service List）, NAWL（New Academic Word List）の見出し語と順位（`bsl.json` `nawl.json` `tsl.json`） | https://github.com/kizemi/processedData_bsl_nawl_ngsl_tsl （原典: Browne ら, newgeneralservicelist.com） | 原典は CC BY-SA 4.0。中継リポジトリ自体にはライセンス表示なし。**本プロジェクトでは見出し語と順位のみ使用**し、同JSONに含まれる `meaning_ejdict` 等の訳は使っていない |
| `ejdict/` | EJDict-hand（英和辞書 約45,000項目。日本語の語義の下書きに使用） | https://github.com/kujirahand/EJDict | パブリックドメイン（CC0 1.0）。`LICENSE` 同梱 |
| `ejdict-frequency/` | EJDict 付属の基本語リスト（850 / 2000 語） | 同上 | CC0 |
| `wordfreq-derived/` | `wordfreq`（Python パッケージ, 英語 large リスト）から書き出した上位6万語の頻度表（rank, word, Zipf値）。`scripts/build_freq.py` で再生成可 | https://pypi.org/project/wordfreq/ （Robyn Speer。Wikipedia, SUBTLEX, Web, Twitter, Reddit, Google Books 等の混合） | データ: CC BY-SA 4.0 / コード: Apache-2.0 |

ビルド時にのみ使用し、このディレクトリには複製していないもの:
- Princeton WordNet 3.0（品詞・語義数・上位語による分野推定。nltk_data の wordnet.zip を GitHub から取得。WordNet License）
- `lemminflect`（MIT。屈折形→原形の判定）, `nltk`（Apache-2.0）

## 取得できなかった / 使わなかったもの
- **newgeneralservicelist.com**（NGSL/TSL/BSL/NAWL の公式配布元）: プロキシが 403 を返し取得不可。上記の GitHub 上の再配布物で代替。
- **Oxford 3000/5000（GitHub 上に複製あり）**: 出版社(OUP)の著作物であり、商用単語帳の複製に当たるおそれがあるため**使用していない**。
- **学習指導要領／中学・高校の語彙表**: GitHub を検索したが、再利用可能な形のものは見つからなかった。代わりに CEFR-J（日本の英語教育向けに作られたリスト）と EJDict の基本語リストを「学校での重要度」の代理指標にした。
- Google 10k / SUBTLEX 単体: 直接は取得せず、`wordfreq` に含まれる頻度で代替。
