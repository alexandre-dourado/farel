'use client';

import React from 'react';
import { FarelCard } from '../types/farelCard';

interface HandTrayProps {
  cards: FarelCard[];
  availableEnergy: number;
  maxHand?: number;
  onCardClick?: (card: FarelCard) => void;
  onPlayCard?: (card: FarelCard) => void;
  onDrawCard?: () => void;
  isDrawEligible?: boolean;
}

export const HandTray: React.FC<HandTrayProps> = ({
  cards,
  availableEnergy,
  maxHand = 5,
  onCardClick,
  onPlayCard,
  onDrawCard,
  isDrawEligible = false,
}) => {
  const isOverLimit = cards.length > maxHand;

  return (
    <div
      className="w-full p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-lg flex flex-col gap-2"
      aria-label={`Mão do jogador: ${cards.length} cartas de no máximo ${maxHand}`}
    >
      {/* Hand status header */}
      <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800 pb-1.5">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200">🃏 SUA MÃO:</span>
          <span className={`px-2 py-0.5 rounded font-bold ${isOverLimit ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' : 'bg-slate-800 text-slate-300'}`}>
            {cards.length} / {maxHand} cartas
          </span>
          {isOverLimit && (
            <span className="text-[10px] text-rose-400 font-sans">
              ⚠️ Limite de 5 no fim do turno!
            </span>
          )}
        </div>

        {onDrawCard && (
          <button
            onClick={onDrawCard}
            disabled={!isDrawEligible}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isDrawEligible
                ? 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-500/40 shadow-sm'
                : 'bg-slate-800/50 text-slate-500 border border-slate-800 cursor-not-allowed'
            }`}
          >
            <span>📥</span>
            <span>Comprar Carta (+1)</span>
          </button>
        )}
      </div>

      {/* Cards list */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 min-h-[90px]">
        {cards.length === 0 ? (
          <div className="w-full text-center py-4 text-xs font-mono text-slate-500">
            Nenhuma carta na mão
          </div>
        ) : (
          cards.map((card, idx) => {
            const canAfford = availableEnergy >= card.energyCost;
            return (
              <div
                key={`${card.id}-${idx}`}
                className={`flex-shrink-0 w-28 p-2 rounded-lg border flex flex-col justify-between transition-all select-none ${
                  canAfford
                    ? 'border-teal-500/40 bg-slate-800/80 hover:border-teal-400 hover:scale-[1.03] cursor-pointer shadow-md'
                    : 'border-slate-800 bg-slate-900/60 opacity-60'
                }`}
                onClick={() => onCardClick && onCardClick(card)}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[9px] px-1 rounded bg-slate-700/60 text-slate-300 truncate max-w-[50px]">
                    {card.type === 'creature' ? 'CRI' : card.type === 'generator' ? 'GER' : 'MAG'}
                  </span>
                  <span className={`font-bold px-1 rounded ${canAfford ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-400'}`}>
                    {card.energyCost}⚡
                  </span>
                </div>

                <div className="my-1 text-xs font-bold text-slate-100 truncate" title={card.name}>
                  {card.name}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-slate-700/60">
                  <span className="text-rose-400 font-semibold">
                    {card.life !== null ? `❤️ ${card.life}` : '⚡'}
                  </span>
                  {onPlayCard && canAfford && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayCard(card);
                      }}
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-500/30 text-teal-200 hover:bg-teal-500/50 border border-teal-400/40"
                    >
                      Jogar
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
