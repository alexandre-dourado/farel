import { CardType, EntityStatus } from './enums';

export interface Card {
  id: string; // card_id
  instanceId: string; // card_instance_id
  name: string;
  type: CardType;
  description: string;
  energyCost: number;
  canAttackOnEntry?: boolean;
}

export interface Player {
  id: string;
  userId?: string;
  name?: string;
}

export interface Hero {
  id: string; // hero_id
  name: string;
  maxHealth: number;
  health: number;
  baseDefense: number;
  baseEnergy: number;
}

export interface Creature {
  id: string;
  instanceId: string; // card_instance_id
  cardId: string;
  name: string;
  status: EntityStatus;
  maxHealth: number;
  health: number;
  armor: number;
  attackModifier: number;
}

export interface Structure {
  id: string;
  instanceId: string; // card_instance_id
  cardId: string;
  name: string;
  status: EntityStatus;
  maxHealth: number;
  health: number;
  energyBonus: number;
}

export interface Spell {
  id: string;
  instanceId: string;
  cardId: string;
  name: string;
}
