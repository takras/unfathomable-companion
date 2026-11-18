"""Extract the Rules Reference glossary into structured JSON for the app.

The PDF's typography tells us the structure: Halbfette Secession 16pt = topic heading ("4 ACTIVATIONS"),
14pt = subheading ("4.5 ACTIVATING MOTHER HYDRA"), 9pt = run-in label ("OPTION 1", "RELATED TOPICS:"),
an 8pt grey number in the margin = a numbered rule, the ornament font = a bullet, Boecklin's bullet
= a sub-bullet, italic paragraphs = examples. Inline icons come from the book's icon font.

Output: src/content/rules-reference.json, a list of topics:
  { "num": "4", "title": "Activations", "blocks": [ {type, num?, text} ], "related": ["Attack", ...] }
Block types: p (intro text), h (subheading), rule (numbered rule), bullet, sub (sub-bullet), example.
Inline markup in text: **bold**, *italic*, [[LABEL]] run-in label, {icon} for an icon.

Usage:
    python scripts/extract_rules.py [pdf] [out.json]
"""

import json
import re
import sys
from pathlib import Path

import pdfplumber

ICONS = {
    "": "influence", "": "lore", "": "observation", "": "strength",
    "": "will", "": "treachery", "": "mother-hydra", "": "father-dagon",
    "": "deep-ones", "": "track-choice", "": "fuel", "": "food",
    "": "souls", "": "sanity", "": "track-travel", "": "track-ritual",
}

# Glossary and appendices I–III (appendix IV is the illustrated setup, page 24 the index).
PAGES = range(1, 19)  # 0-based: pages 2–19
COL_SPLIT = 306  # page is 612pt wide; columns start at 36 and 314
FOOTER_TOP = 750


def style(w):
    f = w["fontname"].split("+")[-1]
    size = round(w["size"])
    if "Icons" in f:
        return "icon"
    if "BOUTON" in f:
        return "ornament"
    if "Boecklin" in f:
        return "dot"
    if "Halbfette" in f:
        return {20: "title", 16: "h1", 14: "h2"}.get(size, "label")
    if size == 8:
        return "num"
    if "BoldItalic" in f:
        return "bi"
    if "Bold" in f:
        return "b"
    if "Italic" in f:
        return "i"
    return "r"


SMALL = {"a", "an", "and", "as", "at", "by", "for", "from", "in", "of", "on", "or", "the", "to"}
ROMAN = re.compile(r"^(i|ii|iii|iv|v)(:?)$", re.I)


def title_case(s):
    words = s.lower().split()
    out = []
    for i, w in enumerate(words):
        m = ROMAN.match(w)
        if m:
            out.append(m.group(1).upper() + m.group(2))
        elif i > 0 and w in SMALL:
            out.append(w)
        else:
            out.append("-".join(p[:1].upper() + p[1:] for p in w.split("-")))
    return " ".join(out)


def lines_of(page):
    words = page.extract_words(keep_blank_chars=True, extra_attrs=["fontname", "size"], x_tolerance=1.5)
    cols = {0: [], 1: []}
    for w in words:
        if w["top"] > FOOTER_TOP or not w["text"].strip():
            continue
        cols[0 if w["x0"] < COL_SPLIT else 1].append(w)
    out = []
    for c, ws in cols.items():
        ws.sort(key=lambda w: w["top"])
        clusters = []
        icons = []
        for w in ws:
            if style(w) == "icon":
                icons.append(w)  # placed below: icon glyphs sit several points off their line
                continue
            # Words on one visual line sit up to a few points apart (labels, bold words, the margin number).
            if clusters and abs(w["top"] - clusters[-1][0]["top"]) <= 4:
                clusters[-1].append(w)
            else:
                clusters.append([w])
        for ic in icons:
            mid = (ic["top"] + ic["bottom"]) / 2
            best = min(clusters, key=lambda cl: abs((cl[0]["top"] + cl[0]["bottom"]) / 2 - mid), default=None)
            if best is not None and abs((best[0]["top"] + best[0]["bottom"]) / 2 - mid) < 9:
                best.append(ic)
            else:
                clusters.append([ic])
        origin = 36 if c == 0 else 314
        for cl in clusters:
            cl.sort(key=lambda w: w["x0"])
            out.append({"col": c, "top": cl[0]["top"], "words": cl, "x": cl[0]["x0"] - origin})
    return out


def render(words):
    """Words of one line -> text with inline markup. Returns (marker, num, text)."""
    marker = num = None
    parts = []
    prev = None
    for w in words:
        s = style(w)
        t = w["text"]
        if s == "num" and num is None and not parts:
            num = t.strip()
            continue
        if s == "ornament":
            marker = "bullet"
            continue
        if s == "dot" and not parts:
            marker = "sub"
            continue
        if s == "icon":
            t = "".join("{" + ICONS.get(ch, f"?{ord(ch):x}") + "}" for ch in t.strip())
        elif s in ("b", "bi"):
            t = f"**{t.strip()}**"
        elif s == "i":
            t = f"*{t.strip()}*" if t.strip() else t
        elif s == "label":
            t = f"[[{t.strip()}]]"
        gap = prev is not None and w["x0"] - prev["x1"] > 1.0
        raw_space = w["text"][:1] == " " or (prev is not None and prev["text"][-1:] == " ")
        if parts and (gap or raw_space):
            parts.append(" ")
        parts.append(t)
        prev = w
    text = "".join(parts)
    text = re.sub(r"\s+", " ", text).strip()
    # An icon glyph sorts by x into the gap it fills: "Mother Hydra ( ) {mother-hydra}" -> "( {mother-hydra} )".
    # Words that span the gap are one word, so move the icon into the first empty "( )".
    icons = re.findall(r"\{[a-z-]+\}", text)
    for ic in icons:
        if re.search(r"\(\s*\)", text) or "(]] [[)" in text:
            text = text.replace(ic, "", 1)
            if "(]] [[)" in text:
                text = text.replace("(]] [[)", f"(]]{ic}[[)", 1)
            else:
                text = re.sub(r"\(\s*\)", f"({ic})", text, count=1)
    # labels around an icon: "[[TRAVEL TRACK (]]{x}[[):]]" -> "[[TRAVEL TRACK]] ({x}):"
    text = re.sub(r"\[\[([^\]]*?)\s*\(\]\]\s*(\{[a-z-]+\})\s*\[\[\)(:?)\]\]", r"[[\1]] (\2)\3", text)
    text = re.sub(r"\s+", " ", text).strip()
    return marker, num, text


def main():
    root = Path(__file__).resolve().parent.parent
    pdf_path = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "source" / "unf01_rules_reference_v5-compressed.pdf"
    out_path = Path(sys.argv[2]) if len(sys.argv) > 2 else root / "src" / "content" / "rules-reference.json"

    topics = []
    block = None  # the block being filled
    last_bottom = None

    def new_block(kind, num=None, text=""):
        nonlocal block
        block = {"type": kind, "text": text}
        if num:
            block["num"] = num
        topics[-1]["blocks"].append(block)

    with pdfplumber.open(pdf_path) as pdf:
        for pi in PAGES:
            page = pdf.pages[pi]
            col = None
            for line in lines_of(page):
                if line["col"] != col:
                    col, last_bottom = line["col"], None
                first = style(line["words"][0])
                marker, num, text = render(line["words"])
                if not text and not marker:
                    continue
                gap = last_bottom is not None and line["top"] - last_bottom > 15
                last_bottom = line["top"]

                if first in ("title", "h1"):
                    # "1 ABILITIES" -> num "1", title "ABILITIES"; "GLOSSARY"/"APPENDIX I: ..." have no number
                    plain = re.sub(r"\[\[|\]\]|\*", "", text)
                    m = re.match(r"(\d+)\s+(.*)", plain)
                    current = topics[-1] if topics else None
                    if current is not None and not current["blocks"] and current.get("_kind") == first == "title":
                        current["title"] += " " + plain  # a heading that wraps onto a second line
                    elif m and first == "h1":
                        topics.append({"num": m.group(1), "title": m.group(2), "blocks": [], "related": [], "_kind": first})
                    elif first == "h1" and current is not None and not current["num"]:
                        # unnumbered headings inside an appendix are its sections
                        new_block("h", None, plain)
                    else:
                        topics.append({"num": "", "title": plain, "blocks": [], "related": [], "_kind": first})
                    block = None
                    continue
                if first == "h2":
                    plain = re.sub(r"\[\[|\]\]", "", text)
                    m = re.match(r"(\d+\.\d+)\s+(.*)", plain)
                    if m:
                        new_block("h", m.group(1), m.group(2))
                    else:
                        new_block("h", None, plain)
                    block = None
                    continue
                if not topics:
                    continue
                # (a few topics set "Related Topics:" in the text font instead of as a label)
                if re.match(r"(\[\[)?RELATED TOPICS", text, re.I):
                    rest = re.sub(r"^(\[\[)?RELATED TOPICS:?(\]\])?:?", "", text, flags=re.I)
                    topics[-1]["related_raw"] = rest
                    block = {"type": "related"}
                    continue
                if block and block.get("type") == "related" and not marker and not num:
                    topics[-1]["related_raw"] += " " + text
                    continue

                # third-level heading set as numbered run-in labels: "[[28.11]] [[CHOICE CRISES]]"
                m = re.match(r"\[\[(\d+\.\d+)\]\]\s*\[\[([^\]]+)\]\]$", text)
                if m:
                    new_block("h3", m.group(1), m.group(2))
                    block = None
                    continue
                if num:
                    new_block("rule", num, text)
                elif marker == "bullet":
                    new_block("bullet", None, text)
                elif marker == "sub":
                    new_block("sub", None, text)
                elif block is None or gap or (text.startswith("*Example") and block["type"] != "example"):
                    italic = text.startswith("*") and line["x"] > 10
                    new_block("example" if italic else "p", None, text)
                else:
                    # continuation of the current block (also across columns and pages)
                    if block["text"].endswith("-") and not block["text"].endswith(" -"):
                        block["text"] = block["text"] + text
                    else:
                        block["text"] = (block["text"] + " " + text).strip()

    # Headings are set in capitals; the "Related topics" lists give the book's own casing for topic names.
    canonical = {}
    for tp in topics:
        raw = re.sub(r"^\s*(Related Topics:\s*)+", "", tp.get("related_raw", ""))
        raw = re.sub(r"\[\[|\]\]", "", raw)
        tp["related"] = [r.strip(" .") for r in raw.split(",") if r.strip(" .")]
        for r in tp["related"]:
            canonical[r.lower()] = r
    for tp in topics:
        tp.pop("related_raw", None)
        tp.pop("_kind", None)
        tp["title"] = canonical.get(tp["title"].lower(), title_case(tp["title"]))
        # Drop illustration captions: an italic line repeating the heading above it ("*Water Spaces*").
        kept = []
        for b in tp["blocks"]:
            if b["type"] in ("h", "h3"):
                b["text"] = title_case(b["text"])
            elif b["type"] == "example" and kept and kept[-1]["type"] in ("h", "h3"):
                if b["text"].strip("* ").lower() == kept[-1]["text"].lower():
                    continue
            kept.append(b)
        tp["blocks"] = kept
        for b in tp["blocks"]:
            # merge adjacent italic runs: "*a* *b*" -> "*a b*"
            b["text"] = re.sub(r"\*\s+\*(?!\*)", " ", b["text"]).replace("** **", " ")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(topics, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(topics)} topics, {sum(len(t['blocks']) for t in topics)} blocks -> {out_path}")


if __name__ == "__main__":
    main()
