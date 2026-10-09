# WalterBinger.com — Production Homepage

This directory contains the approved professional front door for WalterBinger.com and is the artifact published by GitHub Pages.

## Production boundary

- `homepage/index.html` is the approved Candidate D professional homepage and remains the primary portfolio entrance.
- The Living Universe is built beneath it at `/universe/`.
- The Vite source for the Living Universe remains in the repository root under `src/`; the production build writes into `homepage/universe/`.
- The homepage and Living Universe share one lens ontology: the professional résumé lenses resolve into combinations of the Universe's eight deeper lenses.

## Key files

- `index.html` — Candidate D professional homepage
- `prep-preview.png` / `perp-preview.png` — live-tool preview images used on the homepage
- `Walter-Binger-Broad-Resume.pdf` — Primary / Broad résumé
- `Walter-Binger-Operations-Resume.pdf` — Operations Leadership résumé
- `Walter-Binger-Implementation-Resume.pdf` — Implementation résumé
- `Walter-Binger-CustomerSuccess-Resume.pdf` — Customer Success résumé
- `Walter-Binger-Hospitality-Resume-2026.pdf` — Hospitality résumé
- `Walter-Binger-CV-2026.pdf` — public full CV
- `walter-hero.jpg` / `walter-portrait.jpg` — public portrait assets
- `robots.txt`, `sitemap.xml`, `CNAME` — discovery and custom-domain configuration

## Publishing

A push to `main` runs `.github/workflows/deploy.yml`, which installs dependencies, builds the Living Universe into `homepage/universe/`, and publishes the complete `homepage/` artifact to GitHub Pages.

The canonical live site is https://walterbinger.com.
