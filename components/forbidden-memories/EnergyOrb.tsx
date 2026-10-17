'use client';

import React from 'react';

interface EnergyOrbProps {
  currentEnergy: number;
  maxEnergy?: number;
  label?: string;
  size?: 'lg' | 'md' | 'sm';
}

export const EnergyOrb: React.FC<EnergyOrbProps> = ({
  currentEnergy,
  maxEnergy = 10,
  label,
  size = 'lg'
}) => {
  const safeMax = Math.max(1, maxEnergy);
  const fillPercentage = Math.max(0, Math.min(100, Math.round((currentEnergy / safeMax) * 100)));

  const dimClass = size === 'lg' ? 'w-[70px] h-[70px]' : size === 'md' ? 'w-[50px] h-[50px]' : 'w-[36px] h-[36px]';
  const textClass = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-base' : 'text-xs';

  return (
    <div className="flex flex-col items-center select-none group">
      {label && (
        <span className="text-[9px] font-serif font-bold uppercase tracking-wider text-[#43d9c4] mb-1">
          {label}
        </span>
      )}

      {/* Orbe Esférico de Plasma Arcana */}
      <div
        className={`relative ${dimClass} rounded-full p-[3px] bg-gradient-to-b from-[#356f7a] via-[#1c434d] to-[#071317] shadow-[0_4px_16px_rgba(0,0,0,0.8),0_0_12px_rgba(67,217,196,0.35)] transition-all`}
        title={`Energia Disponível: ${currentEnergy} ⚡ (${fillPercentage}%)`}
      >
        <div className="w-full h-full rounded-full overflow-hidden relative bg-[#041014] border border-[#65f0dc]/30 shadow-[inset_0_0_15px_#000]">
          {/* Nível do Líquido de Plasma Ciano */}
          <div
            className="absolute left-0 right-0 bottom-0 transition-all duration-500 ease-out"
            style={{
              height: `${fillPercentage}%`,
              background: 'linear-gradient(to top, #093438 0%, #156d78 40%, #2fb8c4 80%, #5af7e4 100%)',
              boxShadow: '0 -2px 10px rgba(67, 217, 196, 0.7)'
            }}
          >
            {fillPercentage > 0 && fillPercentage < 100 && (
              <div
                className="absolute -top-[6px] left-[-50%] w-[200%] h-[12px] opacity-85"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(160,255,245,0.95) 0%, rgba(47,184,196,0) 70%)',
                  animation: 'fluid-wave 3s linear infinite'
                }}
              />
            )}
          </div>

          {/* Brilho Especular de Vidro 3D */}
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 25%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.1) 30%, transparent 60%)'
            }}
          />

          {/* Sombra de Borda Interna */}
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.8), inset 0 -3px 6px rgba(0, 30, 35, 0.9)'
            }}
          />

          {/* Contador de Energia Gigante Centralizado */}
          <div className="absolute inset-0 flex flex-col items-center justify-center leading-none z-10">
            <div className="flex items-center gap-0.5">
              <span
                className={`${textClass} font-mono font-black text-[#eafffb] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]`}
                style={{
                  textShadow: '0 0 8px #43d9c4, 0 2px 4px #000'
                }}
              >
                {currentEnergy}
              </span>
              <span className="text-[#a0fff0] text-xs font-bold">⚡</span>
            </div>
            {size === 'lg' && (
              <span className="text-[8px] text-[#86e0d4] font-mono tracking-tighter opacity-80 mt-0.5">
                ENERGIA
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
