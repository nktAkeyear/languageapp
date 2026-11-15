# Job-simulator UI research and a screen grammar for the nine workplaces

Purpose: the owner finds the current UI bad and asked us to learn from job/shop-simulation games. This file records what
could be learned, then recommends one screen grammar for all workplaces and a change list.

## 0. Method and reliability (read first)

- Tools: web search only. `WebFetch` failed on every host tried (DNS not allowed in this session: mechanicsofmagic.com,
  medium.com, store.steampowered.com, gamedeveloper.com, gameuidatabase.com, gmtk.substack.com, hardcoregaming101.net,
  gameplay.tips). So every claim below comes from search-result summaries, not from reading full pages. Claims marked
  **(inference)** are mine, not read from a source. Several sources are fan wikis or low-quality pages; those are flagged.
- Not found at all: Bear's Restaurant (search returned only real restaurants), Cook, Serve, Delicious! (only real kitchen
  display systems), Overcooked, Shop Titans' actual screens, Game UI Database / Interface In Game pages, any GDC talk text.
  Thin: Coffee Talk and Dave the Diver screen layout. The owner's game トルービズの秘薬師 was reached only through the
  Steam store text as summarised by search (<https://store.steampowered.com/app/4083190>).
- Starting point: README "Presentation" and day model; screenshots in
  `/tmp/claude-0/-home-user-languageapp/756d2283-0d7f-568d-9dbb-db0c7ecf2bc9/scratchpad/round7/shots/`; `docs/DESIGN_REFERENCES.md`
  house rules (touch targets 44px, body 16px on phone, 11px functional minimum, 4-unit spacing, no right/wrong marks).

## 1. Per game

Format: structure / loop and input / day / stock and orders / requests / feedback / phone / **take**.

### Papers, Please
- Structure: three areas on one screen: the booth, the inspection desk with stamps, and the queue; documents dragged to
  the desk are enlarged so they can be read ([CMU ETC PDF](https://press.etc.cmu.edu/file/download/832/efe92887-a02b-4efa-be32-0a1e046baac8)).
  A rulebook, stamps and drawers make the interface carry the pressure ([Birdor case study](https://birdor-blog.pages.dev/papers-please-moral-mechanics-success-case-study/);
  weak source). The player drags items and documents around, and the clutter reads as a real work surface
  ([Ashlander Analysis](https://ashlanderanalysis.substack.com/p/papers-please-a-modern-classic)).
- Documents: field labels are kept less prominent than the personal data ([Mechanics of Magic](https://mechanicsofmagic.com/2021/06/05/design-details-in-papers-please/),
  via search summary). The dev's early plans had a speaker for questions and a teletype handle for requesting
  information ([dukope devlog](https://dukope.com/devlogs/papers-please/tig-00)). The "clunky" interface is called deliberate
  ([Wikipedia mirror](https://wiki.krisyotam.com/content/wikipedia_en_all_nopic_2026-03/Papers_Please)).
- Day: per-day shift with a summary (general knowledge; no source read here).
- **Take:** (a) the document being worked on gets enlarged on a dedicated surface; (b) labels quieter than values;
  (c) clutter is acceptable only because every object has a job. Our desk jobs (clinic, town hall, newspaper) already
  use this, but the surface is mostly empty and the text small (see section 3.5).

### Potion Craft
- Structure: a large map stays visible behind the brewing stand; players drag and grind ingredients, and each ingredient
  has a path that moves the brew across the potion map ([review summary via search: Medium](https://medium.com/@saragiraltfdez/potion-craft-and-its-lovingly-well-crafted-ui-57670cec4e13),
  [HackerNoon](https://hackernoon.com/a-look-at-potion-craft-an-alchemist-simulator)). UI shares the drawing style of the world, so it
  feels less intrusive (same Medium piece). Mouse-based dragging; controller and Steam Deck reviews mixed
  ([same Medium summary / Steam Deck reviews via search]).
- **Take:** UI in the world's drawn style works; drag-heavy tools are a mouse idea and need a tap path on phone (we have it).
  Discard the Alibaba "oil map" pages the search returned (unreliable).

### Strange Horticulture
- Structure: one counter, one book, one decision ([Spawning Point retrospective](https://spawningpoint.com/article/strange-horticulture-retrospective-the-gentle-macabre)).
  From the desk: serve customers, read mail, inspect/label plants, consult the guide, solve puzzles
  ([GameGrin and others via search](https://gamegrin.com/reviews/strange-horticulture-review)). Customers say what they want (name, effect or
  appearance) and the player matches it using the book ([review summary via search](https://www.backloggd.com/reviews/everyone/eternity/liked/strange-horticulture/)).
- Criticism: UI called poorly designed; controller adaptation poor (same search results).
- **Take:** the closest relative of our game: reading a description, looking something up in a book, handing over the item.
  One surface, a book that is always one gesture away. The UI criticism is a warning that a reference book needs fast open/close.

### Coffee Talk and VA-11 Hall-A
- Drinks stand in for dialogue options; VA-11's mix is described as a dialogue menu with each drink triggering a reaction;
  Coffee Talk has you pick three ingredients, a base first ([Game Developer on VA-11](https://gamedeveloper.com/design/a-breakdown-of-the-drink-choice-mechanic-in-sukeban-games-i-va-11-hall-a-i-),
  [Giant Bomb](https://giantbomb.com/users/4945/articles/indie-game-of-the-week-280-coffee-talk), via search summaries).
  Coffee Talk has a backlog and skip-read-text; VA-11's mixing UI and catalogued recipes were praised
  ([Avian Gamer](https://aviangamer.blogspot.com/2022/03/coffee-talk-review-conversation-and.html), [Giant Bomb analysis](https://www.giantbomb.com/profile/gamer_152/blog/slow-night-an-analysis-of-va-11-hall-a-cyberpunk-b/118067/)).
- **Take:** feedback is the customer's reaction, not a score (what we already do); a backlog of what was said is a
  cheap, valuable tool for a reading game. Layout detail (what is always on screen) was not retrievable.

### Good Pizza, Great Pizza
- One order at a time; pick dough, sauce, toppings and bake time; ingredient order does not matter; ratings per order
  feed later costs; a reviewer noted customer feedback does not always make the star count clear
  ([App Store listing](https://apps.apple.com/app/911121200), [store/early-review summaries via search](https://weloveeverygame.com/games/770810-good-pizza-great-pizza-cooking-simulator-game.html)).
  Mobile version has idle earnings.
- **Take:** one request at a time on screen keeps cognitive load low; order-independence removes needless fiddliness;
  unclear scoring is a known complaint, so our "reaction names what is wrong" is the right fix.

### Recettear and Moonlighter (shop phase)
- Recettear: you see the customer's chosen item and set the price; one more offer before they leave; reputation rises
  with successful transactions ([writeups.org guide](https://www.writeups.org/recettear-strategy-guide-tips/), Steam threads, community; fan material).
  Moonlighter: price set when the item is placed on display; customer reaction faces from "too cheap" to "too high"
  ([Siliconera](https://siliconera.com/?p=709874), [fan mechanics page](https://saschb2b.github.io/game-mechanics/games/moonlighter-2/shop-pricing)).
  Moonlighter runs the shop by day and the dungeon at night ([PC Gamer](https://www.pcgamer.com/au/moonlighter-review)).
- **Take:** reaction faces as the only feedback channel; shop day and a separate "other place" phase. The day split
  (shop vs elsewhere) maps to our hours vs after-closing.

### Supermarket Simulator and TCG Card Shop Simulator
- Loop: order stock on the in-store computer, wait for delivery, carry boxes in, stock shelves, set prices; a tablet was
  added to order and track stock; delivery can take up to about 2 minutes; box of 12 units; ordering cap; local stores
  cheaper than computer ordering ([fan guides: gameplay.tips](https://gameplay.tips/guides/supermarket-simulator-guide-to-storage-room-organization-and-purchasing.html),
  [Steam discussions](https://steamcommunity.com/app/2670630/discussions/0/4431066216145353176), via search; fan material).
  TCG Card Shop Simulator: a Stock Order app on the in-game phone; items arrive after a brief delivery time; shipping fee
  tiered by box count; at most 20 different items per order; workers move boxes from storage ([wiki](https://tcg-card-shop-sim.upcomer.com/wiki/Stock_Order),
  [Prima Games](https://primagames.com/tips/worker-restocking-guide-in-tcg-card-shop-simulator); fan wiki, details inconsistent between sources).
- **Take:** ordering is an in-room device (computer/phone/tablet), not a trip; delivery is a visible arrival
  (boxes appear) with a delay; a fee tier is shown on the form; a storage room is distinct from the shelf. Exactly the
  "order form + stock arrives" idea requested.

### Dave the Diver (sushi bar)
- Search found only official blurbs (night: serving patrons at a seaside sushi bar, [PlayStation](https://playstation.com/games/dave-the-diver))
  and a Game Developer interview. Nothing on its order bubble UI. A comment about a different sushi game says new order
  pop-ups that darken the screen or cover the belt are annoying ([itch.io post](https://itch.io/post/7856681)).
- **Take (inference from that one comment):** never cover the work surface with a modal for a new request.

### Cook, Serve, Delicious!, Overcooked, Bear's Restaurant
- Not found. Generic kitchen-display-system sources describe ticket boards in cook order, tickets escalating with age,
  large touch targets, and station routing ([vp0 KDS UI](https://vp0.com/blogs/restaurant-kitchen-display-system-kds-ui/), [Toast](https://doc.toasttab.com/doc/platformguide/platformKDSOverview.html)).
  Those are real-restaurant products, not games.
- **Take (inference):** a ticket rail along one edge, oldest first, is the established pattern; we use a nail with tickets.

### Unpacking
- Wordless; a misplaced item gets a red outline (colour changeable); some find it intrusive; accessibility options:
  enlargeable UI buttons, room-swap animation toggle; on touch, small items are hard and the finger covers them even
  with zoom ([Medium review](https://medium.com/@danieljaystrakosch/unpacking-review-48353227beca), [developer site](https://unpackinggame.com), [Pocket Gamer](https://www.pocketgamer.com/unpacking/review/); via search).
  Rooms are separate screens swapped by the player.
- **Take:** drag targets on a phone must be large and the dragged object offset from the finger **(inference)**;
  our "nothing is marked right or wrong" rule is stricter than Unpacking's red outline, which is fine.

### Mind Scanners, Lil' Guardsman, Not Tonight
- Mind Scanners: tactile drag-and-drop, built on Papers-Please-style admin ([The Sixth Axis](https://www.thesixthaxis.com/2021/05/18/mind-scanners-review/)). Lil' Guardsman: point-and-click,
  three actions per encounter ([Adventure Game Hotspot](https://adventuregamehotspot.com/review/1606/lil-guardsman)). Not Tonight: checks escalate (age, then expiry,
  then forgery) and the area gets cluttered with new papers ([Gaming Trend](https://gamingtrend.com/feature/reviews/id-please-not-tonight-take-back-control-edition-review/), [PC Gamer](https://www.pcgamer.com/not-tonight-imagines-a-drudge-filled-brexit-dystopia)). Not Tonight's actual layout not retrievable.
- **Take:** introduce one document and one check at a time and add more with rank; capping actions per encounter keeps the
  screen readable. Matches our rank ladder.

### トルービズの秘薬師 (the owner's inspiration)
- A short fictional-language decipherment puzzle: the workshop contains only a manual in the invented language; the
  player writes their own translation per word (the same word fills in automatically), tests hypotheses, and
  sometimes must predict before checking; hints sit in the manual; progress and discovered potions carry over between
  runs ([Steam store text via search](https://store.steampowered.com/app/4083190); Dutch store page same).
- **Take:** (a) the workshop is where you read and annotate; patients come to you; (b) "my own meaning per word,
  auto-filled everywhere" is the notebook model we already have (README 単語帳); (c) hypotheses stay editable; nothing locks.

### Chants of Sennaar and Heaven's Vault (notebook)
- Sennaar: every new glyph is auto-logged to the notebook; the player types a guess shown above that glyph next time;
  matching tests replace the guess with the real meaning; weak on grammar recall ([Language Log](https://languagelog.ldc.upenn.edu/nll/?p=62698), [Axios](https://www.axios.com/2023/09/08/chants-of-sennaar-rundisc-interview),
  [Wikipedia](https://EN.wikipedia.com/wiki/Chants_of_Sennaar)). Players asked for a way to revisit old conversations
  (same Language Log thread).
- Heaven's Vault: working translations live in a notebook; words lock in as confidence grows, the game never locks you
  into a wrong translation and never marks red; the translation screen was criticised for little feedback and for
  becoming unwieldy as it grew ([The Sixth Axis](https://www.thesixthaxis.com/2019/04/16/heavens-vault-review/), [Slant](https://www.slantmagazine.com/games/heavens-vault-review/),
  [Em Short](https://emshort.blog/2019/07/23/heavens-vault-inkle/)).
- **Take:** the notebook must show the player's own guess above or next to the word in place, be searchable, and
  keep a replay/backlog of recent lines. Show confidence, not right/wrong.

### Stardew-style day summary
- Shipping-bin gold arrives the next day; end-of-day screen was resized in 1.6 so category pages do not fill the
  screen; very large numbers overflowed their boxes ([wiki](https://stardewvalleywiki.com/Shipping), [forum](https://forums.stardewvalley.net/threads/end-of-day-shipping-info-visual-issue.34475/latest)).
  Tooltip showing the expected sale total was a popular mod ([Nexus](https://www.nexusmods.com/stardewvalley/mods/7315)).
- **Take:** a summary should be one screen, short, with a clear single "next" button; guard numeric overflow.

### Shop Titans / mobile shop sims
- No usable source about its portrait layout or queue (search returned generic mobile-UI advice only). Generic: 44pt
  (Apple) / 48dp (Material) targets, visible area may be smaller than the hit area ([OpenReplay](https://blog.openreplay.com/improving-tap-targets-mobile-ux/),
  [W3C](https://www.w3.org/WAI/GL/mobile-a11y-tf/wiki/M2)).

## 2. Cross-cutting patterns

| Archetype | Seen in | Desktop (reading-heavy) | 390 px phone |
|---|---|---|---|
| A. Desk with documents; the person is a strip above | Papers, Please, Mind Scanners, Not Tonight | Best for paper jobs: big enlarged page, stamps. Needs the page to dominate. | Works if the page fills the width and is the only big thing; tools collapse to a bottom bar. |
| B. Counter: customer above, tools below | Good Pizza, Coffee Talk, VA-11, Strange Horticulture | Great for dialogue plus a few tools; customer text can be large. | Stack: ask card, then work surface. Tools must scroll or page; keep to about 6 per row. |
| C. Back room + shop front as separate rooms | Moonlighter (shop vs dungeon), Recettear, Supermarket Sim (storage vs floor), Unpacking rooms | Clean: each room has one purpose and a lot fewer objects. Needs a clear door/switch. | Natural: one room per screen, a bottom tab to switch. |
| D. Management overlay / in-room device (computer, tablet, phone, ledger) | Supermarket Sim, TCG Shop Sim, Stardew summary | Good for ordering and summaries: a paper/screen on top of the room. | A full-height sheet; this is the standard phone pattern. |
| E. Ticket rail of pending requests | Cook Serve Delicious (not verified), KDS systems | Always visible, scannable; text small. | Collapses to a count plus the current ticket expanded. |
| F. Notebook as a persistent diegetic prop | Sennaar, Heaven's Vault, トルービズ | Dock at a corner, opens beside the work (not over it). | Bottom-sheet that leaves the request visible at its top (inference). |

Recurring lessons: one surface where work happens; the text being worked on is enlarged and isolated; a
second room for stock and preparation; ordering via a device in the room with a visible delivery;
feedback through the customer's face; the whole is drawn in one style; new requests never cover the work.
Pros/cons for a reading game: archetype C+D reduces clutter most (the current game puts shelf, bench, bell,
note, map, basket, three books, door sign and HUD in one room); archetype A is mandatory for paper jobs.

## 3. Recommendation for this game

### 3.1 Grammar: "one Ask, one Surface, one Dock, two rooms"

Every workplace uses the same five zones:
1. **Status strip** (top, 40 px, always): workplace name and rank, day-part strip (始業前 › 業務中 › 業務後, the current one
   filled), coins, menu. Nothing else on it. The notice board, bell and settings fold into one menu button on phone.
2. **The Ask** (where the person is): the requester drawn at the left (desktop) / top (phone) with the request on a
   paper card next to them. The card is a real reading surface: serif 22-24 px on desktop, 18-19 px on phone,
   measure 30-40 JP chars or 45-60 Latin chars, words tappable (opens the word in the notebook). Long text grows
   the card, the person never shrinks (the current `.js-long` shrinking becomes unnecessary). The same card
   holds the speaker icon and a "say again" backlog arrow.
3. **The Surface** (the work): drawn furniture of this job, centred, only the pieces this task needs (a stock tray of at
   most 6-8 items visible; the rest behind a "more" drawer).
4. **The Dock** (bottom edge, fixed): left, the notebook (single book icon, label 帳面 / 手帳, 44 px min; the recipe book
   merges into it as a tab for the tea house; the filing box merges into it too); middle, the **stock chips** (see 3.2); right, the one
   primary action (出す / 提出 / 渡す). Notebook opens as a side panel on desktop (request card stays visible) and a bottom sheet leaving the ask
   card visible on phone.
5. **Rooms**: each workplace has a **Back room** (workshop 作業場) and the **Front** (counter/desk). A door on the
   stage edge (desktop) / a two-tab switch above the Dock (phone: 裏 / 表) moves between them.

Day parts and rooms:
- 始業前: you are in the Back room. It shows the day's note, stock with counts, the order form (a catalogue/phone on the
  bench), and one big "開店" action (the door sign). The Front is reachable but shows 準備中.
- 業務中: you are in the Front. The Back room stays reachable by the same switch; a stock chip row at the Dock shows counts
  and turns to a stub "品切れ → 配達を頼む" when empty; ordering opens the same order form (fee shown).
- 業務後: Back room again: ledger paper on the desk, restock/order for tomorrow, the map frame to the town, and a single
  "帳簿をつける" (end day). The Front is dark and not interactive.
- Town: separate screen from the Back room via the map frame (unchanged from README), same status strip.

Paper jobs (clinic, town hall, post office, newspaper, library, trading office): the Surface is a **desk with 1-3 documents**.
The active document is enlarged to fill about 60% of the width; other documents are small tabs on the left ("in
tray") and tapping one brings it forward. Stamps/pens live in the Dock's right slot. Stock for these jobs is
forms, stamps, ink and paper stock (visible chips) so the same ordering form applies, as a supplies catalogue.

### 3.2 Stock, ordering, arrival
- Stock chips: icon + count ("lemon 3"), 44 px tall, in the Dock on desktop and a one-line scroller on phone; in the Back
  room the same items are on shelves with a large count badge (16 px) and a bar that is empty at 0. No "品切れ" tags alone.
- Order form: a paper catalogue/phone. Rows: drawing, name in the target language, price per unit, "have N", stepper
  (- N +), line total; footer: delivery fee (tiered, as in TCG Card Shop Sim fee tiers), total, 注文する stamp. Desktop: a
  paper centred at 560 px wide; phone: full-height sheet, rows 64 px, sticky footer. Opens from the Back room desk,
  and from the Front via the empty-stock chip. This replaces walking to the market; the market scene can remain as a
  town place for "cheaper but go there" (as in Supermarket Sim) (inference).
- Arrival: the delivery is a box/crate that drops into the Back room (or into the Dock chip if you are in the
  Front) with a short +N count animation (200-300 ms, none under reduced motion, count simply changes). While
  waiting, the order shows as a small receipt on the nail with "届くのは次のお客さん / 次の部" so the delay is visible.

### 3.3 Wireframes

Legend: `[ ]` button, `(..)` drawn object, `##` the reading card.

**Morning workshop (Back room) - desktop 1280x800**
```
+--------------------------------------------------------------------------------+
| Tea house  rank 2     始業前 > 業務中 > 業務後          (coin) 40     [menu]   |  40
+--------------------------------------------------------------------------------+
|  Boss/Note: ## Buy today: 3 mint, 2 honey ##   |  SHELVES (stock with counts)  |
|  (cat/window, lamp)  [door sign 準備中]        |  (lemon 3) (ginger 0!) (mint 1)|
|                                                |  (honey 2) (water 9) (ice 4)   |  ~480
|  (order desk: catalogue)  [注文する]           |  (milk 2) (tea 6) ...  count   |
|  (receipt on nail: honey x2 -> 次の部)         |  badges 16px, bar under each   |
+--------------------------------------------------------------------------------+
| [Notebook]   stock chips: lemon 3 | ginger 0 | mint 1 ...          [ 開店 ]    |  80
+--------------------------------------------------------------------------------+
```
**Morning workshop - phone 390x844**
```
+--------------------------+  status 40: 始業前>業務中>業務後  coin  [menu]
| ## Buy today: 3 mint,    |
|  2 honey, 2 lemons ##    |  note card, 18px, ~140
| (door sign 準備中)       |
+--------------------------+
| SHELF grid 3 cols:       |
| (lemon 3)(ginger 0)(mint1)|  each cell 112x96, count badge, tap = detail
| (honey 2)(water 9)(ice 4) |  scroll inside this area only, ~400
| ...                      |
+--------------------------+
| [catalogue 注文] [receipt]|  64
+--------------------------+
| [Notebook] [裏|表]  [開店]|  dock 56
+--------------------------+
```
**Shop/counter during hours - desktop**
```
+------------------------------------------------------------------------------+
| Tea house   始業前 > [業務中] > 業務後          coin 40    [menu]             |
+--------------------------------+---------------------------------------------+
| (customer Tom, face large)     |   ## "Mint. Two ice cubes. Cold." ##  22px  |
|                                |   (speaker) (backlog) ; tickets: [1][2][3]  |  ~230
+--------------------------------+---------------------------------------------+
| SURFACE: cup, kettle, hourglass, knife, containers (only needed 6-8)         |  ~420
| (cup in centre)                                   [出す]                      |
+------------------------------------------------------------------------------+
| [Notebook] stock chips: mint 1 | ice 4 | honey 2 | + more      [裏/表]       |  80
+------------------------------------------------------------------------------+
```
**Shop - phone**
```
status 40
(customer bust 120)  ## Mint. Two ice cubes. Cold. ##     ask area ~200
Surface: cup (centre, 160x180), temperature row, method row     ~260
Stock tray: horizontally paged, 5 per page, 64px tiles           ~120
Dock 56: [Notebook] [stock count chips scroller] [出す]
```
**Paper desk (clinic/town hall) - desktop**
```
status 40
(person at window, left 280)  ## "Please check my form." (22px) ##
+--------------------------------------------------------------+
| in-tray: [form A][chart B]    ACTIVE DOCUMENT (60% width,     |
|                               24px text, boxed fields)        |  ~480
|                               circle with pen / tap a line    |
+--------------------------------------------------------------+
| [Notebook]  pen | stamps: [問題なし] [差し戻す]  supplies: ink 3 | stamp pad 2 |
```
**Paper desk - phone**: status; ask card (3 lines); active document full width, 18px; in-tray as chips under it; Dock with
pen/stamps (each 56 px wide) and notebook.

**Order-by-delivery form - desktop (a paper over the dimmed room, room not hidden)**
```
        +-----------------------------------------------+
        | 注文書 Order form            [x close]        |
        | (img) lemon   3 coins   have 3   [-] 2 [+]  6 |
        | (img) ginger  4 coins   have 0   [-] 3 [+] 12 |
        | ...                                           |
        | Delivery fee: 4 (1-3 boxes)    Total: 18      |
        |                        [ 注文する (stamp) ]   |
        +-----------------------------------------------+
```
Phone: same rows, full-height, sticky footer with total and stamp, 56 px rows, steppers 44 px.

**After closing - desktop/phone**: Back room, lights low. One paper on the desk: "Today: 4 customers, +32 coins, rank
progress" (Stardew-like single summary), under it three large choices as drawn objects: catalogue (order for tomorrow), map frame (town),
ledger (帳簿をつける, primary). Phone: the same paper full width with three 56 px buttons under it.

**Town map - desktop**: the current map, but with the houses that are not workplaces drawn as flat low-contrast
background, workplaces larger with 14 px labels and a card on tap, and the status strip as everywhere else.
**Phone**: signboard list (the existing one) first, 64 px rows with name, rank dots, open/closed; the overview map
is a secondary tab.

### 3.4 Language-learning specifics
- Text to read is always on a paper card, never in a small HUD; Japanese helper labels are 14 px minimum, hidden
  on first view of an object with its English name already there (inference: keeps decipherment fair).
- Notebook shows the player's own meaning in place on the card (Sennaar) and a backlog of the last 20 lines (Coffee Talk).
- No right/wrong marks (unchanged); reaction by face and by the person's line.

### 3.5 Faults in the current screenshots, by severity
Pixel sizes are estimates from the 1280-wide screenshots.

1. **Stock is not countable.** Shelf items carry only a 品切れ tag when out (`final-d1-start-desk.png`); no counts, so the
   player cannot plan the day or the order. High: breaks the prep stage.
2. **Workshop and shop are one room.** The morning room has about 35 labelled objects (shelf of 21, books, jar, cup, kettle,
   hourglass, basket, map, note, door sign); the cup and tools are live before opening. The player cannot tell what
   is for now and what is for later.
3. **Phone shelf and HUD collide.** `final-d1-start-phone.png` and `final-hours-360x740.png`: calendar, bell, notice, day pill
   and reputation plaque crowd the top; the note card sits under them; shelf labels collide ("chrysanthemum" runs over
   neighbours) and items clip at the right edge; in the hours shot the customer's face is partly hidden under the
   request bubble.
4. **The request is a small bubble in a corner, not a reading surface** (hours shot: bubble about 20 px text at the top right,
   competing with HUD). The thing the game is about should be the largest text.
5. **Paper desk is mostly empty.** `final-news-task1-desk.png`: a cork board fills about 60% of the screen with two small
   papers in the top 20%; the instruction line is a pale 12 px Japanese strip; the red pen is a thin prop with no
   affordance; stamps are 70 px, one greyed. Papers should be large and central.
6. **Ordering is a trip, and its explanation is tiny.** `fresh-desk-market-order.png`: four stalls, 10 px price tags, a
   long one-line banner at the top (about 13 px, three clauses) explaining the fee and delay, a basket and a signpost
   to exit. The idea "order, pay a fee, it arrives later" is not visible as an object.
7. **After closing shows a dead shop.** `fresh-desk-closed-panel.png`: the empty cup and 出す are still on the bench; a note covers
   the shelf with one red button; the other things to do (order, town) are not visible; no summary of the day.
8. **Town map is noisy.** `final-hub-desk.png`: about 25 identical houses compete with 9 workplaces; labels 11-12 px
   with overlap (inn label over its neighbour, tea house label over the crane); the bottom bar crams day part, place, coins, notice and two
   buttons.
9. **Affordances rely on tiny labels.** Props have 10-11 px Japanese tags (レシピ帳, 手帳, 書類箱, 捨てる, hot, cold) below 11 px
   functional minimum in the house rules; three book-like props (recipe, notebook, filing box) do the job of one notebook.
10. **HUD duplicated across screens.** Day-part strip appears as a pill in different corners per screen (top left desk,
    top right news, bottom town); notice/bell/settings icons float over scenes and overlap art.

## 4. Change list

**Must**
1. Introduce the shared frame: status strip + Ask + Surface + Dock for all nine workplaces; day-part strip always in the
   same place; fold bell/settings/notice into one menu.
2. Back room as a separate screen with stock shelves showing counts; morning starts there; Front is the counter.
3. Stock chips in the Dock with counts and an "order" stub when 0.
4. Order form as a paper sheet with steppers, fee and total; replaces the walk to the market for the default path.
5. Request card as a large reading surface (22-24 px desktop, 18 px phone), words tappable, backlog.
6. Paper jobs: enlarge the active document to about 60% width, drop the empty cork area, show an in-tray.
7. Phone: one room per screen, bottom 裏/表 switch, no clipped shelf labels, 44 px targets, 16 px minimum body.

**Should**
8. After-closing: one summary paper (customers, coins, rank) and three drawn choices; darken the Front and disable the bench.
9. Delivery arrival: crate drop and +N count, a receipt on the nail while waiting.
10. Merge recipe book, notebook and filing box into one notebook with tabs; show the player's own meaning above the word.
11. Town: demote non-workplace houses, 14 px labels, fix overlaps; phone list first.
12. Show only 6-8 tools on the Surface; rest in a drawer.

**Could**
13. Keep the market scene as an optional cheaper trip (inference from Supermarket Sim local shops).
14. Ticket rail for queued customers with a count on phone.
15. Backlog of last 20 lines also reachable from the Ask card.
16. Reaction-face history on the ledger (Moonlighter-style) without scores.
17. Accessibility toggles: larger UI, drag-assist (tap-tap) default on phone, reduced-motion count changes (Unpacking options as precedent).

---

## Addendum: screens actually looked at (Steam store screenshots)

The first pass above was written from search summaries only. This pass looked at the real store screenshots (six per
game) of: Potion Craft, Strange Horticulture, Papers Please, Coffee Talk, VA-11 Hall-A, Good Pizza Great Pizza,
Death and Taxes, Lil' Guardsman, Tiny Bookshop, Potionomics. Sheets for 29 games were fetched; these ten were read.
Where this addendum contradicts section 3 above ("two rooms", Back room), this addendum wins.

What they share:

1. **One workplace view, and it is a picture.** The counter / desk / booth is drawn as a place and fills the screen.
   The person stands *in* it, at the counter (Good Pizza, Coffee Talk, Potion Craft, Papers Please, Lil' Guardsman).
   None is a layout of cards and chips on a flat colour.
2. **No stock room.** Stock is never a place you walk to. It is either the things themselves on the shelf in the
   same view (Coffee Talk jars, Strange Horticulture plants, Good Pizza topping bins) or one fixed panel at the screen
   edge with a number on every item (Potion Craft right panel, Tiny Bookshop right column, VA-11 Hall-A grid).
3. **Zero is shown as zero.** Tiny Bookshop prints "0" in the same badge, in red; Potion Craft simply has no item.
   Nothing pops up, nothing tells the player to buy. Buying is a place the player chooses to open
   (Potionomics "Ingredient Boutique", Potion Craft merchants, Tiny Bookshop's daily expenses sheet).
4. **The day starts at the workplace with a paper on it.** Papers Please: the bulletin lies on the desk of the booth.
   Death and Taxes: the day's letter lies on the desk next to the files. Strange Horticulture: same room, a "Closed"
   sign and "End Day" sit in the customer window slot. No separate morning screen.
5. **The request is big and next to the person's face**: speech bubble or dialogue bar, 1–3 lines, high contrast
   (Good Pizza, Potion Craft, VA-11 Hall-A bottom bar).
6. **Tools stay in fixed places**; documents are physical sheets that overlap on the desk and are enlarged when
   picked (Papers Please, Death and Taxes, Strange Horticulture's book + label drawer).
7. **Top edge: day / time, money. Nothing else.** (Good Pizza, Potionomics, Potion Craft.)
8. **End of shift is a card over the same room** (Lil' Guardsman "Shift complete").

Consequences for this game (annotation: these hold for the game as it is now, a counter job and desk jobs; if the
game play changes they must be re-derived):

- One screen per workplace: the counter (tea house) or the desk (clinic). 始業前 / 業務中 / 業務後 are states of that one
  screen (door sign, light, who is standing there), not different rooms.
- Stock count is a number on each jar / supply in the scene. 0 is shown as 0 and the jar looks empty. Nothing else.
- The order pad is an object in a fixed place. The game never opens it and never suggests ordering.
