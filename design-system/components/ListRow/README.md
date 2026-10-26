A 60px row inside a glass list card (`r-l`, 28), led by a 40px tile (14 radius) or circular avatar, with a title, an optional subtitle and one trailing control.

**Markup.** `<div class="list rounded">` holds rows: `<div class="row">` or `<button class="row">`. Inside: the leading piece (`<span class="tile rounded">` with a 20px icon, an avatar, or a `check`), then `<span class="grow"><span class="t">Title</span><span class="s">Subtitle</span></span>`, then one trailing piece: chevron, Switch, Tag, or a `btn soft small`.

Tile tints: `tile brand` for focus, lock and reports; `tile info` for sound and media; `tile success` for people.

**Rules.**
- Always lead with a 40px piece so separators start at 68px and line up.
- Title is `body` at 700 and truncates on one line; subtitle is `footnote` in `text-2`.
- One trailing element. A row that navigates ends in a chevron; a row that toggles ends in a Switch.
