Rounded segments that show how far through a sequence you are: the steps of setup, the laps of whisking, the phases of baking.

**Markup.** `<div class="steps">` with one `<i>` per step; done and current steps get `on`. Labelled phases: `<div class="phases">` with `<div class="on now"><i></i>Rise</div>`.

**Rules.**
- Filled segments are black, empty ones `sunken`; 6px tall with a 3px radius.
- Use up to six segments. More than that is a progress bar.
