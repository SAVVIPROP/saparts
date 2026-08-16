#!/usr/bin/env python3
"""Convert official pack photos to self-hosted WebP listing images."""

from __future__ import annotations

import gc
import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

Image.MAX_IMAGE_PIXELS = 200_000_000

PACK = Path("/workspace/saparts-packs/01-launch")
APP = Path("/workspace/saparts-next")
OUT = APP / "public" / "listings"
PROPS = APP / "data" / "properties"
LOCAL_JSON = APP / "data" / "local-images.json"
CITIES = ["hong-kong", "london", "new-york", "paris", "singapore", "dubai", "tokyo"]
MAX_PER = 8
MAX_SIDE = 1400
QUALITY = 72
MIN_BYTES = 8 * 1024
MIN_DIM = 200
SKIP_TOKENS = (
    "logo",
    "favicon",
    "sprite",
    "homepage-banner",
    "navigation-menu",
    "metatags",
    "ogimage",
    "og-image",
)
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".tif", ".tiff", ".bmp"}
PRIORITY = (("hero", 0), ("overview", 1), ("exterior", 2), ("living", 3))


def is_promo(path: Path) -> bool:
    blob = str(path).lower()
    return any(tok in blob for tok in SKIP_TOKENS)


def rank(name: str, index: int) -> tuple[int, int]:
    n = name.lower()
    for token, score in PRIORITY:
        if token in n:
            return (score, index)
    return (100, index)


def convert_one(src: Path, dest: Path) -> str | None:
    try:
        if src.stat().st_size < MIN_BYTES:
            return "tiny-bytes"
        if is_promo(src):
            return "promo"
        with Image.open(src) as im:
            try:
                im.draft("RGB", (MAX_SIDE, MAX_SIDE))
            except Exception:
                pass
            im.load()
            im = ImageOps.exif_transpose(im)
            w, h = im.size
            if w < MIN_DIM or h < MIN_DIM:
                return "tiny-dim"
            if max(w, h) > MAX_SIDE:
                im.thumbnail((MAX_SIDE, MAX_SIDE), Image.Resampling.LANCZOS)
            if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
                rgba = im.convert("RGBA")
                bg = Image.new("RGB", rgba.size, (255, 255, 255))
                bg.paste(rgba, mask=rgba.split()[-1])
                out = bg
            elif im.mode != "RGB":
                out = im.convert("RGB")
            else:
                out = im
            dest.parent.mkdir(parents=True, exist_ok=True)
            tmp = dest.with_suffix(".tmp.webp")
            out.save(tmp, "WEBP", quality=QUALITY, method=4)
            tmp.replace(dest)
        return None
    except Exception as exc:
        return f"error:{type(exc).__name__}:{exc}"


def load_listings() -> list[dict]:
    rows: list[dict] = []
    for f in sorted(PROPS.glob("*.json")):
        city_rows = json.loads(f.read_text())
        for row in city_rows:
            row["_city_file"] = f.name
        rows.extend(city_rows)
    return rows


def main() -> int:
    listings = load_listings()
    slugs = {r["slug"] for r in listings if r.get("slug")}
    print(f"listings={len(listings)} unique_slugs={len(slugs)}", flush=True)

    if OUT.exists():
        import shutil
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True, exist_ok=True)

    local: dict[str, list[str]] = {}
    stats = {
        "folders_matched": 0,
        "folders_empty": 0,
        "converted": 0,
        "skipped_tiny_bytes": 0,
        "skipped_tiny_dim": 0,
        "skipped_promo": 0,
        "skipped_error": 0,
        "skipped_nonimage": 0,
        "listings_with_photos": 0,
        "unmatched_folders": 0,
    }
    errors: list[str] = []

    for city in CITIES:
        img_root = PACK / city / "images"
        if not img_root.is_dir():
            print(f"WARN missing {img_root}", flush=True)
            continue
        folders = sorted([p for p in img_root.iterdir() if p.is_dir()])
        for folder in folders:
            slug = folder.name
            if slug not in slugs:
                stats["unmatched_folders"] += 1
                continue
            stats["folders_matched"] += 1
            candidates = []
            for p in sorted(folder.iterdir(), key=lambda x: x.name.lower()):
                if not p.is_file():
                    continue
                if p.suffix.lower() not in IMAGE_EXTS:
                    stats["skipped_nonimage"] += 1
                    continue
                candidates.append(p)
            if not candidates:
                stats["folders_empty"] += 1
                continue
            ordered = sorted(enumerate(candidates), key=lambda iv: rank(iv[1].name, iv[0]))
            dest_dir = OUT / slug
            kept: list[str] = []
            for _, src in ordered:
                if len(kept) >= MAX_PER:
                    break
                dest = dest_dir / f"{len(kept)+1:02d}.webp"
                reason = convert_one(src, dest)
                if reason is None:
                    kept.append(f"/listings/{slug}/{len(kept)+1:02d}.webp")
                    stats["converted"] += 1
                elif reason == "tiny-bytes":
                    stats["skipped_tiny_bytes"] += 1
                elif reason == "tiny-dim":
                    stats["skipped_tiny_dim"] += 1
                elif reason == "promo":
                    stats["skipped_promo"] += 1
                else:
                    stats["skipped_error"] += 1
                    errors.append(f"{src}: {reason}")
            if kept:
                local[slug] = kept
                stats["listings_with_photos"] += 1
            else:
                if dest_dir.exists() and not any(dest_dir.iterdir()):
                    dest_dir.rmdir()
            if stats["folders_matched"] % 25 == 0:
                print(
                    f"progress folders={stats['folders_matched']} webp={stats['converted']} "
                    f"with_photos={stats['listings_with_photos']}",
                    flush=True,
                )
                gc.collect()

    LOCAL_JSON.write_text(json.dumps(local, indent=2, sort_keys=True) + "\n")

    by_file: dict[str, list[dict]] = {}
    for row in listings:
        city_file = row.pop("_city_file")
        slug = row.get("slug")
        row["imageFiles"] = list(local.get(slug, []))
        by_file.setdefault(city_file, []).append(row)
    for name, rows in by_file.items():
        (PROPS / name).write_text(json.dumps(rows, indent=2, ensure_ascii=False) + "\n")

    blank = sorted(slugs - set(local))
    report = {
        "stats": stats,
        "blank_count": len(blank),
        "blank_slugs": blank,
        "error_count": len(errors),
        "errors": errors[:50],
    }
    (APP / "data" / "local-images-report.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(stats, indent=2), flush=True)
    print(f"blank={len(blank)} errors={len(errors)}", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
