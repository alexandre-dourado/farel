import os
import json
import base64
import re

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ASSETS_DIR = os.path.join(PROJECT_ROOT, "assets")
PUBLIC_CARDS_DIR = os.path.join(PROJECT_ROOT, "public", "assets", "farel", "cards")
PUBLIC_ILLUSTRATIONS_DIR = os.path.join(PROJECT_ROOT, "public", "assets", "farel", "illustrations")
PROTOTYPE_HTML = os.path.join(ASSETS_DIR, "FAREL-prototipo-cartas.html")
CARDS_JSON = os.path.join(ASSETS_DIR, "farel-demo-cards.json")
OUTPUT_HTML = os.path.join(PROJECT_ROOT, "v2", "game.html")

# Read cards
with open(CARDS_JSON, "r", encoding="utf-8") as f:
    cards_data = json.load(f)

# Read art assets from prototype as fallback
with open(PROTOTYPE_HTML, "r", encoding="utf-8") as f:
    proto_content = f.read()

m = re.search(r"const ASSETS = ({.*?});", proto_content, re.DOTALL)
if m:
    proto_assets = json.loads(m.group(1))
    art_dict = proto_assets.get("art", {})
else:
    art_dict = {}

# Encode frames from public/assets/farel/cards/*.webp to base64
def to_b64_uri(filename):
    filepath = os.path.join(PUBLIC_CARDS_DIR, filename)
    if os.path.exists(filepath):
        with open(filepath, "rb") as f:
            data = f.read()
        return "data:image/webp;base64," + base64.b64encode(data).decode("ascii")
    return ""

new_frames = {
    "hero": to_b64_uri("template-hero.webp"),
    "creature": to_b64_uri("template-creature.webp"),
    "generator": to_b64_uri("template-structure.webp"),
    "spell": to_b64_uri("template-spell-instant.webp"),
    "channelled_spell": to_b64_uri("template-spell-channel.webp")
}
new_back = to_b64_uri("card-back.webp")

# Encode all sliced illustrations from public/assets/farel/illustrations/*.webp
illustrations_b64 = {}
if os.path.exists(PUBLIC_ILLUSTRATIONS_DIR):
    for fn in os.listdir(PUBLIC_ILLUSTRATIONS_DIR):
        if fn.endswith(".webp"):
            cid = os.path.splitext(fn)[0]
            with open(os.path.join(PUBLIC_ILLUSTRATIONS_DIR, fn), "rb") as f:
                illustrations_b64[cid] = "data:image/webp;base64," + base64.b64encode(f.read()).decode("ascii")

assets_payload = {
    "back": new_back,
    "frames": new_frames,
    "illustrations": illustrations_b64,
    "art": art_dict
}
assets_json_str = json.dumps(assets_payload)

standalone_html = f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<meta name="theme-color" content="#071017">
<title>FAREL TCG 1.1 — Arena de Duelo (Orbes de Sangue & Forbidden Memories)</title>
<meta name="description" content="MVP oficial do jogo FAREL TCG 1.1 em tela cheia estrita (100dvh / zero scroll) com arte épica fatiada, pedestais de cartas verticais, orbes de sangue fluido e modo Hotseat 180°.">
<meta property="og:title" content="FAREL TCG 1.1 — Arena de Duelo">
<meta property="og:description" content="Duelo TCG tático com orbes de sangue estilo Diablo e dados d6 em tela cheia estrita.">
<meta property="og:image" content="thumbnail.webp">

<style>
:root {{
  --bg: #071017;
  --panel-bg: #0c151c;
  --gold: #d4af70;
  --gold-dim: #76613e;
  --line: rgba(190, 164, 112, 0.24);
  --text: #f2eee5;
  --teal: #43d9c4;
  --crimson: #e02424;
}}

* {{
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}}

html, body {{
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: var(--bg);
  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  user-select: none;
}}

.app-container {{
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}}

/* Barra Superior */
.top-bar {{
  height: 44px;
  min-height: 44px;
  background: rgba(13, 23, 32, 0.95);
  border-bottom: 1px solid var(--line);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  z-index: 30;
}}

.btn {{
  border: 1px solid #344b57;
  background: linear-gradient(180deg, #182a34, #0e1a22);
  color: #dce6e9;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}}

.btn:hover {{
  border-color: var(--gold);
  color: #fff;
}}

.btn-primary {{
  background: linear-gradient(180deg, #f2d08a, #d4af70);
  border-color: #ffdca8;
  color: #081116;
  font-weight: bold;
  box-shadow: 0 0 10px rgba(212, 175, 112, 0.3);
}}

/* Arena Central */
.duel-arena {{
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  position: relative;
}}

/* Inspecionador Lateral PS1 */
.ps1-sidebar {{
  width: 330px;
  min-width: 310px;
  max-width: 350px;
  height: 100%;
  background: #09131a;
  border-right: 1px solid var(--line);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  z-index: 20;
}}

.ps1-card {{
  width: 255px;
  aspect-ratio: 198 / 279;
  position: relative;
  background-size: 100% 100%;
  background-position: center;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 14px 35px rgba(0,0,0,0.85);
  margin: 0 auto;
}}

.art-window {{
  position: absolute;
  left: 7%;
  top: 8%;
  width: 86%;
  height: 44%;
  overflow: hidden;
  z-index: 1;
  background: #0b1218;
}}

.art-window img {{
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}}

.cost-orb {{
  position: absolute;
  z-index: 5;
  top: 2.8%;
  left: 5%;
  width: 42px;
  height: 42px;
  aspect-ratio: 1;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff6dc;
  font-family: Georgia, serif;
  font-weight: 700;
  font-size: 18px;
  background: radial-gradient(circle at 35% 25%, #293a42, #071016 70%);
  border: 1.5px solid #d9b76e;
  box-shadow: 0 0 0 2px rgba(9, 12, 14, 0.8), 0 2px 10px #000;
}}

.card-name-text {{
  position: absolute;
  z-index: 3;
  top: 53.5%;
  left: 8%;
  width: 84%;
  height: 7.5%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: Georgia, serif;
  color: #fff5df;
  font-size: 13px;
  font-weight: bold;
  text-shadow: 0 2px 4px #000;
  overflow: hidden;
}}

.card-type-text {{
  position: absolute;
  z-index: 3;
  top: 61.5%;
  left: 10%;
  width: 80%;
  height: 5.7%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  font-size: 9px;
  text-shadow: 0 1px 3px #000;
}}

.card-rules-text {{
  position: absolute;
  z-index: 3;
  top: 68.5%;
  left: 9%;
  width: 82%;
  height: 19.5%;
  font-size: 9.5px;
  line-height: 1.25;
  color: #e3e4dc;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  text-shadow: 0 1px 3px #000;
}}

/* ============================================================== */
/* ORBES DE SANGUE E ENERGIA (ESTILO DIABLO / RPG)                */
/* ============================================================== */
.blood-orb {{
  position: relative;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(180deg, #7a3a2e, #290a07);
  box-shadow: 0 4px 15px rgba(0,0,0,0.8), 0 0 12px rgba(220, 20, 20, 0.4);
}}

.blood-orb-inner {{
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  background: #0d0404;
  border: 1px solid rgba(255, 140, 120, 0.3);
  box-shadow: inset 0 0 15px #000;
}}

.blood-liquid {{
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, #360202 0%, #7d0a0a 45%, #b51919 80%, #fa3434 100%);
  box-shadow: 0 -2px 10px rgba(255, 60, 60, 0.6);
  transition: height 0.6s cubic-bezier(0.34, 1.4, 0.64, 1);
}}

.blood-wave {{
  position: absolute;
  top: -6px;
  left: -50%;
  width: 200%;
  height: 12px;
  background: radial-gradient(ellipse at center, rgba(255,100,100,0.9) 0%, rgba(200,20,20,0) 70%);
  animation: fluid-wave 3.5s linear infinite;
}}

.energy-orb {{
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  padding: 2.5px;
  background: linear-gradient(180deg, #2b616b, #091a1f);
  box-shadow: 0 4px 15px rgba(0,0,0,0.8), 0 0 12px rgba(67, 217, 196, 0.4);
}}

.energy-orb-inner {{
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  background: #041014;
  border: 1px solid rgba(100, 240, 220, 0.3);
  box-shadow: inset 0 0 15px #000;
}}

.energy-liquid {{
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, #093438 0%, #156d78 40%, #2fb8c4 80%, #5af7e4 100%);
  box-shadow: 0 -2px 10px rgba(67, 217, 196, 0.7);
  transition: height 0.5s ease-out;
}}

.orb-reflection {{
  position: absolute;
  inset: 0;
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(circle at 35% 25%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 35%, transparent 60%);
}}

.orb-text {{
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: Georgia, serif;
  font-weight: 900;
  color: #fff;
  z-index: 10;
  text-shadow: 0 0 8px rgba(0,0,0,0.9), 0 2px 4px #000;
}}

@keyframes fluid-wave {{
  0% {{ transform: rotate(0deg); }}
  100% {{ transform: rotate(360deg); }}
}}

@keyframes damage-flash {{
  0% {{ filter: brightness(2) drop-shadow(0 0 30px #ff2222); transform: scale(0.92); }}
  25% {{ transform: translateX(-4px) rotate(-3deg); }}
  50% {{ transform: translateX(4px) rotate(3deg); }}
  75% {{ transform: translateX(-2px); }}
  100% {{ filter: brightness(1); transform: scale(1); }}
}}

.blood-orb-hit {{
  animation: damage-flash 0.55s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}}

/* Números Flutuantes de Combate */
@keyframes float-combat-text {{
  0% {{ opacity: 0; transform: translateY(0) scale(0.6); }}
  20% {{ opacity: 1; transform: translateY(-16px) scale(1.25); }}
  80% {{ opacity: 1; transform: translateY(-40px) scale(1); }}
  100% {{ opacity: 0; transform: translateY(-56px) scale(0.85); }}
}}

.floating-text {{
  position: absolute;
  top: 48%;
  font-family: Georgia, serif;
  font-weight: 900;
  padding: 4px 12px;
  border-radius: 20px;
  pointer-events: none;
  z-index: 50;
  animation: float-combat-text 1.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  box-shadow: 0 4px 15px rgba(0,0,0,0.8);
}}

/* Tabuleiro Central Tático */
.board-wrapper {{
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 6px 14px;
  position: relative;
}}

.hotseat-board {{
  width: 100%;
  height: calc(100% - 98px);
  max-width: 980px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.6s cubic-bezier(0.34, 1.25, 0.64, 1);
  transform-style: preserve-3d;
}}

.hotseat-flipped {{
  transform: rotate(180deg);
}}

.hotseat-flipped .counter-rotate {{
  transform: rotate(180deg);
}}

.player-field {{
  background: rgba(9, 17, 23, 0.92);
  border: 1px solid #1f313e;
  border-radius: 10px;
  padding: 5px 8px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}}

.row-slots {{
  display: flex;
  gap: 6px;
  justify-content: space-between;
}}

/* Pedestais de Cartas Verticais */
.slot {{
  flex: 1;
  max-width: 135px;
  height: 86px;
  background: rgba(11, 20, 27, 0.9);
  border: 1px solid #203340;
  border-radius: 8px;
  padding: 3px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}}

.slot:hover {{
  border-color: #4a6a80;
  transform: translateY(-2px);
}}

.slot.creature {{
  border-color: rgba(224, 106, 98, 0.35);
}}

.slot.structure {{
  border-color: rgba(85, 204, 232, 0.35);
}}

.slot.has-card {{
  border-color: #385366;
  box-shadow: 0 4px 14px rgba(0,0,0,0.65);
}}

.slot.can-summon {{
  border: 2px dashed #43d9c4 !important;
  background: rgba(20, 38, 31, 0.8) !important;
  box-shadow: 0 0 15px rgba(67, 217, 196, 0.4);
  animation: pulse-border 1.5s infinite;
}}

@keyframes pulse-border {{
  0%, 100% {{ opacity: 1; }}
  50% {{ opacity: 0.6; }}
}}

/* Soquetes de Talismã de Canalização */
.channel-socket {{
  width: 42px;
  max-width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1.5px dashed rgba(67, 217, 196, 0.4);
  background: rgba(7, 16, 21, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}}

.channel-socket:hover {{
  border-color: #43d9c4;
  box-shadow: 0 0 10px rgba(67, 217, 196, 0.3);
}}

/* Faixas Centrais */
.combat-lanes {{
  background: rgba(10, 21, 29, 0.95);
  border: 1px solid #2a3e4c;
  border-radius: 6px;
  padding: 4px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: monospace;
  font-size: 10px;
  color: var(--gold);
}}

.lanes-grid {{
  flex: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin: 0 12px;
  text-align: center;
}}

.lane-indicator {{
  background: #121f29;
  border: 1px solid #223746;
  border-radius: 4px;
  padding: 2px 0;
  color: #92b4c7;
  font-weight: bold;
}}

/* Bandeja de Mão */
.hand-tray {{
  height: 94px;
  min-height: 94px;
  background: rgba(9, 19, 26, 0.95);
  border-top: 1px solid #223644;
  padding: 4px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 20;
}}

.hand-cards {{
  flex: 1;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 2px 0;
}}

.hand-card {{
  width: 62px;
  min-width: 62px;
  height: 82px;
  background: #09131a;
  border: 1px solid #385366;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  transition: all 0.15s ease;
  user-select: none;
}}

.hand-card:hover {{
  border-color: var(--gold);
  transform: translateY(-5px);
  box-shadow: 0 4px 14px rgba(0,0,0,0.8);
}}

.hand-card.selected {{
  border-color: var(--teal) !important;
  box-shadow: 0 0 16px rgba(67, 217, 196, 0.7) !important;
  transform: translateY(-8px) scale(1.06);
  z-index: 20;
}}

.hand-card.disabled {{
  opacity: 0.5;
}}

/* Painéis de Dados e Log */
.dice-panel {{
  background: #0e1820;
  border: 1px solid #223746;
  border-radius: 6px;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}}

.dice-box {{
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #1b2d39, #0a1318);
  border: 2px solid var(--gold);
  border-radius: 6px;
  display: grid;
  place-items: center;
  font-family: Georgia, serif;
  font-size: 20px;
  font-weight: bold;
  color: #ffd580;
  box-shadow: inset 0 0 6px rgba(0,0,0,0.8);
}}

.log-box {{
  height: 80px;
  background: #060b0e;
  border: 1px solid #1a2a35;
  border-radius: 6px;
  padding: 6px;
  font-family: monospace;
  font-size: 9px;
  line-height: 1.35;
  color: #8da4b3;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 3px;
}}
</style>
</head>
<body>

<div class="app-container">
  <!-- Top Bar -->
  <header class="top-bar">
    <div style="display:flex; align-items:center; gap:8px">
      <span style="font-family:Georgia,serif; font-size:14px; font-weight:bold; color:var(--gold); letter-spacing:0.05em">FAREL TCG 1.1</span>
      <span style="color:#4a687a">|</span>
      <span id="turnLabel" style="font-family:monospace; color:#8faac0; font-size:11px">Turno 1</span>
      <span id="activePlayerLabel" style="font-family:monospace; color:var(--teal); font-size:11px">• Jogador 1 (Viajante do Limiar)</span>
    </div>

    <!-- Controles Hotseat e Regras -->
    <div style="display:flex; align-items:center; gap:10px">
      <label style="display:inline-flex; align-items:center; gap:5px; font-size:10px; color:#9db2be; cursor:pointer">
        <input type="checkbox" id="autoFlipToggle" checked>
        Girar 180° no Turno
      </label>

      <button class="btn" id="manualFlipBtn" type="button" title="Girar tabuleiro 180 graus">
        <span>🔄</span> <span id="flipBtnText">180° (P1)</span>
      </button>

      <label style="display:inline-flex; align-items:center; gap:5px; font-size:10px; color:#e08577; cursor:pointer" title="Se marcado, dano recebido vai direto pro herói">
        <input type="checkbox" id="heroInterceptToggle">
        Intercepção do Herói
      </label>

      <button class="btn btn-primary" id="endTurnBtn" type="button">
        ⚔️ Passar Turno & Resolver Duelo
      </button>
    </div>
  </header>

  <!-- Central Duel Arena -->
  <div class="duel-arena">
    <!-- Lateral PS1 Inspector -->
    <aside class="ps1-sidebar">
      <div style="display:flex; align-items:center; justify-content:space-between">
        <span style="font-family:Georgia,serif; font-size:11px; font-weight:bold; color:var(--gold); letter-spacing:0.06em">INSPECIONADOR PS1</span>
        <span id="cardIdTag" style="font-size:9px; font-family:monospace; color:#7d96a6">HERO-001</span>
      </div>

      <!-- Grande Carta Renderizada 3D / PS1 -->
      <div style="display:flex; justify-content:center; align-items:center; flex:1">
        <div class="ps1-card" id="largeCard">
          <div class="art-window">
            <img id="cardArtImg" src="" alt="Arte da Carta">
          </div>
          <div class="cost-orb" id="cardCost">0</div>
          <div class="card-name-text" id="cardName">Viajante do Limiar</div>
          <div class="card-type-text" id="cardType" style="color:#d4af70">HERÓI · ELO MORTAL</div>
          <div class="card-rules-text" id="cardRules">Seu elo com o mundo mortal. Se sua vida chegar a zero, você perde a partida.</div>
          
          <!-- Mini Blood Orb no Rodapé da Carta Inspecionada -->
          <div id="cardLifeContainer" style="position:absolute; right:4%; bottom:2.5%; z-index:20">
            <div class="blood-orb" style="width:42px; height:42px">
              <div class="blood-orb-inner">
                <div class="blood-liquid" id="inspectorBloodLiquid" style="height:100%"></div>
                <div class="orb-reflection"></div>
                <div class="orb-text" id="cardLifeText" style="font-size:14px">12</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- D6 Roller -->
      <div class="dice-panel">
        <div class="dice-box" id="diceBox">-</div>
        <div style="flex:1">
          <div style="font-size:11px; color:#d9e5eb" id="diceStatus">Aguardando combate</div>
          <div style="font-size:9px; color:#748d9c; font-family:monospace">d6 + Bônus = Dano Total</div>
        </div>
        <button class="btn" id="rollDiceBtn" type="button" style="padding:4px 8px; font-size:10px">Rolar d6</button>
      </div>

      <!-- Battle Log -->
      <div class="log-box" id="logBox">
        <div>[T1] Duelo iniciado com Orbes de Sangue Líquido estilo Diablo e Ilustrações Épicas.</div>
      </div>
    </aside>

    <!-- Center Board Wrapper -->
    <main class="board-wrapper">
      <div id="floatingLayer"></div>

      <div class="hotseat-board" id="hotseatBoard">
        <!-- Opponent (P2) -->
        <div class="player-field">
          <!-- Hero Pedestal + Orbes de Sangue e Mana + Canais -->
          <div class="row-slots" style="align-items:center; background:linear-gradient(90deg, #1f1111, #0f1922); padding:5px 8px; border-radius:8px; border:1px solid #3d2321">
            <div style="display:flex; align-items:center; gap:10px; flex:1">
              <div class="counter-rotate" id="p2HeroAvatar" style="width:40px; height:40px; border-radius:50%; border:1.5px solid #d4af70; overflow:hidden; background:#071017">
                <img id="p2HeroImg" src="" style="width:100%; height:100%; object-fit:cover" alt="Heroi P2">
              </div>
              <div class="counter-rotate">
                <div style="font-family:Georgia,serif; font-size:12px; font-weight:bold; color:#ffddd6">Imperatriz das Eras</div>
                <div style="font-size:8.5px; font-family:monospace; color:#a3625b; font-weight:bold">HERÓI ADVERSÁRIO (P2)</div>
              </div>
            </div>

            <!-- Canais P2 -->
            <div style="display:flex; gap:6px; align-items:center">
              <div class="channel-socket" id="p2-chn-0" title="Soquete de Canal 1"><span class="counter-rotate" style="font-size:8px; color:#4a6f56">⚡1</span></div>
              <div class="channel-socket" id="p2-chn-1" title="Soquete de Canal 2"><span class="counter-rotate" style="font-size:8px; color:#4a6f56">⚡2</span></div>
              <div class="channel-socket" id="p2-chn-2" title="Soquete de Canal 3"><span class="counter-rotate" style="font-size:8px; color:#4a6f56">⚡3</span></div>
            </div>

            <!-- Orbe de Mana P2 -->
            <div class="counter-rotate">
              <div class="energy-orb">
                <div class="energy-orb-inner">
                  <div class="energy-liquid" id="p2EnergyLiquid" style="height:50%"></div>
                  <div class="orb-reflection"></div>
                  <div class="orb-text">
                    <span id="p2EnergyText" style="font-size:16px">5</span>
                    <span style="font-size:7.5px; color:#a0fff0">⚡</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Orbe de Sangue Líquido P2 -->
            <div class="counter-rotate">
              <div class="blood-orb" id="p2BloodOrb">
                <div class="blood-orb-inner">
                  <div class="blood-liquid" id="p2BloodLiquid" style="height:100%">
                    <div class="blood-wave"></div>
                  </div>
                  <div class="orb-reflection"></div>
                  <div class="orb-text">
                    <span id="p2HpText" style="font-size:19px">14</span>
                    <span style="font-size:7px; opacity:0.8">/ 14 PV</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 5 Structures P2 -->
          <div class="row-slots">
            <div class="slot structure" id="p2-str-0"><div class="counter-rotate" style="font-size:8px; color:#315d6e; text-align:center">Estrutura 1</div></div>
            <div class="slot structure" id="p2-str-1"><div class="counter-rotate" style="font-size:8px; color:#315d6e; text-align:center">Estrutura 2</div></div>
            <div class="slot structure" id="p2-str-2"><div class="counter-rotate" style="font-size:8px; color:#315d6e; text-align:center">Estrutura 3</div></div>
            <div class="slot structure" id="p2-str-3"><div class="counter-rotate" style="font-size:8px; color:#315d6e; text-align:center">Estrutura 4</div></div>
            <div class="slot structure" id="p2-str-4"><div class="counter-rotate" style="font-size:8px; color:#315d6e; text-align:center">Estrutura 5</div></div>
          </div>

          <!-- 5 Creatures P2 -->
          <div class="row-slots">
            <div class="slot creature" id="p2-cre-0"><div class="counter-rotate" style="font-size:8px; color:#6e3935; text-align:center">Criatura 1</div></div>
            <div class="slot creature" id="p2-cre-1"><div class="counter-rotate" style="font-size:8px; color:#6e3935; text-align:center">Criatura 2</div></div>
            <div class="slot creature" id="p2-cre-2"><div class="counter-rotate" style="font-size:8px; color:#6e3935; text-align:center">Criatura 3</div></div>
            <div class="slot creature" id="p2-cre-3"><div class="counter-rotate" style="font-size:8px; color:#6e3935; text-align:center">Criatura 4</div></div>
            <div class="slot creature" id="p2-cre-4"><div class="counter-rotate" style="font-size:8px; color:#6e3935; text-align:center">Criatura 5</div></div>
          </div>
        </div>

        <!-- Central Combat Lanes -->
        <div class="combat-lanes">
          <span style="font-weight:bold">⚔️ Faixas:</span>
          <div class="lanes-grid">
            <div class="lane-indicator counter-rotate">Faixa 1 ➔</div>
            <div class="lane-indicator counter-rotate">Faixa 2 ➔</div>
            <div class="lane-indicator counter-rotate">Faixa 3 ➔</div>
            <div class="lane-indicator counter-rotate">Faixa 4 ➔</div>
            <div class="lane-indicator counter-rotate">Faixa 5 ➔</div>
          </div>
          <span style="font-size:8px; color:#708b99">Prioridade: Criatura ➔ Estrutura ➔ Herói</span>
        </div>

        <!-- Active Player (P1) -->
        <div class="player-field">
          <!-- 5 Creatures P1 -->
          <div class="row-slots">
            <div class="slot creature" id="p1-cre-0"><div class="counter-rotate" style="font-size:8px; color:#6e3935; text-align:center">Criatura 1</div></div>
            <div class="slot creature" id="p1-cre-1"><div class="counter-rotate" style="font-size:8px; color:#6e3935; text-align:center">Criatura 2</div></div>
            <div class="slot creature" id="p1-cre-2"><div class="counter-rotate" style="font-size:8px; color:#6e3935; text-align:center">Criatura 3</div></div>
            <div class="slot creature" id="p1-cre-3"><div class="counter-rotate" style="font-size:8px; color:#6e3935; text-align:center">Criatura 4</div></div>
            <div class="slot creature" id="p1-cre-4"><div class="counter-rotate" style="font-size:8px; color:#6e3935; text-align:center">Criatura 5</div></div>
          </div>

          <!-- 5 Structures P1 -->
          <div class="row-slots">
            <div class="slot structure" id="p1-str-0"><div class="counter-rotate" style="font-size:8px; color:#315d6e; text-align:center">Estrutura 1</div></div>
            <div class="slot structure" id="p1-str-1"><div class="counter-rotate" style="font-size:8px; color:#315d6e; text-align:center">Estrutura 2</div></div>
            <div class="slot structure" id="p1-str-2"><div class="counter-rotate" style="font-size:8px; color:#315d6e; text-align:center">Estrutura 3</div></div>
            <div class="slot structure" id="p1-str-3"><div class="counter-rotate" style="font-size:8px; color:#315d6e; text-align:center">Estrutura 4</div></div>
            <div class="slot structure" id="p1-str-4"><div class="counter-rotate" style="font-size:8px; color:#315d6e; text-align:center">Estrutura 5</div></div>
          </div>

          <!-- Hero Pedestal + Orbes de Sangue e Mana + Canais P1 -->
          <div class="row-slots" style="align-items:center; background:linear-gradient(90deg, #101e14, #0f1922); padding:5px 8px; border-radius:8px; border:1px solid #1e3d23">
            <div style="display:flex; align-items:center; gap:10px; flex:1">
              <div class="counter-rotate" id="p1HeroAvatar" style="width:40px; height:40px; border-radius:50%; border:1.5px solid #d4af70; overflow:hidden; background:#071017">
                <img id="p1HeroImg" src="" style="width:100%; height:100%; object-fit:cover" alt="Heroi P1">
              </div>
              <div class="counter-rotate">
                <div style="font-family:Georgia,serif; font-size:12px; font-weight:bold; color:#def5e3">Viajante do Limiar</div>
                <div style="font-size:8.5px; font-family:monospace; color:#5da16b; font-weight:bold">SEU HERÓI (P1)</div>
              </div>
            </div>

            <!-- Canais P1 -->
            <div style="display:flex; gap:6px; align-items:center">
              <div class="channel-socket" id="p1-chn-0" title="Soquete de Canal 1"><span class="counter-rotate" style="font-size:8px; color:#4a6f56">⚡1</span></div>
              <div class="channel-socket" id="p1-chn-1" title="Soquete de Canal 2"><span class="counter-rotate" style="font-size:8px; color:#4a6f56">⚡2</span></div>
              <div class="channel-socket" id="p1-chn-2" title="Soquete de Canal 3"><span class="counter-rotate" style="font-size:8px; color:#4a6f56">⚡3</span></div>
            </div>

            <!-- Orbe de Mana P1 -->
            <div class="counter-rotate">
              <div class="energy-orb">
                <div class="energy-orb-inner">
                  <div class="energy-liquid" id="p1EnergyLiquid" style="height:50%"></div>
                  <div class="orb-reflection"></div>
                  <div class="orb-text">
                    <span id="p1EnergyText" style="font-size:16px">5</span>
                    <span style="font-size:7.5px; color:#a0fff0">⚡</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Orbe de Sangue Líquido P1 -->
            <div class="counter-rotate">
              <div class="blood-orb" id="p1BloodOrb">
                <div class="blood-orb-inner">
                  <div class="blood-liquid" id="p1BloodLiquid" style="height:100%">
                    <div class="blood-wave"></div>
                  </div>
                  <div class="orb-reflection"></div>
                  <div class="orb-text">
                    <span id="p1HpText" style="font-size:19px">12</span>
                    <span style="font-size:7px; opacity:0.8">/ 12 PV</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Hand Tray -->
      <footer class="hand-tray">
        <div style="font-family:Georgia,serif; font-size:11px; font-weight:bold; color:var(--gold); display:flex; align-items:center; gap:4px">
          <span>🎴</span>
          <span>Mão P<span id="activeHandNum">1</span>:</span>
        </div>
        <div class="hand-cards" id="handContainer"></div>
      </footer>
    </main>
  </div>
</div>

<script>
const CARDS_DATA = {json.dumps(cards_data["cards"], ensure_ascii=False)};
const ASSETS = {assets_json_str};

let currentTurn = 1;
let activePlayer = 1;
let isFlipped = false;
let autoFlipOnTurn = true;
let heroIntercept = false;
let p1Hp = 12;
let p2Hp = 14;
const p1MaxHp = 12;
const p2MaxHp = 14;
let p1Energy = 5;
let p2Energy = 5;

const p1Creatures = [null, null, null, null, null];
const p1Structures = [null, null, null, null, null];
const p1Channels = [null, null, null];

const p2Creatures = [null, null, null, null, null];
const p2Structures = [null, null, null, null, null];
const p2Channels = [null, null, null];

const playableCards = CARDS_DATA.filter(c => c.type !== 'hero');
let p1Hand = playableCards.slice(0, 5);
let p2Hand = playableCards.slice(5, 10);

let selectedHandCard = null;

function getCardFrame(type) {{
  if (!ASSETS.frames) return '';
  switch(type) {{
    case 'hero': return ASSETS.frames.hero;
    case 'creature': return ASSETS.frames.creature;
    case 'generator': return ASSETS.frames.generator;
    case 'spell': return ASSETS.frames.spell;
    case 'channelled_spell': return ASSETS.frames.channelled_spell;
    default: return ASSETS.frames.creature;
  }}
}}

function getCardIllustration(card) {{
  if (!card) return '';
  if (ASSETS.illustrations && ASSETS.illustrations[card.id]) {{
    return ASSETS.illustrations[card.id];
  }}
  if (ASSETS.art && ASSETS.art[card.type]) {{
    return ASSETS.art[card.type];
  }}
  return '';
}}

function updateInspector(card) {{
  if (!card) return;
  document.getElementById('cardIdTag').textContent = card.id;
  document.getElementById('cardName').textContent = card.name;
  document.getElementById('cardCost').textContent = card.energyCost;
  document.getElementById('cardRules').textContent = card.rulesText;
  
  if (card.life !== null && card.life !== undefined) {{
    document.getElementById('cardLifeContainer').style.display = 'block';
    document.getElementById('cardLifeText').textContent = card.life;
  }} else {{
    document.getElementById('cardLifeContainer').style.display = 'none';
  }}
  
  const frame = getCardFrame(card.type);
  if (frame) {{
    document.getElementById('largeCard').style.backgroundImage = 'url(' + frame + ')';
  }}
  const art = getCardIllustration(card);
  if (art) {{
    document.getElementById('cardArtImg').src = art;
  }}
  
  const typeText = card.type === 'hero' ? 'HERÓI · ELO MORTAL'
    : card.type === 'creature' ? 'CRIATURA TÁTICA'
    : card.type === 'generator' ? 'ESTRUTURA GERADORA'
    : card.type === 'spell' ? 'MAGIA INSTANTÂNEA'
    : 'MAGIA CANALIZADA';
  document.getElementById('cardType').textContent = typeText;
}}

function log(msg) {{
  const box = document.getElementById('logBox');
  const div = document.createElement('div');
  div.textContent = '[T' + currentTurn + '] ' + msg;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}}

function showFloatingText(laneIdx, text, isCrit) {{
  const layer = document.getElementById('floatingLayer');
  const el = document.createElement('div');
  el.className = 'floating-text';
  el.style.left = (12 + laneIdx * 19) + '%';
  el.style.background = isCrit ? 'linear-gradient(90deg, #8a0c0c, #e02424)' : '#5a1212';
  el.style.border = isCrit ? '2px solid #ffd700' : '1px solid #ff7066';
  el.style.color = '#fff';
  el.textContent = text;
  layer.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}}

function updateOrbs() {{
  // P1 Blood
  const p1Pct = Math.max(0, Math.min(100, Math.round((p1Hp / p1MaxHp) * 100)));
  document.getElementById('p1HpText').textContent = p1Hp;
  document.getElementById('p1BloodLiquid').style.height = p1Pct + '%';

  // P2 Blood
  const p2Pct = Math.max(0, Math.min(100, Math.round((p2Hp / p2MaxHp) * 100)));
  document.getElementById('p2HpText').textContent = p2Hp;
  document.getElementById('p2BloodLiquid').style.height = p2Pct + '%';

  // Energies
  const p1EnergyPct = Math.max(0, Math.min(100, p1Energy * 10));
  document.getElementById('p1EnergyText').textContent = p1Energy;
  document.getElementById('p1EnergyLiquid').style.height = p1EnergyPct + '%';

  const p2EnergyPct = Math.max(0, Math.min(100, p2Energy * 10));
  document.getElementById('p2EnergyText').textContent = p2Energy;
  document.getElementById('p2EnergyLiquid').style.height = p2EnergyPct + '%';
}}

function renderHand() {{
  const container = document.getElementById('handContainer');
  container.innerHTML = '';
  const hand = activePlayer === 1 ? p1Hand : p2Hand;
  const energy = activePlayer === 1 ? p1Energy : p2Energy;
  document.getElementById('activeHandNum').textContent = activePlayer;

  hand.forEach(card => {{
    const el = document.createElement('div');
    const isSelected = selectedHandCard && selectedHandCard.id === card.id;
    const canAfford = energy >= card.energyCost;
    const artUrl = getCardIllustration(card);
    const frameUrl = getCardFrame(card.type);

    el.className = 'hand-card' + (isSelected ? ' selected' : '') + (!canAfford ? ' disabled' : '');
    el.innerHTML = `
      <div style="position:absolute; inset:0; background-image:url('${{artUrl}}'); background-size:cover; background-position:center; filter:brightness(0.9)"></div>
      <div style="position:absolute; inset:0; background-image:url('${{frameUrl}}'); background-size:cover; background-position:center; opacity:0.75; pointer-events:none"></div>
      <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.95), transparent 45%, rgba(0,0,0,0.6)); pointer-events:none"></div>
      
      <div style="position:relative; z-index:5; display:flex; justify-content:space-between; align-items:center; padding:2px">
        <span style="background:rgba(13,22,29,0.9); border:1px solid #d4af70; border-radius:50%; width:15px; height:15px; display:grid; place-items:center; color:#ffd580; font-family:Georgia,serif; font-size:8.5px; font-weight:bold">${{card.energyCost}}</span>
        ${{card.life !== null && card.life !== undefined ? '<span style="background:rgba(90,17,17,0.9); border:1px solid #ff6e61; border-radius:3px; padding:0 3px; font-size:7.5px; font-weight:bold; color:#ffb0a6">❤️ ' + card.life + '</span>' : ''}}
      </div>
      
      <div style="position:relative; z-index:5; padding:2px; text-align:center">
        <div style="font-family:Georgia,serif; font-size:8px; font-weight:bold; color:#fce8c7; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-shadow:0 1px 2px #000">${{card.name}}</div>
        <div style="font-size:6.5px; font-family:monospace; text-transform:uppercase; color:#8eb0c2">${{card.type === 'channelled_spell' ? 'CANALIZ' : card.type}}</div>
      </div>
    `;

    el.addEventListener('mouseenter', () => updateInspector(card));
    el.addEventListener('click', () => {{
      selectedHandCard = isSelected ? null : card;
      renderHand();
      renderSlots();
    }});
    container.appendChild(el);
  }});
}}

function renderSlots() {{
  const canSummon = selectedHandCard !== null;

  for (let i = 0; i < 5; i++) {{
    // P1 Creatures
    const c1 = p1Creatures[i];
    const cre1 = document.getElementById('p1-cre-' + i);
    const canSummonCre1 = activePlayer === 1 && !c1 && canSummon && selectedHandCard.type === 'creature';
    cre1.className = 'slot creature' + (c1 ? ' has-card' : '') + (canSummonCre1 ? ' can-summon' : '');
    
    if (c1) {{
      const art = getCardIllustration(c1);
      const frame = getCardFrame(c1.type);
      cre1.innerHTML = `
        <div class="counter-rotate" style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; justify-content:space-between">
          <div style="position:absolute; inset:0; background-image:url('${{art}}'); background-size:cover; background-position:center; border-radius:5px"></div>
          <div style="position:absolute; inset:0; background-image:url('${{frame}}'); background-size:cover; background-position:center; opacity:0.65; pointer-events:none"></div>
          <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 40%, rgba(0,0,0,0.5) 100%); pointer-events:none"></div>
          
          <div style="position:relative; z-index:3; display:flex; justify-content:space-between; align-items:center">
            <span style="background:rgba(13,22,29,0.9); border:1px solid #d4af70; border-radius:50%; width:16px; height:16px; display:grid; place-items:center; color:#ffd580; font-family:Georgia,serif; font-size:9px; font-weight:bold">${{c1.energyCost}}</span>
          </div>
          
          <div style="position:relative; z-index:3; display:flex; justify-content:space-between; align-items:flex-end">
            <div style="font-family:Georgia,serif; font-size:8px; font-weight:bold; color:#ffd7cf; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:65px; text-shadow:0 1px 3px #000">${{c1.name}}</div>
            <span style="background:rgba(90,17,17,0.9); border:1px solid #ff6e61; border-radius:4px; padding:1px 4px; font-size:8px; font-weight:bold; color:#ffb0a6">❤️ ${{c1.currentLife}}</span>
          </div>
        </div>
      `;
      cre1.onmouseenter = () => updateInspector(c1);
    }} else {{
      cre1.innerHTML = `<div class="counter-rotate" style="font-size:8px; color:#5c3532; text-align:center">Criatura ${{i+1}}</div>`;
      cre1.onmouseenter = null;
    }}
    cre1.onclick = () => handleSlotClick('p1', 'creature', i);

    // P1 Structures
    const s1 = p1Structures[i];
    const str1 = document.getElementById('p1-str-' + i);
    const canSummonStr1 = activePlayer === 1 && !s1 && canSummon && selectedHandCard.type === 'generator';
    str1.className = 'slot structure' + (s1 ? ' has-card' : '') + (canSummonStr1 ? ' can-summon' : '');
    
    if (s1) {{
      const art = getCardIllustration(s1);
      const frame = getCardFrame(s1.type);
      str1.innerHTML = `
        <div class="counter-rotate" style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; justify-content:space-between">
          <div style="position:absolute; inset:0; background-image:url('${{art}}'); background-size:cover; background-position:center; border-radius:5px"></div>
          <div style="position:absolute; inset:0; background-image:url('${{frame}}'); background-size:cover; background-position:center; opacity:0.65; pointer-events:none"></div>
          <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 40%, rgba(0,0,0,0.5) 100%); pointer-events:none"></div>
          
          <div style="position:relative; z-index:3; display:flex; justify-content:space-between; align-items:center">
            <span style="background:rgba(13,22,29,0.9); border:1px solid #d4af70; border-radius:50%; width:16px; height:16px; display:grid; place-items:center; color:#ffd580; font-family:Georgia,serif; font-size:9px; font-weight:bold">${{s1.energyCost}}</span>
          </div>
          
          <div style="position:relative; z-index:3; display:flex; justify-content:space-between; align-items:flex-end">
            <div style="font-family:Georgia,serif; font-size:8px; font-weight:bold; color:#bdf0ff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:65px; text-shadow:0 1px 3px #000">${{s1.name}}</div>
            <span style="background:rgba(18,60,75,0.9); border:1px solid #55cce8; border-radius:4px; padding:1px 4px; font-size:8px; font-weight:bold; color:#a6efff">🛡️ ${{s1.currentLife}}</span>
          </div>
        </div>
      `;
      str1.onmouseenter = () => updateInspector(s1);
    }} else {{
      str1.innerHTML = `<div class="counter-rotate" style="font-size:8px; color:#284a57; text-align:center">Estrutura ${{i+1}}</div>`;
      str1.onmouseenter = null;
    }}
    str1.onclick = () => handleSlotClick('p1', 'structure', i);

    // P2 Creatures
    const c2 = p2Creatures[i];
    const cre2 = document.getElementById('p2-cre-' + i);
    const canSummonCre2 = activePlayer === 2 && !c2 && canSummon && selectedHandCard.type === 'creature';
    cre2.className = 'slot creature' + (c2 ? ' has-card' : '') + (canSummonCre2 ? ' can-summon' : '');
    
    if (c2) {{
      const art = getCardIllustration(c2);
      const frame = getCardFrame(c2.type);
      cre2.innerHTML = `
        <div class="counter-rotate" style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; justify-content:space-between">
          <div style="position:absolute; inset:0; background-image:url('${{art}}'); background-size:cover; background-position:center; border-radius:5px"></div>
          <div style="position:absolute; inset:0; background-image:url('${{frame}}'); background-size:cover; background-position:center; opacity:0.65; pointer-events:none"></div>
          <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 40%, rgba(0,0,0,0.5) 100%); pointer-events:none"></div>
          
          <div style="position:relative; z-index:3; display:flex; justify-content:space-between; align-items:center">
            <span style="background:rgba(13,22,29,0.9); border:1px solid #d4af70; border-radius:50%; width:16px; height:16px; display:grid; place-items:center; color:#ffd580; font-family:Georgia,serif; font-size:9px; font-weight:bold">${{c2.energyCost}}</span>
          </div>
          
          <div style="position:relative; z-index:3; display:flex; justify-content:space-between; align-items:flex-end">
            <div style="font-family:Georgia,serif; font-size:8px; font-weight:bold; color:#ffd7cf; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:65px; text-shadow:0 1px 3px #000">${{c2.name}}</div>
            <span style="background:rgba(90,17,17,0.9); border:1px solid #ff6e61; border-radius:4px; padding:1px 4px; font-size:8px; font-weight:bold; color:#ffb0a6">❤️ ${{c2.currentLife}}</span>
          </div>
        </div>
      `;
      cre2.onmouseenter = () => updateInspector(c2);
    }} else {{
      cre2.innerHTML = `<div class="counter-rotate" style="font-size:8px; color:#5c3532; text-align:center">Criatura ${{i+1}}</div>`;
      cre2.onmouseenter = null;
    }}
    cre2.onclick = () => handleSlotClick('p2', 'creature', i);

    // P2 Structures
    const s2 = p2Structures[i];
    const str2 = document.getElementById('p2-str-' + i);
    const canSummonStr2 = activePlayer === 2 && !s2 && canSummon && selectedHandCard.type === 'generator';
    str2.className = 'slot structure' + (s2 ? ' has-card' : '') + (canSummonStr2 ? ' can-summon' : '');
    
    if (s2) {{
      const art = getCardIllustration(s2);
      const frame = getCardFrame(s2.type);
      str2.innerHTML = `
        <div class="counter-rotate" style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; justify-content:space-between">
          <div style="position:absolute; inset:0; background-image:url('${{art}}'); background-size:cover; background-position:center; border-radius:5px"></div>
          <div style="position:absolute; inset:0; background-image:url('${{frame}}'); background-size:cover; background-position:center; opacity:0.65; pointer-events:none"></div>
          <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 40%, rgba(0,0,0,0.5) 100%); pointer-events:none"></div>
          
          <div style="position:relative; z-index:3; display:flex; justify-content:space-between; align-items:center">
            <span style="background:rgba(13,22,29,0.9); border:1px solid #d4af70; border-radius:50%; width:16px; height:16px; display:grid; place-items:center; color:#ffd580; font-family:Georgia,serif; font-size:9px; font-weight:bold">${{s2.energyCost}}</span>
          </div>
          
          <div style="position:relative; z-index:3; display:flex; justify-content:space-between; align-items:flex-end">
            <div style="font-family:Georgia,serif; font-size:8px; font-weight:bold; color:#bdf0ff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:65px; text-shadow:0 1px 3px #000">${{s2.name}}</div>
            <span style="background:rgba(18,60,75,0.9); border:1px solid #55cce8; border-radius:4px; padding:1px 4px; font-size:8px; font-weight:bold; color:#a6efff">🛡️ ${{s2.currentLife}}</span>
          </div>
        </div>
      `;
      str2.onmouseenter = () => updateInspector(s2);
    }} else {{
      str2.innerHTML = `<div class="counter-rotate" style="font-size:8px; color:#284a57; text-align:center">Estrutura ${{i+1}}</div>`;
      str2.onmouseenter = null;
    }}
    str2.onclick = () => handleSlotClick('p2', 'structure', i);
  }}
}}

function handleSlotClick(playerStr, slotType, lane) {{
  if (!selectedHandCard) return;
  const isP1 = playerStr === 'p1';
  if ((isP1 && activePlayer !== 1) || (!isP1 && activePlayer !== 2)) return;

  const currentEnergy = activePlayer === 1 ? p1Energy : p2Energy;
  if (currentEnergy < selectedHandCard.energyCost) {{
    log("⚡ Energia insuficiente para " + selectedHandCard.name + "!");
    return;
  }}

  if (selectedHandCard.type === 'creature' && slotType === 'creature') {{
    const cardInstance = {{ ...selectedHandCard, currentLife: selectedHandCard.life || 4 }};
    if (activePlayer === 1) {{
      p1Creatures[lane] = cardInstance;
      p1Energy -= selectedHandCard.energyCost;
      p1Hand = p1Hand.filter(c => c.id !== selectedHandCard.id);
    }} else {{
      p2Creatures[lane] = cardInstance;
      p2Energy -= selectedHandCard.energyCost;
      p2Hand = p2Hand.filter(c => c.id !== selectedHandCard.id);
    }}
    log("Jogador " + activePlayer + " invocou " + selectedHandCard.name + " na Faixa " + (lane+1));
    selectedHandCard = null;
    updateOrbs();
    renderSlots();
    renderHand();
  }} else if (selectedHandCard.type === 'generator' && slotType === 'structure') {{
    const cardInstance = {{ ...selectedHandCard, currentLife: selectedHandCard.life || 5 }};
    if (activePlayer === 1) {{
      p1Structures[lane] = cardInstance;
      p1Energy -= selectedHandCard.energyCost;
      p1Hand = p1Hand.filter(c => c.id !== selectedHandCard.id);
    }} else {{
      p2Structures[lane] = cardInstance;
      p2Energy -= selectedHandCard.energyCost;
      p2Hand = p2Hand.filter(c => c.id !== selectedHandCard.id);
    }}
    log("Jogador " + activePlayer + " construiu " + selectedHandCard.name + " na Faixa " + (lane+1));
    selectedHandCard = null;
    updateOrbs();
    renderSlots();
    renderHand();
  }}
}}

function rollD6() {{
  return Math.floor(Math.random() * 6) + 1;
}}

// End Turn & Combat
document.getElementById('endTurnBtn').addEventListener('click', () => {{
  const attackingCreatures = activePlayer === 1 ? p1Creatures : p2Creatures;
  const defendingCreatures = activePlayer === 1 ? p2Creatures : p1Creatures;
  const defendingStructures = activePlayer === 1 ? p2Structures : p1Structures;

  for (let i = 0; i < 5; i++) {{
    if (attackingCreatures[i]) {{
      const d = rollD6();
      document.getElementById('diceBox').textContent = d;

      if (heroIntercept) {{
        if (activePlayer === 1) {{
          p2Hp = Math.max(0, p2Hp - d);
          document.getElementById('p2BloodOrb').classList.add('blood-orb-hit');
          setTimeout(() => document.getElementById('p2BloodOrb').classList.remove('blood-orb-hit'), 600);
        }} else {{
          p1Hp = Math.max(0, p1Hp - d);
          document.getElementById('p1BloodOrb').classList.add('blood-orb-hit');
          setTimeout(() => document.getElementById('p1BloodOrb').classList.remove('blood-orb-hit'), 600);
        }}
        showFloatingText(i, '🛡️ -' + d + ' NO HERÓI!', d >= 5);
        log(`[Faixa ${{i+1}}] ${{attackingCreatures[i].name}} causou ${{d}} dano interceptado pelo Herói!`);
      }} else if (defendingCreatures[i]) {{
        defendingCreatures[i].currentLife -= d;
        showFloatingText(i, '💥 -' + d, d === 6);
        log(`[Faixa ${{i+1}}] ${{attackingCreatures[i].name}} atacou ${{defendingCreatures[i].name}}: ${{d}} dano!`);
        if (defendingCreatures[i].currentLife <= 0) {{
          showFloatingText(i, '☠️ DESTRUÍDA!', true);
          defendingCreatures[i] = null;
        }}
      }} else if (defendingStructures[i]) {{
        defendingStructures[i].currentLife -= d;
        showFloatingText(i, '💥 -' + d, false);
        log(`[Faixa ${{i+1}}] ${{attackingCreatures[i].name}} atacou ${{defendingStructures[i].name}}: ${{d}} dano à estrutura!`);
        if (defendingStructures[i].currentLife <= 0) {{
          defendingStructures[i] = null;
        }}
      }} else {{
        // Direct hero hit
        if (activePlayer === 1) {{
          p2Hp = Math.max(0, p2Hp - d);
          document.getElementById('p2BloodOrb').classList.add('blood-orb-hit');
          setTimeout(() => document.getElementById('p2BloodOrb').classList.remove('blood-orb-hit'), 600);
        }} else {{
          p1Hp = Math.max(0, p1Hp - d);
          document.getElementById('p1BloodOrb').classList.add('blood-orb-hit');
          setTimeout(() => document.getElementById('p1BloodOrb').classList.remove('blood-orb-hit'), 600);
        }}
        showFloatingText(i, '🩸 -' + d + ' NO HERÓI!', d >= 5);
        log(`[Faixa ${{i+1}}] LIVRE! ${{attackingCreatures[i].name}} rolou d6 (${{d}}) direto no Herói!`);
      }}
    }}
  }}

  updateOrbs();

  if (p1Hp <= 0 || p2Hp <= 0) {{
    alert((p1Hp <= 0 ? 'Jogador 2 (Imperatriz das Eras)' : 'Jogador 1 (Viajante do Limiar)') + ' venceu a disputa!');
  }}

  // Energy & Switch turn
  activePlayer = activePlayer === 1 ? 2 : 1;
  currentTurn++;
  if (activePlayer === 1) p1Energy = Math.min(10, p1Energy + 2);
  else p2Energy = Math.min(10, p2Energy + 2);

  if (autoFlipOnTurn) {{
    isFlipped = !isFlipped;
    document.getElementById('hotseatBoard').className = 'hotseat-board' + (isFlipped ? ' hotseat-flipped' : '');
  }}

  document.getElementById('turnLabel').textContent = 'Turno ' + currentTurn;
  document.getElementById('activePlayerLabel').textContent = '• Jogador ' + activePlayer + ' (' + (activePlayer === 1 ? 'Viajante do Limiar' : 'Imperatriz das Eras') + ')';
  document.getElementById('flipBtnText').textContent = '180° (P' + (isFlipped ? '2' : '1') + ')';

  updateOrbs();
  renderSlots();
  renderHand();
}});

// Manual Flip
document.getElementById('manualFlipBtn').addEventListener('click', () => {{
  isFlipped = !isFlipped;
  document.getElementById('hotseatBoard').className = 'hotseat-board' + (isFlipped ? ' hotseat-flipped' : '');
  document.getElementById('flipBtnText').textContent = '180° (P' + (isFlipped ? '2' : '1') + ')';
}});

document.getElementById('autoFlipToggle').addEventListener('change', (e) => {{
  autoFlipOnTurn = e.target.checked;
}});

document.getElementById('heroInterceptToggle').addEventListener('change', (e) => {{
  heroIntercept = e.target.checked;
}});

document.getElementById('rollDiceBtn').addEventListener('click', () => {{
  const d = rollD6();
  document.getElementById('diceBox').textContent = d;
  document.getElementById('diceStatus').textContent = 'Dado rolado: ' + d + ' de combate';
  log('Rolagem manual d6: ' + d);
}});

// Setup hero avatars
const hero1Card = CARDS_DATA.find(c => c.id === 'HERO-001') || CARDS_DATA[0];
const hero2Card = CARDS_DATA.find(c => c.id === 'HERO-002') || CARDS_DATA[1];
document.getElementById('p1HeroImg').src = getCardIllustration(hero1Card);
document.getElementById('p2HeroImg').src = getCardIllustration(hero2Card);

// Initial setup
updateInspector(hero1Card);
updateOrbs();
renderSlots();
renderHand();
</script>
</body>
</html>
"""

with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
    f.write(standalone_html)

print(f"[+] Standalone Forbidden Memories com Orbes e Ilustrações Épicas gerado com sucesso: {OUTPUT_HTML} ({len(standalone_html)} bytes)")
