# FAREL VIRTUAL — PIPELINE COMPLETO (MODO ONESHOT / SUBAGENTS)

Baseado no PDR MASTER + AGY BUILD PLAN. Este documento adapta o pipeline
original (que era sequencial e manual, missão-por-missão) para um modo
**oneshot supervisionado**: o AGY CLI recebe UMA missão-mãe
(`MISSION_ONESHOT_MVP.md`) e a executa internamente em CHUNKS, usando
subagents especializados, sem pedir aprovação humana a cada micro-passo —
mas parando automaticamente se encontrar uma decisão de game design em
aberto (regra inegociável herdada do BUILD PLAN original, seção 2.1).

---

## 1. POR QUE CHUNKS E NÃO "TUDO DE UMA VEZ"

Contexto e performance de um agente degradam com escopo grande demais.
Por isso o MVP é fatiado em **9 chunks**, cada um pequeno o bastante para
um subagent executar com foco total, mas grande o bastante para não gerar
overhead de coordenação.

Cada chunk tem:
- um subagent dono (persona/especialidade);
- inputs necessários (o que ele precisa ler antes);
- output esperado (arquivos);
- critério de aceite objetivo (testável);
- dependência de chunk anterior (o que precisa estar PASS antes de começar).

---

## 2. MAPA DE SUBAGENTS

```text
ORCHESTRATOR (AGY principal)
   │
   ├── AGENT_INIT        → Chunk 0: fundação (Next.js, TS, Tailwind, estrutura de pastas, Git)
   ├── AGENT_DOMAIN       → Chunk 1: tipos de domínio (Player, Hero, Card, Board, GameState, enums)
   ├── AGENT_CONFIG       → Chunk 2: RulesConfig + validação
   ├── AGENT_ENGINE       → Chunk 3: Game Engine core (createGame, startGame, turno, energia, compra)
   ├── AGENT_COMBAT       → Chunk 4: Combat Engine (ataque, alvo, d6, buff, morte, vitória)
   ├── AGENT_TEST         → Chunk 5: suíte de testes unitários (cobre chunks 1–4)
   ├── AGENT_UI           → Chunk 6: Board UI local (sem multiplayer, engine em memória)
   ├── AGENT_BACKEND      → Chunk 7: Google Sheets schema + Apps Script API
   └── AGENT_MULTIPLAYER  → Chunk 8: integração UI ↔ API ↔ Sheets (polling, sala, partida completa)
```

O ORCHESTRATOR nunca implementa código diretamente: ele delega a cada
subagent, valida o output contra o critério de aceite do chunk, e só então
libera o próximo.

---

## 3. ORDEM DE EXECUÇÃO E PARALELISMO

```text
Chunk 0 (INIT)
   ↓
Chunk 1 (DOMAIN) ──┐
                    ├──► Chunk 2 (CONFIG)   [podem rodar em paralelo entre si,
                    │                        ambos dependem só do Chunk 0]
   ↓ (após 1 e 2 PASS)
Chunk 3 (ENGINE)
   ↓
Chunk 4 (COMBAT)
   ↓
Chunk 5 (TESTS)         ← gate obrigatório: sem isso PASS, não avança
   ↓
Chunk 6 (UI LOCAL)
   ↓
Chunk 7 (BACKEND: Sheets + Apps Script)  ← pode começar em paralelo ao 6,
                                            pois não depende da UI
   ↓ (após 6 e 7 PASS)
Chunk 8 (MULTIPLAYER)
   ↓
CHECKPOINT F — PLAYTEST READY (teste dos dois navegadores, PDR seção 90)
```

Chunks 1+2 e chunks 6+7 são os únicos pares seguros para paralelismo real
(não escrevem nos mesmos arquivos e não têm dependência cruzada). Todo o
resto é sequencial porque cada chunk consome o output do anterior.

---

## 4. GATES DE QUALIDADE (não pular)

Antes de qualquer chunk avançar, os testes automatizados mínimos do PDR
(seção 88) e os testes de segurança (seção 89) precisam estar cobertos
incrementalmente — não deixar tudo para o Chunk 5. Cada subagent que
implementa lógica (Chunks 1, 2, 3, 4) já escreve os testes da sua própria
parte; o Chunk 5 é consolidação + cobertura de gaps, não o início dos testes.

---

## 5. REGRA DE OURO (herdada do PDR, seção 93)

> FAREL VIRTUAL não existe para provar que o jogo está pronto.
> Ele existe para descobrir se o jogo funciona.

Isso vale também para os subagents: se uma regra do PDR estiver ambígua,
o subagent PARA aquele chunk, registra em `OPEN_QUESTIONS` e o
ORCHESTRATOR reporta a você antes de decidir sozinho. Nenhum subagent tem
autoridade de game designer (BUILD PLAN, seção 40).

---

## 6. VISUAL SÓ NO FINAL

Nenhum chunk de 0 a 8 lida com arte final, animações ou identidade visual.
Os assets provisórios (ver `ASSET_GEN_PROMPT.md`) servem apenas para a UI
local (Chunk 6) não ficar com divs cinzas — são placeholders funcionais,
não produção. Polish visual é pós-MVP (M13 / PHASE correspondente no
AGY_BUILD_PLAN original).
