Slanted segments that show how far through a sequence you are: the six steps of a bake flow, the laps of whisking, the phases of baking.

**Markup.** `<div class="steps">` with one `<i>` per step; finished and current steps get `on`. Labelled phases: `<div class="phases">` with `<div class="on now"><i></i>Rise</div>` per phase; `on` for reached, `now` for the current one.

**Rules.**
- Filled segments are `brand`, empty ones `line`. Each segment's ends are slanted 3–4px, matching the chamfer language.
- In a flow, the six-segment bar sits directly under the nav bar, and the nav bar also says “3/6” in `footnote`.
- Use up to six segments. More than that is a progress bar, not steps.
