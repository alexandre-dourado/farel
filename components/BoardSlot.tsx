'use client';

import React from 'react';
import { CardMiniature } from './CardMiniature';
import { FarelCard } from '../types/farelCard';

export type SlotFamily = 'hero' | 'creature' | 'structure' | 'channel';

interface BoardSlotProps {
  id: string;
  family: SlotFamily;
  slotIndex?: number; // 1 to 5 (or 1 to 3)
  label: string;
  card?: FarelCard | null;
  currentLife?: number;
  maxLife?: number;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  isTargeted?: boolean;
  isDamaged?: boolean;
  isDestroyed?: boolean;
  isNewlySummoned?: boolean;
  canAttack?: boolean;
  isChanneling?: boolean;
  isTriggering?: boolean;
  isLethal?: boolean;
  onClick?: () => void;
  onCardClick?: (card: FarelCard) => void;
  onDropCard?: (cardId: string) => void;
}

export const BoardSlot: React.FC<BoardSlotProps> = ({
  id,
  family,
  slotIndex,
  label,
  card,
  currentLife,
  maxLife,
  isHighlighted = false,
  isDimmed = false,
  isTargeted = false,
  isDamaged = false,
  isDestroyed = false,
  isNewlySummoned = false,
  canAttack = false,
  isChanneling = false,
  isTriggering = false,
  isLethal = false,
  onClick,
  onCardClick,
}) => {
  const getFamilyBorder = () => {
    switch (family) {
      case 'hero': return 'border-amber-500/40 hover:border-amber-400';
      case 'creature': return 'border-sky-500/30 hover:border-sky-400';
      case 'structure': return 'border-emerald-500/30 hover:border-emerald-400';
      case 'channel': return 'border-purple-500/30 hover:border-purple-400';
      default: return 'border-slate-700';
    }
  };

  const getFamilyBadge = () => {
    switch (family) {
      case 'hero': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'creature': return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'structure': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'channel': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    }
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative min-h-[96px] rounded-xl p-1.5 transition-all flex flex-col justify-between overflow-hidden border ${
        card ? 'border-solid bg-slate-900/80' : 'border-dashed bg-slate-950/40 ' + getFamilyBorder()
      } ${isHighlighted ? 'is-highlighted ring-2 ring-amber-300 ring-offset-2 ring-offset-slate-950' : ''} ${
        isDimmed ? 'opacity-40 grayscale-[40%]' : 'opacity-100'
      } ${isTargeted ? 'border-2 !border-rose-500 shadow-lg shadow-rose-950/60 ring-2 ring-rose-500/50' : ''} ${
        isDamaged ? 'is-damaged bg-rose-950/30' : ''
      } ${isLethal ? 'border-2 !border-rose-600 bg-rose-950/60 animate-pulse' : ''} ${
        onClick ? 'cursor-pointer' : ''
      }`}
      aria-label={`${label}: ${card ? `${card.name}` : 'Slot vazio'}`}
    >
      {/* Visual Slot Label Badge */}
      <div className="flex items-center justify-between text-[9px] font-mono leading-none mb-1">
        <span className={`px-1 py-0.5 rounded border ${getFamilyBadge()}`}>
          {label}
        </span>
        {isTargeted && (
          <span className="text-[9px] font-bold text-rose-400 bg-rose-950 px-1 py-0.5 rounded border border-rose-600 animate-pulse">
            🎯 ALVO
          </span>
        )}
        {isHighlighted && (
          <span className="text-[9px] font-bold text-amber-300 bg-amber-950 px-1 py-0.5 rounded border border-amber-500">
            ★ FOCO
          </span>
        )}
      </div>

      {/* Card or Empty State */}
      {card ? (
        <CardMiniature
          card={card}
          currentLife={currentLife}
          maxLife={maxLife}
          newlySummoned={isNewlySummoned}
          canAttack={canAttack}
          isChanneling={isChanneling}
          isTriggering={isTriggering}
          onClick={() => onCardClick && onCardClick(card)}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-2 text-slate-500 text-[11px] font-mono select-none">
          <span className="opacity-40 text-lg">
            {family === 'hero' ? '👑' : family === 'creature' ? '⚔️' : family === 'structure' ? '💎' : '⏳'}
          </span>
          <span className="text-[10px] opacity-60">Vazio</span>
        </div>
      )}
    </div>
  );
};
