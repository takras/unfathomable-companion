# Google Play listing - Unfathomable Companion

Copy each block into the Play Console (Grow → Store presence → Main store listing). Character limits are
Google's; counts are checked by `node store/check-listing.mjs`.

## App details

**App name** (30)
```
Unfathomable Companion
```

**Short description** (80)
```
Loyalty deck, titles, dice, monster activations and rules for Unfathomable
```

**Full description** (4000)
```
Unfathomable Companion is a free, unofficial companion for Unfathomable, the board game of hidden loyalties aboard the SS Atlantica. It keeps the fiddly parts of the game at your fingertips, so the table spends less time in the rulebook and more time wondering who among you is a hybrid.

SET UP ANY GAME
• Play the base game or add From the Abyss, with the No-Cultist variant if you like.
• Tap the characters your table picked; the app shows the exact loyalty deck for your player count, who starts as Captain and Keeper of the Tome, and the starting resource dials.
• Preludes: choose how many day, twilight and night cards to use (standard, or tilted towards the humans or the hybrids), leave cards out if you want, and let the app shuffle and draw them.

TRACK THE TITLES
• See who holds the Captain and Keeper of the Tome titles at a glance.
• Mark players as in the Brig or revealed as traitors; titles pass down the lines of succession automatically, following the rules.
• The awakening phase, the steps for revealing as a traitor and the Brig rules, right where you need them.

EVERY ROLL AT A GLANCE
• The attack table for the eight-sided die: what each attacker needs against each defender, with the odds.
• Horrors, the Shoggoth's and Grasping Tendril's +1, and every other roll in the game: spawns, the Deep, wandering allies.

MONSTER ACTIVATIONS
• Tap the activation icons on the mythos card you drew, in order, and see exactly what Mother Hydra, Father Dagon, the Deep Ones and the horrors do.
• The horror icon handled for you: track icon or activation, depending on what is on the board.

THE RULES ON DEMAND
• The complete Rules Reference glossary, searchable, with a contents drawer and linked related topics.
• With From the Abyss in the game, its chapters are added and its changes to the core rules are shown right inside the rules they change.

MADE FOR THE TABLE
• Works offline once installed.
• Your game is saved on your device and survives restarts. No account, no ads, no tracking.
• Styled after the rulebooks, with the character portraits from the game.

Unfathomable Companion is a fan project. It is not affiliated with, endorsed or sponsored by Fantasy Flight Games. You need a copy of the board game to play.
```

## Graphics

| Asset | File | Size |
| --- | --- | --- |
| App icon | `public/icon-512.png` | 512 × 512 |
| Feature graphic | `store/google-play/feature-graphic.png` | 1024 × 500 |
| Phone screenshots | `store/google-play/phone-01-setup.png` … `phone-06-rules.png` | 1080 × 1920 |
| 7" tablet screenshots | `store/google-play/tablet-7/tablet7-01-setup.png` … | 1080 × 1920 |
| 10" tablet screenshots | `store/google-play/tablet-10/tablet10-01-setup.png` … | 1440 × 2560 |

All are 24-bit PNG without transparency, as Play requires. Regenerate with `npm run store`.

## Categorisation

- **App category:** Entertainment
- **Tags:** Board games (if offered), Reference
- **Contact email:** takras@takras.net
- **Website:** https://unfathomable.takras.net/
- **Privacy policy:** https://unfathomable.takras.net/privacy.html

## App content (Policy → App content)

| Section | Answer |
| --- | --- |
| Privacy policy | https://unfathomable.takras.net/privacy.html |
| Ads | No, the app does not contain ads |
| App access | All functionality is available without special access |
| Content rating (IARC questionnaire) | Category: Reference, News, or Educational. Violence: none (rules mention "attacks" and characters being "defeated", no depiction). Fear: the app shows monster artwork, answer yes to mildly frightening images if asked. No sexuality, language, drugs, gambling or user interaction. |
| Target audience | 13 and over (the game itself is for ages 14+) |
| News app | No |
| Data safety | No data collected, no data shared. The app does not request any user data. |
| Government app / financial features / health | No |

## Release notes (first release)
```
First release: setup with the loyalty deck and preludes, Captain and Keeper of the Tome tracking, the attack table, monster activations, and the searchable Rules Reference with From the Abyss.
```
