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
      status: EntityStatus.SUMMONED,
      maxHealth: 10,
      health: 10,
            attackModifier: 2,
      summonedOnTurn: 0,
      canAttackOnEntry: true
    };
  });

  it('should deal damage to enemy creature in the same lane', () => {
    state.board.lanes[0].p2Creature = {
      id: 'c2',
      instanceId: 'i2',
      cardId: 'card2',
      name: 'Defender',
      status: EntityStatus.SUMMONED,
      maxHealth: 10,
      health: 10,
            attackModifier: 0,
      summonedOnTurn: 0
    };

    vi.spyOn(Math, 'random').mockReturnValue(0.5); // roll 4
    
    const newState = resolveAttack(state, p1Id, 0);
    // damage = 4 + 2 = 6. no armor. final = 6
    expect(newState.board.lanes[0].p2Creature?.health).toBe(4);
  });

  it('should target hero if lane is empty and no structure', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // roll 4
    const newState = resolveAttack(state, p1Id, 0);
    // damage = 4 + 2 = 6. no defense
    expect(newState.players[p2Id].hero.health).toBe(14);
  });
  
  it('should let hero defend directly and trigger game over if dead', () => {
    state.players[p2Id].hero.health = 5;
    
    vi.spyOn(Math, 'random').mockReturnValue(0.8); // roll 5
    const newState = resolveAttack(state, p1Id, 0, true);
    // damage = 5 + 2 = 7. final damage = 7. hero health = 5 - 7 = -2
    expect(newState.players[p2Id].hero.health).toBeLessThanOrEqual(0);
    expect(newState.status).toBe(GameStatus.FINISHED);
  });
});
