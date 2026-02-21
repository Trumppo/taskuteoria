# TaskuTeoria - Toteutussuunnitelma

## 1. Tavoite
Rakennetaan staattinen, mobiilioptimoitu PWA-verkkosovellus musiikinteorian perusteiden harjoitteluun ilman backendia ja ilman kirjautumista.

## 2. Tuote- ja tekniset periaatteet
- `Mobile-first`: käyttö sujuu yhdellä kädellä, lyhyet 5-8 min sessiot.
- `Static-only`: ei palvelinlogiikkaa, data buildiin JSON/Markdownina.
- `Local-first`: kaikki käyttäjädata localStorageen.
- `Audio ilman tiedostoja`: Web Audio API (OscillatorNode + GainNode + envelope).
- `Offline`: service worker + manifest.

## 3. Scope
### MVP (v1)
- Bottom navigation: Harjoittele, Polku, Kortit, Kuuntele, Kirjasto.
- Nuottien tunnistus (diskantti + basso, perusalue).
- Rytmin perusteet (nuottiarvot, 4/4 + 3/4 + 6/8 alkeet).
- Flashcards + yksinkertainen SRS.
- Intervalli- ja sointikuuntelun perusteet.
- Mini-opetus (lyhyt teoria + 3 harjoitusta).
- Päiväputki ja päivätavoite.
- Offline-tuki ja asennettava PWA.

### V1.1 / V2 (jatko)
- Drag & drop -tehtävät laajasti.
- Heikkojen osa-alueiden painotus algoritmisemmin.
- Saavutusmerkit ja pidempi oppimispolkuanalytiikka.

## 4. Arkkitehtuuri
- Framework: Astro (SSG).
- UI-komponentit: valitaan yksi (`React` tai `Svelte`) ja pidetään yhtenäisenä.
- Data:
  - `src/content/decks/*.json|md`
  - `src/content/path/*.json`
  - `src/content/library/*.md`
- Logiikka:
  - `src/lib/audio/*`
  - `src/lib/srs.ts`
  - `src/lib/progress.ts`
  - `src/lib/metrics.ts`

## 5. Toteutusvaiheet
## Vaihe 0 - Projektin kovennus
- Siivotaan scaffold.
- Lisätään lint/format/typecheck.
- Määritetään peruskomponentit, teema, typografia, a11y-periaatteet.

## Vaihe 1 - Perusrakenne
- Bottom nav + sivupohjat.
- Etusivu: "jatka harjoittelua", päivän tavoite, streak.
- Asetukset: äänenvoimakkuus, metronomi-bpm, reset progress.

## Vaihe 2 - Oppimissisällöt
- Deckit: nuotit, rytmi, intervallit, soinnut.
- Kirjaston teoriakortit (30-90s).
- 14 päivän oppimispolku datana.

## Vaihe 3 - Harjoitusmoottorit
- Nuottitunnistus: kysymys -> valinta -> välitön palaute.
- Rytmi: tap input + ajastusikkuna.
- Kortit: tiesin/en tiennyt + SRS scheduling.
- Kuuntelu: note/interval/chord playback + vastaus.

## Vaihe 4 - Audio
- `playNote`, `playInterval`, `playChord`, `playMetronome`.
- Envelope + master gain + polyfoniarajat.
- Mobiilisuorituskyvyn optimointi (taustatab, lock screen, CPU).

## Vaihe 5 - PWA + julkaisu
- SW cache-strategia staattisille asseteille.
- Offline fallback.
- Asennettavuuden validointi (manifest, icons, start_url, display).
- Deploy GitHub Pages / Netlify / Cloudflare Pages.

## 6. Hyväksymiskriteerit (MVP)
- Sovellus toimii puhelimella ilman zoomausta vaakasuuntaan.
- Harjoitussessio onnistuu alusta loppuun 5-8 minuutissa.
- Audio käynnistyy käyttäjäinteraktion jälkeen ilman virheitä.
- Edistyminen ja streak säilyvät sivun uudelleenlatauksen yli.
- Sovellus toimii myös ilman verkkoyhteyttä ensimmäisen latauksen jälkeen.

## 7. Testaus
- Unit:
  - SRS interval-laskenta
  - progress/metrics tallennus ja palautus
  - perusaudio-utilit (mockattu AudioContext)
- E2E (mobiili viewport):
  - etusivu -> harjoitus -> palaute -> tulos -> tallennus
  - offline-käynnistys
- Manuaalinen:
  - Android Chrome + iOS Safari
  - matala- ja keskitason laitteet

## 8. Mittarit (local only)
- oikea-% aiheittain
- harjoitusaika
- streak
- heikoimmat osa-alueet
- viimeisin harjoittelupäivä

## 9. Riskit ja mitigointi
- Web Audio mobiilirajoitteet -> aktivoidaan aina user gesturellä.
- localStorage-kvotan rajat -> pidetään data tiiviinä.
- Offline cache stale -> versionointi ja cache-bust build-hashilla.
- Liian laaja sisältö alussa -> rajataan MVP-deckit minimiin.

## 10. Tarkentavat kysymykset
1. Valitaanko komponenttikerrokseen `React` vai `Svelte`?
2. MVP:n nuottialue: vain C3-C5 vai laajempi heti alussa?
3. Haluatko MVP:hen sekä diskantin että basson heti, vai vaiheistus?
4. Rytmitehtävien arvostelu: kuinka tiukka ajoitusikkuna (ms)?
5. Intervallit MVP: melodinen vain, vai melodinen + harmoninen?
6. Soinnut MVP: vain duuri/molli-triadit vai myös vähennetty/ylennetty?
7. Haluatko suomalaiset nuottinimet (`H/B`) vai kansainväliset (`B/Bb`) vai molemmat valittavaksi?
8. PWA-julkaisu: ensisijainen alusta (GitHub Pages, Netlify vai Cloudflare Pages)?
9. Teoriakirjaston kieli: täysin suomi vai kaksikielinen (FI/EN)?
10. Tarvitaanko saavutettavuustavoite WCAG 2.1 AA MVP-tasolle?

## 11. Ensimmäinen toteutuserä (suositus)
- Päivät 1-2: perusrakenne + nav + etusivu + asetukset.
- Päivät 3-4: nuottitunnistus + perusdeckit.
- Päivät 5-6: flashcards + SRS + progress.
- Päivät 7-8: kuuntelu + audio API + metronomi.
- Päivä 9: PWA + offline.
- Päivä 10: testaus, bugikorjaukset, julkaisu.
