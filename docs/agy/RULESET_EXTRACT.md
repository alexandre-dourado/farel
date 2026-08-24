# FAREL — RULESET EXTRACT (referência rápida para subagents)

Fonte de verdade completa: `pdr.txt`. Este arquivo é um resumo operacional
para reduzir tokens gastos por subagent — em caso de dúvida ou conflito,
`pdr.txt` sempre vence.

## Config base (defaults)
```text
base_energy        = 5
starting_hand       = 5
max_hand            = 5
draw_per_turn       = 1
creature_slots      = 5
structure_slots     = 5
channeling_slots    = 3
attack_dice         = d6
mandatory_attack    = false
energy_carries_over = false   (energia não gasta desaparece no fim do turno)
buff_max_damage     = null    (sem teto; 1d6 + buff soma livre, ex: 6+5=11)
hero_defense_limit  = null    (herói é coringa: defende qualquer lane, sem limite de vezes por turno)
```

## Tabuleiro por jogador
```text
1 slot de Herói
5 slots de Criatura (lanes 1–5)
5 slots de Estrutura
3 slots de Canalização
```

## Hierarquia de alvo de ataque
```text
Criatura inimiga (mesma lane) → Estrutura → Herói
```

## Herói
- Vida própria, pode atacar, defender, morrer.
- hero.health <= 0 → GAME OVER imediato para o dono.
- Pode interceptar defesa em QUALQUER lane, sem limite de usos por turno
  (diferente de criaturas, que só agem na própria lane).

## Energia
```text
energy_income = base_energy + bonus_energy (soma de estruturas geradoras ativas)
current_energy = energy_income no início do turno
```
Não acumula entre turnos. Estrutura destruída recalcula bonus_energy.

## Cartas
- Mão inicial: 5. +1 compra por turno.
- Durante o turno: sem limite de cartas na mão.
- No End Step: obrigatório descartar até restar no máximo 5.

## Tipos de carta
```text
CREATURE | STRUCTURE | SPELL   (+ HERO como entidade separada, não é carta jogável)
```

## Criaturas
- Dano base = 1d6 (sem valor de ataque fixo).
- Summoning sickness: CAN_ATTACK = false no turno em que entra, exceto se
  `card.can_attack_on_entry = true`.
- Vida não regenera automaticamente.

## Combate
```text
roll = 1d6 (server-side, RNG — cliente NUNCA envia o resultado)
damage = roll + buff_modifiers (sem teto)
```

## Estruturas
- Ocupam slot, têm vida, podem gerar energia, podem ter efeitos.
- Destruição recalcula energia do dono.

## Canalização
```text
CARTA → CANALIZAR → SLOT DE CANALIZAÇÃO → CONDIÇÃO → ATIVAÇÃO → EFEITO
```
3 slots. Resolução não é necessariamente imediata.

## Fluxo de turno
```text
TURN START → REFRESH STATE → GENERATE ENERGY → DRAW CARD →
ACTION PHASE → COMBAT → END TURN → NEXT PLAYER
```

## Estados
```text
Criatura:  SUMMONED, READY, EXHAUSTED, DAMAGED, DESTROYED
Partida:   WAITING, SETUP, READY, PLAYING, COMBAT, FINISHED, CANCELLED
Sala:      WAITING, READY, STARTED, FINISHED, CANCELLED
```

## Ações (comandos que o engine deve aceitar)
```text
PLAY_CARD, SUMMON_CREATURE, BUILD_STRUCTURE, CHANNEL_SPELL,
ACTIVATE_SPELL, DECLARE_ATTACK, DEFEND_WITH_HERO, END_TURN
```

## Regras de segurança obrigatórias (o engine tem que REJEITAR)
```text
- jogador agindo com carta que não é sua
- jogador agindo fora do próprio turno
- gasto de energia inexistente
- ataque a criatura inexistente
- uso de carta que não está na mão
- ocupar slot já ocupado
- cliente enviando resultado de d6 manualmente
- cliente tentando modificar HP diretamente
```

## Google Sheets — abas oficiais
```text
CONFIG, PLAYERS, ROOMS, GAMES, PLAYER_STATE, GAME_STATE,
PLAYER_CARDS, CARDS, DECKS, DECK_CARDS, HEROES, ACTIONS, EVENTS,
MATCHES, PLAYTEST
```
Regra crítica: `PLAYER_CARDS` guarda zona de cada carta (DECK/HAND/BOARD/
CHANNELING/DISCARD) e **o cliente nunca recebe a mão do adversário**.

## Apps Script API (funções mínimas)
```text
createRoom, joinRoom, startGame, getState, submitAction, getEvents, finishGame
```

## Pontos EM ABERTO no PDR (não decidir sozinho — reportar)
```text
- ataque obrigatório vs opcional → recomendação inicial: mandatory_attack = false
- hero_defense_limit → provisório, tratar como ilimitado até nova decisão
```
