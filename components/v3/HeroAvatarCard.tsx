'use client';

import React from 'react';

interface HeroAvatarCardProps {
  isPlayer: boolean;
  name: string;
  title?: string;
  health: number;
  maxHealth?: number;
  armor?: number;
  avatarUrl?: string;
  isActiveTurn?: boolean;
  defenseMode?: 'AUTO' | 'ALWAYS' | 'OPTIONAL';
  onToggleDefenseMode?: () => void;
  className?: string;
}

export const HeroAvatarCard: React.FC<HeroAvatarCardProps> = ({
  isPlayer,
  name,
  title,
  health,
  maxHealth = 30,
  armor = 0,
  avatarUrl,
  isActiveTurn = false,
  defenseMode,
  onToggleDefenseMode,
  className = '',
}) => {
  const defaultAvatar = isPlayer
    ? '/assets/farel/art/cards/HERO-001.webp'
    : '/assets/farel/art/cards/HERO-002.webp';
  const imgSource = avatarUrl || defaultAvatar;

  const healthPercent = Math.max(0, Math.min(100, Math.round((health / maxHealth) * 100)));
  const isCritical = health <= 10;
  const isDead = health <= 0;

  return (
    <div
      className={`relative flex items-center gap-3.5 px-3 py-2 rounded-2xl bg-gradient-to-r ${
        isPlayer
          ? 'from-[#141d24]/90 via-[#0e161c]/95 to-[#16202a]/80'
          : 'from-[#1c1417]/90 via-[#180f12]/95 to-[#1a1316]/80'
      } border ${
        isActiveTurn
          ? 'border-[#e6c278] shadow-[0_0_20px_rgba(230,194,120,0.35)]'
          : 'border-[#4a3d24]/60'
      } backdrop-blur-md transition-all duration-300 ${className}`}
    >
      {/* RETRATO DO HERÓI COM MOLDURA DOURADA ENVELHECIDA */}
      <div className="relative group shrink-0">
        <div
          className={`w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 ${
            isActiveTurn ? 'border-[#ffd875]' : 'border-[#b89548]'
          } shadow-[0_0_12px_rgba(0,0,0,0.8),inset_0_0_10px_rgba(0,0,0,0.6)] relative bg-[#070b0e]`}
        >
          <img
            src={imgSource}
            alt={name}
            className={`w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105 ${
              isDead ? 'grayscale filter contrast-125' : ''
            }`}
          />
          <div className="absolute inset-0 pointer-events-none rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.7)]" />
        </div>

        {/* ORNATO DOURADO / STATUS DE TURNO */}
        {isActiveTurn && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fcd34d] opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#f59e0b] border border-[#fef3c7]" />
          </span>
        )}

        {/* BADGE DE ARMADURA SE HOUVER */}
        {armor > 0 && (
          <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-[#4b5563] to-[#1f2937] border border-[#9ca3af] text-slate-100 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
            🛡️ {armor}
          </div>
        )}
      </div>

      {/* INFORMAÇÕES DE NOME E SAÚDE */}
      <div className="flex flex-col min-w-[130px]">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#bea470]">
            {isPlayer ? 'Você' : 'Oponente'}
          </span>
          {defenseMode && onToggleDefenseMode && isPlayer && (
            <button
              onClick={onToggleDefenseMode}
              title={`Modo de Defesa: ${defenseMode === 'ALWAYS' ? 'Herói Sempre Intercepta' : 'Opcional'}`}
              className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                defenseMode === 'ALWAYS'
                  ? 'border-red-500/80 bg-red-950/60 text-red-200'
                  : 'border-amber-700/60 bg-amber-950/30 text-amber-300'
              }`}
            >
              {defenseMode === 'ALWAYS' ? '🛡️ Intercepta' : '⚔️ Normal'}
            </button>
          )}
        </div>

        <h3 className="font-serif font-bold text-sm text-[#f1e6cf] tracking-wide truncate max-w-[160px]">
          {title || name}
        </h3>

        {/* BARRA DE HP COM BADGE ❤️ 30 */}
        <div className="mt-1 flex items-center gap-2">
          {/* Badge de Vida */}
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-black text-xs border ${
              isCritical
                ? 'bg-red-950/90 border-red-500/90 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse'
                : 'bg-[#1a0808]/90 border-[#991b1b]/80 text-[#fca5a5]'
            }`}
          >
            <span className="text-red-400 text-xs">❤️</span>
            <span>
              {health}
              <span className="text-[#fca5a5]/60 text-[10px] font-normal">/{maxHealth}</span>
            </span>
          </div>

          {/* Mini Barra Progressiva de Saúde */}
          <div className="flex-1 h-2 bg-[#0a0f12] rounded-full overflow-hidden border border-[#3b2b17]/80 p-0.5 max-w-[80px]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCritical
                  ? 'bg-gradient-to-r from-red-600 to-rose-400'
                  : 'bg-gradient-to-r from-red-700 via-rose-600 to-emerald-500'
              }`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
