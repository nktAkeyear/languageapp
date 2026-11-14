# 港町の調香茶房 (languageapp)

A personal-use "decipherment" language game for Japanese speakers learning **English** or
**Mandarin Chinese** (simplified + pinyin) — from zero, or from a chosen HSK / 英検 level (レベル設定). You
run an inherited tea/spice shop in a
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

Around this core: a **story** (regulars, the predecessor's letters, chapters, the nightly ledger), the
**shop renovation** (a carpenter's catalogue bought with the shop's coins: more customers, stock kept
overnight, a daily delivery, notebook aids, décor) and **difficulty settings** (start level by HSK / 英検
with 既習扱い words and a stage jump, target, pace, an adaptive controller, assists, the 学習の記録 page).
All three are optional save fields / layers: without them the game plans exactly as the base game.

## Commands

```bash
npm install
npm run dev               # Vite dev server
npm run build             # type-check + build → dist/index.html (single file, opens by double-click)
npm test                  # vitest (engine unit tests + seed-content validation)
npm run validate-content  # content validator; exits 1 on errors
npm run simulate -- zh 10 # simulated playthrough for content review: market notes + vendor talk, orders +
                          # reactions, delivery slips + reactions, story beats 📖 as they fire, the nightly
                          # ledger (args: lang days seed failEvery choice [buy]; e.g. `-- en 45 1 4 0`);
                          # `buy` also orders from the renovation catalogue (🛠) and prints an economy summary.
                          # This log runs with the adaptive controller off, so with defaults and no purchases it
                          # matches logs from before レベル設定 existed. `--log` applies settings to it:
                          # `-- zh 10 1 4 0 buy --log --start=2 --pace=fast [--adaptive=1]`
npm run simulate -- zh 45 --start=2 --pace=slow --acc=0.7 [--adaptive=0] [--seed=3] [--legacy] [buy]
                          # difficulty settings: a simulated player of that accuracy, one line per day
                          # (`buy`: it also orders from the catalogue; coins and 🛠 at the end of the line)
npm run simulate -- --table [--buy]   # settings comparison table (both languages, 45 days, mean of 3 seeds)
```

`dist/index.html` is self-contained (relative base + `vite-plugin-singlefile`): copy it anywhere
and open it with a browser. No network requests at runtime; saves live in `localStorage`
(key `minato-chabou-save`), with JSON export/import and per-language reset in ⚙ 設定. Where file
downloads do not work (e.g. the game embedded in a sandboxed page), the save can also be shown as text
and copied (テキストで書き出す), and imported by pasting the text (テキストを貼り付けて読み込む).

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
    difficulty.ts       レベル設定: start level (seeding 既習扱い, fast-forward), target, pace, adaptive controller, assists
    metrics.ts          学習の記録: per-day indicators, rolling windows
    placement.ts        腕だめし: placement items (orders + labelled cups) and the suggestion
    save.ts             versioned save, migration, export/import
    validate.ts         content validator (used by script + tests)
    validateTown.ts     validator part for market / delivery content
  renovation/           shop renovation (UI-agnostic): types.ts (schema + save state), engine.ts (catalogue,
                        orders, arrival, effects, day hooks), validate.ts, merge.ts (content merge)
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
    shared/renovation.ts the catalogue: upgrades, prices, gates, effects; {en,zh}/renovation.ts its text + words
    en/  zh/            lexicon.ts + index.ts (shop); town.ts = lexicon.town.ts + market.ts + delivery.ts
  ui/
    App.tsx             shell: layout choice, settings sheet, art defs, sound settings, story stage, books,
                        day transitions
    useGame.tsx         React state/actions over the core (brew gestures go through brewing.ts)
    uiState.tsx         open book / notebook page, newly available 検証ページ (per-browser), reduced motion
    brewing.ts          pure: units/tools per ingredient, gesture → Brew, drink colour, reaction motions
    sound.ts            synthesised sound effects + optional ambient loop (Web Audio, no files)
    art/                drawn art, one module per object family (SVG/CSS, no image files):
                        defs (shared materials), shop (walls, window, door, shelf, counter), sky (time of day,
                        night), customer (parametrised characters with arms + expressions; fixed looks for the
                        regulars, vendors and Old Mrs. Hill), ingredients (containers, cup pieces), vessel (the
                        glass cup), tools, props, documents (letters, ticket, postcard, diary pages, recipe card,
                        the blue cup, the carved ship, the document box), town (market street, stalls, coins,
                        purse, basket, the town map, house fronts, the sun dial), reno (every catalogue item;
                        the installed items placed in the shop), Raster.tsx (static textured layers shown as
                        pre-rasterised images)
    scene/              the shop as a scene: workbench.tsx (hand / drag & drop / serve flow), parts.tsx
                        (interactive objects), ShopScene.tsx (desktop), MobileShop.tsx (phone),
                        Transition.tsx (morning → midday → afternoon → night → dawn passages)
    town/               MarketScene.tsx (street of stalls, open stall, paying on the tray),
                        DeliveryScene.tsx (slip in hand, town map, sun dial, walk, the door)
    story/              StoryStage.tsx (conversations, choices, notes, chapter title cards), Documents.tsx
                        (paper found on the counter, reading, the document box, keepsakes), NightLedger.tsx
                        (the night shop and the ledger book), StoryUi.tsx (box state, holding a scene until
                        the reaction has been read), people.ts
    book/               recipe book and notebook as physical books (BookShell, page turns, 検証 puzzle)
    reno/               the renovation catalogue (a booklet like the books), its prop on the counter
    difficulty/         レベル設定 sheet, 腕だめし, 学習の記録 page + SVG charts, notebook bits (既 mark, peek,
                        目標 panel), scene assists (mistake marks, retry slip, slower speech)
    components/         settings, title, word text (gloss on hover/tap; story names; glossed documents; word-by-word
                        reveal), SaveText.tsx (save as text: copy / paste)
    desktop/  mobile/   layouts per device: which scene the current segment shows
scripts/                validate-content.ts, simulate.ts (+ storyLog.ts, simDifficulty.ts: the settings simulator)
```

The layout is chosen by viewport width (≤ 820px → mobile), overridable in settings.

## Presentation

Every part of the day is a drawn scene (desktop: a 1600×1000 stage scaled to the window; phone: tall
compositions of the same pieces), and moving between them is a short passage of light: 朝 market →
昼 shop → 夕方 delivery → 夜 the ledger → dawn of the next day (skipped with `prefers-reduced-motion`).

- **The shop**: the customer stands behind the counter in front of the door, the shelf is on the
  right wall. Reputation is the plaque above the door, the day is the wall calendar ("40日目", with
  today's plan), customers are order tickets on a nail, money is the coin jar. The window light follows
  the day, the lamp glows stronger in the evening, the door bell rings when customers come and go.
- **Brewing by hand**: drag a container onto the cup, or tap it (picked up) and tap the cup — each
  drop is one portion, made with the tool that fits the unit of the quantity phrases (knife for
  slices, spoon for spoonfuls, pouring for cups, tongs for ice). Kettle / cold basin set the
  temperature, hourglass / pot / spoon the method (tap again to take back). Tap a piece in the cup
  (or − on the chit beside it) to take it out; the slop bowl empties the cup. The cup shows the
  drink: colour blended from the ingredients, one floating piece per portion, steam, frost, bubbles.
  Hand it over with 出す (or drag the cup to the customer). Every action has a click / tap / keyboard
  path (Enter on a container adds one portion); the result is the same `Brew` the rules evaluate.
  Shelf containers show `残りN` / `品切れ` from the market stock.
- **Reactions**: the customer takes the cup in both hands, sips, then reacts with the content's face
  plus a body motion chosen from the mistake (grimace for bitter, pucker for sour, shiver when they
  wanted it hot …); the plaque, tickets and coin jar update only then. A regular's small talk is
  part of their reaction in the speech bubble.
- **Market** (morning light): a street of four stalls with awnings in the stall's colour, each with its
  drawn vendor and goods with paper price tags (from the street one jar per good with its usual price;
  at the stall every kind, on two tiers when a stall is busy); the shopping note is pinned in view, the
  basket and the coin purse lie in front. At a stall the vendor speaks in a bubble (clickable words, listen; the
  conversation so far above it); point at a good, set the number, and pay by dropping coins from the
  purse onto the vendor's brass tray (tap the tray to take them back).
- **Delivery** (afternoon / evening light): the slip in hand, the illustrated town map on the table
  (sea and harbour with ships, the river and its bridge, distinct landmark buildings with their
  target-language signs, houses with coloured doors; rows and the main street keep the map's grid, so
  "behind / across / left / right" read as on the slip), the time on a sun dial, a short walk across the
  map, then the door: knock on it (each tap one knock), wait, and hand the parcel to whoever opens — or
  decide what to do when nobody comes. The recipient reacts in a speech bubble. On a phone the map first
  shows the whole town; a tap zooms into that district (signs legible, pan with a finger), the next tap
  chooses the house, 全体を見る zooms back out.
- **Books**: the recipe book and the notebook lie on the counter (and on the desk / table in the
  town) and open as books (two pages on desktop, one on the phone) with page turns. Notebook ribbons:
  単語 (handwritten list + a word's page: audio, memo, sentences seen), 検証 (verification pages),
  現在地 (level guide + 目標), 記録 (学習の記録, see Difficulty). With the catalogue's red ribbon the word list
  opens on 復習 (words due today); with the magnifying glass a word's page marks it in its sentences and
  lists the words that keep appearing with it. A verification page lays out meaning cards; word slips are dragged (or tap-tap)
  onto them and the stamp checks the whole page: right → seals and cards flip to word + meaning;
  wrong → only "something is off". When a page newly opens, the notebook glows and a bookmark sticks
  out. Confirmed words are highlighted everywhere and show their gloss on hover (or a first tap); a
  tap on any word — order, vendor, slip, story, document — opens the notebook at it.
- **Characters** are alive: they blink on their own rhythm, breathe, move their mouth while a line
  appears or is read out by speech synthesis, and gesture (explaining, open hands, a hand at the chin,
  hands on the heart, waving). Customers say their order and their reaction; vendors and recipients too.
- **The story in the scene** (src/ui/story): a regular's scene is a close-up conversation at the
  counter — the regular is always drawn the same (fixed looks per regular, see `art/customer.tsx`),
  their lines in speech bubbles revealed one at a time (word by word, the mouth moving, a gesture per
  line by mood; they listen with a hand at the chin while the player speaks), the player's thoughts as
  narration strips, and choices as reply slips the player says (こう言う). After a regular's cup the scene waits until the
  player has read the reaction (話のつづきを聞く), and likewise at the door after a regular's delivery.
  A delivery request is a note left at the shop. Documents appear on the counter, are picked up
  (手に取る) and read as paper — letter, torn ticket, postcard, diary page, recipe card; every word
  clickable, confirmed words with their meaning written underneath, barely met words faint — then go
  into the document box on the counter; the blue cup and the carved ship go on the window sill (on the
  phone, onto the shelf). Re-reading a paper marks the words confirmed since it was last put away
  (they glow, with a count). Chapter title cards hang a wooden sign over the harbour. At night the
  window is dark, the lamp lit, the shelf stocked, and the day is written into the ledger book (lying on
  the counter, the night shop visible around it) line by line (takings, purchases, catalogue orders,
  purse, reputation, today's customers, goods kept for tomorrow, regulars met, words understood, things
  found, the player's thoughts); blowing out the lamp ends the day. Last night's ledger is in the box.
  A new chapter opens the next morning with its title card (no dawn passage on top of it). ⚙ and the
  sound hook stay reachable over story cards and the night.
- **Sound**: synthesised effects (door bell, pouring, chopping, clinks, simmer, page turn, coins,
  stamp, confirm chime, soft failure, paper, the box, knocks, footsteps, pen in the ledger, the lamp
  blown out, a chapter bell, dawn birds, dusk) and an optional ambient loop; volume / mute / ambient
  in ⚙ 設定 (saved with the settings). Audio starts after the first user gesture and silently does
  nothing where Web Audio is unavailable. `prefers-reduced-motion` turns the animations off.
- **Performance**: the big textured layers (plaster and wood grain drawn with SVG turbulence filters:
  the shop backdrop by day and night, the phone's wall strip and counter, market stall frames, house
  fronts) are pre-rasterised once into images (`art/Raster.tsx`), so animations on top (waves, steam,
  blinking, the lamp) never re-run the filters; animated figures carry no filters (shadows are plain
  gradients) and the night lamp is a plain alpha layer, not a blend mode.

## Shop renovation (店の改装)

The coins the shop earns buy improvements from a carpenter's catalogue — a booklet on the counter
(カタログ; it glows when new entries have appeared). The catalogue is in-world text: heading, names, the
sales lines that say what each thing does, and prices are all in the target language with drawings
(reading it is decipherment; only the buttons and stamps are Japanese). Orders are paid at once, can be
taken back the same day, appear in the night's ledger (注文) and arrive the next morning: the shop is
drawn with them from then on (a twinkle marks what arrived today) and their effects apply.

| id | price | appears | effect |
| --- | ---: | --- | --- |
| signboard 看板 | 25 | day 4 | +1 reputation at the end of a day with a perfect cup; customers remark on it |
| plant 鉢植え | 15 | day 4 | décor (remarks) |
| ribbon しおり | 12 | day 5 | notebook: a 復習 list of the words due for review today (hidden SRS made visible) |
| kettle 大きなやかん | 35 | day 5, temperature | +1 coin for a perfect hot cup |
| curtains カーテン | 30 | day 7 | décor (remarks) |
| bench 長いす | 60 | day 8, rep 15 (or day 14) | one more customer every day (a review order of known words) |
| shelf 棚 | 30 | day 9, market open | leftover market goods kept overnight, up to 3 portions each |
| scales はかり | 45 | day 10 | +1 coin for a perfect cup whose order named an exact quantity |
| chime 風鈴 | 25 | day 11 | décor (remarks) |
| cart 手押し車 | 60 | day 11, deliveries open | a delivery every day |
| lantern ちょうちん | 50 | day 13, rep 30 (or day 19) | +1 reputation for a perfect cup to a returning customer |
| magnifier 虫めがね | 40 | day 14 | notebook: the word marked in its sentences + the words that keep appearing with it |
| icebox 氷の箱 | 75 | day 16, stage 9, market | fresh goods (milk, yogurt, fruit, mint, lemon) kept overnight (≤12); +1 coin for a perfect cold cup |
| cellar 地下室 | 85 | day 18, after the shelf | dry goods (ginger, honey, sugar, dates, flowers, coffee) kept overnight (≤12) |
| paint ペンキ | 70 | day 21 | the shop painted white and blue (remarks) |
| catbed 猫の寝床 | 35 | day 24 | a cat moves in (sleeps; wakes when a customer reacts) (remarks) |
| picture 船の絵 | 50 | day 27 | décor (remarks) |
| bicycle 自転車 | 100 | day 30, after the cart | +4 coins on a perfect delivery's tip |

Goods kept overnight start the next market day in stock and the shopping note asks only for the rest
(the ledger lists them under 明日に取っておく). Customers sometimes remark on the décor after a perfect cup
(target language, appended to the reaction; more likely the day after it arrived; at most two a day,
not when a regular already made small talk; a remark may be marked `notWhen: ['cold' | 'hot']` so nobody
says "very warm here" over an iced tea). The arrival note is on the day's first notice (the market's paper
when the day starts there). An entry that has appeared stays listed even if reputation dips below its gate.
Calibration (`npm run simulate -- en 45 1 0 0 buy`): a
player who serves everything right earns ~950–1050 coins net of the market in 45 days (en; zh ~770) and,
buying whatever is affordable while keeping 20 coins for the market, owns the whole catalogue (842 coins)
around day 39–42; a player who fails every 3rd–4th cup earns ~480–620 and gets 13–15 of the 18 entries.

### Schema (`src/renovation/types.ts`)

- Shared (`RenoShared`, `src/content/shared/renovation.ts`): `upgrades: { id, category, price, when, effects }[]`
  in catalogue order; `when` (all must hold): `day`, `stage`, `rep` (or anyway 6 days after `day`),
  `requires` (other upgrades), `activity` (market / delivery open), `feature` (workbench feature).
  `effects`: `customers`, `carry { goods: all|dry|fresh, cap }`, `coinHot`, `coinCold`, `coinExact`, `repDay`,
  `repReturning`, `deliveryDaily`, `tip`, `notebook: review|closer`, `remarks`. Also `dryGoods`,
  `remarkChance`, `keepForMarket` (the catalogue warns below it).
- Per language (`RenoText`, `src/content/{en,zh}/renovation.ts`): `title`, `subtitle`, `price` (`{d}` digits),
  `upgrades: { [id]: { name, lines[], remarks?[] } }`, and the catalogue's own `lexicon` + `pages` (検証ページ)
  + `forms` (extra surface forms of existing ids), merged by `src/renovation/merge.ts`.
- Engine hooks (`src/renovation/engine.ts`, called from `activities/day.ts`): `renoPlanShop` (arrivals, extra
  customers), `renoCarry` (passed to `planMarket`; kept goods start in stock), `renoPlanTown` (daily delivery),
  `renoAfterServe` (bonuses, remarks), `renoEndDay` (signboard, goods kept overnight); `renoTipBonus` in the
  delivery engine. UI actions: `renoOrder`, `renoCancel`, `renoRead` (reading the catalogue counts as
  encounters, once a day), `renoMarkSeen`.
- The validator checks: text for every entry; every name / line / remark / price tokenises; remarks exactly
  for the upgrades with `remarks`; the catalogue's words do not repeat an existing word by surface or by
  meaning (gloss); each entry, when it appears, has at most 4 words the player cannot have met by then;
  prerequisites exist and appear earlier; dry goods are market goods.

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
notebook count. UI actions: `storyDismiss`, `storyChoose`, `storyReadDoc`, `storyDocPutAway`. Pending cards
(`chapter | scene | reply | doc | ledger`) live in the save, so a reload shows them again.

The ledger: takings / market expenses / purse / reputation / cups, the regulars met, words
confirmed today, documents found, and the day's hook lines. Documents show confirmed words with
their gloss underneath and barely-met words faint, with the share of confirmed words now vs. when
found — re-reading an old letter visibly reveals more, and the words confirmed since it was last
put away are marked (`docFreshWords`, `storyDocPutAway`).

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

## Difficulty: レベル設定 and 学習の記録

Per language, `LangProgress.difficulty` (optional; absent = the defaults ゼロから・ふつう・自動調整あり, which
plan exactly like older saves — `planKnobs` returns the stage's own values and the stage clock offset is 0).
Logic in `src/core/difficulty.ts`; the sheet opens at a new game (title screen / a new language in ⚙ 設定),
from ⚙ 設定 → レベル設定, and from the notebook's 現在地 (目標) and 記録 pages.

- **現在の実力の目安 (start)**: ゼロから / zh HSK1–3 (中検・CEFR shown) / en 英検5・4級 (CEFR・TOEIC shown); higher
  levels are listed as 未対応 because the content does not reach them. Choosing a level seeds every lexicon word
  tagged at or below it as **既習扱い** (`WordState.seeded`: confirmed, seen 6 / correct 2 added, first review
  spread over 3–14 days so they come back now and then), seals 検証ページ whose words are all known, marks earlier
  curriculum orders made only of known words as done (orders with unknown words — shelf names, higher-level
  words — still come), and fast-forwards the shop to the level's stage (`START_STAGE`: zh 6 / 11 / 16, en 7 / 13 —
  calibrated on the curriculum's structures, since level tags are spread over all stages), with its reputation,
  a stage-clock offset (`stageDay` = day + offset gates stages and town unlocks), market / delivery experience and
  money. The notebook marks seeded words 「既」; each can be taken back (学び直す) and is then not re-seeded.
  Changing the level later is exact: down takes back only what seeding added (a word met in play since keeps
  its own encounters), reopens sealed pages / skipped orders; up seeds more; the shop never goes back.
- **Story when starting above zero**: nothing is skipped — the story starts with the first letter and plays
  in order (the regulars' arcs and choices only make sense in sequence; the early beats use words the player
  already knows). `src/story/catchup.ts` compresses it: up to two regulars' visits a day while their beats are
  ≥ 3 stages behind the shop, and chapter title cards follow the story (one a day at most, the next only when no
  earlier-stage beat is still pending). Simulated (85 % player): a HSK2 / 英検4級 start reaches the last beat on day 25–27, a zero start on day 41.
- **目標**: the 現在地 page shows mastered words of that level's list, the share the game contains (the ceiling,
  a dashed mark), what remains in the game and what is not in it, with an honest note; a level is offered only
  if the game has ≥ 30 words of exactly that level and ≥ 15 % of its list (zh HSK1–3, en 英検5・4・3級 — 3級 only
  just, with the catalogue's words; its note says the game holds about 16 % of the list).
- **進み方**: ゆっくり (new words ×0.6, one customer fewer, ≥ ⅓ review orders, stage clock ×0.75) / ふつう (as
  designed) / 速い (×1.4, one more customer, clock ×1.3; the clock never speeds past an unserved curriculum
  backlog).
- **自動調整** (`controllerStep`): after each day, from the last 4 days (only days after its previous step):
  first-try accuracy < 60 % (or orders with new words < 45 %) → ease off one step; > 90 % with few review lapses
  → one step brisker; 70–85 % → drift back to the preset; otherwise hold. A step needs the same verdict two
  days running, a reversal waits 2 days, `adj` stays in [−1, +0.6]. `adj` scales the new-word budget, the
  minimum review share, template choice (older, shorter templates when easing), audio-only frequency and the
  stage clock. The reason is shown in Japanese on the 学習の記録 page.
- **手助け** (all off by default): pinyin always / unconfirmed only / never (else 設定's switch); peek at the gloss
  of an unconfirmed word on its notebook page (評判 −1); mark the order words a failed cup was about; retry the
  same customer without penalty (state restored; the failed first try still counts in the indicators; not for
  regulars' story visits; anything else done after the failed cup — a catalogue order, a sealed page, a memo,
  a story card — ends the chance to retry, since the restore would undo it); after an empty cup no word is
  marked, a note says the cup was empty; audio-only orders off / normal / many (also the market's spoken
  quotes); slower speech.
- **腕だめし** (`src/core/placement.ts`): two curriculum orders per offered level, each with three cups labelled
  like the shelf (one right, two near misses checked by the real rules) or わからない; the suggestion is the
  highest level answered completely right from the first level up; the player confirms it in the sheet.
- **学習の記録** (notebook ribbon 記録, `src/core/metrics.ts`): one record per day — first-try accuracy (all / with
  new words / review), 検証 stamps per sealed page, market lines bought / deliveries made well, review lapse rate,
  words confirmed, seconds per order (UI only), retries, peeks, the qualification estimate, stage and `adj` —
  drawn as SVG charts with a table view, plus the current difficulty in words and the controller's last reason.

### Difficulty × renovation

- **Customers a day** = the stage's number + the pace preset (±1, at least 3) + seats bought (the bench, +1, a
  review order of known words). The adaptive controller does not change the count; the bench's orders count
  as orders in the indicators like any other. The 記録 page shows the total (お客さん／日, with 長椅子 +1).
- **Catalogue gates** use the calendar day (`p.day`), not the stage clock: a HSK2 / 英検4級 start opens the
  catalogue on day 4 like a zero start (the jump grants the market's start money, not catalogue money);
  reputation and stage gates are already met after a jump. Simulated with buying (85 % player, 30 days),
  zero / level 1 / level 2 starts buy 8–12 entries; nothing is affordable at once and the catalogue never
  stays empty.
- **Starting level and catalogue words**: the catalogue's words carry HSK / 英検 tags like any word, so a level
  start seeds the low-level ones (cat, box, new, 猫, 新 …) as 既習扱い; its 検証ページ are sealed only when all
  their words are known. Seeded words not met in play since are left out of the red ribbon's 復習 list.
- **Money and reputation at a mid-day level change** are not counted as the day's takings / reputation in the
  ledger (the day's start values move with them), like confirmed words.
- **Indicators**: catalogue orders, catalogue reading and décor remarks are not orders; the retry assist
  restores the whole progress, so coin / reputation bonuses (kettle, scales, ice box, signboard, lantern)
  are paid once, for the cup that counts. A gloss peek costs reputation; catalogue entries already shown do
  not disappear because of it.

## Learning model notes

- **Saves**: each language's progress may carry `reno` (renovation: installed upgrades with their
  arrival day, today's orders, goods kept overnight, catalogue entries seen, remark bookkeeping) and
  `difficulty` (レベル設定 + 学習の記録); both are optional (no version bump), so version 1–3 saves and saves
  made before either existed load unchanged (nothing bought, default difficulty created on first use). The
  ledger may carry `purchases`. Version 3 adds `story` (beats, documents, flags, chapter, pending cards, today's
  bookkeeping, last ledger); version 2 saves get a fresh story that starts with the current day.
  A document record may carry `known` (its words confirmed when it was last put away, for the
  re-reading highlight); it is optional, so older version 3 saves load unchanged.
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
