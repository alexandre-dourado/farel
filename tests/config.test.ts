import { describe, it, expect } from 'vitest';
import { DEFAULT_RULES_CONFIG, validateRulesConfig, RulesConfig } from '../game/config/RulesConfig';

describe('RulesConfig Validation', () => {
  it('should pass for DEFAULT_RULES_CONFIG', () => {
    expect(() => validateRulesConfig(DEFAULT_RULES_CONFIG)).not.toThrow();
  });

  it('should throw if base_energy is invalid', () => {
    const config: RulesConfig = { ...DEFAULT_RULES_CONFIG, base_energy: -1 };
    expect(() => validateRulesConfig(config)).toThrow("Invalid base_energy");
  });

  it('should throw if max_hand is less than starting_hand', () => {
    const config: RulesConfig = { ...DEFAULT_RULES_CONFIG, starting_hand: 5, max_hand: 3 };
    expect(() => validateRulesConfig(config)).toThrow("Invalid max_hand: cannot be less than starting_hand");
  });

  it('should throw if attack_dice is invalid', () => {
    const config: RulesConfig = { ...DEFAULT_RULES_CONFIG, attack_dice: "6d" };
    expect(() => validateRulesConfig(config)).toThrow("Invalid attack_dice");
  });

  it('should pass if buff_max_damage and hero_defense_limit are numbers', () => {
    const config: RulesConfig = { ...DEFAULT_RULES_CONFIG, buff_max_damage: 10, hero_defense_limit: 5 };
    expect(() => validateRulesConfig(config)).not.toThrow();
  });
});
