A 52 × 32 chamfered switch for an on/off setting, plus the 24px checkbox and radio it pairs with.

**Markup.** `<button class="switch cut" role="switch" aria-checked="true|false" aria-label="…">`. Checkbox: `<span class="check cut" aria-checked>` holding a white tick when checked. Radio: add `radio`; when selected it fills `brand-strong`.

**Rules.**
- On is `success` with the thumb right; off is `line-strong` with the thumb left. The thumb position carries the state, so the off track may stay light.
- A switch applies at once; never pair it with a Save button.
- Unchecked boxes are outlined in `text-3` (3.8:1 on surface). Checked boxes fill `text`.
- Put switches at the end of a ListRow, never on their own.
