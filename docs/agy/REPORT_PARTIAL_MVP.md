# FAREL VIRTUAL MVP: RELATÓRIO PARCIAL DE AUDITORIA (CHUNKS 0 a 4)

**Missão:** `ONESHOT-MVP-01`
**Status da Execução:** PAUSADO (Checkpoint programado para revisão externa)
**Versão do Motor:** 0.1 (In-Memory Backend)

---

## 1. ESCOPO IMPLEMENTADO ATÉ O MOMENTO

As fases iniciais do projeto focaram na criação do núcleo de regras estritas (*Game Engine*) para rodar as partidas no servidor de forma agnóstica em relação ao cliente e ao banco de dados final.

### Chunk 0 — Fundação e Arquitetura
- **Stack Inicializada:** Next.js + React 18, TypeScript (strict mode), Tailwind CSS e Vitest (para testes unitários).
- **Estrutura de Pastas:** `app/`, `components/`, `game/`, `lib/`, `types/`, `tests/`, `scripts/`, `docs/`, `apps-script/`.
- **Controle de Versão:** Repositório Git inicializado com o commit fundacional.
- *Nota Técnica:* Houve um lock transitório do Windows (`EPERM`) no `node_modules` durante a criação do Next.js. Contornamos escrevendo os módulos em PowerShell e rodando validações TypeScript em modo `--noEmit`.

### Chunk 1 — Domínio e Tipagem (TypeScript Contracts)
- Tipagem robusta de todas as entidades fundamentais do `pdr.txt`.
- **Interfaces criadas:** `Player`, `Hero`, `Card`, `Creature`, `Structure`, `Spell`, `Board`, `GameState`, `EventLog`.
- **Enums criados:** `CardType`, `EntityType`, `GameStatus`, `TurnPhase`, `Zone`, `ActionType`, `EventType`, `EntityStatus`.
- O estado do `Board` reflete fielmente as restrições: 5 lanes para criaturas (`p1Creature`, `p2Creature`), e uma `backline` separada para estruturas (5 slots) e canalizações (3 slots).

### Chunk 2 — Configuração de Regras (RulesConfig)
- Mecanismo de injeção de regras criado para isolar os "magic numbers" do código.
- Implementação de limites seguros (`validateRulesConfig`): energia base (5), tamanho de mão inicial (5) e máxima (5), draws por turno, bônus limite, além da flexibilidade da rolagem de ataque (`1d6`).

### Chunk 3 — Motor de Jogo Principal (Game Engine Core)
- Implementação do estado dinâmico: `createGame`, `startGame`, `startTurn`, `draw`, `playCard` e `endTurn`.
- O Engine gerencia 100% da transição de estado, negando mutações não-autorizadas (ex: o cliente não altera energia, ele apenas pede para jogar a carta).
- **Limites de mão:** Implementado exatamente como no design. Não há limite durante o seu turno; entretanto, no evento `endTurn`, as cartas sobressalentes são compulsoriamente descartadas para o cemitério.
- **Energia:** Atualizada corretamente e volatilizada no final do turno (sem carry-over não autorizado), mas considerando bônus gerados pelas estruturas ativas.

### Chunk 4 — Motor de Combate (Combat Engine)
- Motor de combate componentizado em `game/engine/combat.ts`.
- **RNG Híbrido Server-Side:** A rolagem de ataque padrão é 1d6 (no servidor). Dano final é `1d6 + attacker.attackModifier` (sem teto máximo).
- **Hierarquia de Alvos:** Implementado fallback dinâmico: 
  1. O sistema ataca a criatura rival correspondente na mesma lane; 
  2. Se vazia, avança sobre as Estruturas; 
  3. Se a defesa estiver totalmente limpa, o dano vai direto ao Herói.
- **Defesa Coringa do Herói:** Incluída a flag paramétrica `defendWithHero`. Se o jogador ativá-la, a hierarquia de lane é subvertida, e o Herói absorve integralmente o dano independentemente de onde o ataque partiu. Usos ilimitados.
- **Condição de Vitória:** Quando a vida de um herói atinge `<= 0`, o status altera-se imperativamente para `FINISHED` com o log de evento `GAME_WON`.

---

## 2. DECISÕES DE DESIGN & TRADE-OFFS

Durante a orquestração dos Subagentes, as seguintes decisões estruturais foram consolidadas com base no documento `PDR`:

1. **Abstração do D6:** O servidor assume a roletagem. O cliente jamais fará submissão de valores de rolagem, respeitando a premissa de que a interface não possui autoridade.
2. **Defesa do Herói:** A implementação do herói interceptador (coringa) exige que o cliente envie explicitamente a intenção (ex: `action: DEFEND_WITH_HERO`) no fluxo do combate para trocar o alvo antes do cálculo final.
3. **Cartas Mockadas:** O Engine temporariamente fabrica cartas fictícias no método genérico de compra (ex: `drawn_${timestamp}`) a fim de validar as regras de mão e limites de baralho antes da persistência completa no Google Sheets.
4. **Sem Componentes React (ainda):** Toda lógica criada de 0 a 4 funciona perfeitamente sem o React carregado, garantindo alta portabilidade do Engine (podendo ser testado via CLI ou instanciado no Google Apps Script).

---

## 3. PRÓXIMOS PASSOS PENDENTES (CHUNKS 5 A 8)

Após a auditoria e validação por parte da IA revisora externa, a execução irá desbloquear:

- **Chunk 5:** Suíte de testes unitários consolidada e profunda.
- **Chunk 6:** UI Local do Tabuleiro (React/Tailwind renderizando o GameState em memória).
- **Chunk 7:** Backend Apps Script & Google Sheets DB.
- **Chunk 8:** Multiplayer Polling Integration & Playtest Sandbox.

---

**[FIM DO RELATÓRIO PARCIAL]**
Por favor, submeta este conteúdo à IA revisora e reporte quaisquer adaptações ou questionamentos que precisem ser incorporados antes de seguirmos.
