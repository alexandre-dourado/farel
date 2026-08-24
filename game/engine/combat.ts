import { GameState, EventLog } from '../../types/gameState';
import { GameStatus, EventType, EntityStatus } from '../../types/enums';
import { RulesConfig, DEFAULT_RULES_CONFIG } from '../config/RulesConfig';
import { Creature, Structure, Hero } from '../../types/entities';

export function resolveAttack(
  state: GameState,
  attackerId: string,
  laneIndex: number,
  defendWithHero: boolean = false,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): GameState {
  const newState = { ...state };
  
  const lane = newState.board.lanes[laneIndex];
  if (!lane) throw new Error("Invalid lane");
  
  const isP1 = attackerId === Object.keys(newState.players)[0];
  const attacker: Creature | null = isP1 ? lane.p1Creature : lane.p2Creature;
  
  if (!attacker) {
    throw new Error("No attacker in lane");
  }
  
  const defenderId = Object.keys(newState.players).find(id => id !== attackerId) || '';
  const enemyPlayer = newState.players[defenderId];
  
  let targetType: 'CREATURE' | 'STRUCTURE' | 'HERO' | null = null;
  let targetEntity: Creature | Structure | Hero | null = null;
  let targetIndex = -1;
  
  if (defendWithHero) {
    targetType = 'HERO';
    targetEntity = enemyPlayer.hero;
  } else {
    const enemyCreature = isP1 ? lane.p2Creature : lane.p1Creature;
    if (enemyCreature) {
      targetType = 'CREATURE';
      targetEntity = enemyCreature;
    } else {
      const structures = newState.board.backline[defenderId].structures;
      const structIndex = structures.findIndex(s => s !== null);
      if (structIndex !== -1) {
        targetType = 'STRUCTURE';
        targetEntity = structures[structIndex];
        targetIndex = structIndex;
      } else {
        targetType = 'HERO';
        targetEntity = enemyPlayer.hero;
      }
    }
  }
  
  if (!targetEntity || !targetType) {
    throw new Error("No valid target found");
  }
  
  const roll = Math.floor(Math.random() * 6) + 1;
  const damage = roll + (attacker.attackModifier || 0);
  
  newState.logs.push({
    type: EventType.DICE_ROLLED,
    sourceId: attackerId,
    value: roll,
    timestamp: Date.now()
  } as EventLog);
  
  let finalDamage = damage;
  
  if (targetType === 'HERO') {
    finalDamage = Math.max(0, damage - enemyPlayer.hero.baseDefense);
    enemyPlayer.hero.health -= finalDamage;
    newState.logs.push({
      type: EventType.HERO_DAMAGED,
      sourceId: attackerId,
      targetId: defenderId,
      value: finalDamage,
      timestamp: Date.now()
    } as EventLog);
    
    if (enemyPlayer.hero.health <= 0) {
      newState.logs.push({
        type: EventType.HERO_DESTROYED,
        sourceId: attackerId,
        targetId: defenderId,
        timestamp: Date.now()
      } as EventLog);
      newState.status = GameStatus.FINISHED;
      newState.logs.push({
        type: EventType.GAME_WON,
        sourceId: attackerId,
        timestamp: Date.now()
      } as EventLog);
    }
  } else if (targetType === 'STRUCTURE') {
    const s = targetEntity as Structure;
    finalDamage = damage;
    s.health -= finalDamage;
    
    newState.logs.push({
      type: EventType.DAMAGE_DEALT,
      sourceId: attackerId,
      targetId: s.id,
      value: finalDamage,
      timestamp: Date.now()
    } as EventLog);
    
    if (s.health <= 0) {
      s.status = EntityStatus.DESTROYED;
      newState.board.backline[defenderId].structures[targetIndex] = null;
      newState.logs.push({
        type: EventType.STRUCTURE_DESTROYED,
        sourceId: attackerId,
        targetId: s.id,
        timestamp: Date.now()
      } as EventLog);
    }
  } else if (targetType === 'CREATURE') {
    const c = targetEntity as Creature;
    finalDamage = Math.max(0, damage - (c.armor || 0));
    c.health -= finalDamage;
    
    newState.logs.push({
      type: EventType.DAMAGE_DEALT,
      sourceId: attackerId,
      targetId: c.id,
      value: finalDamage,
      timestamp: Date.now()
    } as EventLog);
    
    if (c.health <= 0) {
      c.status = EntityStatus.DESTROYED;
      if (isP1) {
        lane.p2Creature = null;
      } else {
        lane.p1Creature = null;
      }
      newState.logs.push({
        type: EventType.CREATURE_DESTROYED,
        sourceId: attackerId,
        targetId: c.id,
        timestamp: Date.now()
      } as EventLog);
    }
  }
  
  return newState;
}
