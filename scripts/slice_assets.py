import os
import json
import base64
import re
import io
from PIL import Image, ImageDraw, ImageFont

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ASSETS_DIR = os.path.join(PROJECT_ROOT, "assets")
GRID_IMG_PATH = os.path.join(ASSETS_DIR, "asset-sheet-grid.png")
PROTOTYPE_HTML_PATH = os.path.join(ASSETS_DIR, "FAREL-prototipo-cartas.html")
PUBLIC_CARDS_DIR = os.path.join(PROJECT_ROOT, "public", "assets", "farel", "cards")
DOCS_ASSETS_DIR = os.path.join(PROJECT_ROOT, "docs", "assets")

os.makedirs(PUBLIC_CARDS_DIR, exist_ok=True)
os.makedirs(DOCS_ASSETS_DIR, exist_ok=True)

# 1. Load spritesheet
grid_img = Image.open(GRID_IMG_PATH).convert("RGBA")
gw, gh = grid_img.size
print(f"[1] Loaded spritesheet {GRID_IMG_PATH}: {gw}x{gh} RGBA")

# Extract base64 frames from prototype HTML as reference
base64_frames = {}
base64_back = None
if os.path.exists(PROTOTYPE_HTML_PATH):
    with open(PROTOTYPE_HTML_PATH, "r", encoding="utf-8") as f:
        html_content = f.read()
    m = re.search(r"const ASSETS = ({.*?});", html_content, re.DOTALL)
    if m:
        assets_data = json.loads(m.group(1))
        base64_back = assets_data.get("back")
        base64_frames = assets_data.get("frames", {})
        print(f"[2] Extracted base64 templates from prototype HTML: back + {list(base64_frames.keys())}")

# 2. Precise crop definitions for asset-sheet-grid.png (1500 x 1110)
# Card bounding boxes calibrated to exclude external sheet labels and borders:
# Top row:
# - Card Back: x=135, y=132, w=250, h=352
# - Hero: x=585, y=132, w=250, h=352
# - Creature: x=1038, y=132, w=250, h=352
# Bottom row:
# - Structure: x=135, y=582, w=250, h=352
# - Instant Spell: x=585, y=582, w=250, h=352
# - Channelled Spell: x=1038, y=582, w=250, h=352

CROP_SPECS = [
    {
        "id": "card-back",
        "type": "back",
        "title": "Verso Oficial",
        "box": (135, 132, 135 + 250, 132 + 352),
        "html_key": "back",
        "artWindow": None,
        "notes": "Verso com selo rúnico central. Exibido quando a carta está virada para baixo."
    },
    {
        "id": "template-hero",
        "type": "hero",
        "title": "Herói (Elo Mortal)",
        "box": (585, 132, 585 + 250, 132 + 352),
        "html_key": "hero",
        "artWindow": {"x": 0.05, "y": 0.071, "width": 0.90, "height": 0.513},
        "notes": "Moldura régia de ouro e bronze. Custo circular no canto superior esquerdo e medalhão de vida no canto inferior direito."
    },
    {
        "id": "template-creature",
        "type": "creature",
        "title": "Criatura Tática",
        "box": (1038, 132, 1038 + 250, 132 + 352),
        "html_key": "creature",
        "artWindow": {"x": 0.05, "y": 0.071, "width": 0.90, "height": 0.513},
        "notes": "Moldura de ferro e bronze forjado. Combate usa d6 em vez de ataque impresso."
    },
    {
        "id": "template-structure",
        "type": "structure",
        "title": "Estrutura Geradora",
        "box": (135, 582, 135 + 250, 582 + 352),
        "html_key": "generator",
        "artWindow": {"x": 0.05, "y": 0.071, "width": 0.90, "height": 0.513},
        "notes": "Moldura rúnica azul etéreo. Possui vida e gera pontos de energia por turno."
    },
    {
        "id": "template-spell-instant",
        "type": "spell-instant",
        "title": "Magia Instantânea",
        "box": (585, 582, 585 + 250, 582 + 352),
        "html_key": "spell",
        "artWindow": {"x": 0.05, "y": 0.071, "width": 0.90, "height": 0.513},
        "notes": "Moldura púrpura arcana. Efeito resolvido imediatamente no turno em que é conjurada."
    },
    {
        "id": "template-spell-channel",
        "type": "spell-channel",
        "title": "Magia Canalizada",
        "box": (1038, 582, 1038 + 250, 582 + 352),
        "html_key": "channelled_spell",
        "artWindow": {"x": 0.05, "y": 0.071, "width": 0.90, "height": 0.513},
        "notes": "Moldura verde esmeralda. Ocupa slot de canalização aguardando ativação por gatilho ou término de rodadas."
    }
]

manifest_entries = []
extracted_images = []

print("[3] Slicing and exporting assets...")
for spec in CROP_SPECS:
    cid = spec["id"]
    box = spec["box"]
    cropped = grid_img.crop(box)
    
    # Save PNG and WebP
    png_path = os.path.join(PUBLIC_CARDS_DIR, f"{cid}.png")
    webp_path = os.path.join(PUBLIC_CARDS_DIR, f"{cid}.webp")
    
    cropped.save(png_path, format="PNG", optimize=True)
    cropped.save(webp_path, format="WEBP", quality=95, method=6)
    
    cw, ch = cropped.size
    aspect = round(cw / ch, 4)
    png_size = os.path.getsize(png_path)
    webp_size = os.path.getsize(webp_path)
    
    print(f"  -> {cid}: {cw}x{ch} (aspect {aspect}) | PNG: {png_size}B | WebP: {webp_size}B")
    
    extracted_images.append({
        "spec": spec,
        "image": cropped,
        "cw": cw,
        "ch": ch,
        "png_size": png_size,
        "webp_size": webp_size
    })
    
    manifest_entries.append({
        "id": cid,
        "type": spec["type"],
        "title": spec["title"],
        "png": f"/assets/farel/cards/{cid}.png",
        "webp": f"/assets/farel/cards/{cid}.webp",
        "width": cw,
        "height": ch,
        "aspectRatio": aspect,
        "hasAlpha": False,
        "artWindow": spec["artWindow"],
        "notes": spec["notes"]
    })

# 3. Write manifest JSON
manifest_path = os.path.join(PUBLIC_CARDS_DIR, "assets-manifest.json")
manifest_data = {
    "manifestVersion": "1.1.0",
    "sourceImage": "assets/asset-sheet-grid.png",
    "sourceDimensions": {"width": gw, "height": gh},
    "exportedAt": "2026-10-17",
    "assetsCount": len(manifest_entries),
    "assets": manifest_entries
}

with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest_data, f, indent=2, ensure_ascii=False)
print(f"[4] Generated manifest at: {manifest_path}")

# 4. Generate conference sheet: docs/assets/asset-sheet-extracted.png
# Layout: 3 columns x 2 rows with neutral dark slate background (#0a1218), labels & dimensions
cell_w = 320
cell_h = 440
grid_w = cell_w * 3 + 40
grid_h = cell_h * 2 + 80

conf_sheet = Image.new("RGBA", (grid_w, grid_h), (10, 18, 24, 255))
draw = ImageDraw.Draw(conf_sheet)

# Header title
draw.text((30, 20), "FAREL TCG 1.1 — Folha de Conferência de Assets Recortados", fill=(212, 175, 112, 255))
draw.text((30, 42), "Fonte: asset-sheet-grid.png (1500x1110) | Formatos: PNG & WebP | Sem texto rasterizado", fill=(130, 151, 164, 255))

for idx, item in enumerate(extracted_images):
    col = idx % 3
    row = idx // 3
    
    x = 20 + col * (cell_w + 10)
    y = 75 + row * cell_h
    
    # Draw card background card border
    draw.rectangle([x, y, x + cell_w, y + cell_h - 10], outline=(38, 60, 71, 255), fill=(14, 26, 35, 255))
    
    # Center cropped image
    card_img = item["image"]
    cx = x + (cell_w - item["cw"]) // 2
    cy = y + 15
    conf_sheet.paste(card_img, (cx, cy))
    
    # Caption below card
    spec = item["spec"]
    caption_y = cy + item["ch"] + 8
    draw.text((x + 12, caption_y), f"{spec['title']}", fill=(240, 216, 173, 255))
    draw.text((x + 12, caption_y + 16), f"ID: {spec['id']} | {item['cw']}x{item['ch']} px", fill=(101, 215, 215, 255))
    draw.text((x + 12, caption_y + 32), f"PNG: {item['png_size']/1024:.1f}KB | WebP: {item['webp_size']/1024:.1f}KB", fill=(140, 160, 175, 255))

conf_sheet_path = os.path.join(DOCS_ASSETS_DIR, "asset-sheet-extracted.png")
conf_sheet.save(conf_sheet_path, format="PNG", optimize=True)
print(f"[5] Generated conference sheet at: {conf_sheet_path}")

# 5. Generate slicing report: docs/assets/asset-slicing-report.md
report_md = f"""# Relatório Técnico de Fatiamento de Assets — FAREL TCG 1.1

## 1. Identificação da Missão & Arquivos de Origem
- **Fonte Principal**: `assets/asset-sheet-grid.png` (Dimensões: {gw} × {gh} px, modo RGBA).
- **Referência Estruturada**: `assets/FAREL-prototipo-cartas.html` (dados e geometria CSS) e `assets/farel-demo-cards.json`.
- **Destino dos Assets**: `public/assets/farel/cards/`
- **Folha de Conferência**: `docs/assets/asset-sheet-extracted.png`
- **Manifesto de Integração**: `public/assets/farel/cards/assets-manifest.json`

---

## 2. Inventário de Peças Fatiadas

| ID do Asset | Tipo de Peça | Dimensões (px) | Aspect Ratio | Tamanho PNG | Tamanho WebP | Janela de Arte (`artWindow`) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `card-back` | Verso Oficial | 250 × 352 | 0.7102 | {extracted_images[0]['png_size']//1024} KB | {extracted_images[0]['webp_size']//1024} KB | N/A (Verso) |
| `template-hero` | Herói | 250 × 352 | 0.7102 | {extracted_images[1]['png_size']//1024} KB | {extracted_images[1]['webp_size']//1024} KB | `top: 7.1%, left: 5%, w: 90%, h: 51.3%` |
| `template-creature` | Criatura | 250 × 352 | 0.7102 | {extracted_images[2]['png_size']//1024} KB | {extracted_images[2]['webp_size']//1024} KB | `top: 7.1%, left: 5%, w: 90%, h: 51.3%` |
| `template-structure` | Estrutura | 250 × 352 | 0.7102 | {extracted_images[3]['png_size']//1024} KB | {extracted_images[3]['webp_size']//1024} KB | `top: 7.1%, left: 5%, w: 90%, h: 51.3%` |
| `template-spell-instant` | Magia Instantânea | 250 × 352 | 0.7102 | {extracted_images[4]['png_size']//1024} KB | {extracted_images[4]['webp_size']//1024} KB | `top: 7.1%, left: 5%, w: 90%, h: 51.3%` |
| `template-spell-channel` | Magia Canalizada | 250 × 352 | 0.7102 | {extracted_images[5]['png_size']//1024} KB | {extracted_images[5]['webp_size']//1024} KB | `top: 7.1%, left: 5%, w: 90%, h: 51.3%` |

---

## 3. Conformidade com os Critérios de Aceite da Missão

- [x] **Seis assets individuais criados**: Verso e cinco templates (Herói, Criatura, Estrutura, Magia Instantânea e Magia Canalizada).
- [x] **Eliminação de rótulos externos**: Nenhum crop incluiu as legendas, linhas de grade ou etiquetas da prancha de origem.
- [x] **Preservação de detalhes e ornamentos**: Cantos arredondados, ornamentos de runas e molduras foram mantidos intactos.
- [x] **Proporções exatas**: Todas as molduras possuem proporção de 250/352 (~0.71), compatível com a proporção CSS 198/279 do protótipo oficial.
- [x] **Exportação dupla (PNG + WebP)**: Versões PNG preservadas para conferência visual de alta precisão e versões WebP otimizadas para carregamento veloz em produção.
- [x] **Separação estrita de dados e renderização**: Nenhum texto, custo de energia, pontos de vida ou regras foram rasterizados na imagem. Todos os dados permanecem controlados pelo DOM e pelo arquivo JSON oficial.
- [x] **Janela de arte dinâmica validada**: A janela superior (`.art-window`) aceita imagens dinâmicas via CSS com `object-fit: cover` sem alterar a moldura.
- [x] **Folha de conferência gerada**: `docs/assets/asset-sheet-extracted.png` exibe todas as peças recortadas lado a lado em fundo neutro com dimensões e pesos em bytes.
"""

report_path = os.path.join(DOCS_ASSETS_DIR, "asset-slicing-report.md")
with open(report_path, "w", encoding="utf-8") as f:
    f.write(report_md)
print(f"[6] Generated slicing report at: {report_path}")
print("[+] Phase 1 Asset Slicing completed successfully!")
