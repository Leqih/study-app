A 40px track of two to four segments for switching between the steps of one screen, with each step's state on its marker.

**Markup.** `<div class="seg cut" role="tablist">` with `<button class="cut" role="tab" aria-selected>` segments. Each segment starts with an 18px marker: `<span class="num cut">2</span>` for an open step, the same marker holding a lock glyph for a locked step (`aria-disabled="true"`), or `<span class="tick cut">` with a tick for a finished one.

**Rules.**
- The selected segment is a `surface` piece on the `sunken` track; others are `text-2`, locked ones `text-3`.
- Steps unlock in order. Tapping a locked segment shakes it and shows one line saying what to do first; it never silently does nothing.
- Use it for steps or views of the same thing. For choosing a value that changes the outcome (lock strength), use selectable cards.
