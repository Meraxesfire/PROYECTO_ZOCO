---
name: seo-check
description: SEO/meta-tags checklist for this Astro project. Use when creating or editing an Astro page, changing a layout head, or reviewing meta tags, canonical, Open Graph, robots.txt or sitemap.
---

# SEO check

Apply this checklist to every Astro page before considering it done.

## Required on every page

- `<title>` present, format: `ZOCO eyewear | <Page Title>`.
- Unique `<meta name="description">`, <= 160 chars, in Spanish, with the page's main keyword.
- Canonical link to the production URL (site is `https://www.zocoeyewear.com`).
- Open Graph + Twitter tags via `SeoHead.astro`.
- `lang="es"` on `<html>`.

## How to use SeoHead

- Pages using a layout: pass `description` (and optional `image`, `type`) to the layout.
- Standalone pages (own `<head>`): import `../components/SeoHead.astro` and render
  `<SeoHead title={...} description={...} />` inside `<head>`.
- Default `og:image` is `/logoHeaderLanding.png`; pass `image` only for a different one.

## Robots / sitemap

- `public/robots.txt` already references the sitemap; keep it in sync.
- New prerendered pages are picked up automatically by `@astrojs/sitemap`.
- Dynamic routes (`gafas/[slug]`) are NOT in the sitemap until they implement `getStaticPaths`.

## Guardrails

- Do not remove or alter the Cookiebot script.
- Do not change global SEO defaults without approval.
