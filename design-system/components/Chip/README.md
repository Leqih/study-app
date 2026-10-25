A 32px chamfered chip for picking several options, or for listing small earned items.

**Markup.** `<button class="chip cut" aria-pressed="true|false">Label</button>` inside `<div class="chips">`. Add a 16px icon before the label when the option has one (sounds use the note icon). A count goes in `<span class="n">× 3</span>` after the label. On a `bg` or tinted ground where the chip lists items rather than options, use `chip white`.

**Rules.**
- Selected is `text` fill with an `on-dark` label; unselected is `sunken`. The state lives in `aria-pressed`, not only in colour.
- Chips wrap with `sp-2` gaps; never scroll them sideways.
- For a single choice among three, use the lock options or a SegmentedControl, not chips.
- Labels are nouns in sentence case, no trailing punctuation.
