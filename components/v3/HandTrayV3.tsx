'use client';

import React from 'react';
import { FarelPlayingCard } from '../FarelPlayingCard';
import { FarelCard } from '../../types/farelCard';

interface HandTrayV3Props {
  hand: (FarelCard | any)[];
  selectedCard: (FarelCard | any) | null;
  playerEnergy: number;
  onSelectCard: (card: any) => void;
  deckCount?: number;
  graveyardCount?: number;
  className?: string;
}

export const HandTrayV3: React.FC<HandTrayV3Props> = ({
  hand,
  selectedCard,
  playerEnergy,
  onSelectCard,
  deckCount = 28,
  graveyardCount = 0,
  className = '',
}) => {
  return (
    <div
      className={`relative w-full flex items-center justify-between gap-4 px-4 py-2 bg-gradient-to-t from-[#060a0d] via-[#091016]/95 to-transparent border-t border-[#3a2c16]/30 ${className}`}
    >
      {/* DECK DE COMPRA DO JOGADOR (STACK 3D) */}
      <div
        className="flex flex-col items-center group cursor-pointer shrink-0"
        title={`Deck: ${deckCount} cartas restantes`}
      >
        <div className="relative w-16 h-22 rounded-lg bg-[#0e1720] border border-[#d4af37]/50 shadow-[0_4px_12px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.2),transparent)]" />
          <span className="font-serif text-[#d4af37] text-lg">✧</span>
          {/* Marcador de Profundidade do Deck */}
          <div className="absolute bottom-1 right-1 font-mono font-bold text-[10px] text-[#f7e8c4] bg-black/60 px-1 rounded">
            {deckCount}
          </div>
        </div>
        <span className="text-[10px] font-mono text-[#8fa7bd] uppercase tracking-wider mt-1">
          Deck ({deckCount})
        </span>
      </div>

      {/* TRAY CENTRAL COM AS CARTAS DA MÃO */}
      <div className="flex-1 flex items-center justify-center gap-2 overflow-x-auto py-2 px-2 scrollbar-none">
        {hand.length === 0 ? (
          <div className="text-xs text-[#6e8597] font-mono py-6">Sua mão está vazia.</div>
        ) : (
          hand.map((card, idx) => {
            const isSelected = selectedCard?.instanceId === card.instanceId;
            const canAfford = playerEnergy >= (card.energyCost || 0);

            return (
              <div
                key={card.instanceId || `${card.id}-${idx}`}
                onClick={() => onSelectCard(card)}
                className={`transition-all duration-300 transform cursor-pointer shrink-0 ${
                  isSelected
                    ? '-translate-y-4 scale-110 z-30 drop-shadow-[0_0_20px_rgba(255,216,117,0.7)]'
                    : 'hover:-translate-y-3 hover:scale-105 hover:z-20'
                } ${
                  canAfford
                    ? 'filter drop-shadow-[0_0_8px_rgba(34,211,238,0.35)]'
                    : 'opacity-70 grayscale-[25%]'
                }`}
              >
                <FarelPlayingCard
                  card={card}
                  size="mini"
                  isSelected={isSelected}
                  isTargetable={canAfford}
                  badgeText={`${card.energyCost || 0}⚡`}
                />
              </div>
            );
          })
        )}
      </div>

      {/* PILHA DE DESCARTE / CEMITÉRIO */}
      <div
        className="flex flex-col items-center group cursor-pointer shrink-0"
        title={`Cemitério: ${graveyardCount} cartas descartadas`}
      >
        <div className="relative w-16 h-22 rounded-lg bg-[#140b0e] border border-rose-900/40 shadow-inner flex items-center justify-center overflow-hidden">
          <span className="font-serif text-rose-500/60 text-lg">☠</span>
          <div className="absolute bottom-1 right-1 font-mono font-bold text-[10px] text-rose-300 bg-black/60 px-1 rounded">
            {graveyardCount}
          </div>
        </div>
        <span className="text-[10px] font-mono text-[#8fa7bd] uppercase tracking-wider mt-1">
          Descarte ({graveyardCount})
        </span>
      </div>
    </div>
  );
};
