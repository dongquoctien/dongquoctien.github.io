---
title: "Why I build MCP servers"
description: "Model Context Protocol turns LLMs from chat partners into capable agents. Here's what I've learned shipping a half-dozen of them."
pubDate: 2026-05-10
tags: [mcp, ai, tooling]
---

The Model Context Protocol (MCP) is, at its core, a small idea: a standard way for an LLM to
discover and call tools running outside it. Once that wiring is in place, "the model" stops
being a chat partner and starts being an agent that can do real work — read your database,
post a Bitbucket comment, query a Grafana dashboard, file a Redmine ticket.

Over the last year I've built or maintained MCP servers for:

- [MySQL](https://github.com/dongquoctien/mcp-server-mysql) — schema introspection plus safe
  read-only queries.
- [Microsoft 365 / Teams](https://github.com/dongquoctien/ms-365-mcp-server) — messaging,
  search, user management via Graph API.
- [Bitbucket](https://github.com/dongquoctien/bitbucket-mcp) — pull requests, comments,
  pipelines.
- [Grafana](https://github.com/dongquoctien/mcp-grafana), [Redmine](https://github.com/dongquoctien/mcp-server-redmine),
  and [Microsoft Planner](https://github.com/dongquoctien/mcp-planner-microsoft).

This post is a quick map of why I think MCP is worth your time as a developer, and three
lessons that took me longer to learn than they should have.

## Why MCP and not "just function calling"

Function calling, the OpenAI-style tool API, works great for one app talking to one model.
MCP's leverage is that the **server is reusable**. The same MySQL MCP server I run in Claude
Desktop is the one another teammate runs in their IDE plugin. Tools become composable across
clients, not locked to a single integration.

That sounds boring until you've built the same Jira-search tool four times for four different
agents.

## Lesson 1 — Treat the tool surface like an API contract

The temptation is to expose every endpoint your underlying system has. Don't. The tool list
is what the model sees, and a bloated surface confuses it. Pick the verbs that actually
matter for the workflows you care about, name them carefully, and write descriptions for
humans who happen to be language models.

If two tools sound similar, the model will pick the wrong one half the time.

## Lesson 2 — Read-only is a feature, not a limitation

For most of my servers the first version is read-only. It's enough to be useful (the model
can introspect, summarize, cross-reference) and it removes a whole class of "what if the model
hallucinates a destructive command" worries. When write operations come later, they should be
explicit, narrow, and ideally idempotent.

`mcp-server-mysql` is read-only on purpose. So is the Grafana one. The Bitbucket server has
write tools — but each one is a distinct verb (`approvePullRequest`, `mergePullRequest`) so
the model can't accidentally do something it didn't mean to.

## Lesson 3 — Logs are the debugger

When an agent calls your server and something goes wrong, you don't get a stack trace —
you get "the model said it couldn't find the issue." Structured logs of every tool call,
its arguments, and the response are what you'll actually use to debug. Build them in from
day one.

## Where to start

If you're curious, the [MCP spec](https://modelcontextprotocol.io) is short and worth a
read. Then pick a system you use every day — a database, a ticketing tool, a documentation
site — and build a server that exposes 3 verbs you'd actually use. You'll learn more in a
weekend than from a month of reading about agents.

I'll post deeper dives on individual servers as I have things worth saying.
