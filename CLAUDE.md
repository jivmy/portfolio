# Portfolio — Jimmy Shan

Personal portfolio site: Design Lead at Microsoft Copilot.

## Tech Stack

- Vanilla HTML/CSS/JavaScript — no framework, no build step
- Deployed on Vercel (serves static files directly from root)
- Font: Montserrat (Google Fonts, weights 300–700)

## Structure

```
index.html        — Home page (hero animation, project grid, contact)
project.html      — Project detail page (routed via ?p= query param)
images/           — Project screenshots (memory, search, research, video)
favicon.svg       — Site icon
og.png            — Open Graph image
vercel.json       — Vercel config (no build command, output dir is root)
```

## Development

- No build/install step. Open `index.html` in a browser or use a local server.
- No package.json, no npm dependencies, no tests, no linter.

## Conventions

- All CSS is embedded in `<style>` blocks within each HTML file (no external stylesheets).
- CSS custom properties for theming: `--black`, `--gray-*`, `--bg`, `--radius`, `--max-width`, `--ease-out-expo`.
- Responsive breakpoints: tablet at 900px, mobile at 580px.
- Fluid typography via `clamp()`.
- Respects `prefers-reduced-motion`.
- Semantic HTML (`<header>`, `<section>`, `<nav>`).
- No external JS libraries — uses Web Audio API for sound feedback.

## Key JS Features

1. **Hero text animation** — character-by-character reveal with blur/fade/perspective transforms.
2. **3D card tilt** — mouse-tracking perspective transforms with specular highlight on project thumbnails.
3. **Email copy** — copies `jimmy@jshan.ca` to clipboard, plays sine wave audio tone.

## Contact

- Email: jimmy@jshan.ca
