import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { CardRegistry, HeroRegistry } from '../game/data/CardRegistry';

describe('Galeria de Cartas de Fantasia Épica - Assets & Registry', () => {
  const cardsArtDir = path.join(process.cwd(), 'public', 'assets', 'farel', 'art', 'cards');
  const galleryDir = path.join(process.cwd(), 'public', 'assets', 'farel', 'art', 'gallery');
  const manifestPath = path.join(process.cwd(), 'public', 'assets', 'farel', 'art', 'gallery-manifest.json');
  const galleryManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  it('deve possuir o manifesto da galeria com 17 cartas catalogadas', () => {
    expect(galleryManifest).toBeDefined();
    expect(galleryManifest.exportedCount).toBe(17);
    expect(galleryManifest.cards.length).toBe(17);
  });

  it('deve ter todos os 17 arquivos de arte pura (.webp) no disco com tamanho > 5KB', () => {
    galleryManifest.cards.forEach((card) => {
      const filePath = path.join(cardsArtDir, `${card.id}.webp`);
      expect(fs.existsSync(filePath), `Arte de ${card.id} não encontrada em ${filePath}`).toBe(true);
      const stat = fs.statSync(filePath);
      expect(stat.size).toBeGreaterThan(5000);
    });
  });

  it('deve ter todos os 17 arquivos de cartas da galeria (.webp) no disco com tamanho > 5KB', () => {
    galleryManifest.cards.forEach((card) => {
      const filePath = path.join(galleryDir, `${card.id}.webp`);
      expect(fs.existsSync(filePath), `Carta de galeria ${card.id} não encontrada em ${filePath}`).toBe(true);
      const stat = fs.statSync(filePath);
      expect(stat.size).toBeGreaterThan(5000);
    });
  });

  it('deve vincular cada carta e herói do CardRegistry à sua respectiva arte individual', () => {
    HeroRegistry.forEach((hero) => {
      expect(hero.artUrl).toBeDefined();
      expect(hero.artUrl).toContain(`/assets/farel/art/cards/${hero.id}.webp`);
    });

    CardRegistry.forEach((card) => {
      expect(card.artUrl).toBeDefined();
      expect(card.artUrl).toContain(`/assets/farel/art/cards/${card.id}.webp`);
    });
  });
});
