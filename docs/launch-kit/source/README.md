# Launch graphics source

`graphic.html` renders the three Renor launch graphics in `public/launch-kit/`
(`?kind=og` 1200×630, `?kind=square` 1080×1080, `?kind=story` 1080×1920).
`render.mjs` screenshots them with Playwright and an existing Chromium (it never downloads one).

Next to `graphic.html` it expects: `orb.webp` (from `public/assets/renor/`), `code.png` and
`builder.png` (dark-theme captures of the Renor app, see `public/launch-kit/screens/`), and
`fonts/inter-var.woff2` (Inter, SIL Open Font License).

    node render.mjs <path to a checkout with playwright-core installed> <output dir>
