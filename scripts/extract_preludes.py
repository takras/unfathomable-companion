"""Cut the From the Abyss prelude cards out of their 5x3 sheet.

Writes assets/preludes/<id>.jpg (full size) and src/assets/preludes/<id>.webp (app copies).
The ids match src/data/preludes.ts.

Usage:
    python scripts/extract_preludes.py [sheet]   (default: source/assets/prelude cards front.png)
"""

import sys
from pathlib import Path

from PIL import Image

Image.MAX_IMAGE_PIXELS = None

# Row by row, as laid out on the sheet: day, night, twilight.
GRID = [
    ["favorable-conditions", "surplus", "respite", "volunteer", "outpace"],
    ["boarding-party", "emergence", "shortage", "malfunctions", "doom"],
    ["valuable-lessons", "delegate-authority", "spreading-rumors", "preparation", "cargo-raid"],
]
INSET = 4  # trim the sheet's gutter
WEB_WIDTH = 520  # big enough to read the card when opened in the app


def main():
    root = Path(__file__).resolve().parent.parent
    sheet = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "source" / "assets" / "prelude cards front.png"
    full_dir = root / "assets" / "preludes"
    web_dir = root / "src" / "assets" / "preludes"
    full_dir.mkdir(parents=True, exist_ok=True)
    web_dir.mkdir(parents=True, exist_ok=True)

    img = Image.open(sheet).convert("RGB")
    cols, rows = len(GRID[0]), len(GRID)
    w, h = img.width // cols, img.height // rows
    for r, names in enumerate(GRID):
        for c, name in enumerate(names):
            card = img.crop((c * w + INSET, r * h + INSET, (c + 1) * w - INSET, (r + 1) * h - INSET))
            card.save(full_dir / f"{name}.jpg", quality=90)
            web = card.resize((WEB_WIDTH, round(card.height * WEB_WIDTH / card.width)), Image.LANCZOS)
            web.save(web_dir / f"{name}.webp", quality=72, method=6)
            print(name, card.size)


if __name__ == "__main__":
    main()
