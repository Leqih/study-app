A chamfered button that names the action and, when it helps, its outcome after a middle dot.

**Markup.** `<button class="btn cut">`, plus one variant and at most one size:

| Variant | Class | Use |
| --- | --- | --- |
| Primary | (none) | The one main action of a screen, in the bottom bar. `text` fill, `on-dark` label. |
| Accent | `pink` | The step that moves the bake forward once it is ready (“Preheat the oven · 50 min”). `brand` fill, `text` label. |
| Secondary | `soft` | A gentle alternative beside the primary (“Put the egg back”, “Close”). `brand-tint` fill. |
| Outline | `line` | A deliberate but unwelcome action (“Open the oven early”). |
| Text link | `.link` (no `.btn`) | A low-weight alternative under a card (“Pick another recipe”). `brand-strong`. |

Sizes: default `h-l` 52 with `headline` text and `cut-m`; `m` is `h-m` 40 with `callout`; `small` is `h-s` 32 with `subhead` and `cut-s`, for inline tools.

**Rules.**
- One primary or accent button per screen. In a bottom bar the primary stretches; a secondary sits at its content width beside it.
- Disabled uses the `disabled` attribute (or `aria-disabled="true"` when it must stay focusable). It turns `sunken` with a `text-3` label; say what is missing in the label (“Crack an egg”) rather than greying a generic one.
- A hold-to-act button (pouring flour) shows its progress as a 4px `highlight` line along the bottom edge.
- Never round the corners or add a shadow.
