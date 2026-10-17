import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resolveAttack } from '../game/engine/combat';
import { createGame, startGame } from '../game/engine';
import { GameState } from '../types/gameState';
import { GameStatus, EntityStatus } from '../types/enums';

describe('Combat Engine', () => {
  let state: GameState;
  let p1Id = 'p1';
  let p2Id = 'p2';

  beforeEach(() => {
    state = createGame('game-1', [{ id: p1Id }, { id: p2Id }]);
    state = startGame(state);
    
    // Setup a creature for p1 in lane 0
    state.board.lanes[0].p1Creature = {
      id: 'c1',
      instanceId: 'i1',
      cardId: 'card1',
      name: 'Attacker',
      status: EntityStatus.READY,
      maxHealth: 10,
      health: 10,
      armor: 0,
      attackModifier: 2,
      summonedOnTurn: 0,
      canAttackOnEntry: false
    };
  });

  it('should deal damage to enemy creature in the same lane', () => {
    state.board.lanes[0].p2Creature = {
      id: 'c2',
      instanceId: 'i2',
      cardId: 'card2',
      name: 'Defender',
      status: EntityStatus.READY,
      maxHealth: 10,
      health: 10,
      armor: 1,
      attackModifier: 0,
      summonedOnTurn: 0
    };

    vi.spyOn(Math, 'random').mockReturnValue(0.5); // roll 4 (Math.floor(0.5 * 6) + 1 = 4)
    
    const newState = resolveAttack(state, p1Id, 0);
    // damage = 4 + 2 = 6. armor = 1. final = 5
    expect(newState.board.lanes[0].p2Creature?.health).toBe(5);
  });

  it('should target structure before hero if lane is empty', () => {
    state.board.backline[p2Id].structures[0] = {
      id: 's1',
      instanceId: 'is1',
      cardId: 'GEN-001',
      name: 'Condensador de Éter',
      status: EntityStatus.READY,
      maxHealth: 3,
      health: 3,
      energyBonus: 1
    };

    vi.spyOn(Math, 'random').mockReturnValue(0.5); // roll 4 -> damage = 4 + 2 = 6
    const newState = resolveAttack(state, p1Id, 0);
    // Structure with 3 health takes 6 damage -> destroyed (null)
    expect(newState.board.backline[p2Id].structures[0]).toBeNull();
    // Hero remains untouched
    expect(newState.players[p2Id].hero.health).toBe(30);
  });

  it('should target hero if lane is empty and no structure exists', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // roll 4 -> damage = 6
    const newState = resolveAttack(state, p1Id, 0);
    // Imperatriz starts with 30 HP - 6 = 24 HP
    expect(newState.players[p2Id].hero.health).toBe(24);
  });
  
  it('should let hero intercept directly when heroDefenseMode is ALWAYS', () => {
    state.players[p2Id].hero.health = 5;
    state.players[p2Id].heroDefenseMode = 'ALWAYS';
    
    vi.spyOn(Math, 'random').mockReturnValue(0.8); // roll 5 -> damage = 5 + 2 = 7
    const newState = resolveAttack(state, p1Id, 0);
    // damage = 7. hero health = 5 - 7 <= 0
    expect(newState.players[p2Id].hero.health).toBe(0);
    expect(newState.status).toBe(GameStatus.FINISHED);
  });
});
