'use client';

import React from 'react';

export type PhaseType = 'start' | 'action' | 'end';

interface TurnTimelineProps {
  currentPhase: PhaseType;
  onPhaseClick?: (phase: PhaseType) => void;
  interactive?: boolean;
}

export const TurnTimeline: React.FC<TurnTimelineProps> = ({
  currentPhase = 'start',
  onPhaseClick,
  interactive = false,
}) => {
  const phases = [
    { id: 'start' as PhaseType, label: 'Início', desc: 'Comprar carta & Receber energia (5 base + geradores)' },
    { id: 'action' as PhaseType, label: 'Ações', desc: 'Invocar tropas, erguer estruturas & lançar magias' },
    { id: 'end' as PhaseType, label: 'Fim do Turno', desc: 'Resolver ataques com d6 & verificar limite de mão (5)' },
  ];

  return (
    <div
      className="w-full flex flex-col gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-md"
      aria-label={`Linha do tempo do turno. Fase atual: ${currentPhase}`}
    >
      <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800 pb-1">
        <span>Fases do Turno</span>
        <span className="text-amber-300 font-semibold">
          Fase Ativa: {phases.find((p) => p.id === currentPhase)?.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {phases.map((p, index) => {
          const isActive = currentPhase === p.id;
          return (
            <button
              key={p.id}
              disabled={!interactive}
              onClick={() => onPhaseClick && onPhaseClick(p.id)}
              className={`flex flex-col items-center text-center p-2 rounded-lg border transition-all text-xs ${
                isActive
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400/50 scale-[1.02]'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              } ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className="flex items-center gap-1 font-bold">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  {index + 1}
                </span>
                <span>{p.label}</span>
              </div>
              <span className="text-[10px] line-clamp-1 mt-0.5 opacity-80">{p.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
