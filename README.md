# WalterBinger.com

<img src="./walter-hero.jpg" alt="Walter Binger" width="190" align="right">

**Professional portfolio and explorable map of projects, work, writing, and ideas.**

**Live site:** https://walterbinger.com

WalterBinger.com started as a conventional professional site and evolved into a more ambitious question: **can a portfolio show how someone thinks, connects systems, and works across disciplines—not just list where they have worked?**

The public homepage remains the professional front door. Beneath it, the Living Map turns projects, places, writing, tools, and source material into an explorable field rather than a stack of portfolio cards.

## What this project demonstrates

- **Systems thinking:** translating a large body of work into a navigable information architecture.
- **Product and operations judgment:** defining states, rules, handoffs, constraints, and acceptance criteria instead of treating the site as decoration.
- **AI-assisted building:** using Codex, Claude, ChatGPT, and other tools as implementation collaborators while keeping human direction, source control, review, and verification explicit.
- **Iterative delivery:** preserving a stable professional homepage while developing more experimental interaction underneath it.
- **Quality discipline:** automated domain/state tests, Playwright end-to-end coverage, production builds, and GitHub Pages deployment.

This repository is not intended to present me as a traditional software engineer. It is evidence of how I use technology, AI, documentation, testing, and structured iteration to turn ambiguous ideas into working systems.

## Featured field tools

**[PREP / PERP](https://walterbinger.com/universe/#/world/field-tools)** are Alpha-stage, human-centered systems tools embedded in the Living Map. PREP captures recurring field signals and small repair experiments; PERP examines a recurring breakdown through Pressure, Evidence, Repair, and Proof. Both are explicitly presented as field-testing heuristics rather than validated diagnostic instruments.

## Current stack

- React 19 + TypeScript
- Vite
- Three.js + d3-force-3d
- Zustand + Zod
- Motion
- Vitest
- Playwright
- GitHub Actions + GitHub Pages
- Custom domain: `walterbinger.com`

## Project structure

- `src/` — Living Map application, domain logic, state, components, and data
- `homepage/` — professional front-door source
- `content/` — authored portfolio / project material
- `docs/` — historical construction notes, verification records, and design context
- `tests/` — end-to-end browser verification
- `.github/workflows/` — automated Pages deployment

The architecture deliberately separates the **professional entrance** from the more experimental **Living Map**, so the portfolio can stay useful while the deeper system continues to evolve.

## Verification

```bash
pnpm install
pnpm run check
pnpm run test:e2e
```

`pnpm run check` runs the project tests and production build. The Playwright suite covers the professional doorway, PREP resources, lens behavior, world travel, Gratitude convergence, and the Snow Globe on desktop and mobile.

## Local development

```bash
pnpm install
pnpm run dev
```

Default local URL: `http://127.0.0.1:5173/`

## Publishing

GitHub Pages publishes the complete `homepage/` artifact from `main` through `.github/workflows/deploy.yml`. The approved professional homepage stays at the root, while the Vite build writes the Living Map into `homepage/universe/`; the published artifact also carries the custom-domain declaration for `walterbinger.com`.

Historical construction and design records remain in Git history and under `docs/`; they are supporting context, not the recruiter-facing entry point.

---

### About me

I am an operations and implementation leader whose career has crossed healthcare, hospitality, entrepreneurship, training, client delivery, and increasingly AI-enabled systems work. The common thread is turning messy human processes into structures people can actually use.

**Portfolio:** https://walterbinger.com  
**LinkedIn:** https://www.linkedin.com/in/walter-binger-032bb423b/
