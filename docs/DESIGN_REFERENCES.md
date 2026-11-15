# Design and motion references

A brief for coding agents working on the visual and motion side of this game (drawn SVG/CSS harbour-town scenes, one
self-contained HTML file, no network at runtime, separate desktop and phone layouts, warm hand-drawn storybook look,
Web Audio, honours `prefers-reduced-motion`; see README "Presentation" and "Layout").

How this was made: ten public GitHub repositories were shallow-cloned and read as untrusted reference data (nothing
was run or installed). Everything below is paraphrased from files actually read; where a repo is thin or something could
not be determined, it says so. The clones live outside the project and may disappear, so every entry carries its URL.
Section 3 (house rules) is a synthesis: numbers there are picked from the references (source named) or marked
"own choice".

Reading order for a task: section 3 first (the rules), then the per-reference section only if you need the reasoning.

---

## 1. The ten references

| # | Name | URL | Licence as stated in the repo | What it is | Most worth reading (paths relative to repo root) |
|---|---|---|---|---|---|
| 1 | anthropics/skills | https://github.com/anthropics/skills | No root LICENSE file. Every skill folder holds a `LICENSE.txt` that is Apache 2.0 (18 of them); README says many skills are Apache 2.0 and calls the repo demonstration/educational; `THIRD_PARTY_NOTICES.md` lists bundled third-party licences | Anthropic's example agent skills (docs, art, testing, MCP, design) | `skills/frontend-design/SKILL.md`, `skills/web-artifacts-builder/SKILL.md` (one-line slop warning, React+Vite single-file bundle recipe), `skills/slack-gif-creator/SKILL.md` + `core/easing.py` (easing names), `skills/algorithmic-art/SKILL.md` (seeded generative art), `skills/webapp-testing/SKILL.md` (Playwright screenshots) |
| 2 | pbakaus/impeccable | https://github.com/pbakaus/impeccable | Apache 2.0 (`LICENSE`); `NOTICE.md` says two platform reference files are distilled from an MIT-licensed third-party repo | A design-vocabulary skill with 20+ commands (critique, audit, polish, animate, typeset, layout, colorize, harden...) plus a deterministic "slop" detector CLI | `skill/reference/craft-floor.md`, `skill/reference/animate.md`, `skill/reference/polish.md`, `skill/reference/critique.md` and `critique-rubric.md`, `skill/reference/typeset.md`, `layout.md`, `colorize.md`, `delight.md`, `quieter.md`, `skill/agents/impeccable-motion-reviewer.md` |
| 3 | nexu-io/open-design | https://github.com/nexu-io/open-design | Apache 2.0 at the root (`LICENSE`). Embedded skills carry their own licence files (e.g. `skills/animate/LICENSE` is MIT, credited to Emil Kowalski); not every embedded skill was checked | A very large (about 14,000 files) collaborative AI design workspace; the useful part is a library of small rulebooks and skills | `craft/animation-discipline.md`, `craft/anti-ai-slop.md`, `craft/color.md`, `craft/typography.md`, `craft/state-coverage.md`, `craft/accessibility-baseline.md`, `skills/animate/SKILL.md` + `references/RECIPES.md`, `skills/motion-design/SKILL.md`, `design-templates/critique/SKILL.md` |
| 4 | Nutlope/hallmark | https://github.com/Nutlope/hallmark | MIT (`LICENSE`, also `skills/hallmark/LICENSE`) | A design skill that "refuses to look AI-generated": 50 themes, a numbered gate list with tiers, a render-and-lint tool | `skills/hallmark/references/gates.md`, `microinteractions.md`, `craft.md` (section 5 Motion), `scroll-choreography.md`, `texture.md`, `responsive.md`, `review-finish.md`, `genres/playful.md` |
| 5 | alchaincyf/huashu-design | https://github.com/alchaincyf/huashu-design | MIT (relicensed 2026-05-14, previously a personal-use licence). Exception: stickers under `assets/style-specimens/xhs/_kit/stickers/` are PolyForm Shield 1.0.0 | An agent skill for finished design deliverables (prototypes, decks, launch animations); docs mostly in Chinese | `references/animation-best-practices.md`, `animation-pitfalls.md`, `polish-loop.md`, `critique-guide.md`, `typography.md`, `audio-design-rules.md`, `materials.md` |
| 6 | greensock/gsap-skills | https://github.com/greensock/gsap-skills | MIT (`LICENSE`, covers these skill files). The GSAP library's own licence is NOT in this repo; README only asserts GSAP and all plugins are free | Official agent skills teaching GSAP (tweens, timelines, ScrollTrigger, plugins, performance) | `skills/gsap-core/SKILL.md`, `gsap-timeline/SKILL.md`, `gsap-performance/SKILL.md`, `gsap-plugins/SKILL.md` (Flip, DrawSVG, MotionPath), `gsap-scrolltrigger/SKILL.md` |
| 7 | ConardLi/garden-skills | https://github.com/ConardLi/garden-skills | MIT (`LICENSE`) | Six agent skills; only `web-design-engineer` is relevant (the rest: video showreels, image-gen prompting, article layout, knowledge-base retrieval) | `skills/web-design-engineer/SKILL.md`, `references/failure-patterns.md`, `critique-guide.md`, `design-calibration.md`, `style-recipes/headspace-meditation.md`, `style-recipes/INDEX.md` |
| 8 | patch-gg/pixelfx | https://github.com/patch-gg/pixelfx | MIT (`LICENSE`: Patch and Hugo Duprez). `NOTICE.md`: core sim and some effects adapt MIT code by Hugo Duprez and `rehan-remade`; the font in `gallery/fonts` is Patch's own and is NOT MIT | 244 pixel-art effects written as small dependency-free JS files (fire, UI rewards, pickups, weather, transitions, critters), plus a draft-render-look-refine authoring method | `docs/AUTHORING.md` (the bar and the method), `src/fx/ui/coin-collect.js`, `quest-complete.js`, `confetti.js`, `src/fx/pickups/collect-burst.js`, `src/fx/weather/falling-leaves.js`, `fireflies.js`, `cherry-blossoms.js`, `god-rays.js`, `src/fx/transitions/iris.js`, `src/core/sim.js` (particles) |
| 9 | Vincentwei1021/anything2explainer | https://github.com/Vincentwei1021/anything2explainer | PolyForm Noncommercial 1.0.0 (`LICENSE`); commercial use needs the author's permission; bundled fonts are OFL | NOT a page generator despite the name: a Remotion pipeline that turns a topic into a narrated black-canvas explainer VIDEO (MP4 with TTS) | `reference/motion-vocabulary.md`, `reference/composition-and-light.md`, `reference/lessons.md` (pacing and hold-time ideas only) |
| 10 | oil-oil/oil-motion | https://github.com/oil-oil/oil-motion | MIT (`LICENSE`) | An agent skill that builds scroll/pointer-driven animation from AI-GENERATED video or frame sequences (needs image/video generation services); not a general motion library | `references/runtime.md` (input to time mapping, rAF discipline, lifecycle), `references/motion-patterns.md`, `assets/interactive-motion.ts` (critically damped follow) |

Surprises worth knowing: #9 and #10 are asset/video pipelines, not design guidance for a UI; #3 bundles copies of many
other skills (GSAP, Emil Kowalski's animation skills, oil-motion, impeccable) so it is mostly a mirror of the others
plus the `craft/` rulebooks; #4, #5 and #2 (its Codex-specific block) actively ban hand-drawn SVG illustration, which
is the opposite of this game's approach, so those bans must be read as "for marketing pages" (see section 4).

---

## 2. What each reference offers this game

### 2.1 anthropics/skills (thin on motion, useful on taste)

- `frontend-design` is the most relevant file. Principles: derive the look from the subject's own world (materials,
  vernacular), not from a template; make one memorable choice and keep the rest quiet; type carries personality, one or
  two families, clearly different if two; body lines under about 80 characters, serif a bit more leading than sans;
  structural devices (rules, numbering, labels) must encode real information.
- It lists "AI slop" clusters to avoid unless the brief demands them: cream background + high-contrast serif + terracotta
  accent (it notes the terracotta is Anthropic's own and so reads as a tell); near-black + one acid accent; broadsheet
  hairlines; identical rounded cards with the same soft grey shadow and gradient washes; template chrome (tracked
  all-caps eyebrow over every heading, dot-joined meta strings, "WORD - fragment" labels, arrows on every link).
  The brief overrides these, but they should be a decision, not a default. Relevance: this game's warm storybook look
  sits close to the first cluster, so its palette and type must be justified by the harbour subject (sea, brick, tea,
  lamplight) and kept specific, not left at "cream + clay".
- Motion stance there: unprompted motion sparingly, one orchestrated moment beats scattered fade-and-slide-ups;
  motion that answers a person's action is welcome. Quality floor: responsive to mobile, visible keyboard focus,
  reduced motion respected.
- Process: write a compact token plan (4-6 named colours, type roles, layout idea), review it against the brief for
  generic defaults, then build, then critique from screenshots, and remove one "accessory" before finishing.
- `web-artifacts-builder`: only a one-line warning (avoid excessive centred layouts, purple gradients, uniform rounded
  corners, Inter) and a React + Vite + single-HTML bundling recipe. The game already does its own single-file build.
- `slack-gif-creator/core/easing.py` names the standard set (ease in/out, bounce-out, elastic-out, back-out) and its
  SKILL.md gives simple motion recipes (shake, pulse 0.8-1.2x scale, bounce on landing, slide with back-out
  overshoot). Python/PIL based; only the vocabulary is useful. Tip from there: outlines of width 1 look choppy, use 2+
  on drawn shapes; layer highlights and rings instead of plain circles.
- `algorithmic-art`: seeded randomness (same seed, same picture) and parameter exploration; p5.js based, not usable
  directly. The seeded-variation idea suits scenery variants per day.
- `theme-factory/themes/*.md`: ten small palettes with hex values and font pairings (for example a warm autumnal "golden
  hour" and "botanical garden" set). Slide-oriented; treat as colour inspiration only.
- `webapp-testing`: Playwright screenshot workflow (wait for the page to settle, then capture) for the review loop.
- Not useful: docx/pdf/pptx/xlsx, mcp-builder, internal-comms, claude-api, academy-guide, discernment-nudge,
  brand-guidelines (Anthropic's own colours and fonts).

### 2.2 pbakaus/impeccable (best critique and polish procedure)

- **Motion (animate.md).** Motion must explain state, relationship or hierarchy, or be one authored moment; decoration
  is "animation debt". Before building, write a motion thesis: the one focal moment, what needs continuity, which
  controls need feedback, and the performance budget. A generic fade-and-rise or hover lift is not a thesis.
  Duration bands: 100-150 ms immediate feedback; 150-300 ms routine state change; 300-500 ms layout or overlay;
  500-800 ms a deliberately authored entrance. Exits faster than entrances. Confident arrivals use a strong
  deceleration, for example `cubic-bezier(0.16, 1, 0.3, 1)`; bounce and elastic are not a reflex. Stagger only when a
  list appears as a list, with a capped total. Hover: keep the hovered element still and move a child, otherwise it
  slides out from under the pointer and flickers. Do not animate layout properties (width, height, top, left, margin);
  use transforms or FLIP. Bound blur/filter/shadow work to small isolated regions, `will-change` only while animating,
  and measure on target devices. Keep content visible by default so a failed script never hides it. Nonessential loops
  stop when offscreen or hidden. Reduced motion means fewer and gentler movements, not none: drop spatial travel, keep
  opacity/colour/state changes that carry meaning.
- **Craft floor (craft-floor.md).** Checks on the built result: contrast 4.5:1 body, 3:1 large text; shadows with
  offset and blur (a zero-offset coloured halo is decoration); tight groups and generous separation, more space above a
  heading than below it; body measure 65-75ch, display max 6rem, tracking not below -0.04em; one authored motion
  moment, not one identical entrance on every section; states (hover, disabled, loading, error, empty), real content,
  responsive composition, keyboard focus; theme the browser surfaces you did not draw (selection, caret, scrollbars,
  focus rings). Refuse: identical card grids and nested cards, hero-metric templates, an eyebrow over headings (a hard
  ban), numbered sections without real sequence, gradient text, decorative glass/blur, coloured side-stripe borders over
  1px, hard offset shadows outside a neobrutalist world, emoji or Unicode glyphs as icons (draw icons in one stroke
  weight), geometric masks faking organic contours, light/dark chosen by category instead of the real use scene. A
  Codex-only block also bans sketch-style SVG scenes; ignore that for this game (section 4).
- **Layout/type/colour.** Squint test (blur the screen: primary, secondary, groups still readable in order); group by
  proximity before adding containers; a 4-unit spacing base; body at least 16px, measure 45-75 characters, line height
  inversely tuned to measure; light-on-dark text wants slightly more leading, tracking and weight; `text-wrap: balance`
  on headings, `pretty` on body; roles named by purpose. Colour: build roles (canvas, text, action, border, status),
  OKLCH for ramps with reduced chroma near white and black, tint neutrals toward the hue, never plain grey on a coloured
  surface, never colour as the only signal; contrast for controls, icons and focus rings is 3:1.
- **Quieter (quieter.md).** If a scene feels loud: lower saturation to roughly 70-85%, let neutrals dominate with the
  accent as roughly 10%, reduce weight 900 to 600, remove decoration, keep a point of view.
- **Delight (delight.md).** One delight thesis per product, derived from its mechanism and world; match intensity to
  effort and frequency; repeat use must stay satisfying; never delay the primary task, never play sound without regard
  to mute, no unskippable celebrations, no dependency or asset cost out of proportion.
- **Critique (critique.md, critique-rubric.md).** Two independent assessments: a design review (specificity: could an
  unrelated product use this unchanged? plus hierarchy, cognitive load, emotional journey, ten usability heuristics
  scored 0-4, persona walk-throughs) and a deterministic scan. Cognitive-load checklist: single focus, chunking of
  at most four items, grouping, hierarchy, one decision at a time, at most four visible options, low working-memory
  demand, progressive disclosure. Severity P0 blocking, P1 major, P2 minor, P3 polish.
- **Polish (polish.md).** Triage in this order: broken tasks and misleading state; missing states; flow and
  hierarchy drift; visual and motion inconsistencies; code cleanup. Fix whole paths, not one corner. Classify each
  inconsistency as missing token, one-off, conceptual mismatch or local defect. Walk the full path with mouse,
  keyboard and touch; a clean scan is not proof of quality.
- **Motion review (agents/impeccable-motion-reviewer.md).** Evidence-based: capture normal and reduced-motion runs of
  the same interaction (before, first animated, middle, last animated, settled frames), check continuity (no content
  swap mid-morph, no occlusion), duration against distance, exits faster than entrances, and that reduced motion
  removes travel rather than just shortening it. Two review rounds maximum.
- Not usable: the CLI, browser extension, live mode and detector need installing and are web-page oriented;
  `ios.md`/`android.md` are native-app rules. `DESIGN.md` is the repo's own site palette (gold and verdigris on dark),
  irrelevant here.

### 2.3 nexu-io/open-design (the `craft/` rulebooks are the gold)

- **animation-discipline.md.** Evidence-minded: controlled studies find animation does not beat static for teaching
  complex systems; it earns its place for spatial or temporal reorientation (navigation, container morphs, progress).
  So: do not animate to teach, decorate or signal "premium". Duration thresholds: 50-100 ms instant feedback; 150 ms
  default for confirming a state; 200-300 ms entering UI; 300-500 ms screen-level transitions; over 500 ms only for
  staged or cross-screen moves. Frequently seen animations stay at or under 200 ms; mobile durations 20-30% shorter than
  desktop. Curves for opacity/colour, springs for position/scale/gesture. Material 3 standard easing is
  `cubic-bezier(0.2, 0, 0, 1)`; the symmetric `cubic-bezier(0.4, 0, 0.2, 1)` is the older one. Apple's default spring is
  response 0.5 s with damping fraction 0.825. Reduced motion: strip motion on an axis (translate, scale, rotate,
  parallax), keep opacity or colour crossfades; the View Transitions API does not apply the preference automatically.
  Flashing: at most three flashes in any second. Ambient/looping motion: cap iterations, anything moving over 5
  seconds needs a pause path, cancel ambient motion on route change, reward bursts fire once, spinners stop
  escalating. Never let animation be the only signal of a state change; ship the optimistic state first, motion second.
- **skills/animate (from Emil Kowalski, MIT).** A gate before any animation: things done 100+ times a day get no
  animation; tens of times a day only near-imperceptible; occasional gets standard motion; rare or first-time moments
  are where delight budget lives. Name the purpose (feedback, spatial consistency, state, preventing a jarring change,
  explanation, delight) or do not build it. Use transform and opacity; never scale from 0 (start at 0.9-0.97 plus
  opacity); enter and exit with ease-out, never ease-in on UI; strong custom curves instead of the browser defaults:
  `cubic-bezier(0.23, 1, 0.32, 1)` (ease-out), `cubic-bezier(0.77, 0, 0.175, 1)` (on-screen move),
  `cubic-bezier(0.32, 0.72, 0, 1)` (drawer). UI under 300 ms; button press 100-160 ms with a press scale of about
  0.97; popovers 125-250 ms; modals 200-500 ms; entries 30-80 ms stagger, decorative and never blocking input.
  Springs (duration 0.5, bounce 0.1-0.3) for draggable or interruptible things. Transitions, not keyframes, for
  anything that can be triggered twice quickly (they retarget instead of restarting). Exit along the path it entered.
  Gate hover motion behind `(hover: hover) and (pointer: fine)`. CSS animations beat JS under load.
- **motion-design/SKILL.md.** Three layers: primary action carries the idea, secondary action shows weight/causality
  (shadow settling, trailing label), ambient only if the scene needs it; quiet scenes may be still. Timing starting
  ranges (film heuristics, not UI limits): accents 120-220 ms, element arrival 350-650 ms, transformations 600-1200 ms.
  Give fast actions preparation and recovery; playful material may overshoot, precise instruments should not; use arcs
  for physical motion; alternate action and rest; keep velocity continuous across hand-offs; loops need matching
  start/end state and velocity.
- **anti-ai-slop.md.** Hard tells: default Tailwind indigo accents, two-stop "trust" gradients, emoji as feature icons,
  a sans on display text where a serif is bound, rounded card with coloured left border, invented metrics, filler copy
  (lorem, "feature one"). Soft tells: the identical landing sequence, stock-image CDNs, more than about a dozen raw hex
  values outside tokens, the accent used more than twice per screen, decorative blob/wave backgrounds, perfectly
  symmetric layouts. Recipe for soul: roughly 80% proven pattern and 20% distinctive choice: one bold visual move,
  voice and microcopy, one memorable micro-interaction, one detail only a user of the product would know. Test: could a
  stranger identify the product from a screenshot?
- **color.md.** Palette shares: neutrals 70-90%, one accent 5-10%, semantic 0-5%, effects under 1%; at most two visible
  accent uses per screen; contrast gates 4.5 / 3 / 3; avoid pure black and white (use tinted near-black and
  near-white), name tokens by purpose.
- **typography.md.** Multiplicative scale 1.2 or 1.25 with at most 6-8 sizes; tracking: caps need +0.06 to 0.1em,
  display text -0.01 to -0.03em, body 0. **CJK override (relevant: this game shows Japanese and Chinese):** glyphs fill
  the em box, so display leading 1.3-1.4 and body 1.7-1.8 (not Latin 1.0-1.2 and 1.5-1.6), and no negative tracking on
  CJK headlines; when a Latin kicker sits over a CJK headline, apply the tight Latin values only to the Latin element.
- **state-coverage.md.** Every surface needs loading, empty, error, populated and edge states; empty is a state with a
  job (headline, explanation, next action); errors say what happened, why, and what to do next, and keep user input.
- **accessibility-baseline.md.** Target WCAG 2.2 AA; touch targets 24x24 CSS px is the legal floor, 44x44 (iOS) or 48
  (Material) is the craft target; focus indicators 3:1 and never simply removed; label every input; keyboard operable.
- `design-templates/critique/SKILL.md` is a five-dimension review (philosophy, hierarchy, detail, function, innovation,
  0-10 each, with Keep / Fix / Quick-wins lists), adapted from reference 5.
- `design-templates/gamified-app/SKILL.md` is a dark XP/quest phone mockup template; its advice (distinct pastel per
  tile, "playful, not childish", reward chips) is generic and glassy, and it was not found useful for this storybook
  game beyond the reminder to keep each frame's purpose distinct.
- Not usable: the daemon/Electron workspace, Figma plugins, roughly 150 brand design-system folders (brand imitation), video and
  image-generation skills, i18n docs.

### 2.4 Nutlope/hallmark (the strictest slop gate list)

- **How it works.** Every rule is a numbered gate with a tier: Floor (never ships), Reflex (a model default; may be
  waived with a stated reason), Finish (craft detail, reported only). A tool lints the built page in a real browser.
  Before building, score the plan 1-5 on six axes (philosophy, hierarchy, execution, specificity, restraint, variety);
  anything under 3 gets revised. Reviews run in fresh context: the thread that built the page is its weakest reviewer.
- **Gates worth stealing for this game's UI chrome** (menus, notebook, banners, HUD): no eyebrow or tracked-caps label
  over headings (small labels in the body face, a step smaller); no template punctuation (dot-joined meta strings,
  arrows glued to link text, decorative status dots); no accented single word inside a heading; no pure `#000` or
  `#fff` (tint toward the palette hue, chroma at least 0.005 in OKLCH); no zero-chroma neutrals next to a hue; no
  glow/aurora blobs behind text; no card inside a card; no gradient text; no emoji as icons and one icon family only;
  decorative `svg`/`canvas` must be `aria-hidden` or labelled; text at least 12px (functional 11px) and prose leading
  at least 1.3; text boxes padded at least about 8px and a 16px phone gutter; no horizontal scroll from 320 to 1920;
  no invented facts or fake success states (a button must not print "Sent" with nothing behind it); every transform
  or keyframe animation needs a reduced-motion fallback; content must not be hidden at rest waiting for a script;
  `transition: all` and animating width/height/top/left are Floor violations; hover is one signal per element, applied
  to the container, never scaling or rotating an image; a focus ring never fades in; no auto-rotating content without
  pause on hover and focus; no celebratory toast for something the user can already see (silent success).
- **Motion numbers (craft.md section 5, microinteractions.md, scroll-choreography.md).** Duration tokens 120 ms
  (press, tick, colour), 220 ms (hover, tooltip, menu), 420 ms (modal, drawer, accordion, reveal). Curves defined in
  its `scripts/theme.mjs`: ease-out `cubic-bezier(0.16, 1, 0.3, 1)`, ease-in `cubic-bezier(0.7, 0, 0.84, 0)`, in-out
  `cubic-bezier(0.65, 0, 0.35, 1)`; never the browser's plain `ease`, linear only for progress and scrubbing, no
  overshoot on UI state. Exits at 60-75% of the enter time. Stagger 30-50 ms between rows, 60-100 ms between blocks,
  500 ms total at most, once. One reveal per page; at most three motion primitives per page; hover raises contrast
  (colour step or 1px lift); press is a 1px drop; tooltips wait 800-1000 ms on hover, 0 on focus; menus may stagger
  30 ms when eight items or fewer; numbers may count up over 400-800 ms (and show the final value at once under reduced
  motion); validate on blur, not first keystroke; optimistic update with rollback. Reduced motion collapses spatial
  motion to a 150 ms opacity crossfade while functional state still changes. "Most pages have too much motion, not too
  little." Never: parallax, custom cursors or followers, a pulsing dot, `will-change` on a whole class, infinite loops
  other than a loader. Motion character scale: still / severe (0.7-0.75x durations) / brisk (0.85-0.9x) / calm
  (1.0-1.3x); a calm storybook game fits "calm". Scroll-linked effects are one pattern per page, structural targets
  only, with a static end state and reduced-motion/small-screen fallback; scrubbing uses linear (an easing curve
  detaches the content from the thumb). Not directly relevant to a game with no scrolling pages, but the principle
  "static end state first, motion layered on top" applies to every scene.
- **Texture rules (texture.md).** One artefact family per scene (grain, halftone, misregistration, scanline), never two;
  opacity budget at most 0.08 page-wide, 0.15 inside a card, at most 0.05 under body text; never animated;
  `pointer-events: none` and `aria-hidden`; pure CSS or a data-URI SVG filter (no extra image requests). A grain
  recipe uses SVG turbulence thresholded into specks; relevant to the paper-grain feel of a storybook look and works
  offline.
- **Responsive (responsive.md).** Button labels must not wrap at any width 320-1920 (shorten, `nowrap`).
- Genre file `genres/playful.md` exists (not read in depth). A playful genre may use a declared spring on the primary
  action and one character moment.
- Not usable: marketing page anatomy and 21 page "macrostructures", 50 themes, photo library (Wikimedia), hero and fold
  rules, the Node linter (needs Chrome and puppeteer; running it is out of scope here).

### 2.5 alchaincyf/huashu-design (motion philosophy, polish loop, sound)

- **Animation as physics (animation-best-practices.md).** Treat elements as objects with weight and inertia. Easings:
  an exponential ease-out as the default (`cubic-bezier(0.16, 1, 0.3, 1)`, the same value as references 2 and 4);
  an overshoot for toggles and emphasised pops (`cubic-bezier(0.34, 1.56, 0.64, 1)`); a spring for settling. Never
  linear for objects. Slow-fast-boom-stop pacing: even rhythm is a tech demo; give the viewer a pause (at least
  300 ms) before the key result; end on a held, decisive last frame rather than a fade-out; spend "120% polish" in one
  place only. Show the process, not magic. Real hand motion is an arc with a little jitter, not a straight line.
  Focus shift = background recedes (dim, desaturate, blur a few px) + foreground sharpens + a ~150 ms flash. Use
  warm-tinted neutrals rather than pure black/white. Serif for voice, sans for function.
  Collapse-then-expand (scale to 0.1, blur 6px, then grow back) is a cheap morph.
- **Pitfalls (animation-pitfalls.md).** Absolutely positioned children need a positioned parent; every glyph in an
  animation must exist in the chosen font (avoid rare Unicode such as the open-box space symbol; build key caps from
  CSS); drive layouts from data counts, not hard-coded column counts; scene transitions should cross-fade with overlap
  or the viewer sees a blank second; animation state should be a pure function of time so it can be sought.
- **Polish loop (polish-loop.md), the most reusable procedure.** Screenshot screen by screen at real size (a whole
  page shrunk into one image hides spacing and type problems), then ask eight questions: first three seconds (can a
  newcomer tell what and for whom); is the hero asset present; does each screen have an event worth pausing on; squint
  hierarchy; craft (alignment, rhythm, widows, bad breaks, overflow, broken images, odd-one-out elements); phone;
  match against the direction card; "what could be removed". Write the three worst problems per round and fix only
  those, structure before craft; 2 rounds minimum for a final version, usually 3-5; if round 5 is still changing a lot
  the problem is direction, not polish. A weak screen is rebuilt, not patched. Keep first and last round screenshots
  to show the improvement.
- **Critique (critique-guide.md).** Concept first and weighted highest: can the idea be stated in one sentence; cover
  the text, is the theme still recognisable; would swapping the client name still work (if yes it is a template,
  capped score). Then hierarchy (title at least 2.5x body size, three or four clear levels), craft (spacing system,
  at most 3-4 colours, at most 2 families, aligned edges), function (delete test: if removing it does not hurt, remove
  it). Scores 0-10 per dimension with band labels.
- **Typography (typography.md).** Decide in order: content type, language mix, style temperature, then font names.
  Scale ratios 1.2 / 1.25 / 1.333 / 1.5; body 16-18px (17-18 for Chinese); Chinese measure about 22-38 characters per
  line (best 28-32) versus 45-75 for Latin; Chinese leading about 0.2 above Latin at each size; `clamp()` for display
  sizes; `text-wrap` features. It is written for Chinese, not Japanese; Japanese glyph density is similar, but no
  Japanese-specific rules were found.
- **Materials (materials.md).** Procedural materials that work offline: SVG filters (turbulence + displacement) for
  paper grain, ink bleed, print misregistration; layered radial gradients for light and volume; `mask-image` and
  `clip-path` for silhouettes; canvas with a fixed seed; "data as image". Rule that conflicts with this game: it says
  do not hand-draw people, animals or scenes in SVG because features come out misaligned (see section 4). Its
  honesty test is still good: if removing a picture loses no information it is decoration.
- **Audio (audio-design-rules.md).** Written for video mixes but the numbers translate to Web Audio: two layers, a
  sparse short SFX layer synchronised to events (kept in the 800 Hz and up region) and a quiet ambient bed (below about
  4 kHz), bed gain roughly 0.4-0.5 against SFX 1.0 (6-8 dB lower); fade the bed in over 0.3 s and out over about 1.5 s;
  SFX density depends on personality: calm products 0-3 cues per 10 s, busy ones up to 9; "do not fill every beat":
  removing 30-50% of cues makes the rest land. Priority cues: typing, click/selection, decisions.
- Not usable: HyperFrames/Remotion video backends, MP4/PPTX export, 92-style library tied to brand imitation, bundled
  mp3s (licence of the audio files not checked), Xiaohongshu carousels, Three.js recipes.

### 2.6 greensock/gsap-skills (GSAP usage notes; the library itself is a dependency question)

- Content: core tweens (`to`, `from`, `fromTo`, `set`), `defaults`, timelines with position parameters and labels,
  staggers (object form with `from`: center/edges/random), `quickTo` for pointer-following values, ScrollTrigger
  (`scrub`, batch, pin), plugins (Flip for FLIP layout transitions, Draggable, DrawSVG for stroke draw-on, MorphSVG,
  MotionPath, SplitText, CustomEase), React/Vue integration, and `matchMedia` for responsive and reduced-motion
  branches (the skill's example sets duration 0 when reduced motion matches).
- Performance advice (gsap-performance): animate x/y/scale/rotation/opacity, not layout properties; `will-change` only on
  elements that actually animate; stagger instead of many separate delayed tweens; `quickTo` for frequent updates; kill
  off-screen animations and clean up; do not create hundreds of overlapping tweens without testing on low-end phones.
- Relevance to this game: DrawSVG-style stroke drawing (animating `stroke-dashoffset`), timeline sequencing for
  multi-beat reactions (customer reaches, sips, reacts) and Flip are the matching ideas; all can also be done with CSS
  transitions/keyframes and the Web Animations API, which the other references prefer when no runtime library is needed.
- Licence caveat: see section 4. Nothing in this repo states the terms of the GSAP library itself.

### 2.7 ConardLi/garden-skills (`web-design-engineer` only)

- Workflow: read the brief into a "Design Read" with five dials (visual variance, motion intensity, information
  density, asset dependence, brand fidelity, each 1-10) and use them as real decisions; declare the design system
  (palette, type, spacing, radius, shadow, motion) before coding; show an early v0 with placeholders; four
  positioning questions per screen (narrative role, viewing distance, visual temperature, capacity check).
- `failure-patterns.md` (contextual, each with default, reason, exceptions, detection, repair): eyebrow above every
  heading; zigzag image/text monotony; default centred hero; fake trust claims; cardification (everything in a rounded
  card); shape drift (no radius grammar: define radius per component role and follow it); micro-label noise (fake
  version numbers, coordinates, status dots); motion for spectacle only (test: remove it, did understanding change?);
  repeated spectacle (one signature moment, the rest quiet); scroll-state rendering (do not update broad React state per
  scroll/pointer frame; use CSS, refs or observers); missing reduced-motion path (content order and task completion must
  not depend on the animation); happy-path-only components (only the populated state exists).
- `critique-guide.md` common issues useful here: title/body ratio under 2.5x, more than 4-5 colours, spacing off a
  grid (8pt: 8/16/24/32/48/64/96), more than 2 families, mixed alignment, decoration that eclipses content, wrong density
  for the medium. Output format: scores per dimension, Keep, severity-sorted Fix list (at most 7, with concrete values
  such as "56px not 32px"), three Quick Wins; critique the design, not the designer.
- `style-recipes/headspace-meditation.md` is the closest match to a warm, rounded, hand-drawn-feeling product: warm
  peach ground, warm dark-teal ink (not cool navy), pastel pops (one per scene), large radii (16/24/32), soft warm
  shadows tinted to the ground, 400-800 ms gentle eases, a 1.5-4 s "breathing" cycle on key elements, no springy
  bounce, at most two colours per scene, no sharp corners. Its "do not use when" notes: reads as soft and caring, not
  authoritative. `mailchimp-freddie.md`, `muji-kenya-hara.md`, `mid-century-modern.md` and `aesop.md` are alternative
  warm/humanist recipes (only the first was read in full).
- Opinions that conflict with this game: it tells agents not to hand-draw SVG people/scenes, to avoid GSAP and Framer
  Motion unless asked, and says "stun". Take the first as not applicable (section 4), the second as consistent with
  "no dependency for what CSS can do".
- Not usable: motion-showreel, web-video-presentation, gpt-image-2, beautiful-article, kb-retriever; the Tweaks panel
  and slide engine patterns.

### 2.8 patch-gg/pixelfx (particle and reward-feedback choreography)

- What it is: effects drawn into a low-resolution pixel buffer plus an additive "light" buffer, stepped at a fixed
  fine timestep so physics looks the same at any frame rate, seeded RNG (no `Math.random`, same seed same result),
  roughly under 2 ms per frame checked by a tool. It is pixel art, not vector storybook art, and it draws to canvas, not
  SVG, so the code is not drop-in for this game; the choreography ideas are.
- Particle kinds worth reproducing as small SVG/CSS or canvas sprites: sparks that stretch with speed, fall and bounce;
  soft translucent vapour/smoke puffs that swell and thin (relevant to the kitchen steam and chimney smoke);
  tumbling debris that settles and fades; twinkling cross-shaped stars; drifting motes.
- **The bar (AUTHORING.md)** in ten points; the transferable ones: build with thin lines and light rather than big flat
  fills; light on every spark and a flare at the moment of impact that falls off; choreography in phases: anticipation
  or charge, release (one or two frames of white-hot flash), spread, hold (glints, twinkles), decay; many small events
  varied in size, speed, timing and life; fast attack and slow release, hits 0.3-0.8 s, large effects linger 2-4 s
  while smoke clears; reads at 1x with one focal point; ends empty or loops seamlessly; deterministic.
- **Acting (character effects).** Anticipation and cooldown: wind up in the opposite direction, big silhouette change on
  release, a freeze on contact (hit-stop of about 0.03-0.2 s, longer for heavier blows), follow-through that overshoots,
  limbs stepping on 12 fps poses while positions stay smooth. For this game: a customer's reaction should have a
  beat of anticipation, a short hold, then the reaction, rather than an instant pose swap.
- **Ideas for game feedback** (descriptions read from the effect files, not run):
  `ui/coin-collect` (a coin bursts into a fountain of coins that hang, then zip one by one into the counter, which pops
  and ticks up: maps to the wage and coin jar), `ui/quest-complete` (ribbon unrolls, text types on, a seal stamps with a
  tick, stars pop, then rolls away: maps to the shift summary and rubber stamps), `ui/confetti` (poppers, paper bits
  stall then flutter down), `pickups/collect-burst` (flash, a thin ring ahead of a soft ring, twinkles on curving paths
  that brake and hang), `pickups/key-glint` (a glint travelling along an object, then a spark burst at the tip: maps to
  brass fittings, name plates, the letter scale), `ui/exclamation` (a "!" springs up with stretch and squash: maps to a
  customer noticing something), `weather/falling-leaves` and `cherry-blossoms` (tilt and flip while falling, spirals,
  land and fade), `weather/fireflies` (each glows on its own rhythm; evening scenes), `weather/god-rays` (slanted
  light shafts with dust motes lighting up when crossing: window light in the inn and tea house),
  `critters/butterfly, bird, fish-school` (wandering loops with bursts and glides: harbour gulls, fish), and
  `transitions/iris` (a circle closes onto a spotlight and opens with a flash: a possible "passage of light" variant).
- Licence handling: if code or a recipe is adapted from an effect that says it adapts Sprite Fusion, keep the credit
  line (MIT). Do not copy `gallery/fonts` (not MIT). Re-implement rather than vendor; the pixel framebuffer approach
  does not fit the drawn SVG art style.

### 2.9 Vincentwei1021/anything2explainer (video; ideas only, noncommercial licence)

- It is a Remotion video pipeline (black canvas, white line art, purple accent, TTS narration); the look and almost all
  tooling are irrelevant. Licence is PolyForm Noncommercial. Use only as a source of general ideas, copy nothing.
- Transferable motion ideas (frame numbers at 30 fps converted to ms): the default entrance is 8 frames (about 270 ms):
  opacity easing out with a 10 px rise; stagger 2 frames (about 67 ms) per item; slides in from below should travel at
  most about 120 px; exits must reach zero opacity before a hard cut (a fade that leaves 40-60% visible at the cut
  "pops"); a settled element should hold still for 1-1.5 s before the next change; one hero element per scene with the
  light/glow on it only; a screen with nothing large for over 1.5 s is flagged as empty; only one "glitch" emphasis per
  scene; count-up animations pass through intermediate numbers that must be acceptable to show (never let a wage or
  count briefly display a wrong-looking value); a push-in to about 1.33x over about 33 frames (about 1.1 s) with an
  in-out curve `cubic-bezier(0.6, 0.05, 0.4, 0.95)`; do not add breathing or drift to everything just to avoid
  stillness (its own lessons record that this over-correction was a defect).
- Process lesson: its `reference/lessons.md` is a log of rework causes; the habit of recording a rework cause after
  each failed iteration is cheap and worth copying.

### 2.10 oil-oil/oil-motion (input-to-time mapping; asset pipeline not applicable)

- Scope: turns AI-generated video or frames into scroll/pointer/drag/touch-controlled animation, with a compile,
  budget and QA pipeline; needs generation services and Python tooling. Not applicable.
- Transferable runtime rules (runtime.md): input events only record the target; one write to the DOM per animation
  frame; stop the frame loop when offscreen or stable; observe visibility and resizing; pause when the tab is hidden and
  resume from the latest target; re-read element positions after layout changes; keep only the latest target for
  rapid input and cancel stale work; reverse input rewinds from the current point rather than restarting; always keep a
  static fallback and show a single static image while loading; under `prefers-reduced-motion` show the designated
  static state and do not auto-play or continuously scrub. Device-orientation (tilt) needs a user-gesture permission and
  a touch or static fallback.
- Pointer-follow smoothing: `assets/interactive-motion.ts` uses a critically damped smooth-follow (the familiar
  "smooth damp" form) with a default smooth time of 0.11 s, a max speed cap, and a hard snap when reduced motion is on.
  That is the right model for gaze or parallax that follows the pointer: smooth time about 0.1 s, never a per-event
  tween.
- Method idea (concepts.md): pick exactly one purpose for each animation (guide attention, explain relation, show
  progress, give feedback, reward exploration, set mood); anything without a purpose is cheap, pausable decoration.
  Also: audit the object for what can change (structure, function, state) before choosing an effect.
- `motion-patterns.md` is a card catalogue of scroll/page hero effects from other sites (not read in full beyond the first
  ten cards); little there applies to a game.

---

## 3. House rules for this game

Authority order when rules clash: the README's described look and the existing code > these rules > the references.
Do not restyle what is already shipped unless the task says so; use these when adding or changing something.

### 3.1 Visual polish checklist

Look and identity
- [ ] Specific to the harbour town: could this screen belong to an unrelated product? If yes, rework it. State the one
      memorable thing on the screen and keep everything else quieter.
- [ ] Palette: a small set of named tokens (base, ink, accent, status). Tinted near-black and near-white, never `#000`
      or `#fff`. The accent appears at most about twice per screen (impeccable, open-design). One accent hue family per
      scene; avoid the generic cream + serif + terracotta combination unless it is justified by the place (a brick post
      office is, a UI panel is not). No default framework indigo/violet, no purple-to-blue gradients, no gradient text.
- [ ] Depth by lightness steps and shadows with offset and blur (warm-tinted), not glow halos or neon.
- [ ] Hand-drawn feel is consistent: one outline weight (at least 2 units, not hairline), one corner/radius grammar by
      component role, one texture family (paper grain) at low opacity (page-wide at most 0.08, never under small text,
      never animated).
- [ ] Icons: drawn, one stroke weight, one family; no emoji or Unicode glyphs standing in for icons.
- [ ] Layered scenes get depth cues (back rows dimmer, soft light shafts, steam as translucent puffs), not more detail.

Layout and type
- [ ] Squint test passes: primary object, secondary objects and groups are recognisable when blurred. Related items
      sit close; separate groups generously; more space above a heading than below it.
- [ ] Spacing from one scale (4-unit base); no one-off values. Touch targets at least 44x44 CSS px on phone (visible
      mark may be smaller); keep gaps between neighbouring targets.
- [ ] Type roles: few families (one UI/body face plus at most one display/hand face), at most 6-8 sizes, title at least
      2.5x body where there is a title. Body at least 16px on phone, never below 12px for running text, 11px functional.
- [ ] Reading measure 45-75 Latin characters; for CJK lines about 22-38 characters. CJK leading 1.7-1.8 body, 1.3-1.4
      display; no negative tracking on CJK; positive tracking only on any all-caps Latin. Prefer small labels in
      normal case over tracked capitals. `text-wrap: balance` for short headings, `pretty` for body.
- [ ] Long requests, long names and the longest Japanese/English/Chinese label fit at every layout; no clipped
      buttons; button labels do not wrap.
- [ ] No eyebrow labels, section numbers without real sequence, dot-joined meta strings, trailing arrows on links.
- [ ] Contrast: text 4.5:1, large text 3:1, icons, controls and focus rings 3:1; information never by colour alone
      (add shape, icon, label or position).

Completeness
- [ ] States exist and look designed: default, hover (pointer devices only), focus-visible (visible, instant, 3:1),
      pressed, disabled, empty (a job and a next step), loading, error (what, why, what to do; keep the player's
      input), edge (very long text, zero items, max items).
- [ ] No invented facts, no fake success feedback, no filler copy. Chrome text in the right language with the small
      Japanese label where the game does that.
- [ ] Decorative SVG/canvas is `aria-hidden`; meaningful graphics have a label; every action has a keyboard and tap
      path (already a game rule).
- [ ] Desktop 1600x1000 stage and phone layouts each checked, not just one; safe-area insets respected on phone.

### 3.2 Motion spec

Principles (rank order)
1. Motion has a job: feedback, spatial continuity, state change, preventing a jarring jump, or one earned moment of
   delight. If removing it loses nothing, remove it.
2. The more often something happens, the quieter it is. Per-action feedback (pick up, drop, tap) is tiny and fast; rare
   moments (new day, rank up, shift end) may be authored.
3. One authored focal moment per screen or beat; supporting motion answers it; leave rest and stillness. Do not add
   idle drift to everything to avoid stillness.
4. Static end state first: the finished composition is the base; motion is layered on it and content is never hidden
   waiting for a script.
5. Anticipation and settle: weighty actions get a tiny preparation and a recovery; overshoot is allowed for playful
   rewards and objects, not for plain UI state (menus, banners, counters).
6. Interruptible: anything the player can trigger twice must retarget from its current value (CSS transitions or
   Web Animations), not restart from zero.

Named easings (tokens)

| Token | Value | Use | Source |
|---|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | default for arrivals, drops into place, panel and banner entry | refs 2, 4, 5 agree |
| `--ease-out-firm` | `cubic-bezier(0.23, 1, 0.32, 1)` | quick UI: press release, tooltip, popover | ref 3 (Emil Kowalski) |
| `--ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | exits only, short | ref 4 |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | things that move across the screen and stop (walkers, sliding doors, camera-like push) | ref 4 (ref 3 uses `0.77,0,0.175,1`) |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Material 3 style, optional for list reflow | ref 3 |
| `--ease-sheet` | `cubic-bezier(0.32, 0.72, 0, 1)` | bottom sheets and drawers on phone (notebook, panels) | ref 3 |
| `--ease-pop` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | rare playful overshoot only: coins, stamps, reward pops, a new item appearing in a cabinet | ref 5 |
| `linear` | n/a | progress fills, clock hands, scrubbing, continuous loops | refs 3, 4 |

Never the browser keywords `ease` or `ease-in` for UI arrivals; never ease-in on something entering. For springs (drag
release, pieces settling after being dropped): duration about 0.5 s, bounce 0.1-0.3 (ref 3) or Apple's response 0.5 /
damping 0.825 (ref 3). Pointer-follow (customer eyes, parallax): critically damped follow with smooth time about
0.1 s (ref 10), updated in one rAF, not one tween per pointer event.

Duration scale (own choice, reconciling refs 2, 3, 4, 5; desktop values, phone values about 20-30% shorter)

| Token | ms | Use |
|---|---|---|
| `--dur-instant` | 80-120 | press, tick, colour change, toggle |
| `--dur-quick` | 160-220 | hover, tooltip, a piece snapping to its slot, small state changes |
| `--dur-base` | 280-420 | banner, panel, bubble, bench piece moving, overlay open (close at 60-75% of this) |
| `--dur-scene` | 500-800 | authored moments: stamp landing, coin counter run, customer reaction beat |
| `--dur-passage` | 900-1500 | the existing passage of light and the dusk/ledger transitions only |

Rules of thumb: frequent animations at most 200 ms; UI under 300 ms unless authored; exits 60-75% of the enter; stagger
30-50 ms between items (60-100 ms between blocks), total under 500 ms, never blocking input; hold 1-1.5 s after a
reward settles before the next change; at least 300 ms of pause before a key result the player must notice.

When to animate
- Yes: acknowledging a drag, drop, tap or stamp; a piece moving to where it belongs; the person at the counter
  reacting (anticipation, beat, reaction); wage and coin counters (count up 400-800 ms, never showing a misleading
  intermediate value); day/part-of-day light change; first-time and rank moments; ambient life that is already in the
  scenes (gulls, steam, pendulum, clock hand, cat) at low amplitude.
- No or near-nothing: repeated actions done dozens of times a shift (keep to an 80-120 ms press and a short settle);
  anything keyboard-triggered in bulk; text the player is reading (never move body text); the answer judgement (the game
  deliberately marks nothing right/wrong, so do not add celebratory or failure animation to results); toasts for effects
  the player already sees (silent success).
- Never animate: layout properties (width, height, top, left, margin, padding); `transition: all`; scale from 0 (start
  at 0.9-0.97 with opacity); infinite loops that do not stop when hidden or when the scene is not showing.
- Hover motion only on `(hover: hover) and (pointer: fine)`; the hovered element stays still and a child moves.

Reduced motion (`prefers-reduced-motion: reduce`)
- Remove spatial travel, scale pops, parallax, shake, particle bursts, camera-like pushes, looping ambient motion and the
  passages of light's movement.
- Keep meaning: state changes still show through colour, opacity (a crossfade of at most 150 ms), position that is the
  state itself (a piece appears in its slot), counters jumping to the final value, and a static pose for the person
  (face change instead of arm swing).
- No flashing: at most three flashes per second even when not reduced.
- Ambient scene life under reduced motion: either off or a single very slow, tiny movement; prefer static.
- Sounds are separate from this preference but must respect the game's own mute control; never play sound on load.
- Test both modes on every motion change (capture the same interaction twice; see 3.4).

Performance limits (own choice for a single-file build with SVG scenes on phones; the refs give the principles, no
refs state numbers for this stack, so tune on a real mid-range phone)
- Animate only `transform` and `opacity` on elements that are their own layer; scenes are pre-rasterised once per shift
  (already the pattern): keep drawn interiors static and put moving things (gulls, steam, hands, pieces) on top.
- At most a handful of simultaneously animating scene elements on a phone (target: under about 10 concurrent ambient
  loops visible at once; 1 focal moment plus ambient); pause or remove offscreen and hidden-tab animations, and when a
  scene is replaced.
- Blur, filter, drop-shadow and SVG filters (turbulence, displacement): small isolated regions, no per-frame filter on a
  full-stage SVG, no animating the filter parameters; bake texture once. Avoid animating large `box-shadow`.
- No `will-change` on whole classes; set it only for the duration of a known animation.
- One DOM write per animation frame; pointer and drag handlers record state and a single rAF applies it; no React state
  updates per pointer frame or scroll frame (use refs and direct style writes); cancel stale work on rapid input.
- Particles: pooled, capped (target tens, not hundreds, per burst on phone), seeded RNG for reproducible variants,
  stepped on a fixed timestep if physics is used; stop the loop when nothing is alive.
- Respect `Image.decode`/layout cost: re-measure positions after layout changes instead of caching rects forever.
- Check at CPU throttle (4x) and on a real phone; if a frame drops, remove the effect rather than tuning it.
- No library is added for what CSS transitions, keyframes and the Web Animations API can do (refs 2, 3, 7 agree).

Sound (Web Audio) in line with the same ideas
- Two layers: sparse event cues (pick up, drop, stamp, bell, coin) and a quiet ambient bed. Keep cues brighter
  (high-pass around 800 Hz) and the bed duller (low-pass around 4 kHz) and about 6-8 dB lower so cues are not masked.
- Cue density follows the game's calm character: leave beats silent, and remove a third to a half of cues that are only
  decorative; fade the bed in over about 0.3 s and out over about 1.5 s; one-shot reward sounds, never loops.

### 3.3 Anti-patterns ("AI slop" tells) to avoid in this game's UI

Palette and surface: indigo/violet defaults, purple-to-blue or cyan-on-dark gradients, gradient text, neon glow halos,
glass blur as decoration, pure black/white, zero-chroma greys next to a warm palette, a coloured left border on a
rounded card, identical rounded cards with identical soft grey shadows, a card inside a card.
Type and chrome: tracked all-caps eyebrow labels, an italic or recoloured single word inside a heading, section numbers
with no sequence, dot-joined meta strings, "WORD - fragment" labels, arrows glued to link text, decorative status dots or
version pills, monospace used as a "technical" costume, a system font as the display voice.
Content: invented statistics, placeholder names, filler copy, a success message with nothing behind it, celebratory toasts
for visible effects, the same entrance on every element.
Motion: fade-and-slide-up on everything, bounce on plain UI, linear or default `ease` curves, animating layout
properties, `transition: all`, stagger that delays interaction, ambient loops that never stop, parallax and custom cursors,
hover scaling an image, a focus ring that fades in.
Process: judging from one downscaled full-page screenshot; critiquing only the happy path; fixing ten things per round.

### 3.4 Critique procedure to run on screenshots before declaring UI work done

1. Capture, do not imagine. For each changed screen, capture real-size screenshots: desktop stage at least 1600x1000
   and one smaller window, phone portrait (about 390x844) and one narrow phone (about 360x740) if the layout differs;
   each in the states touched (empty, populated, long text, disabled, error). One image per screen at original size,
   never a shrunk composite. Motion: capture normal and reduced-motion runs of the same interaction at start, first
   animated, middle, last animated and settled frames. (A Playwright script that waits for the page to settle is the
   pattern in reference 1's `webapp-testing`; the project's own tooling takes precedence.)
2. Look at each image and answer, in writing, with a location for every finding:
   a. First three seconds: what is this and what do I do next? Is the screen's one focal point obvious?
   b. Squint test: is the order primary, secondary, groups still readable when blurred?
   c. Specificity: would another product's screen look the same? What is the single memorable element?
   d. Craft: alignment and optical alignment, spacing rhythm (tight groups, generous separation), orphan words and bad
      line breaks, overflow and clipping, text over busy art, outline weight, shadow offsets, colour count, accent
      overuse, mixed styles from different eras of the code.
   e. Language: longest Japanese, English and Chinese strings fit; CJK leading and tracking right; chrome labels in the
      correct language.
   f. Phone: touch targets at least 44px, thumb reach, safe areas, no hover dependence, nothing cut off.
   g. States and honesty: every state exists; nothing claims success it does not have; nothing is marked right or wrong
      that the game deliberately leaves unmarked.
   h. Motion: purpose named for each animation; durations and easings from the tokens; exits faster than entrances;
      content visible without scripts or motion; reduced-motion run shows the same information without travel;
      repeated use stays pleasant; no animation layout shifts; perf on a throttled run.
   i. Cut test: name one thing that could be removed and make the screen better. Remove it unless it carries function.
3. Triage into P0 (blocks the task or misleads), P1 (major confusion), P2 (minor), P3 (polish). Fix in that order:
   broken or misleading, missing states, hierarchy and consistency, visual and motion refinements, cleanup. Do not
   spend effort perfecting a P3 while a P1 remains.
4. Fix at most the three most damaging things per round (structure before craft), recapture the same shots, and look
   again. At least two rounds for new screens or a new motion; a single round for a trivial tweak, and say so. If the
   fifth round is still changing a lot, stop and report that the direction is wrong instead of polishing.
5. If a separate reviewer or fresh sub-agent is available, hand it only the screenshots, the intent in two lines and
   this checklist, with no build history; the thread that built a screen is its weakest reviewer (refs 2 and 4).
6. Report honestly: list what was captured and at which sizes, what was fixed, what remains and why, and what could
   not be verified (for example, real-phone performance or reduced-motion in a browser that was not available).
   Never claim a clean result for evidence you did not look at.

---

## 4. What could NOT be used, and why

- **GSAP itself (reference 6).** It is a runtime dependency that would be bundled into the single HTML file. This repo
  contains only the skill text (MIT); its README asserts that GSAP and all formerly paid plugins (SplitText, MorphSVG
  and so on) are free, including commercial use, and a plugin file says no membership, key or token is needed. The
  repo does not include the GSAP licence text, the library source or its size, so the real licence terms and bundle
  weight were NOT verified here and must be checked in the published `gsap` package before any adoption. Other
  references (2, 3, 7) advise against adding a library when CSS or the Web Animations API suffices. Default decision:
  do not add GSAP. Its ideas (timelines with position labels, stagger, `quickTo`, Flip, DrawSVG, `matchMedia` for
  reduced motion) can be reproduced natively.
- **Video and Remotion pipelines (references 9, 10, parts of 3, 5, 7).** `anything2explainer` renders MP4s with TTS;
  `huashu-design` video/HyperFrames/PPTX export, `garden-skills` motion-showreel and web-video-presentation, and
  `oil-motion`'s AI-video/atlas pipeline have no use in an offline interactive game. `anything2explainer` is also
  licensed noncommercial only; this project is personal use, but do not copy its code or look.
- **Anything needing network or services at runtime or build time.** Image/video generation APIs (oil-motion,
  huashu, garden-skills gpt-image-2), Wikimedia photo fetching (hallmark, huashu), CDN fonts and libraries
  (garden-skills examples, open-design recipes), the Hallmark and Impeccable linters (Node tools, Chrome/puppeteer,
  installs). The game has no network at runtime; fonts and assets must be embedded or system fonts. Running these tools
  was out of scope for the reading task.
- **Bans on hand-drawn SVG illustration.** Hallmark gate 80, huashu `materials.md`, garden-skills failure patterns and
  Impeccable's Codex-only block say not to draw objects, people, buildings or scenes as SVG. They target marketing and
  brand pages, where stock photos or real captures are possible. This game's art direction is deliberately drawn SVG/CSS
  scenes, with no photographs available, so those bans do not apply; the same sources still support their underlying
  point: crisp shapes, consistent outline weights, depth cues, and no cheap approximations (geometric masks pretending to
  be organic edges).
- **Pixel-art specifics (reference 8).** The pixel framebuffer, dithering and 12 fps pose stepping fit a pixel-art game,
  not a smooth storybook look. Only the choreography ideas and timing are used. The effects' code is canvas-based, and
  its gallery font is not under the MIT licence.
- **Marketing-page rules.** Hero and fold budgets, scroll choreography, landing anatomies, "stat-led" or "marquee" page
  shapes (hallmark, impeccable Persuade mode, garden-skills) do not apply to a game with no scrolling marketing page.
  The Impeccable "Operate" mode ideas (scanability, restraint, precise details) are closer to menu and notebook screens.
- **Brand-imitation material.** Open-design's roughly 150 brand design-system folders and huashu's 92-style library imitate real
  brands and styles; do not use them to copy anyone's look. Anthropic's `brand-guidelines` (reference 1) is Anthropic's
  own identity.
- **Native app rules.** Impeccable `ios.md`/`android.md` target native apps; this is a web build.
- **Gaps.** Japanese typography has no dedicated guidance in any reference (Chinese rules in open-design and huashu are the
  nearest). Game-specific audio guidance exists only as video mixing numbers. No reference gives phone performance budgets
  for SVG scenes; the numbers in 3.2 are an own choice to be confirmed on a device. Several large directories were only
  sampled (open-design's about 150 design-system folders and about 170 skill folders, hallmark's 50 themes and 21 macrostructures, impeccable's
  `live`, `harden`, `onboard`, `adapt`, `document` references, garden-skills' style recipes beyond the one read, pixelfx's
  effect sources beyond descriptions, oil-motion's `motion-patterns.md` cards).
