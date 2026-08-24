import { GameState, PlayerState, EventLog } from '../../types/gameState';
import { GameStatus, TurnPhase, EventType, CardType, EntityStatus } from '../../types/enums';
import { Card, Hero, Player, Structure } from '../../types/entities';
import { Board, LaneState, BacklineState } from '../../types/board';
import { RulesConfig, DEFAULT_RULES_CONFIG } from '../config/RulesConfig';
import { CardRegistry } from '../data/CardRegistry';

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
  
  players.forEach(p => {
    playersState[p.id] = {
      playerId: p.id,
      hero: {
        id: "hero_" + p.id,
        name: "Hero " + (p.name || p.id),
        maxHealth: 20,
        health: 20,
        baseEnergy: config.base_energy
      },
      hand: [],
      deck: [],
      graveyard: [],
      currentEnergy: 0,
      maxEnergyCap: config.base_energy,
      heroDefenseMode: 'AUTO'
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
      timestamp: Date.now()
    } as EventLog]
  };
}

export function startGame(state: GameState, config: RulesConfig = DEFAULT_RULES_CONFIG): GameState {
  const newState = structuredClone(state);
  newState.status = GameStatus.PLAYING;
  newState.turn = 1;
  newState.phase = TurnPhase.START;
  
  Object.keys(newState.players).forEach(playerId => {
    // Distribute deck
    const deck = shuffleArray(CardRegistry).map((c, i) => ({
        ...c,
        instanceId: "inst_" + playerId + "_"  + i
    }));
    newState.players[playerId].deck = deck;
    
    // Distribute hand
    const hand: Card[] = [];
    for(let i = 0; i < config.starting_hand; i++) {
        const drawn = newState.players[playerId].deck.pop();
        if (drawn) hand.push(drawn);
    }
    newState.players[playerId].hand = hand;
  });

  return newState;
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
    
    const generated = player.hero.baseEnergy + bonus;
    
    if (!config.energy_carries_over) {
       player.currentEnergy = generated;
    } else {
       player.currentEnergy += generated;
    }
    
    newState.logs.push({
      type: EventType.ENERGY_GENERATED,
      sourceId: playerId,
      value: generated,
      timestamp: Date.now()
    } as EventLog);
    
    return newState;
  }
};

export function startTurn(state: GameState, playerId: string, config: RulesConfig = DEFAULT_RULES_CONFIG): GameState {
  let newState = structuredClone(state);
  newState.activePlayerId = playerId;
  newState.phase = TurnPhase.START;
  
  const isP1 = playerId === Object.keys(newState.players)[0];
  newState.board.lanes.forEach(lane => {
      const creature = isP1 ? lane.p1Creature : lane.p2Creature;
      if (creature && creature.status === EntityStatus.EXHAUSTED) {
          creature.status = EntityStatus.READY;
      }
  });
  
  newState.logs.push({
    type: EventType.TURN_STARTED,
    sourceId: playerId,
    timestamp: Date.now()
  } as EventLog);

  newState.phase = TurnPhase.ENERGY;
  newState = EnergyEngine.generateEnergy(newState, playerId, config);

  newState.phase = TurnPhase.DRAW;
  newState = draw(newState, playerId, config.draw_per_turn, config);

  newState.phase = TurnPhase.ACTION;
  
  return newState;
}

export function draw(state: GameState, playerId: string, amount: number, config: RulesConfig = DEFAULT_RULES_CONFIG): GameState {
  const newState = structuredClone(state);
  const player = newState.players[playerId];
  
  for(let i=0; i<amount; i++) {
    const drawn = player.deck.pop();
    if (drawn) {
        player.hand.push(drawn);
        newState.logs.push({
          type: EventType.CARD_DRAWN,
          sourceId: playerId,
          value: 1,
          timestamp: Date.now()
        } as EventLog);
    } else {
        // FATIGUE
        player.hero.health -= 1;
        newState.logs.push({
          type: EventType.HERO_DAMAGED,
          sourceId: playerId,
          targetId: playerId,
          value: 1,
          timestamp: Date.now()
        } as EventLog);
        
        if (player.hero.health <= 0) {
           newState.status = GameStatus.FINISHED;
           newState.logs.push({
             type: EventType.HERO_DESTROYED,
             sourceId: playerId,
             targetId: playerId,
             timestamp: Date.now()
           } as EventLog);
        }
    }
  }
  
  return newState;
}

export function playCard(state: GameState, playerId: string, cardInstanceId: string, laneIndex?: number, config: RulesConfig = DEFAULT_RULES_CONFIG): GameState {
  if (playerId !== state.activePlayerId) {
      throw new Error("Não é o seu turno");
  }
  
  const newState = structuredClone(state);
  const player = newState.players[playerId];
  const cardIndex = player.hand.findIndex(c => c.instanceId === cardInstanceId);
  
  if (cardIndex === -1) {
    throw new Error("Card not found in hand");
  }
  
  const card = player.hand[cardIndex];
  
  if (player.currentEnergy < card.energyCost) {
    throw new Error("Not enough energy");
  }
  
  if (card.type === CardType.CREATURE) {
      if (laneIndex === undefined) {
          throw new Error("É necessário escolher uma lane para invocar uma criatura");
      }
      const lane = newState.board.lanes[laneIndex];
      if (!lane) throw new Error("Lane inválida");
      
      const isP1 = playerId === Object.keys(newState.players)[0];
      if (isP1 && lane.p1Creature) throw new Error("Sua posição nesta lane já está ocupada");
      if (!isP1 && lane.p2Creature) throw new Error("Sua posição nesta lane já está ocupada");
      
      player.currentEnergy -= card.energyCost;
      player.hand.splice(cardIndex, 1);
      
      const creature = {
          id: "c_" + card.id,
          instanceId: card.instanceId,
          cardId: card.id,
          name: card.name,
          status: EntityStatus.SUMMONED,
          maxHealth: card.health || 10,
          health: card.health || 10,
          attackModifier: card.attackModifier || 0,
          summonedOnTurn: newState.turn,
          canAttackOnEntry: card.canAttackOnEntry
      };
      
      if (isP1) lane.p1Creature = creature;
      else lane.p2Creature = creature;
  } else if (card.type === CardType.STRUCTURE) {
      if (laneIndex === undefined) {
          throw new Error("É necessário escolher um slot de backline para a estrutura");
      }
      const backlineSlot = newState.board.backline[playerId].structures[laneIndex];
      if (backlineSlot !== null) {
          throw new Error("Este slot de backline já está ocupado");
      }
      
      player.currentEnergy -= card.energyCost;
      player.hand.splice(cardIndex, 1);
      
      newState.board.backline[playerId].structures[laneIndex] = {
          id: "s_" + card.id + "_"  + laneIndex,
          instanceId: card.instanceId,
          cardId: card.id,
          name: card.name,
          status: EntityStatus.READY,
          maxHealth: card.health || 5,
          health: card.health || 5,
          energyBonus: card.energyBonus || 0
      };
      
      // I added STRUCTURE_BUILT to enums before? Wait, I need to check if EventType has STRUCTURE_BUILT. If not, use CARD_PLAYED.
      newState.logs.push({
          type: EventType.CARD_PLAYED,
          sourceId: playerId,
          targetId: cardInstanceId,
          timestamp: Date.now()
      } as EventLog);
      
  } else if (card.type === CardType.SPELL) {
      player.currentEnergy -= card.energyCost;
      player.hand.splice(cardIndex, 1);
      player.graveyard.push(card);
      
      newState.logs.push({
          type: EventType.CARD_PLAYED, // SPELL_CHANNELLED if it exists
          sourceId: playerId,
          targetId: cardInstanceId,
          timestamp: Date.now()
      } as EventLog);
  } else {
      player.currentEnergy -= card.energyCost;
      player.hand.splice(cardIndex, 1);
  }

  if (card.type === CardType.CREATURE) {
      newState.logs.push({
        type: EventType.CARD_PLAYED,
        sourceId: playerId,
        targetId: cardInstanceId,
        timestamp: Date.now()
      } as EventLog);
  }
  
  return newState;
}

export function endTurn(state: GameState, playerId: string, config: RulesConfig = DEFAULT_RULES_CONFIG): GameState {
  const newState = structuredClone(state);
  newState.phase = TurnPhase.END;
  const player = newState.players[playerId];
  
  if (player.hand.length > config.max_hand) {
    const toDiscard = player.hand.slice(config.max_hand);
    player.hand = player.hand.slice(0, config.max_hand);
    player.graveyard.push(...toDiscard);
  }
  
  newState.logs.push({
    type: EventType.TURN_ENDED,
    sourceId: playerId,
    timestamp: Date.now()
  } as EventLog);
  
  const playersIds = Object.keys(newState.players);
  const currentIndex = playersIds.indexOf(playerId);
  const nextPlayerId = playersIds[(currentIndex + 1) % playersIds.length];
  newState.activePlayerId = nextPlayerId;
  
  if (currentIndex === playersIds.length - 1) {
    newState.turn += 1;
  }
  
  return newState;
}

export function setHeroDefenseMode(state: GameState, playerId: string, mode: 'ALWAYS' | 'AUTO'): GameState {
  const newState = structuredClone(state);
  newState.players[playerId].heroDefenseMode = mode;
  return newState;
}

export * from './combat';
