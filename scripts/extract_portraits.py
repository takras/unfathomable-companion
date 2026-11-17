"""Extract arch-shaped character portraits from the small character cards.

The small cards show the portrait in an arched window: straight sides, a
semicircular top and decorative swirls in the bottom corners. For each card we
detect the window's left/right edges and its apex, then cut a mask with a
semicircular top and a square bottom placed above the corner swirls. The mask
is inset so none of the frame's dark outline is kept.

Usage (paths default to source/assets and assets/portraits in the project; the
app copies always go to src/assets/portraits):
    python scripts/extract_portraits.py [source assets dir] [output dir]
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

Image.MAX_IMAGE_PIXELS = None

# Core-set portraits come as a 6x2 sheet. The matching text sheet
# ("core characters small front.jpg") prints each character's name in the
# same cell, which gives the names below.
CORE_SHEET = "core characters small.jpg"
CORE_GRID = (6, 2)
CORE_NAMES = [
    "ishmael-marsh", "jamie-snell", "jeanne-lafarge",
    "keilani-tatupu", "samira-dualeh", "svetlana-gedroits",
    "william-bowleg", "arjun-singh", "beatrice-sharpe", "edmund-mallory",
]

# Expansion portraits come as individual files, already named by character.
EXPANSION_FILES = {
    "antar small.png": "antar-al-fakahany",
    "avery small.png": "avery-engelbrecht",
    "guillaume small.png": "guillaume-delacroix",
    "ida small.png": "ida-lawrence",
    "kokoj small.png": "kokoj-fernandes",
    "raul small.png": "raul-martinez-garcia",
    "sardaana small.png": "sardaana-morgunova",
    "wong small.png": "wong-mui-choo",
}

# Window geometry as fractions of card size, measured on the cards.
EXP_LEFT = 0.174      # left edge of the window, fraction of card width
EXP_APEX = 0.177      # top of the arch, fraction of card height
# How far below the arch's spring line the square bottom sits, in radii.
# The corner swirls start at about 2.1 radii, so stay above that.
BOTTOM_RADII = 1.98
# Inset from the detected outer edge of the window's dark outline, in radii.
INSET_RADII = 0.055
SUPERSAMPLE = 4
# App copies: WebP, fixed width (2x the largest size the app shows them at).
WEB_WIDTH = 280
WEB_DIR = None  # set in main()


def luminance(rgb):
    return rgb[..., 0] * 0.299 + rgb[..., 1] * 0.587 + rgb[..., 2] * 0.114


def strongest_drop(profile, lo, hi, step):
    """First strong brightness drop met when moving from the frame side in `step` direction.

    Scans from the frame side so dark artwork just inside the window (a hat,
    a dark coat) can't win over the frame's outline. Takes the first drop that
    is at least half of the strongest one, then the peak of that drop.
    """
    order = range(lo, hi) if step > 0 else range(hi - 1, lo - 1, -1)
    drops = []
    for i in order:
        a, b = i - 2 * step, i + 2 * step
        ok = 0 <= a < len(profile) and 0 <= b < len(profile)
        drops.append((i, profile[a] - profile[b] if ok else 0.0))
    peak = max(d for _, d in drops)
    for k, (i, d) in enumerate(drops):
        if d >= 0.5 * peak:
            # climb to the local peak of this edge
            while k + 1 < len(drops) and drops[k + 1][1] >= drops[k][1]:
                k += 1
            return drops[k][0]


def detect_window(card):
    """Return (center_x, spring_y, radius) of the arched window, uninset."""
    h, w = card.shape[:2]
    lum = luminance(card.astype(float))

    # Straight-side rows: well below the arch, well above the bottom swirls.
    rows = lum[int(0.42 * h):int(0.75 * h)]
    cols = rows.mean(axis=0)
    span = int(0.035 * w)
    exp_l = int(EXP_LEFT * w)
    exp_r = w - 1 - exp_l
    left = strongest_drop(cols, exp_l - span, exp_l + span, +1)
    right = strongest_drop(cols, exp_r - span, exp_r + span, -1)

    cx = (left + right) / 2
    radius = (right - left) / 2

    band = lum[:, int(cx - 0.03 * w):int(cx + 0.03 * w)].mean(axis=1)
    exp_a = int(EXP_APEX * h)
    vspan = int(0.04 * h)
    apex = strongest_drop(band, exp_a - vspan, exp_a + vspan, +1)

    return cx, radius, apex, (left, right, apex)


def arch_mask(size, cx, spring_y, r, bottom_y):
    ss = SUPERSAMPLE
    w, h = size
    m = Image.new("L", (w * ss, h * ss), 0)
    d = ImageDraw.Draw(m)
    d.ellipse([(cx - r) * ss, (spring_y - r) * ss, (cx + r) * ss, (spring_y + r) * ss], fill=255)
    d.rectangle([(cx - r) * ss, spring_y * ss, (cx + r) * ss, bottom_y * ss], fill=255)
    return m.resize((w, h), Image.LANCZOS)


def extract_group(cards, out_dir):
    """Extract a group of cards that share one print layout.

    Artwork right under the arch can fool apex detection, so an apex far from
    the group's median is replaced by the median.
    """
    found = [(name, img, detect_window(np.asarray(img.convert("RGB")))) for name, img in cards]
    median_apex = float(np.median([d[2] for _, _, d in found]))
    for name, img, (cx, r0, apex, raw) in found:
        if abs(apex - median_apex) > 0.006 * img.height:
            print(f"  {name}: apex {apex} -> median {median_apex}")
            apex = median_apex
        extract(img, name, cx, r0, apex, raw, out_dir)


def extract(card_img, name, cx, r0, apex, raw, out_dir):
    spring = apex + r0
    r = r0 - INSET_RADII * r0
    bottom = spring + BOTTOM_RADII * r0
    top = spring - r

    box = (int(np.floor(cx - r)), int(np.floor(top)), int(np.ceil(cx + r)), int(np.ceil(bottom)))
    crop = card_img.convert("RGB").crop(box)
    mask = arch_mask(crop.size, cx - box[0], spring - box[1], r, bottom - box[1])
    out = crop.convert("RGBA")
    out.putalpha(mask)
    path = out_dir / f"{name}.png"
    out.save(path, optimize=True)
    # Small copy for the app bundle: same shape, all characters the same width.
    if WEB_DIR is not None:
        web = out.resize((WEB_WIDTH, round(out.height * WEB_WIDTH / out.width)), Image.LANCZOS)
        web.save(WEB_DIR / f"{name}.webp", quality=82, method=6)
    print(f"{name:20s} card={card_img.size} edges L/R/apex={raw} r={r0:.1f} -> {out.size}")
    return path


def main():
    root = Path(__file__).resolve().parent.parent
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "source" / "assets"
    out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else root / "assets" / "portraits"
    out_dir.mkdir(parents=True, exist_ok=True)
    global WEB_DIR
    WEB_DIR = root / "src" / "assets" / "portraits"
    WEB_DIR.mkdir(parents=True, exist_ok=True)

    sheet = Image.open(src / CORE_SHEET)
    cols, rows_n = CORE_GRID
    cw, ch = sheet.width // cols, sheet.height // rows_n
    core = []
    for i, name in enumerate(CORE_NAMES):
        c, r = i % cols, i // cols
        core.append((name, sheet.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))))
    extract_group(core, out_dir)

    extract_group([(name, Image.open(src / f)) for f, name in EXPANSION_FILES.items()], out_dir)


if __name__ == "__main__":
    main()
