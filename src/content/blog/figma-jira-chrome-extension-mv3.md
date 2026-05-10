---
title: "Bridging Figma and Jira from a Chrome extension: what Manifest V3 makes hard"
description: "QA Annotator picks DOM elements, resolves the nearest Figma frame, and files Jira issues — all from a Chrome extension. The interesting parts are the ones MV3 fights you on."
pubDate: 2026-05-12
tags: [chrome-extension, manifest-v3, figma, jira]
---

I built [QA Annotator](https://github.com/dongquoctien/qa-annotator-extension) so QA
engineers on my team could file good bug reports without flipping between three tools.
Pick a DOM element on the page under test, resolve the nearest Figma frame for it, drop
a comment, file a Jira issue with all the context attached. One extension, one flow.

The product idea is straightforward. The implementation, as anyone shipping Manifest V3
in 2026 knows, is where it gets interesting. Here are the four MV3-specific decisions
that took the most thought.

## The picker UI lives in the Side Panel, not a popup

The first version used a popup. The QA flow is "click an element on the page → annotate →
file." Popups close the moment focus leaves them, which is the moment the user clicks the
page. Mid-annotation state evaporated every single time.

`chrome.sidePanel` exists exactly for this case. It survives clicks on the host page, it
survives tab switches if you ask it to, and the user can keep both the page and the
annotation form visible at the same time. The migration from popup to side panel was
maybe a hundred lines of code and removed a class of bugs I'd been working around with
hacks.

If you're building anything where the user needs to interact with the host page and your
extension UI in the same task, default to the side panel. Popups are for one-shot
actions ("translate this page", "save bookmark") and not much else.

## Service-worker amnesia is not optional

MV3's background script is a service worker that gets killed after roughly thirty seconds
of idle. Every closure variable, every in-memory cache, every "I'm halfway through
talking to Figma" promise — gone. There is no reliable suspend event you can listen to
and flush state from.

The pattern that survives this:

1. Treat your service worker as stateless.
2. Persist anything you care about to `chrome.storage.session` *on every state change*,
   not on suspend.
3. On wake, rehydrate from storage before doing anything else.

QA Annotator's "in-flight Jira draft" is a single object in `chrome.storage.session`
that gets rewritten every time the user types into the form. The first time I shipped
this I did it the obvious way — keep the draft in memory, save on form submit — and
half the test reports vanished because the SW died between keystrokes.

There is a `keepAlive` trick using a long-lived port that holds the worker open. Chrome
is increasingly hostile to it and you should treat it as a workaround, not a strategy.

## Figma's 2026 token changes break the "paste a PAT" pattern

Figma's personal access tokens now expire after 90 days, and the API uses granular
scopes (`file_content:read`, `file_metadata:read`, etc.) instead of one omnibus
permission. The old "paste a token in the options page once and forget about it" UX is
broken in two distinct ways: the token will expire, and the scope list will probably not
match what your call actually needs.

QA Annotator handles this by:

- Catching `403` responses with the `forbidden_scope` body shape, mapping the missing
  scope to a human-readable reason ("This token can't read file metadata. Regenerate
  with `file_metadata:read`."), and showing a one-click "regenerate token" action.
- Tracking token age client-side and warning at day 80, not day 91.
- Keeping the token in `chrome.storage.local` (not `sync`) so it doesn't leak across
  the user's other Chrome profiles.

The 90-day window felt annoying when Figma announced it. After actually shipping, it
forced me to design the renewal flow properly, which I should have done anyway.

## Host permissions: ask once, ask big

Jira tenants live at `*.atlassian.net`. You can ask for `optional_host_permissions` and
prompt the user the first time they actually file an issue, which is the polite default.
For QA Annotator I ask for `*://*.atlassian.net/*` at install time instead.

The trade-off is real. Asking for broad permissions upfront is a higher install
friction, and Chrome shows a scary dialog. But the alternative is a flow where the very
first thing the user tries to do — file a Jira issue — interrupts itself with a permission
prompt that, in my testing, half of users dismissed because they didn't understand what
it was asking. After they dismissed it, the extension didn't work, and they uninstalled.

Pick your poison: friction at install or friction at first use. For a tool QA people are
told to install by their team lead, install-time is the better place to put it.

## The shape of an MV3 codebase that ages well

After two years of maintaining QA Annotator, my rule is: **the extension is a thin
controller around `chrome.storage` and the host APIs**. No global state, no in-memory
caches, no "I'll just keep this object around until next time." The service worker
restarts. The side panel reopens. The tab navigates. Treat each one as a fresh start
that hydrates from storage, and the surprises stop.

It's not the JS you'd write outside of an extension. It's not even particularly elegant.
But it's the shape MV3 actually rewards, and once you stop fighting it, the platform
makes a lot more sense.
