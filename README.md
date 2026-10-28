# Pocket Room

Save Money. Build Your Little World.

A clickable savings and room-decorating concept, with fictional balances and local browser storage. No real money moves and no bank connection is made.

## Run and build

Open `index.html` directly, or run `python -m http.server 8000 --bind 127.0.0.1` from this directory. Edit `src/app-body.html`, `src/app.css`, and `src/app-ui.js`, then run `python build.py` to regenerate the standalone `index.html`. Python's standard library is the only build dependency.

## Interactions

- Today: total savings, weekly progress, room overview and quick deposits.
- My Jars: create goals, deposit and withdraw demo money.
- My Room: place collected furniture and change the palette. Reaching $800 in cumulative deposits unlocks a travel print. Withdrawals never revoke rewards.
- Friends: visit demo rooms, send likes and complimentary flowers. Balances are private.
- Profile: demo account status, privacy explanation and transaction history.

The wishlist describes future goal-linked rewards; the implemented reward is the $800 travel print. Saving reminders and social actions show demo confirmations, without external delivery or scheduling. State persists under `pocket-room-v1` in localStorage. The app reuses the original iPhone device shell, status bar, linked-block styles, design tokens, button styles, and `src/app-motion.js` focus-in/stagger animations. `build.py` assembles those source files into the standalone page. Kitchen-specific modules remain available but are not loaded by the savings workflow.
