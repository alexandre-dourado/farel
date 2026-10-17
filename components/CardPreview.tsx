'use client';

import React from 'react';
import { FarelCard } from '../types/farelCard';
import { FarelPlayingCard } from './FarelPlayingCard';

interface CardPreviewProps {
  card: FarelCard;
  onClose?: () => void;
}

export const CardPreview: React.FC<CardPreviewProps> = ({ card, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#071017]/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-2xl p-6 bg-[#0d1820] border border-[#bea470]/40 shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col sm:flex-row items-center gap-6 text-[#f2eee5]">
        
        {/* BOTÃO FECHAR */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Fechar prévia da carta"
            className="absolute top-3.5 right-3.5 text-[#8297a4] hover:text-white p-1 rounded-full border border-slate-700 hover:border-[#d4af70] transition-colors z-10 w-7 h-7 flex items-center justify-center"
          >
            ✕
          </button>
        )}

        {/* CARTA RENDERIZADA OFICIAL */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <FarelPlayingCard 
            card={card} 
            size="normal"
            className="shadow-[0_16px_36px_rgba(0,0,0,0.7)]"
          />
        </div>

        {/* DETALHES E METADADOS */}
        <div className="flex-1 flex flex-col gap-3 text-left">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#d4af70] uppercase">
              {card.id} · {card.type}
            </span>
            <h3 className="text-xl font-serif font-bold text-[#ead4aa] mt-0.5">{card.name}</h3>
          </div>

          {/* PALAVRAS-CHAVE */}
          {card.keywords && card.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {card.keywords.map((kw) => (
                <span
                  key={kw}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-[#182a34] text-[#9be1e2] border border-[#293b46] font-mono"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}

          {/* TEXTO DE REGRAS */}
          <div className="p-3 rounded-lg bg-[#071017]/90 border border-[#263c47] text-xs leading-relaxed text-[#cad5dc]">
            <p className="font-sans">{card.rulesText}</p>
            {card.trigger && (
              <div className="mt-2 pt-2 border-t border-[#c58be7]/20 text-[11px] text-[#c58be7]">
                <strong className="text-[#ebd8b5]">Condição de Gatilho:</strong> {card.trigger}
              </div>
            )}
          </div>

          {/* METADADOS RÁPIDOS */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 rounded bg-[#071017]/70 border border-[#263c47]">
              <span className="text-[9px] text-[#8297a4] block uppercase">Custo de Energia</span>
              <strong className="text-[#65d7d7] text-sm">{card.energyCost}⚡</strong>
            </div>
            <div className="p-2 rounded bg-[#071017]/70 border border-[#263c47]">
              <span className="text-[9px] text-[#8297a4] block uppercase">Vida</span>
              <strong className="text-[#e06a62] text-sm">
                {card.life !== null ? `${card.life} ❤️` : 'Não se aplica'}
              </strong>
            </div>
          </div>

          {card.artDirection && (
            <div className="text-[10px] font-mono text-[#8297a4]">
              <strong className="text-[#d4af70]">Direção de arte:</strong> {card.artDirection}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
