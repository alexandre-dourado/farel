# FIX 09 REPORT: CRITICAL ENGINE FIXES

**Status:** ⚠️ PARCIALMENTE RESOLVIDO (Aguardando Decisão)

## Resumo das Correções Críticas Implementadas

### ✅ 1. Pureza do Motor (Imutabilidade Corrigida)
As funções de estado base (\startGame\, \startTurn\, \endTurn\) foram refatoradas para utilizar exclusivamente \structuredClone(state)\. Isso extermina de vez os perigos de *shallow copy mutada* que estávamos vazando para os turnos. A suíte de testes comprova essa imutabilidade (Problema 1).

### ✅ 2. O Ralo de Energia de \playCard\
A função \playCard\ agora EXIGE um \laneIndex\ para Cartas de Criaturas e varre agressivamente se o slot não apenas existe, mas se está livre pelo lado do jogador em questão.
Adicionado na UI (app/page.tsx) o fluxo de 2 cliques: o usuário seleciona a carta (ela ganha um anel de destaque amarelo) e depois clica na lane desejada para baixar a criatura. 

### ✅ 3. O Fim da Ametralhadora de Ataques (Status EXHAUSTED)
Criaturas agora ganham \EntityStatus.EXHAUSTED\ após finalizarem um \esolveAttack\. Uma criatura exausta lançará erro brutal se for enviada de novo para combate. No início do turno do seu dono (\startTurn\), seu status é refrescado silenciosamente para \READY\.

### ✅ 4. Validação de Titularidade 
Você não joga mais no turno do inimigo. Inserimos bloqueios (throws) para verificar firmemente se \playerId === state.activePlayerId\ no início das chaves lógicas de combate e jogar carta.

---

## ❓ PROBLEMA 5 - A DEFESA CORINGA (DECISÃO NECESSÁRIA)

O Herói deveria proteger a board (Wildcard Defense) por escolha de quem *defende*, mas hoje o *Atacante* decide quando focar no herói. Para consertar, precisamos alterar o fluxo e temos duas saídas arquiteturais (Rotas):

- **ROTA A (Purista):** Ataque fica "Pendente" no estado. Defensor reage via UI no turno do inimigo escolhendo se defende com o herói ou não. O dano é finalmente processado. *(Complexo em Polling, risco de lentidão massiva na UX).*
- **ROTA B (Pragmática MVP):** O Defensor pré-configura uma chave ("Herói Bloqueia Tudo", "Herói Ignora Tudo") no seu lado da tela. O ataque do inimigo varre o lado do defensor respeitando essa regra automatizada. *(Simples e imediato)*.

> [!IMPORTANT]
> **OPEN QUESTION para Alexandre:** Como quer seguir com a Defesa do Herói? (ROTA A ou ROTA B)?
