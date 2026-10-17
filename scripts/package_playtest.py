import os
import shutil
import zipfile

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
V2_DIR = os.path.join(PROJECT_ROOT, "v2")
GAME_HTML = os.path.join(V2_DIR, "game.html")
BUNDLE_DIR = os.path.join(PROJECT_ROOT, "farel-playtest")
ZIP_PATH = os.path.join(PROJECT_ROOT, "farel-playtest.zip")

os.makedirs(BUNDLE_DIR, exist_ok=True)

# 1. Copy game.html as index.html and FAREL-Playtest.html
shutil.copy2(GAME_HTML, os.path.join(BUNDLE_DIR, "index.html"))
shutil.copy2(GAME_HTML, os.path.join(BUNDLE_DIR, "FAREL-Playtest.html"))

# 2. Create COMO-JOGAR.txt
como_jogar_text = """========================================================================
                      FAREL TCG 1.1 — GUIA DO PLAYTEST
========================================================================

Olá! Este é o pacote de playtest do FAREL TCG 1.1 (Arena de Duelo).
O jogo é 100% standalone e roda direto em qualquer navegador (Chrome, Edge,
Firefox, Brave, Opera, etc.), sem precisar instalar nada nem rodar servidores!

------------------------------------------------------------------------
1. COMO INICIAR O JOGO
------------------------------------------------------------------------
- Basta dar 2 CLIQUES no arquivo "index.html" (ou "FAREL-Playtest.html").
- O jogo abrirá imediatamente em tela cheia estrita (100dvh / zero scroll).

------------------------------------------------------------------------
2. OBJETIVO DO JOGO
------------------------------------------------------------------------
- Cada jogador controla um Herói (Elo Mortal) com Pontos de Vida (PV)
  representados por um ORBE DE SANGUE fluido estilo RPG/Diablo.
  * Jogador 1 (Viajante do Limiar): 12 PV
  * Jogador 2 (Imperatriz das Eras): 14 PV
- O objetivo é zerar os Pontos de Vida do Herói adversário.

------------------------------------------------------------------------
3. COMO JOGAR (MODO HOTSEAT - 2 JOGADORES NA MESMA TELA)
------------------------------------------------------------------------
- Cada jogador tem sua vez de jogar (Turno).
- No seu turno:
  1. ENERGIA: Você ganha +2 de Energia por turno (indicado no Orbe Ciano).
  2. INVOCAR CARTAS: Clique em uma carta da sua mão (rodapé).
     - Se tiver energia suficiente, as casas do tabuleiro compatíveis
       começarão a piscar em verde/ciano.
     - Clique na casa desejada (Criaturas na fileira frontal,
       Estruturas na fileira traseira).
  3. INSPECIONAR CARTAS: Passe o mouse sobre qualquer carta (da mão ou do
     tabuleiro) para vê-la ampliada em alta resolução no Inspecionador
     Lateral esquerdo (estilo Yu-Gi-Oh Forbidden Memories).
  4. COMBATE: Quando terminar suas jogadas, clique no botão dourado
     "⚔️ Passar Turno & Resolver Duelo" no topo da tela.

------------------------------------------------------------------------
4. MECÂNICA DE COMBATE E ROLAGEM DE DADOS (d6)
------------------------------------------------------------------------
- Ao passar o turno, cada criatura sua que estiver em campo rola um d6
  (dado de 6 faces) e ataca na sua respectiva Faixa (Lanes 1 a 5).
- PRIORIDADE DE IMPACTO DO ATAQUE:
  1º Criatura inimiga na mesma faixa.
  2º Se não houver criatura inimiga, atinge a Estrutura inimiga da faixa.
  3º Se a faixa estiver totalmente livre, o dano vai DIRETO no Herói inimigo!
- NÚMEROS FLUTUANTES: Você verá o dano subindo na tela e o orbe de sangue
  do alvo borbulhando e diminuindo em tempo real.
- INTERCEPÇÃO DO HERÓI (OPCIONAL): Se a caixa "Intercepção do Herói"
  estiver marcada no topo, o Herói intercepta os ataques para proteger
  suas tropas.
- GIRO 180°: Por padrão, a cada turno a tela gira 180° para que o jogador
  da vez fique com sua perspectiva correta de frente para ele (ideal para
  jogar em notebooks ou tablets colocados entre os dois). Você pode desativar
  ou girar manualmente no botão "180°".

Divirta-se jogando e bom duelo!
========================================================================
"""

with open(os.path.join(BUNDLE_DIR, "COMO-JOGAR.txt"), "w", encoding="utf-8") as f:
    f.write(como_jogar_text)

# 3. Create REGRAS-E-CARTAS.txt
regras_cartas_text = """========================================================================
                  FAREL TCG 1.1 — CARTAS DA BIBLIOTECA MVP
========================================================================

[HERÓIS / ELO MORTAL]
- HERO-001: Viajante do Limiar (12 PV, 0 Energia)
- HERO-002: Imperatriz das Eras (14 PV, 0 Energia)

[CRIATURAS TÁTICAS]
- CRE-001: Legionário de Bronze (Custo 2, Vida 4) - Soldado resistente
- CRE-002: Arqueira do Bosque (Custo 2, Vida 3) - Ataque rápido
- CRE-003: Golem de Obsidiana (Custo 4, Vida 6) - Tanque pesado
- CRE-004: Espectro da Névoa (Custo 3, Vida 3) - Criatura etérea
- CRE-005: Draconiano Voraz (Custo 5, Vida 7) - Poder devastador

[ESTRUTURAS GERADORAS]
- GEN-001 a GEN-005: Obeliscos, Fontes de Mana e Bastiões que produzem
  recursos táticos e absorvem impactos caso a criatura seja destruída.

[MAGIAS INSTANTÂNEAS E CANALIZADAS]
- SPL-001 a SPL-003: Relâmpago Tático, Escudo Rúnico, Chama Purificadora.
- CHN-001 a CHN-002: Tempestade Contínua, Elo de Regeneração.

Todas as cartas contam com as artes épicas fatiadas e molduras ornamentadas.
========================================================================
"""

with open(os.path.join(BUNDLE_DIR, "REGRAS-E-CARTAS.txt"), "w", encoding="utf-8") as f:
    f.write(regras_cartas_text)

# 4. Zip the entire bundle
with zipfile.ZipFile(ZIP_PATH, "w", zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(BUNDLE_DIR):
        for file in files:
            full_path = os.path.join(root, file)
            arcname = os.path.relpath(full_path, PROJECT_ROOT)
            zipf.write(full_path, arcname)

bundle_size = sum(os.path.getsize(os.path.join(BUNDLE_DIR, f)) for f in os.listdir(BUNDLE_DIR))
zip_size = os.path.getsize(ZIP_PATH)

print(f"[+] Pasta criada: {BUNDLE_DIR}")
print(f"    Arquivos: {os.listdir(BUNDLE_DIR)}")
print(f"    Tamanho total da pasta: {bundle_size // 1024} KB")
print(f"[+] Arquivo ZIP gerado: {ZIP_PATH} ({zip_size // 1024} KB)")
