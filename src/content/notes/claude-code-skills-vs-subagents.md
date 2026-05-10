---
title: "Claude Code: skills vs subagents, a 30-second decision rule"
pubDate: 2026-05-12
tags: [claude-code, devx]
---

The Claude Code docs split *skills* and *subagents* in a way that confuses people on
first read. Here's the rule I use:

> **If I want the output in front of me, it's a skill.**
> **If I want a summary back from a side process, it's a subagent.**

Skills are slash-commands you invoke with `/<name>`. They run inline. Their output
becomes part of your conversation. Good for: scaffolding, formatting commits, generating
boilerplate, anything where you want to see and edit the result.

Subagents run in a separate context. Their full transcript stays in their own context;
you get a summary back. Good for: research that produces a lot of intermediate output
("audit the codebase for X"), parallel work, anything where the verbosity would pollute
your main conversation.

**Skill example** — a commit-message helper at `~/.claude/skills/commit-msg/SKILL.md`:

```markdown
---
description: Draft a Conventional Commit message from staged changes
---

Run `git diff --cached`. Output a single Conventional Commit message based on
the diff. Don't include a body unless the change is non-obvious.
```

Invoke with `/commit-msg`. Output appears in your chat; you tweak it.

**Subagent example** — a Jira sync agent invoked from a slash command:

```markdown
---
description: Sync local QA notes to Jira
---

Use the Agent tool with subagent_type=general-purpose to:
- Read docs/qa/notes.md
- For each item, find or create the matching Jira issue via the mcp-atlassian server
- Return a one-paragraph summary of what was created vs updated
```

The Jira-search noise stays in the subagent. You get the summary.

**Cost note:** the 2026 Anthropic guidance says subagents can use ~7× the tokens of an
inline call because of context duplication. Don't reach for one when a skill will do.

Frontmatter cheat-sheet for `~/.claude/skills/<name>/SKILL.md`:

```yaml
---
description: One-line, written for the model. This is what the model reads to decide
             whether to invoke your skill.
---
```

The `description` is a prompt. Write it the way you'd write a tool description: tell
the model when to use this and when not to.
