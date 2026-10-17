'use client';

import React from 'react';

interface HealthMeterProps {
  current: number;
  max: number;
  label?: string;
  isHero?: boolean;
  showBar?: boolean;
}

export const HealthMeter: React.FC<HealthMeterProps> = ({
  current,
  max,
  label = 'Vida',
  isHero = false,
  showBar = true,
}) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  const isDead = current <= 0;
  const isCritical = current <= Math.ceil(max * 0.3) && !isDead;

  return (
    <div
      className={`flex flex-col gap-1 ${isHero ? 'min-w-[120px]' : 'min-w-[70px]'}`}
      aria-label={`${label}: ${current} de ${max} pontos de vida`}
    >
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="flex items-center gap-1 text-slate-400 text-[11px]">
          <span>{isHero ? '👑' : '❤️'}</span>
          <span>{label}:</span>
        </span>
        <span
          className={`font-bold ${
            isDead
              ? 'text-rose-500 line-through'
              : isCritical
              ? 'text-amber-400 animate-pulse'
              : 'text-rose-300'
          }`}
        >
          {current} <span className="text-slate-400 font-normal">/ {max}</span>
        </span>
      </div>

      {showBar && (
        <div className="w-full h-2 rounded-full bg-slate-950/80 border border-slate-700/60 overflow-hidden relative">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isDead
                ? 'bg-rose-900'
                : isCritical
                ? 'bg-gradient-to-r from-rose-600 to-amber-500'
                : isHero
                ? 'bg-gradient-to-r from-rose-500 to-amber-400'
                : 'bg-rose-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {isDead && (
        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider text-center">
          {isHero ? 'Conexão rompida' : 'Destruído'}
        </span>
      )}
    </div>
  );
};
