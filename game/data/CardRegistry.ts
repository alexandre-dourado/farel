import { CardType } from '../../types/enums';
import { Card } from '../../types/entities';

export const CardRegistry: Card[] = [
  // CREATURES (10)
  { id: 'c_goblin', instanceId: '', name: 'Goblin Saqueador', type: CardType.CREATURE, description: 'Pequeno e rápido.', energyCost: 1, health: 3, attackModifier: 1 },
  { id: 'c_orc', instanceId: '', name: 'Orc Guerreiro', type: CardType.CREATURE, description: 'Bruto e resistente.', energyCost: 2, health: 6, attackModifier: 2 },
  { id: 'c_elf', instanceId: '', name: 'Arqueira Élfica', type: CardType.CREATURE, description: 'Ataca no momento em que entra.', energyCost: 2, health: 4, attackModifier: 1, canAttackOnEntry: true },
  { id: 'c_knight', instanceId: '', name: 'Cavaleiro de Prata', type: CardType.CREATURE, description: 'Bem blindado.', energyCost: 3, health: 8, attackModifier: 2 },
  { id: 'c_mage', instanceId: '', name: 'Mago Ancestral', type: CardType.CREATURE, description: 'Poder arcano destrutivo.', energyCost: 3, health: 5, attackModifier: 4 },
  { id: 'c_golem', instanceId: '', name: 'Golem de Pedra', type: CardType.CREATURE, description: 'Lento mas impenetrável.', energyCost: 4, health: 12, attackModifier: 2 },
  { id: 'c_dragon', instanceId: '', name: 'Filhote de Dragão', type: CardType.CREATURE, description: 'Crescerá para queimar o mundo.', energyCost: 4, health: 9, attackModifier: 5 },
  { id: 'c_assassin', instanceId: '', name: 'Assassino das Sombras', type: CardType.CREATURE, description: 'Mortal no primeiro turno.', energyCost: 2, health: 3, attackModifier: 3, canAttackOnEntry: true },
  { id: 'c_priest', instanceId: '', name: 'Sacerdote da Luz', type: CardType.CREATURE, description: 'Fé inabalável.', energyCost: 2, health: 5, attackModifier: 1 },
  { id: 'c_beast', instanceId: '', name: 'Besta Feroz', type: CardType.CREATURE, description: 'Ataque avassalador.', energyCost: 3, health: 7, attackModifier: 3 },

  // STRUCTURES (3)
  { id: 's_mana_crystal', instanceId: '', name: 'Cristal de Mana', type: CardType.STRUCTURE, description: 'Gera 1 de energia extra por turno.', energyCost: 1, health: 5, energyBonus: 1 },
  { id: 's_watchtower', instanceId: '', name: 'Torre de Vigia', type: CardType.STRUCTURE, description: 'Gera 2 de energia extra por turno.', energyCost: 3, health: 10, energyBonus: 2 },
  { id: 's_ancient_obelisk', instanceId: '', name: 'Obelisco Ancião', type: CardType.STRUCTURE, description: 'Gera 3 de energia extra por turno.', energyCost: 5, health: 15, energyBonus: 3 },

  // SPELLS (2)
  { id: 'sp_fireball', instanceId: '', name: 'Bola de Fogo', type: CardType.SPELL, description: 'Causa dano direto.', energyCost: 2 },
  { id: 'sp_heal', instanceId: '', name: 'Cura Divina', type: CardType.SPELL, description: 'Restaura vida do Herói.', energyCost: 2 }
];
