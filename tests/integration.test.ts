import { describe, it, expect } from 'vitest';
import { createGame, startGame, startTurn, playCard, endTurn, resolveAttack, setHeroDefenseMode, draw } from '../game/engine';
import { DEFAULT_RULES_CONFIG } from '../game/config/RulesConfig';
import { EntityStatus, CardType } from '../types/enums';

// Helper to inject specific cards for deterministic testing
function getTestCreature(id: string, canAttack: boolean = false) {
  return { id, instanceId: "inst_" + id, name: 'Test Creature', type: CardType.CREATURE, description: '', energyCost: 1, health: 10, attackModifier: 0, canAttackOnEntry: canAttack };
}

describe('Game Engine Integration', () => {
  it('Simulates a full end-to-end game cycle', () => {
    let state = createGame('game_1', [{ id: 'p1', name: 'P1' }, { id: 'p2', name: 'P2' }], DEFAULT_RULES_CONFIG);
    state = startGame(state, DEFAULT_RULES_CONFIG);

    state = startTurn(state, 'p1', DEFAULT_RULES_CONFIG);
    const p1 = state.players['p1'];
    
    // Inject deterministic creature
    const cardToPlay = getTestCreature('c_1', false);
    p1.hand = [cardToPlay];
    
    const initialEnergy = p1.currentEnergy;
    state = playCard(state, 'p1', cardToPlay.instanceId, 0, DEFAULT_RULES_CONFIG);
    
    expect(state.players['p1'].currentEnergy).toBe(initialEnergy - 1);
    const lane0 = state.board.lanes[0];
    expect(lane0.p1Creature).not.toBeNull();
    expect(lane0.p1Creature!.cardId).toBe(cardToPlay.id);

    // Verify summoning sickness
    expect(() => {
      resolveAttack(state, 'p1', 0, DEFAULT_RULES_CONFIG);
    }).toThrow('Summoning sickness');

    state = endTurn(state, 'p1', DEFAULT_RULES_CONFIG);
    state = startTurn(state, 'p2', DEFAULT_RULES_CONFIG);
    
    const p2Card = getTestCreature('c_2', false);
    state.players['p2'].hand = [p2Card];
    state = playCard(state, 'p2', p2Card.instanceId, 0, DEFAULT_RULES_CONFIG);
    
    expect(state.board.lanes[0].p2Creature).not.toBeNull();
    state = endTurn(state, 'p2', DEFAULT_RULES_CONFIG);

    state = startTurn(state, 'p1', DEFAULT_RULES_CONFIG);
    
    const originalRandom = Math.random;
    Math.random = () => 0.99; // max damage 6
    
    state = resolveAttack(state, 'p1', 0, DEFAULT_RULES_CONFIG);
    expect(state.board.lanes[0].p2Creature!.health).toBe(4);
    
    // Verify exhaustion
    expect(() => {
      resolveAttack(state, 'p1', 0, DEFAULT_RULES_CONFIG);
    }).toThrow('Criatura já atacou neste turno');
    
    Math.random = originalRandom;
  });

  it('Proves immutability (Problema 1)', () => {
    let state = createGame('g', [{ id: 'p1' }, { id: 'p2' }], DEFAULT_RULES_CONFIG);
    const stateBeforeStartGame = structuredClone(state);
    
    const stateAfterStartGame = startGame(state);
    expect(state).toEqual(stateBeforeStartGame); 
    
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
    
    const p2Card = getTestCreature('c_p2', false);
    state.players['p2'].hand = [p2Card];
    
    expect(() => {
      playCard(state, 'p2', p2Card.instanceId, 0);
    }).toThrow('Não é o seu turno');
    
    expect(() => {
      resolveAttack(state, 'p2', 0);
    }).toThrow('Não é o seu turno');
  });
  
  it('Proves lane validation in playCard (Problema 2)', () => {
    let state = createGame('g', [{ id: 'p1' }, { id: 'p2' }]);
    state = startGame(state);
    state = startTurn(state, 'p1');
    
    state.players['p1'].currentEnergy = 99;
    
    const c1 = getTestCreature('c_1', false);
    const c2 = getTestCreature('c_2', false);
    state.players['p1'].hand = [c1, c2];
    
    state = playCard(state, 'p1', c1.instanceId, 0);
    
    expect(() => {
      playCard(state, 'p1', c2.instanceId, 0);
    }).toThrow('Sua posição nesta lane já está ocupada');
  });

  it('Proves Rota B Hero Defense (Problema 5)', () => {
    let state = createGame('g', [{ id: 'p1' }, { id: 'p2' }]);
    state = startGame(state);
    
    state = startTurn(state, 'p2');
    const p2Card = getTestCreature('c_p2', false);
    state.players['p2'].hand = [p2Card];
    state = playCard(state, 'p2', p2Card.instanceId, 0);
    state = endTurn(state, 'p2');
    
    state = startTurn(state, 'p1');
    const p1Card = getTestCreature('c_p1', false);
    state.players['p1'].hand = [p1Card];
    state = playCard(state, 'p1', p1Card.instanceId, 0);
    state = endTurn(state, 'p1');
    
    state = startTurn(state, 'p2');
    state = endTurn(state, 'p2'); 
    
    state = startTurn(state, 'p1');
    const originalRandom = Math.random;
    Math.random = () => 0.99;
    
    state = setHeroDefenseMode(state, 'p2', 'ALWAYS');
    
    const heroHealthBefore = state.players['p2'].hero.health;
    const creatureHealthBefore = state.board.lanes[0].p2Creature!.health;
    
    state = resolveAttack(state, 'p1', 0);
    
    expect(state.players['p2'].hero.health).toBe(heroHealthBefore - 6);
    expect(state.board.lanes[0].p2Creature!.health).toBe(creatureHealthBefore);
    
    Math.random = originalRandom;
  });

  it('Proves Deck Exhaustion and Fatigue, and Structure Backline (Mission 12 & 13)', () => {
    let state = createGame('g', [{ id: 'p1' }, { id: 'p2' }]);
    state = startGame(state);
    
    // Draw until deck is empty
    state.players['p1'].deck = []; // force empty deck
    const heroHealthBefore = state.players['p1'].hero.health;
    
    // Attempt to draw 1 card (should fail and deal 1 damage)
    
    state = draw(state, 'p1', 1);
    
    expect(state.players['p1'].hero.health).toBe(heroHealthBefore - 1);
    
    // Test playing a structure
    const p1 = state.players['p1'];
    p1.currentEnergy = 99;
    
    const structCard = { id: 's_1', instanceId: 'inst_s1', name: 'Test Struct', type: CardType.STRUCTURE, description: '', energyCost: 1, energyBonus: 5 };
    p1.hand = [structCard as any];
    
    // Play structure on backline slot 2
    state = playCard(state, 'p1', structCard.instanceId, 2);
    
    expect(state.board.backline['p1'].structures[2]).not.toBeNull();
    expect(state.board.backline['p1'].structures[2]!.energyBonus).toBe(5);
    
    // Test playing a spell
    const spellCard = { id: 'sp_1', instanceId: 'inst_sp1', name: 'Test Spell', type: CardType.SPELL, description: '', energyCost: 1 };
    state.players['p1'].hand = [spellCard as any];
    state = playCard(state, 'p1', spellCard.instanceId);
    
    expect(state.players['p1'].graveyard.length).toBeGreaterThan(0);
    expect(state.players['p1'].graveyard[state.players['p1'].graveyard.length - 1].id).toBe('sp_1');
  });
});

