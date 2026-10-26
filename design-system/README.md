Sweet Study turns a study session into a bake: pick a recipe, close the oven door to lock distracting apps, take a real break, collect the dessert, and order the real one nearby. This system keeps every screen of that app consistent. The app's language is English.

**Version 4: linked blocks.** v1 (paper-cut chamfers) read as a concept shot; v2 (cream, native) lost its personality; v3 and v3.1 (Y2K glass, then a shop-app layout) piled on too much decoration to ship. v4 takes its layout from BRIK (white blocks stacked into one column and fused by small necks, light type, tick bars, a split dock) and its graphic language from Classly and Intelly (flat flowers, stars and scallops that hold content; a segmented arc gauge with icon badges; steps inside different shapes). Colour: Matcha Cream, Hydrangea Sky and Orchid Pulse, with black for type and actions.

**Version 5: things you can hold.** v5 keeps the v4 layout and adds motion and objects from real-world references: a route with stops and stamps that lift (an Inspora travel app), titles that come into focus and numbers that count up (an Inspora onboarding), a collage you arrange (Inspora's collection layout), and a ticket printed out of a slot (Inspora's boarding-pass printer). The daily focus report on Home follows Opal.

## Principles

1. **One column of blocks.** A screen is a stack of white blocks, 7 px apart. Blocks that belong together are fused with necks; a plain row (no block) sits between groups.
2. **Light type, big numbers.** Greetings and numbers are regular or light (400 / 300) and large; hierarchy comes from size and grey, not from weight.
3. **Shapes hold things.** A flower, star or scallop is always a plate, a frame or a badge for something (a dessert, a face, a step). Never decoration on its own.
4. **Black means go, orchid means now.** The main action is black. Orchid marks the current thing: today's tick, the current arc segment, the streak.
5. **Numbers are real.** Every figure is computed from the same data (the week feeds the weekly goal, Focus today and Me).
6. **Change in place.** Things move where they are instead of opening new pages: the picked stamp lifts, the others fall back and blur, a ticket prints into the screen you're on. Each moment of reward (a bake out of the oven, a pickup order, the month) prints a slip.

## Content fundamentals

- English, sentence case, second person. Every button is sentence case (Start, Pause · 2 min, End early). Pills, tags and the dock (Today, Rooms, Nearby) are sentence case too.
- Tap targets are at least 44 pt; smaller visuals extend their hit area with `::after`. Text on light grounds meets 4.5:1.
- Kitchen words for the bake (*bake, break, shut the door*), study words where they're clearer (*goal, round, focus, streak*).
- Pills state facts in a few words: `2 × 25 min`, `5-day streak`, `Standard lock`.
- No emoji. No exclamation marks except the oven's "Ding!".

## Visual foundations

**Colour.** Three named colours. Matcha Cream `#EBF6C9` is the page `bg`; blocks are `surface` white on it. Hydrangea Sky `#8CA7F4` (`blue`) is the accent: the Weekly goal block (white text), done parts of arcs and rings, the selected dock segment, today's big cookie; its tint `#E3E9FD` grounds pills and empty fills, `#2F4FC0` is its text colour. Orchid Pulse `#C349EE` (`brand`) marks the current thing: today, the streak, the current segment, the selected recipe; its tint `#F3DDFC` grounds plates and badges, `#8A1BB5` is its text colour. Black `text` for type, primary actions and the dock. Greys `text-2` / `text-3` for secondary text and empty tracks. Dessert illustrations keep their orchid icing; their teal and cyan parts use the Hydrangea family.

**Blocks and necks.** Blocks have a 22 px radius and 16–18 px padding. `.blk.join` fuses a block to the one above with two 30 × 21 px necks 26 px in from each side, cut with 8 px concave circles. `.pair` puts two blocks side by side with a sideways neck in the middle. Necks take the colour of the lower block.

**Type.** One typeface: SF Pro on Apple devices, Inter everywhere else (its closest open match, loaded from Google Fonts). No monospace in the UI. Six sizes on Home: caption 13/400 grey, label 15/600, headline 17/600, title 22/600, greeting and block numbers 28/600 (the greeting's second line 28/400 grey), display 44/600. The bake clock stays light (300). Pills and tags are 12/600, sentence case, fully round; dock labels 14/600.

**Spacing.** Every block has a 16 px inset; the stack gap is 7 px; the bottom of the last block keeps at least 16 px above the dock.

**Shapes.** Flowers are circles arranged around a centre (6, 8 or 12 petals); the star has 8 points; the scallop has 14 bumps. Use: an orchid scallop plate under today's dessert, faces in a flower / star / scallop frame, a sky star badge on the last dessert, today's cookie in the greeting block (a large 6-petal flower, pale sky `#E3E9FD` filling with sky `#8CA7F4` as today's minutes add up, the smile drawn on it), an orchid 12-petal flower behind the baking dessert, and the round plan (bake = scallop, break = flower, current = black).

**Progress.** Weekly goal: a tray of seven flower cookies for the last seven days, today always last, one per day, each filling from the bottom with that day's minutes; a full cookie is a day that did its share (weekly goal ÷ 7). Past days are white, today orchid `brand`. Today's big cookie in the greeting, the weekly block's right neck and today's small cookie share one vertical line (38 px in from the right edge), so the two blocks read as today feeding the week. Focus today: one continuous half arc (grey track, sky done, an orchid dot where today stands). Baking: a 36-segment ring (done Hydrangea Sky, current Orchid Pulse, rest grey) with three white icon badges (leave, sound, goals).

**Dock.** Instead of a tab bar: a white round button (Me) · a black segmented pill (TODAY / ROOMS / NEARBY, the selected one Hydrangea Sky) · a black round + (new bake). The case lives in Me.

**Motion.** One small kit in `src/app-motion.js`, used everywhere:
- *Focus in* (`blurIn`): a title's words go from blurred and transparent to sharp, 70 ms apart. Used on the greeting, the recipe title, the verdict, the report title and each intro page.
- *Count* (`roll`): a number counts from what was showing to its new value over 0.9 s, ease-out. Arriving on Home counts every number up from zero. Used for the focus report, the weekly percentage, focus minutes and the friend count.
- *Arrive* (`stagger`): list rows rise 12 px and fade in, 45 ms apart, when a tab comes in.
- *Fill*: cookies fill from empty when Home comes in.
- *Burst*: toppings and coloured flecks pop out from a dessert and fall away, behind soft rotating light rays. Only for real wins: a bake out of the oven that isn't burnt, and the last intro page.
- *Print*: a slip feeds down out of its slot over 1.7 s, curled at first and flattening as it comes out. Tapping the slot pulls it back and prints it again.
- Presses spring to .96; stamps move with a spring (`--spring`). Under reduced motion everything settles instantly and nothing bursts.

**Slip.** A black slot (40 px, fully round, a small caps label in 55 % white) with a white ticket feeding out under it: a kicker in 11 px caps grey, a 26/600 headline, label and value rows (14 px, values 600 tabular), a perforation between sections (a dashed line with a notch bitten from each side), a zigzag torn bottom, and a barcode with a small caption. Used for the bake receipt, the monthly report and the pickup ticket.

**Stamp.** A white card with a perforated edge (5 px holes every 14 px), 0.82 aspect, holding a dessert on its own pale colour (latte sky, macaron orchid, cupcake matcha, shortcake pink) and its focus minutes in the corner. A lifted stamp rises 8 px, straightens and shows its caption.

**Route.** The session as a line on a Hydrangea Sky block: bake stops are white scallops with their minutes, breaks are small flowers, the dessert sits at the end. The line draws itself and the stops pop in whenever the recipe changes.

## Layout

The app is drawn at 402 × 874 pt. Stacks sit 12 px from the screen edges.

**Home**: brand block (wordmark, streak pill) → greeting block, fused (one-line greeting, then today's focus report in three numbers like Opal's: Focus score, the minutes-weighted average of each bake's score, 100 minus 12 per exit, 50 if ended early, 20 if burnt; Phone-free minutes; Exits; today's cookie on the right) → weekly goal block in Hydrangea Sky, fused (percentage and the cookie tray) → today's order block (dessert name, time line, the dessert on an orchid scallop plate, Start baking and Change) → pair: Focus today (half arc) | Baking now (faces in shapes, friend count) → Recently baked (dessert in a star badge, name, minutes pill) → the dock.

**Baking**: brand block (60× demo toggle, lock pill) → sky metrics block, fused (round, goals, exits) → hint → the segmented ring with the dessert on an orchid flower and three badges → the round plan in shapes → the big light clock → who is baking too → goals block → Pause (filled) and End early (outlined).

**New bake**: the title comes into focus → the route block for the picked recipe → the dessert names in a strip that slides with the stamps (the middle one sharp, its neighbours faint at the edges) → a carousel of stamps that snaps to the middle; the middle stamp is full size and straight, the others shrink, tilt and fade; tapping the middle one lifts it → tool, type and the Today's order tag → Prep first and Start.

**Out of the oven**: the verdict (pill, a focus-in headline, one line) → the dessert on light rays, with a burst → the bake receipt printing from the Sweet Study oven: dessert, date and lock; focus time, rounds, exits, goals, focus score; toppings earned; goals with what carries over; barcode → Take a 5-min break.

**Dessert case**: Grid or Display. Display is a dotted board with the desserts as stamps dealt in three loose, overlapping columns, each tilted. Tap one: it moves to the middle at 1.55×, crop marks appear, everything else blurs and fades, the caption names it, and the tools become Back, Front, Tilt and Open. Tap it again, or the board, to put it back. With nothing picked the tools are Shuffle and Share board.

**Pickup ticket**: ordering ahead opens a sheet with the ticket printing from the shop's slot, on a Matcha Cream panel so the notches show: ready time, shop and walk, items, the golden-bake discount, total, barcode → Done and Add to Apple Wallet.

**Intro**: shown on a first day (`?new`), with `?intro`, or from Settings → Show the intro again. Three pages and a Skip button: a fan of stamps; friends baking now with their minutes counting; the dessert with rays, a burst and a 10 % off badge. Each title comes into focus. Progress is a small route with three stops (the current one larger, orchid with a white ring) between a back and a next button; the last page ends in Start my first bake and Look around first.

## Components

Block (with join and pair), Pill, Dock, Shape (flower, star, scallop), Arc gauge, Tick bar, Button, Chip, Tag, ListRow, SegmentedControl, Switch, Banner, Toast. Older components keep their v3 docs where unchanged; the blocks, pills, shapes, arc and dock are new in v4; the slip, stamp, route, display board and the motion kit are new in v5.
