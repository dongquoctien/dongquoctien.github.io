---
title: "Astro `transition:persist` for a header that doesn't re-mount"
pubDate: 2026-05-12
tags: [astro, view-transitions]
---

Astro's view transitions are great, but by default every island re-hydrates on
navigation. For a header with a theme toggle, an audio player, or any island holding
state, that's a flash and a state reset.

`transition:persist` keeps the DOM node and its hydrated state across the navigation:

```astro
---
import ThemeToggle from './ThemeToggle.astro';
---

<header>
  <nav>...</nav>
  <ThemeToggle transition:persist />
</header>
```

The browser keeps the same `<theme-toggle>` element. The script inside doesn't re-run.
The toggle state survives.

**The one gotcha worth knowing:** scripts inside persisted islands don't re-run on
`astro:page-load`, so any side-effect that should fire per page (analytics, scroll
restore, ad refresh) needs to live *outside* the persisted boundary. Put it in your
top-level layout listening for `astro:page-load`:

```astro
<script>
  document.addEventListener('astro:page-load', () => {
    // analytics.track(window.location.pathname)
  });
</script>
```

For shared-element animation between a list page and a detail page (think: a project
card that morphs into the header of the detail view), pair `transition:name` on both
sides:

```astro
<!-- list -->
<a href={`/projects/${p.slug}/`}>
  <h3 transition:name={`title-${p.slug}`}>{p.title}</h3>
</a>

<!-- detail -->
<h1 transition:name={`title-${p.slug}`}>{project.title}</h1>
```

The browser interpolates between the two elements. It's the cheapest "this site feels
designed" upgrade you can make in Astro.
