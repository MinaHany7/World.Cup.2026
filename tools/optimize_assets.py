#!/usr/bin/env python3
"""Embed lightweight player thumbnails in the static data bundle for smaller GitHub uploads.

Run tools/build_data.py first to download/rebuild source data and credits, then run this script.
"""
from __future__ import annotations
import base64, csv, io, json, shutil, urllib.request
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'assets/data'
SOURCE = DATA / 'tournament.json'
TARGET = DATA / 'tournament-data.js'
CREDITS = DATA / 'photo-attribution.csv'
MAX_SIZE = (128, 170)
WEBP_QUALITY = 66


def read_source(photo_ref: str, remote_url: str | None) -> bytes:
    local = ROOT / photo_ref
    if local.is_file():
        return local.read_bytes()
    if remote_url:
        request = urllib.request.Request(remote_url, headers={'User-Agent': 'WorldCupPortfolioAssetOptimizer/1.0'})
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.read()
    raise FileNotFoundError(photo_ref)


def compact_photo(raw: bytes) -> bytes:
    with Image.open(io.BytesIO(raw)) as source:
        image = ImageOps.exif_transpose(source)
        image.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
        if image.mode not in ('RGB', 'RGBA'):
            image = image.convert('RGBA' if 'A' in image.getbands() else 'RGB')
        out = io.BytesIO()
        image.save(out, format='WEBP', quality=WEBP_QUALITY, method=6)
        return out.getvalue()


payload = json.loads(SOURCE.read_text(encoding='utf-8'))
image_map: dict[str, str] = {}
photo_lookup: dict[tuple[str, str], str] = {}
seen_urls: dict[str, str] = {}
failures = []
for player in payload.get('scorers', []):
    ref = player.get('Photo')
    url = player.get('Photo_URL')
    if not ref or not url:
        continue
    try:
        if ref not in image_map:
            if url not in seen_urls:
                webp = compact_photo(read_source(ref, url))
                seen_urls[url] = 'data:image/webp;base64,' + base64.b64encode(webp).decode('ascii')
            image_map[ref] = seen_urls[url]
        photo_lookup[(str(player.get('Team') or ''), str(player.get('Player') or ''))] = ref
    except Exception as exc:
        failures.append({'player': player.get('Player'), 'error': str(exc)[:140]})

expected_refs = {p.get('Photo') for p in payload.get('scorers', []) if p.get('Photo') and p.get('Photo_URL')}
if set(image_map) != expected_refs:
    missing = sorted(expected_refs - set(image_map))
    raise RuntimeError(f'Embedded {len(image_map)} of {len(expected_refs)} expected portraits; missing {len(missing)}. No output written.')
if len(image_map) < 180:
    raise RuntimeError(f'Only {len(image_map)} player portraits embedded; expected at least 180. No output written.')
payload['playerImages'] = image_map
TARGET.write_text('window.WC_DATA = ' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')

# The workbook keeps the original source URLs; this field points to the packed browser data instead.
if CREDITS.is_file():
    rows = list(csv.DictReader(CREDITS.open(encoding='utf-8-sig', newline='')))
    fields = list(rows[0].keys()) if rows else []
    for row in rows:
        key = photo_lookup.get((str(row.get('team') or ''), str(row.get('player') or '')))
        row['local_file'] = f'embedded:assets/data/tournament-data.js#{Path(key).name}' if key else ''
    with CREDITS.open('w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader(); writer.writerows(rows)

portrait_dir = ROOT / 'assets/players'
removed_portrait_files = len(list(portrait_dir.glob('*'))) if portrait_dir.exists() else 0
if portrait_dir.exists():
    shutil.rmtree(portrait_dir)

print(json.dumps({
    'portraits_embedded': len(image_map),
    'temporary_portrait_files_removed': removed_portrait_files,
    'unique_photo_urls': len(seen_urls),
    'embedded_data_bytes': TARGET.stat().st_size,
    'failed_portraits': failures,
}, ensure_ascii=False, indent=2))
