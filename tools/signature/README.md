# signature

Scripts that generate the handwritten signature paths in `src/assets/signature.ts` from the [Sacramento](https://fonts.google.com/specimen/Sacramento) font (SIL OFL). Only needed when changing the name or the stroke order.

## Requirements

```bash
pip install fonttools brotli scikit-image scipy numpy pillow
```

Run `pnpm install` in the repository root first (rendering uses the project's Playwright), and install `@fontsource/sacramento` temporarily for the font file.

## Steps

```bash
python extract.py path/to/sacramento-latin-400-normal.woff
node render.mjs alue.svg alue.png 2000
python skeleton.py
python route.py
python build.py
```

The stroke order is defined in `route.py` as waypoints on `alue.png`.
