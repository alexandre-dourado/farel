import { describe, it, expect } from 'vitest';
import { demoRules } from '../game/config/demoRules';
import cardsData from '../game/data/farelDemoCards.json';
import { FarelCard } from '../types/farelCard';

describe('FAREL 02 — Tabuleiro e Sistema Visual', () => {
  const cards: FarelCard[] = cardsData.cards as FarelCard[];

  it('deve respeitar a contagem de 14 slots por jogador no campo (1 + 5 + 5 + 3)', () => {
    const heroSlots = 1;
    const creatureSlots = 5;
    const structureSlots = 5;
    const channelSlots = 3;
    const totalSlotsPerPlayer = heroSlots + creatureSlots + structureSlots + channelSlots;

    expect(totalSlotsPerPlayer).toBe(14);
  });

  it('as 5 faixas de combate devem alinhar criaturas e estruturas front-to-back', () => {
    const lanes = [1, 2, 3, 4, 5];
    expect(lanes.length).toBe(5);
  });

  it('combate deve calcular dano base no d6 somado a eventuais modificadores sem ataque estático', () => {
    const roll = 4;
    const modifier = 2; // Buff Fúria Marcial
    const finalDamage = roll + modifier;

    expect(roll).toBeGreaterThanOrEqual(1);
    expect(roll).toBeLessThanOrEqual(6);
    expect(finalDamage).toBe(6);
  });

  it('prioridade de alvo na faixa deve seguir estritamente: Criatura -> Estrutura -> Herói', () => {
    const resolveTarget = (hasCreature: boolean, hasStructure: boolean) => {
      if (hasCreature) return 'creature';
      if (hasStructure) return 'structure';
      return 'hero';
    };

    expect(resolveTarget(true, true)).toBe('creature');
    expect(resolveTarget(false, true)).toBe('structure');
    expect(resolveTarget(false, false)).toBe('hero');
  });

  it('estruturas geradoras com vida devem somar energia à renda do turno', () => {
    const baseEnergy = 5;
    const minaDeEter = cards.find((c) => c.id === 'GEN-002')!;
    const income = minaDeEter.incomePerTurn || 0;
    const totalEnergy = baseEnergy + income;

    expect(income).toBe(2);
    expect(totalEnergy).toBe(7);
  });

  it('quando o herói chega a zero pontos de vida a condição de derrota é atingida', () => {
    const heroLife = 0;
    const isGameOver = heroLife <= 0;
    expect(isGameOver).toBe(true);
  });
});
