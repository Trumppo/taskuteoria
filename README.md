# TaskuTeoria

Staattinen, mobiilioptimoitu musiikinteorian harjoittelusovellus.

## Ominaisuudet
- Nuottien tunnistus (välitön palaute)
- Rytmiharjoitukset:
  - tap-ajastus (metronomi + ms-tarkkuus)
  - drag & drop -tahtitehtävä
- Flashcards + SRS
- Kuuntelutehtävät (intervalli/sointu)
- Mini-opetus + 3 pikakysymystä
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
