# WalterBinger.com — Production Homepage

This directory contains the approved professional front door for WalterBinger.com and is the artifact published by GitHub Pages.

## Production boundary

- `homepage/index.html` is the approved professional homepage and remains the primary portfolio entrance.
- The Living Map is built beneath it at `/universe/`.
- The Vite source for the Living Map remains in the repository root under `src/`; the production build writes into `homepage/universe/`.
- The homepage must not be replaced by the experimental application.

## Key files

- `index.html` — professional homepage
- `styles.css` — homepage styles
- `script.js` — small homepage interactions
- `Walter-Binger-CV-2026.pdf` — public full CV
- `Walter-Binger-Operations-Resume.pdf` — operations résumé
- `Walter-Binger-Implementation-Resume.pdf` — implementation résumé
- `Walter-Binger-CustomerSuccess-Resume.pdf` — client-delivery résumé
- `walter-hero.jpg` / `walter-portrait.jpg` — public portrait assets
- `robots.txt`, `sitemap.xml`, `CNAME` — discovery and custom-domain configuration

## Publishing

A push to `main` runs `.github/workflows/deploy.yml`, which installs dependencies, builds the Living Map into `homepage/universe/`, and publishes the complete `homepage/` artifact to GitHub Pages.

The canonical live site is https://walterbinger.com.
