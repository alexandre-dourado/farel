export type CardType = 'hero' | 'creature' | 'generator' | 'spell' | 'channelled_spell';

export type EffectKind = 
  | 'hero_core_rule'
  | 'basic_creature'
  | 'agile_creature'
  | 'high_life_creature'
  | 'low_cost_creature'
  | 'standard_creature'
  | 'large_creature'
  | 'energy_generation'
  | 'attack_modifier'
  | 'direct_damage'
  | 'temporary_energy'
  | 'damage_reduction'
  | 'triggered_damage'
  | 'delayed_energy';

export interface FarelCard {
  id: string;
  instanceId?: string;
  name: string;
  type: CardType;
  energyCost: number;
  life: number | null;
  rulesText: string;
  keywords: string[];
  canAttackOnSummon?: boolean | null;
  incomePerTurn?: number | null;
  effectKind?: EffectKind | string;
  trigger?: string | null;
  artDirection: string;
  artUrl?: string;
  galleryUrl?: string;
  demoOnly: boolean;
  demoNotes?: string;
}

export interface FarelCardLibrary {
  libraryId: string;
  libraryName: string;
  version: string;
  status: string;
  cards: FarelCard[];
}
