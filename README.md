# 港町の調香茶房 (languageapp)

A personal-use "decipherment" language game for Japanese speakers learning **English** (the focus) or
**Mandarin Chinese** (simplified + pinyin; playable as before, tea house only). There are no translations:
meaning is inferred from pictures, context and consequences. Game chrome (menus, hints, notebook UI) is
Japanese; everything in the world is in the target language.

**Many lives in one town.** The player inherited a tea/spice shop in a port town — the first job — and,
from day 4, the town's job board offers more working lives they can take up and switch between freely
(a day's workplace, plus a second shift after closing): the **post office**, the **harbour kitchen**, the **inn's front desk**, a
**trading company's office** (TOEIC-flavoured working English) and four upper-level workplaces whose first rank is 英検3級 and
whose last is 1級: the **newspaper office** (the Harbour Courier), the **clinic's reception**, the **town hall counter** and the
**academy library**. Each job is a different place with its own
people, tasks, ranks and vocabulary; one shared notebook / verification / hidden SRS runs across all of
them, and the jobs feed each other (the kitchen bakes the bread the inn serves, the office's parcels go
through the post office, the tea house's tea goes to the office's meetings). Progress is measured against
the compiled English lists (`data/english/`) on two yardsticks the player chooses between or views side by
side: **英検** (5級 … 1級) and **TOEIC** (〜400 … 〜990).

The code is split into a shared core (lexicon, word tracking, notebook, verification, reputation, saves),
the **jobs** framework (`src/jobs/`: the day's parts, shifts, ranks, task archetypes), the **curriculum**
over the compiled lists (`src/curriculum/`) and the tea house's own activities (`src/activities/<id>/`):

- **shop** (Phase 1): order → recipe book → workbench → reaction.
- **market** (Phase 2, opens around day 5 / early–mid A1): the shop runs short; a shopping note
  says what to buy; stalls have target-language price tags; vendors quote, give change, run out,
  haggle. Wrong item / quantity → the shelf runs out in the shop that day; overpaying → less money.
- **delivery** (Phase 2, opens around day 9 / late A1–A2): a slip says where (town map with
  signs; behind / across from / next to / left / right), when (morning, o'clock, before / after),
  to whom and how (knock twice, not the child, leave it at the door if nobody is home).

**A working day has three parts** (`src/activities/day.ts`, v6): **始業前** (before opening — the day always starts
at the workplace: in the shop, preparing; nothing lies on top of the scene: on a market day the shopping note is pinned
on the wall by the door with the market basket hanging under it (tap the basket to walk to the market and back, as
often as they like), the framed town map on the wall leads out into the town, and the shop opens when the player turns
the door's 準備中 card to 営業中 (`src/ui/scene/PrepProps.tsx`)), **業務中** (working hours — the customers;
nobody can leave the counter to shop, but goods can be **ordered by delivery** for a fee, `DELIVERY_FEE` = 4
coins an order, said before anything is paid: the same stalls, words, quotes and payment as at the market, and
the goods arrive when the next customer comes in) and **業務後** (after closing — the house delivery, the evening
market whose goods are kept in the back room for tomorrow, the catalogue, the town and a second shift, home and
the night's ledger). Before the town activities open, a day is the Phase 1 shop day in those three parts; before
the job board opens (day 4) it is exactly the tea house day.

**Nothing opens by itself** — at the start of a day or later. The day's notes (what opened, a new rank, what the
carpenter delivered), the chapter title, a regular waiting in the morning, a delivery note and the papers that
came are pinned in the scene: a paper on a nail (「知らせ」, with the number of unread things; desktop: on the
wall by the door; phone: next to the round buttons; in the town and at a workplace: in the status bar) opens a
side panel the player reads when they want (a story card plays only when opened from it); papers lie in the
document box, which glows. Nothing is laid over the scene when a day begins: the HUD's calendar and the strip of the
day's parts say the day and its part (a one-line banner appears only when supplies ordered by delivery arrive during
working hours; it goes by itself, never takes a click and never covers a control). The HUD shows the three parts
(始業前 › 業務中 › 業務後) in every scene.

**No verdicts.** Play never judges an answer: no 完璧 / うまくいかなかった badges, no ✓ / ✗, no right answer shown in
green or red, no mistake marks. What remains is in-world: the customer's / boss's reaction line in English, which
says what is off from the task's own facts — never just "that is not right": "Where is the mint?", "The caller said
Thursday, not Wednesday.", "The address is 12 Bridge Street here, but 21 Bridge Street on the passport.", "Wednesday,
9:00? But I said: “I can come on Wednesday or Thursday, but not in the morning.”", "But I asked: “What time do you
close on Friday?”" (see 「Reactions say what was off」 below); their face and what they do (come back another day, pay less), and the coins / reputation that result,
shown as ledger facts. Scoring stays internal (SRS, pacing, ranks, metrics). The 検証ページ remain the game's one
way to confirm a hypothesis about meanings; 現在地 / 記録 show aggregate progress only.

Around this core: a **story** (regulars, the predecessor's letters, chapters, the nightly ledger), the
**shop renovation** (a carpenter's catalogue bought with the shop's coins: more customers, stock kept
overnight, a daily delivery, notebook aids, décor) and **difficulty settings** (start level by HSK / 英検
(en: any 英検 grade 5級 … 1級, or a TOEIC band) with assumed-known (未確認・知っているはず) words, a stage jump and — en — the
jobs placed at the rank of that level from day 1, target, pace, an adaptive controller, assists, the 学習の記録 page;
en: the yardstick 英検 / TOEIC and a TOEIC target). All are optional save fields / layers.

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
npm run simulate -- --jobs [--days=20] [--acc=0.85] [--seed=1] [--yard=eiken|toeic] [--log]
                          [--start=N | --toeic=BAND] [--tasks]
                          # jobs: a simulated English player works through the town (days alternate: the tea
                          # house's day with a second shift after closing, a job's day with the tea house opened
                          # after closing; --order: never shops before opening, orders by delivery when the
                          # shelf runs out — what the delivery fee costs): one line per day with ranks,
                          # coins, words met / confirmed and progress on both yardsticks; --log prints every
                          # task's request and reaction (content review); --start=5 (英検2級; 1 = 5級 … 7 = 1級)
                          # or --toeic=600 starts at that level (the level change is printed: words assumed
                          # known, shop stage, the jobs' ranks); --tasks lists each shift's tasks with the rank
                          # of their material (A: authored, T: template) and the outcome
```

The build reads `data/english/{vocab,phrases,grammar}.json` (if present) through a Vite plugin
(`scripts/englishLists.ts`), so rebuild after the lists change. `validate-content` and `simulate` read them
from disk directly.

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
    difficulty.ts       レベル設定: start level (seeding assumed-known words, fast-forward), target, pace, adaptive controller, assists
    metrics.ts          学習の記録: per-day indicators, rolling windows
    placement.ts        腕だめし: placement items (orders + labelled cups) and the suggestion
    wordbook.ts         the player's own meanings (自分の推測 + メモ) and the 単語帳 (stars, hand-written words,
                        self-review)
    save.ts             versioned save, migration, export/import
    validate.ts         content validator (used by script + tests)
    validateTown.ts     validator part for market / delivery content
  jobs/                 the jobs framework (UI-agnostic): types.ts (schema + runtime + save state) ← start here
                        for jobs, rules.ts (the archetypes' rules + solvers, postage), templates.ts (task
                        generator: typed slots → instances; quantities and agreement), expr.ts (computed check
                        fields), engine.ts (board, hours, parts of the day, shifts, planner, ranks, wages,
                        links), lexicon.ts (the job lexicon registry), vocab.ts (job vocabularies, where words
                        were met), nearmiss.ts (wrong reply options on the same topic), explain.ts (what a wrong
                        answer got wrong, said from the task's facts), placement.ts (the jobs' ranks for a
                        start level), validate.ts, merge.ts
  curriculum/           the compiled English lists: lists.ts (types, tolerant reading, packing), node.ts
                        (disk), browser.ts (bundled, gzip + base64), curriculum.ts (reconciliation, 英検 / TOEIC
                        reports, next-word selection), yardsticks.ts, apply.ts
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
    jobs/               the jobs: teahouse.ts (the first job + the shared goods), post.en.ts, kitchen.en.ts,
                        inn.en.ts, office.en.ts, news.en.ts, clinic.en.ts, townhall.en.ts, academy.en.ts (English-only),
                        common.en.ts (words several jobs share),
                        near.en.ts (near-miss replies for the QA banks), index.ts (the list + the common lists;
                        merges the near misses onto the QA items)
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
                        (interactive objects), PrepProps.tsx (始業前 as things in the room: the door's
                        準備中 card, the market basket under the shopping note, the town map; the
                        workplaces' 準備中 sign), ShopScene.tsx (desktop), MobileShop.tsx (phone),
                        Transition.tsx (shop ↔ market / delivery passages, dusk; none over the day's start)
    town/               MarketScene.tsx (street of stalls, open stall, paying on the tray),
                        DeliveryScene.tsx (slip in hand, town map, sun dial, walk, the door)
    story/              StoryStage.tsx (conversations, choices, notes, chapter title cards), Documents.tsx
                        (paper found on the counter, reading, the document box, keepsakes), NightLedger.tsx
                        (the night shop and the ledger book), StoryUi.tsx (box state, holding a scene until
                        the reaction has been read), people.ts
    book/               recipe book and notebook as physical books (BookShell, page turns, 検証 puzzle)
    reno/               the renovation catalogue (a booklet like the books), its prop on the counter
    jobs/               TownHub.tsx (the town: map + east quarter, workplaces with open / rank / new badges,
                        the phone's zoomable map), JobBoard.tsx (仕事の掲示板), JobScene.tsx (a workplace:
                        rasterised interior, ambient life, person, bubble, shift frame), benches.tsx (sort,
                        trade) + benches2.tsx (make, check, respond) drawn as furniture, furniture.tsx (bins,
                        envelopes, parcel, scale, till, stations, telephone, stamps, pen, key), papers.tsx
                        (documents as what they are, pen circle, stamp imprint), ambient.tsx, drag.ts (pointer
                        drag & drop), art.tsx / art2.tsx / art3.tsx (hub, interiors — art3: the newsroom,
                        the clinic, the town hall, the library and their fronts —, things, food), Yardsticks.tsx
                        (現在地 by 英検 / TOEIC, the per-job record), bits.tsx, jobs.css + scene.css
    difficulty/         レベル設定 sheet, 腕だめし, 学習の記録 page + SVG charts, notebook bits (既 mark, peek,
                        目標 panel), scene assists (the もう一度つくる slip, slower speech)
    components/         settings, title, word text (every word opens its card; the player's guess under the word;
                        gloss on hover for confirmed words; story names; glossed documents; word-by-word reveal),
                        WordCard.tsx (単語カード), SaveText.tsx (save as text: copy / paste)
    book/Wordbook.tsx   the notebook's 単語帳 ribbon (list, hand-add, self-review)
    desktop/  mobile/   layouts per device: which scene the current segment shows
scripts/                validate-content.ts, simulate.ts (+ storyLog.ts, simDifficulty.ts: the settings simulator,
                        simJobs.ts: the jobs simulator), englishLists.ts (the Vite plugin bundling data/english)
```

The layout is chosen by viewport width (≤ 820px → mobile), overridable in settings.

## Presentation

Every place is a drawn scene (desktop: a 1600×1000 stage scaled to the window; phone: tall compositions of the
same pieces), and walking between the tea house's places (shop ↔ market, out to a delivery) is a short passage of
light; going home is dusk and the night's ledger. A new day opens straight on the workplace (no passage, no paper
and no banner over it: the HUD says the day and its part). Skipped with `prefers-reduced-motion`.

- **The town** (from day 4): the delivery map extended across the bridge by the east quarter — two columns of
  workplaces, three rows north of the harbour road and one south of it (`EAST_SLOTS` in `art.tsx`, each front scaled
  to its slot, the sign hanging under it a size smaller): the Harbour Courier (grey stone, the masthead band, the
  presses' chimney, bundled papers at the door) and the town hall (a pediment on columns, steps, the clock and the
  flag); the post office (red brick, a red postbox) and the trading company (stone, a clock); the clinic (white walls,
  the green cross, a ramp) and the academy library (red brick, an arched window with books in it, a bell tower); the
  harbour kitchen (striped awning, chimney smoke) and a building site for the jobs to come; the inn and the tea house where they always
  were; the job board on the main street. Signs in the target language with a small Japanese label. The
  light follows the part of the day (始業前 morning, 業務後 evening). Phone: overview map + signboard list.
- **Workplaces** (`src/ui/jobs/`): each job is a drawn interior (pre-rasterised once per shift, like the
  shop) with ambient life on top (`ambient.tsx`: gulls and waves in the post office window and its cat asleep
  in a parcel box, steam and a swaying pan in the kitchen, the inn's pendulum clock and fern, clouds and the
  office clock's second hand, gulls past the newsroom window and its green lamp swaying in the draught from the press
  room, a goldfish in a bowl on the clinic's window sill, the town's flag outside the town hall's window, dust in the
  light of the library's arched window), the person at the counter (drawn, talking, reacting with face and arms) and
  the work drawn as the room's own furniture, acted on directly (`benches*.tsx`, `furniture.tsx`,
  `papers.tsx`): letters as envelopes dragged (or tapped) into a wooden pigeon-hole cabinet with brass name
  plates; crates with their labels into the cold box / shelf / basket / freezer / bin / sink / stove …
  (each drawn); suitcases with luggage tags to the inn's floors, the luggage room, the laundry; the post
  counter's chalk price board, goods drawers, a felt mat, the brass letter scale with the customer's parcel
  and the framed postage rate card, the coin tray and the till; the kitchen's pantry shelves (labelled jars
  and crates — what the pantry is out of today stands empty), the stove (pan / pot / steamer), grill and
  oven, a rack of plates, bowls, cups, glasses, trays and bags, the dish on the pass with the order things
  went in numbered, a recipe card / menu / chef's note pinned up as that paper; papers as the documents they
  are (an invoice with its letterhead band and double-underlined total, an order form with boxed fields, the
  inn's register book in handwriting, a letter, a notice pinned to the board, an index card, a parcel tag,
  an e-mail on a screen) checked with a red pen (tap a line: it is circled) and rubber stamps (✓ / ✗, an
  imprint, no words); a ringing telephone (pick up the receiver), the message pad, reply slips, the wall
  calendar, the inn's floor board (the key hangs on the room chosen). The four upper-level rooms (`art3.tsx`): the
  **newsroom** (newsprint-cream walls over a green dado, the page plan pinned on cork, the masthead, the press room's
  door with its round window, the wire tray of incoming copy, the spike and a typewriter on the desk; stories are
  typed copy slips filed into wire baskets per section, drafts are galley proofs, notes a reporter's spiral notebook,
  the page plan a ruled newsprint grid), the **clinic's reception** (sage walls and white tiles, the eye chart, coats
  and the waiting bench, the open appointment book with its ribbon, the desk bell; patients' charts in manila folders
  with coloured tabs go into the rooms' wall pockets, the doctor's note is a prescription pad, the register an
  appointment book), the **town hall counter** (stone pilasters, the town's crest with a ship, the notice board, the
  "now serving" number, a brass grille along the counter, the stamp rack and the ink pad; application forms go into
  the desks' trays, papers are official forms with boxed fields), the **academy library** (oak shelves to the ceiling,
  a leaded arched window, green reading lamps, the rolling ladder, the study-room chart, the card catalogue and the
  date stamp; books with their slips go onto the subject shelves of the book trolley, cards are catalogue cards with
  the drawer rod's hole). Each room's papers and calendars take the room's look (`.job-<id>` in `scene.css`); each
  boss has a fixed drawn look. Phone: the same pieces stacked
  (pieces still drag with a finger; tap-tap works everywhere). A long request (rank 5's contracts, set menus,
  letters) is never scrolled inside its bubble on the desktop stage: the person steps back a little and the hand
  gets smaller (`.js-long` over 75 characters, `.js-longer` over 180). After handing in, the bench keeps only
  what the player did (the letters where they put them, their pen circle and their own stamp, the slip they
  chose): nothing is marked right or wrong, the person's reply says it, and the paid wage is shown as a fact
  (お給金 +3). The end of a shift: the tasks done, the wage, the rank's progress (a rank reached is said there).
- **The shop**: the customer stands behind the counter in front of the door, the shelf is on the
  right wall. Reputation is the plaque above the door, the day is the wall calendar ("40日目"), the part of the
  day is the strip 始業前 › 業務中 › 業務後 (the door's card says 準備中 / 営業中 / 閉店), customers are order tickets
  on a nail (torn off when served — no mark of how it went), money is the coin jar. 始業前, nothing lies over
  the scene and every way on is a thing in the room (`PrepProps.tsx`): the door's card says 準備中 — tapping it (or
  the door) turns it over to 営業中 and opens the shop (the card turns in about 320 ms, ease-out; under reduced motion
  its face changes at once); on the first three days it carries a small label (札を返して開店) and a ring that beats
  five times and then stays still. On a market day the shopping note (English) is pinned on the wall by the door with
  the market basket hanging under it (市場へ / もう一度市場へ); when the jobs are open, a framed town map on the wall
  leads out (町へ). Phone: the same card on the door in the wall strip, the note, the map and the basket in the
  customer's empty place. 業務中, a wooden sign 「配達を頼む（配送費 4 枚）」 by the shelf (on market days; it glows when
  a good is out; on the phone it hangs first in the shelf's row, so the counter keeps its height) asks before anything
  is paid; 業務後 the same place offers the house delivery, the market for tomorrow,
  the town and home. The window light follows
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
  wanted it hot …) and their line, which names what is wrong; the plaque, tickets and coin jar update only
  then (no sound, colour or badge tells right from wrong). A regular's small talk is part of their reaction
  in the speech bubble; a regular's story visit that went wrong says the shop's line first, then theirs.
- **Market** (morning light before opening; noon while an order is sent for delivery; evening light after
  closing, when the goods go to the back room for tomorrow — a strip at the top says which): a street of four stalls with awnings in the stall's colour, each with its
  drawn vendor and goods with paper price tags (from the street one jar per good with its usual price;
  at the stall every kind, on two tiers when a stall is busy); the shopping note is pinned in view, the
  basket and the coin purse lie in front. At a stall the vendor speaks in a bubble (clickable words, listen; the
  conversation so far above it); point at a good, set the number, and pay by dropping coins from the
  purse onto the vendor's brass tray (tap the tray to take them back).
- **Delivery** (after closing, optional — 店に戻る puts it off; afternoon / evening light): the slip in hand, the illustrated town map on the table
  (sea and harbour with ships, the river and its bridge, distinct landmark buildings with their
  target-language signs, houses with coloured doors; rows and the main street keep the map's grid, so
  "behind / across / left / right" read as on the slip), the time on a sun dial, a short walk across the
  map, then the door: knock on it (each tap one knock), wait, and hand the parcel to whoever opens — or
  decide what to do when nobody comes. The recipient reacts in a speech bubble. On a phone the map first
  shows the whole town; a tap zooms into that district (signs legible, pan with a finger), the next tap
  chooses the house, 全体を見る zooms back out.
- **Books**: the recipe book and the notebook lie on the counter (and on the desk / table in the
  town) and open as books (two pages on desktop, one on the phone) with page turns. Notebook ribbons:
  単語 (handwritten list + a word's page: audio, ☆, own guess + memo, sentences seen), 単語帳 (the player's word book), 検証 (verification pages),
  現在地 (level guide + 目標), 記録 (学習の記録, see Difficulty). With the catalogue's red ribbon the word list
  opens on 復習 (words due today); with the magnifying glass a word's page marks it in its sentences and
  lists the words that keep appearing with it. A verification page lays out meaning cards; word slips are dragged (or tap-tap)
  onto them and the stamp (推測を確かめる) tests the arrangement as a hypothesis: confirmed → seals and cards flip
  to word + meaning; not yet → only 「この組み合わせでは、まだ確かめられない」 (never which card). When a page newly opens, the notebook glows and a bookmark sticks
  out. Confirmed words are highlighted everywhere and show their gloss on hover; a tap on any word —
  order, vendor, slip, story, document, job paper, notebook sentence — opens its **word card** (see
  「Own meanings and the 単語帳」 below).
- **Characters** are alive: they blink on their own rhythm, breathe, move their mouth while a line
  appears or is read out by speech synthesis, and gesture (explaining, open hands, a hand at the chin,
  hands on the heart, waving). Customers say their order and their reaction; vendors and recipients too.
- **The story in the scene** (src/ui/story): a regular's scene is a close-up conversation at the
  counter — the regular is always drawn the same (fixed looks per regular, see `art/customer.tsx`),
  their lines in speech bubbles revealed one at a time (word by word, the mouth moving, a gesture per
  line by mood; they listen with a hand at the chin while the player speaks), the player's thoughts as
  narration strips, and choices as reply slips the player says (こう言う). After a regular's cup the scene waits until the
  player has read the reaction (話のつづきを聞く), and likewise at the door after a regular's delivery.
  A delivery request is a note left at the shop (pinned on the day's notice). Documents never open by
  themselves: a new paper lies in the document box, which glows; opened (or 手に取る from the notice), it is picked up
  and read as paper — letter, torn ticket, postcard, diary page, recipe card; every word
  clickable, confirmed words with their meaning written underneath, barely met words faint — then go
  into the document box on the counter; the blue cup and the carved ship go on the window sill (on the
  phone, onto the shelf). Re-reading a paper marks the words confirmed since it was last put away
  (they glow, with a count). Chapter title cards hang a wooden sign over the harbour. At night the
  window is dark, the lamp lit, the shelf stocked, and the day is written into the ledger book (lying on
  the counter, the night shop visible around it) line by line (takings, purchases, catalogue orders,
  purse, reputation, today's customers, goods kept for tomorrow, regulars met, words understood, things
  found, the player's thoughts — no list of how each cup or task went: the customers served, the shifts'
  tasks and wages); blowing out the lamp ends the day. Last night's ledger is in the box. A new chapter is
  announced the next morning in the banner and pinned on the notice; its title card over the harbour plays when
  the player opens it. ⚙ and the
  sound hook stay reachable over story cards and the night.
- **Sound**: synthesised effects (door bell, pouring, chopping, clinks, simmer, page turn, coins,
  stamp, confirm chime, soft failure (only for a container that is full), paper, the box, knocks, footsteps, pen in the ledger, the lamp
  blown out, a chapter bell, dawn birds, dusk) and an optional ambient loop; volume / mute / ambient
  in ⚙ 設定 (saved with the settings). Audio starts after the first user gesture and silently does
  nothing where Web Audio is unavailable. `prefers-reduced-motion` turns the animations off.
- **Performance**: the big textured layers (plaster and wood grain drawn with SVG turbulence filters:
  the shop backdrop by day and night, the phone's wall strip and counter, market stall frames, house
  fronts) are pre-rasterised once into images (`art/Raster.tsx`), so animations on top (waves, steam,
  blinking, the lamp) never re-run the filters; animated figures carry no filters (shadows are plain
  gradients) and the night lamp is a plain alpha layer, not a blend mode.

## Own meanings and the 単語帳 (the player's notes)

Decipherment needs a pencil: the player writes down what they think a word means and checks it later.

- **単語カード** (`src/ui/components/WordCard.tsx`): one tap / click on any word in the game opens a small card
  next to the word (desktop) or as a bottom sheet (phone): the word, 聞く, 「☆ 気になる」 (star → 単語帳), the
  player's **own guess** (自分の推測, one line) and a free **memo**, the sentences it was met in (each with
  聞く; a word in them opens that word's card), how often it was met and in which jobs, 「手帳で開く」. On desktop
  the guess field has keyboard focus at once (on a phone the keyboard would cover the card, so it is one tap
  away). Edits are saved on blur, on Enter, when the card closes (✕, Escape — which closes only the card, not
  the book under it — or a tap outside) and when another word's card replaces it. Words written on objects
  (jar labels, envelopes, crates, price tags, bins …) keep their object's own tap; a **long press** (touch) or
  a **right click** opens their card instead.
- **Where the guess shows**: the notebook's word list (「推 …」), the word page, the 単語帳, the 検証ページ slips
  (a pencil note under the word) and — subtly — in sentences: ⚙ 設定 「自分の推測（意味）を文の中の言葉に」
  言葉の下に小さく書く (default; small text hanging under an unconfirmed word — positioned under it, not a ruby, so a
  long guess never widens the word or opens a gap before the punctuation) / 触れたときだけ (hover title) /
  出さない. Documents (glossed paper) show the guess in pencil where a confirmed word shows its meaning.
- **Compare**: once a word is confirmed on its 検証ページ, the sealed card, the word page and the word card show
  the official meaning with 「自分の推測：「…」」 next to it.
- **単語帳** (notebook ribbon, `src/ui/book/Wordbook.tsx`, logic `src/core/wordbook.ts`): the starred words and
  words written in by hand, each with the player's meaning, memo, state (未確認 / 知っているはず / 推測あり / 確 /
  自分で追加), the jobs where it was met and how often; search (word, own meaning, memo), filters (state,
  job), sorting (newest, oldest, ABC, ふりかえりが必要な順), ✕ to remove (a linked word keeps its notes in the
  notebook). 「＋ 自分で書き入れる」 adds any word — also one the game does not have; text that matches a lexicon
  word (its text or a form, case-insensitive) is **linked** to that word instead of being added twice (notes on a
  linked word not met yet stay on the entry, so the word does not appear in 出会った言葉 or count as known to
  the planner before it is met). 「ふりかえる」 is a self-review round: the word (and 聞く) → 「自分の意味を見る」
  shows the player's own meaning and memo (the official meaning only for a word already confirmed) →
  覚えた / まだ (kept per entry; the round puts まだ and the longest unreviewed first). It never touches the hidden
  SRS.

## Jobs (仕事): many lives in one town

### The day and the town

- **Before day 4** a day is exactly the tea house day (始業前 → 業務中 → 業務後). On **day 4** the job board
  opens (a note pinned on the notice; from **day 1** when the start level places a job — en 英検4級 and up, see
  「The jobs at a start level」). **Every day still starts at a workplace, never on the map**: today's workplace,
  i.e. the one chosen after closing the day before (「明日はここで働く」 on a workplace's card in the town; it stays
  the choice until changed, `JobsState.next`) — at first the tea house. Before opening, the town map on the
  workplace's wall leads into **the town** (`TownHub.tsx`; labelled 町へ): tap a building → its card (job, rank, the
  level of its material, what it teaches, its hours) → **今日はここで働く** (the day moves there, still before
  opening; a shift planned but not begun is simply dropped) or back to today's workplace. The town: the delivery
  map, extended across the bridge by an east quarter where the new workplaces stand (newspaper office, town hall,
  post office, trading company, clinic, academy library, harbour kitchen; the inn is the map's inn; a building site
  with scaffolding stands for the jobs still to come). Every workplace shows at a glance whether it is open now (営業中 or its hours), the player's rank
  there (●●○○○) and 「新」 when something new waits. Phone: the map as an overview — a tap zooms into that spot,
  全体を見る zooms out — and the workplaces as signboards with the same badges (no tappable target under 40 px).
- **The parts of the day at a job**: 始業前 is the job's greeting — the boss says the day's first line; nothing is laid
  over the room: a 準備中 sign hangs over the counter with the day's number of tasks chalked under it, and turning it
  to 営業中 begins working hours (the label 札を返して始業 and a few beats of a ring on the first three days and the first
  two shifts at a workplace); the framed map on the wall (町へ) leads out to work elsewhere today. The evening's second
  shift starts the same way. 業務中 is the day's
  **shift**: the rank's `tasks` + `MAIN_SHIFT_EXTRA` (2) tasks. 業務後: out into the town, where a workplace with an
  evening shift takes one **second shift** (the rank's `tasks`; one a day; not the day's own workplace) — the
  tea house too, opened late: the shop only, from the back room (`BACK_ROOM_COST` = 1 coin a cup, no market, no
  house delivery). The evening market (goods for tomorrow) is in the town too. 「家に帰って帳簿をつける」 ends the day
  from the town, from a closed shop or from a finished shift; the night's ledger lists the shifts (tasks, お給金)
  next to the shop's accounts.
- **Hours** (`JobDef.hours`, unchanged field — its first meaning was 0 朝 / 1 昼 / 2 夕): 0 or 1 = the workplace has
  day shifts (it can be the day's workplace), 2 = it has an evening shift (業務後). Post office and office `[0, 1]`
  (日中のみ), inn `[0, 2]` and kitchen `[0, 1, 2]` (日中・業務後も), the tea house always; the newspaper office `[1, 2]`
  (the day's pages and the evening's late edition), the clinic and the town hall `[0, 1]` (日中のみ), the academy
  library `[0, 2]` (the reading room is open in the evening). A new job keeps writing `hours` as before. Every job's
  ladder has the same shift sizes: 4 / 5 / 5 / 6 / 6 tasks (rank 1 … 5), plus `MAIN_SHIFT_EXTRA` for a day shift.
- A day **without the tea house** leaves it closed: its planned customers come another day, its **stage
  clock does not move** (`clockOffset −1`, so no stage runs ahead while the player works elsewhere), and a
  planned story beat waits for another day (as before). The story, renovation, difficulty and metrics are
  unchanged; job tasks count in the day's indicators (first-try accuracy, new / review) like orders.
- **仕事の掲示板** (`JobBoard.tsx`): every job — what it teaches (archetypes, domains), its rank ladder with
  the **英検 grade / TOEIC band of each rank's material**, progress to the next rank, the next words the
  curriculum would bring there, and how many words of its domains no job covers yet; the town's goods store;
  the optional time-pressure switch; recommendations by the chosen yardstick (TOEIC → working-life jobs
  first; 英検 → the jobs whose first rank is the easiest grade).

### Ranks

One ladder for every job — every job has the same five ranks — with original names (the tide coming in, then
the lighthouse): **さざ波 → 潮だまり → 満ち潮 → 大潮 → 灯台**. **Ladder policy** (`checkRankUp`): the next rank opens
when its thresholds are met — `good` tasks done well (perfect / minor) in that job and `words` of the job's
vocabulary confirmed in the notebook — **and** most of the authored spine so far has been met (`SPINE_SEEN` =
80 % of the authored tasks of the current rank and below tried at least once), so a quick player never skips
a rank's own material. Thresholds are set per job at ~0.6 × the authored tasks of the ranks below. The planner
fills a shift with the spine first (all places of a 4-task shift; one place kept for template review in a
5–6-task shift), within the new-word budget (6 + rank). A rank-up comes at the end of a shift (a badge, the
reward — coins or goods — and what changes). Each rank is annotated with the level of its material
(`level: { eiken, toeic }`) and **unlocks harder variants**, not just more words: `long` (more letters,
more fields, a second condition), `audioOnly` (the request is only heard; shown as text where the browser
has no voice), `multiStep` (check → also choose the right value), `timed` (optional time pressure: only if
the player switched it on at the board; late = at best "minor"). The planner prefers the rank's own
templates (×3) over the previous rank's (×1.5) and older ones (×0.6, review).

| job | archetypes | domains | rank 1 / 2 / 3 / 4 / 5 material | authored tasks per rank |
| --- | --- | --- | --- | --- |
| 茶房 tea house (en + zh) | make, trade, deliver | food, cooking, health, shopping, money, family, weather, transport | 英検5 / 4 / 3・TOEIC〜400 / 準2・〜500 (= shop stages 1–6 / 7–12 / 13–18 / 19–23) | (the shop's orders) |
| 郵便局 post office | sort, trade, check, respond | post, transport, money, shopping, housing | 英検4 / 3・〜400 / 準2・〜500 / 2・〜600 / 準1・〜730 | 38 / 43 / 47 / 35 / 28 |
| 港の食堂 harbour kitchen | make, sort | food, cooking, health, shopping | 英検4 / 3 / 準2・〜400 / 2・〜500 / 準1・〜600 | 31 / 63 / 67 / 72 / 34 |
| 宿の帳場 inn front desk | check, respond, sort | hotel, travel, housing | 英検4 / 3・〜400 / 準2・〜500 / 2・〜600 / 準1・〜730 | 41 / 40 / 46 / 50 / 36 |
| 商会の事務 trading office | check, respond | office, meetings, sales, finance, logistics | TOEIC〜400 (英検3) / 〜600 (準2) / 〜730 (2) / 〜860 (準1) / 〜990 (1) | 33 / 36 / 32 / 32 / 35 |
| 新聞社 newspaper office (the Harbour Courier) | sort, check, respond | media, society, law, science, nature, finance, arts | 英検3・〜400 / 準2・〜600 / 2・〜730 / 準1・〜860 / 1・〜990 | 20 / 20 / 45 / 45 / 45 |
| 診療所の受付 clinic reception (Harbour Clinic) | sort, check, respond | health, body, family, money, emotion, society | 英検3・〜400 / 準2・〜600 / 2・〜730 / 準1・〜860 / 1・〜990 | 20 / 20 / 45 / 45 / 45 |
| 役場の窓口 town hall counter | sort, check, respond | society, law, housing, finance, money, hr, nature, communication, office (administrative English, TOEIC-flavoured) | 英検3・〜500 / 準2・〜600 / 2・〜730 / 準1・〜860 / 1・〜990 | 23 / 23 / 52 / 45 / 45 |
| 学院の図書室 academy library | sort, check, respond | science, school, arts, technology, society, nature, media (academic reading, 英検-flavoured) | 英検3 / 準2 / 2 / 準1 / 1 | 22 / 21 / 46 / 45 / 46 |

The four upper-level jobs (rank 1 ≈ 英検3級, rank 5 ≈ 1級; the board offers them from day 3, 4, 5 and 6 after it opens —
the newspaper, the town hall, the clinic, the academy) are reception and desk work only (no medical or legal advice), in
the trade's own words: courts, politics and the economy at the newspaper; symptoms, tests, medicines and insurance at the
clinic; permits, taxes, elections and appeals at the town hall; abstracts, citations, loans and copyright at the library.
Their colleagues (`JobPerson.staff`: the town hall's housing / tax / inspection desks, the clinic's doctors, nurse,
pharmacist and billing clerk, the newsroom's reporters and photographer, the library's assistants) hand work over and
ask as colleagues, but never come to the counter as clients (`visitorPeople`). Words: each job defines its own (news
390, clinic 427, town hall 255, academy 297) and uses the shared list (`common.en.ts`, 593 words, of which 283 came from
the four jobs when they were merged: a word used by several jobs is defined once); words `vocab.json` lacked were added to
`data/english/overrides/additions.tsv` with an estimated 英検 / TOEIC level and a gloss — but a word need not be in the
lists (they are a yardstick, not a limit: an off-list word only needs a gloss of its own). The English lexicon has
3 126 words: 英検5級 17 %, 4級 15 %, 3級 18 %, 準2級 21 %, 2級 9 %, 準1級 11 %, 1級 9 %.

Every job has authored + templated content for all five ranks (templates per rank: post 14 / 15 / 19 / 16 / 11,
kitchen 14 / 21 / 20 / 34 / 14, inn 13 / 18 / 14 / 14 / 13, office 14 / 14 / 13 / 13 / 14, news 9 / 12 / 17 / 16 / 16,
clinic 9 / 16 / 29 / 28 / 27, town hall 9 / 13 / 18 / 17 / 17, academy 9 / 12 / 17 / 17 / 17). Rank 5 (灯台) is the
longest reading: the kitchen's catering contracts, supplier notes, an inspector's memo, set menus with diet
rules and "if … use … instead" substitutions, spoken orders, sorting by the notes on deliveries / tickets /
customers' cards; the inn's group bookings, refund and deposit rules, late fees, complaint letters and their
replies, itinerary changes; the office's contract clauses and amounts, delays and penalties, claims, audits,
negotiation e-mails, minutes, and sentence completion with inversion / the subjunctive / concession. (A rank
without authored material of its own would say 「準備中」 in its note; a test keeps that honest.) The tea house's
ranks follow its existing progress (cups served well + its words confirmed); its harder material comes with
the shop stages.

### Task archetypes (`src/jobs/rules.ts`, benches in `src/ui/jobs/benches*.tsx`)

Each archetype owns its interaction (bench), rules (pure `evaluate` + `solve` + a `fumble` for the
simulator), reactions (issue kinds) and word tracking (which texts a mistake implicates → SRS lapses).
Outcomes follow the tea house: perfect, minor (small slip, ±0), fail, bad (harmful: an allergy ignored,
a wrong document approved).

1. **make** (kitchen; the tea house's brewing is its specialised ancestor): pantry → the dish; things and
   counts, vessel (plate / bowl / box / cup / glass / tray / bag), method (fried / boiled / grilled / steamed /
   baked / roasted, at the stove / grill / oven), "no onions" (a dislike: a plain mistake) vs "I can't eat
   eggs" (an allergy / doctor's order: harmful), a recipe card's **order** (`order`: the things it names must
   go in in that order — first / then are real), what the pantry is **out of** today (`out`: "if there is no
   fish, give chicken" is a real decision). Issues: empty, forbidden (bad), disliked, missing, extra,
   too_much / too_little, wrong_vessel (minor), wrong_method, wrong_order.
2. **sort & route** (post office, kitchen's deliveries, inn's luggage, the newsroom's copy, the clinic's patients, the
   town hall's applications, the library's returned books): a tray of letters / crates / bags / copy slips / charts /
   forms / books with their labels, a cabinet of labelled cubbies; tap (or drag) and place, hand in (the reply names the box a
   misplaced one belongs in).
   One wrong of ≥ 4 is minor. Crates show only their label (reading, not the picture, decides).
3. **check documents** (inn, office, post): papers side by side (or what the guest just said vs the booking
   book); stamp ✓ (問題なし) or circle the line that disagrees and stamp ✗ (at rank 3 also choose the right
   value). Generated papers are consistent: computed fields (totals, refunds, the last night of a stay) follow
   the values the paper shows, and a wrong paper has exactly one deliberate discrepancy (a wrong value against
   the other papers, or an arithmetic slip in a computed line). Missed → bad; false alarm / wrong line → fail;
   right line, wrong value → minor.
4. **respond** (inn, office, post): a person / letter / e-mail / phone call (the telephone rings; picked up,
   the call is read — or only heard at higher ranks); reply by choosing a reply slip (the wrong slips are
   **near misses on the same topic** — the wrong day, amount, person or condition, or a reply that does not
   answer what was asked: written per item in `src/content/jobs/near.en.ts`, plus facts the answer echoes from
   the message varied automatically, `src/jobs/nearmiss.ts`; three slips when an item has two near misses,
   answers of other topics only for an item with fewer; authored reply tasks likewise — their wrong slips are
   written per task in `NEAR_TASKS_EN` or taken from the QA item with the same answer, never stock lines such
   as "It is five kilos." under a question about a lost letter). A wrong slip must be wrong **on a careful read
   of the message alone**: it contradicts the message or itself ("Yes, we are closed until five", "No, every room
   has a bath"), answers another question ("It is two kilos." to "How much is a stamp?", "On the second floor." to
   "When …?"), or gets an echoed fact wrong — never a different value of a fact the message does not give (the
   price of a stamp, where the station is), which would be arguably right. The validator checks what can be
   mechanised (`nearProblems`, src/jobs/nearmiss.ts): a slip that reads as the answer (case, punctuation, markup
   aside) or twice the same, or one that only adds words of the message to the answer ("Sure. Here is your stamp."
   next to "Sure. Here you are." under "Can I have a stamp?") is an error; an answer that stands out by its length
   or by being the only question is a warning), writing the message pad (each field offers near misses), or picking
   the one free slot that fits on a week calendar or on the inn's floors (the generator makes exactly one cell
   fit the constraints; the validator re-checks it). A paper or call is handed over by the boss with a line
   of its own (`handover` lines), never in silence.
5. **trade** (post office counter; the tea house's market is the buying side): price board, goods drawers,
   the customer's coins, the till; hand over the goods and count the change. Rank 2: customers round up.
   Rank 3: parcels — put the parcel on the scale, read the weight, tap the postage for its destination and
   weight on the rate card (`TradeBench.rates`), charge it with the goods. Issues: wrong_goods,
   wrong_postage, change_short / change_over.
6. **go & deliver** (the tea house's delivery; the framework lists it for future jobs).

### Cross-job glue

Coins and the home / renovation are shared (`p.town.money`). **Goods** (`JobsState.goods`, the 倉庫 on the
board and in the town): a job's perfect tasks `produce` a good, another job `use`s it — each task done well
uses one and pays a bonus, with a line said in the target language (once a shift, not after every task). The tea house makes tea packets (→ the
office), the kitchen bakes bread (→ the inn's breakfasts and the tea house), the inn sends breakfast orders
(→ the kitchen), the office sends parcels (→ the post office). The regulars (Rose, Tom, Joe, Nora, Grant,
Hale, Captain Reed) come to the counters as clients; the bosses (Mrs. Wren, Chef Basil, Mr. Olsen, Ms. Park)
have fixed looks.

### Shared learning core

One lexicon / notebook / verification / SRS across jobs. Job words merge into the language's lexicon with
their own 検証ページ (3–5 words each, like every word). Words carry the jobs where they were met
(`JobsState.wordJobs`, plus static membership: every word a job's content uses; the tea house owns the
original game's words) and their domains (`LexEntry.domains`). The notebook's word list filters by job, by
英検 grade and by TOEIC band; a word's page shows its levels and its jobs. The 現在地 page shows progress per
英検 grade and per TOEIC band (tabs: 英検 / TOEIC / 並べる), overall or for one job; the 記録 page has a
per-job table.

## Curriculum: the compiled English lists (`src/curriculum/`)

- **Lists** (`data/english/`, compiled separately; never edited by the game): `vocab.json`
  (`{word,pos,eiken,toeic,cefr,ja,domains[],freq}`), `phrases.json` (`{id,text,type,eiken,toeic,ja,…,functions[],domains[]}`),
  `grammar.json` (`{id,name,nameJa,eiken,toeic,…}`). Reading is tolerant: a missing / broken file is an empty
  list with a note; an item without a word / id is skipped.
- **Bundling**: the Vite plugin (`scripts/englishLists.ts`) trims every item to what the game reads (first
  sense of the gloss ≤ 24 chars; no examples; domains as indexes), gzips it and inlines it as base64; the
  browser decompresses it once before the first render (`DecompressionStream`, a few ms). With the lists of
  this writing (11 182 words, 2 580 phrases, 302 grammar points): raw 2 743 KB → packed 912 KB → gzip 265 KB →
  **353 KB in the single file** (the build went from 955 KB to 1 450 KB: ≈ 353 KB lists, ≈ 140 KB jobs code,
  content and art; 600 KB gzipped). Without `DecompressionStream` the game runs without lists and says so.
- **Reconciliation** (`reconcileLexicon`, applied when the game data is built): a lexicon word found in
  `vocab.json` (headword or any of its forms; same POS preferred; the easiest matching item wins, so "is"
  takes the level of "be"; an inflected form taught as a word of its own — "names", "booked", "telling" — is
  looked up by its `lemma`, set per job with `lemmas: { names: 'name' }`, keeping its id and 検証ページ) takes its 英検 grade, TOEIC band, CEFR and domains from the list; the hand-written
  gloss stays (it is written for the meaning cards). A job word written without gloss / level gets them from
  the list. `validate-content` prints how many words matched and lists the ones missing from the list.
- **Reports** (`yardstickReport`): per 英検 grade / TOEIC band, cumulative — the list size, how much of it the
  playable content contains (**the ceiling**: drawn as a dashed frame; the rest cannot be learned in the game
  yet, said in words), how much the player has mastered, and how many of the lists' phrases / grammar points
  the content's tasks refer to. Scoped to a job: the list items of its domains and the words of its content.
  The 現在地 statement, the 目標 panel (英検 target) and the qualification estimate in 学習の記録 use these
  lists when they are loaded (else the game's own tags and estimated list sizes, as before).
- **Selection** (`selectNext`): the next words / phrases / grammar points for a job in the chosen yardstick's
  order — 英検: grade, then frequency (the school order); TOEIC: band, business domains first, then
  frequency — split into what the job's content can teach now (`teachable`, lexicon ids) and what no
  playable content covers (`uncovered`, counted honestly on the board). The shift planner gives template
  instances that introduce the next teachable words a bonus (within the shift's new-word budget, 4 + rank) and
  otherwise prefers instances full of due / weak words (hidden SRS). With 英検 as the yardstick, the
  selection is capped at the rank's grade + 1.
- **Yardstick choice** (レベル設定, en): 英検 or TOEIC, and a TOEIC target band. The board's recommendation and
  the curriculum order follow it; the 現在地 page can always show both.

## Jobs: content schema (for content authors)

Types: `src/jobs/types.ts`. A job is a `JobDef` (language-neutral frame) with `content: { en: JobContent }`.
Register it in `src/content/jobs/index.ts`; run `npm run validate-content` and `npm test`.

- **JobDef**: `id`, `nameJa`, `blurbJa`, `icon`, `domains[]` (the data/english taxonomy), `archetypes[]`,
  `ranks[]` (`{ rank, need: { good, words }, level: { eiken: '5'|'4'|'3'|'pre2'|'2'|'pre1'|'1', toeic }, unlocks?,
  tasks (per shift), reward?, noteJa }`; five ranks), `wage` (coins per outcome), `opensAfter` (days after the
  board opens), `hours?` (parts of the day it is open: 0 朝 / 1 昼 / 2 夕), `building` (hub art + hotspot in
  `src/ui/jobs/art.tsx` `BUILDINGS`), `links?` (`produce: [{ good, perPerfect }]`, `use: [{ good, bonus, line }]`;
  goods in `content/jobs/teahouse.ts` `GOODS`), `flavour: 'school' | 'work'` (work = measured in TOEIC bands by
  the validator, recommended for TOEIC).
- **JobContent**: `sign` (in-world sign), `lexicon` (the words this job defines — see the registry below; gloss /
  level may be left to the list), `pages` (検証ページ), `forms` (extra surface forms of *any* existing id, wherever
  it is defined, e.g. `{ want: ['wants', 'wanted'], rate: ['rates'] }`), `lemmas` (an inflected word taught as a
  word of its own → the list headword it is a form of, for the list lookup only: `{ names: 'name', in_book_v: 'book' }`), `people` (`{ id, name, avatar }`; a regular
  is listed by its customer id with an empty name), `boss`, `things`, the benches (`make: { vessels, methods:
  { id, word, art, surface: 'fried', where: 'stove'|'grill'|'oven' }, max }`, `sort: { bins: { id, label, ref, art },
  item }`, `trade: { coins, board, rates? }`), `tasks` (authored: the job's curriculum spine, served in rank / seq
  order until done perfectly), `templates`, `qa` (question / answer banks for reply choices: `{ q, a, fn, rank,
  near?, phrases?, grammar? }` — `near`: wrong replies on the same topic, usually written in `near.en.ts` keyed by
  job → bank → `fn` (`fn#2` for the second item with that function)), `reactions` (`{ id, kind, text, face, rank?,
  arch?, needs?, not?, voice? }` — `needs` / `not`: a pattern the task's texts must / must not match, so "Every bag is
  in the right place" comes only for luggage and "right in the book" only for the register book; `voice: 'person'`
  for a line only the person who asked can say, `'boss'` for a handed-over letter / e-mail / call; `late: true` for a
  `minor` line about time ("please be fast next time": said only when the work was right but the optional timer ran
  out; the other `minor` lines are for small mistakes and join the issue's own lines); kinds: `perfect minor any_fail` +
  the archetypes' issue kinds; placeholders `{bin} {field} {vessel} {name}` and, for a thing, `{thing}` (in the
  number the sentence needs: "the bread", "eggs"), `{is}` (is / are), `{much}` (much / many), `{it}` (it /
  them), `{this}` — e.g. `'Where {is} the {thing}?'`, `"So {much} {thing}! I can't eat {it}."`), `lines` (the boss's
  `start / end / rankup`, and `handover` lines — what is said when a paper / call / tray of letters is handed
  over without a spoken request; `msg` limits one to `phone | email | letter | memo | check | sort`).
- **ThingDef**: `{ id, word, art, tags?, plural?, mass?, unit?, one?, cook?, price?, bin?, max?, kilos? }`.
  `mass: true` for an uncountable noun (bread, rice, soup, milk): never a plural; counted by its `unit`
  (`'{n} pieces of bread'` — the unit noun is made singular for one: "one piece of bread"; or `{ one, other }`);
  reactions say "too much bread". A counted thing named in a `thing` slot is plural ("I love sausages!"), or
  `one` when it is served as one ("a salad"). `cook` lists the methods that suit it (no grilled eggs, no fried
  salad). Template slot tags also match `count` / `mass` automatically.
- **Text**: every in-world text is tokenised against the lexicon; proper names are written `{Mrs. Wren|@}`
  (shown as a name, never a word); `{surface|id}` forces a mapping (`{change|change_v}`). Digits and prices
  ("$4", "12") are free.
- **Tags**: a task / template / QA item may list `phrases` (ids in phrases.json one of its texts uses —
  validated against all of the task's texts: request, options, lines, papers) and `grammar` (ids in
  grammar.json it exercises). (There is no per-task `level`: a task is measured at its rank, and a word that
  stands next to its drawing — a thing, a method, a vessel, a bin with a picture — is exempt, the picture
  carries it.)
- **Authored make tasks**: `want`, `forbid` (allergy: harmful), `dislike` (not wanted: a mistake), `allow`,
  `vessel`, `method`, `order` (a recipe card's steps), `out` (the pantry is out of these today). **Trade**:
  `want`, `pay`, `post: { dest, kilos }` (a parcel to weigh; postage from the rate table).
- **Template slots** (typed): `qty` (a counted thing: "two eggs", "one piece of bread"), `thing`, `forbid`
  (allergy), `dislike` (preference), `method` / `vessel` (`only: [...]` when the sentence fits only some),
  `word` (a lexicon word by `ids` / `domain` / `pos` / `maxLevel`), `name` (`self: true`: the speaker names
  themselves — the person drawn is that person), `pick` (one of fixed `values`). Things are filtered by `tags`
  and by level (the rank's 英検 grade + 1); a method must suit every wanted thing's `cook`. Make templates may
  add `order` (slot names, in order) and `ifOut: { first, then, p }` ("if there is no {first}, {then}": with
  probability p the pantry is out of the first and the dish wants the second). Trade templates: `pay:
  'exact'|'round'`, `post: { dests: [{ id, text }], kilos: [lo, hi] }` (`{dest}` in the text). Sort templates:
  `patterns` with `{bin}` (the target bin's `ref`), `{thing}` (its `bin` decides), `{name}` (each name once per
  tray), `{num}`, `{digit}`, or fixed `bins`. Check templates: `fields` (`{ id, label, values? | range?: [lo, hi,
  step?] + fmt? ('{n} boxes', '${n,}' with thousands) | names? (1 → 'Monday') | calc?: expression, alts?:
  expressions }`), `docs` (which fields each paper shows, or `lines` with `{fieldId}`), `target`, `pWrong`,
  `wrongable`. A `calc` is an arithmetic expression over the fields listed before it (`src/jobs/expr.ts`:
  `'qty * price'`, `'(arrive - 1 + nights) % 7 + 1'`, `'days > 7 ? price : days >= 3 ? price / 2 : 0'`; content
  stays plain data). Respond templates: `mode: 'choose'` + a QA `bank`; `mode: 'form'` (the message pad) with
  `lines` using `{fieldId}`, `fields: { id, label, values[] }` (the other values are the near misses), optional
  `slots`, `from`, `subject`; or `mode: 'slot'` with `rows`, `cols`, `cellTags`, `want` / `avoid` constraint
  sentences, `busy` texts and `open` / `close` lines (one of each is chosen).

**Worked example** — a job's rank-1 sorting task, a template that varies it, and a counter template
(from `src/content/jobs/post.en.ts`); then a parcel at the scale, a phone message pad, a computed invoice and a
recipe card with an "if there is no …" decision:

```ts
tasks: [
  { id: 'p1_first', rank: 1, seq: 1, arch: 'sort',
    say: 'Good morning! Put the letters in the boxes, please.',
    bins: ['school', 'bank', 'hospital'],
    items: [{ id: 'a', text: 'To the school', bin: 'school' }, { id: 'b', text: 'To the bank', bin: 'bank' },
            { id: 'c', text: 'To the hospital', bin: 'hospital' }] },
],
templates: [
  // 3–4 letters (+1 from rank 2: 'long'), any of the place bins within the rank's level
  { id: 'pt_places', rank: 1, arch: 'sort', count: [3, 4],
    bins: ['school', 'hospital', 'bank', 'inn', 'station', 'library', 'park', 'church'],
    patterns: [{ text: 'To {bin}' }, { text: 'For {bin}' }, { text: '{Name}, at {bin}' }] },
  // "Can I have three stamps, please?" — the customer rounds up, the clerk gives change
  { id: 'pt_canhave', rank: 2, arch: 'trade', say: 'Can I have {qty1}, please?', phrases: ['ph-4-0004'],
    slots: { qty1: { kind: 'qty', tags: ['counter'], min: 2, max: 4 } }, pay: 'round' },
],
reactions: [
  { id: 'pr_ok1', kind: 'perfect', arch: 'sort', text: 'Good job!', face: 'happy' },
  { id: 'pr_bin1', kind: 'wrong_bin', text: 'No, no. This one goes in “{bin}”.', face: 'puzzled' },
  { id: 'pr_short', kind: 'change_short', text: 'My change is not right. I need more.', face: 'angry' },
  { id: 'pr_fail', kind: 'any_fail', text: 'Oh, no. That is wrong.', face: 'sad' },
],
// post: weigh the parcel, read the rate card, charge postage + goods, give change
{ id: 'pt_post3b', rank: 3, arch: 'trade', say: 'This parcel is for {dest}. And {qty1}, please.',
  slots: { qty1: { kind: 'qty', tags: ['counter'], min: 1, max: 3 } }, pay: 'round',
  post: { dests: [{ id: 'island', text: 'the island' }, { id: 'abroad', text: 'another country' }], kilos: [1, 6] } },
// post: the message pad by the telephone (the boss hands the call over with a `handover` line)
{ id: 'pt_pad2', rank: 2, arch: 'respond', mode: 'form', kind: 'phone', lines: ['Hello, this is {who}.', 'Please call me back {when}.'],
  fields: [{ id: 'who', label: 'Who', values: ['{Mr. Grant|@}', '{Ivy|@}', '{Nora|@}'] },
           { id: 'when', label: 'Call back', values: ['before three', 'after three', 'tomorrow'] }] },
// office: an invoice that adds up; when it is wrong, exactly one line disagrees
{ id: 'ot_inv1', rank: 1, arch: 'check', say: 'Please check this bill.', fields: [
    { id: 'item', label: 'Item', values: ['paper', 'pens', 'cups'] },
    { id: 'qty', label: 'Boxes', range: [2, 12] },
    { id: 'price', label: 'Price', range: [2, 9], fmt: '${n}' },
    { id: 'total', label: 'Total', calc: 'qty * price', fmt: '${n}' },
  ], docs: [{ kind: 'order', title: 'Order', fields: ['item', 'qty', 'price'] },
            { kind: 'invoice', title: 'Bill', fields: ['item', 'qty', 'price', 'total'] }], target: 1, pWrong: 0.6 },
// kitchen: a real decision (sometimes there is no fish) and a recipe card whose steps are judged
{ id: 'kt_ifno', rank: 3, arch: 'make', say: '{Thing1} and {thing3}, please. If there is no {thing1}, {thing2} is fine.',
  slots: { thing1: { kind: 'thing', tags: ['fish', 'chicken'] }, thing2: { kind: 'thing', tags: ['fish', 'chicken'] },
           thing3: { kind: 'thing', tags: ['rice', 'bread', 'salad'] } }, ifOut: { first: 'thing1', then: 'thing2', p: 0.5 } },
mk('k4_crack', 4, 'p_chef', 'Recipe card: Crack two eggs into a bowl. Add some cheese, then fry it. Serve it on a plate.',
   [n(E, 2), r(CHE, 1, 2)], { method: 'fry', vessel: 'plate', order: [E, CHE] }),
```

### The job lexicon registry (`src/jobs/lexicon.ts`)

Every word the jobs use is defined **once**: in the job that teaches it (`JobContent.lexicon` + its 検証ページ),
or — when several jobs use it — in `src/content/jobs/common.en.ts` (the shared list: everyday verbs and
connectives, the weekdays, the telephone and e-mail phrases …). Every job may use every word of the registry
(the language's lexicon is one list), and any job may add surface forms to any word wherever it is defined
(`forms: { rate: ['rates'] }` from the post office onto the office's `rate`). Job files never import each other:
`withJobs` (`src/jobs/merge.ts`) builds the registry from the common list and all jobs in any order. The
validator reports a word defined twice (same id, or a form that is already another entry's surface) as an
error naming both owners; a headword shared on purpose by a second sense written with markup (`{change|change_v}`)
is the usual ambiguity warning. Which words a job **introduces** is derived from use (`jobIntroduces`: the job's
texts and template slots at the rank they first appear), not from where a word is written; the notebook's job
filter and the board count use (`jobVocab`). Ids and 検証ページ ids are stable (saves refer to them): moving a
word to the common list keeps its id and page.

**What the validator checks (jobs)**: the lexicon registry (a word defined twice, forms on unknown ids); ids;
rank ladders (1..n, growing needs, valid 英検 keys, every job the same number of ranks); links → goods;
people / boss / persons exist (regulars by customer id); things → lexicon, units have `{n}`, mass nouns have no
plural; counter goods have prices; the rate table is dests × bands; every content text tokenises (names aside),
and the words that come only through template slots count as used; reactions' placeholders and patterns, a rank-1 `perfect`
and `any_fail`, a `perfect` usable by each archetype, `start` / `end` lines; QA banks (≥ 3 items, ≥ 2
functions; every item's near misses — written and derived — tokenise and stay within its rank's level, and an item
with fewer than two is warned about, since its wrong slips would come from other topics; the mechanical near-miss
checks above for every QA item and authored reply choice); computed check fields (their expressions name earlier fields); every authored task and 30
instances of every template at every rank it can come at: references resolve (bins, things, fields, vessels,
methods, options, pantry `out` / recipe `order` against the wanted things, postage on the rate table), solved
perfectly by the archetype's own solver, a customer never pays less than the total (postage included), the
papers of a check agree except on the one field marked wrong, **reaction fit** (every authored task and template
instance × every way it can end — right, late, each mistake its archetype can produce — has at least one reaction
line that fits the request and the speaker, `reactionScenarios` + `reactionPool`; a `late` line is kind `minor` and
never speaks of a mistake, a `minor` line about time must be marked `late`, a job with timed tasks has a late line), a paper / call task has something said (a
`handover` line), a speaker who names themselves is a person of the job and the one drawn, and the person drawn
never speaks of themselves in the third person ("{Chef Basil|@} wrote these tickets" is said by Ivy, not by the chef;
warning); **level**: words
above the rank's level + 1 grade are a warning, + 3 an error (work-life jobs: TOEIC bands where the word has
one; pictured words exempt) — for tasks, template instances, bin labels (at the first rank a bin is used),
reactions and the boss's lines (at their rank); **new words along the spine**: an authored task should bring
at most `SPINE_NEW` (4) words not met in the job's earlier tasks (the tea house's words count as known). Lists:
job words missing from `vocab.json` are allowed (the lists are a yardstick, not a limit; they are only counted, listed with
`VALIDATE_VERBOSE=1`, and a word without a list entry needs a written gloss), phrase / grammar tags are checked against the lists when present, a word without gloss needs one
in the list. **What was off**: every wrong answer a player can hand in to every authored task and to three instances of
every template at every rank (`wrongAnswers`: each other reply, each wrong value on the message pad, each other free
slot, approving a paper with a mistake, circling each other line, each wrong correction, a wrong count / change /
postage, each item in another pile, the wrong cooking method) is evaluated and its reaction built
(`explainIssue`); its text must tokenise, and where only a kind's generic line ("That is not right.") is left the
validator warns with the count; `validate-content` prints, per job, how many wrong answers got a line built from the
task (all but 6 of about 26 000 now, none generic). Template warnings are printed once per template and rank (with a
count). The jobs simulator
(`npm run simulate -- --jobs [--buy]`) plays the town end to end.

### Roadmap: jobs the framework is ready for

(The newspaper office, the clinic's reception, the town hall counter and the academy library, once on this list, are
playable now.)

| job | archetypes | domains |
| --- | --- | --- |
| fishing boat 漁船 | make (nets / bait to a spec), sort (the catch by kind / size), go & deliver (to the market stalls) | sea, nature, weather, food, transport |
| farm / market garden 畑 | make (planting plans), check (seed orders), trade (at the market, selling side) | farming, nature, weather, food |
| tailor 仕立て屋 | make (to measurements / colours / fabric), check (order ↔ garment), trade | clothing, crafts, money |
| railway station 駅 | respond (timetable questions, slot: the right train), trade (tickets), go & deliver (lost property) | transport, travel |
| bank counter 銀行 | check (forms ↔ ID, cheques), trade (exchange), respond (account questions) | finance, money, law |
| carpenter / builder 大工 | make (to a drawing: lengths, pieces), check (delivery ↔ order), go & deliver | crafts, housing |
| shipping agent 海運代理店 | check (bills of lading ↔ manifests), respond (schedules, e-mail), go & deliver | logistics, sea, sales |


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
**Economy with the jobs (en).** Jobs pay wages (3 coins a task done well, the office 4; a day's shift is the rank's
`tasks` + 2, an evening's second shift the rank's `tasks`) and rank rewards, on top of the tea house's takings, so
English prices are the shared prices × `RenoText.priceScale` = 2.2 (rounded to 5: the catalogue costs 1845 coins in
all; zh has no jobs and keeps the shared prices, 842). Calibration (`npm run simulate -- --jobs --days=70 --acc=…
--buy`: the board opens on day 4; the days alternate between the tea house's day with a second shift after closing
and a job's day with the tea house opened after closing; buying what is affordable): earned in 70 days (jobs + tea
house net), with the nine jobs — acc 0.95: 1405 + 1403, the whole catalogue owned on **day 47**; acc 0.85: 1295 +
1132, **day 53**; acc 0.7: 1050 + 979, **day 61** (with the first five jobs: 1391 + 1345 day 47; 1258 + 1241 day 50;
1109 + 822 day 63 — the new jobs spread the same days over more workplaces, they do not add days of work). A player who
never shops before opening and orders by delivery whenever the shelf runs out (`--order`, acc 0.85): 35 orders and 140
coins of fees in 70 days, the catalogue owned on day 60 — a real cost, not a punishing one. Ranks after 70 days at
0.85: news 3, academy 3, inn 2, kitchen 2, post / office / town hall / clinic 1 (the simulated player alternates and
prefers workplaces with an evening shift; the spine gate keeps each rank's material in play). The tea-house-only calibration (zh, and en before the
board opens): a player who serves everything right earns ~770 coins net of the market in 45 days (zh) and owns
the whole zh catalogue (842) around day 39–42.

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
  reserve) of up to `maxItems` goods become the shopping note, and those goods start the day at 0. The note never
  asks for more than the purse can pay at the dearest stall that has a good (lines are dropped from the end, a last
  line is shortened): a high start begins with the market's start money and a long note.
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

- **現在の実力の目安 (start)**: ゼロから / zh HSK1–3 (中検・CEFR shown; higher HSK levels are listed as 未対応) / en
  **every 英検 grade, 5級 … 1級** (CEFR・TOEIC shown), chosen on either yardstick: 「英検で選ぶ」 (the grades) or
  「TOEIC で選ぶ」 (〜400 … 〜990; `DifficultyState.startToeic`): a TOEIC start assumes the words **by their TOEIC band**
  from `data/english/vocab.json` (every lexicon word whose list band is at or below the chosen one; `startWords` /
  `inStart` in `core/difficulty.ts`), so every band seeds its own set — 〜860 and 〜990 differ — and the jobs are placed
  by their ranks' TOEIC bands. The band's 英検 equivalent (〜400 = 3級, 〜500 = 準2級, 〜600 = 2級, 〜730 / 〜860 = 準1級,
  〜990 = 1級) is only the label, the shop stage and the fallback for the few words the list gives no band; changing
  between bands is exact like changing grades (`src/core/startToeic.test.ts`). The en tea house has a stage for
  each of the higher grades too (24 = 2級, 25 = 準1級, 26 = 1級: English-only `LanguageContent.stages`,
  `src/content/en/stages3.ts`, over 40 authored orders each, in the rule space of stages 1–23), and its ranks 5 / 6 / 7
  (外海 and 北極星 above 灯台) are those grades; the jobs carry them as well (their rank 5 is 準1級 / 1級).
  Choosing a level seeds every lexicon word
  tagged at or below it as **assumed known — 未確認（知っているはず）** (`WordState.seeded`, seen 6 / correct 2
  added, first review spread over 3–14 days so they come back now and then). Assumed words count as known for
  the game's pacing (`isKnown` in `core/srs.ts`: task selection, curriculum skipping, 現在地, job rank thresholds)
  but are **never confirmed by the level**: no meaning is shown anywhere for them (scene glosses, documents,
  notebook, word card), the notebook lists them as 「知っているはず」 with an empty own-meaning field, and they are
  confirmed like any word — on their 検証ページ, which opens once the page's words have been met in play
  (`playSeen`: the level's 6 seeded encounters do not count) — nothing is sealed by the start level. Starting
  higher marks earlier curriculum orders made only of known words — or of words written on the shelf and the
  tools (ingredient labels, hot / cold, the methods: "Mint." is answered by reading the jar) — as done — only below the level's band (`START_FLOOR`: zh 5 / 10 / 15, en 6 / 12 / 17 / 21 / 24 / 25 / 26;
  orders with other unknown words — units like slice / cube, higher-level words — still come, at most one a day, see
  below), and fast-forwards the shop to the level's stage (`START_STAGE`: zh 6 / 11 / 16, en 7 / 13 / 19 / 23 / 24 /
  25 / 26 — calibrated on the curriculum's structures, since level tags are spread over all stages). **A placed
  player's days come from the band** (`placedFloor`, `src/activities/shop/dayplan.ts`): the curriculum from the
  floor up, in order; template review and the fallback review from the band's stages too; an easier curriculum
  order (below the floor) at most once a day (`MAX_BELOW_FLOOR`) and never first. ゼロから has floor 1, so its plan
  is unchanged (`src/activities/shop/placed.test.ts`). The fast-forward brings the stage's reputation, a stage-clock offset (`stageDay` = day + offset gates
  stages and town unlocks), market / delivery experience and money; the delivery curriculum's slips of the levels
  below the one reached are skipped like early orders (`town.slips[id].seeded`), so a high start's first slip is of
  its delivery level, not "To the school. In the morning.".
- **The jobs at a start level** (en, `src/jobs/placement.ts`): each job starts at the highest rank whose material
  (`RankDef.level`, on the yardstick the start was chosen by) is at or below the start — a 英検2級 start puts the
  post office, the kitchen and the inn at 大潮 (2級) and the office at 満ち潮 (2級); 準1級: 灯台 / 灯台 / 灯台 / 大潮;
  1級 or TOEIC 〜990: every job at 灯台. When a job is placed (英検4級 and up), **the job board is open from day 1** and
  the placed jobs are offered at once (`opensAfter` is for players growing into them; a job whose first rank is above
  the start opens as usual), with a short Japanese note on the first morning (「実力に合わせて、町の掲示板が最初の日から
  開いている。郵便局は「大潮」（英検2級の内容）から…」) and in the level sheet's preview. A placed job serves its own
  rank's authored tasks as new material from the first shift (`JobProgress.placed`; the authored tasks of the ranks
  below are not served as new, their templates still come as review — at most one a shift, `MAX_BELOW_PLACED`), the ladder above it is as far as for a player
  who climbed there (the ranks below count as done: `placed.good`; the spine gate counts only the placed rank's own
  tasks), and nothing is revealed — the words stay assumed known. Ranks never go down when the level is lowered (like
  the shop's stage). Simulated (`npm run simulate -- --jobs --start=5 --tasks` / `--start=6`): day 1–3 shifts are the
  rank-4 / rank-5 authored tasks plus a template for review. The 腕だめし check uses the tea house's orders, so it
  can confirm levels up to the highest one those orders reach and says so; higher grades are chosen by hand. Each assumed word can be taken back (学び直す) and is then not re-seeded. The
  only way to see an unearned meaning is the opt-in 手助け 「意味をのぞく」 (off by default at every level; costs
  reputation).
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
  of an unconfirmed word on its notebook page (評判 −1); 「もう一度つくる」: after **every** cup (so that it never tells
  how the cup went) the same customer again, state restored (the first try still counts in the indicators as it
  went; not for regulars' story visits; anything else done after the cup — a catalogue order, a sealed page, a
  memo, a story card — ends the chance, since the restore would undo it); audio-only orders off / normal / many
  (also the market's spoken quotes); slower speech. (The former 「まちがいの印」 assist, which marked the words a
  failed cup was about, is retired: `assists.markMistake` stays in saves and does nothing.)
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
  start seeds the low-level ones (cat, box, new, 猫, 新 …) as assumed known (知っているはず); like every 検証ページ,
  the catalogue's pages are sealed only by the player. Seeded words not met in play since are left out of the red ribbon's 復習 list.
- **Money and reputation at a mid-day level change** are not counted as the day's takings / reputation in the
  ledger (the day's start values move with them), like confirmed words.
- **Indicators**: catalogue orders, catalogue reading and décor remarks are not orders; the retry assist
  restores the whole progress, so coin / reputation bonuses (kettle, scales, ice box, signboard, lantern)
  are paid once, for the cup that counts. A gloss peek costs reputation; catalogue entries already shown do
  not disappear because of it.

## Learning model notes

- **Saves (v6, the day in three parts)**: `TownDayState.part` (0 始業前 / 1 業務中 / 2 業務後), `at` (shop / market /
  delivery), `incoming` / `arrived` / `fees` (supplies ordered by delivery), `evening` (the tea house opened after
  closing); `MarketDay.mode` / `trips` / `fee` / `from`; `TownProgress.pantry` (goods bought after closing, kept for
  tomorrow); `JobDayState.work` (today's workplace) and `evening` (the second shift), `JobsState.next` (the
  workplace for the next days); `StoryCard.deferred` (waiting in the scene). The v5 → v6 migration puts a day in
  progress where it was: at the market only if a trip was under way (a stall open, something bought), else in the
  shop before opening; serving → 業務中; closed or out delivering → 業務後; a shift under way → that job, its part
  from the shift's phase; the town after some work → 業務後; a morning in the town with nothing done → the tea
  house, before opening. Cards that came with the morning (and, before opening, every card waiting) are deferred;
  a resumed day's story catch-up (`ensureTownDay`) is deferred too. Checked with saves written by the v2, v3, v4
  and v5 code (git worktrees) and v1 saves, at the start of a day, at the market, mid-shop, closed, at the delivery,
  mid-shift and in the town after a shift: each loads, plays on and reaches the next day.
- **Saves after the four upper-level jobs (no version bump)**: the new jobs' progress is created on first use
  (`jobProgress`), a task result's issue may carry `got` / `want` (what the player gave and what the task needed, for
  the reaction), people may be `staff` (content only). No word id a save could hold changed: the merged words keep the
  ids of the common list and of the five earlier jobs; the four new jobs (no saves yet) got clean ids and regrouped
  検証ページ. Checked in the browser with saves written by the v6 build (git worktree): the start of a day, at the
  market, mid-shop, closed, a workplace before its shift and mid-shift, en and zh; and v1–v5 saves as before.
- **Saves after this round (no version bump)**: optional `DifficultyState.startToeic` (the start chosen as a TOEIC band),
  `JobProgress.placed` (`{ rank, day, good }`: the job was placed at that rank by the start level) and
  `town.slips[id].seeded` (a delivery slip skipped by the start level). Word ids are
  unchanged (the inflected words got a `lemma`, not a new id), so older saves load as they were.
- **Saves (v5, own meanings + 単語帳)**: `WordState.guess` (the player's own meaning) next to `memo`;
  `LangProgress.wordbook` (`{ entries, seq }`: starred / hand-written entries, self-review verdicts); setting
  `guessDisplay`. The v4 → v5 migration: words confirmed only by the start level become assumed (未確認・知っている
  はず; `confirmed` false, `seeded` kept), 検証ページ the level had sealed reopen, and at load `repairAssumed` re-confirms
  assumed words whose page the player sealed in play; the old single memo (「自分のメモ（推測）」) becomes the guess;
  an empty 単語帳. Everything is in the JSON export / import (file and text). A running day saved without its
  queue (old v1 saves) is planned again at load instead of crashing.
- **Saves after the jobs' second pass**: no version bump — the new fields are optional (`TaskInstance.handover`,
  answers' `seq` / `postage`, `TownDayState.fromBack`; a shift saved mid-way with older task instances plays on).
  The job lexicon kept every id and 検証ページ id (the registry reproduces the earlier lexicon exactly), so
  notebook and verification progress carry over.
- **Saves (v4, jobs)**: the v3 → v4 migration adds `jobs` to each language's progress: the tea house becomes
  the first job with its served / perfect cups as the job's task log (its rank is worked out once at load
  from that and its confirmed words; rewards paid), an empty goods store, and the board opens the next
  morning for saves already past day 4 (a day in progress continues in the tea house). Everything else is
  kept as it was. `jobs.day` holds today's parts (which job, the running shift); `jobs.wordJobs` where words
  were met; `jobs.jobs[id]` rank, tasks, good, authored log, rank days.
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
- Speech uses the browser's `speechSynthesis` (`src/ui/speech.ts`). Voice choice (`voiceCandidates` / `pickVoice`,
  unit-tested with mocked voices): the player's own choice (⚙ 設定 → 読み上げ: 声, by voiceURI, `Settings.voices` per
  language) when it is still there, else en-US, then en-GB, then other English; for Chinese zh-CN / cmn, then zh-TW —
  never Cantonese (zh-HK, yue); the system default first within a tag, novelty voices last. The voice list loads
  asynchronously (`voiceschanged` plus a short poll for engines that never fire it); ⚙ 設定 shows 「音声を読み込んで
  います…」 meanwhile, then the voice picker, the speed and 「声を試す」 (reads a sample with the chosen voice and
  speed). Without a voice for the language — or without `speechSynthesis` at all — the listen buttons are disabled,
  audio-only orders are shown as text, and ⚙ 設定 says which of the two it is. Sound effects: `window.__minatoAudio()` (diagnostics) reports the AudioContext state
  ('none' before the first gesture, 'running' after) and plays any effect by name.
- **Reactions say what was off** (`src/jobs/explain.ts`): a wrong answer's reaction is built from the task's own facts
  and the player's answer (`JobIssue.got` / `want`), so every mistake can be learnt from and none is a bare verdict. A
  reply: the one fact that changed, if the replies differ only by a fact (a number, an amount, a time, a day, a name, a
  capitalised place — not a changed verb form) — "The caller said Thursday, not Wednesday." (from the message) or "It
  is $25, not $5." (computed); otherwise the line of the message that supports the right reply ("But the notice says:
  “…”"), or the question that was asked when the reply answers another one ("But I asked: “What time do you close on
  Friday?”"); a sentence with a gap is said as it reads with the word that fits. A paper: "The address is 12 Bridge
  Street here, but 21 Bridge Street on the passport." (missed), "The fee is $20, and the fee list says the same." (a
  correct line circled), "The name is …, the same as on the passport. Look at the address." (the wrong line), "The
  doctor's note says three times, not four times." (the wrong correction); a label that does not read as a noun is
  quoted ("Valid until: May 3 here, …"). A slot: "Wednesday, 9:00? But I said: “I can come on Wednesday or Thursday,
  but not in the morning.”" (the line that names what differs from the cell that fits). The message pad: "The caller
  said 6204, not 6024." The counter: "I asked for 3 stamps, not 4.", "My change is 9 coins. It should be 10 coins.",
  "The card says 12 coins for this parcel, not 13 coins." A pile: "“To the bank” goes in “the bank”, not in “the
  school”." A dish: "I wanted it fried, not boiled." A small mistake starts with "Good. But …". The kind's own lines
  (written per job) give the person's face, and are said only where nothing can be built.
- **Reaction lines fit the request and the speaker** (`reactionFits`, `src/jobs/engine.ts`; every pairing of every
  task and template instance with every line it can get was dumped and read, and the rules below now flag the classes
  of mismatch that turned up): who speaks (`reactionSpeaker`: the person drawn, or the boss for a handed-over paper /
  call) — lines only the one who eats or receives the work can say ("My plate is empty!", "I am still hungry", "Tell
  the chef …") never come from the boss or over a recipe card / ticket / a dish for someone else; a line naming the boss
  is not said by the boss; "I am a hungry man" not by a woman (gender from the drawn look); how the request came —
  "Please listen again" only after a spoken request or a call, "read it / the card again" only after a written one; the
  asker's own lines ("not an answer to my question") only face to face; "please send it" only for a written reply; a
  line pointing at a paper or a thing ("Read the note again", "the book is right") only when the task has it. Lines that
  fit are preferred; where none would, the validator reports it as an error. Paper field labels read naturally after
  "the" (`fieldInText`: "the tracking number", "the “By” line", never "the by"). Also — "Both of us are happy" when
  nobody else was mentioned, "My son will love this" without a child in the request, "I can't eat it" / "no …
  for me" when the request said someone else can't eat it (the kitchen has a third-person-safe line for that).
  Lines can also say themselves what they need (`needs` / `not` patterns on the task's texts, `voice`): "Every bag is
  in the right place" only for luggage, "This box is for …" only for crates, "right in the book" only where there is a
  register book, "the bread I bake at home" only over bread, a guest's "you did not understand me" only when the guest
  spoke (a handed-over letter gets the boss's line). The thanks for a link good ("And thank you for the tea …") is
  said once a shift.
