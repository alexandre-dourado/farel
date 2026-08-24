# 📜 FAREL MVP - RELATÓRIO DEFINITIVO DE AUDITORIA (V1.0)

Este relatório compila os laudos dos auditores técnicos de Infraestrutura (Tech) e Engenharia (Engine). Ele mapeia o estado exato da base de código atual, identificando o que já está maduro e as armadilhas técnicas que exigirão atenção nas próximas fases do projeto.

---

## ⚙️ 1. GAME ENGINE & RULES (Motor de Regras TS)

### ✅ O Que Funciona Bem (Fundamentos Sólidos)
* **Design Pattern Pureza/Clonagem:** Funções centrais como draw, playCard e esolveAttack adotam structuredClone com rigor, garantindo imutabilidade pesada e evitando side-effects no estado de React ou Polling.
* **Hand Limits & Cemitério:** O fluxo de endTurn já sabe calcular cartas excedentes, respeita as RulesConfig e descarta para a array graveyard.
* **Summoning Sickness:** A verificação de enjoo (invocado no mesmo turno, exceto se canAttackOnEntry) está robusta no fluxo de combate.

### 🔴 O Que Falta e Onde Quebra (Buracos Sistêmicos)
* **Side-Effects Letais nos Turnos:** As funções de fluxo de turno (startGame, startTurn, endTurn) ainda usam spread shallow clone ({ ...state }). Se mutarem objetos internos (como oard.lanes), vazarão referência para o estado anterior. **Risco Crítico**.
* **Sem Identidade Real de Deck:** draw e startGame estão gerando cartas mágicas (Mocking genérico) direto na mão, em vez de comprar um Array de cartas reais embaralhadas do Deck.
* **Bug Crítico de Invocação:** O playCard engole energia e consome a carta *silenciosamente* se o board já estiver cheio, e não permite escolher a Lane.
* **Ausência de Autenticação de Ações:** O Client manda ordens e o servidor obedece cegamente; não há trava no Engine barrando um P2 de mandar o comando de startTurn no meio do turno do P1 (playerId !== activePlayerId).
* **Ataque Infinito (Ametralhadora de D6):** Não existe a property hasAttackedThisTurn no state da Criatura. A mesma criatura pode ser enviada no esolveAttack inúmeras vezes no mesmo turno.
* **Defesa Coringa Falsa:** Atualmente, a flag defendWithHero na Action permite que o *Atacante* decida ignorar a board inteira e bater no Herói inimigo, o que quebra a regra de que *o Defensor* decide pular na frente (Wildcard Defense).

---

## 🌐 2. ARQUITETURA, UI E CLOUD (React + Apps Script)

### ✅ O Que Funciona Bem
* **Client-Side Visual Rendering:** A separação de Lobby e Board no React (Next.js) flui bem. Os componentes Dumb (HeroCard, LaneComponent) leem passivamente a estrutura complexa do JSON.
* **Integração com Google Sheets:** O script Code.gs age primorosamente como um NoSQL simplificado e resolve o armazenamento sem precisar de bancos externos de imediato.
* **Polling Assíncrono:** O setInterval de 3s roda confiantemente e com limpeza de Garbage Collector ao ser desmontado. 
* **CORS Resolvido:** Usar 	ext/plain livrou o sistema da trava de Preflight da nuvem do Google.

### 🔴 Riscos Arquiteturais Críticos e Fragilidades
* **Client-Side Authoritative (Cheating Master):** Atualmente, o frontend baixa o state via Polling, processa o ataque no computador local e joga o JSON resultante na cara do backend (Apps Script). **Qualquer jogador pode abrir as devtools, alterar a vida do seu herói para 9999 e mandar pro Server.**
* **The "Payload Bomb":** Cada turno, o JSON completo vai pro Apps Script. Se houverem muitos elementos, atingirá a cota de limite de texto por Célula do Google Sheets (50.000 chars), travando a partida fatalmente.
* **O/N Sheet Scanning:** A cada 3s, ambos jogadores batem no Apps Script, que varre a planilha INTEIRA com loop or até achar o ID. O Google pode bloquear você por "Execution Quota Exceeded".
* **Silêncio de Rádio:** Falhas na rede causam erro de Polling (visíveis apenas no F12 Console), e a UI fica congelada como se fosse a vez do inimigo para sempre.
* **Race Condition Server-less:** Se P1 ataca e P2 manda "End Turn" na mesma exata fração de segundo, o último pacote que chegar sobreescreve a realidade, anulando a jogada do oponente.

---

## 🚀 3. ROADMAP RECOMENDADO (Aonde Expandir)
1. **Migração do Trust (Urgente):** Trazer todo o game/engine para rodar **dentro** do Apps Script (Server). O front end deve enviar SÓ A INTENÇÃO (Ex: { "action": "PLAY_CARD", "cardId": "123", "lane": 2 }), e o GAS executa o Motor e atualiza a linha.
2. **Sistema de Lane Targeting:** Reescrever o Payload da UI para que, ao jogar uma carta, o jogador consiga clicar na Lane onde quer colocar.
3. **Mecânica de Estado hasAttackedThisTurn:** Inserir a flag em criaturas e virar esse boolean para *false* durante o startTurn.
4. **Substituição de Nuvem (Longo Prazo):** Mover o DB do GAS para algo realtime como **Supabase** (WebSockets) ou Vercel KV, eliminando as amarras do Payload Limit e o Polling engasgado de 3 segundos.
