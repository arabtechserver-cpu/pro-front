# ATP brand assets — version 2

The supplied ATP monogram was refined with the built-in ImageGen tool. The interlocking A/T/P identity and emerald/lime palette were preserved. The central hardware chip was replaced with a software-code window; an open lock and restrained remote-connectivity arcs express the site's software and remote-service focus.

`atp-master-v2.png` is the transparent master. `mark-v2.webp` is the optimized website mark. `BrandLogo.tsx` pairs that mark with accessible Arabic or English text so the wordmark adapts to light/dark themes without rasterized site text.

Exports include light and dark Arabic/English wordmark PNGs, 1200×630 share cards, 48/180/192/512-pixel app icons, and a six-resolution ICO. The asset builder also refreshes the legacy public filenames so previously shared logo URLs remain compatible.

Rebuild deterministic format/size exports with:

```sh
node scripts/build-brand-assets.cjs
```

The script uses the installed Tahoma font when available for Arabic text, with a system-font fallback. No proprietary font files are redistributed.

SEO metadata and structured organization/store data use the versioned paths in `src/lib/brand.ts`. Existing page-specific article images remain in place; the new brand card is used as their fallback.

## ImageGen prompt

Use case: logo-brand / precise-object-edit. Edit the supplied ATP technology logo into a refined production-ready brand mark for Arab Tech Pro Server, specializing in PHONE SOFTWARE, ACTIVATION, REMOTE UNLOCKING and REMOTE TECH SUPPORT. Preserve the recognizable interlocking capital A, T and P monogram, its angular geometric silhouette, and the emerald/bright lime plus graphite and silver palette. Simplify the busy circuitry so it stays readable as a small website logo. Change the prominent central hardware microchip into a small clean software/code-window emblem with two simple angle-bracket strokes. Keep only a few deliberate circuit connectors. Remove the server rack and the two floating padlocks; instead subtly integrate a single open-lock detail into the P counter and two restrained wireless arcs near the upper-right to suggest secure remote connectivity. Keep letters A, T, P clear and large, with consistent substantial strokes. Use tasteful shallow metallic bevels, crisp edges and restrained highlights, no noisy textures, no scattered decorative lines, no excessive glow. The complete mark should occupy most of a square frame with modest even padding. Genuinely transparent background; eliminate the existing navy rectangular background. NO company-name text, NO slogan, no other letters beyond ATP, no presentation mockup. One standalone logo mark adaptable to both ivory light and deep emerald dark website backgrounds.
