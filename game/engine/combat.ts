import { GameState, EventLog } from '../../types/gameState';
import { GameStatus, EventType, EntityStatus } from '../../types/enums';
import { RulesConfig, DEFAULT_RULES_CONFIG } from '../config/RulesConfig';
import { Creature, Structure, Hero } from '../../types/entities';

export interface CombatResult {
  state: GameState;
  roll: number;
  totalDamage: number;
  targetType: 'CREATURE' | 'STRUCTURE' | 'HERO';
  targetName: string;
  targetDestroyed: boolean;
  message: string;
}

export function resolveAttack(
  state: GameState,
  attackerId: string,
  laneIndex: number,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): GameState {
  const newState = structuredClone(state);
  
  if (attackerId !== newState.activePlayerId) {
    throw new Error("Não é o seu turno para atacar.");
  }
  
  const lane = newState.board.lanes[laneIndex];
  if (!lane) throw new Error("Faixa (lane) inválida.");
  
  const isP1 = attackerId === Object.keys(newState.players)[0];
  const attacker: Creature | null = isP1 ? lane.p1Creature : lane.p2Creature;
  
  if (!attacker) {
    throw new Error("Nenhuma criatura aliada presente nesta faixa.");
  }
  
  if (attacker.summonedOnTurn === newState.turn && !attacker.canAttackOnEntry) {
    throw new Error("Esta criatura acabou de entrar e não pode atacar neste turno (Summoning Sickness).");
  }
  
  if (attacker.status === EntityStatus.EXHAUSTED) {
    throw new Error("Esta criatura já atacou neste turno.");
  }
  
  const defenderId = Object.keys(newState.players).find(id => id !== attackerId) || '';
  const enemyPlayer = newState.players[defenderId];
  const myPlayer = newState.players[attackerId];
  
  let targetType: 'CREATURE' | 'STRUCTURE' | 'HERO' | null = null;
  let targetEntity: Creature | Structure | Hero | null = null;
  let targetIndex = -1;
  let targetName = '';
  
  // ROTA B: O defensor decide se o herói intercepta (heroDefenseMode === 'ALWAYS')
  if (enemyPlayer.heroDefenseMode === 'ALWAYS') {
    targetType = 'HERO';
    targetEntity = enemyPlayer.hero;
    targetName = enemyPlayer.hero.name;
  } else {
    const enemyCreature = isP1 ? lane.p2Creature : lane.p1Creature;
    if (enemyCreature) {
      targetType = 'CREATURE';
      targetEntity = enemyCreature;
      targetName = enemyCreature.name;
    } else {
      // Se não há criatura na faixa, verifica estruturas no backline inimigo
      const structures = newState.board.backline[defenderId].structures;
      const structIndex = structures.findIndex(s => s !== null);
      if (structIndex !== -1) {
        targetType = 'STRUCTURE';
        targetEntity = structures[structIndex];
        targetIndex = structIndex;
        targetName = structures[structIndex]?.name || 'Estrutura';
      } else {
        // Se faixa vazia e sem estruturas, atinge o herói diretamente
        targetType = 'HERO';
        targetEntity = enemyPlayer.hero;
        targetName = enemyPlayer.hero.name;
      }
    }
  }
  
  if (!targetEntity || !targetType) {
    throw new Error("Nenhum alvo válido encontrado para o ataque.");
  }
  
  // Rolagem de dado d6
  const roll = Math.floor(Math.random() * 6) + 1;
  const attackMod = attacker.attackModifier || 0;
  let damage = roll + attackMod;
  
  // Log da rolagem
  newState.logs.push({
    type: EventType.DICE_ROLLED,
    sourceId: attackerId,
    value: roll,
    message: `${attacker.name} rolou [${roll}] no d6 (+${attackMod} bônus) = ${damage} de dano contra ${targetName}.`,
    timestamp: Date.now()
  });
  
  // Checa armadilha canalizada do defensor (Ex: CHN-002 Emboscada Cronal)
  const defenderChannels = newState.board.backline[defenderId].channeling;
  const ambushIndex = defenderChannels.findIndex(
    ch => ch && ch.card && ch.card.effectKind === 'triggered_damage' && (ch.laneIndex === undefined || ch.laneIndex === laneIndex)
  );
  if (ambushIndex !== -1) {
    const trap = defenderChannels[ambushIndex];
    attacker.health -= 2;
    newState.logs.push({
      type: EventType.SPELL_ACTIVATED,
      sourceId: defenderId,
      value: 2,
      message: `⚡ Magia Canalizada ativada: ${trap?.card?.name || 'Emboscada Cronal'} causou 2 de dano a ${attacker.name}!`,
      timestamp: Date.now()
    });
    // Consome a canalização
    defenderChannels[ambushIndex] = null;
    if (attacker.health <= 0) {
      if (isP1) lane.p1Creature = null;
      else lane.p2Creature = null;
      newState.logs.push({
        type: EventType.CREATURE_DESTROYED,
        sourceId: defenderId,
        message: `${attacker.name} foi destruído pela emboscada antes de concluir o ataque.`,
        timestamp: Date.now()
      });
      return newState;
    }
  }

  // Checa redução de dano canalizada (Ex: CHN-001 Escudo Reativo)
  if (targetType === 'CREATURE') {
    const shieldIndex = defenderChannels.findIndex(
      ch => ch && ch.card && ch.card.effectKind === 'damage_reduction' && (ch.laneIndex === undefined || ch.laneIndex === laneIndex)
    );
    if (shieldIndex !== -1) {
      const shield = defenderChannels[shieldIndex];
      damage = Math.max(0, damage - 2);
      newState.logs.push({
        type: EventType.SPELL_ACTIVATED,
        sourceId: defenderId,
        value: 2,
        message: `🛡️ ${shield?.card?.name || 'Escudo Reativo'} reduziu o dano sofrido em 2!`,
        timestamp: Date.now()
      });
      defenderChannels[shieldIndex] = null;
    }
  }
  
  let finalDamage = damage;
  
  if (targetType === 'HERO') {
    finalDamage = Math.max(0, damage - (enemyPlayer.hero.baseDefense || 0));
    enemyPlayer.hero.health -= finalDamage;
    newState.logs.push({
      type: EventType.HERO_DAMAGED,
      sourceId: attackerId,
      targetId: defenderId,
      value: finalDamage,
      message: `💥 O Herói ${enemyPlayer.hero.name} sofreu ${finalDamage} de dano! (${enemyPlayer.hero.health} HP restantes)`,
      timestamp: Date.now()
    });
    
    if (enemyPlayer.hero.health <= 0) {
      enemyPlayer.hero.health = 0;
      newState.logs.push({
        type: EventType.HERO_DESTROYED,
        sourceId: attackerId,
        targetId: defenderId,
        message: `☠️ O Herói ${enemyPlayer.hero.name} foi derrotado!`,
        timestamp: Date.now()
      });
      newState.status = GameStatus.FINISHED;
      newState.logs.push({
        type: EventType.GAME_WON,
        sourceId: attackerId,
        message: `🏆 ${myPlayer.name || attackerId} venceu a partida!`,
        timestamp: Date.now()
      });
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
      message: `💥 A estrutura ${s.name} sofreu ${finalDamage} de dano. (${s.health} HP restantes)`,
      timestamp: Date.now()
    });
    
    if (s.health <= 0) {
      newState.board.backline[defenderId].structures[targetIndex] = null;
      newState.logs.push({
        type: EventType.STRUCTURE_DESTROYED,
        sourceId: attackerId,
        targetId: s.id,
        message: `💥 A estrutura ${s.name} foi destruída!`,
        timestamp: Date.now()
      });
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
      message: `⚔️ ${c.name} sofreu ${finalDamage} de dano. (${c.health} HP restantes)`,
      timestamp: Date.now()
    });
    
    if (c.health <= 0) {
      if (isP1) {
        lane.p2Creature = null;
      } else {
        lane.p1Creature = null;
      }
      newState.logs.push({
        type: EventType.CREATURE_DESTROYED,
        sourceId: attackerId,
        targetId: c.id,
        message: `💀 ${c.name} foi derrotado e removido de campo!`,
        timestamp: Date.now()
      });
    }
  }
  
  // Criatura atacante fica exausta após atacar
  attacker.status = EntityStatus.EXHAUSTED;
  
  return newState;
}
