'use client';

import React, { useState } from 'react';

interface AttackDieProps {
  value: number; // 1 to 6
  modifier?: number;
  isRolling?: boolean;
  onRoll?: () => void;
  label?: string;
  compact?: boolean;
}

export const AttackDie: React.FC<AttackDieProps> = ({
  value = 1,
  modifier = 0,
  isRolling = false,
  onRoll,
  label = 'Combate d6',
  compact = false,
}) => {
  const [internalRolling, setInternalRolling] = useState(false);
  const activeRolling = isRolling || internalRolling;
  const finalDamage = Math.max(0, value + modifier);

  const handleRollClick = () => {
    if (onRoll) {
      setInternalRolling(true);
      setTimeout(() => setInternalRolling(false), 450);
      onRoll();
    }
  };

  const renderDots = (num: number) => {
    switch (num) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-900 shadow-inner" />
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full flex justify-between p-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 self-end" />
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex justify-between p-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 self-center" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 self-end" />
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full grid grid-cols-2 p-1 gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 place-self-start" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 place-self-end" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 place-self-start" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 place-self-end" />
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full grid grid-cols-3 p-1">
            <span className="w-2 h-2 rounded-full bg-slate-900 place-self-start" />
            <span />
            <span className="w-2 h-2 rounded-full bg-slate-900 place-self-end" />
            <span />
            <span className="w-2 h-2 rounded-full bg-slate-900 place-self-center" />
            <span />
            <span className="w-2 h-2 rounded-full bg-slate-900 place-self-start" />
            <span />
            <span className="w-2 h-2 rounded-full bg-slate-900 place-self-end" />
          </div>
        );
      case 6:
      default:
        return (
          <div className="w-full h-full grid grid-cols-2 p-1 gap-0.5">
            <span className="w-2 h-2 rounded-full bg-slate-900 place-self-center" />
            <span className="w-2 h-2 rounded-full bg-slate-900 place-self-center" />
            <span className="w-2 h-2 rounded-full bg-slate-900 place-self-center" />
            <span className="w-2 h-2 rounded-full bg-slate-900 place-self-center" />
            <span className="w-2 h-2 rounded-full bg-slate-900 place-self-center" />
            <span className="w-2 h-2 rounded-full bg-slate-900 place-self-center" />
          </div>
        );
    }
  };

  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/90 border border-slate-700 text-xs font-mono shadow-sm"
        aria-label={`Dado d6: ${value}, modificador: +${modifier}, dano final: ${finalDamage}`}
      >
        <div className={`w-6 h-6 rounded bg-amber-100 border border-amber-300 text-slate-950 font-bold flex items-center justify-center text-xs ${activeRolling ? 'die-rolling' : ''}`}>
          {value}
        </div>
        {modifier > 0 && <span className="text-sky-400 font-bold">+{modifier}</span>}
        <span className="text-slate-400">=</span>
        <span className="text-rose-400 font-bold">{finalDamage} dano</span>
      </div>
    );
  }

  return (
    <div
      className="p-3 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-lg flex flex-col items-center gap-2 max-w-[240px]"
      aria-label={`Rolagem: ${value}. Modificador: mais ${modifier}. Dano final demonstrativo: ${finalDamage}.`}
    >
      <div className="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
        {label}
      </div>

      <div className="flex items-center justify-center gap-3 my-1">
        {/* Die Cube Face */}
        <div
          onClick={handleRollClick}
          className={`w-14 h-14 rounded-xl bg-gradient-to-br from-amber-50 to-amber-200 border-2 border-amber-300 shadow-md flex items-center justify-center cursor-pointer select-none transition-transform active:scale-95 hover:border-amber-400 ${
            activeRolling ? 'die-rolling' : ''
          }`}
          title="Clique para rolar o d6"
          role="button"
          tabIndex={0}
        >
          {renderDots(value)}
        </div>

        {/* Calculation Pill */}
        <div className="flex flex-col gap-1 text-left text-xs font-mono">
          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-slate-400 text-[10px]">d6:</span>
            <span className="font-bold text-amber-300">{value}</span>
          </div>
          {modifier !== 0 && (
            <div className="flex items-center gap-1 text-sky-300">
              <span className="text-slate-400 text-[10px]">Buff:</span>
              <span className="font-bold">+{modifier}</span>
            </div>
          )}
          <div className="pt-1 border-t border-slate-700 flex items-center gap-1 text-rose-300">
            <span className="text-[10px] text-slate-400">Total:</span>
            <span className="font-bold text-sm text-rose-400">{finalDamage} DANO</span>
          </div>
        </div>
      </div>

      {onRoll && (
        <button
          onClick={handleRollClick}
          className="w-full text-[11px] font-semibold py-1 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 transition-colors"
        >
          🎲 Rolar d6 novamente
        </button>
      )}

      <div className="text-[9px] text-slate-400 font-mono text-center">
        * Criaturas e heróis não possuem ataque fixo
      </div>
    </div>
  );
};
