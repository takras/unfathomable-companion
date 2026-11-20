# Unfathomable Companion

Companion app for *Unfathomable* (core + *From the Abyss*), built like BSG Companion:
React + Vite + TypeScript, client-side only, state in localStorage, English text in `src/i18n/en.json`.

## Sections

- **Setup** - expansion, No-Cultist variant and preludes; pick 3–6 characters. Shows the loyalty deck,
  starting Captain and Keeper of the Tome, and the starting resource dials. With preludes on: choose how many
  day/twilight/night cards to draw (presets for the book's balance options), leave cards out, and let the app
  draw them; Delegate Authority shifts the starting titles.
- **Roles** - Captain and Keeper of the Tome. Mark players in the Brig or revealed as traitors and the titles
  pass down the line of succession; manual "give" for card effects. Awakening phase, reveal steps, Brig rules.
- **Dice** - d8 attack table (target numbers, modifiers, outcomes) and the other die rolls.
- **Monsters** - tap the activation icon(s) on the drawn mythos card to see what each monster does, in order.
- **Rules** - the Rules Reference glossary and appendices I–III, with a contents drawer, search, rule-number deep
  links (`#/rules/rule-4.13`) and linked related topics. With From the Abyss on (Setup), the expansion's chapters
  follow the appendices and its changes to core rules are patched in place and marked (`src/content/rules-abyss.ts`).

## Website

Deployed to GitHub Pages at **https://unfathomable.takras.net/** by `.github/workflows/deploy-pages.yml` on every
push to `main` (or manually from the Actions tab). The privacy policy is `public/privacy.html` →
https://unfathomable.takras.net/privacy.html (also linked from About & licences).

One-time setup: repo **Settings → Pages → Source: GitHub Actions**, custom domain `unfathomable.takras.net`, then
**Enforce HTTPS** once the certificate is issued; DNS: `CNAME unfathomable → takras.github.io`.

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

## Native apps (Capacitor)

App id `net.takras.unfathomable`, name "Unfathomable Companion". The native projects live in `android/` and
`ios/` and are committed; the web build in `dist/` is copied into them by `cap sync`. Set up like BSG Companion.

- **Android** - build on GitHub Actions (**Build Android app**: debug APK, or a signed App Bundle and APK) or
  locally with `npm run android:debug` / `android:release` / `android:install`. Signing and secrets:
  [docs/android-build.md](docs/android-build.md).
- **iOS** - built on GitHub Actions (**Build iOS app**: unsigned check, simulator build, or a signed TestFlight
  upload), no Mac needed. Secrets and App Store Connect setup: [docs/ios-build.md](docs/ios-build.md).
- **Versions** - `package.json` version → Android `versionName` / iOS marketing version; build number
  major·10000 + minor·100 + patch. Bump with `npm version patch|minor|major` before a store upload. About shows
  the installed app's own version and build.
- **Icons and splash** - `npm run icons` draws the Hydra icon (`scripts/icon.mjs`) and generates every native
  size with `@capacitor/assets`.
- After changing web code, run `npm run cap:sync` (or the scripts above) before building natively.

## Store listings

`store/` holds everything for the two stores, as in BSG Companion:

- `store/app-store/listing.md` and `store/google-play/listing.md` - every listing field ready to paste (name,
  subtitle, descriptions, keywords, URLs, review notes, age rating, privacy and content answers).
  `node store/check-listing.mjs` checks them against the stores' character limits.
- Screenshots and graphics, made by `npm run store` (`scripts/store-graphics.mjs`): the production build is
  captured in headless Chrome with a sample game and framed with headlines. Google Play phone, 7" and 10" tablet
  screenshots plus the 1024×500 feature graphic; App Store iPhone 6.3" and iPad 13" screenshots (PNG and JPG) plus
  the three creative assets.
- `public/support.html` and `public/privacy.html` are the support and privacy URLs both stores ask for.

## Assets

`source/` holds the rulebook PDFs and the original card scans (not bundled). Generated from them:

- `npm run portraits` - `scripts/extract_portraits.py` cuts the arched portraits from the small character cards
  into `assets/portraits/*.png` (full size) and `src/assets/portraits/*.webp` (app copies).
- `npm run icons` - `scripts/extract_icons.py` turns activation and track icons into alpha masks in
  `src/assets/icons/`. The "choice of track" icon is drawn as SVG in `src/components/GameIcon.tsx`.
- `npm run preludes` - `scripts/extract_preludes.py` cuts the 15 prelude cards from their sheet into
  `assets/preludes/*.jpg` and `src/assets/preludes/*.webp`; their text is in `src/data/preludes.ts`.
- `npm run app-icon` - `scripts/icon.mjs` draws the app icon (Mother Hydra in the box's art-nouveau frame) into
  `assets/icon.svg` / `assets/icon-1024.png` and writes the favicon, touch and manifest icons to `public/`.
- `npm run rules` - `scripts/extract_rules.py` reads the Rules Reference PDF into `src/content/rules-reference.json`,
  using the book's fonts to tell headings, numbered rules, bullets, examples and inline icons apart (needs pdfplumber).

The image scripts need Python with Pillow, NumPy and SciPy.

## License and disclaimer

Unofficial fan project, **not affiliated with, endorsed or sponsored by Fantasy Flight Games**. The artwork,
icons and rules text in this app are not my own: they come from *Unfathomable* and *From the Abyss* and belong to
Fantasy Flight Games.

The app's own code and design are released under the [MIT License](LICENSE). The license does not cover the game
material; see [NOTICE.md](NOTICE.md) for what that includes and for third-party credits. The app shows the same
information under **About & licences** (footer link).
