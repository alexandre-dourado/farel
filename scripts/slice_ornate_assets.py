import os
import json
from PIL import Image, ImageDraw, ImageFont

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SOURCE_SHEET = r"C:\Users\55389\Downloads\Folha de Cartas Fantásticas Ornamentadas.png"
PUBLIC_CARDS_DIR = os.path.join(PROJECT_ROOT, "public", "assets", "farel", "cards")
DOCS_ASSETS_DIR = os.path.join(PROJECT_ROOT, "docs", "assets")

os.makedirs(PUBLIC_CARDS_DIR, exist_ok=True)
os.makedirs(DOCS_ASSETS_DIR, exist_ok=True)

img = Image.open(SOURCE_SHEET).convert("RGBA")
gw, gh = img.size
print(f"[1] Carregou a prancha transparente: {SOURCE_SHEET} ({gw}x{gh} RGBA)")

# Coordenadas tight recortadas logo acima das placas de texto
CROPS = [
    {
        "id": "card-back",
        "type": "back",
        "title": "Verso Oficial Fantástico",
        "box": (218, 25, 520, 422),
        "artWindow": None,
        "notes": "Verso rúnico azul profundo e dourado com fundo transparente externo."
    },
    {
        "id": "template-hero",
        "type": "hero",
        "title": "Herói (Elo Mortal)",
        "box": (598, 25, 938, 422),
        "artWindow": {"x": 0.07, "y": 0.08, "width": 0.86, "height": 0.44},
        "notes": "Moldura régia de ouro antigo com fundo transparente e ornamentos nas quinas."
    },
    {
        "id": "template-creature",
        "type": "creature",
        "title": "Criatura Tática",
        "box": (1015, 25, 1321, 422),
        "artWindow": {"x": 0.07, "y": 0.08, "width": 0.86, "height": 0.44},
        "notes": "Moldura esmeralda com selo rúnico foliar e bordas externas transparentes."
    },
    {
        "id": "template-structure",
        "type": "structure",
        "title": "Estrutura Geradora",
        "box": (215, 530, 523, 932),
        "artWindow": {"x": 0.07, "y": 0.08, "width": 0.86, "height": 0.44},
        "notes": "Moldura em pedra/prata rúnica com ícone de fortaleza e bordas transparentes."
    },
    {
        "id": "template-spell-instant",
        "type": "spell-instant",
        "title": "Magia Instantânea",
        "box": (602, 530, 934, 932),
        "artWindow": {"x": 0.07, "y": 0.08, "width": 0.86, "height": 0.44},
        "notes": "Moldura de chamas carmesim com ícone de fogo e bordas transparentes."
    },
    {
        "id": "template-spell-channel",
        "type": "spell-channel",
        "title": "Magia Canalizada",
        "box": (1016, 530, 1324, 932),
        "artWindow": {"x": 0.07, "y": 0.08, "width": 0.86, "height": 0.44},
        "notes": "Moldura de ametista arcana com espiral de invocação e bordas transparentes."
    }
]

manifest_entries = []
extracted = []

print("[2] Fatiando e exportando as 6 molduras com canal Alpha (RGBA)...")
for spec in CROPS:
    cid = spec["id"]
    box = spec["box"]
    cropped = img.crop(box)
    
    png_path = os.path.join(PUBLIC_CARDS_DIR, f"{cid}.png")
    webp_path = os.path.join(PUBLIC_CARDS_DIR, f"{cid}.webp")
    
    # Salva com canal alpha real
    cropped.save(png_path, format="PNG", optimize=True)
    cropped.save(webp_path, format="WEBP", quality=95, method=6)
    
    cw, ch = cropped.size
    aspect = round(cw / ch, 4)
    png_size = os.path.getsize(png_path)
    webp_size = os.path.getsize(webp_path)
    
    print(f"  -> {cid}: {cw}x{ch} (aspect {aspect}) | PNG: {png_size}B | WebP: {webp_size}B | Alpha=True")
    
    extracted.append({
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
        "hasAlpha": True,
        "artWindow": spec["artWindow"],
        "notes": spec["notes"]
    })

# 3. Atualizar Manifesto
manifest_path = os.path.join(PUBLIC_CARDS_DIR, "assets-manifest.json")
manifest_data = {
    "manifestVersion": "1.2.0",
    "sourceImage": "Folha de Cartas Fantásticas Ornamentadas.png",
    "sourceDimensions": {"width": gw, "height": gh},
    "exportedAt": "2026-10-17",
    "hasTransparentBackground": True,
    "assetsCount": len(manifest_entries),
    "assets": manifest_entries
}

with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest_data, f, indent=2, ensure_ascii=False)
print(f"[3] Manifesto atualizado em: {manifest_path}")

# 4. Gerar Folha de Conferência: docs/assets/asset-sheet-ornate-extracted.png
cell_w = 380
cell_h = 490
grid_w = cell_w * 3 + 40
grid_h = cell_h * 2 + 80

conf_sheet = Image.new("RGBA", (grid_w, grid_h), (8, 15, 20, 255))
draw = ImageDraw.Draw(conf_sheet)

draw.text((30, 20), "FAREL TCG 1.1 — Folha de Cartas Fantásticas Ornamentadas (Fundo Transparente)", fill=(212, 175, 112, 255))
draw.text((30, 42), "Fonte: Folha de Cartas Fantásticas Ornamentadas.png (1536x1024 RGBA) | Isoladas das legendas", fill=(130, 151, 164, 255))

for idx, item in enumerate(extracted):
    col = idx % 3
    row = idx // 3
    
    x = 20 + col * (cell_w + 10)
    y = 75 + row * cell_h
    
    # Fundo do cartão de conferência com padrão xadrez suave para demonstrar a transparência
    draw.rectangle([x, y, x + cell_w, y + cell_h - 10], outline=(38, 60, 71, 255), fill=(13, 24, 32, 255))
    
    card_img = item["image"]
    cx = x + (cell_w - item["cw"]) // 2
    cy = y + 15
    conf_sheet.alpha_composite(card_img, (cx, cy))
    
    spec = item["spec"]
    caption_y = cy + item["ch"] + 10
    draw.text((x + 12, caption_y), f"{spec['title']}", fill=(240, 216, 173, 255))
    draw.text((x + 12, caption_y + 16), f"ID: {spec['id']} | {item['cw']}x{item['ch']} px (Alpha Real)", fill=(67, 217, 196, 255))
    draw.text((x + 12, caption_y + 32), f"PNG: {item['png_size']//1024}KB | WebP: {item['webp_size']//1024}KB", fill=(140, 160, 175, 255))

conf_sheet_path = os.path.join(DOCS_ASSETS_DIR, "asset-sheet-ornate-extracted.png")
conf_sheet.save(conf_sheet_path, format="PNG", optimize=True)
print(f"[4] Folha de conferência gerada em: {conf_sheet_path}")
print("[+] Fase 1 Fatiamento Ornato concluído com sucesso!")
