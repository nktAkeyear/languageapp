# 港町の調香茶房 (languageapp)

A personal-use "decipherment" language game for Japanese speakers learning **English** or
**Mandarin Chinese** (simplified + pinyin) from zero. You run an inherited tea/spice shop in a
port town. Customers order in the target language, the predecessor's recipe book is written in
the target language, and the only feedback is the customer's reaction (target language), their
face and the shop's reputation. There are no translations. Game chrome (menus, hints, notebook
UI) is Japanese.

The code is split into a shared core (lexicon, word tracking, notebook, verification,
reputation, saves) and pluggable activities (`src/activities/<id>/`):

- **shop** (Phase 1): order → recipe book → workbench → reaction.
- **market** (Phase 2, opens around day 5 / early–mid A1): the shop runs short; a shopping note
  says what to buy; stalls have target-language price tags; vendors quote, give change, run out,
  haggle. Wrong item / quantity → the shelf runs out in the shop that day; overpaying → less money.
- **delivery** (Phase 2, opens around day 9 / late A1–A2): a slip says where (town map with
  signs; behind / across from / next to / left / right), when (morning, o'clock, before / after),
  to whom and how (knock twice, not the child, leave it at the door if nobody is home).

A day is a sequence of segments planned by `src/activities/day.ts` (e.g. 朝 market → 昼 shop →
夕方 delivery). Before the town activities open, a day is exactly the Phase 1 shop day.

## Commands

```bash
npm install
npm run dev               # Vite dev server
npm run build             # type-check + build → dist/index.html (single file, opens by double-click)
npm test                  # vitest (engine unit tests + seed-content validation)
npm run validate-content  # content validator; exits 1 on errors
npm run simulate -- zh 10 # simulated playthrough for content review: market notes + vendor talk, orders +
                          # reactions, delivery slips + reactions, story beats 📖 as they fire, the nightly
                          # ledger (args: lang days seed failEvery choice; e.g. `-- en 45 1 4 0`)
```

`dist/index.html` is self-contained (relative base + `vite-plugin-singlefile`): copy it anywhere
and open it with a browser. No network requests at runtime; saves live in `localStorage`
(key `minato-chabou-save`), with JSON export/import and per-language reset in ⚙ 設定.

## Layout

```
src/
  core/                 shared engine (no UI, no language-specific text)
    types.ts            content schema + runtime types  ← start here
    townTypes.ts        schema + runtime types of the town activities (market, delivery)
    tokenize.ts         text → lexicon ids (en: words/multi-words, zh: longest match)
    gamedata.ts         content + indexes per language, qty phrases, stage helpers
    srs.ts              hidden spaced repetition (per-word state)
    verification.ts     検証ページ logic
    levels.ts           現在地 (coverage per CEFR / 英検 / HSK level)
    save.ts             versioned save, migration, export/import
    validate.ts         content validator (used by script + tests)
    validateTown.ts     validator part for market / delivery content
  story/                story layer (UI-agnostic): types.ts (schema + save state), engine.ts (day hooks,
                        conditions, effects, cards), text.ts (name-aware tokens, readability),
                        vocab.ts (words met by stage), validate.ts, merge.ts (content merge)
  activities/
    index.ts            activity registry
    day.ts              day orchestration: segment planner (unlocks), stock-aware serving, end of day
    shop/               rules.ts (order rule evaluation), reactions.ts, templates.ts,
                        dayplan.ts (order picker), engine.ts (day loop)
    market/             rules.ts (needs, units, payment, stock), engine.ts (note, stalls, vendor talk)
    delivery/           rules.ts (map relations, time slots, evaluation), engine.ts (slips, door, reaction)
    town/text.ts        number / money phrases, placeholder filling, SRS-aware choice of phrasing
  content/
    index.ts            merges each language's town content (lexicon, verification pages) in
    shared/             language-neutral: ingredients, recipes, stages (unlock schedule)
    shared/town.ts      language-neutral town data: goods, stalls, map, time slots, curriculum, unlocks
    en/  zh/            lexicon.ts + index.ts (shop); town.ts = lexicon.town.ts + market.ts + delivery.ts
  ui/
    components/         small presentational components shared by both layouts
    components/town/    Market.tsx (note, purse, stalls, vendor talk, coins), Delivery.tsx (slip, map, door)
    components/story/   StoryLayer.tsx (scene / choice / chapter / document / ledger cards, 書類箱),
                        StoryText.tsx, story.css — mounted once per layout
    desktop/            PC layout (panels side by side)
    mobile/             phone layout (one panel + bottom tabs)
    useGame.tsx         React state/actions over the core
scripts/                validate-content.ts, simulate.ts (+ storyLog.ts)
```

The layout is chosen by viewport width (≤ 820px → mobile), overridable in settings.

## Content schema (for content authors)

All types are in `src/core/types.ts`. Content is TypeScript data (typed, so mistakes show up in
the editor and in `npm run build`). After any change run `npm run validate-content` and
`npm test`.

### Shared (`src/content/shared/`)

- **ingredients** — `IngredientDef { id, icon: {emoji}|{svg}, tags[], maxCount, qtyOrderable, neutral?, coldOnly? }`.
  Tags (`sweet sour bitter salty tea dairy spice cooling warming floral`) drive taste rules.
  `neutral` (water) is never an unwanted extra. Adding an ingredient also means adding its id to
  the `IngredientId` union.
- **recipes** — `RecipeDef { id, stage, rule, symptoms? }`. Names/pages are per language.
- **stages** — the unlock schedule: `{ stage, minDay, minReputation, ingredients[], features?, customersPerDay, newWordsPerDay, noteJa }`.
  Features: `temperature`, `method`, `audioOnly`. A stage opens when `day ≥ minDay` and
  `reputation ≥ minReputation`, or anyway `graceDays` after `minDay` (no hard gates).
  Thresholds are calibrated to the reputation deltas below: about 2.5 points a day early on,
  then 25 at day 11 plus 3.5 a day (stage 23 needs 123 on day 39), so a player who gets most
  cups right is never held back and one who fails about half waits for the grace days.

### Per language (`src/content/{en,zh}/`)

- **lexicon** — `LexEntry { id, text, forms?, pinyin? (zh), gloss (official Japanese), emoji?, pos, cefr, hsk? (zh, 1–6 or null), eiken? (en, grade or null), group }`.
  `forms` are extra surface forms (plurals, "said"). `group` is the 検証ページ id.
  zh pinyin uses citation tones (no sandhi marks).
- **verificationPages** — `{ id, labelJa, minEncounters? (default 3) }`. Each page must have 3–5
  lexicon words (via `group`) with distinct glosses. Glosses + emoji become the meaning cards.
- **numbers / temperatureWords / methodWords / tagWords** — map numbers, `hot|cold`,
  `steep|boil|stir` and taste tags to lexicon ids (used by templates, reactions and workbench labels).
- **ingredients** — `{ ingredient, word, qty?: { one?, other } }`. `qty` patterns use `{n}` for the
  number word: en `'{n} ginger slices'`, zh `'{n}片姜'`. Required when `qtyOrderable`.
- **recipeNames** (en lowercase: `{Recipe}` capitalises at a sentence start, `{recipe}` stays lowercase mid-sentence), **symptoms** (`{ symptom, phrases[] }`, whole sentences).
- **pages** — recipe book: `{ id, stage, kind: ingredient|recipe|note, ingredient?, recipe?, title, illustration?, lines: [{ text, icon?, style? }] }`.
- **customers** — `{ id, name (target language), avatar (emoji), stage }`.
- **orders** (authored, the curriculum spine) — `{ id, stage, seq?, customer?, text, audioOnly?, rule | recipe }`.
  Served in `stage`, `seq` order, within the day's new-word budget, until served perfectly.
- **templates** (endless review) — `{ id, stage, text, slots, rule?, audioOnly? (probability), weight? }`.
  Text placeholders `{slot}`; `{Slot}` capitalises (en). Slot kinds:
  `qty` (quantity phrase, requires exactly n), `ing` (requires ≥1), `forbid`, `temp`, `taste`
  (requires ≥1 of a tag), `notTaste` (forbids a tag), `symptom` (sentence → recipe rule),
  `recipe` (name → recipe rule). Fillers come only from ingredients/recipes unlocked at the
  player's stage; a template instance may introduce at most one unseen word.
- **reactions** — `{ id, kind, stage, text, face, when? }`. `kind` is `perfect`, `any_fail`
  (fallback) or an issue kind: `empty forbidden forbidden_tag wrong missing tag_missing extra
  wrong_temp too_much too_little tag_too_much wrong_method`. Placeholders: `{ing}/{Ing}`,
  `{tag}`, `{temp}/{Temp}`, `{method}/{Method}`. `when` can restrict to `returning`,
  `symptom`, `customer`, `ings`, `tags`; specific matches win over generic lines. The newest
  stage-appropriate line is chosen at random among equally specific candidates.
- **levelTargets** — cumulative vocabulary sizes per CEFR level and per exam level
  (en: 英検 grades, zh: HSK 1–6) for the 現在地 bars.

### Order rules

```ts
{ require?: [{ ing, min?, max? }],      // default min 1, max = ingredient maxCount
  requireTag?: [{ tag, min?, max? }],   // any ingredient with the tag counts (and is allowed)
  forbid?: IngredientId[], forbidTag?: Tag[],
  allow?: IngredientId[] | 'any', allowTag?: Tag[],   // extras that are fine
  temp?: 'hot' | 'cold', method?: 'steep' | 'boil' | 'stir' }
```

Anything else in the cup is an "extra". The most important issue picks the reaction
(priority: empty > forbidden > wrong ingredient > missing > extra > temperature > quantity > method).
Outcome: perfect (+1 rep, +2 for a returning customer), minor (only quantities/method off by one,
±0), fail (−1), bad (forbidden ingredient, −2). Non-perfect customers come back on a later day.

### Text and tokens

All in-world text is tokenized against the lexicon; every word must map to an entry (the
validator lists unknown words). Use `{surface|id}` to force a mapping, e.g.
`'I have a {cold|cold_illness}.'` (en "cold" is otherwise the temperature word).

### What the validator checks

Unique ids; lexicon fields per language (pinyin/HSK for zh, 英検 for en); every word belongs to
an existing 検証ページ of 3–5 words with distinct glosses; every word actually appears somewhere
(otherwise its page could never open); every text tokenizes fully; every ingredient/recipe/
customer reference exists; authored orders are satisfiable with the shelf and features of their
stage (constructs a witness brew); templates instantiate at their stage and at the final stage
and every instance tokenizes and is satisfiable; reaction placeholders are fillable and
tokenize for every ingredient/tag; unconditional stage-1 `perfect` and `any_fail` reactions
exist; stages are contiguous. It also warns about ambiguous surface forms and en/zh structural
differences.

## Town activities: content schema

Types are in `src/core/townTypes.ts`. Town content is kept in separate files so it can be
edited independently of the shop content; `src/content/index.ts` merges each language's
`town.lexicon` / `town.verificationPages` into the language content and attaches `town`
(and `SHARED.town`). Both halves are optional: without them the game is the shop only.

### Shared (`src/content/shared/town.ts`, `TownShared`)

- **Unlocks** (`market.unlock`, `delivery.unlock`): `{ minDay, minReputation, graceDays, chance, maxGap, noteJa }`.
  Keyed on day + reputation, never on shop stage numbers. Opens when `day ≥ minDay` and
  `reputation ≥ minReputation`, or anyway `graceDays` after `minDay`. Once open, the activity is
  on the day's plan the first day, then with probability `chance`, and at least every `maxGap` days.
- **Levels** `{ level, minRuns, features[], noteJa? }`: each activity's own difficulty, by runs
  completed. Market features: `change` (vendors give change ≤ `changeLimit`; before that,
  overpaying is simply lost), `soldOut` (a needed good is gone at its usual stall; the vendor
  names another stall by colour), `variants` (fresh/old, big/small offers; the note may ask for
  one), `cheaper` (a needed good is cheaper at a second stall; the note says so), `audioOnly`
  (some quotes are spoken only), `bargain`. Each market feature is forced the first run it is
  available, so it is always introduced. Delivery features: `relations` (next to / behind /
  across), `clock` (o'clock), `person`, `knock`, `leftRight`, `beforeAfter`, `avoid` ("not the
  child"), `absent` (nobody home).
- **Market**: `goods: { ingredient, portionsPerUnit, price, variants?: [base, other], stalls[] }`
  (stock is counted in workbench portions: slices per lemon, leaves per bunch…; the first stall is
  the usual one), `stalls: { id, colour, vendor, icon }` (distinct colours: stalls are named by
  colour), `variants: { id, portionsMult, priceMult }`, `coins`, `startMoney`, `income` (coins
  per shop cup by outcome), `changeLimit`.
- **Delivery**: `cols`, `rows`, `map: { id, col, row, landmark? | door }` (rows 0–1 north of the
  main street, 2–3 south; relations are computed from the grid and must point at exactly one
  house), `slots: { hour (24h), period }`, `persons: { id, icon }`, `tip`, and
  `curriculum: { id, level, seq, dest: { rel, landmark }, time?, give?, avoid?, knocks?, absent?, home? }`:
  language-neutral slips served in order until delivered perfectly; afterwards slips are generated
  from the unlocked features. `time` is `{ kind: 'period', period }` or `{ kind: 'at'|'before'|'after', hour }`.

### Per language (`src/content/{en,zh}/town.ts`, `TownContent`)

- **lexicon.town.ts**: `TOWN_LEXICON` (same `LexEntry` schema) + `TOWN_PAGES`. A word the shop
  lexicon already has (numbers, colours, family, today, before / after, zh 多少 / 家 / 在 …) is
  **not** repeated: town texts use the shop id. Town words may join shop 検証ページ (e.g. en
  `we` → `g10b`, `blue` / zh 蓝 → `g18a`) as long as every page keeps 3–5 words. A town word whose
  surface collides with a shop word of another meaning gets its own id and markup everywhere
  (en `{right|right_side}`, zh `{块|kuai_money}`).
- **numberText**: `n → number words` for 1–100 (generated in market.ts: en "twenty-three",
  zh 二十三, standalone 2 = 两). Numbers missing from the table are never generated.
- **colourWords**: colour → lexicon id.
- **market** (`MarketText`): `money` / `tagMoney` (`{ one?, other }` with `{n}` words / `{d}` digits),
  `stallRef` (`'the {c} stall'`, `'{c}那家'`), `variantWords`,
  `goods: { ingredient, name, qty: { base, fresh?, old?, big?, small? }, per }` (`qty` patterns
  use `{n}`; `per` uses `{price}`: `'{price} a bunch'`, `'{price}一把'`), `noteTitles`, `noteLine`
  (`'{Qty}.'`), `cheaperNotes` (`{g}`, `{stall}`), `lines` (vendor lines `{ id, kind, level, text, face }`;
  kinds `greet cheapHere askQty quote thanks overpaid change notEnough noChange soldOut soldOutTip
  bargainYes bargainNo`; placeholders `{g}` good, `{qty}`, `{total}`, `{change}`, `{stall}`;
  capitalised `{Qty}` capitalises), `stockReactions` (shop customer when a good ran out; `{ing}`).
- **delivery** (`DeliveryText`): `placeWords`, `personWords`, `periodWords` (→ lexicon ids),
  `dest: { at | next_to | behind | across | left | right: patterns with {p} }`,
  `time: { period: { morning | afternoon | evening: [...] }, at, before, after }` (`{n}` = 12-hour
  number, `{pp}` = period word of that hour, e.g. zh `'{pp}{n}点以前送到。'`), `give` (`{p}`),
  `giveNot` (`{p}`, `{q}`), `knock: { 2: [...], 3: [...] }`, `absent: { door, neighbour }`,
  `recipients: { id, name, avatar }` (names are not vocabulary), `reactions: { id, kind, level, text, face }`
  with kinds `perfect perfect_absent wrong_place too_early too_late wrong_time wrong_person
  avoided_person wrong_knock wrong_absent any_fail` (`{p}` / `{q}` = the persons on the slip).

Several phrasings per slot are welcome: the engine picks the one whose words are most due for
review (hidden SRS), with a small nudge for a phrasing that introduces one new word, so review
keeps working inside the town activities and rarer phrasings still get heard.

### Rules and consequences

- **Market**: the shop queue is planned first; the portions it needs (minimum per order + 2
  reserve) of up to `maxItems` goods become the shopping note, and those goods start the day at 0.
  What is bought becomes the shop's stock (shown on the shelf as 残りN / 品切れ), used up portion
  by portion; a customer whose order needs more than is left says so (`stockReactions`, −1 rep).
  Payment: exact → thanks; too little → refused and the total repeated; too much → kept by the
  vendor (before `change`), change given (≤ `changeLimit`) or refused. Shop cups earn coins
  (`income`; an unhappy customer still pays 1). Goods not in `goods` (water, ice, salt, the teas,
  cinnamon) are always in stock.
- **Delivery**: evaluated at the door. Priority: wrong place > too early / too late / wrong time >
  handed to the person to avoid (bad, −2) > wrong person > wrong absence handling > wrong knock
  (minor, ±0). Perfect: +2 rep and a tip; other failures −1. Failed curriculum slips come back.
- **SRS**: notes, vendor lines, price tags, slips, map signs and reactions count as encounters;
  a covered note line / exact payment / perfect delivery counts as correct use of its words; a
  mistake lapses the words of the line it concerns (the note line, the quote's numbers, the slip
  line for the place / time / person …).

### What the validator checks (town)

Shared: goods / stalls / variants exist, stall colours distinct, levels numbered with growing
`minRuns`, map cells unique and inside the grid, every curriculum slip points at exactly one
place, has a time slot and a perfect choice, and only uses features unlocked at its level.
Per language: every word map points into the lexicon; every quantity phrase (1–10, all variants),
price tag, money phrase, stall reference, cheaper note, vendor line (with every good) and stock
reaction tokenizes fully; vendor-line placeholders fit their kind; the vendor-line and
delivery-reaction kinds the engine needs exist at the level that needs them; 240 planned market
days (every level × every shop stage) only ask for goods on the shelf, have number words for every
price / total, and are bought completely by a solver; every reachable destination / time / person /
knock / absence phrase and 40 generated slips per level tokenize and are solvable. Town texts
count for the "every word appears somewhere" check.

## Story: regulars, the predecessor's letters, chapters, the nightly ledger

The story is told only through in-world target-language text: what regulars order, what they
say after being served, small talk, notes for deliveries, and documents the player finds. The
Japanese chrome is limited to chapter titles, the player-character's short observations
(narration) and the ledger.

**Outline.** Ada (zh 梅姨), who kept the shop for thirty years, left one winter night on Nora's
ship with a single ticket: a letter Grant had carried from the south told her that her younger
sister — twenty years of silence since a quarrel — was ill. She stays with her. Regulars: Rose
(Ada's oldest friend), Joe (dockworker; saw her leave; becomes a father, falls ill, cannot pay),
Tom (runs errands for his sick grandmother, Old Mrs. Hill; his mother Anna), Nora (the ship's
cook who carries the letters), Grant (pushy merchant who carried the fateful letter), Hale (the
schoolteacher, fond of Ada). Five chapters follow the stages softly (1, 5, 10, 15, 20).

### Schema (`src/story/types.ts`)

Language-neutral structure in `src/content/shared/story.ts` (`StoryShared`), words per language
in `src/content/{en,zh}/story.ts` (`StoryText`, same ids), merged by `src/content/index.ts`.

- **characters** `{ id, customer? | avatar? }` — a regular *is* an existing customer (name and
  avatar come from the customer list); others get a name in `StoryText.characters`.
- **beats** `{ id, character, kind: visit|delivery|moment, when, group?, gap?, rule|recipe (visit),
  slip (delivery), at: morning|evening (moment), choice?: [{ id, effects? }], effects?: { good, poor, seen } }`.
  - visit: the regular joins today's shop queue; outcome `good` (perfect / minor) or `poor`.
  - delivery: replaces today's slip (needs the delivery activity open); outcome by the delivery result.
  - moment: a short scene at the start / end of the day; outcome `seen`.
  - `when` (`StoryCond`): `stage`, `day`, `rep` (minimums), `after: [beat]`, `outcome: { beat: [good|poor|seen] }`,
    `choice: { beat: [option] }`, `flags`, `notFlags`, `docs` (found). `group`: alternatives, only one fires.
    `gap`: days since the character's previous beat (default 2).
  - effects (`StoryEffect`): `rep`, `money`, `flags`, `docs` (hand over a document).
- **documents** `{ id, kind, icon, readable }` — `readable` = the stage by which all its words have
  been met (validated). Document lines may carry a `when` condition (postscripts that follow choices).
- **chapters** `{ id, stage }`, **talk** `{ id, character, when }` (small talk appended to a
  regular's reaction after a good ordinary cup).
- Per language (`StoryText`): `names` (proper names in texts, never tokenised as words),
  `characters`, `recipients` (story-only delivery recipients; merged into the town list with
  `storyOnly`, never picked for random slips), `chapters { titleJa, introJa }`,
  `beats { order, request, recipient, good, poor, lines|linesGood|linesPoor: ({ say, who? } | { ja })[],
  prompt, options: { [id]: { text, reply, ja? } }, hookJa|hookGoodJa|hookPoorJa }`,
  `docs { titleJa, lines, foundJa? }`, `talk`, plus story words: `lexicon`, `pages` (検証ページ)
  and `forms` (extra surface forms for existing ids, e.g. en `is → was, were`).

### Engine (`src/story/engine.ts`)

Hooks called by `src/activities/day.ts`: `storyPlanShop` (after the shop plans: chapter card,
morning moment, a visit injected into the queue — before the market plans its note),
`storyPlanTown` (a delivery beat), `storyAfterServe` (resolves a visit: reaction line, effects,
scene; or small talk), `storyEndDay` (evening moment + the ledger card); `storySync` resolves a
story delivery once handed over (called by the UI and at the end of the day). Planning is
idempotent per day, so a resumed or migrated day joins in. A planned beat that did not happen
waits for another day. Story texts count as encounters (tokenised like all in-world text);
reading a document counts once a day — before its `readable` stage only words already in the
notebook count. UI actions: `storyDismiss`, `storyChoose`, `storyReadDoc`. Pending cards
(`chapter | scene | reply | doc | ledger`) live in the save, so a reload shows them again.

The ledger: takings / market expenses / purse / reputation / cups, the regulars met, words
confirmed today, documents found, and the day's hook lines. Documents show confirmed words with
their gloss underneath and barely-met words faint, with the share of confirmed words now vs. when
found — re-reading an old letter visibly reveals more.

### What the validator checks (story)

References resolve (characters, beats, outcomes valid for the beat's kind, choice options,
flags that some effect sets, documents that some beat gives, groups); every beat is reachable
(fixpoint over the facts the story can produce); visits are satisfiable with the shelf and
features of their stage and their customer exists by then; delivery slips point at exactly one
place, recipients exist, deliveries are open by then; every story text tokenises fully (names
aside); every beat / talk line uses only words met by its stage (non-story content, see
`src/story/vocab.ts`, plus words earlier story items introduced) plus at most 2 new ones; every
document is readable by its `readable` stage under the same rule. The vitest suite also plays 45
days on three paths (good player; clumsy player; failing every story cup) and checks that every
beat fires on some path and the good player reaches the end.

## Learning model notes

- **Saves**: version 3 adds `story` (beats, documents, flags, chapter, pending cards, today's
  bookkeeping, last ledger); version 2 saves get a fresh story that starts with the current day.
  Version 2 added `town` (money, unlocks, runs, curriculum log) and `townDay` (today's
  segments, stock, market / delivery state) to each language's progress. Version 1 saves migrate;
  a day in progress continues as a shop-only day.
- **Hidden SRS** (`core/srs.ts`): per-word seen / correct / wrong / interval / ease / due.
  A perfect order grows the interval of all its words; a mistake resets only the words it
  implicates (ingredient, number, temperature…). The day planner prefers template orders full
  of due/weak words; there is no flashcard screen.
- **Mastered** (for 現在地) = meaning confirmed in a 検証ページ AND (used correctly ≥2 times or seen ≥6 times).
- **現在地** is a vocabulary / reading / listening guide only; it does not measure speaking or writing.
- Speech uses the browser's `speechSynthesis` (en-US / zh-CN). Without a matching voice the
  listen buttons are disabled and audio-only orders are shown as text.
