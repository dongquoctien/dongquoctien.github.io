# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal site for Đồng Quốc Tiến (Tien Dong) at https://dongquoctien.github.io — a developer portfolio + technical blog. Built with **Astro 5 + MDX + Tailwind CSS**, deployed to GitHub Pages via Actions. Static output, no backend.

## Commands

- `npm run dev` — local dev server at http://localhost:4321
- `npm run build` — type-checks (`astro check`) then builds to `dist/`
- `npm run preview` — serve the built `dist/` locally

There is no test suite. Type errors and broken content schemas are caught by `astro check` during build.

## Architecture

**Content lives in `src/content/`** as Markdown:
- `blog/*.md` — long-form posts.
- `notes/*.md` — short-form snippets / cheat-sheets.

Both collections are validated by `src/content/config.ts`. Frontmatter must satisfy that schema or the build fails. Drafts (`draft: true`) are filtered out everywhere posts are listed and from `getStaticPaths` — they won't render to HTML.

**Projects are TypeScript data**, not content collection — see `src/data/projects.ts`. Each project has a `tier` (`featured | mcp | tools | experiments`) used for grouping on `/projects` and to pick what shows on the home page. Add new projects there, not as Markdown.

**Site-wide constants** (name, URLs, nav, contact) live in `src/consts.ts`. Header `NAV` is the single source of truth for the top-nav.

**Layouts:**
- `BaseLayout.astro` — wraps every page. Injects SEO, theme bootstrap script (runs before paint to avoid FOUC), Header, Footer. Pages opt into a wider container with `wide` prop.
- `PostLayout.astro` — used by both `/blog/[slug]` and `/notes/[slug]`. Sets `article` SEO + tags.

**Theming** uses CSS variables in `src/styles/global.css` keyed off `html.dark`. Tailwind reads them via `rgb(var(--color-*) / <alpha-value>)`. The toggle stores the choice in `localStorage['theme']`; the inline script in `BaseLayout` applies it before the page paints.

**SEO:** `SEO.astro` emits OG/Twitter/canonical/JSON-LD for every page. `@astrojs/sitemap` produces `sitemap-index.xml` at build. RSS lives at `/rss.xml` (see `src/pages/rss.xml.ts`).

## Adding content

**A blog post:** create `src/content/blog/<slug>.md` with frontmatter:
```yaml
---
title: "..."
description: "..."
pubDate: 2026-05-10
tags: [mcp, ai]
draft: false
---
```

**A note:** same pattern under `src/content/notes/`. Notes use a leaner schema (no `description`).

**A project:** append to the `projects` array in `src/data/projects.ts`. Set `tier` correctly — featured projects surface on the home page (first 4).

## Deploy

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds and publishes via `actions/deploy-pages@v4`. Repo Settings → Pages must have **Source: GitHub Actions** (not legacy branch deploy).

The site is a *user* page (`dongquoctien.github.io`), so `astro.config.mjs` sets `site` only, no `base`. If this is ever moved to a project page, add `base: '/<repo>'` and update absolute asset references.

## Conventions

- Path alias `@/*` → `src/*` (configured in `tsconfig.json`).
- Tailwind config is ESM (`tailwind.config.mjs`); use `import` not `require`.
- Use the semantic colors (`bg`, `fg`, `muted`, `accent`, `border`, `card`) instead of raw Tailwind palette names — they switch automatically with theme.
- `.container-prose` (narrow, ~2xl) for reading pages, `.container-wide` for grids/landing.
- Keep `NAV` and the schema in `src/content/config.ts` in sync when adding new content types.
