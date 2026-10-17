'use client';

import React, { useEffect, useState } from 'react';
import { FarelPlayingCard } from './FarelPlayingCard';
import { FarelCard } from '../types/farelCard';

export type ActionSpotlightType = 
  | 'COMBAT_ATTACK'
  | 'SPELL_CAST'
  | 'CHANNEL_TRIGGERED'
  | 'STRUCTURE_BUILT';

export interface ActionSpotlightPayload {
  id: string;
  type: ActionSpotlightType;
  sourceCard: FarelCard | any;
  targetCard?: FarelCard | any | null;
  targetName?: string;
  diceRoll?: {
    value: number;
    modifier: number;
    total: number;
  };
  damageDealt?: number;
  effectDescription?: string;
  title?: string;
}

interface ActionSpotlightProps {
  payload: ActionSpotlightPayload | null;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export const ActionSpotlight: React.FC<ActionSpotlightProps> = ({
  payload,
  onDismiss,
  autoDismissMs = 1500,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [dieDisplayValue, setDieDisplayValue] = useState<number>(1);
  const [showDamageFlash, setShowDamageFlash] = useState(false);

  useEffect(() => {
    if (!payload) {
      setIsAnimating(false);
      setShowDamageFlash(false);
      return;
    }

    setIsAnimating(true);

    // Se for ataque com dado, simula rolagem rápida
    if (payload.type === 'COMBAT_ATTACK' && payload.diceRoll) {
      const finalValue = payload.diceRoll.value;
      let counter = 0;
      const interval = setInterval(() => {
        setDieDisplayValue(Math.floor(Math.random() * 6) + 1);
        counter++;
        if (counter > 6) {
          clearInterval(interval);
          setDieDisplayValue(finalValue);
          setShowDamageFlash(true);
        }
      }, 70);
    } else {
      setShowDamageFlash(true);
    }

    // Auto-dismiss após tempo configurado
    const timer = setTimeout(() => {
      onDismiss();
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, [payload, autoDismissMs, onDismiss]);

  if (!payload) return null;

  const isCombat = payload.type === 'COMBAT_ATTACK';
  const isSpell = payload.type === 'SPELL_CAST';
  const isChannel = payload.type === 'CHANNEL_TRIGGERED';
  const isStructure = payload.type === 'STRUCTURE_BUILT';

  const auraColor = isCombat 
    ? 'rgba(224, 106, 98, 0.45)' 
    : isSpell 
    ? 'rgba(197, 139, 231, 0.55)' 
    : isChannel
    ? 'rgba(96, 199, 141, 0.5)'
    : 'rgba(101, 215, 215, 0.45)';

  const bannerBorder = isCombat
    ? 'border-[#e06a62] text-[#e06a62]'
    : isSpell
    ? 'border-[#c58be7] text-[#c58be7]'
    : isChannel
    ? 'border-[#60c78d] text-[#60c78d]'
    : 'border-[#65d7d7] text-[#65d7d7]';

  return (
    <div 
      onClick={onDismiss}
      className="fixed inset-0 z-50 bg-[#071017]/85 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-pointer animate-fadeIn select-none"
    >
      {/* GLOW DE FUNDO */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full filter blur-[120px] pointer-events-none transition-all duration-700"
        style={{ background: auraColor }}
      />

      {/* BANNER SUPERIOR DA AÇÃO */}
      <div className="relative z-10 flex flex-col items-center gap-1 mb-5 animate-slideDown">
        <div className={`px-4 py-1 rounded-full border bg-[#0d1820]/90 font-mono text-xs uppercase tracking-widest font-black flex items-center gap-2 shadow-lg ${bannerBorder}`}>
          <span>
            {isCombat ? '⚔️ ATAQUE DE COMBATE' 
              : isSpell ? '✨ CONJURAÇÃO DE MAGIA' 
              : isChannel ? '⚡ REAÇÃO CANALIZADA' 
              : '🏛️ ESTRUTURA CONSTRUÍDA'}
          </span>
        </div>
        <p className="text-sm font-serif text-[#ead4aa] tracking-wide text-center">
          {payload.title || (isCombat ? `${payload.sourceCard.name} está atacando!` : payload.sourceCard.name)}
        </p>
      </div>

      {/* ÁREA CENTRAL: CARTA EM DESTAQUE E EFEITOS GRÁFICOS */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-8 max-w-4xl">
        
        {/* CARTA DA AÇÃO EM ESCALA SPOTLIGHT */}
        <div className="relative animate-scaleUp">
          <FarelPlayingCard 
            card={payload.sourceCard} 
            size="spotlight"
            className="shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
          />

          {/* BRILHO RADIAL NA CARTA */}
          <div 
            className="absolute inset-0 rounded-[6px] pointer-events-none ring-2 ring-[#d4af70]/80 shadow-[0_0_35px_rgba(212,175,112,0.4)]"
          />
        </div>

        {/* PAINEL DE RESOLUÇÃO GRÁFICA (DADO / DANO / EFEITO) */}
        {isCombat && payload.diceRoll && (
          <div className="flex flex-col items-center gap-4 bg-[#0d1820]/95 border border-[#bea470]/40 rounded-2xl p-6 shadow-2xl min-w-[260px] max-w-[320px] animate-slideUp">
            
            <span className="font-mono text-xs uppercase tracking-wider text-[#8297a4]">
              Rolagem de Combate (d6)
            </span>

            {/* DADO D6 VISUAL 3D COM ANIMAÇÃO */}
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ead4aa] to-[#76613e] p-1 flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.6)] border-2 border-[#fff6dc]">
              <div className="w-full h-full rounded-xl bg-gradient-to-tr from-[#192b35] to-[#071017] flex items-center justify-center text-4xl font-serif font-black text-[#f4d7a1]">
                {dieDisplayValue}
              </div>
            </div>

            {/* FÓRMULA DE RESOLUÇÃO */}
            <div className="text-center font-mono text-xs text-[#cad5dc]">
              Dado: <strong className="text-[#f4d7a1]">{payload.diceRoll.value}</strong>
              {payload.diceRoll.modifier > 0 && (
                <span> + Mod: <strong className="text-emerald-400">+{payload.diceRoll.modifier}</strong></span>
              )}
            </div>

            {/* BADGE DE DANO IMPACTANTE */}
            {showDamageFlash && payload.damageDealt !== undefined && (
              <div className="flex flex-col items-center gap-1 mt-1 animate-bounce">
                <span className="text-[11px] font-mono text-rose-300 uppercase">Impacto no Alvo:</span>
                <div className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-800 text-white font-serif font-black text-2xl shadow-[0_0_20px_rgba(224,106,98,0.7)] flex items-center gap-2 border border-rose-400">
                  <span>💥</span>
                  <span>-{payload.damageDealt} HP</span>
                </div>
                {payload.targetName && (
                  <span className="text-xs font-serif text-[#cad5dc] mt-1 text-center">
                    sobre <strong>{payload.targetName}</strong>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* EFEITO DE MAGIA OU ESTRUTURA */}
        {!isCombat && (
          <div className="flex flex-col items-center gap-3 bg-[#0d1820]/95 border border-[#bea470]/40 rounded-2xl p-6 shadow-2xl min-w-[260px] max-w-[320px] text-center animate-slideUp">
            <span className="font-mono text-xs uppercase tracking-wider text-[#8297a4]">
              {isSpell ? 'Resolução Imediata' : isChannel ? 'Gatilho Armado' : 'Benefício Territorial'}
            </span>

            <div className="w-16 h-16 rounded-full bg-[#182834] border border-[#d4af70]/60 flex items-center justify-center text-3xl shadow-inner">
              {isSpell ? '⚡' : isChannel ? '🔮' : '🏛️'}
            </div>

            <p className="text-sm font-sans text-[#f2eee5] leading-relaxed">
              {payload.effectDescription || payload.sourceCard.rulesText || 'Efeito ativado com sucesso.'}
            </p>

            <div className="px-3 py-1 rounded bg-[#071017] border border-[#293b46] text-[11px] font-mono text-[#d4af70]">
              Custo: {payload.sourceCard.energyCost ?? 0} Energia
            </div>
          </div>
        )}
      </div>

      {/* DICA DE FECHAMENTO RÁPIDO */}
      <div className="relative z-10 mt-6 text-[11px] font-mono text-[#8297a4] tracking-wider">
        [Clique em qualquer lugar para continuar]
      </div>
    </div>
  );
};
