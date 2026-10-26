A 24px capsule label, never interactive, for a fact about something: its grade, a discount, a recipe length.

**Markup.** `<span class="tag rounded">` with one variant: `hi` (`blue`, for grades and discounts), `brand` (pink fill, black text), `white` (on colour). Plain `tag` is `sunken`.

Related labels:
- `<span class="k">Today's order*</span>`: the black label chip with white caption text, 7px radius, at the top of hero cards and verdicts.
- `<span class="live">12 baking</span>`: a pulsing round `success` dot with `success-strong` text.
- `<span class="star">*</span>`: the pink asterisk at the end of a headline.

**Rules.**
- Tags never act as buttons. If tapping does something, use a Chip.
- One black label chip per card.
