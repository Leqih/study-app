A capsule button that names the action and, when it helps, its outcome after a middle dot. Primary actions are black.

**Markup.** `<button class="btn rounded">`, plus one variant and at most one size:

| Variant | Class | Use |
| --- | --- | --- |
| Primary | (none) | The one main action of a screen. `text` (black) fill, `on-dark` label. |
| Hero | `go` | The main action of a hero card: a 60-tall black capsule with a 48 round `brand` arrow on the right (`<i>` holding the arrow). |
| Accent | `pink` | Rare; a step that should stand out without being primary. `brand` fill, black label. |
| Secondary | `soft` | A gentle alternative beside the primary ("Pause · 2 min", "Decorate"). `sunken` fill. `soft small` is the pink row action ("Join"). |
| Outline | `line` | A deliberate but unwelcome action ("End early", "Prep first"). Glass fill with a `line-strong` ring. |
| Text link | `.link` (no `.btn`) | A low-weight alternative under a card ("Choose another recipe"). `text-2`, bold. |

Sizes: default `h-l` 56 with `headline`; `m` is `h-m` 42; `small` is `h-s` 34 for row actions and inline tools.

**Rules.**
- One primary or hero button per screen. In a bottom bar the primary stretches; a secondary sits at its content width beside it.
- Never white text on pink. Pink is for the arrow and for selection.
- Disabled turns `sunken` with a `text-3` label; say what's missing in the label ("Crack an egg").
- A hold-to-act button (pouring flour) shows its progress as a 4px `brand` line along the bottom edge.
- Presses scale to .96 with the spring curve.
