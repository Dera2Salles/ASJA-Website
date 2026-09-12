#!/usr/bin/env python3
"""
Engendre le jeu d'icônes du site depuis le logo de l'université.

Aucune icône n'est dessinée : tout sort de `assets/Logo/asja-logo.png`, le
logo déjà en place. Le script ne fait que le décliner aux tailles et aux
formats que réclament les navigateurs, iOS et les écrans d'accueil Android,
plus la vignette de partage tirée de la photo du campus.

    python3 scripts/make-icons.py

À relancer si le logo change.
"""

from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'resources' / 'js' / 'assets'
PUBLIC = ROOT / 'public'

LOGO = ASSETS / 'Logo' / 'asja-logo.png'
SHARE_PHOTO = ASSETS / 'Lieu_espace' / 'Devant_asja.jpg'


def main() -> None:
    logo = Image.open(LOGO).convert('RGBA')

    def on_white(size: int) -> Image.Image:
        """Le logo aplati sur blanc — la transparence vire au noir sur iOS."""
        backdrop = Image.new('RGBA', logo.size, (255, 255, 255, 255))
        return (
            Image.alpha_composite(backdrop, logo)
            .convert('RGB')
            .resize((size, size), Image.LANCZOS)
        )

    def transparent(size: int) -> Image.Image:
        return logo.resize((size, size), Image.LANCZOS)

    # Les trois tailles que réclament encore les navigateurs et les agrégateurs.
    on_white(256).save(PUBLIC / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])

    # PNG modernes : le navigateur les préfère à l'.ico quand il a le choix.
    transparent(32).save(PUBLIC / 'favicon-32x32.png', optimize=True)
    transparent(96).save(PUBLIC / 'favicon-96x96.png', optimize=True)

    on_white(180).save(PUBLIC / 'apple-touch-icon.png', optimize=True)

    # Écran d'accueil Android et installation en application.
    on_white(192).save(PUBLIC / 'icon-192.png', optimize=True)
    on_white(512).save(PUBLIC / 'icon-512.png', optimize=True)

    # Vignette de partage : la façade du campus au format des aperçus.
    photo = Image.open(SHARE_PHOTO).convert('RGB')
    ImageOps.fit(photo, (1200, 630), Image.LANCZOS, centering=(0.5, 0.45)).save(
        PUBLIC / 'og-image.jpg', quality=82, optimize=True, progressive=True
    )

    for name in (
        'favicon.ico', 'favicon-32x32.png', 'favicon-96x96.png',
        'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'og-image.jpg',
    ):
        print(f'{(PUBLIC / name).stat().st_size / 1024:8.1f} Ko  {name}')


if __name__ == '__main__':
    main()
