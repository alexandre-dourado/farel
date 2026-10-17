'use client';

import React from 'react';
import { FarelPlayingCard } from './FarelPlayingCard';
import { FarelCard } from '../types/farelCard';

interface CardInspectorProps {
  card: FarelCard | any | null;
  onClose?: () => void;
  // Ações contextuais opcionais
  onCastSpell?: () => void;
  onSummonLane?: (laneIndex: number) => void;
  onBacklineBuild?: (slotIndex: number) => void;
  onAttackLane?: () => void;
  isCardInHand?: boolean;
  isCardOnBoard?: boolean;
  canAfford?: boolean;
  canAttack?: boolean;
  freeLanes?: number[];
}

export const CardInspector: React.FC<CardInspectorProps> = ({
  card,
  onClose,
  onCastSpell,
  onSummonLane,
  onBacklineBuild,
  onAttackLane,
  isCardInHand = false,
  isCardOnBoard = false,
  canAfford = true,
  canAttack = false,
  freeLanes = [],
}) => {
  if (!card) {
    return (
      <div className="bg-[#0d1820]/80 border border-[#bea470]/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center text-[#8297a4] min-h-[380px] shadow-lg">
        <div className="w-14 h-14 rounded-full border border-dashed border-[#bea470]/30 flex items-center justify-center text-2xl mb-3 text-[#d4af70]/60">
          ✧
        </div>
        <h4 className="font-serif text-[#ebd8b5] text-sm mb-1">Inspeção Tática</h4>
        <p className="text-xs max-w-[200px] leading-relaxed">
          Selecione qualquer carta na mão ou no campo para ver seus detalhes e ações em tamanho real.
        </p>
      </div>
    );
  }

  const rawType = (card.type || '').toString().toLowerCase();
  const isCreature = rawType.includes('creature');
  const isStructure = rawType.includes('generator') || rawType.includes('structure');
  const isSpell = rawType.includes('spell') && !rawType.includes('channel');
  const isChannel = rawType.includes('channel');

  return (
    <div className="bg-[#0d1820]/95 border border-[#bea470]/30 rounded-2xl p-4 flex flex-col items-center shadow-2xl relative animate-fadeIn">
      {/* HEADER DO INSPETOR */}
      <div className="w-full flex items-center justify-between border-b border-[#bea470]/20 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[#d4af70] text-xs">✧</span>
          <span className="font-mono text-xs uppercase tracking-wider text-[#d4af70] font-bold">
            Destaque da Carta
          </span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="w-6 h-6 rounded-full border border-slate-700 hover:border-[#d4af70] text-slate-400 hover:text-white flex items-center justify-center text-xs transition"
            title="Fechar destaque"
          >
            ✕
          </button>
        )}
      </div>

      {/* CARTA EM TAMANHO GRANDE (LARGE) */}
      <div className="my-2 flex justify-center">
        <FarelPlayingCard 
          card={card} 
          size="large"
          isSelected={false}
          className="shadow-[0_16px_36px_rgba(0,0,0,0.7)]"
        />
      </div>

      {/* PAINEL DE CONTROLE / AÇÕES RÁPIDAS */}
      <div className="w-full mt-3 flex flex-col gap-2 pt-3 border-t border-[#bea470]/20">
        
        {/* AÇÕES PARA CARTA NA MÃO */}
        {isCardInHand && (
          <>
            {isSpell && onCastSpell && (
              <button
                onClick={onCastSpell}
                disabled={!canAfford}
                className={`w-full py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition ${
                  canAfford 
                    ? 'bg-gradient-to-r from-[#9b51e0] to-[#c58be7] text-white hover:brightness-110' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <span>✨</span>
                <span>Conjurar Feitiço Agora ({card.energyCost}⚡)</span>
              </button>
            )}

            {isCreature && onSummonLane && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-[#d4af70] text-center">
                  Invocar em uma faixa livre:
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {[0, 1, 2, 3, 4].map((laneIdx) => {
                    const isFree = freeLanes.includes(laneIdx);
                    return (
                      <button
                        key={laneIdx}
                        onClick={() => onSummonLane(laneIdx)}
                        disabled={!isFree || !canAfford}
                        className={`py-1.5 rounded-lg font-mono text-[11px] font-bold border transition ${
                          isFree && canAfford
                            ? 'bg-[#182a34] hover:bg-[#d4af70] hover:text-[#071017] border-[#344b57] text-[#dce6e9]'
                            : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                        title={isFree ? `Invocar na Faixa ${laneIdx + 1}` : `Faixa ${laneIdx + 1} ocupada`}
                      >
                        F{laneIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {isStructure && onBacklineBuild && (
              <button
                onClick={() => onBacklineBuild(0)}
                disabled={!canAfford}
                className={`w-full py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition ${
                  canAfford 
                    ? 'bg-gradient-to-r from-[#26807c] to-[#65d7d7] text-slate-950 hover:brightness-110' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <span>🏛️</span>
                <span>Construir no Backline ({card.energyCost}⚡)</span>
              </button>
            )}

            {!canAfford && (
              <span className="text-[10px] font-mono text-rose-400 text-center">
                ⚠️ Energia insuficiente para jogar esta carta.
              </span>
            )}
          </>
        )}

        {/* AÇÕES PARA CARTA NO CAMPO DE BATALHA */}
        {isCardOnBoard && (
          <div className="flex flex-col gap-1.5">
            {canAttack && onAttackLane && (
              <button
                onClick={onAttackLane}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#e06a62] to-[#b34038] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg animate-pulse"
              >
                <span>⚔️</span>
                <span>Declarar Ataque com d6</span>
              </button>
            )}
            
            {card.artDirection && (
              <div className="p-2 rounded-lg bg-[#071017] border border-[#263c47] text-[10px] text-[#8297a4] font-mono">
                <span className="text-[#d4af70] block font-bold mb-0.5">Direção de Arte:</span>
                {card.artDirection}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
