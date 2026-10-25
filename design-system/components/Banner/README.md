Two kinds of passing feedback: a banner for something that happened outside you (a friend, the oven), and a toast confirming what you just did.

**Markup.** Banner: `<div class="banner cut">` with a 40px leading tile, then `<p class="b-app">SWEET STUDY · NOW</p>`, a `b-t` title and a `b-b` line. Toast: `<div class="toast cut"><b>Lead</b><span>detail</span></div>`.

**Rules.**
- Banners drop in from under the status bar and leave after about 4 s or on tap; one at a time. Respect the notification switches in Settings.
- Toasts confirm a result in a few words; the lead in `highlight` is the number or outcome (“50 min · spot on”).
- Neither carries a decision. Anything that needs an answer is an alert with two buttons.
