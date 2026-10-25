# Sweet Study

A concept for a study app where one study session is one bake. You pick a recipe, prep the batter (pouring flour sets how long you'll study, each egg you crack is a goal, whisking is a breathing warm-up), close the oven door to lock distracting apps, decorate your dessert on the break, and can order the real one from a shop nearby.

This repository holds the clickable web prototype, drawn inside an iPhone 16 Pro frame, and the design system it is built on.

## Run it

Open `index.html` in a browser. Everything is in that one file. On a phone-width window it fills the screen without the device frame.

Add `?debug` to the URL to get two test hooks in the console: `__sim(seconds)` runs the kitchen simulation forward, and `__bake(seconds)` moves the oven timer.

## What's in the prototype

- **Tabs:** Home (today's order in the oven, this week, friends baking now), Rooms, Case (desserts you've baked), Nearby (shops and pickup orders), Me (settings).
- **Bake flow, six steps:** Recipe → Prep (flour, eggs, whisk mini-games on a canvas) → Preheat (focus lock strength, locked app types, allowed tools, sounds, baking with friends) → Bake (timer, goals, phases) → Out of the oven (grade and toppings) → Decorate (break timer, drag toppings on).
- **System-level pieces:** launch screen, notification banners, a Live Activity in the Dynamic Island, a simulated phone home screen with locked apps when you leave, swipe from the left edge to go back.

Timers run at 60× by default for demos; tap `60×` in the bake screen to switch to real time.

## Source layout

| Path | What |
| --- | --- |
| `index.html` | The built prototype |
| `src/app.css` | All styles, written on the design-system tokens |
| `src/app-body.html` | Markup for every screen, sheet and overlay |
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

`design-system/README.md` is the brand book: colour, type, spacing, chamfered shapes, icons and copy rules. `design-system/tokens.json` holds every token; `design-system/components/` has a guideline and a live preview for each component.
