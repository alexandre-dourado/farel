'use client';

import React from 'react';

interface LifeOrbProps {
  currentHp: number;
  maxHp: number;
  isDamaged?: boolean;
  label?: string;
  size?: 'lg' | 'md' | 'sm';
  showMax?: boolean;
}

export const LifeOrb: React.FC<LifeOrbProps> = ({
  currentHp,
  maxHp,
  isDamaged = false,
  label,
  size = 'lg',
  showMax = true
}) => {
  const safeMax = Math.max(1, maxHp);
  const fillPercentage = Math.max(0, Math.min(100, Math.round((currentHp / safeMax) * 100)));

  // Size dimensions
  const dimClass = size === 'lg' ? 'w-[78px] h-[78px]' : size === 'md' ? 'w-[54px] h-[54px]' : 'w-[36px] h-[36px]';
  const textClass = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-base' : 'text-xs';
  const maxTextClass = size === 'lg' ? 'text-[9px]' : 'text-[8px]';

  return (
    <div className="flex flex-col items-center select-none group">
      {label && (
        <span className="text-[9px] font-serif font-bold uppercase tracking-wider text-[#d98275] mb-1">
          {label}
        </span>
      )}

      {/* Orbe Esférico de Sangue */}
      <div
        className={`relative ${dimClass} rounded-full p-[3px] bg-gradient-to-b from-[#8f5835] via-[#4a241c] to-[#120706] shadow-[0_4px_16px_rgba(0,0,0,0.8),0_0_12px_rgba(200,20,20,0.35)] transition-all ${
          isDamaged ? 'blood-orb-hit' : ''
        }`}
        title={`Pontos de Vida: ${currentHp} / ${maxHp} (${fillPercentage}%)`}
      >
        {/* Borda chanfrada de ferro/bronze */}
        <div className="w-full h-full rounded-full overflow-hidden relative bg-[#0d0404] border border-[#ff8e7d]/30 shadow-[inset_0_0_15px_#000]">
          {/* Nível do Líquido de Sangue com Transição Fluida */}
          <div
            className="absolute left-0 right-0 bottom-0 transition-all duration-700 ease-out"
            style={{
              height: `${fillPercentage}%`,
              background: 'linear-gradient(to top, #360202 0%, #7d0a0a 45%, #b51919 80%, #fa3434 100%)',
              boxShadow: '0 -2px 10px rgba(255, 60, 60, 0.6)'
            }}
          >
            {/* Onda líquida ondulante no topo */}
            {fillPercentage > 0 && fillPercentage < 100 && (
              <div
                className="absolute -top-[7px] left-[-50%] w-[200%] h-[14px] opacity-80"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(255,100,100,0.9) 0%, rgba(200,20,20,0) 70%)',
                  animation: 'fluid-wave 3.5s linear infinite'
                }}
              />
            )}
          </div>

          {/* Brilho Especular de Vidro 3D (Reflexo de Lente) */}
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 25%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.1) 30%, transparent 60%)'
            }}
          />

          {/* Sombra de Borda Interna para Profundidade Esférica */}
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.8), inset 0 -4px 8px rgba(30, 0, 0, 0.9)'
            }}
          />

          {/* Número de Vida Gigante Centralizado */}
          <div className="absolute inset-0 flex flex-col items-center justify-center leading-none z-10">
            <span
              className={`${textClass} font-serif font-black text-[#fff5f5] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]`}
              style={{
                textShadow: '0 0 8px #ff2222, 0 2px 4px #000'
              }}
            >
              {currentHp}
            </span>
            {showMax && size === 'lg' && (
              <span className={`${maxTextClass} text-[#ffc2be] font-mono font-bold tracking-tighter opacity-80 mt-0.5`}>
                / {maxHp} PV
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
