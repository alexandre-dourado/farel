import os
from pathlib import Path
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENTRADA = PROJECT_ROOT / "assets" / "Galeria de Cartas de Fantasia Épica.png"
SAIDA = PROJECT_ROOT / "public" / "assets" / "farel" / "illustrations"

# Colunas (x1, x2) de cada linha de cartas
LINHA1_X = [(16, 243), (271, 499), (527, 755), (784, 1011), (1040, 1266), (1294, 1521)]
LINHA2_X = LINHA1_X
LINHA3_X = [(74, 328), (359, 614), (645, 891), (922, 1176), (1207, 1461)]

# Altura (y1, y2) de cada linha — só a arte, sem a legenda
LINHA1_Y = (16, 291)
LINHA2_Y = (354, 618)
LINHA3_Y = (680, 926)

nomes = [
    ["heroi_1", "heroi_2", "criatura_1", "criatura_2", "criatura_3", "criatura_4"],
    ["criatura_5", "estrutura_1", "estrutura_2", "estrutura_3", "estrutura_4", "estrutura_5"],
    ["magia_instantanea_1", "magia_instantanea_2", "magia_instantanea_3",
     "magia_canalizada_1", "magia_canalizada_2"],
]
linhas = [(LINHA1_X, LINHA1_Y), (LINHA2_X, LINHA2_Y), (LINHA3_X, LINHA3_Y)]

SAIDA.mkdir(exist_ok=True, parents=True)
print(f"[1] Carregando imagem de origem: {ENTRADA}")
img = Image.open(ENTRADA).convert("RGBA")

# Mapeamento com os IDs de cartas
card_mapping = {
    "heroi_1": "HERO-001",
    "heroi_2": "HERO-002",
    "criatura_1": "CRE-001",
    "criatura_2": "CRE-002",
    "criatura_3": "CRE-003",
    "criatura_4": "CRE-004",
    "criatura_5": "CRE-005",
    "estrutura_1": "GEN-001",
    "estrutura_2": "GEN-002",
    "estrutura_3": "GEN-003",
    "estrutura_4": "GEN-004",
    "estrutura_5": "GEN-005",
    "magia_instantanea_1": "SPL-001",
    "magia_instantanea_2": "SPL-002",
    "magia_instantanea_3": "SPL-003",
    "magia_canalizada_1": "CHN-001",
    "magia_canalizada_2": "CHN-002"
}

manifest_illustrations = []

print("[2] Recortando e exportando as 17 ilustrações...")
for (xs, (y1, y2)), nomes_linha in zip(linhas, nomes):
    for (x1, x2), nome in zip(xs, nomes_linha):
        cropped = img.crop((x1, y1, x2, y2))
        
        # Salva PNG
        png_path = SAIDA / f"{nome}.png"
        cropped.save(png_path, format="PNG", optimize=True)
        
        # Salva WebP
        webp_path = SAIDA / f"{nome}.webp"
        cropped.save(webp_path, format="WEBP", quality=92, method=6)
        
        # Salva também pelo ID da carta para acesso direto
        cid = card_mapping.get(nome)
        if cid:
            cropped.save(SAIDA / f"{cid}.webp", format="WEBP", quality=92, method=6)
            cropped.save(SAIDA / f"{cid}.png", format="PNG", optimize=True)
            
        manifest_illustrations.append({
            "name": nome,
            "cardId": cid,
            "width": cropped.size[0],
            "height": cropped.size[1],
            "png": f"/assets/farel/illustrations/{nome}.png",
            "webp": f"/assets/farel/illustrations/{nome}.webp"
        })
        print(f"  -> Salvo: {nome} ({cropped.size[0]}x{cropped.size[1]} px) -> ID: {cid}")

# Salva manifesto das ilustrações
manifest_file = SAIDA / "illustrations-manifest.json"
import json
with open(manifest_file, "w", encoding="utf-8") as f:
    json.dump({
        "total": len(manifest_illustrations),
        "illustrations": manifest_illustrations
    }, f, indent=2, ensure_ascii=False)

print(f"[3] Manifesto de ilustrações gerado em: {manifest_file}")
print("[+] Fatiamento das 17 ilustrações épicas concluído!")
