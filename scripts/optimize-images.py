#!/usr/bin/env python3
"""
Fabrique les déclinaisons WebP servies par le site.

Les fichiers de `resources/js/assets` sont les masters : ils sortent des
appareils photo, pèsent jusqu'à 8 Mo et mesurent 4000 px de large. Aucun n'a
sa place dans une page. Ce script en tire, pour chaque image réellement
référencée dans le code, une échelle de largeurs en WebP, rangée sous
`resources/js/assets/optimized/`, plus un manifeste des dimensions que le
composant <Img> utilise pour réserver la place de l'image avant son arrivée.

    python3 scripts/optimize-images.py            # ne refait que le manquant
    python3 scripts/optimize-images.py --force    # tout regénérer

Les masters ne sont jamais modifiés : relancer le script suffit à changer de
qualité ou de palier.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'resources' / 'js' / 'assets'
OUT = ASSETS / 'optimized'
MANIFEST = ROOT / 'resources' / 'js' / 'lib' / 'image-manifest.json'
SOURCES = ROOT / 'resources' / 'js'

# Paliers de largeur. Les photos couvrent du téléphone au grand écran ; les
# logos et les portraits ne sont jamais affichés au-delà de 512 px, un palier
# de 1600 px n'y serait que du poids mort.
PHOTO_WIDTHS = [400, 800, 1200, 1600]
ICON_WIDTHS = [128, 256, 512]

# Qualité WebP. 72 reste indiscernable du master sur une photo affichée à
# l'écran ; les aplats d'un logo réclament un cran de plus.
PHOTO_QUALITY = 72
ICON_QUALITY = 82

ICON_PATTERN = re.compile(r'(LOGO|Logo/|localisation)', re.IGNORECASE)
IMAGE_SUFFIXES = {'.jpg', '.jpeg', '.png', '.webp'}


def referenced_assets() -> set[str]:
    """Chemins d'assets cités dans le code, relatifs à `resources/js/assets`."""
    found: set[str] = set()
    pattern = re.compile(r'''['"]@/assets/([^'"]+)['"]''')

    for path in SOURCES.rglob('*'):
        if path.suffix not in {'.ts', '.tsx', '.js', '.jsx'}:
            continue
        if 'assets/optimized' in path.as_posix():
            continue
        found.update(pattern.findall(path.read_text(encoding='utf-8', errors='ignore')))

    return {name for name in found if Path(name).suffix.lower() in IMAGE_SUFFIXES}


def ladder_for(relative: str, natural_width: int) -> tuple[list[int], int]:
    """Paliers retenus pour une image, et la qualité qui va avec."""
    is_icon = bool(ICON_PATTERN.search(relative))
    widths = ICON_WIDTHS if is_icon else PHOTO_WIDTHS
    quality = ICON_QUALITY if is_icon else PHOTO_QUALITY

    # Jamais au-dessus de la définition du master : agrandir n'ajoute aucun
    # détail, seulement des octets.
    kept = [w for w in widths if w < natural_width]
    if not kept or kept[-1] < min(natural_width, widths[-1]):
        kept.append(min(natural_width, widths[-1]))

    return sorted(set(kept)), quality


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--force', action='store_true', help='regénère même ce qui existe déjà')
    args = parser.parse_args()

    names = sorted(referenced_assets())
    if not names:
        print('Aucune image référencée trouvée.', file=sys.stderr)
        return 1

    manifest: dict[str, dict] = {}
    written = 0
    source_bytes = 0
    output_bytes = 0

    for name in names:
        source = ASSETS / name
        if not source.is_file():
            print(f'  absent, ignoré : {name}', file=sys.stderr)
            continue

        key = str(Path(name).with_suffix(''))

        with Image.open(source) as im:
            im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') and _has_alpha(im) else 'RGB')
            natural_width, natural_height = im.size
            widths, quality = ladder_for(name, natural_width)

            for width in widths:
                target = OUT / f'{key}-{width}.webp'
                target.parent.mkdir(parents=True, exist_ok=True)

                if target.exists() and not args.force:
                    output_bytes += target.stat().st_size
                    continue

                height = max(1, round(natural_height * width / natural_width))
                resized = im.resize((width, height), Image.LANCZOS)
                resized.save(target, 'WEBP', quality=quality, method=6)
                output_bytes += target.stat().st_size
                written += 1

        largest = widths[-1]
        manifest[key] = {
            'width': largest,
            'height': max(1, round(natural_height * largest / natural_width)),
            'widths': widths,
        }
        source_bytes += source.stat().st_size

    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(
        json.dumps(dict(sorted(manifest.items())), indent=2, ensure_ascii=False) + '\n',
        encoding='utf-8',
    )

    print(f'{len(manifest)} images, {written} fichiers écrits')
    print(f'masters  : {source_bytes / 1024 / 1024:.1f} Mo')
    print(f'servis   : {output_bytes / 1024 / 1024:.1f} Mo (toutes largeurs confondues)')
    return 0


def _has_alpha(im: Image.Image) -> bool:
    if im.mode in ('RGBA', 'LA'):
        return im.getchannel('A').getextrema()[0] < 255
    if im.mode == 'P':
        return 'transparency' in im.info
    return False


if __name__ == '__main__':
    raise SystemExit(main())
