'use client';

import React from 'react';

interface HotseatControlsProps {
  currentTurn: number;
  activePlayer: 1 | 2;
  p1Name: string;
  p2Name: string;
  p1Hp: number;
  p2Hp: number;
  p1Energy: number;
  p2Energy: number;
  isFlipped: boolean;
  autoFlipOnTurn: boolean;
  onToggleAutoFlip: () => void;
  onManualFlip: () => void;
  heroIntercept: boolean;
  onToggleHeroIntercept: () => void;
  onEndTurn: () => void;
  onResetGame?: () => void;
  disabled?: boolean;
}

export const HotseatControls: React.FC<HotseatControlsProps> = ({
  currentTurn,
  activePlayer,
  p1Name,
  p2Name,
  p1Hp,
  p2Hp,
  p1Energy,
  p2Energy,
  isFlipped,
  autoFlipOnTurn,
  onToggleAutoFlip,
  onManualFlip,
  heroIntercept,
  onToggleHeroIntercept,
  onEndTurn,
  onResetGame,
  disabled
}) => {
  const activePlayerName = activePlayer === 1 ? p1Name : p2Name;
  const activeHp = activePlayer === 1 ? p1Hp : p2Hp;
  const activeEnergy = activePlayer === 1 ? p1Energy : p2Energy;

  return (
    <header className="w-full bg-[#0d1720]/95 border-b border-[#2a3c48] px-4 py-2 flex items-center justify-between gap-3 text-xs select-none shadow-md z-20">
      {/* 1. Indicador do Jogador Ativo e Turno */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#43d9c4] animate-ping" />
          <span className="font-serif font-bold text-sm tracking-wide text-[#f2eee5]">
            Turno {currentTurn}
          </span>
        </div>

        <div className="h-4 w-px bg-[#2b3e4e]" />

        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
            activePlayer === 1
              ? 'bg-[#1e3445] text-[#9ee3e7] border-[#3f677d]'
              : 'bg-[#402321] text-[#f7b0a8] border-[#7d413b]'
          }`}>
            Jogador {activePlayer}: {activePlayerName}
          </span>

          <span className="text-[#aab6c4] font-mono text-[11px] flex items-center gap-2">
            <span>👑 <strong className="text-[#ffd580]">{activeHp}</strong> PV</span>
            <span>⚡ <strong className="text-[#65d7d7]">{activeEnergy}</strong> Energia</span>
          </span>
        </div>
      </div>

      {/* 2. Controles de Espelhamento Hotseat (Toggle Automático + Botão Manual) */}
      <div className="flex items-center gap-3">
        {/* Toggle Interceptação do Herói */}
        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#ccd9e0] hover:text-[#fff]">
          <input
            type="checkbox"
            checked={heroIntercept}
            onChange={onToggleHeroIntercept}
            className="rounded border-[#3a505f] bg-[#0d1b24] text-[#d4af70] focus:ring-0 cursor-pointer"
          />
          <span title="Permite que o Herói intercepte dano mesmo se houver criaturas ou estruturas">
            🛡️ Interceptar c/ Herói
          </span>
        </label>

        <div className="h-4 w-px bg-[#2b3e4e]" />

        {/* Toggle Automático de Inversão */}
        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#a9c1ce] hover:text-[#f4d7a1] transition-colors">
          <input
            type="checkbox"
            checked={autoFlipOnTurn}
            onChange={onToggleAutoFlip}
            className="rounded border-[#3a505f] bg-[#0d1b24] text-[#d4af70] focus:ring-0 cursor-pointer"
          />
          <span>Auto-Flip 180°</span>
        </label>

        {/* Botão Manual de Rotação 180° */}
        <button
          onClick={onManualFlip}
          type="button"
          title="Girar o tabuleiro 180° manualmente para o outro jogador na mesma tela"
          className={`flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] font-serif transition-all ${
            isFlipped
              ? 'bg-[#2a241b] text-[#f2c66d] border-[#91763a]'
              : 'bg-[#121f28] text-[#cad8df] border-[#2f4654] hover:border-[#d4af70]'
          }`}
        >
          <span>🔄</span>
          <span>180° {isFlipped ? '(P2)' : '(P1)'}</span>
        </button>

        <div className="h-4 w-px bg-[#2b3e4e]" />

        {/* Botão Primário: Encerrar Turno & Batalha */}
        <button
          onClick={onEndTurn}
          disabled={disabled}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-serif font-bold text-xs text-[#0a1217] bg-gradient-to-b from-[#f2d08a] to-[#d4af70] hover:brightness-110 active:scale-95 shadow-[0_0_12px_rgba(212,175,112,0.3)] border border-[#ffe09e] transition-all disabled:opacity-50"
        >
          <span>⚔️</span>
          <span>Encerrar Turno</span>
        </button>

        {onResetGame && (
          <button
            onClick={onResetGame}
            type="button"
            title="Reiniciar a partida"
            className="text-[11px] text-[#718794] hover:text-[#ff8580] transition-colors px-1"
          >
            ✕
          </button>
        )}
      </div>
    </header>
  );
};
