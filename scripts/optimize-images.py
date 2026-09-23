#!/usr/bin/env python3
"""
Fabrique les déclinaisons WebP à partir d'un dossier d'images source.

    python3 scripts/optimize-images.py --input chemin/vers/dossier
    python3 scripts/optimize-images.py --input chemin/vers/dossier --output chemin/vers/sortie --force
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from PIL import Image

# Paliers de largeur
PHOTO_WIDTHS = [400, 800, 1200, 1600]
ICON_WIDTHS = [128, 256, 512]

# Qualité WebP
PHOTO_QUALITY = 72
ICON_QUALITY = 82

IMAGE_SUFFIXES = {'.jpg', '.jpeg', '.png', '.webp'}


def ladder_for(filename: str, natural_width: int) -> tuple[list[int], int]:
    """Paliers retenus pour une image, et la qualité associée."""
    is_icon = 'logo' in filename.lower() or 'localisation' in filename.lower()
    widths = ICON_WIDTHS if is_icon else PHOTO_WIDTHS
    quality = ICON_QUALITY if is_icon else PHOTO_QUALITY

    kept = [w for w in widths if w < natural_width]
    if not kept or kept[-1] < min(natural_width, widths[-1]):
        kept.append(min(natural_width, widths[-1]))

    return sorted(set(kept)), quality


def main() -> int:
    parser = argparse.ArgumentParser(description="Convertit et redimensionne un dossier d'images en WebP.")
    parser.add_argument('--input', '-i', required=True, type=Path, help="Dossier contenant les images sources (jpg, jpeg, png, webp)")
    parser.add_argument('--output', '-o', type=Path, help="Dossier de destination (par défaut: sous-dossier 'optimized' dans l'input)")
    parser.add_argument('--force', action='store_true', help='regénère même ce qui existe déjà')
    args = parser.parse_args()

    input_dir: Path = args.input.resolve()
    if not input_dir.is_dir():
        print(f"Erreur : Le dossier source '{input_dir}' n'existe pas.", file=sys.stderr)
        return 1

    output_dir: Path = args.output.resolve() if args.output else input_dir / 'optimized'
    manifest_path = output_dir / 'image-manifest.json'

    # Récupère toutes les images du dossier (en évitant le dossier de sortie s'il est imbriqué)
    image_paths = [
        p for p in input_dir.rglob('*')
        if p.is_file() and p.suffix.lower() in IMAGE_SUFFIXES and 'optimized' not in p.parts
    ]

    if not image_paths:
        print('Aucune image compatible trouvée dans le dossier source.', file=sys.stderr)
        return 1

    manifest: dict[str, dict] = {}
    written = 0
    source_bytes = 0
    output_bytes = 0

    for path in image_paths:
        relative_path = path.relative_to(input_dir)
        key = str(relative_path.with_suffix(''))

        with Image.open(path) as im:
            im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') and _has_alpha(im) else 'RGB')
            natural_width, natural_height = im.size
            widths, quality = ladder_for(path.name, natural_width)

            for width in widths:
                target = output_dir / f'{key}-{width}.webp'
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
        source_bytes += path.stat().st_size

    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(
        json.dumps(dict(sorted(manifest.items())), indent=2, ensure_ascii=False) + '\n',
        encoding='utf-8',
    )

    print(f'{len(manifest)} images traitées, {written} fichiers écrits')
    print(f'sources : {source_bytes / 1024 / 1024:.1f} Mo')
    print(f'servis  : {output_bytes / 1024 / 1024:.1f} Mo')
    return 0


def _has_alpha(im: Image.Image) -> bool:
    if im.mode in ('RGBA', 'LA'):
        return im.getchannel('A').getextrema()[0] < 255
    if im.mode == 'P':
        return 'transparency' in im.info
    return False


if __name__ == '__main__':
    raise SystemExit(main())
