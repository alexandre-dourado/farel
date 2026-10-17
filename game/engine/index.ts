import { GameState, PlayerState, EventLog } from '../../types/gameState';
import { GameStatus, TurnPhase, EventType, CardType, EntityStatus } from '../../types/enums';
import { Card, Hero, Player, Structure, Creature } from '../../types/entities';
import { Board, LaneState, BacklineState, ChannelingSlot } from '../../types/board';
import { RulesConfig, DEFAULT_RULES_CONFIG } from '../config/RulesConfig';
import { CardRegistry, HeroRegistry, buildDefaultDeck } from '../data/CardRegistry';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function createGame(gameId: string, players: Player[], config: RulesConfig = DEFAULT_RULES_CONFIG): GameState {
  const playersState: Record<string, PlayerState> = {};
  
  players.forEach((p, idx) => {
    // Escolhe herói padrão: P1 Viajante (12 HP), P2 Imperatriz (14 HP)
    const heroTemplate = p.heroId 
      ? (HeroRegistry.find(h => h.id === p.heroId) || HeroRegistry[idx % HeroRegistry.length])
      : HeroRegistry[idx % HeroRegistry.length];

    const hero: Hero = {
      id: `hero_${p.id}`,
      name: heroTemplate.name,
      maxHealth: heroTemplate.maxHealth,
      health: heroTemplate.health,
      baseDefense: heroTemplate.baseDefense || 0,
      baseEnergy: config.base_energy,
      artDirection: heroTemplate.artDirection
    };

    playersState[p.id] = {
      playerId: p.id,
      name: p.name || (p.id === 'p1' ? 'Jogador 1 (Viajante)' : 'Jogador 2 (Imperatriz)'),
      hero,
      hand: [],
      deck: buildDefaultDeck(p.id),
      deckCount: 15,
      graveyard: [],
      currentEnergy: 0,
      maxEnergyCap: config.base_energy,
      heroDefenseMode: 'AUTO',
      temporaryEnergy: 0
    };
  });

  const lanes: LaneState[] = Array(config.creature_slots).fill(null).map((_, i) => ({
    laneIndex: i,
    p1Creature: null,
    p2Creature: null
  }));

  const backline: Record<string, BacklineState> = {};
  players.forEach(p => {
    backline[p.id] = {
      structures: Array(config.structure_slots).fill(null),
      channeling: Array(config.channeling_slots).fill(null)
    };
  });

  const emptyBoard: Board = { lanes, backline };
  
  return {
    gameId,
    status: GameStatus.WAITING,
    turn: 0,
    activePlayerId: players[0]?.id || '',
    phase: TurnPhase.START,
    players: playersState,
    board: emptyBoard,
    logs: [{
      type: EventType.GAME_STARTED,
      message: 'Partida iniciada no modo Local Playtest.',
      timestamp: Date.now()
    }]
  };
}

export function startGame(state: GameState, config: RulesConfig = DEFAULT_RULES_CONFIG): GameState {
  const newState = structuredClone(state);
  newState.status = GameStatus.PLAYING;
  newState.turn = 1;
  newState.phase = TurnPhase.START;
  
  Object.keys(newState.players).forEach(playerId => {
    const player = newState.players[playerId];
    player.deck = shuffleArray(player.deck);
    
    // Distribui mão inicial (5 cartas)
    const hand: Card[] = [];
    for (let i = 0; i < config.starting_hand; i++) {
      const drawn = player.deck.pop();
      if (drawn) hand.push(drawn);
    }
    player.hand = hand;
    player.deckCount = player.deck.length;
  });

  newState.logs.push({
    type: EventType.TURN_STARTED,
    message: `Turno 1 iniciado para ${newState.players[newState.activePlayerId].name}.`,
    timestamp: Date.now()
  });

  return startTurn(newState, newState.activePlayerId, config);
}

export const EnergyEngine = {
  generateEnergy(state: GameState, playerId: string, config: RulesConfig = DEFAULT_RULES_CONFIG): GameState {
    const newState = structuredClone(state);
    const player = newState.players[playerId];
    
    const structures = newState.board.backline[playerId]?.structures || [];
    const bonus = structures.reduce((sum, struct) => {
      if (struct) {
        return sum + (struct.energyBonus || 0);
      }
      return sum;
    }, 0);
    
    const totalGenerated = config.base_energy + bonus + (player.temporaryEnergy || 0);
    player.currentEnergy = totalGenerated;
    player.maxEnergyCap = config.base_energy + bonus;
    player.temporaryEnergy = 0; // Consumido no cálculo do turno
    
    newState.logs.push({
      type: EventType.ENERGY_GENERATED,
      sourceId: playerId,
      value: totalGenerated,
      message: `${player.name} gerou ${totalGenerated} de energia (Base: ${config.base_energy}${bonus > 0 ? ` + ${bonus} de Estruturas` : ''}).`,
      timestamp: Date.now()
    });
    
    return newState;
  }
};

export function startTurn(state: GameState, playerId: string, config: RulesConfig = DEFAULT_RULES_CONFIG): GameState {
  let newState = structuredClone(state);
  newState.activePlayerId = playerId;
  newState.phase = TurnPhase.START;
  
  // 1. Desexausta todas as criaturas do jogador ativo
  const isP1 = playerId === Object.keys(newState.players)[0];
  newState.board.lanes.forEach(lane => {
    const creature = isP1 ? lane.p1Creature : lane.p2Creature;
    if (creature && creature.status === EntityStatus.EXHAUSTED) {
      creature.status = EntityStatus.READY;
    }
  });

  // 2. Resolve magias canalizadas com gatilho de início de turno (Ex: CHN-003 Ritual de Reserva)
  const channelingSlots = newState.board.backline[playerId].channeling;
  channelingSlots.forEach((slot, idx) => {
    if (slot && slot.card && slot.card.effectKind === 'delayed_energy') {
      newState.players[playerId].temporaryEnergy = (newState.players[playerId].temporaryEnergy || 0) + 2;
      newState.logs.push({
        type: EventType.SPELL_ACTIVATED,
        sourceId: playerId,
        message: `✨ ${slot.card.name} ativada no início do turno: +2 de energia concedida!`,
        timestamp: Date.now()
      });
      channelingSlots[idx] = null;
    }
  });

  // 3. Fase de Energia
  newState.phase = TurnPhase.ENERGY;
  newState = EnergyEngine.generateEnergy(newState, playerId, config);

  // 4. Fase de Compra (Draw)
  newState.phase = TurnPhase.DRAW;
  newState = draw(newState, playerId, config.draw_per_turn, config);

  // 5. Entra na Fase de Ação
  newState.phase = TurnPhase.ACTION;
  
  return newState;
}

export function draw(state: GameState, playerId: string, amount: number, config: RulesConfig = DEFAULT_RULES_CONFIG): GameState {
  const newState = structuredClone(state);
  const player = newState.players[playerId];
  
  let drawnCount = 0;
  for (let i = 0; i < amount; i++) {
    if (player.deck.length === 0) {
      // Se o deck acabar, reembaralha o cemitério
      if (player.graveyard.length > 0) {
        player.deck = shuffleArray(player.graveyard);
        player.graveyard = [];
        newState.logs.push({
          type: EventType.CARD_DRAWN,
          sourceId: playerId,
          message: `${player.name} reembaralhou o cemitério no baralho.`,
          timestamp: Date.now()
        });
      } else {
        break;
      }
    }
    const card = player.deck.pop();
    if (card) {
      player.hand.push(card);
      drawnCount++;
    }
  }
  
  player.deckCount = player.deck.length;
  
  if (drawnCount > 0) {
    newState.logs.push({
      type: EventType.CARD_DRAWN,
      sourceId: playerId,
      value: drawnCount,
      message: `${player.name} comprou ${drawnCount} carta(s).`,
      timestamp: Date.now()
    });
  }
  
  return newState;
}

export function playCard(
  state: GameState,
  playerId: string,
  cardInstanceId: string,
  targetSlotIndex: number = 0,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): GameState {
  const newState = structuredClone(state);
  
  if (playerId !== newState.activePlayerId) {
    throw new Error("Não é o seu turno para jogar cartas.");
  }
  
  const player = newState.players[playerId];
  const cardIndex = player.hand.findIndex(c => c.instanceId === cardInstanceId);
  
  if (cardIndex === -1) {
    throw new Error("Carta não encontrada na mão.");
  }
  
  const card = player.hand[cardIndex];
  
  if (player.currentEnergy < card.energyCost) {
    throw new Error(`Energia insuficiente (${player.currentEnergy}/${card.energyCost}).`);
  }
  
  const isP1 = playerId === Object.keys(newState.players)[0];
  const enemyId = Object.keys(newState.players).find(id => id !== playerId) || '';
  const enemyPlayer = newState.players[enemyId];

  // Validação prévia de slots conforme tipo de carta
  if (card.type === CardType.CREATURE) {
    if (targetSlotIndex < 0 || targetSlotIndex >= config.creature_slots) {
      throw new Error(`Faixa inválida (escolha entre 1 e ${config.creature_slots}).`);
    }
    const lane = newState.board.lanes[targetSlotIndex];
    const occupied = isP1 ? lane.p1Creature : lane.p2Creature;
    if (occupied) {
      throw new Error(`A faixa ${targetSlotIndex + 1} já está ocupada por ${occupied.name}.`);
    }
    
    // Deduz recursos
    player.currentEnergy -= card.energyCost;
    player.hand.splice(cardIndex, 1);
    
    const creature: Creature = {
      id: `c_${card.id}_${Date.now()}`,
      instanceId: card.instanceId,
      cardId: card.id,
      name: card.name,
      status: EntityStatus.READY,
      maxHealth: card.health || 4,
      health: card.health || 4,
      armor: 0,
      attackModifier: 0,
      summonedOnTurn: newState.turn,
      canAttackOnEntry: !!card.canAttackOnEntry,
      keywords: card.keywords,
      artDirection: card.artDirection,
      artUrl: card.artUrl || `/assets/farel/art/cards/${card.id}.webp`
    };
    
    if (isP1) {
      lane.p1Creature = creature;
    } else {
      lane.p2Creature = creature;
    }

    newState.logs.push({
      type: EventType.CREATURE_SUMMONED,
      sourceId: playerId,
      targetId: card.id,
      message: `${player.name} invocou ${card.name} na Faixa ${targetSlotIndex + 1}.${creature.canAttackOnEntry ? ' (Ágil: pode atacar neste turno!)' : ''}`,
      timestamp: Date.now()
    });

  } else if (card.type === CardType.STRUCTURE) {
    let slotIdx = targetSlotIndex;
    const structures = newState.board.backline[playerId].structures;
    if (structures[slotIdx] !== null) {
      slotIdx = structures.findIndex(s => s === null);
      if (slotIdx === -1) {
        throw new Error("Não há espaço no Backline para novas estruturas geradoras.");
      }
    }
    
    player.currentEnergy -= card.energyCost;
    player.hand.splice(cardIndex, 1);
    
    const struct: Structure = {
      id: `s_${card.id}_${Date.now()}`,
      instanceId: card.instanceId,
      cardId: card.id,
      name: card.name,
      status: EntityStatus.READY,
      maxHealth: card.health || 3,
      health: card.health || 3,
      energyBonus: card.incomePerTurn || card.energyBonus || 1,
      artDirection: card.artDirection,
      artUrl: card.artUrl || `/assets/farel/art/cards/${card.id}.webp`
    };
    
    structures[slotIdx] = struct;
    
    newState.logs.push({
      type: EventType.STRUCTURE_BUILT,
      sourceId: playerId,
      targetId: card.id,
      message: `${player.name} construiu ${card.name} (+${struct.energyBonus} energia/turno) no Backline.`,
      timestamp: Date.now()
    });

  } else if (card.type === CardType.SPELL) {
    player.currentEnergy -= card.energyCost;
    player.hand.splice(cardIndex, 1);
    player.graveyard.push(card);

    // Efeitos específicos da biblioteca Farel
    if (card.effectKind === 'attack_modifier' || card.id === 'SPL-001') {
      // Fúria Marcial: +2 na rolagem da criatura aliada na faixa
      const lane = newState.board.lanes[targetSlotIndex];
      const allied = isP1 ? lane?.p1Creature : lane?.p2Creature;
      if (allied) {
        allied.attackModifier = (allied.attackModifier || 0) + 2;
        newState.logs.push({
          type: EventType.SPELL_ACTIVATED,
          sourceId: playerId,
          message: `${player.name} usou ${card.name}: ${allied.name} recebe +2 no próximo ataque!`,
          timestamp: Date.now()
        });
      } else {
        // Se nenhuma criatura foi indicada, aplica na primeira criatura pronta
        const anyLane = newState.board.lanes.find(l => (isP1 ? l.p1Creature : l.p2Creature));
        const c = isP1 ? anyLane?.p1Creature : anyLane?.p2Creature;
        if (c) c.attackModifier = (c.attackModifier || 0) + 2;
        newState.logs.push({
          type: EventType.SPELL_ACTIVATED,
          sourceId: playerId,
          message: `${player.name} usou ${card.name}: +2 no próximo ataque!`,
          timestamp: Date.now()
        });
      }
    } else if (card.effectKind === 'direct_damage' || card.id === 'SPL-002') {
      // Dardo Arcano: 2 de dano direto a criatura inimiga da faixa, ou herói
      const lane = newState.board.lanes[targetSlotIndex];
      const enemyCreature = isP1 ? lane?.p2Creature : lane?.p1Creature;
      if (enemyCreature) {
        enemyCreature.health -= 2;
        newState.logs.push({
          type: EventType.DAMAGE_DEALT,
          sourceId: playerId,
          message: `${player.name} lançou ${card.name}: causou 2 de dano direto a ${enemyCreature.name}!`,
          timestamp: Date.now()
        });
        if (enemyCreature.health <= 0) {
          if (isP1) lane.p2Creature = null;
          else lane.p1Creature = null;
          newState.logs.push({
            type: EventType.CREATURE_DESTROYED,
            sourceId: playerId,
            message: `${enemyCreature.name} foi destruído pelo feitiço!`,
            timestamp: Date.now()
          });
        }
      } else {
        enemyPlayer.hero.health -= 2;
        newState.logs.push({
          type: EventType.HERO_DAMAGED,
          sourceId: playerId,
          message: `${player.name} lançou ${card.name}: causou 2 de dano ao Herói ${enemyPlayer.hero.name}!`,
          timestamp: Date.now()
        });
      }
    } else if (card.effectKind === 'temporary_energy' || card.id === 'SPL-003') {
      // Surto de Éter: +2 de energia disponível imediatamente
      player.currentEnergy += 2;
      newState.logs.push({
        type: EventType.SPELL_ACTIVATED,
        sourceId: playerId,
        message: `${player.name} conjurou ${card.name}: +2 de energia disponível neste turno!`,
        timestamp: Date.now()
      });
    } else {
      newState.logs.push({
        type: EventType.SPELL_ACTIVATED,
        sourceId: playerId,
        message: `${player.name} jogou o feitiço ${card.name}.`,
        timestamp: Date.now()
      });
    }

  } else if (card.type === CardType.CHANNELLED_SPELL) {
    const channelSlots = newState.board.backline[playerId].channeling;
    let slotIdx = targetSlotIndex;
    if (slotIdx < 0 || slotIdx >= config.channeling_slots || channelSlots[slotIdx] !== null) {
      slotIdx = channelSlots.findIndex(ch => ch === null);
      if (slotIdx === -1) {
        throw new Error("Todos os 3 slots de canalização estão ocupados.");
      }
    }

    player.currentEnergy -= card.energyCost;
    player.hand.splice(cardIndex, 1);

    const chSlot: ChannelingSlot = {
      cardInstanceId: card.instanceId,
      turnsRemaining: 1,
      card,
      laneIndex: targetSlotIndex
    };

    channelSlots[slotIdx] = chSlot;

    newState.logs.push({
      type: EventType.SPELL_CHANNELLED,
      sourceId: playerId,
      message: `${player.name} canalizou ${card.name} no Slot ${slotIdx + 1}. Efeito ativado por gatilho.`,
      timestamp: Date.now()
    });
  }

  return newState;
}

export function setHeroDefenseMode(state: GameState, playerId: string, mode: 'AUTO' | 'ALWAYS'): GameState {
  const newState = structuredClone(state);
  if (newState.players[playerId]) {
    newState.players[playerId].heroDefenseMode = mode;
    newState.logs.push({
      type: EventType.ACTION_TAKEN,
      sourceId: playerId,
      message: `${newState.players[playerId].name} alterou modo de defesa do Herói para: ${mode}.`,
      timestamp: Date.now()
    });
  }
  return newState;
}

export function endTurn(state: GameState, playerId: string, config: RulesConfig = DEFAULT_RULES_CONFIG): GameState {
  let newState = structuredClone(state);
  newState.phase = TurnPhase.END;
  const player = newState.players[playerId];
  
  // Limite de mão ao fim do turno (descarta excedente para o cemitério)
  if (player.hand.length > config.max_hand) {
    const toDiscard = player.hand.slice(config.max_hand);
    player.hand = player.hand.slice(0, config.max_hand);
    player.graveyard.push(...toDiscard);
    newState.logs.push({
      type: EventType.CARD_DISCARDED,
      sourceId: playerId,
      value: toDiscard.length,
      message: `${player.name} descartou ${toDiscard.length} carta(s) para respeitar o limite de 5 na mão.`,
      timestamp: Date.now()
    });
  }
  
  newState.logs.push({
    type: EventType.TURN_ENDED,
    sourceId: playerId,
    message: `${player.name} encerrou seu turno.`,
    timestamp: Date.now()
  });
  
  const playerIds = Object.keys(newState.players);
  const currentIndex = playerIds.indexOf(playerId);
  const nextPlayerId = playerIds[(currentIndex + 1) % playerIds.length];
  
  if (currentIndex === playerIds.length - 1) {
    newState.turn += 1;
  }
  
  return startTurn(newState, nextPlayerId, config);
}

export * from './combat';
