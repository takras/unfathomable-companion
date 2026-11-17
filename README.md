# Unfathomable Companion

Companion app for *Unfathomable* (core + *From the Abyss*), built like BSG Companion:
React + Vite + TypeScript, client-side only, state in localStorage, English text in `src/i18n/en.json`.

## Sections

- **Setup** - expansion, No-Cultist variant and preludes; pick 3–6 characters. Shows the loyalty deck,
  starting Captain and Keeper of the Tome, and the starting resource dials.
- **Roles** - Captain and Keeper of the Tome. Mark players in the Brig or revealed as traitors and the titles
  pass down the line of succession; manual "give" for card effects. Awakening phase, reveal steps, Brig rules.
- **Dice** - d8 attack table (target numbers, modifiers, outcomes) and the other die rolls.
- **Monsters** - tap the activation icon(s) on the drawn mythos card to see what each monster does, in order.

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

## Assets

`source/` holds the rulebook PDFs and the original card scans (not bundled). Generated from them:

- `npm run portraits` - `scripts/extract_portraits.py` cuts the arched portraits from the small character cards
  into `assets/portraits/*.png` (full size) and `src/assets/portraits/*.webp` (app copies).
- `npm run icons` - `scripts/extract_icons.py` turns activation and track icons into alpha masks in
  `src/assets/icons/`. The "choice of track" icon is drawn as SVG in `src/components/GameIcon.tsx`.

Both need Python with Pillow, NumPy and SciPy.
