import { describe, it, expect } from 'vitest';
import { TUTORIAL_SLIDES } from '../data/tutorialSlides';
import { demoRules, PLAYTEST_OPEN_QUESTIONS } from '../game/config/demoRules';

describe('FAREL 01 — Regras e Onboarding Tutorial', () => {
  it('deve conter exatamente os 18 slides com sequência didática completa', () => {
    expect(TUTORIAL_SLIDES.length).toBe(18);
    TUTORIAL_SLIDES.forEach((slide, idx) => {
      expect(slide.slideNumber).toBe(idx + 1);
      expect(slide.id).toBe(`slide-${String(idx + 1).padStart(2, '0')}`);
      expect(slide.question).toBeTruthy();
      expect(slide.body).toBeTruthy();
      expect(slide.keyTakeaway).toBeTruthy();
      expect(slide.boardScene).toBeTruthy();
      expect(Array.isArray(slide.highlight)).toBe(true);
    });
  });

  it('o slide 02 deve explicar a derrota do herói antes dos detalhes de combate', () => {
    const slide2 = TUTORIAL_SLIDES[1];
    expect(slide2.title).toBe('Como eu venço?');
    expect(slide2.body.toLowerCase()).toContain('herói');
    expect(slide2.body).toContain('vida dele chegar a zero');
  });

  it('o slide 03 deve evidenciar os 14 slots de campo (1 herói, 5 criaturas, 5 geradores, 3 canalizações)', () => {
    const slide3 = TUTORIAL_SLIDES[2];
    expect(slide3.body).toContain('1 slot de herói');
    expect(slide3.body).toContain('criaturas');
    expect(slide3.body).toContain('estruturas geradoras');
    expect(slide3.body).toContain('canalização');
  });

  it('o slide 10 deve tratar a regra geral de entrada e a exceção Ágil', () => {
    const slide10 = TUTORIAL_SLIDES[9];
    expect(slide10.cardIds).toContain('CRE-001');
    expect(slide10.cardIds).toContain('CRE-002');
    expect(slide10.body).toContain('Ágil');
  });

  it('o slide 12 deve ensinar ataque com d6 sem ataque fixo nos cards', () => {
    const slide12 = TUTORIAL_SLIDES[11];
    expect(slide12.body).toContain('dado de seis faces (d6)');
    expect(slide12.keyTakeaway).toContain('d6');
  });

  it('o slide 13 deve apresentar a prioridade de alvo correta: Criatura → Estrutura → Herói', () => {
    const slide13 = TUTORIAL_SLIDES[12];
    expect(slide13.keyTakeaway).toContain('Criatura → Estrutura → Herói');
  });

  it('objeto demoRules deve centralizar as decisões abertas do playtest', () => {
    expect(demoRules.attacksMandatory).toBe(true);
    expect(demoRules.unspentEnergyCarriesOver).toBe(false);
    expect(demoRules.handLimit).toBe(5);
    expect(demoRules.structuresStartProducing).toBe('next-turn');
  });

  it('deve conter as 16 questões de playtest documentadas', () => {
    expect(PLAYTEST_OPEN_QUESTIONS.length).toBe(16);
    PLAYTEST_OPEN_QUESTIONS.forEach((q) => {
      expect(typeof q.id).toBe('number');
      expect(q.topic).toBeTruthy();
      expect(q.question).toBeTruthy();
      expect(q.currentDemoAssumption).toBeTruthy();
    });
  });
});
