---
title: "Surviving the MV3 service-worker 30-second timeout"
pubDate: 2026-05-12
tags: [chrome-extension, manifest-v3]
---

Manifest V3's background "service worker" gets killed after roughly 30 seconds of
idle. There's no reliable suspend event. Closures, in-memory caches, in-flight promises
— gone.

Three patterns that survive this.

**1 — `chrome.alarms` instead of `setInterval`:**

```js
// Won't survive — setInterval dies with the worker
setInterval(syncJiraDrafts, 60_000);

// Will survive — alarms wake the worker
chrome.alarms.create('sync-drafts', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'sync-drafts') syncJiraDrafts();
});
```

**2 — Persist on every state change, not on suspend:**

```js
async function setDraft(draft) {
  await chrome.storage.session.set({ draft });
}

async function getDraft() {
  const { draft } = await chrome.storage.session.get('draft');
  return draft ?? { title: '', body: '' };
}
```

Don't keep the draft as a module-scope variable. Treat the worker as stateless and
hydrate from `chrome.storage.session` on every wake. `session` (not `local`) clears on
browser restart, which is usually what you want for in-flight UI state.

**3 — Long-lived port keepalive (use sparingly):**

```js
// Background
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'keepalive') return;
  port.onDisconnect.addListener(() => { /* cleanup */ });
});

// Side panel / content script
const port = chrome.runtime.connect({ name: 'keepalive' });
```

This holds the worker open while the port is connected. Use it only when you genuinely
need a continuous connection (a streaming response, a websocket bridge). Chrome has
been progressively hostile to this pattern; assume it'll break in some future Chrome
release and budget for the cleanup.

The mental model that makes MV3 stop hurting: **the worker is a stateless function
that mutates `chrome.storage`**. Anything not in storage doesn't exist between
invocations.
