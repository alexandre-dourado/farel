# Relatório de Auditoria Técnica - Farel MVP

## 1. O que está implementado corretamente
- **UI (Next.js)**: A interface apresenta uma estrutura simples e funcional, separando perfeitamente a fase de lobby da fase de jogo. O ciclo de montagem de estado usando createGame, startGame flui bem pelo DOM usando componentes.
- **Polling (3s)**: O mecanismo de repetição a cada 3 segundos via setInterval dentro do useEffect opera corretamente e conta com clearInterval para evitar *memory leaks* ao desmontar.
- **Persistência no Google Apps Script (GAS)**: O relay básico que lê as requisições doPost e salva o JSON em uma linha da planilha (com Menu Admin próprio para setup) atende ao escopo inicial para persistência.

## 2. O que NÃO ESTÁ funcionando bem ou é frágil
- **Tratamento de Falhas no Polling**: Falhas de rede na chamada do GAS caem num console.error sem nenhum aviso na UI (nenhum _feedback_ pro player), deixando a tela paralisada.
- **CORS via 	ext/plain**: O truque no lib/api.ts evita as requisições *preflight* (OPTIONS) das quais o Apps Script sofre nativamente. Porém, não mitiga as falhas de _Payload Size_.
- **Gargalo no Tamanho de Estado (Payload Size)**: O GAS receberá payloads JSON massivos pois o estado inteiro de todos os arrays (hand, deck, board) da partida viaja a cada ação. Células do Sheets possuem um limite estrito de 50.000 caracteres, que quebrarão o jogo quando as ações gerarem um JSON longo.
- **Race Conditions (Condições de Corrida e Sobrescrita)**: Se os 2 jogadores interagirem quase ao mesmo tempo com o seu estado defasado, o último que chamar o GAS vai destruir (sobrescrever) a ação do outro.
- **Busca em Loop O(N) no Sheets**: getDataRange().getValues() varre a planilha toda a cada vez. Como o *polling* bate no Sheets de 3 em 3s, o crescimento da planilha vai rapidamente esgotar limites de CPU do Google (Execution Quotas).

## 3. Limitações da Arquitetura atual e melhorias
- **Client-Side Authoritative (Risco Crítico)**: A lógica do *Game Engine* (playCard, startTurn) sendo chamada e montando o 
ewState direto no Frontend significa que o Cliente é confiável (trusted). Isso permite fraudes (Trapaças no frontend alterando valores de HP e Mana) e agrava a _Race Condition_.
    - **Melhoria**: Mudar o *Game Engine* para rodar inteiramente num Backend/Serverless. O cliente deve enviar apenas "Ações" (ACTION_PLAY_CARD, id da carta), e o servidor valida e responde o estado computado de volta.
- **Limitações do Google Apps Script**: É inadequado para cenários *real-time* pela alta latência (geralmente > 1 segundo por request) e limites rígidos de invocação diária.
    - **Melhoria**: Migrar o armazenamento e o sistema multijogador para um ecossistema com suporte nativo em tempo real, como Supabase, Firebase Realtime Database ou Vercel KV + WebSockets.
- **Polling Passivo (3s)**: Causa estresse desnecessário e *delay* artificial no jogo.
    - **Melhoria**: Utilizar WebSockets ou Server-Sent Events (SSE) (ou os "realtime subscriptions" nativos das opções acima) onde o server "empurra" o novo estado apenas quando ocorre uma modificação.
