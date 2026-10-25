A 56px row inside a chamfered list card, led by a 40px tile, avatar or checkbox, with a title, an optional subtitle and one trailing control.

**Markup.** A `<div class="list cut">` holds rows. A row is `<div class="row">` or, when the whole row is tappable, `<button class="row">`. Inside: the leading piece (`<span class="tile cut">` with a 20px icon, an avatar, or a `check`), then `<span class="grow"><span class="t">Title</span><span class="s">Subtitle</span></span>`, then one trailing piece: a chevron, a Switch, a Tag, or a compact Button.

Tile tints: `tile brand` for focus and lock settings, `tile info` for sound and media, `tile success` for people. Data tiles (shops, app categories) may take a palette colour inline.

**Rules.**
- Always lead with a 40px piece so the separators start at 68px and line up across rows.
- Title is `body` at 600 and truncates on one line; subtitle is `footnote` in `text-2`.
- One trailing element. A row that navigates ends in a chevron; a row that toggles ends in a Switch and the row itself is not a button.
- Checked goals strike through the title and turn it `text-2`.
