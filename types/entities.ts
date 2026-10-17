import { CardType, EntityStatus } from './enums';

export interface Card {
  id: string; // card_id
  instanceId: string; // card_instance_id
  name: string;
  type: CardType;
  description: string;
  rulesText?: string;
  keywords?: string[];
  energyCost: number;
  health?: number;
  maxHealth?: number;
  attackModifier?: number;
  energyBonus?: number;
  incomePerTurn?: number | null;
  canAttackOnEntry?: boolean | null;
  effectKind?: string;
  trigger?: string | null;
  artDirection?: string;
  artUrl?: string;
}

export interface Player {
  id: string;
  userId?: string;
  name?: string;
  heroId?: string;
}

export interface Hero {
  id: string; // hero_id
  name: string;
  maxHealth: number;
  health: number;
  baseDefense: number;
  armor?: number;
  baseEnergy: number;
  artDirection?: string;
  artUrl?: string;
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
  summonedOnTurn?: number;
  canAttackOnEntry?: boolean | null;
  keywords?: string[];
  artDirection?: string;
  artUrl?: string;
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
  artDirection?: string;
  artUrl?: string;
}

export interface Spell {
  id: string;
  instanceId: string;
  cardId: string;
  name: string;
  effectKind?: string;
}

