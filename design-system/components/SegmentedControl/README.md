A capsule track of two to four segments for switching between the steps of one screen.

**Markup.** `<div class="seg rounded" role="tablist">` with `<button class="rounded" role="tab" aria-selected>` segments. Each starts with an 18px circle marker: a number for an open step, a lock glyph for a locked one (`aria-disabled="true"`), or a black tick when done.

**Rules.**
- The selected segment is a white capsule with a soft shadow on the `sunken` track; others are `text-2`, locked ones `text-3`.
- Steps unlock in order. Tapping a locked segment shakes it and says what to do first.
