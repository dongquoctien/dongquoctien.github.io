---
title: "What I got wrong in my first three MCP servers"
description: "Six MCP servers later, I look back at the design mistakes I made early on — REST-mirroring, bad tool descriptions, context bombs — and what I do differently now."
pubDate: 2026-05-12
tags: [mcp, ai, retrospective]
---

I've shipped six Model Context Protocol servers across very different surfaces — MySQL,
Microsoft 365, Teams, Bitbucket, Grafana, Redmine. The first three were learning
experiments. The next three are what I'd actually want to use.

This is a list of the mistakes I made early on, what fixing them looked like, and what I'd
build differently now that the 2026 spec is moving toward `.well-known` discovery and
OAuth 2.1.

## Mistake 1 — Mirroring the REST surface 1:1

My first instinct on the Bitbucket server was to expose every endpoint the Cloud API has.
You ended up with `getPullRequest`, `getPullRequestComments`, `getPullRequestActivity`,
`getPullRequestStatuses`, `addPullRequestComment`, `addPendingPullRequestComment`,
`publishPendingComments`, `resolveComment`, `reopenComment`, `getPullRequestTask`… you get
the idea. Thirty-something tools. The model needed to chain four of them just to leave a
useful comment, and it picked the wrong one half the time.

The lesson: **a poor MCP server is a 1:1 wrapper around a REST API**. A good one exposes
*workflows*, not endpoints. The Bitbucket server now has a single `review_pull_request`
tool that takes a PR ref and an optional intent ("approve", "request changes", "comment")
and does the right sequence of underlying calls. The thirty REST verbs still exist
underneath, but the model only sees five top-level workflow tools.

You can always add granular tools later if a workflow tool isn't expressive enough. You
cannot subtract tools without breaking every prompt that learned to call them.

## Mistake 2 — Treating tool descriptions as docs

Tool descriptions are not documentation. They are prompts. The model reads them at
selection time and decides which tool to call based on them. I was writing things like:

> `getPullRequest` — Returns a pull request by ID.

That's true and useless. The model can't tell `getPullRequest` from `getPullRequestActivity`
from `getPullRequestComments` because all three "return things by ID."

After I rewrote the descriptions to be task-oriented — *"Use this when the user asks about
the state, title, or branches of a specific PR. Returns metadata only, not comments or
diff."* — tool-selection accuracy roughly doubled in my own testing. I didn't measure it
formally, but the difference between "the model reliably picks the right tool" and "the
model coin-flips between three plausible options" is something you feel within minutes.

## Mistake 3 — The context bomb

My MySQL server's first version had a `query` tool that returned every row of the result
set. Then a junior teammate ran `SELECT * FROM bookings` and the model burned a million
tokens summarizing 80,000 rows it didn't ask for.

The fix is a hard rule I now apply to every server: **no single tool response exceeds
~25k tokens**. By default, results are paginated, summarized, or truncated, and the
response includes a hint about how to get more. The MySQL `query` tool returns the row
count and a sample (head + tail) by default; you have to ask for the full set explicitly
with a `limit` argument and an opt-in flag.

The Grafana server had the same problem with metric series — a 7-day high-resolution
query is megabytes of JSON. Now it returns aggregated buckets unless you ask for raw.

If the model has to summarize the response, you've lost the round trip anyway. Truncate
on the server side where you control the shape.

## Mistake 4 — Hand-rolled auth that won't survive 2026

My early servers all assumed local-only stdio transport: trust comes from the fact that
you launched the binary. The Bitbucket and MS-365 servers were the first time I had to
think about real auth, and I did it the obvious wrong way — long-lived access tokens
pasted into config files.

The 2026 MCP roadmap pushes everyone toward OAuth 2.1 with `.well-known` discovery, and
that's what the next versions of my servers will use. Hand-rolled token storage is
already a smell in code review at work; in a year it'll be deprecated.

If you're starting an MCP server today, skip the "config file with a PAT" stage. Use the
authentication primitives the spec gives you, even if it's more setup work upfront.

## What I'd tell myself a year ago

- Start with three to five workflow tools. Add granular tools only when a real prompt
  fails because of the workflow shape.
- Write tool descriptions to a model that has read your description and nothing else.
  *Why would I pick this tool over its neighbor?*
- Cap response size at the server. If you can't summarize on the server, you'll
  definitely fail to summarize on the client.
- Build for streamable-http and OAuth 2.1 from day one. Stdio + PATs is fine for the
  prototype; it isn't where the ecosystem is going.

The good news: most of these mistakes are cheap to fix. The Bitbucket server's collapse
from 30 tools to 5 took an afternoon. The MySQL server's "no context bombs" rule took
a single PR. The earlier you do them, the less prompt rot you accumulate.
