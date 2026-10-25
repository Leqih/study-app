A 24px non-interactive label for a fact about something: its grade, a discount, a recipe length.

**Markup.** `<span class="tag cut">` with one variant: `hi` (`highlight`, for the one thing to notice: grades, discounts, today’s order), `brand` (`brand-tint` with `brand-strong` text), `white` (on tinted cards). Plain `tag` is `sunken`.

Related labels:
- `<span class="live">12 baking</span>`: a square `success` dot with `success-strong` caption text, for live counts.
- `<span class="overline">`: an uppercase eyebrow in `brand-strong` above a hero title.

**Rules.**
- Tags never act as buttons. If tapping does something, use a Chip.
- At most one `hi` tag per card, so it keeps meaning “look here”.
- `caption` style, sentence case; keep it to two or three words.
