import { describe, it, expect } from 'vitest';
import { createGame, startGame, startTurn, playCard, endTurn, resolveAttack } from '../game/engine';
import { DEFAULT_RULES_CONFIG } from '../game/config/RulesConfig';

describe('Game Engine Integration', () => {
  it('Simulates a full end-to-end game cycle', () => {
    // 1. createGame and startGame
    let state = createGame('game_1', [{ id: 'p1', name: 'P1' }, { id: 'p2', name: 'P2' }], DEFAULT_RULES_CONFIG);
    state = startGame(state, DEFAULT_RULES_CONFIG);

    expect(state.players['p1'].hand.length).toBe(DEFAULT_RULES_CONFIG.starting_hand);
    expect(state.players['p2'].hand.length).toBe(DEFAULT_RULES_CONFIG.starting_hand);

    // 2. P1 startTurn
    state = startTurn(state, 'p1', DEFAULT_RULES_CONFIG);
    
    const p1 = state.players['p1'];
    expect(p1.currentEnergy).toBe(p1.hero.baseEnergy);
    expect(p1.hand.length).toBe(DEFAULT_RULES_CONFIG.starting_hand + DEFAULT_RULES_CONFIG.draw_per_turn);

    // 3. P1 playCard
    const cardToPlay = p1.hand[0];
    const initialEnergy = p1.currentEnergy;
    state = playCard(state, 'p1', cardToPlay.instanceId, DEFAULT_RULES_CONFIG);
    
    expect(state.players['p1'].currentEnergy).toBe(initialEnergy - (cardToPlay.energyCost || 1));
    
    const lane0 = state.board.lanes[0];
    expect(lane0.p1Creature).not.toBeNull();
    expect(lane0.p1Creature!.cardId).toBe(cardToPlay.id);

    // 4. Verify summoning sickness
    expect(() => {
      resolveAttack(state, 'p1', 0, false, DEFAULT_RULES_CONFIG);
    }).toThrow('Summoning sickness');

    // Make hand artificially larger to test discard
    for (let i = 0; i < 15; i++) {
       state.players['p1'].hand.push({ ...cardToPlay, instanceId: \	est_inst_\\ });
    }

    // 5. P1 endTurn
    state = endTurn(state, 'p1', DEFAULT_RULES_CONFIG);
    expect(state.players['p1'].hand.length).toBe(DEFAULT_RULES_CONFIG.max_hand);
    expect(state.players['p1'].graveyard.length).toBeGreaterThan(0);

    // 6. P2 startTurn and P2 playCard
    state = startTurn(state, 'p2', DEFAULT_RULES_CONFIG);
    const p2Card = state.players['p2'].hand[0];
    state = playCard(state, 'p2', p2Card.instanceId, DEFAULT_RULES_CONFIG);
    
    expect(state.board.lanes[0].p2Creature).not.toBeNull();
    
    state = endTurn(state, 'p2', DEFAULT_RULES_CONFIG);

    // 7. Advance turns for P1 and execute resolveAttack
    state = startTurn(state, 'p1', DEFAULT_RULES_CONFIG);
    
    const p2CreatureBefore = state.board.lanes[0].p2Creature;
    expect(p2CreatureBefore).not.toBeNull();

    // Mock Math.random to always deal max damage (6)
    const originalRandom = Math.random;
    Math.random = () => 0.99; // 0.99 * 6 = 5.94 -> floor(5.94) + 1 = 6
    
    state = resolveAttack(state, 'p1', 0, false, DEFAULT_RULES_CONFIG);
    
    // The creature health is 10. Damage is 6.
    expect(state.board.lanes[0].p2Creature!.health).toBe(4);
    
    // 8. Test scenario activating defendWithHero = true
    const heroHealthBefore = state.players['p2'].hero.health;
    state = resolveAttack(state, 'p1', 0, true, DEFAULT_RULES_CONFIG);
    expect(state.players['p2'].hero.health).toBe(heroHealthBefore - 6);
    
    Math.random = originalRandom;
  });
});
