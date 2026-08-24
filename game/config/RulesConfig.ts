export interface RulesConfig {
  base_energy: number;
  starting_hand: number;
  max_hand: number;
  draw_per_turn: number;
  creature_slots: number;
  structure_slots: number;
  channeling_slots: number;
  attack_dice: string;
  mandatory_attack: boolean;
  energy_carries_over: boolean;
  buff_max_damage: number | null;
  hero_defense_limit: number | null;
}

export const DEFAULT_RULES_CONFIG: RulesConfig = {
  base_energy: 5,
  starting_hand: 5,
  max_hand: 5,
  draw_per_turn: 1,
  creature_slots: 5,
  structure_slots: 5,
  channeling_slots: 3,
  attack_dice: "d6",
  mandatory_attack: false,
  energy_carries_over: false,
  buff_max_damage: null,
  hero_defense_limit: null,
};

export function validateRulesConfig(config: RulesConfig): void {
  if (typeof config.base_energy !== 'number' || config.base_energy < 0) {
    throw new Error("Invalid base_energy: must be a non-negative number.");
  }
  if (typeof config.starting_hand !== 'number' || config.starting_hand < 0) {
    throw new Error("Invalid starting_hand: must be a non-negative number.");
  }
  if (typeof config.max_hand !== 'number' || config.max_hand <= 0) {
    throw new Error("Invalid max_hand: must be a positive number.");
  }
  if (config.starting_hand > config.max_hand) {
    throw new Error("Invalid max_hand: cannot be less than starting_hand.");
  }
  if (typeof config.draw_per_turn !== 'number' || config.draw_per_turn < 0) {
    throw new Error("Invalid draw_per_turn: must be a non-negative number.");
  }
  if (typeof config.creature_slots !== 'number' || config.creature_slots <= 0) {
    throw new Error("Invalid creature_slots: must be a positive number.");
  }
  if (typeof config.structure_slots !== 'number' || config.structure_slots <= 0) {
    throw new Error("Invalid structure_slots: must be a positive number.");
  }
  if (typeof config.channeling_slots !== 'number' || config.channeling_slots <= 0) {
    throw new Error("Invalid channeling_slots: must be a positive number.");
  }
  if (typeof config.attack_dice !== 'string' || !/^d[1-9]\d*$/.test(config.attack_dice)) {
    throw new Error("Invalid attack_dice: must be a string like 'd6', 'd20'.");
  }
  if (typeof config.mandatory_attack !== 'boolean') {
    throw new Error("Invalid mandatory_attack: must be a boolean.");
  }
  if (typeof config.energy_carries_over !== 'boolean') {
    throw new Error("Invalid energy_carries_over: must be a boolean.");
  }
  if (config.buff_max_damage !== null && (typeof config.buff_max_damage !== 'number' || config.buff_max_damage < 0)) {
    throw new Error("Invalid buff_max_damage: must be null or a non-negative number.");
  }
  if (config.hero_defense_limit !== null && (typeof config.hero_defense_limit !== 'number' || config.hero_defense_limit < 0)) {
    throw new Error("Invalid hero_defense_limit: must be null or a non-negative number.");
  }
}
