#!/usr/bin/env python3
"""ARVEN brand mark.

Single source of geometry for both the SVG mark and the raster master that
feeds the favicon pipeline, so the two can never drift apart.

The mark is a two-summit Valais massif. Above the snowline the rock is filled
with alpenglow (the accent); below it, bone. Candidate variants add the
spotted nutcracker — the bird that plants the arolla forest — either as a
negative-space notch or as a solid chevron above the col.

Usage:  python3 build_logo.py [--out DIR]
"""

import argparse
from pathlib import Path

from PIL import Image, ImageDraw

# --- tokens -----------------------------------------------------------------
BG = (10, 13, 15)  # --bg   #0A0D0F
INK = (237, 233, 224)  # --ink  #EDE9E0
ACCENT = (224, 87, 58)  # --accent #E0573A

SIZE = 512
SS = 4  # supersample factor

# --- geometry (in a 512 x 512 box, generous internal margin) -----------------
# The mark is an A monogram whose silhouette is an asymmetric Valais peak:
# a long shallow left flank, a sharp summit set right of centre, a short steep
# right flank. The counter is the col beneath the summit. The crossbar is the
# treeline, in alpenglow — the altitude the arolla forest stops at.
BASE_Y = 430
APEX = (300, 76)
OUTER = [(44, BASE_Y), APEX, (470, BASE_Y)]
COUNTER = [(200, BASE_Y), (302, 244), (390, BASE_Y)]
TREELINE = (316, 394)  # y range of the accent crossbar (thick enough to survive 16px)


def _poly(pts, k=SS):
    return [(x * k, y * k) for x, y in pts]


def _mask(draw_fn):
    m = Image.new("L", (SIZE * SS, SIZE * SS), 0)
    draw_fn(ImageDraw.Draw(m))
    return m


def draw_mark(variant="monogram", bg=None):
    """Render the mark at SIZE x SIZE. bg=None -> transparent."""
    img = Image.new("RGBA", (SIZE * SS, SIZE * SS), (0, 0, 0, 0) if bg is None else bg + (255,))

    # 1. the A silhouette, as an alpha mask: outer triangle minus the counter
    body = _mask(lambda d: d.polygon(_poly(OUTER), fill=255))
    counter = _mask(lambda d: d.polygon(_poly(COUNTER), fill=255))
    body.paste(0, (0, 0), counter)

    # 2. colour it: bone everywhere, alpenglow in the treeline band
    plate = Image.new("RGBA", img.size, INK + (255,))
    band = _mask(
        lambda d: d.rectangle(
            [0, TREELINE[0] * SS, SIZE * SS, TREELINE[1] * SS], fill=255
        )
    )
    plate.paste(Image.new("RGBA", img.size, ACCENT + (255,)), (0, 0), band)

    img.paste(plate, (0, 0), body)
    return img.resize((SIZE, SIZE), Image.LANCZOS)


def _hex(rgb):
    return "#%02X%02X%02X" % rgb


def _d(pts):
    return "M" + " L".join(f"{x} {y}" for x, y in pts) + " Z"


BODY_D = f"{_d(OUTER)} {_d(COUNTER)}"


def write_svg(path, themed=False):
    """The same geometry as vector. themed=True flips the ink for light UI."""
    style = (
        '<style>.ink{fill:#12161A}'
        "@media(prefers-color-scheme:dark){.ink{fill:%s}}</style>" % _hex(INK)
        if themed
        else "<style>.ink{fill:%s}</style>" % _hex(INK)
    )
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" '
        'role="img" aria-label="ARVEN">'
        f"{style}"
        f'<defs><clipPath id="b"><path d="{BODY_D}" clip-rule="evenodd"/></clipPath></defs>'
        f'<path class="ink" fill-rule="evenodd" d="{BODY_D}"/>'
        f'<rect x="0" y="{TREELINE[0]}" width="512" height="{TREELINE[1] - TREELINE[0]}" '
        f'fill="{_hex(ACCENT)}" clip-path="url(#b)"/>'
        "</svg>"
    )
    Path(path).write_text(svg, encoding="utf-8")


def lockup_preview(mark, path, width=1400):
    """Mark + Didot wordmark on the site background, for approval."""
    from PIL import ImageFont

    h = 480
    img = Image.new("RGB", (width, h), BG)
    d = ImageDraw.Draw(img)

    m = 216
    mk = mark.resize((m, m), Image.LANCZOS)
    img.paste(mk, (100, 122), mk)

    font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Didot.ttc", 132)
    small = ImageFont.truetype("/System/Library/Fonts/Supplemental/Didot.ttc", 24)

    x = 100 + m + 56
    top = 128
    tracking = 18
    cx = x
    for ch in "ARVEN":
        d.text((cx, top), ch, font=font, fill=INK)
        cx += d.textlength(ch, font=font) + tracking
    right = cx - tracking

    rule = top + 190
    d.line([(x, rule), (right, rule)], fill=ACCENT, width=3)
    d.text((x, rule + 26), "A  P R I V A T E   A L P I N E   R E S E R V E", font=small, fill=(146, 148, 145))
    img.save(path)


def contact_sheet(variants, out):
    """Each variant at 512, 64, 32 and 16 on the site background, for judging."""
    sizes = [512, 64, 32, 16]
    pad, gap = 40, 40
    row_h = 512 + gap
    sheet = Image.new(
        "RGB",
        (pad * 2 + sum(sizes) + gap * (len(sizes) - 1), pad * 2 + row_h * len(variants) - gap),
        BG,
    )
    for r, (name, img) in enumerate(variants):
        x = pad
        y = pad + r * row_h
        for s in sizes:
            small = img.resize((s, s), Image.LANCZOS)
            flat = Image.new("RGB", (s, s), BG)
            flat.paste(small, (0, 0), small)
            sheet.paste(flat, (x, y + (512 - s) // 2))
            x += s + gap
    sheet.save(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(Path(__file__).parent))
    args = ap.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    mark = draw_mark()
    mark.save(out / "logo-master-512.png")  # feeds the favicon pipeline
    write_svg(out / "logo-mark.svg")
    write_svg(out / "favicon.svg", themed=True)
    lockup_preview(mark, out / "lockup-preview.png")
    contact_sheet([("monogram", mark)], out / "candidates.png")
    print(f"wrote master, svg mark, themed favicon.svg, lockup preview to {out}")


if __name__ == "__main__":
    main()
