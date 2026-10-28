# Pocket Room

Save Money. Build Your Little World.

A clickable savings and room-decorating concept, with fictional balances and local browser storage. No real money moves and no bank connection is made.

## Run and build

Open `index.html` directly, or run `python -m http.server 8000 --bind 127.0.0.1` from this directory. Edit `src/app-body.html`, `src/app.css`, and `src/app-ui.js`, then run `python build.py` to regenerate the standalone `index.html`. Python's standard library is the only build dependency.

## 3D room assets

The room and furniture are modelled, shaded and rendered in Blender by `blender/build_room.py`: a Monument Valley style true-isometric orthographic camera, toon (3渲2) shading (Diffuse → Shader to RGB → constant colour ramp with a lavender shadow tint) and soft plum Freestyle outlines. It renders the room shell in three palettes (oat, sage, rose) and each collectable item as its own cropped transparent layer on the same camera, then writes `assets/room/*.webp`, `assets/room/manifest.json` (each layer's placement box and depth) and `blender/pocket_room.blend`. `build.py` inlines those renders into `index.html`, and the app stacks the layers far-to-near so items can be placed and removed.

```
blender -b --python blender/build_room.py            # full render, about 30 s
blender -b --python blender/build_room.py -- --quick # everything in one image, for composition checks
```

## Interactions

- Today: total savings, weekly progress, room overview and quick deposits.
- My Jars: create goals, deposit and withdraw demo money. The Room Wishlist links the Summer Trip jar to rewards: 25% unlocks the travel poster, 50% the suitcase, 100% the explorer globe.
- My Room: place collected furniture and change the palette. Reaching $800 in cumulative deposits unlocks the book shelf. Rewards follow each jar's best-ever progress, so withdrawals never revoke them.
- Friends: visit demo rooms, send likes and complimentary flowers. Balances are private.
- Profile: demo account status, privacy explanation and transaction history.

Saving reminders and social actions show demo confirmations, without external delivery or scheduling. State persists under `pocket-room-v2` in localStorage. The app reuses the original iPhone device shell, status bar, linked-block styles, design tokens, button styles, and `src/app-motion.js` focus-in/stagger animations. `build.py` assembles those source files into the standalone page. Kitchen-specific modules remain available but are not loaded by the savings workflow.
