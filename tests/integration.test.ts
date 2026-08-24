import { describe, it, expect } from 'vitest';
import { createGame, startGame, startTurn, playCard, endTurn, resolveAttack } from '../game/engine';
import { DEFAULT_RULES_CONFIG } from '../game/config/RulesConfig';
import { EntityStatus } from '../types/enums';

describe('Game Engine Integration', () => {
  it('Simulates a full end-to-end game cycle', () => {
    let state = createGame('game_1', [{ id: 'p1', name: 'P1' }, { id: 'p2', name: 'P2' }], DEFAULT_RULES_CONFIG);
    state = startGame(state, DEFAULT_RULES_CONFIG);

    expect(state.players['p1'].hand.length).toBe(DEFAULT_RULES_CONFIG.starting_hand);
    expect(state.players['p2'].hand.length).toBe(DEFAULT_RULES_CONFIG.starting_hand);

    state = startTurn(state, 'p1', DEFAULT_RULES_CONFIG);
    const p1 = state.players['p1'];
    expect(p1.currentEnergy).toBe(p1.hero.baseEnergy);
    expect(p1.hand.length).toBe(DEFAULT_RULES_CONFIG.starting_hand + DEFAULT_RULES_CONFIG.draw_per_turn);

    const cardToPlay = p1.hand[0];
    const initialEnergy = p1.currentEnergy;
    
    // Test playCard requiring laneIndex
    state = playCard(state, 'p1', cardToPlay.instanceId, 0, DEFAULT_RULES_CONFIG);
    
    expect(state.players['p1'].currentEnergy).toBe(initialEnergy - (cardToPlay.energyCost || 1));
    const lane0 = state.board.lanes[0];
    expect(lane0.p1Creature).not.toBeNull();
    expect(lane0.p1Creature!.cardId).toBe(cardToPlay.id);

    // Verify summoning sickness
    expect(() => {
      resolveAttack(state, 'p1', 0, false, DEFAULT_RULES_CONFIG);
    }).toThrow('Summoning sickness');

    state = endTurn(state, 'p1', DEFAULT_RULES_CONFIG);
    state = startTurn(state, 'p2', DEFAULT_RULES_CONFIG);
    
    const p2Card = state.players['p2'].hand[0];
    state = playCard(state, 'p2', p2Card.instanceId, 0, DEFAULT_RULES_CONFIG);
    
    expect(state.board.lanes[0].p2Creature).not.toBeNull();
    state = endTurn(state, 'p2', DEFAULT_RULES_CONFIG);

    state = startTurn(state, 'p1', DEFAULT_RULES_CONFIG);
    
    const originalRandom = Math.random;
    Math.random = () => 0.99; // max damage 6
    
    state = resolveAttack(state, 'p1', 0, false, DEFAULT_RULES_CONFIG);
    expect(state.board.lanes[0].p2Creature!.health).toBe(4);
    
    // Verify exhaustion
    expect(() => {
      resolveAttack(state, 'p1', 0, false, DEFAULT_RULES_CONFIG);
    }).toThrow('Criatura já atacou neste turno');
    
    Math.random = originalRandom;
  });

  it('Proves immutability (Problema 1)', () => {
    let state = createGame('g', [{ id: 'p1' }, { id: 'p2' }], DEFAULT_RULES_CONFIG);
    const stateBeforeStartGame = structuredClone(state);
    
    const stateAfterStartGame = startGame(state);
    expect(state).toEqual(stateBeforeStartGame); // No shallow mutation
    
    const stateBeforeStartTurn = structuredClone(stateAfterStartGame);
    const stateAfterStartTurn = startTurn(stateAfterStartGame, 'p1');
    expect(stateAfterStartGame).toEqual(stateBeforeStartTurn);
    
    const stateBeforeEndTurn = structuredClone(stateAfterStartTurn);
    const stateAfterEndTurn = endTurn(stateAfterStartTurn, 'p1');
    expect(stateAfterStartTurn).toEqual(stateBeforeEndTurn);
  });

  it('Proves turn ownership validation (Problema 4)', () => {
    let state = createGame('g', [{ id: 'p1' }, { id: 'p2' }]);
    state = startGame(state);
    state = startTurn(state, 'p1');
    
    // P2 tries to play a card on P1's turn
    const p2Card = state.players['p2'].hand[0];
    expect(() => {
      playCard(state, 'p2', p2Card.instanceId, 0);
    }).toThrow('Não é o seu turno');
    
    // P2 tries to attack on P1's turn
    expect(() => {
      resolveAttack(state, 'p2', 0);
    }).toThrow('Não é o seu turno');
  });
  
  it('Proves lane validation in playCard (Problema 2)', () => {
    let state = createGame('g', [{ id: 'p1' }, { id: 'p2' }]);
    state = startGame(state);
    state = startTurn(state, 'p1');
    
    // Set 99 energy for testing
    state.players['p1'].currentEnergy = 99;
    
    const c1 = state.players['p1'].hand[0];
    state = playCard(state, 'p1', c1.instanceId, 0);
    
    const c2 = state.players['p1'].hand[1];
    expect(() => {
      playCard(state, 'p1', c2.instanceId, 0);
    }).toThrow('Sua posição nesta lane já está ocupada');
  });
});
