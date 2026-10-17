#!/usr/bin/env python3
"""
FAREL TCG - Slicing Script for 'Galeria de Cartas de Fantasia Épica.png'
Extracts:
1. Pure Artwork: public/assets/farel/art/cards/[card_id].webp
2. Full Card Box: public/assets/farel/art/gallery/[card_id].webp
3. Manifest: public/assets/farel/art/gallery-manifest.json
"""

import os
import sys
import json
from PIL import Image

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE_IMAGE_PATH = os.path.join(BASE_DIR, 'assets', 'Galeria de Cartas de Fantasia Épica.png')
CARDS_ART_DIR = os.path.join(BASE_DIR, 'public', 'assets', 'farel', 'art', 'cards')
GALLERY_DIR = os.path.join(BASE_DIR, 'public', 'assets', 'farel', 'art', 'gallery')
MANIFEST_PATH = os.path.join(BASE_DIR, 'public', 'assets', 'farel', 'art', 'gallery-manifest.json')

# Grid specifications:
# Row 1 (y_card: 12..331, y_art: 14..293)
ROW1_CARDS = [
    {
        'id': 'HERO-001',
        'slug': 'hero-viajante-do-limiar',
        'name': 'Viajante do Limiar',
        'type': 'hero',
        'cardBox': (11, 12, 247, 331),
        'artBox': (14, 14, 244, 293),
        'label': 'HERÓI 1'
    },
    {
        'id': 'HERO-002',
        'slug': 'hero-imperatriz-das-eras',
        'name': 'Imperatriz das Eras',
        'type': 'hero',
        'cardBox': (267, 12, 503, 331),
        'artBox': (270, 14, 500, 293),
        'label': 'HERÓI 2'
    },
    {
        'id': 'CRE-001',
        'slug': 'creature-legionario-de-bronze',
        'name': 'Legionário de Bronze',
        'type': 'creature',
        'cardBox': (524, 12, 760, 331),
        'artBox': (527, 14, 757, 293),
        'label': 'CRIATURA 1'
    },
    {
        'id': 'CRE-004',
        'slug': 'creature-lobo-de-cinzas',
        'name': 'Lobo de Cinzas',
        'type': 'creature',
        'cardBox': (780, 12, 1016, 331),
        'artBox': (783, 14, 1013, 293),
        'label': 'CRIATURA 2'
    },
    {
        'id': 'CRE-003',
        'slug': 'creature-guardiao-de-basalto',
        'name': 'Guardião de Basalto',
        'type': 'creature',
        'cardBox': (1035, 12, 1271, 331),
        'artBox': (1038, 14, 1268, 293),
        'label': 'CRIATURA 3'
    },
    {
        'id': 'CRE-006',
        'slug': 'creature-dragao-das-fendas',
        'name': 'Colosso Cronal (Dragão das Fendas)',
        'type': 'creature',
        'cardBox': (1290, 12, 1526, 331),
        'artBox': (1293, 14, 1523, 293),
        'label': 'CRIATURA 4'
    },
]

# Row 2 (y_card: 350..657, y_art: 352..621)
ROW2_CARDS = [
    {
        'id': 'CRE-002',
        'slug': 'creature-batedora-do-vento',
        'name': 'Batedora do Vento',
        'type': 'creature',
        'cardBox': (11, 350, 247, 657),
        'artBox': (14, 352, 244, 621),
        'label': 'CRIATURA 5'
    },
    {
        'id': 'GEN-001',
        'slug': 'structure-condensador-de-eter',
        'name': 'Condensador de Éter (Fortaleza)',
        'type': 'generator',
        'cardBox': (267, 350, 503, 657),
        'artBox': (270, 352, 500, 621),
        'label': 'ESTRUTURA 1'
    },
    {
        'id': 'GEN-002',
        'slug': 'structure-mina-de-eter',
        'name': 'Mina de Éter (Forja Profunda)',
        'type': 'generator',
        'cardBox': (524, 350, 760, 657),
        'artBox': (527, 352, 757, 621),
        'label': 'ESTRUTURA 2'
    },
    {
        'id': 'GEN-003',
        'slug': 'structure-observatorio-cronal',
        'name': 'Observatório Cronal',
        'type': 'generator',
        'cardBox': (780, 350, 1016, 657),
        'artBox': (783, 352, 1013, 621),
        'label': 'ESTRUTURA 3'
    },
    {
        'id': 'GEN-004',
        'slug': 'structure-moinho-dos-ventos',
        'name': 'Moinho dos Ventos',
        'type': 'generator',
        'cardBox': (1035, 350, 1271, 657),
        'artBox': (1038, 352, 1268, 621),
        'label': 'ESTRUTURA 4'
    },
    {
        'id': 'GEN-005',
        'slug': 'structure-santuario-das-quedas',
        'name': 'Santuário das Quedas',
        'type': 'generator',
        'cardBox': (1290, 350, 1526, 657),
        'artBox': (1293, 352, 1523, 621),
        'label': 'ESTRUTURA 5'
    },
]

# Row 3 (y_card: 676..967, y_art: 678..928)
ROW3_CARDS = [
    {
        'id': 'SPL-002',
        'slug': 'spell-dardo-arcano',
        'name': 'Dardo Arcano (Raio de Éter)',
        'type': 'spell',
        'cardBox': (70, 676, 333, 967),
        'artBox': (73, 678, 330, 928),
        'label': 'MAGIA INSTANTÂNEA 1'
    },
    {
        'id': 'SPL-003',
        'slug': 'spell-surto-de-eter',
        'name': 'Surto de Éter (Chuva de Meteoros)',
        'type': 'spell',
        'cardBox': (355, 676, 618, 967),
        'artBox': (358, 678, 615, 928),
        'label': 'MAGIA INSTANTÂNEA 2'
    },
    {
        'id': 'SPL-001',
        'slug': 'spell-furia-marcial',
        'name': 'Fúria Marcial (Escudo de Glifos)',
        'type': 'spell',
        'cardBox': (639, 676, 902, 967),
        'artBox': (642, 678, 899, 928),
        'label': 'MAGIA INSTANTÂNEA 3'
    },
    {
        'id': 'CHN-001',
        'slug': 'channel-escudo-reativo',
        'name': 'Escudo Reativo (Vórtice Sombrio)',
        'type': 'channelled_spell',
        'cardBox': (917, 676, 1180, 967),
        'artBox': (920, 678, 1177, 928),
        'label': 'MAGIA CANALIZADA 1'
    },
    {
        'id': 'CHN-002',
        'slug': 'channel-emboscada-cronal',
        'name': 'Emboscada Cronal (Serpente Espiritual)',
        'type': 'channelled_spell',
        'cardBox': (1202, 676, 1465, 967),
        'artBox': (1205, 678, 1462, 928),
        'label': 'MAGIA CANALIZADA 2'
    },
]

ALL_CARDS = ROW1_CARDS + ROW2_CARDS + ROW3_CARDS

def main():
    print(f"🎨 FAREL TCG - Iniciando Fatiamento da Galeria Épica...")
    print(f"Carregando: {SOURCE_IMAGE_PATH}")

    os.makedirs(CARDS_ART_DIR, exist_ok=True)
    os.makedirs(GALLERY_DIR, exist_ok=True)

    img = Image.open(SOURCE_IMAGE_PATH).convert('RGBA')
    width, height = img.size
    print(f"Dimensões de origem: {width}x{height}")

    manifest_entries = []

    for card_info in ALL_CARDS:
        cid = card_info['id']
        name = card_info['name']
        slug = card_info['slug']
        card_box = card_info['cardBox']
        art_box = card_info['artBox']

        # 1. Extração da arte pura
        art_crop = img.crop(art_box)
        art_file_rel = f"/assets/farel/art/cards/{cid}.webp"
        art_file_abs = os.path.join(CARDS_ART_DIR, f"{cid}.webp")
        art_crop.save(art_file_abs, 'WEBP', quality=95, method=6)

        # 2. Extração da carta completa com legenda
        gallery_crop = img.crop(card_box)
        gallery_file_rel = f"/assets/farel/art/gallery/{cid}.webp"
        gallery_file_abs = os.path.join(GALLERY_DIR, f"{cid}.webp")
        gallery_crop.save(gallery_file_abs, 'WEBP', quality=95, method=6)

        print(f"  ✓ [{cid}] {name} -> Art: {art_crop.size[0]}x{art_crop.size[1]} | Card: {gallery_crop.size[0]}x{gallery_crop.size[1]}")

        manifest_entries.append({
            'id': cid,
            'name': name,
            'slug': slug,
            'type': card_info['type'],
            'originalLabel': card_info['label'],
            'artUrl': art_file_rel,
            'galleryUrl': gallery_file_rel,
            'artDimensions': {'width': art_crop.size[0], 'height': art_crop.size[1]},
            'cardDimensions': {'width': gallery_crop.size[0], 'height': gallery_crop.size[1]},
        })

    # Grava o manifesto
    manifest_data = {
        'manifestVersion': '1.0.0',
        'sourceImage': 'assets/Galeria de Cartas de Fantasia Épica.png',
        'exportedCount': len(manifest_entries),
        'cards': manifest_entries
    }

    with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
        json.dump(manifest_data, f, indent=2, ensure_ascii=False)

    print(f"\n🎉 Sucesso! 17 artes e 17 cartas salvas em WebP.")
    print(f"Manifesto salvo em: {MANIFEST_PATH}")

if __name__ == '__main__':
    main()
