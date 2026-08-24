# MISSION 08.FIX — MULTIPLAYER CONNECTIVITY REMEDIATION

MISSION_ID: FIX-08-CONNECTIVITY
STATUS: NOT_STARTED
CONTEXTO: usuário reporta "a planilha cria linha, mas o jogo não funciona" —
UI trava em "Loading or waiting for state...", nunca recebe o estado de volta.

---

## READ_FIRST

```text
1. apps-script/Code.gs
2. lib/api.ts
3. app/page.tsx
4. docs/agy/RULESET_EXTRACT.md
```

---

## PROBLEMA 1 — RESPOSTA DO APPS SCRIPT BLOQUEADA NO NAVEGADOR (CORS)

Diagnóstico confirmado: a linha é gravada na planilha (o POST chega e
executa no servidor), mas o `fetch()` do navegador falha ao LER a
resposta porque o Apps Script não retorna o cabeçalho
`Access-Control-Allow-Origin` esperado — sintoma clássico e documentado
de integração Apps Script + fetch.

### TASK

```text
- Confirmar/reconfigurar a implantação (Deploy) do Apps Script:
  tipo "Web app", "Execute as: Me", "Who has access: Anyone".
- Publicar como NOVA implantação (não apenas salvar) sempre que Code.gs
  mudar — a URL antiga não atualiza sozinha.
- Adicionar tratamento explícito de erro em lib/api.ts: se
  response.ok === false ou o parse de JSON falhar, lançar um erro claro
  (ex: "Não foi possível conectar ao servidor. Verifique se o Apps
  Script foi implantado como Web App público.") em vez de deixar a
  Promise rejeitar silenciosamente.
- Adicionar um `console.log` temporário de diagnóstico em cada função de
  lib/api.ts logando status HTTP e corpo bruto da resposta antes do
  JSON.parse, para facilitar debug futuro.
```

### ACCEPTANCE_CRITERIA

```text
[ ] Uma chamada real de createMatch → pollState, feita de dois navegadores
    diferentes, retorna o estado da partida na UI (não trava em
    "Loading...")
[ ] Erros de rede/deploy mostram mensagem legível na tela, não um
    travamento silencioso
```

---

## PROBLEMA 2 — JOGADOR 2 NUNCA REGISTRA ENTRADA NA PARTIDA

`joinMatch` existe em `lib/api.ts` mas nunca é chamado em `app/page.tsx`.
`handleJoinMatch` hoje só esconde o lobby, sem avisar o servidor.

### TASK

```text
- Em app/page.tsx, handleJoinMatch deve chamar joinMatch(matchId, ...)
  antes de setInLobby(false), validando que a partida existe (usar
  pollState primeiro; se não existir, mostrar erro "Partida não
  encontrada" em vez de travar).
- No Apps Script (Code.gs), registrar explicitamente no estado que o
  jogador 2 entrou (ex: campo state.players.p2.joined = true), para
  permitir futuramente impedir início de partida sem os dois jogadores.
```

### ACCEPTANCE_CRITERIA

```text
[ ] Jogador 2 que tenta entrar em um matchId inexistente vê uma
    mensagem de erro clara, não uma tela travada
[ ] O estado da partida reflete que ambos os jogadores entraram
```

---

## PROBLEMA 3 — MOTOR DE JOGO RODA NO CLIENTE, NÃO NO SERVIDOR

Hoje `game/engine` é importado direto em `app/page.tsx` — quem calcula
turno, energia, e principalmente a rolagem de dado (`Math.random()` em
combat.ts) é o navegador do jogador que está jogando a ação. O Apps
Script apenas guarda o JSON que o cliente manda, sem revalidar nada.
Isso contraria a regra do PDR (RNG e validação sempre no servidor).

### TASK (pode ficar para depois do playtest pessoal — não é bloqueante para jogar com um amigo de confiança, mas precisa estar registrado como dívida técnica)

```text
- Mover as chamadas de game/engine (createGame, startTurn, playCard,
  resolveAttack, endTurn) para dentro de Code.gs (Apps Script também
  roda JavaScript/GAS, então a lógica pode ser portada ou reescrita lá).
- O cliente passa a enviar apenas a INTENÇÃO da ação (ex: "quero jogar
  a carta X", "quero atacar a lane 2"), nunca o estado já calculado.
- O servidor recalcula o resultado, salva, e devolve o novo estado.
- Isso fecha de vez o requisito de segurança do PDR seção 89.
```

### ACCEPTANCE_CRITERIA

```text
[ ] O cliente nunca envia um GameState pronto para o servidor — apenas
    o tipo de ação e seus parâmetros
[ ] O resultado do dado (roll) só existe depois de passar pelo servidor
[ ] Editar o estado manualmente no localStorage do navegador não tem
    nenhum efeito sobre o que é salvo na planilha
```

## DO_NOT

```text
- Não avançar Problema 3 antes de Problemas 1 e 2 estarem resolvidos e
  confirmados por você jogando uma partida de ponta a ponta.
- Não trocar a arquitetura de Sheets por outro banco de dados sem
  decisão explícita sua.
```

## OUTPUT

Relatório em `docs/agy/FIX_08_REPORT.md`, com print ou log do teste real
de dois navegadores jogando uma partida completa.
