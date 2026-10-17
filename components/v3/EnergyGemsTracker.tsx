'use client';

import React from 'react';

interface EnergyGemsTrackerProps {
  currentEnergy: number;
  maxEnergy?: number;
  label?: string;
  className?: string;
}

export const EnergyGemsTracker: React.FC<EnergyGemsTrackerProps> = ({
  currentEnergy,
  maxEnergy = 5,
  label = 'Energia',
  className = '',
}) => {
  const gemSlots = Array.from({ length: Math.max(maxEnergy, 5) });

  return (
    <div
      className={`inline-flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-[#091118]/85 border border-[#1e3a4d] shadow-[0_4px_16px_rgba(0,0,0,0.6)] backdrop-blur-md ${className}`}
    >
      {/* RÓTULO COM ÍCONE DE ÉTER */}
      <div className="flex items-center gap-1.5">
        <span className="text-cyan-400 text-xs animate-pulse">⚡</span>
        <span className="font-mono font-bold text-xs text-cyan-200 tracking-wider">
          {currentEnergy}/{maxEnergy}
        </span>
        <span className="hidden sm:inline text-[11px] font-sans text-cyan-300/70 uppercase tracking-widest font-semibold">
          {label}
        </span>
      </div>

      {/* 5 GEMAS DE CRISTAL CIANO ESTILO RPG FANTASIA */}
      <div className="flex items-center gap-1.5">
        {gemSlots.map((_, idx) => {
          const isFilled = idx < currentEnergy;
          return (
            <div
              key={idx}
              className={`relative transition-all duration-300 ${
                isFilled
                  ? 'scale-105 filter drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]'
                  : 'opacity-35 scale-90'
              }`}
              title={`Cristal de Energia ${idx + 1}`}
            >
              {/* CRISTAL EM FORMA DE LOSANGO COM RECORTE CHANFRADO */}
              <div
                className={`w-4 h-5 rounded-[3px] rotate-45 border ${
                  isFilled
                    ? 'bg-gradient-to-br from-cyan-200 via-cyan-400 to-blue-600 border-cyan-100 shadow-[inset_0_0_4px_rgba(255,255,255,0.8)]'
                    : 'bg-[#0b1c24] border-[#183d4f]'
                }`}
              />
              {/* CENTRO BRILHANTE QUANDO ATIVO */}
              {isFilled && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
