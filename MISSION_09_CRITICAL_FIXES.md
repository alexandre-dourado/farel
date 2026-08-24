# MISSION 09 — CRITICAL ENGINE FIXES (pós-auditoria externa)

MISSION_ID: FIX-09-CRITICAL
STATUS: NOT_STARTED
PRECEDE: bloqueia qualquer nova feature até reportar PASS
CONTEXTO: auditoria externa (Tech + Engine) revisou o código pós-Chunk 8 e
encontrou 5 problemas críticos confirmados por revisão manual do código.
Esta missão substitui e prioriza sobre a MISSION_08_FIX anterior — os
Problemas 1 e 2 dela continuam válidos, mas os itens abaixo são mais
urgentes.

---

## READ_FIRST

```text
1. pdr.txt
2. docs/agy/RULESET_EXTRACT.md
3. game/engine/index.ts
4. game/engine/combat.ts
5. docs/agy/FIX_04_REPORT.md   (para ver o que já foi corrigido antes —
   não refazer, só completar o que ficou pela metade)
```

---

## PROBLEMA 1 — CLONE RASO AINDA PRESENTE (regressão da FIX-04)

`startGame`, `startTurn` e `endTurn` em `game/engine/index.ts` ainda usam
`{ ...state, ... }` (raso) em vez de `structuredClone(state)`. Isso
mutava o `state` original recebido como parâmetro — especificamente
`newState.logs.push(...)` e `player.hand = ...` / `player.graveyard.push(...)`
em `endTurn` alteram arrays que são a MESMA referência do estado anterior.

### TASK

```text
- Trocar `{ ...state, ... }` por `structuredClone(state)` seguido da
  atribuição dos campos alterados, nas 3 funções: startGame, startTurn
  (linha inicial), endTurn.
- Repetir o teste que a FIX-04 pediu (comprovar que o `state` original
  passado como argumento não muda após a chamada) para as 3 funções —
  não só para as que já tinham sido testadas.
```

### ACCEPTANCE_CRITERIA

```text
[ ] Nenhuma função em game/engine/index.ts usa spread raso ({ ...state })
    para gerar um novo GameState — grep confirma zero ocorrências fora
    de clones já profundos
[ ] Teste comprova imutabilidade nas 3 funções listadas
```

---

## PROBLEMA 2 — PLAYCARD ENGOLE RECURSO SEM COLOCAR NADA

`playCard` deduz energia e remove a carta da mão **antes** de verificar
se existe uma lane vazia. Se o board estiver cheio, o jogador perde a
carta e a energia sem nenhum efeito. Além disso, o sistema escolhe a
lane sozinho — o jogador não tem escolha.

### TASK

```text
- Adicionar parâmetro `laneIndex` (opcional para STRUCTURE/SPELL,
  obrigatório para CREATURE) em playCard.
- Validar ANTES de qualquer dedução: a lane escolhida existe e está
  vazia. Se não, throw new Error("Lane inválida ou ocupada") sem tocar
  em energia ou mão.
- Só depois da validação: deduzir energia, remover carta da mão, colocar
  a criatura na lane escolhida.
- Atualizar handlePlayCard em app/page.tsx e o componente de mão para
  permitir ao jogador clicar a carta e depois clicar a lane de destino
  (fluxo de 2 cliques é suficiente para o MVP).
```

### ACCEPTANCE_CRITERIA

```text
[ ] Tentar jogar uma criatura com todas as lanes ocupadas lança erro e
    NÃO deduz energia nem remove a carta da mão
[ ] Jogador consegue escolher em qual lane a criatura entra
```

---

## PROBLEMA 3 — ATAQUE INFINITO NA MESMA CRIATURA

Não existe controle de "esta criatura já atacou este turno". O enum
`EntityStatus.EXHAUSTED` existe mas nunca é usado.

### TASK

```text
- Em resolveAttack: após um ataque bem-sucedido, setar
  attacker.status = EntityStatus.EXHAUSTED.
- No início do TASK de resolveAttack: se attacker.status ===
  EntityStatus.EXHAUSTED, throw new Error("Criatura já atacou neste turno").
- Em startTurn: para todas as criaturas do jogador cujo turno está
  começando, se status === EXHAUSTED, voltar para READY.
```

### ACCEPTANCE_CRITERIA

```text
[ ] Uma criatura não pode atacar duas vezes no mesmo turno
[ ] A mesma criatura pode atacar novamente no turno seguinte do seu dono
```

---

## PROBLEMA 4 — VALIDAÇÃO DE TURNO/DONO AUSENTE

`playCard` e `resolveAttack` não checam se quem está agindo é o
`activePlayerId` da partida, nem se a criatura pertence a quem ataca.

### TASK

```text
- playCard: throw se playerId !== state.activePlayerId.
- resolveAttack: throw se o dono da lane (isP1/isP2 conforme attackerId)
  não corresponde a state.activePlayerId.
- Adicionar os dois casos como testes na suíte de segurança (retomar a
  lista de 8 casos do PDR seção 89 — hoje ainda incompleta).
```

### ACCEPTANCE_CRITERIA

```text
[ ] Uma ação enviada fora do turno do jogador é rejeitada com erro claro
[ ] Testes cobrindo os dois casos acima passam
```

---

## PROBLEMA 5 — DEFESA DO HERÓI DECIDIDA PELO LADO ERRADO (decisão de design, não só código)

`defendWithHero` hoje é escolhido por quem chama `resolveAttack` — ou
seja, pelo ATACANTE. A regra do PDR é que o herói intercepta a critério
de quem DEFENDE.

### ⚠️ Isto exige uma decisão sua antes de implementar

Numa arquitetura por polling (não é tempo real), dar ao defensor a
chance real de reagir a cada ataque exige um passo extra: o ataque fica
"pendente" até o defensor responder. Duas rotas possíveis — escolha uma
antes do subagent implementar:

```text
ROTA A (fiel ao PDR, mais trabalho):
  Ataque declarado → estado muda para "aguardando defesa" → defensor
  vê o ataque pendente e decide "defender com herói: sim/não" →
  só então o dano é calculado. Precisa de um novo TurnPhase ou de um
  campo pendingAttack no GameState.

ROTA B (simplificação pragmática para o MVP):
  O jogador pré-configura, no início do seu turno de defesa, uma opção
  fixa ("herói sempre defende" / "herói nunca defende" / "segue a
  hierarquia normal") que vale até a próxima vez que ele mudar. Não é
  fiel ao PDR letra por letra, mas resolve o "atacante decide pelo
  defensor" sem exigir um novo estado de "pendente".
```

### TASK

```text
- NÃO implementar nenhuma rota sem confirmação. Registrar como
  OPEN_QUESTION e aguardar decisão de Alexandre.
```

---

## ITENS DE MENOR PRIORIDADE (registrar, não bloquear)

```text
- Race condition (last-write-wins no Apps Script): mitigar com um
  campo `version` incrementado a cada submitAction; rejeitar escrita
  se a version enviada pelo cliente for menor que a atual salva.
  Simples de fazer, não precisa de LockService para o volume do MVP.
- Payload por célula (limite 50.000 chars) e scanning O(n) na planilha:
  reais, mas só viram problema em escala — registrar no roadmap de
  médio prazo (junto com a ideia de migrar para Supabase/Vercel KV
  já mencionada no relatório de auditoria), não agir agora.
```

## DO_NOT

```text
- Não implementar a Rota A ou B do Problema 5 sem resposta explícita.
- Não misturar esta missão com a migração de engine para o servidor
  (isso é o Problema 3 da MISSION_08_FIX — mantém-se como próximo
  passo depois desta).
```

## OUTPUT

Relatório em `docs/agy/FIX_09_REPORT.md`, com confirmação de que os
Problemas 1–4 passam nos critérios de aceite, e o Problema 5 registrado
como OPEN_QUESTION aguardando decisão.
