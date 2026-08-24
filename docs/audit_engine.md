# Auditoria do Farel MVP - Motor de Jogo (Engine)

## 1. O que está implementado corretamente
- **Clone de Estado (Parcialmente)**: O uso de structuredClone em funções como EnergyEngine.generateEnergy, draw, playCard e resolveAttack garante a imutabilidade do estado (nested state).
- **Limite de Mão**: A função endTurn descarta corretamente as cartas excedentes para o limite configurado em RulesConfig.max_hand, movendo-as para o cemitério (graveyard).
- **Summoning Sickness (Enjoo de Invocação)**: Em resolveAttack, é verificado corretamente se a criatura foi invocada no turno atual e se não possui a habilidade canAttackOnEntry.
- **Configuração de Regras**: Integração com RulesConfig está injetada em todas as funções principais da engine.

## 2. O que NÃO ESTÁ funcionando ou está faltando (Bugs e Robustez)
- **Quebra de Imutabilidade (Falha de Pureza)**: As funções startGame, startTurn e endTurn usam spread operator raso ({ ...state }), mas em seguida realizam mutações em objetos e arrays aninhados. Isso corrompe o estado original (side-effects). Devem usar structuredClone.
- **Criação de Cartas Mockada / Sem Baralho Real**: As funções draw e startGame geram cartas genéricas mockadas (type: CardType.CREATURE) a partir do nada em vez de retirá-las de um deck.
- **Lógica Quebrada e Incompleta no playCard**:
  - Se todas as lanes estiverem ocupadas, a carta e a energia são consumidas silenciosamente.
  - A criatura é automaticamente alocada na primeira lane vazia em vez de permitir que o jogador passe o índice desejado.
  - O método só lida com CardType.CREATURE.
- **Falta de Validação do Jogador Ativo**: Não há validação em playCard, resolveAttack ou endTurn que garanta que playerId === state.activePlayerId.
- **Limite de Energia Ignorado (maxEnergyCap)**: EnergyEngine gera a energia e a soma, mas não restringe o valor final ao maxEnergyCap do jogador.

## 3. Edge Cases não cobertos no combate e lógica de turnos
- **Ataques Infinitos (Falta de Estado de Ação)**: Não existe nenhuma flag do tipo hasAttackedThisTurn no estado da entidade Creature. O mesmo jogador pode invocar resolveAttack várias vezes para a mesma criatura no mesmo turno.
- **Entidades Destruídas Somem**: Quando criaturas ou estruturas são destruídas, não são movidas para o graveyard do proprietário.
- **Problema de Design com defendWithHero**: O parâmetro booleano defendWithHero em resolveAttack permite ignorar a frontline (criaturas e estruturas) arbitrariamente se passado pelo atacante.
- **Morte do Herói**: Ao atacar o herói e reduzi-lo a 0 de HP, o evento loga HERO_DESTROYED, setando a partida para FINISHED, porém a execução da função não é terminada (não há early return).
