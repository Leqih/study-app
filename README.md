# Sweet Study

A concept for a study app where one study session is one bake. You pick a recipe, prep the batter (pouring flour sets how long you'll study, each egg you crack is a goal, whisking is a breathing warm-up), close the oven door to lock distracting apps, decorate your dessert on the break, and can order the real one from a shop nearby.

This repository holds the clickable web prototype, drawn inside an iPhone 16 Pro frame, and the design system it is built on.

## Run it

Open `index.html` in a browser. Everything is in that one file. On a phone-width window it fills the screen without the device frame.

Add `?intro` to see the first-run intro. Add `?debug` to the URL to get two test hooks in the console: `__sim(seconds)` runs the kitchen simulation forward, and `__bake(seconds)` moves the oven timer. Add `?new` to see a first-day account: no friends, no bakes, no streak.

## What's in the prototype

- **Tabs:** Home (today's order, focus today against your daily goal, the streak, this week, friends baking now), Rooms, Case (desserts you've baked), Nearby (shops and pickup orders), Me (settings: default lock, daily goal, rest day).
- **Starting a bake:** one tap on Home starts today's recipe with your saved lock and sounds, and unfinished goals carry over. Joining a friend is also one tap and bakes for exactly the time they have left. The full setup is optional: Recipe → Prep (flour, eggs, whisk mini-games on a canvas) → Preheat (four lock levels from Gentle to Strict, allowed apps, sounds, baking with friends).
- **While baking:** timer, goals you can add at any time, phases. Rounds are 25 min with a 5-min break between; one pause of up to 2 min per bake. Locking the screen never counts as leaving; breaks and pauses don't either. Gentle only counts exits and never burns.
- **Picking a bake:** the session is drawn as a route (bake stops, breaks, the dessert at the end) above a carousel of dessert stamps; swipe to change, tap the middle stamp to lift it.
- **After:** Out of the oven (the verdict, a burst of toppings and a bake receipt that prints out of the oven) → Break (a timer that asks you to look away; decorating is optional; the 10%-off nudge only appears after a golden bake).
- **Dessert case:** a grid, or a display board where you pick a dessert, bring it to the front or back, tilt it and share the board.
- **Nearby:** ordering ahead prints a pickup ticket with an Add to Apple Wallet button.
- **Intro:** three pages on a first day (`?new`, `?intro`, or Settings → Show the intro again).
- **System-level pieces:** launch screen, notification banners, a Live Activity in the Dynamic Island, a simulated phone home screen with locked apps when you leave, swipe from the left edge to go back.

Timers run at 60× by default for demos; tap `60×` in the bake screen to switch to real time.

## Source layout

| Path | What |
| --- | --- |
| `index.html` | The built prototype |
| `src/app.css` | All styles, written on the design-system tokens |
| `src/app-body.html` | Markup for every screen, sheet and overlay |
| `src/app-motion.js` | Motion kit (focus-in titles, counting numbers, staggered rows, bursts) and the printed slip |
| `src/app-ui.js` | Data, navigation and every screen's logic |
| `src/app-more.js` | Launch screen, banners, Live Activity, swipe back, room/settings/case pages |
| `src/engine.js` | The prep kitchen's canvas engine (flour physics, egg cracking, whisking) |
| `src/loop.js` | Animation loop and `?debug` test hooks |
| `src/art.json` | Dessert and oven illustrations |
| `build.py` | Assembles `index.html` from `src/` |
| `design-system/` | Tokens, brand book and component guidelines |

Rebuild after editing anything in `src/`:

```bash
python build.py
```

## Design system

`design-system/README.md` is the brand book. v5 keeps v4's "linked blocks" and adds the motion kit, printed slips, stamps and the session route. v4 is "linked blocks": white blocks stacked in one column and fused by small necks, light type, shapes that hold content, a segmented arc gauge and a split dock, in Matcha Cream, Hydrangea Sky and Orchid Pulse. `design-system/tokens.json` holds every token; `design-system/components/` has a guideline and a live preview for each component.
