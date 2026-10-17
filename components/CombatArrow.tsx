'use client';

import React from 'react';

interface CombatArrowProps {
  laneNumber: number; // 1 to 5
  targetType: 'creature' | 'structure' | 'hero';
  isHeroIntercepting?: boolean;
  damageValue?: number;
  attackerName?: string;
  targetName?: string;
}

export const CombatArrow: React.FC<CombatArrowProps> = ({
  laneNumber,
  targetType,
  isHeroIntercepting = false,
  damageValue,
  attackerName,
  targetName,
}) => {
  const getTargetDescription = () => {
    if (isHeroIntercepting) return '🛡️ Herói interceptando golpe!';
    switch (targetType) {
      case 'creature': return `⚔️ Alvo Prioritário: Criatura na Faixa ${laneNumber}`;
      case 'structure': return `💥 Alvo Secundário: Estrutura na Faixa ${laneNumber}`;
      case 'hero': return `👑 Alvo Direto: Herói Inimigo!`;
    }
  };

  return (
    <div
      className="w-full flex items-center justify-between p-2 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs font-mono shadow-md animate-pulse my-1"
      aria-label={`Seta de combate: faixa ${laneNumber}, alvo: ${targetType}. ${isHeroIntercepting ? 'Herói interceptando' : ''}`}
    >
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-rose-500 text-slate-950 flex items-center justify-center font-bold text-xs">
          {laneNumber}
        </span>
        <span className="text-slate-200 font-bold">{attackerName || `Criatura Faixa ${laneNumber}`}</span>
        <span className="text-rose-400 font-bold">➔</span>
        <span className={isHeroIntercepting ? 'text-amber-300 font-bold' : 'text-rose-300'}>
          {targetName || getTargetDescription()}
        </span>
      </div>

      {damageValue !== undefined && (
        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
          −{damageValue} PV
        </span>
      )}
    </div>
  );
};
