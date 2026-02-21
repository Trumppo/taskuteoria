# TaskuTeoria

Staattinen, mobiilioptimoitu musiikinteorian harjoittelusovellus.

## Ominaisuudet
- Nuottien tunnistus viivastolta (diskantti + basso, välitön palaute)
- Rytmiharjoitukset:
  - tap-ajastus (metronomi + ms-tarkkuus, 4/4 + 3/4 + 6/8)
  - drag & drop -tahtitehtävä (tahtilajituki)
- Sävellajit: C-duuri ja a-molli (pikakysymykset)
- Flashcards + SRS
- Kuuntelutehtävät (intervalli/sointu, melodinen/harmoninen intervallitila)
- Mini-opetus + 3 pikakysymystä
- Harjoitusvalitsin + Pikavisa (mix)
- Päiväputki, päivätavoite, minuuttikertymä
- Offline/PWA (service worker + fallback-sivu)

## Komennot
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run typecheck`
- `npm run test:run`
- `npm run verify:static`
- `npm run smoke:e2e`
- `npm run check`

## CI / Deploy
- CI: `.github/workflows/ci.yml`
- GitHub Pages deploy: `.github/workflows/deploy-pages.yml`
- Netlify-konfiguraatio: `netlify.toml`

## Rakenne
- `src/pages/` sivut
- `src/content/` harjoitus- ja teoriadata
- `src/lib/` sovelluslogiikka (audio, progress, srs, metrics)
- `public/` manifest, service worker, offline-fallback
