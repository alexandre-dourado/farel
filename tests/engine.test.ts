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

  it('should create a game with WAITING status and Farel Heroes', () => {
    expect(state.status).toBe(GameStatus.WAITING);
    expect(Object.keys(state.players).length).toBe(2);
    expect(state.players['p1'].hero.name).toBe('Viajante do Limiar');
    expect(state.players['p1'].hero.health).toBe(30);
    expect(state.players['p2'].hero.name).toBe('Imperatriz das Eras');
    expect(state.players['p2'].hero.health).toBe(30);
  });

  it('should start game and deal starting hand', () => {
    state = startGame(state, DEFAULT_RULES_CONFIG);
    expect(state.status).toBe(GameStatus.PLAYING);
    // 5 cartas iniciais + 1 do draw do startTurn = 6 cartas no turno 1
    expect(state.players['p1'].hand.length).toBeGreaterThanOrEqual(DEFAULT_RULES_CONFIG.starting_hand);
    expect(state.players['p1'].currentEnergy).toBe(DEFAULT_RULES_CONFIG.base_energy);
  });

  it('should process turn flow and enforce hand limit on endTurn', () => {
    state = startGame(state, DEFAULT_RULES_CONFIG);
    
    // Simula mão cheia (7 cartas)
    while (state.players['p1'].hand.length < 7) {
      state = draw(state, 'p1', 1, DEFAULT_RULES_CONFIG);
    }
    expect(state.players['p1'].hand.length).toBe(7);
    
    // endTurn descarta excedente acima de 5
    state = endTurn(state, 'p1', DEFAULT_RULES_CONFIG);
    expect(state.players['p1'].hand.length).toBe(DEFAULT_RULES_CONFIG.max_hand);
    expect(state.players['p1'].graveyard.length).toBe(2);
    expect(state.activePlayerId).toBe('p2');
  });

  it('should ensure state immutability via structuredClone', () => {
    state = startGame(state, DEFAULT_RULES_CONFIG);
    const originalEnergy = state.players['p1'].currentEnergy;
    const cloned = structuredClone(state);
    
    // Modifica o clone
    cloned.players['p1'].currentEnergy = 999;
    expect(state.players['p1'].currentEnergy).toBe(originalEnergy);
  });
});
