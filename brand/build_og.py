#!/usr/bin/env python3
"""1200x630 Open Graph card: the hero plate, darkened, with the ARVEN lockup.

A square logo stretched to 1.91:1 looks broken in a link preview, so this is
its own composition rather than a resized favicon.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from build_logo import ACCENT, BG, INK, draw_mark

W, H = 1200, 630
ROOT = Path(__file__).parent
DIDOT = "/System/Library/Fonts/Supplemental/Didot.ttc"
MONO = "/System/Library/Fonts/Menlo.ttc"


def main():
    src = Image.open(ROOT / "src-images" / "01-hero.png").convert("RGB")

    # cover-crop to 1.91:1
    tr = W / H
    if src.width / src.height > tr:
        nw = int(src.height * tr)
        src = src.crop(((src.width - nw) // 2, 0, (src.width + nw) // 2, src.height))
    else:
        nh = int(src.width / tr)
        src = src.crop((0, (src.height - nh) // 2, src.width, (src.height + nh) // 2))
    img = src.resize((W, H), Image.LANCZOS)

    # darken from the bottom-left so the type has somewhere to sit
    veil = Image.new("L", (W, H), 0)
    vd = ImageDraw.Draw(veil)
    for y in range(H):
        vd.line([(0, y), (W, y)], fill=int(38 + 200 * (y / H) ** 1.5))
    img = Image.composite(Image.new("RGB", (W, H), BG), img, veil)

    d = ImageDraw.Draw(img)
    mark = draw_mark()
    m = 104
    mk = mark.resize((m, m), Image.LANCZOS)
    img.paste(mk, (72, H - 118 - m), mk)

    word = ImageFont.truetype(DIDOT, 96)
    sub = ImageFont.truetype(DIDOT, 30)
    hud = ImageFont.truetype(MONO, 20)

    x = 72 + m + 34
    cx, top = x, H - 118 - m + 4
    for ch in "ARVEN":
        d.text((cx, top), ch, font=word, fill=INK)
        cx += d.textlength(ch, font=word) + 13
    d.line([(x, top + 136), (cx - 13, top + 136)], fill=ACCENT, width=3)
    d.text((x, top + 152), "A  P R I V A T E   A L P I N E   R E S E R V E", font=sub, fill=(196, 194, 188))

    d.text((72, 64), "46°06′ N · 07°30′ E", font=hud, fill=(214, 210, 202))
    d.text((72, 96), "VAL D'HÉRENS · VALAIS · CH", font=hud, fill=(150, 152, 150))
    r = d.textlength("4 000 HECTARES · 22 DOORS", font=hud)
    d.text((W - 72 - r, 64), "4 000 HECTARES · 22 DOORS", font=hud, fill=(214, 210, 202))

    out = ROOT.parent / "public" / "images" / "og.jpg"
    img.save(out, quality=86, optimize=True, progressive=True)
    print("wrote", out, img.size)


if __name__ == "__main__":
    main()
