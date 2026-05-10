---
title: "Don't `console.log` in an MCP stdio server"
pubDate: 2026-05-12
tags: [mcp, debugging]
---

The single most common MCP foot-gun. On the default stdio transport, `stdout` *is* the
JSON-RPC channel. Any stray `console.log` corrupts the protocol and the client silently
disconnects.

```ts
// Broken — this writes to stdout, which is the protocol stream
console.log('loaded config', config);
```

What the Inspector shows you instead of the real error: `Unexpected token in JSON`.
You stare at your tool implementation for an hour.

The fix is a one-line wrapper. `stderr` is not the protocol stream; you can write
whatever you want there.

```ts
// Safe — stderr doesn't conflict with the protocol
const log = (...args: unknown[]) =>
  console.error('[my-server]', new Date().toISOString(), ...args);

log('loaded config', config);
```

For anything more than ad-hoc debugging, also tee to a file so you can tail it from a
second terminal:

```ts
import { appendFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const LOG_FILE = join(homedir(), '.cache', 'my-server', 'debug.log');

const log = (...args: unknown[]) => {
  const line = `${new Date().toISOString()} ${args.map(String).join(' ')}\n`;
  console.error(line.trimEnd());
  try { appendFileSync(LOG_FILE, line); } catch { /* dir may not exist */ }
};
```

Then:

```powershell
# Windows
Get-Content -Wait $env:USERPROFILE\.cache\my-server\debug.log
```

```bash
# macOS/Linux
tail -f ~/.cache/my-server/debug.log
```

This stops being an issue on `streamable-http` transport — the protocol no longer rides
on stdout. But stdio is still the default for local development, and the failure mode
is silent enough that you should just bake the wrapper in from day one.
