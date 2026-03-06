# redmond_university

Static training modules and mini-games for Canvas embeds.

## Project structure

```text
.
├── apps/
│   ├── badges/
│   │   ├── animated/
│   │   └── builder/
│   ├── cards/
│   ├── prelogin/
│   └── video/
├── assets/
│   ├── imgs/
│   └── media/
├── components/
│   └── cta/
├── games/
│   ├── farm/
│   ├── jeopardy/
│   └── smoothie/
└── index.html
```

## Legacy routes

The old folders/files are kept as lightweight redirect pages so existing links still work:

- `clickable-cards/*`
- `farm/`, `jeopardy/`, `smoothie/`
- `prelogin/`, `video/`, `CTAcomponent/`
- `animated-badge.html`, `badge.html`, `pixel-module.html` (deprecated, redirects to home)

## Local preview

Open `index.html` in a browser, or run a local static server.

## GitHub Pages

1. Push to `main`.
2. In `Settings > Pages`, set:
- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/ (root)`
3. Site URL for project pages:
- `https://<username>.github.io/redmond_university/`

## Notes

- Prefer relative URLs (`./` or `../`) to keep compatibility with project pages base paths.
- Canvas embeds can use direct links under `apps/` and `games/`.
- Several pages now accept `?lang=en` or `?lang=es` (hub, prelogin, video, farm game, jeopardy).
