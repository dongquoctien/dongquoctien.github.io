---
title: "Deploying an Astro site to GitHub Pages"
pubDate: 2026-05-10
tags: [astro, github-pages, ci]
---

The minimum viable workflow.

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push: { branches: [main] }
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: ./dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

Then in the repo: **Settings → Pages → Source: GitHub Actions**.

Two gotchas:

1. **`site` in `astro.config.mjs` must match the deployed URL** — otherwise `sitemap` and
   absolute links break.
2. **Project pages need a `base`.** If you deploy to `user.github.io/repo/` instead of the
   user-page domain, set `base: '/repo'` in the Astro config and prefix asset URLs accordingly.
