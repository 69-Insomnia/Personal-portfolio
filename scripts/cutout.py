"""Cut the background out of profile.png so the figure can rest on the cream hero card.

Produces public/images/profile-cutout.png (transparent PNG). rembg (U2-Net) does
the matting; the greenery/brick background is what gets removed. Falls back to a
no-op copy if rembg is unavailable, so the script never leaves the field unset
without saying so.
"""
from pathlib import Path

from PIL import Image

SRC = Path("public/images/profile.png")
DST = Path("public/images/profile-cutout.png")


def main() -> None:
    img = Image.open(SRC).convert("RGBA")
    try:
        from rembg import remove

        out = remove(img)
    except Exception as exc:  # noqa: BLE001 - report and bail clearly
        raise SystemExit(f"rembg failed: {exc}")

    out = out.convert("RGBA")

    # Trim fully-transparent margins, then pad a little so the figure is not
    # flush against the card edges.
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)

    out.save(DST)
    print(f"saved {DST} {out.size[0]}x{out.size[1]}")


if __name__ == "__main__":
    main()
