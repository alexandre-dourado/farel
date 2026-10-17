'use client';

import React from 'react';

interface TurnActionButtonProps {
  isPlayerTurn: boolean;
  onEndTurn: () => void;
  isLoading?: boolean;
  className?: string;
}

export const TurnActionButton: React.FC<TurnActionButtonProps> = ({
  isPlayerTurn,
  onEndTurn,
  isLoading = false,
  className = '',
}) => {
  return (
    <button
      onClick={onEndTurn}
      disabled={!isPlayerTurn || isLoading}
      className={`relative group px-6 py-3.5 rounded-2xl font-serif font-black text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2.5 shadow-xl ${
        isPlayerTurn
          ? 'bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa8022] text-[#1a1205] border-2 border-[#fff2b2] shadow-[0_0_25px_rgba(212,175,55,0.45)] hover:scale-105 active:scale-95 cursor-pointer animate-pulse'
          : 'bg-[#18181b] text-neutral-500 border border-neutral-800 cursor-not-allowed opacity-60'
      } ${className}`}
    >
      {/* ÍCONE DE AMPULHETA DOURADA */}
      <span className="text-lg filter drop-shadow">⏳</span>
      <span>{isPlayerTurn ? 'Finalizar Turno' : 'Turno Oponente'}</span>

      {/* DETALHE CHANFRADO DOURADO */}
      {isPlayerTurn && (
        <span className="absolute inset-0 rounded-2xl border border-white/40 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
};
