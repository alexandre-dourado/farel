/goal

# MISSION ONESHOT — FAREL VIRTUAL MVP (EXECUÇÃO COM SUBAGENTS)

MISSION_ID: ONESHOT-MVP-01
STATUS: NOT_STARTED

---

## OBJECTIVE

Construir o FAREL VIRTUAL MVP completo (engine + testes + UI local +
Google Sheets + Apps Script + multiplayer 1×1 via polling), em uma única
execução supervisionada, dividida internamente em CHUNKS sequenciais/
paralelos executados por subagents especializados. Sem pausa humana entre
chunks, EXCETO quando um subagent encontrar uma decisão de game design
não coberta pelo `pdr.txt` — nesse caso, PARE aquele chunk, registre em
OPEN_QUESTIONS, e continue os chunks que não dependem da resposta,
sinalizando o bloqueio no relatório final.

## READ_FIRST (ordem obrigatória, antes de qualquer código)

```text
1. pdr.txt                          (autoridade máxima de regras)
2. AGY_BUILD_PLAN.md                (princípios operacionais e phases originais)
3. docs/agy/AUDIT_REPORT.md         (estado atual do diretório)
4. docs/agy/RULESET_EXTRACT.md      (referência rápida — usar isso no dia a dia,
                                      só voltar ao pdr.txt em caso de dúvida)
5. 5. docs/farel-repo               (repositório github)
```

## PRINCÍPIOS INEGOCIÁVEIS (herdados do AGY_BUILD_PLAN, seção 2)

```text
- Game Engine é a fonte da verdade. UI nunca decide dano, roll, vencedor,
  energia, validade de ação, morte ou turno.
- Cliente não é confiável. RNG sempre server-side.
- Nenhum subagent inventa regra de game design não documentada.
- Documento > Código, sempre que houver conflito.
- P0 correctness > P1 playability > P2 observability > P3 UX > P4 estética.
```

---

## ESTRATÉGIA DE SUBAGENTS

Delegue cada chunk abaixo a um subagent dedicado. O ORCHESTRATOR (você,
AGY principal) só integra, valida critério de aceite, e libera o próximo
chunk. Não implemente código no papel de orchestrator — delegue.

---

### CHUNK 0 — FOUNDATION
**Agent:** AGENT_INIT
**Depende de:** nada (parte do estado auditado em AUDIT_REPORT.md)
**Faz:**
- Inicializar Git.
- Instanciar Next.js + TypeScript + Tailwind + ESLint + framework de testes (Vitest ou Jest).
- Criar estrutura de pastas: `app/ components/ game/ lib/ types/ tests/ scripts/ docs/ apps-script/`
- Preservar `pdr.txt`, `AGY_BUILD_PLAN.md` e os arquivos de mídia já existentes.
**Aceite:** app roda localmente (`npm run dev` sem erro); `git log` mostra commit inicial.

---

### CHUNK 1 — DOMAIN TYPES
**Agent:** AGENT_DOMAIN
**Depende de:** Chunk 0 PASS
**Faz:** Implementar em `types/` e `game/`:
```text
Player, Hero, Card, Creature, Structure, Spell, Board, GameState
CardType, EntityType, GameStatus, TurnPhase, Zone, ActionType, EventType, EntityStatus
```
Sem lógica de regras ainda — apenas os contratos de dados descritos no
RULESET_EXTRACT (seções Tabuleiro, Cartas, Estados).
**Aceite:** projeto compila; tipos cobrem 100% das entidades listadas.

---

### CHUNK 2 — RULES CONFIG (pode rodar em paralelo ao Chunk 1)
**Agent:** AGENT_CONFIG
**Depende de:** Chunk 0 PASS
**Faz:** Implementar `RulesConfig` com todos os campos do RULESET_EXTRACT
(base_energy, starting_hand, max_hand, draw_per_turn, creature_slots,
structure_slots, channeling_slots, attack_dice, mandatory_attack,
energy_carries_over, buff_max_damage, hero_defense_limit) + validação
(números positivos, limites coerentes, booleanos válidos).
**Aceite:** config inválida é rejeitada com erro claro; testes de validação passam.

---

### CHUNK 3 — GAME ENGINE CORE
**Agent:** AGENT_ENGINE
**Depende de:** Chunks 1 e 2 PASS
**Faz:** Implementar em `game/engine/`:
```text
createGame, startGame, startTurn, draw, energy (EnergyEngine), playCard, endTurn
```
Seguindo exatamente o fluxo de turno do RULESET_EXTRACT (TURN START →
REFRESH → ENERGY → DRAW → ACTION → COMBAT → END TURN → NEXT PLAYER) e a
regra de limite de mão (ilimitado durante o turno, 5 no End Step).
**Aceite:** partida em memória consegue: criar jogo, iniciar, passar turnos,
gerar energia corretamente, comprar carta respeitando limite.

---

### CHUNK 4 — COMBAT ENGINE
**Agent:** AGENT_COMBAT
**Depende de:** Chunk 3 PASS
**Faz:** Implementar em `game/engine/CombatEngine`:
```text
attack, target selection (criatura → estrutura → herói),
d6 roll (RNG server-side), modifier/buff (sem teto), damage, death,
victory detection, defesa do herói (coringa, ilimitada)
```
**Aceite:** ataque resolve dano corretamente com e sem buff; morte de
criatura/estrutura/herói é detectada; vitória é detectada quando
hero.health <= 0.

---

### CHUNK 5 — TEST SUITE (gate obrigatório)
**Agent:** AGENT_TEST
**Depende de:** Chunks 1–4 PASS
**Faz:** Consolidar e completar cobertura dos testes mínimos do PDR
(seção 88) e dos testes de segurança (seção 89) — ver lista completa em
RULESET_EXTRACT. Cobrir especificamente os 8 casos de rejeição de ação
inválida.
**Aceite:** suíte completa passa 100%; nenhum teste de segurança falha.
**Isto é um gate: se falhar, NÃO avance para o Chunk 6.**

---

### CHUNK 6 — LOCAL BOARD UI
**Agent:** AGENT_UI
**Depende de:** Chunk 5 PASS
**Faz:** Tabuleiro jogável localmente (dois jogadores no mesmo processo,
sem rede), usando o engine em memória. Renderizar: heróis, 5 lanes de
criatura, 5 slots de estrutura, 3 slots de canalização, mão, energia
atual. Usar os placeholders de `ASSET_GEN_PROMPT.md` — não bloquear por
falta de arte final.
**Aceite:** uma partida completa (do lobby local até vitória) é jogável
na UI sem editar estado manualmente.

---

### CHUNK 7 — GOOGLE SHEETS + APPS SCRIPT API (pode rodar em paralelo ao Chunk 6)
**Agent:** AGENT_BACKEND
**Depende de:** Chunk 5 PASS
**Faz:**
- Criar planilha `FAREL_VIRTUAL_DB` com as 14 abas oficiais (ver RULESET_EXTRACT).
- Implementar em `apps-script/`: `createRoom, joinRoom, startGame, getState, submitAction, getEvents, finishGame`.
- Garantir que `PLAYER_CARDS` nunca vaza a mão do adversário para o cliente errado.
- RNG do d6 acontece no Apps Script, nunca no cliente.
**Aceite:** chamadas de API via script de teste (sem UI) criam sala,
iniciam jogo, processam uma ação e persistem estado corretamente nas
abas certas.

---

### CHUNK 8 — MULTIPLAYER INTEGRATION
**Agent:** AGENT_MULTIPLAYER
**Depende de:** Chunks 6 e 7 PASS
**Faz:** Conectar a Board UI (Chunk 6) à API do Apps Script (Chunk 7) via
polling. Fluxo completo: `LOBBY → SETUP → GAME → COMBAT → VICTORY`.
Registrar eventos e dados mínimos de telemetria (PLAYTEST).
**Aceite (o teste mais importante do projeto, PDR seção 90):** dois
navegadores diferentes conseguem criar sala, entrar, iniciar, comprar,
jogar carta, atacar, rolar dado, receber dano, matar criatura, matar
herói e terminar a partida — **sem editar a planilha manualmente**.

---

## CHECKLIST FINAL DE "DONE" (PDR seção 87 — usar literalmente)

Antes de reportar STATUS: PASS na missão inteira, confirme cada item:
```text
[ ] P1 cria sala          [ ] energia é gerada       [ ] criaturas morrem
[ ] P2 entra               [ ] carta é comprada       [ ] estruturas morrem
[ ] sala possui código      [ ] cartas podem ser jogadas [ ] herói recebe dano
[ ] ambos entram na partida [ ] criatura entra no slot [ ] herói pode defender
[ ] heróis são atribuídos   [ ] estrutura entra no slot [ ] herói pode morrer
[ ] decks são atribuídos    [ ] magia pode ser canalizada [ ] vencedor é detectado
[ ] mãos são criadas        [ ] criatura não ataca quando não pode [ ] partida termina
[ ] partida começa          [ ] criatura pode atacar   [ ] eventos são registrados
[ ] turno é controlado      [ ] alvo é determinado     [ ] dados de playtest armazenados
                             [ ] d6 é rolado            [ ] dois navegadores jogam sem intervenção manual
                             [ ] modificadores são aplicados
                             [ ] dano é aplicado
```

## DO_NOT

```text
- Não implementar nada da lista "O QUE O MVP NÃO É" (PDR seção 2):
  matchmaking, ranking, login completo, perfil social, amigos, chat,
  loja, moedas, coleção, boosters, crafting, campanhas, IA, torneios,
  dezenas de decks, centenas de cartas, animações complexas, app mobile
  nativo, monetização.
- Não decidir ataque obrigatório vs opcional por conta própria — usar
  mandatory_attack = false como default documentado e seguir em frente.
- Não polir visual antes do Chunk 8 passar.
- Não adicionar dependência nova sem justificativa clara (AGY_BUILD_PLAN, seção 37).
```

## OUTPUT / FORMATO DE RELATÓRIO

Ao final de CADA chunk (não só no final da missão), gerar um bloco:
```text
CHUNK:
STATUS: PASS | BLOCKED | FAILED
IMPLEMENTED:
FILES_CHANGED:
TESTS:
TEST_RESULTS:
DECISIONS:
OPEN_QUESTIONS:
RISKS:
```

Ao final da missão inteira, consolidar em `docs/agy/ONESHOT_MVP_REPORT.md`
com o checklist de "Done" marcado item a item e o STATUS FINAL geral
(PASS ou BLOCKED, com lista de bloqueios pendentes de decisão sua).
