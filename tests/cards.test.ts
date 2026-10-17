import { describe, it, expect } from 'vitest';
import cardsData from '../game/data/farelDemoCards.json';
import { FarelCard } from '../types/farelCard';

describe('FAREL 03 — Biblioteca de Cartas Inicial', () => {
  const cards: FarelCard[] = cardsData.cards as FarelCard[];

  it('deve ter um JSON válido com 17 cartas demonstrativas (2 heróis, 6 criaturas, 3 geradores, 3 magias, 3 canalizadas)', () => {
    expect(cardsData.libraryId).toBe('farel-demo-set-001');
    expect(cardsData.status).toBe('illustrative-not-official');
    expect(cards.length).toBe(17);
  });

  it('todos os IDs devem ser únicos e estáveis', () => {
    const ids = cards.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('nenhuma criatura ou herói deve ter atributo fixo de attack', () => {
    cards.forEach((card) => {
      expect((card as any).attack).toBeUndefined();
    });
  });

  it('apenas CRE-002 (Batedora do Vento) deve ter canAttackOnSummon: true', () => {
    const agileCards = cards.filter((c) => c.canAttackOnSummon === true);
    expect(agileCards.length).toBe(1);
    expect(agileCards[0].id).toBe('CRE-002');
    expect(agileCards[0].keywords).toContain('Ágil');
  });

  it('todas as cartas devem estar marcadas com demoOnly: true', () => {
    cards.forEach((card) => {
      expect(card.demoOnly).toBe(true);
    });
  });

  it('estruturas geradoras GEN-* devem possuir incomePerTurn numérico positivo e vida', () => {
    const generators = cards.filter((c) => c.type === 'generator');
    expect(generators.length).toBe(3);
    generators.forEach((gen) => {
      expect(typeof gen.incomePerTurn).toBe('number');
      expect(gen.incomePerTurn).toBeGreaterThan(0);
      expect(typeof gen.life).toBe('number');
      expect(gen.life).toBeGreaterThan(0);
    });
  });

  it('magias canalizadas CHN-* devem possuir trigger descritivo e vida nula', () => {
    const channelled = cards.filter((c) => c.type === 'channelled_spell');
    expect(channelled.length).toBe(3);
    channelled.forEach((ch) => {
      expect(ch.life).toBeNull();
      expect(typeof ch.trigger).toBe('string');
      expect(ch.trigger!.length).toBeGreaterThan(5);
    });
  });

  it('heróis devem ter vida numérica e custo zero de invocação', () => {
    const heroes = cards.filter((c) => c.type === 'hero');
    expect(heroes.length).toBe(2);
    heroes.forEach((h) => {
      expect(h.energyCost).toBe(0);
      expect(typeof h.life).toBe('number');
      expect(h.life).toBeGreaterThan(0);
    });
  });
});
