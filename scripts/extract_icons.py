"""Extract game icons (activation and track icons) from card scans as alpha masks.

Each icon is saved as a white PNG whose alpha holds the ink, so the app can
recolour it with CSS (mask-image + background-color).

Usage (paths default to source/assets and src/assets/icons in the project):
    python scripts/extract_icons.py [source assets dir] [output dir]
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

Image.MAX_IMAGE_PIXELS = None

SIZE = 128  # output is SIZE x SIZE
MYTHOS = "mythos cards front.jpg"
MYTHOS_CARD = (663, 1038)  # one card in the 10x7 sheet
# Inside the icon boxes in a mythos card's lower-right corner (card-local px),
# clear of the box's own outline.
ACTIVATION_BOX = (416, 926, 490, 992)
TRACK_BOX = (536, 926, 610, 992)

# name: (source file, crop box in that file, darkness threshold)
def mythos(col, row, box, dx=0):
    """Box on one card of the sheet; dx corrects cards printed slightly off the grid."""
    w, h = MYTHOS_CARD
    x, y = col * w + dx, row * h
    return (MYTHOS, (x + box[0], y + box[1], x + box[2], y + box[3]), 170)


ICONS = {
    # activation icons on mythos cards
    "act-deep-ones": mythos(0, 0, ACTIVATION_BOX),
    "act-father-dagon": mythos(2, 0, ACTIVATION_BOX),
    "act-mother-hydra": mythos(5, 0, ACTIVATION_BOX, dx=9),
    # track icons on mythos cards
    "track-travel": mythos(0, 0, TRACK_BOX),
    "track-ritual": mythos(1, 0, TRACK_BOX),
    # (the "choice of track" icon touches its box outline on every card, so the
    # app draws it as an SVG instead)
    # horror activation icons, from the expansion's horror reference card
    "act-shoggoth": ("horror reference abyss.png", (70, 200, 250, 340), 150),
    "act-drowned-spirit": ("horror reference abyss.png", (1125, 200, 1265, 345), 150),
    "act-grasping-tendril": ("horror reference abyss.png", (1135, 1235, 1280, 1370), 150),
    # the generic horror icon (black skull on a purple disc: keep only the black)
    "act-horror": ("horror icon.png", None, 90),
    # resources (small black glyphs on a tan square)
    "res-fuel": ("icon fuel.png", None, 110),
    "res-food": ("icon food.png", None, 110),
    "res-sanity": ("icon sanity.png", None, 110),
    "res-souls": ("icon souls.png", None, 110),
    # treachery has no icon file: take it from under the number on a treachery skill card
    "skill-treachery": ("skill card treachery front.jpg", (4, 80, 93, 146), 150),
}

# Skill icons are coloured in the game (orange influence, purple lore, ...), so they stay in colour.
SKILL_COLOUR = {
    "skill-influence": "influence icon.png",
    "skill-lore": "lore icon.png",
    "skill-observation": "observation icon.png",
    "skill-strength": "strength icon.png",
    "skill-will": "will icon.png",
}


def coloured(img):
    """Trim to the icon and fit it in a transparent square."""
    img = img.convert("RGBA")
    img = img.crop(img.getbbox())
    side = int(max(img.size) * 1.04)
    out = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    out.paste(img, ((side - img.width) // 2, (side - img.height) // 2), img)
    return out.resize((SIZE, SIZE), Image.LANCZOS)


def to_mask(img, threshold):
    if max(img.size) < 100:
        # tiny source (the 42px resource icons): enlarge before smoothing
        img = img.resize((img.width * 4, img.height * 4), Image.LANCZOS)
    grey = img.convert("RGB").convert("L")
    # soften the print halftone so the ink reads as solid shapes
    grey = grey.filter(ImageFilter.GaussianBlur(0.6 if threshold == 170 else 1.2))
    lum = np.asarray(grey).astype(float)
    alpha = np.clip((threshold - lum) / 60.0, 0, 1)
    # Drop ink touching the crop edge: that is the icon box's outline or the
    # card's scrollwork, not the icon itself.
    labels, _ = ndimage.label(alpha > 0.15)
    edge = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    alpha[np.isin(labels, edge[edge > 0])] = 0
    ys, xs = np.nonzero(alpha > 0.3)
    alpha = alpha[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    h, w = alpha.shape
    side = int(max(w, h) * 1.08)
    canvas = np.zeros((side, side))
    canvas[(side - h) // 2:(side - h) // 2 + h, (side - w) // 2:(side - w) // 2 + w] = alpha
    a = Image.fromarray((canvas * 255).astype(np.uint8)).resize((SIZE, SIZE), Image.LANCZOS)
    out = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    out.putalpha(a)
    return out


def main():
    root = Path(__file__).resolve().parent.parent
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "source" / "assets"
    out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else root / "src" / "assets" / "icons"
    out_dir.mkdir(parents=True, exist_ok=True)
    cache = {}
    for name, (fname, box, threshold) in ICONS.items():
        if fname not in cache:
            cache[fname] = Image.open(src / fname)
        img = cache[fname]
        if box:
            img = img.crop(box)
        to_mask(img, threshold).save(out_dir / f"{name}.png", optimize=True)
        print(name)
    for name, fname in SKILL_COLOUR.items():
        coloured(Image.open(src / fname)).save(out_dir / f"{name}.png", optimize=True)
        print(name)


if __name__ == "__main__":
    main()
