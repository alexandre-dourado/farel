# FAREL VIRTUAL MVP

# AGY BUILD PLAN

## Pipeline Mestre de Implementação

**Documento:** `AGY_BUILD_PLAN.md`\
**Projeto:** FAREL VIRTUAL MVP v0.1\
**Base:** `PDR MASTER`\
**Backend provisório:** Google Sheets + Google Apps Script\
**Frontend:** Next.js + TypeScript\
**Deploy:** Vercel\
**Executor:** AGY CLI\
**Status:** PLANO DE EXECUÇÃO

------------------------------------------------------------------------

# 0. PROPÓSITO

Este documento transforma o `PDR MASTER` em uma linha de produção
executável pelo AGY CLI.

O AGY não deve receber uma ordem genérica como:

> "Construa o FAREL Virtual."

Ele deverá executar uma sequência de missões pequenas, verificáveis e
reversíveis.

A regra operacional é:

``` text
PDR MASTER
    ↓
AGY BUILD PLAN
    ↓
PHASE
    ↓
MISSION
    ↓
IMPLEMENTAÇÃO
    ↓
TESTES
    ↓
REVIEW
    ↓
CHECKPOINT
    ↓
PRÓXIMA MISSION
```

------------------------------------------------------------------------

# 1. DOCUMENTOS DE AUTORIDADE

A hierarquia de autoridade do projeto é:

``` text
01. PDR MASTER
02. RULESET / regras formalizadas
03. OPEN QUESTIONS
04. GAME ENGINE CONTRACTS
05. AGY BUILD PLAN
06. código
07. UI
08. dados de teste
```

O código não pode contradizer uma regra documentada.

Se houver conflito:

``` text
DOCUMENTO > CÓDIGO
```

O AGY deve parar e reportar o conflito em vez de escolher uma
interpretação por conta própria.

------------------------------------------------------------------------

# 2. PRINCÍPIOS OPERACIONAIS DO AGY

## 2.1 Não inventar regras

Se uma regra estiver indefinida:

``` text
STOP
REPORT
ASK
```

Nunca preencher uma lacuna de game design silenciosamente.

------------------------------------------------------------------------

## 2.2 Game Engine é a fonte da verdade

A UI nunca determina:

-   dano;
-   rolagem;
-   vencedor;
-   energia;
-   validade da ação;
-   morte;
-   turno.

A UI apenas solicita ações.

------------------------------------------------------------------------

## 2.3 Cliente não é confiável

Qualquer informação enviada pelo navegador deve ser considerada não
confiável.

Exemplo:

``` text
client says:
"roll = 6"
```

O servidor ignora o valor.

O servidor rola:

``` text
RNG → D6
```

------------------------------------------------------------------------

## 2.4 Pequenas mudanças

Cada missão deve alterar uma coisa coerente.

Evitar:

``` text
"refatore tudo"
```

Preferir:

``` text
"implemente GameState e seus testes"
```

------------------------------------------------------------------------

## 2.5 Testes antes de expansão

Uma fase só avança quando os critérios de aceite forem cumpridos.

------------------------------------------------------------------------

# 3. ESTADOS DO PROJETO

O projeto deverá usar estes estados:

``` text
NOT_STARTED
IN_PROGRESS
BLOCKED
REVIEW
PASS
FAILED
DEPRECATED
```

Uma missão `PASS` pode liberar a próxima.

Uma missão `BLOCKED` deve gerar relatório.

------------------------------------------------------------------------

# 4. ESTRUTURA DE MISSÕES

Cada missão AGY deve possuir:

``` text
MISSION_ID
TITLE
PHASE
OBJECTIVE
CONTEXT
READ_FIRST
FILES_ALLOWED
FILES_FORBIDDEN
TASK
ACCEPTANCE_CRITERIA
TESTS
DO_NOT
OUTPUT
```

------------------------------------------------------------------------

# 5. FORMATO DE RELATÓRIO DO AGY

Ao terminar uma missão, responder:

``` text
MISSION:
STATUS:

IMPLEMENTED:
- ...

FILES_CHANGED:
- ...

TESTS:
- ...

TEST_RESULTS:
- ...

DECISIONS:
- ...

OPEN_QUESTIONS:
- ...

RISKS:
- ...

NEXT_RECOMMENDED_MISSION:
- ...
```

Se algo não foi possível:

``` text
STATUS: BLOCKED
REASON:
REQUIRED_DECISION:
```

------------------------------------------------------------------------

# 6. PHASE 00 --- AUDIT

## Objetivo

Antes de construir qualquer coisa, o AGY deve inspecionar o projeto.

Não implementar.

### MISSÃO 00.01 --- PROJECT AUDIT

Objetivo:

-   identificar arquivos existentes;
-   identificar estrutura atual;
-   identificar duplicações;
-   identificar código pré-existente;
-   identificar configurações;
-   identificar documentação;
-   verificar Git;
-   verificar package manager;
-   verificar ambiente.

### Regra

Nesta missão:

``` text
NO CODE CHANGES
```

### Saída

Criar:

``` text
docs/agy/AUDIT_REPORT.md
```

------------------------------------------------------------------------

# 7. PHASE 01 --- PROJECT INIT

## Objetivo

Criar a fundação técnica.

### MISSÃO 01.01 --- APPLICATION SKELETON

Criar:

``` text
Next.js
TypeScript
Tailwind
ESLint
test framework
```

### Critério

Aplicação inicia localmente.

------------------------------------------------------------------------

### MISSÃO 01.02 --- DIRECTORY ARCHITECTURE

Criar a estrutura:

``` text
app/
components/
game/
lib/
types/
tests/
scripts/
docs/
apps-script/
```

Sem implementar regras ainda.

------------------------------------------------------------------------

### MISSÃO 01.03 --- DEVELOPMENT CONTRACT

Criar:

``` text
AGENTS.md
CONTRIBUTING.md
```

Documentar:

-   arquitetura;
-   regras;
-   testes;
-   fluxo AGY;
-   restrições.

------------------------------------------------------------------------

# 8. PHASE 02 --- DOMAIN MODEL

## Objetivo

Criar os tipos fundamentais.

### MISSÃO 02.01 --- CORE TYPES

Implementar:

``` text
Player
Hero
Card
Creature
Structure
Spell
Board
GameState
```

Sem lógica complexa.

------------------------------------------------------------------------

### MISSÃO 02.02 --- ENUMS

Implementar enums/tipos para:

``` text
CardType
EntityType
GameStatus
TurnPhase
Zone
ActionType
EventType
EntityStatus
```

------------------------------------------------------------------------

### MISSÃO 02.03 --- GAME STATE CONTRACT

Formalizar:

``` text
GameState
PlayerState
BoardState
EntityState
```

Criar testes de serialização/deserialização.

------------------------------------------------------------------------

# 9. PHASE 03 --- RULE CONFIG

## Objetivo

Separar regras configuráveis do código.

Criar:

``` text
RulesConfig
```

Campos iniciais:

``` text
baseEnergy
startingHand
maxHand
drawPerTurn
creatureSlots
structureSlots
channelingSlots
attackDice
mandatoryAttack
energyCarriesOver
drawOverLimit
buffMaxDamage
structureIncomeTiming
heroDefenseLimit
```

Campos ainda indefinidos devem aceitar estado provisório ou valor
configurável.

------------------------------------------------------------------------

### MISSÃO 03.01 --- RULE CONFIG

Implementar configuração central.

------------------------------------------------------------------------

### MISSÃO 03.02 --- CONFIG VALIDATION

Validar:

-   números positivos;
-   limites coerentes;
-   slots válidos;
-   valores booleanos;
-   ausência de configuração inválida.

------------------------------------------------------------------------

# 10. PHASE 04 --- GAME ENGINE CORE

## Objetivo

Construir o núcleo sem UI e sem Google Sheets.

Tudo deve funcionar em memória.

------------------------------------------------------------------------

### MISSÃO 04.01 --- CREATE GAME

Implementar:

``` text
createGame()
```

Deve:

-   criar partida;
-   criar jogadores;
-   atribuir heróis;
-   criar decks;
-   criar estado inicial.

------------------------------------------------------------------------

### MISSÃO 04.02 --- START GAME

Implementar:

``` text
startGame()
```

Deve:

-   validar dois jogadores;
-   preparar mãos;
-   posicionar heróis;
-   iniciar turno.

------------------------------------------------------------------------

### MISSÃO 04.03 --- TURN ENGINE

Implementar:

``` text
startTurn()
endTurn()
nextTurn()
```

Fluxo:

``` text
START
↓
ENERGY
↓
DRAW
↓
ACTION
↓
COMBAT
↓
END
```

------------------------------------------------------------------------

# 11. PHASE 05 --- CARD ENGINE

## MISSÃO 05.01 --- CARD VALIDATION

Validar:

``` text
card exists
card belongs to player
card is playable
energy sufficient
target valid
slot valid
```

------------------------------------------------------------------------

## MISSÃO 05.02 --- CREATURE SUMMON

Implementar:

``` text
summonCreature()
```

Regras:

-   custo;
-   slot;
-   controle;
-   summoning sickness.

------------------------------------------------------------------------

## MISSÃO 05.03 --- STRUCTURE BUILD

Implementar:

``` text
buildStructure()
```

Regras:

-   custo;
-   slot;
-   geração de energia;
-   vida.

------------------------------------------------------------------------

## MISSÃO 05.04 --- SPELL CHANNELING

Implementar:

``` text
channelSpell()
activateSpell()
```

------------------------------------------------------------------------

# 12. PHASE 06 --- ENERGY ENGINE

## MISSÃO 06.01 --- BASE ENERGY

Implementar:

``` text
5 base energy
```

------------------------------------------------------------------------

## MISSÃO 06.02 --- STRUCTURE ENERGY

Implementar:

``` text
base + structure bonuses
```

------------------------------------------------------------------------

## MISSÃO 06.03 --- ENERGY SPENDING

Toda ação que custa energia deve:

``` text
validate
spend
emit event
```

------------------------------------------------------------------------

# 13. PHASE 07 --- DRAW / HAND ENGINE

## MISSÃO 07.01 --- STARTING HAND

Implementar cinco cartas iniciais.

------------------------------------------------------------------------

## MISSÃO 07.02 --- DRAW

Implementar uma compra por turno.

------------------------------------------------------------------------

## MISSÃO 07.03 --- HAND LIMIT

Implementar a regra configurada para excesso de mão.

Não escolher uma interpretação diferente da configuração.

------------------------------------------------------------------------

# 14. PHASE 08 --- COMBAT ENGINE

Esta é uma das fases críticas.

------------------------------------------------------------------------

## MISSÃO 08.01 --- TARGET RESOLUTION

Implementar:

``` text
creature
↓
structure
↓
hero
```

por lane.

------------------------------------------------------------------------

## MISSÃO 08.02 --- ATTACK VALIDATION

Validar:

-   turno;
-   ownership;
-   criatura existente;
-   criatura capaz de atacar;
-   alvo válido.

------------------------------------------------------------------------

## MISSÃO 08.03 --- D6 RNG

Implementar RNG no domínio/server.

Nunca receber o resultado do cliente.

------------------------------------------------------------------------

## MISSÃO 08.04 --- DAMAGE

Implementar:

``` text
damage = d6 + modifiers
```

------------------------------------------------------------------------

## MISSÃO 08.05 --- DEATH

Implementar:

``` text
health <= 0
→ destroyed
```

------------------------------------------------------------------------

## MISSÃO 08.06 --- HERO DEFENSE

Implementar a mecânica conforme o valor atualmente definido em
`RulesConfig`.

Se a regra continuar indefinida:

``` text
BLOCKED
```

e gerar uma pergunta de design.

------------------------------------------------------------------------

# 15. PHASE 09 --- VICTORY ENGINE

## MISSÃO 09.01

Implementar:

``` text
hero.health <= 0
→ opponent wins
```

------------------------------------------------------------------------

## MISSÃO 09.02

Garantir:

``` text
GAME_FINISHED
```

bloqueando novas ações.

------------------------------------------------------------------------

# 16. PHASE 10 --- EVENT SYSTEM

Toda mutação relevante deverá produzir evento.

Implementar:

``` text
Event
EventType
EventLog
```

Eventos mínimos:

``` text
GAME_STARTED
TURN_STARTED
CARD_DRAWN
ENERGY_GENERATED
CARD_PLAYED
CREATURE_SUMMONED
STRUCTURE_BUILT
SPELL_CHANNELLED
SPELL_ACTIVATED
ATTACK_DECLARED
DICE_ROLLED
DAMAGE_DEALT
CREATURE_DESTROYED
STRUCTURE_DESTROYED
HERO_DAMAGED
HERO_DESTROYED
TURN_ENDED
GAME_WON
```

------------------------------------------------------------------------

# 17. PHASE 11 --- GAME ENGINE TEST SUITE

Antes de frontend.

Testar:

``` text
create game
start game
draw
energy
summon
structure
channel
attack
d6
damage
death
victory
turn transition
```

Criar testes para casos normais e casos inválidos.

------------------------------------------------------------------------

# 18. PHASE 12 --- LOCAL PLAYABLE PROTOTYPE

Agora construir uma versão local.

Objetivo:

``` text
dois jogadores no mesmo navegador
```

Pode usar:

``` text
local state
```

Não usar Google Sheets ainda.

------------------------------------------------------------------------

# 19. PHASE 13 --- FRONTEND CORE

Implementar:

``` text
Home
Create Room
Join Room
Lobby
Game
Result
Rules
```

------------------------------------------------------------------------

# 20. PHASE 14 --- BOARD UI

Implementar:

``` text
Hero
Creature lanes
Structure lanes
Channeling
Hand
Energy
Turn indicator
Action controls
Battle log
```

------------------------------------------------------------------------

# 21. PHASE 15 --- GOOGLE SHEETS DATA LAYER

Agora conectar persistência.

Criar interface:

``` text
GameRepository
```

Exemplo:

``` text
createGame()
getGame()
saveGame()
saveAction()
saveEvent()
```

A engine não deve conhecer Google Sheets diretamente.

------------------------------------------------------------------------

# 22. PHASE 16 --- SHEETS SCHEMA

Criar planilha:

``` text
FAREL_VIRTUAL_DB
```

Abas:

``` text
CONFIG
PLAYERS
ROOMS
GAMES
PLAYER_STATE
GAME_STATE
PLAYER_CARDS
CARDS
DECKS
DECK_CARDS
HEROES
ACTIONS
EVENTS
MATCHES
PLAYTEST
```

Criar documentação:

``` text
docs/10-google-sheets-schema.md
```

------------------------------------------------------------------------

# 23. PHASE 17 --- APPS SCRIPT API

Implementar:

``` text
createRoom
joinRoom
startGame
getState
submitAction
getEvents
finishGame
```

Usar:

``` text
LockService
```

nas operações críticas.

------------------------------------------------------------------------

# 24. PHASE 18 --- API SECURITY

Implementar:

-   session token;
-   player ownership;
-   action authorization;
-   state sanitization;
-   hidden hand protection;
-   input validation.

------------------------------------------------------------------------

# 25. PHASE 19 --- MULTIPLAYER

Implementar:

``` text
Player 1
    ↕
Apps Script
    ↕
Sheets
    ↕
Player 2
```

Inicialmente via polling.

Intervalo:

``` text
1000–2000 ms
```

somente durante partida ativa.

------------------------------------------------------------------------

# 26. PHASE 20 --- END-TO-END

Teste real:

``` text
Browser A
+
Browser B
```

Fluxo:

``` text
create room
join
start
draw
play
attack
defend
damage
destroy
win
```

Nenhuma intervenção manual na planilha.

------------------------------------------------------------------------

# 27. PHASE 21 --- TELEMETRY

Implementar coleta:

-   duração;
-   turnos;
-   ações;
-   energia;
-   dano;
-   rolagens;
-   destruições;
-   defesa do herói;
-   cartas utilizadas.

------------------------------------------------------------------------

# 28. PHASE 22 --- PLAYTEST MODE

Criar ferramentas para facilitar testes:

``` text
debug mode
restart match
quick room
preset decks
test cards
```

------------------------------------------------------------------------

# 29. PHASE 23 --- OBSERVABILITY

Criar:

``` text
/admin
```

ou ferramenta equivalente para visualizar:

``` text
active rooms
active games
game state
events
errors
matches
```

Não precisa ser bonito.

Precisa ser útil.

------------------------------------------------------------------------

# 30. PHASE 24 --- DEPLOY

Deploy:

``` text
Frontend → Vercel
Backend → Google Apps Script
Database → Google Sheets
```

Testar produção.

------------------------------------------------------------------------

# 31. PHASE 25 --- FIRST PLAYTEST

Primeiro teste humano.

Não alterar regras durante a partida.

Registrar:

``` text
bug
confusão
exploit
desequilíbrio
diversão
tempo
decisões
```

------------------------------------------------------------------------

# 32. PHASE 26 --- DESIGN REVIEW

Depois das partidas:

``` text
DATA
↓
OBSERVAÇÕES
↓
HIPÓTESES
↓
ALTERAÇÃO DE REGRA
↓
NOVO RULESET
```

Nunca:

``` text
"pareceu ruim"
↓
mudar código imediatamente
```

------------------------------------------------------------------------

# 33. CICLO DE ITERAÇÃO

O projeto passa a operar em ciclos:

``` text
RULESET
   ↓
IMPLEMENT
   ↓
TEST
   ↓
PLAY
   ↓
OBSERVE
   ↓
ANALYZE
   ↓
CHANGE RULE
   ↓
RULESET NEXT VERSION
```

Exemplo:

``` text
Ruleset 1.1
↓
MVP
↓
Playtest
↓
Ataque obrigatório parece ruim
↓
Ruleset 1.2
↓
Novo teste
```

------------------------------------------------------------------------

# 34. CHECKPOINTS

## CHECKPOINT A

``` text
ENGINE WORKS
```

Sem UI complexa.

------------------------------------------------------------------------

## CHECKPOINT B

``` text
LOCAL GAME WORKS
```

------------------------------------------------------------------------

## CHECKPOINT C

``` text
PERSISTENCE WORKS
```

------------------------------------------------------------------------

## CHECKPOINT D

``` text
MULTIPLAYER WORKS
```

------------------------------------------------------------------------

## CHECKPOINT E

``` text
FULL MATCH WORKS
```

------------------------------------------------------------------------

## CHECKPOINT F

``` text
PLAYTEST READY
```

------------------------------------------------------------------------

# 35. ORDEM DE PRIORIDADE

Sempre:

``` text
P0 — correctness
P1 — playability
P2 — observability
P3 — UX
P4 — aesthetics
P5 — optimization
```

Se houver conflito:

``` text
GAMEPLAY > VISUAL
```

------------------------------------------------------------------------

# 36. O QUE NÃO FAZER DURANTE O MVP

Não adicionar sem autorização:

``` text
accounts
social
chat
ranking
marketplace
monetization
AI opponent
animations complexas
3D
sound system complexo
mobile app
microservices
database migration
```

------------------------------------------------------------------------

# 37. CRITÉRIO PARA UMA NOVA DEPENDÊNCIA

Antes de instalar qualquer pacote:

1.  É realmente necessário?
2.  A funcionalidade pode ser implementada com o stack existente?
3.  A dependência está estável?
4.  A dependência aumenta complexidade?
5.  Ela será útil após a migração do Google Sheets?

Se não houver justificativa clara:

``` text
DO NOT ADD
```

------------------------------------------------------------------------

# 38. GIT WORKFLOW

Cada missão deve gerar uma mudança identificável.

Preferência:

``` text
mission/00-audit
mission/01-project-init
mission/02-domain-model
...
```

Commits:

``` text
feat(engine): add game state
feat(combat): implement d6 damage
test(combat): add attack validation
fix(api): prevent unauthorized action
```

------------------------------------------------------------------------

# 39. REGRA DE COMMIT

Não misturar:

``` text
feature
+
refactor
+
visual redesign
+
bug fix
```

em uma única mudança sem necessidade.

------------------------------------------------------------------------

# 40. WORKFLOW HUMANO + AGY

O ciclo será:

``` text
ALEX
 ↓
define objective
 ↓
AGY
 ↓
audit / implement
 ↓
AGY report
 ↓
ALEX reviews
 ↓
ALEX approves
 ↓
next mission
```

O AGY não assume autoridade de game designer.

------------------------------------------------------------------------

# 41. COMO VOCÊ DEVE OPERAR COM O AGY

Para cada missão:

### 1.

Copie somente a missão atual.

### 2.

Envie ao AGY.

### 3.

Deixe executar.

### 4.

Leia o relatório.

### 5.

Se `PASS`, avance.

### 6.

Se `BLOCKED`, traga o bloqueio para este chat.

### 7.

Se surgir uma decisão de regra, pare.

------------------------------------------------------------------------

# 42. NÃO ENTREGAR O BUILD PLAN INTEIRO AO AGY DE UMA VEZ

O `AGY_BUILD_PLAN.md` pode ficar na pasta do projeto como documentação.

Mas as execuções devem ser:

``` text
MISSION 00.01
↓
MISSION 01.01
↓
MISSION 01.02
...
```

Isso reduz deriva arquitetural.

------------------------------------------------------------------------

# 43. PRIMEIRA MISSÃO

A primeira instrução a enviar ao AGY agora é:

``` text
MISSION 00.01 — PROJECT AUDIT

Leia o PDR MASTER e o AGY BUILD PLAN.

Não implemente nada.

Faça uma auditoria completa do diretório atual do projeto FAREL VIRTUAL.

Identifique:

1. estrutura de pastas;
2. arquivos existentes;
3. arquivos duplicados;
4. documentação;
5. código existente;
6. configurações;
7. package manager;
8. framework atual;
9. dependências;
10. scripts;
11. estado do Git;
12. possíveis conflitos com o PDR MASTER;
13. qualquer tentativa anterior de implementação;
14. arquivos que devem ser preservados;
15. arquivos potencialmente obsoletos.

Compare a estrutura encontrada com a arquitetura definida no PDR MASTER.

Não altere arquivos.

Não crie código.

Não instale dependências.

Não faça refactor.

Ao terminar, crie:

docs/agy/AUDIT_REPORT.md

O relatório deve conter:

- CURRENT STATE
- EXPECTED ARCHITECTURE
- GAPS
- CONFLICTS
- DUPLICATES
- RISKS
- RECOMMENDED NEXT STEP

Se encontrar qualquer decisão de game design indefinida, registre-a como OPEN QUESTION.

STATUS FINAL:
PASS ou BLOCKED.
```

------------------------------------------------------------------------

# 44. REGRA DE CONTROLE

Depois de cada missão, o AGY deve parar.

Não executar automaticamente a próxima missão.

O pipeline é deliberadamente manual:

``` text
MISSION
↓
RESULT
↓
REVIEW
↓
APPROVAL
↓
NEXT MISSION
```

------------------------------------------------------------------------

# 45. DEFINITION OF MVP READY

O projeto entra em `PLAYTEST READY` somente quando:

``` text
[ ] engine testado
[ ] regras implementadas
[ ] ambiguidades críticas resolvidas
[ ] local game funcionando
[ ] Sheets conectado
[ ] Apps Script funcionando
[ ] rooms funcionando
[ ] multiplayer funcionando
[ ] hidden information protegida
[ ] RNG server-side
[ ] eventos registrados
[ ] partida completa funcionando
[ ] dois navegadores testados
[ ] deploy realizado
[ ] playtest checklist criado
```

------------------------------------------------------------------------

# 46. FASE POST-MVP

Somente depois do primeiro ciclo de testes:

``` text
PLAYTEST
↓
BALANCE
↓
RULESET 1.2
↓
ENGINE UPDATE
↓
PLAYTEST 2
```

Depois:

``` text
MVP VALIDATED
↓
ARCHITECTURE REVIEW
↓
GOOGLE SHEETS → SUPABASE
```

A migração só deve acontecer quando houver uma razão real:

-   necessidade de realtime;
-   concorrência;
-   escala;
-   autenticação;
-   persistência robusta;
-   volume de partidas.

------------------------------------------------------------------------

# 47. VISÃO FINAL DA LINHA DE PRODUÇÃO

``` text
                    ┌───────────────┐
                    │  PDR MASTER   │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ AGY BUILD PLAN│
                    └───────┬───────┘
                            │
                            ▼
                     ┌────────────┐
                     │  MISSION   │
                     └─────┬──────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ AGY EXECUTES  │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    TESTS     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    REVIEW    │
                    └──────┬───────┘
                           │
                 ┌─────────┴─────────┐
                 │                   │
                FAIL                PASS
                 │                   │
                 ▼                   ▼
               FIX             CHECKPOINT
                                     │
                                     ▼
                              NEXT MISSION
                                     │
                                     ▼
                              PLAYTEST
                                     │
                                     ▼
                               NEW RULESET
```

------------------------------------------------------------------------

# 48. PRINCÍPIO FINAL

O AGY é o executor.

O PDR é a arquitetura.

O Ruleset é a autoridade de game design.

O Game Engine é a autoridade operacional.

O Google Sheets é a persistência provisória.

O Playtest é o juiz.

E os dados são o mecanismo de decisão.

``` text
FAREL
não deve ser "codado até parecer bom".

FAREL deve ser:

FORMALIZADO
→ IMPLEMENTADO
→ TESTADO
→ JOGADO
→ MEDIDO
→ ALTERADO
→ TESTADO NOVAMENTE.
```

**FIM DO AGY BUILD PLAN**
