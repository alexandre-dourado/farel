const fs = require('fs');
const path = require('path');

const entitiesFile = 'C:/Alx/AD26/Projetos/farel/docs/farel-repo/types/entities.ts';
let entities = fs.readFileSync(entitiesFile, 'utf8');
entities = entities.replace(/  baseDefense: number;\r?\n/, '');
entities = entities.replace(/  armor: number;\r?\n/, '');
entities = entities.replace(/  attackModifier: number;/g, '  attackModifier: number;\n  summonedOnTurn: number;\n  canAttackOnEntry?: boolean;');
fs.writeFileSync(entitiesFile, entities);

const indexFile = 'C:/Alx/AD26/Projetos/farel/docs/farel-repo/game/engine/index.ts';
let index = fs.readFileSync(indexFile, 'utf8');
index = index.replace(/\{\s*\.\.\.state\s*\}/g, 'structuredClone(state)');
index = index.replace(/        baseDefense: 0,\r?\n/, '');
index = index.replace(/             armor: 0,\r?\n/, '');
index = index.replace(/             attackModifier: 0/g, '             attackModifier: 0,\n             summonedOnTurn: newState.turn,\n             canAttackOnEntry: card.canAttackOnEntry');

const startTurnOld = export function startTurn(state: GameState, playerId: string, config: RulesConfig = DEFAULT_RULES_CONFIG): GameState {
  let newState = structuredClone(state);
  newState.activePlayerId = playerId;
  newState.phase = TurnPhase.START;;
const startTurnNew = export function startTurn(state: GameState, playerId: string, config: RulesConfig = DEFAULT_RULES_CONFIG): GameState {
  let newState = structuredClone(state);
  newState.activePlayerId = playerId;
  newState.phase = TurnPhase.START;
  
  newState.board.lanes.forEach(lane => {
    if (lane.p1Creature && lane.p1Creature.status === EntityStatus.SUMMONED && lane.p1Creature.summonedOnTurn < newState.turn) {
        lane.p1Creature.status = EntityStatus.READY;
    }
    if (lane.p2Creature && lane.p2Creature.status === EntityStatus.SUMMONED && lane.p2Creature.summonedOnTurn < newState.turn) {
        lane.p2Creature.status = EntityStatus.READY;
    }
  });;

index = index.replace(/export function startTurn[\s\S]*?newState\.phase = TurnPhase\.START;/, startTurnNew);
fs.writeFileSync(indexFile, index);

const combatFile = 'C:/Alx/AD26/Projetos/farel/docs/farel-repo/game/engine/combat.ts';
let combat = fs.readFileSync(combatFile, 'utf8');
combat = combat.replace(/\{\s*\.\.\.state\s*\}/g, 'structuredClone(state)');

const checkAttacker = if (!attacker) {
    throw new Error("No attacker in lane");
  }
  
  if (attacker.summonedOnTurn === newState.turn && !attacker.canAttackOnEntry) {
    throw new Error("Summoning sickness");
  };
combat = combat.replace(/if \(!attacker\) \{\s*throw new Error\(\"No attacker in lane\"\);\s*\}/, checkAttacker);

combat = combat.replace(/finalDamage = Math\.max\(0, damage - enemyPlayer\.hero\.baseDefense\);/g, 'finalDamage = damage;');
combat = combat.replace(/finalDamage = Math\.max\(0, damage - \(c\.armor \|\| 0\)\);/g, 'finalDamage = damage;');
fs.writeFileSync(combatFile, combat);

console.log('Scripts modified');
