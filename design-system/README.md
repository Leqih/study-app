Sweet Study turns a study session into a bake: pick a recipe, prep the batter (flour sets the time, each egg is a goal, whisking is a breathing warm-up), close the oven door to lock distracting apps, decorate on the break, and order the real dessert nearby. This system keeps every screen of that app consistent.

## Content fundamentals

- Write in English, sentence case, second person: “Pour flour to set how long you’ll study.” Never title case on buttons.
- Say what happens in kitchen words the user already knows: *pour, crack, whisk, preheat, bake, take it out*. Keep study words where they are clearer: *goal, round, break, focus*.
- Buttons are verbs with the outcome: “Start baking”, “Preheat the oven · 50 min”, “Open the oven early”. Add the number after a middle dot `·` when it helps the decision.
- Status lines are short and factual: “Back in time. That was exit 1.” No exclamation marks except the oven’s own “Ding!”.
- No emoji anywhere, in UI or copy. Use an icon from the icon set or nothing.
- Numbers: minutes as `50 min`, rounds as `2 × 25 min`, grams as `503 g`, countdowns as `43:24`.

## Visual foundations

**Look.** Faceted paper cut: flat colour planes, straight edges, 45° chamfered corners, a faint paper grain on illustrations only. No blur, no drop shadows, no gradients in UI. Layers are told apart by tone: `bg` → `surface` → `sunken`.

**Colour.**
- Screens sit on `bg`. Cards, lists and the tab bar are `surface`. Controls that sit lower (chips, segmented track, steppers) are `sunken`.
- Text is `text`; secondary lines are `text-2`. Use `text-3` only for placeholders, disabled labels, chevrons and outlines: it is 3.5:1, too light for reading.
- Pink is the brand. Fill with `brand` and put `text` on it; when pink is the text or icon, use `brand-strong`. Soft pink grounds are `brand-tint`.
- Mint (`success`) means progress and “on”: switches, ticks, friends’ progress. Its text form is `success-strong`.
- Lemon (`highlight`) marks one thing to notice: a grade, a discount, a goal number. Text on it is `text`.
- Sky (`info`) is for the coupon and location. Never white text on it.
- `danger` only for a destructive action inside an alert.
- `pink-l`, `sky-l`, `mint-l`, `lemon-l` and `caramel` are for illustrations, avatars and data tiles, never for chrome.

**Type.** Outfit for everything; DM Mono only in `clock`, for running countdowns. Use the ten styles and nothing between them: `display` for tab-screen titles, `title1` for flow heroes, `title3` for section headers, `headline` for nav titles and buttons, `body` for row titles, `callout` / `subhead` / `footnote` for supporting text, `caption` for tags and labels, `overline` in uppercase `brand-strong` for eyebrows like TODAY’S ORDER. Numbers that line up use tabular figures.

**Space.** 4-point steps only (`sp-1` … `sp-8`). Screen gutter `sp-5` (20). Card and sheet padding `sp-4` (16). Sections are `sp-6` (24) apart, a section header sits `sp-3` (12) above its content, siblings inside a group are `sp-2` (8) apart.

**Shape.** Corners are cut, never rounded. Three sizes: `cut-s` (6) for anything under 36px tall, `cut-m` (10) for 36–56px pieces, `cut-l` (16) for cards, lists and sheets. A sheet is cut only on its top corners. Apple’s own chrome (status bar, Dynamic Island, the Live Activity inside it) keeps its round shapes.

**Size.** Primary buttons and fields are `h-l` (52), secondary buttons and goal rows `h-m` (40), chips and compact buttons `h-s` (32). Every tappable thing has at least a 44px hit area. A list row is at least 56 tall and always leads with a 40px tile or avatar so the separators line up at 68px.

**Motion.** Screens push in 380 ms with `cubic-bezier(.3,.8,.3,1)`; flows slide up from the bottom; sheets rise in 420 ms; banners and toasts drop in with a slight spring. Presses scale to 0.985. Respect reduced motion.

**States.** Selected: `text` fill with `on-dark` label (chips, lock options) or a `surface` pill on a `sunken` track (segmented control). Disabled: `sunken` fill, `text-3` label. Focus: a solid 3px `info` outline. Locked steps show a lock glyph and shake when tapped.

## Layout

The app is drawn at iPhone 16 Pro size, 402 × 874 pt. Every screen is: status bar (54) → nav bar (52) or large title → content scrolling under it → a bottom bar with the primary action (padding 12 / 20 / 34). Tab screens show the five-item tab bar (84) instead of a bottom bar. A bake flow shows six progress segments under the nav bar.

## Iconography

Line icons on a 24 grid, 2px stroke, square caps and mitred joins, in `currentColor`. Sizes: 24 in nav and tab bars, 20 in tiles, 16 inside chips and the lock bar. Chevrons are 10 × 16. Illustrations (desserts, the oven, toppings, avatars) are faceted polygons in the palette (light, mid and dark plane per object, lit from the top left) with a paper-grain filter; they live in the app's art file, not in this system yet. Avatars are drawn portraits, never initials.

## Components

Button, Chip, Tag, ListRow, SegmentedControl, Switch (with Check), StepProgress, Stat, Banner (with Toast). Each card shows the markup classes to use; wrap a block in `class="ss"` to pick up the styles.
