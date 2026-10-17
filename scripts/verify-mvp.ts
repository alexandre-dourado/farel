import assert from 'node:assert';
import { createGame, startGame, startTurn, endTurn, playCard, resolveAttack, setHeroDefenseMode, EnergyEngine } from '../game/engine/index.ts';
import { CardRegistry, HeroRegistry, buildDefaultDeck } from '../game/data/CardRegistry.ts';
import { DEFAULT_RULES_CONFIG, validateRulesConfig } from '../game/config/RulesConfig.ts';
import { GameStatus, EntityStatus, CardType } from '../types/enums.ts';

console.log('🧪 Iniciando Suíte de Testes Automatizados do MVP Farel TCG...\n');

let passedTests = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// 1. Testes de Biblioteca e Configuração
test('CardRegistry possui 15 cartas de jogo e 2 heróis oficiais', () => {
  assert.strictEqual(HeroRegistry.length, 2, 'Devem existir 2 heróis');
  assert.strictEqual(HeroRegistry[0].name, 'Viajante do Limiar');
  assert.strictEqual(HeroRegistry[0].maxHealth, 30);
  assert.strictEqual(HeroRegistry[1].name, 'Imperatriz das Eras');
  assert.strictEqual(HeroRegistry[1].maxHealth, 30);

  assert.strictEqual(CardRegistry.length, 15, 'Devem existir 15 cartas no catálogo');
  
  const batedora = CardRegistry.find(c => c.id === 'CRE-002');
  assert.ok(batedora, 'Batedora do Vento deve existir');
  assert.strictEqual(batedora.canAttackOnEntry, true, 'Batedora deve ter Ágil/canAttackOnEntry');

  const mina = CardRegistry.find(c => c.id === 'GEN-002');
  assert.ok(mina, 'Mina de Éter deve existir');
  assert.strictEqual(mina.energyBonus, 2, 'Mina de Éter gera +2 de energia');
});

test('RulesConfig validação estrita', () => {
  assert.doesNotThrow(() => validateRulesConfig(DEFAULT_RULES_CONFIG));
  assert.throws(() => validateRulesConfig({ ...DEFAULT_RULES_CONFIG, base_energy: -1 }));
  assert.throws(() => validateRulesConfig({ ...DEFAULT_RULES_CONFIG, starting_hand: 6, max_hand: 5 }));
});

// 2. Testes de Ciclo de Turno e Motor
test('createGame e startGame configuram partida com heróis e baralhos', () => {
  let state = createGame('game_test', [{ id: 'p1' }, { id: 'p2' }]);
  assert.strictEqual(state.status, GameStatus.WAITING);
  assert.strictEqual(state.players['p1'].hero.name, 'Viajante do Limiar');
  assert.strictEqual(state.players['p1'].hero.health, 30);
  assert.strictEqual(state.players['p2'].hero.name, 'Imperatriz das Eras');
  assert.strictEqual(state.players['p2'].hero.health, 30);

  state = startGame(state);
  assert.strictEqual(state.status, GameStatus.PLAYING);
  assert.strictEqual(state.turn, 1);
  assert.strictEqual(state.activePlayerId, 'p1');
  // 5 iniciais + 1 do draw do turno 1
  assert.strictEqual(state.players['p1'].hand.length, 6);
  assert.strictEqual(state.players['p1'].currentEnergy, 5);
});

test('playCard invoca criatura em faixa e deduz energia', () => {
  let state = createGame('game_test', [{ id: 'p1' }, { id: 'p2' }]);
  state = startGame(state);
  
  // Força uma criatura na mão
  const cre = CardRegistry.find(c => c.id === 'CRE-001')!;
  state.players['p1'].hand[0] = { ...cre, instanceId: 'test_cre_1' };
  state.players['p1'].currentEnergy = 5;

  state = playCard(state, 'p1', 'test_cre_1', 0); // Lane 0
  
  assert.strictEqual(state.players['p1'].currentEnergy, 3, '5 - 2 = 3 de energia');
  assert.ok(state.board.lanes[0].p1Creature, 'Criatura deve estar na lane 0');
  assert.strictEqual(state.board.lanes[0].p1Creature?.name, 'Legionário de Bronze');
  assert.strictEqual(state.board.lanes[0].p1Creature?.health, 4);
});

test('playCard rejeita invocação se faixa estiver ocupada ou sem energia', () => {
  let state = createGame('game_test', [{ id: 'p1' }, { id: 'p2' }]);
  state = startGame(state);
  
  const cre = CardRegistry.find(c => c.id === 'CRE-001')!;
  state.players['p1'].hand[0] = { ...cre, instanceId: 'c_a' };
  state.players['p1'].hand[1] = { ...cre, instanceId: 'c_b' };
  state.players['p1'].currentEnergy = 5;

  state = playCard(state, 'p1', 'c_a', 2);
  // Tentar jogar na mesma lane 2 deve lançar erro
  assert.throws(() => playCard(state, 'p1', 'c_b', 2), /já está ocupada/);

  // Sem energia
  state.players['p1'].currentEnergy = 0;
  assert.throws(() => playCard(state, 'p1', 'c_b', 3), /Energia insuficiente/);
});

test('playCard constrói estrutura e gera energia bônus no turno seguinte', () => {
  let state = createGame('game_test', [{ id: 'p1' }, { id: 'p2' }]);
  state = startGame(state);
  
  const gen = CardRegistry.find(c => c.id === 'GEN-001')!; // Condensador de Éter (+1 energia)
  state.players['p1'].hand[0] = { ...gen, instanceId: 'test_gen_1' };
  state.players['p1'].currentEnergy = 5;

  state = playCard(state, 'p1', 'test_gen_1', 0);
  assert.ok(state.board.backline['p1'].structures[0], 'Estrutura deve estar no backline');
  assert.strictEqual(state.board.backline['p1'].structures[0]?.energyBonus, 1);

  // P1 encerra turno -> P2 joga -> P2 encerra turno -> Volta para P1 no Turno 2
  state = endTurn(state, 'p1');
  assert.strictEqual(state.activePlayerId, 'p2');
  state = endTurn(state, 'p2');
  assert.strictEqual(state.activePlayerId, 'p1');
  assert.strictEqual(state.turn, 2);
  // Base 5 + 1 de estrutura = 6 de energia!
  assert.strictEqual(state.players['p1'].currentEnergy, 6, 'Energia gerada deve ser 5 + 1 = 6');
});

// 3. Testes de Combate e Hierarquia de Alvos
test('Combate respeita Summoning Sickness para criaturas comuns, mas permite Ágil', () => {
  let state = createGame('game_test', [{ id: 'p1' }, { id: 'p2' }]);
  state = startGame(state);
  
  // Criatura normal invocada no turno 1
  state.board.lanes[0].p1Creature = {
    id: 'c1', instanceId: 'i1', cardId: 'CRE-001', name: 'Legionário',
    status: EntityStatus.READY, maxHealth: 4, health: 4, armor: 0, attackModifier: 0,
    summonedOnTurn: 1, canAttackOnEntry: false
  };
  
  assert.throws(() => resolveAttack(state, 'p1', 0), /Summoning Sickness/);

  // Criatura com Ágil
  state.board.lanes[1].p1Creature = {
    id: 'c2', instanceId: 'i2', cardId: 'CRE-002', name: 'Batedora do Vento',
    status: EntityStatus.READY, maxHealth: 3, health: 3, armor: 0, attackModifier: 0,
    summonedOnTurn: 1, canAttackOnEntry: true
  };

  assert.doesNotThrow(() => resolveAttack(state, 'p1', 1));
});

test('Combate segue hierarquia: Criatura -> Estrutura -> Herói', () => {
  let state = createGame('game_test', [{ id: 'p1' }, { id: 'p2' }]);
  state = startGame(state);

  // Atacante pronto
  state.board.lanes[0].p1Creature = {
    id: 'atk', instanceId: 'iatk', cardId: 'CRE-001', name: 'Atacante',
    status: EntityStatus.READY, maxHealth: 5, health: 5, armor: 0, attackModifier: 10,
    summonedOnTurn: 0, canAttackOnEntry: false
  };

  // 1. Defensor na mesma lane
  state.board.lanes[0].p2Creature = {
    id: 'def', instanceId: 'idef', cardId: 'CRE-001', name: 'Defensor',
    status: EntityStatus.READY, maxHealth: 5, health: 5, armor: 0, attackModifier: 0,
    summonedOnTurn: 0
  };

  // Ataque 1: destrói criatura defensora
  state = resolveAttack(state, 'p1', 0);
  assert.strictEqual(state.board.lanes[0].p2Creature, null, 'Defensor deve ter sido destruído');
  assert.strictEqual(state.players['p2'].hero.health, 30, 'Herói não deve ter sofrido dano enquanto havia criatura');

  // Reseta status do atacante
  state.board.lanes[0].p1Creature.status = EntityStatus.READY;

  // 2. Coloca estrutura no backline
  state.board.backline['p2'].structures[0] = {
    id: 's1', instanceId: 'is1', cardId: 'GEN-001', name: 'Estrutura Alvo',
    status: EntityStatus.READY, maxHealth: 3, health: 3, energyBonus: 1
  };

  // Ataque 2: destrói estrutura
  state = resolveAttack(state, 'p1', 0);
  assert.strictEqual(state.board.backline['p2'].structures[0], null, 'Estrutura deve ser destruída antes do herói');
  assert.strictEqual(state.players['p2'].hero.health, 30, 'Herói ainda intacto');

  // Reseta status do atacante
  state.board.lanes[0].p1Creature.status = EntityStatus.READY;

  // 3. Faixa vazia e sem estruturas: atinge o herói diretamente!
  state = resolveAttack(state, 'p1', 0);
  assert.ok(state.players['p2'].hero.health < 30, 'Herói agora deve ter sofrido dano');
});

test('Hero Defense Mode ALWAYS faz o herói interceptar e aciona Game Over ao zerar vida', () => {
  let state = createGame('game_test', [{ id: 'p1' }, { id: 'p2' }]);
  state = startGame(state);
  
  state.players['p2'].hero.health = 4;
  state.players['p2'].heroDefenseMode = 'ALWAYS';

  state.board.lanes[0].p1Creature = {
    id: 'atk', instanceId: 'iatk', cardId: 'CRE-001', name: 'Finalizador',
    status: EntityStatus.READY, maxHealth: 5, health: 5, armor: 0, attackModifier: 10,
    summonedOnTurn: 0, canAttackOnEntry: false
  };

  state = resolveAttack(state, 'p1', 0);
  assert.strictEqual(state.players['p2'].hero.health, 0);
  assert.strictEqual(state.status, GameStatus.FINISHED, 'Partida deve encerrar com status FINISHED');
});

console.log(`\n🎉 Todos os ${passedTests} testes passaram com 100% de sucesso!`);
