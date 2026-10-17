import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('FAREL Assets Slicing & Manifest Verification', () => {
  const publicCardsDir = path.resolve(__dirname, '../public/assets/farel/cards');
  const manifestPath = path.join(publicCardsDir, 'assets-manifest.json');
  const confSheetPath = path.resolve(__dirname, '../docs/assets/asset-sheet-extracted.png');
  const reportPath = path.resolve(__dirname, '../docs/assets/asset-slicing-report.md');
  const standaloneGamePath = path.resolve(__dirname, '../v2/game.html');

  it('deve ter gerado o manifesto de assets com estrutura válida', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);

    expect(['1.1.0', '1.2.0']).toContain(manifest.manifestVersion);
    expect(manifest.assetsCount).toBe(6);
    expect(Array.isArray(manifest.assets)).toBe(true);
    expect(manifest.assets.length).toBe(6);
    expect(manifest.hasTransparentBackground).toBe(true);
  });

  it('deve conter todos os 6 assets em formato PNG e WebP no disco', () => {
    const requiredAssets = [
      'card-back',
      'template-hero',
      'template-creature',
      'template-structure',
      'template-spell-instant',
      'template-spell-channel'
    ];

    for (const assetId of requiredAssets) {
      const pngPath = path.join(publicCardsDir, `${assetId}.png`);
      const webpPath = path.join(publicCardsDir, `${assetId}.webp`);

      expect(fs.existsSync(pngPath)).toBe(true);
      expect(fs.existsSync(webpPath)).toBe(true);

      const pngStat = fs.statSync(pngPath);
      const webpStat = fs.statSync(webpPath);

      expect(pngStat.size).toBeGreaterThan(1000);
      expect(webpStat.size).toBeGreaterThan(1000);
    }
  });

  it('deve ter gerado a folha de conferência e o relatório técnico', () => {
    expect(fs.existsSync(confSheetPath)).toBe(true);
    expect(fs.statSync(confSheetPath).size).toBeGreaterThan(5000);

    expect(fs.existsSync(reportPath)).toBe(true);
    const reportText = fs.readFileSync(reportPath, 'utf-8');
    expect(reportText).toContain('Relatório Técnico de Fatiamento');
    expect(reportText).toContain('template-hero');
  });

  it('deve ter gerado o jogo standalone offline v2/game.html', () => {
    expect(fs.existsSync(standaloneGamePath)).toBe(true);
    const html = fs.readFileSync(standaloneGamePath, 'utf-8');
    expect(html).toContain('Forbidden Memories');
    expect(html).toContain('hotseat-board');
    expect(html).toContain('autoFlipToggle');
    expect(html).toContain('manualFlipBtn');
    expect(html).toContain('blood-orb');
    expect(html).toContain('energy-orb');
  });
});
