'use client';

import React, { useState } from 'react';
import cardsData from '../game/data/farelDemoCards.json';
import { CardPreview } from './CardPreview';
import { FarelCard, CardType } from '../types/farelCard';

export const CardLibraryViewer: React.FC = () => {
  const cards: FarelCard[] = cardsData.cards as FarelCard[];
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [inspectedCard, setInspectedCard] = useState<FarelCard | null>(null);

  const filterTabs = [
    { id: 'all', label: 'Todas as Cartas', count: cards.length },
    { id: 'hero', label: 'Heróis', count: cards.filter((c) => c.type === 'hero').length },
    { id: 'creature', label: 'Criaturas', count: cards.filter((c) => c.type === 'creature').length },
    { id: 'generator', label: 'Geradores', count: cards.filter((c) => c.type === 'generator').length },
    { id: 'spell', label: 'Magias Instantâneas', count: cards.filter((c) => c.type === 'spell').length },
    { id: 'channelled_spell', label: 'Magias Canalizadas', count: cards.filter((c) => c.type === 'channelled_spell').length },
  ];

  const filteredCards = cards.filter((card) => {
    const matchesType = selectedType === 'all' || card.type === selectedType;
    const matchesSearch =
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.rulesText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-5 p-4 sm:p-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-amber-300 flex items-center gap-2">
            <span>🃏</span>
            <span>Biblioteca Inicial de Cartas — FAREL TCG</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Coleção demonstrativa de 14 cartas para teste de onboarding e sistema visual. Valores ilustrativos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Buscar por nome, palavra-chave ou efeito..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 min-w-[260px]"
          />
        </div>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedType(tab.id)}
            className={`px-3 py-1.5 rounded-lg border font-medium whitespace-nowrap transition-all ${
              selectedType === tab.id
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            {tab.label} <span className="opacity-60 text-[10px]">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCards.map((card) => {
          return (
            <div
              key={card.id}
              onClick={() => setInspectedCard(card)}
              className="cursor-pointer group hover:scale-[1.02] transition-transform"
            >
              <CardPreview card={card} />
            </div>
          );
        })}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-12 text-sm text-slate-400 font-mono">
          Nenhuma carta encontrada para o filtro atual.
        </div>
      )}

      {/* Modal Inspector for Full View */}
      {inspectedCard && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setInspectedCard(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <CardPreview card={inspectedCard} onClose={() => setInspectedCard(null)} />
          </div>
        </div>
      )}
    </div>
  );
};
