Two kinds of passing feedback: a banner for something that happened outside you (a friend, the oven), and a toast confirming what you just did.

**Markup.** Banner: `<div class="banner rounded">` with a 40px leading tile, then `<p class="b-app">SWEET STUDY · now</p>`, a `b-t` title and a `b-b` line. Toast: `<div class="toast rounded"><b>Lead</b><span>detail</span></div>`, a black capsule whose lead is pink.

**Rules.**
- Banners float in from under the status bar with `shadow-float`, push the screen down while shown, and leave after about 4 s or on tap; one at a time.
- Toasts confirm a result in a few words on one line.
- Neither carries a decision. Anything that needs an answer is an alert with two capsule buttons.
