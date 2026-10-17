'use client';

import React from 'react';
import { FarelCard } from '../types/farelCard';

interface CardMiniatureProps {
  card: FarelCard;
  currentLife?: number;
  maxLife?: number;
  newlySummoned?: boolean;
  canAttack?: boolean;
  isChanneling?: boolean;
  isTriggering?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export const CardMiniature: React.FC<CardMiniatureProps> = ({
  card,
  currentLife,
  maxLife,
  newlySummoned = false,
  canAttack = false,
  isChanneling = false,
  isTriggering = false,
  onClick,
  compact = false,
}) => {
  const displayLife = currentLife !== undefined ? currentLife : (card.life || 0);
  const displayMaxLife = maxLife !== undefined ? maxLife : (card.life || 0);

  const getBorderColor = () => {
    switch (card.type) {
      case 'hero': return 'border-amber-500/60 bg-amber-950/30';
      case 'creature': return 'border-sky-500/50 bg-sky-950/30';
      case 'generator': return 'border-emerald-500/50 bg-emerald-950/30';
      case 'channelled_spell': return 'border-purple-500/50 bg-purple-950/30';
      case 'spell': return 'border-fuchsia-500/50 bg-fuchsia-950/30';
      default: return 'border-slate-700 bg-slate-900/60';
    }
  };

  const getIcon = () => {
    switch (card.type) {
      case 'hero': return '👑';
      case 'creature': return card.keywords.includes('Ágil') ? '🦅' : card.keywords.includes('Fera') ? '🐺' : '⚔️';
      case 'generator': return '💎';
      case 'channelled_spell': return '⏳';
      case 'spell': return '⚡';
      default: return '📜';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`w-full h-full rounded-lg border p-1.5 flex flex-col justify-between transition-all select-none shadow-sm ${getBorderColor()} ${
        onClick ? 'cursor-pointer hover:border-amber-400 hover:scale-[1.02]' : ''
      }`}
      title={`${card.name} (${card.type}) - Clique para inspecionar`}
    >
      {/* Top Header: Icon + Name + Cost */}
      <div className="flex items-center justify-between gap-1 leading-none">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-xs">{getIcon()}</span>
          <span className="text-xs font-bold text-slate-100 truncate">{card.name}</span>
        </div>
        {card.type !== 'hero' && (
          <span className="text-[10px] font-mono font-bold px-1 rounded bg-teal-950/80 text-teal-300 border border-teal-600/30">
            {card.energyCost}⚡
          </span>
        )}
      </div>

      {/* Middle Status Indicators */}
      <div className="my-1 flex flex-wrap gap-1 items-center">
        {newlySummoned && (
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Recém-invocada
          </span>
        )}
        {canAttack && (
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
            Pode atacar
          </span>
        )}
        {card.keywords.includes('Ágil') && (
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-sky-500/20 text-sky-200 border border-sky-400/30">
            Ágil
          </span>
        )}
        {card.type === 'generator' && card.incomePerTurn && (
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
            +{card.incomePerTurn} energia
          </span>
        )}
        {isChanneling && (
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Aguardando condição
          </span>
        )}
        {isTriggering && (
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-400 text-slate-950 font-bold animate-bounce">
            Ativando!
          </span>
        )}
      </div>

      {/* Bottom Footer: Health or Attack Die notice */}
      <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-slate-800/80">
        {card.life !== null ? (
          <span className={`font-bold ${displayLife <= 0 ? 'text-rose-500 line-through' : displayLife <= 2 ? 'text-amber-400' : 'text-rose-300'}`}>
            ❤️ {displayLife}/{displayMaxLife}
          </span>
        ) : (
          <span className="text-slate-400 text-[9px] truncate">{card.trigger || 'Magia'}</span>
        )}

        {card.type === 'creature' && (
          <span className="text-[9px] text-sky-300 bg-sky-950/60 px-1 rounded">
            d6
          </span>
        )}
      </div>
    </div>
  );
};
