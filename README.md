# 港町の調香茶房 (languageapp)

A personal-use "decipherment" language game for Japanese speakers learning **English** or
**Mandarin Chinese** (simplified + pinyin) from zero. You run an inherited tea/spice shop in a
port town. Customers order in the target language, the predecessor's recipe book is written in
the target language, and the only feedback is the customer's reaction (target language), their
face and the shop's reputation. There are no translations. Game chrome (menus, hints, notebook
UI) is Japanese.

Phase 1 implements the **shop** activity only. The code is split into a shared core
(lexicon, word tracking, notebook, verification, reputation, saves) and pluggable activities
(`src/activities/<id>/`), so later phases can add market / delivery / letters activities.

## Commands

```bash
npm install
npm run dev               # Vite dev server
npm run build             # type-check + build → dist/index.html (single file, opens by double-click)
npm test                  # vitest (engine unit tests + seed-content validation)
npm run validate-content  # content validator; exits 1 on errors
npm run simulate -- zh 10 # print a simulated 10-day playthrough (orders + reactions) for content review
```

`dist/index.html` is self-contained (relative base + `vite-plugin-singlefile`): copy it anywhere
and open it with a browser. No network requests at runtime; saves live in `localStorage`
(key `minato-chabou-save`), with JSON export/import and per-language reset in ⚙ 設定.

## Layout

```
src/
  core/                 shared engine (no UI, no language-specific text)
    types.ts            content schema + runtime types  ← start here
    tokenize.ts         text → lexicon ids (en: words/multi-words, zh: longest match)
    gamedata.ts         content + indexes per language, qty phrases, stage helpers
    srs.ts              hidden spaced repetition (per-word state)
    verification.ts     検証ページ logic
    levels.ts           現在地 (coverage per CEFR / 英検 / HSK level)
    save.ts             versioned save, migration, export/import
    validate.ts         content validator (used by script + tests)
  activities/
    index.ts            activity registry
    shop/               rules.ts (order rule evaluation), reactions.ts, templates.ts,
                        dayplan.ts (order picker), engine.ts (day loop)
  content/
    shared/             language-neutral: ingredients, recipes, stages (unlock schedule)
    en/  zh/            lexicon.ts + index.ts (everything else for that language)
  ui/
    components/         small presentational components shared by both layouts
    desktop/            PC layout (panels side by side)
    mobile/             phone layout (one panel + bottom tabs)
    useGame.tsx         React state/actions over the core
scripts/                validate-content.ts, simulate.ts
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
- **recipeNames**, **symptoms** (`{ symptom, phrases[] }`, whole sentences).
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
Outcome: perfect (+3 rep), minor (only quantities/method off by one, ±0), fail (−1),
bad (forbidden ingredient, −2). Non-perfect customers come back on a later day.

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

## Learning model notes

- **Hidden SRS** (`core/srs.ts`): per-word seen / correct / wrong / interval / ease / due.
  A perfect order grows the interval of all its words; a mistake resets only the words it
  implicates (ingredient, number, temperature…). The day planner prefers template orders full
  of due/weak words; there is no flashcard screen.
- **Mastered** (for 現在地) = meaning confirmed in a 検証ページ AND (used correctly ≥2 times or seen ≥6 times).
- **現在地** is a vocabulary / reading / listening guide only; it does not measure speaking or writing.
- Speech uses the browser's `speechSynthesis` (en-US / zh-CN). Without a matching voice the
  listen buttons are disabled and audio-only orders are shown as text.
