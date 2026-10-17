const path = require('path');

function findJiti() {
  const candidates = [
    path.resolve(__dirname, '../node_modules/jiti'),
    path.resolve(__dirname, '../docs/farel-repo/node_modules/jiti'),
    path.resolve(__dirname, '../../docs/farel-repo/node_modules/jiti'),
    'jiti'
  ];
  for (const c of candidates) {
    try {
      return require(c);
    } catch (_) {}
  }
  throw new Error('jiti not found. Use npm test to run the full Vitest suite.');
}

const jitiLoader = findJiti()(__filename);
jitiLoader(path.resolve(__dirname, './verify-mvp.ts'));
