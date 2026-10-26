A 34px capsule for picking several options, or for listing small earned items.

**Markup.** `<button class="chip rounded" aria-pressed="true|false">Label</button>` inside `<div class="chips">`. A 16px icon may lead; a count goes in `<span class="n">× 3</span>`. On glass or colour, use `chip white`.

**Rules.**
- Selected is `brand` fill with a black label; unselected is `sunken`. The state lives in `aria-pressed`, not only in colour.
- Chips wrap with `sp-2` gaps; never scroll them sideways.
- For a single choice among a few (lock level, mood), use selectable cards or the mood grid, not chips.
