import { describe, it, expect, beforeEach } from 'vitest';
import { createGame, startGame, startTurn, draw, playCard, endTurn } from '../game/engine';
import { Player } from '../types/entities';
import { GameStatus } from '../types/enums';
import { DEFAULT_RULES_CONFIG } from '../game/config/RulesConfig';

describe('Game Engine Core', () => {
  let p1: Player = { id: 'p1', name: 'Alice' };
  let p2: Player = { id: 'p2', name: 'Bob' };
  let state: any;

  beforeEach(() => {
    state = createGame('test-game', [p1, p2], DEFAULT_RULES_CONFIG);
  });

  it('should create a game with WAITING status', () => {
    expect(state.status).toBe(GameStatus.WAITING);
    expect(Object.keys(state.players).length).toBe(2);
  });

  it('should start game and deal starting hand', () => {
    state = startGame(state, DEFAULT_RULES_CONFIG);
    expect(state.status).toBe(GameStatus.PLAYING);
    expect(state.players['p1'].hand.length).toBe(DEFAULT_RULES_CONFIG.starting_hand);
  });

  it('should process a turn flow correctly', () => {
    state = startGame(state, DEFAULT_RULES_CONFIG);
    
    // startTurn
    state = startTurn(state, 'p1', DEFAULT_RULES_CONFIG);
    expect(state.players['p1'].currentEnergy).toBe(DEFAULT_RULES_CONFIG.base_energy);
    // Draw happens in startTurn flow
    expect(state.players['p1'].hand.length).toBe(DEFAULT_RULES_CONFIG.starting_hand + DEFAULT_RULES_CONFIG.draw_per_turn);
    
    // endTurn applies hand limit
    state = endTurn(state, 'p1', DEFAULT_RULES_CONFIG);
    expect(state.players['p1'].hand.length).toBe(DEFAULT_RULES_CONFIG.max_hand);
  });
});
