'use client';

import React, { useState } from 'react';
import { PlayerField, PlayerFieldState } from './PlayerField';
import { CombatArrow } from './CombatArrow';
import { AttackDie } from './AttackDie';
import { CardPreview } from './CardPreview';
import { FarelCard } from '../types/farelCard';

export interface ActiveCombatState {
  laneNumber: number;
  attackerName?: string;
  targetType: 'creature' | 'structure' | 'hero';
  targetName?: string;
  isHeroIntercepting?: boolean;
  damageValue?: number;
  diceRoll?: number;
  modifier?: number;
}

interface BattlefieldBoardProps {
  playerState: PlayerFieldState;
  opponentState: PlayerFieldState;
  highlightFilter?: string[];
  activeCombat?: ActiveCombatState | null;
  onSlotClick?: (player: 'player' | 'opponent', family: 'hero' | 'creature' | 'structure' | 'channel', index: number) => void;
  onDieRoll?: () => void;
}

export const BattlefieldBoard: React.FC<BattlefieldBoardProps> = ({
  playerState,
  opponentState,
  highlightFilter = [],
  activeCombat = null,
  onSlotClick,
  onDieRoll,
}) => {
  const [inspectedCard, setInspectedCard] = useState<FarelCard | null>(null);

  return (
    <div className="w-full flex flex-col gap-3 max-w-5xl mx-auto relative select-none">
      {/* Opponent Field */}
      <PlayerField
        state={opponentState}
        highlightFilter={highlightFilter}
        onCardClick={(card) => setInspectedCard(card)}
        onSlotClick={(family, idx) => onSlotClick && onSlotClick('opponent', family, idx)}
      />

      {/* Center Combat Divider & 5 Lanes */}
      <div className="my-1 p-2 rounded-xl bg-slate-950/80 border border-slate-800 shadow-inner flex flex-col gap-2">
        <div className="flex items-center justify-between px-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
          <span>Faixas de Combate (Alinhamento Frontal 1 a 5)</span>
          <span className="text-amber-400 font-semibold">Prioridade: Criatura ➔ Estrutura ➔ Herói</span>
        </div>

        {/* 5 Lane Indicator Pills */}
        <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono">
          {[1, 2, 3, 4, 5].map((lane) => {
            const isLaneActive = activeCombat?.laneNumber === lane;
            const isHighlighted = highlightFilter.includes(`combat-lane-${lane}`) || highlightFilter.includes('board');
            return (
              <div
                key={lane}
                className={`py-1 rounded-lg border flex items-center justify-center gap-1 transition-all ${
                  isLaneActive
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold shadow-md shadow-rose-950/50'
                    : isHighlighted
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                }`}
              >
                <span>Faixa {lane}</span>
                <span className="text-[10px] opacity-70">⇅</span>
              </div>
            );
          })}
        </div>

        {/* Active Combat Arrow & Attack Die if active */}
        {activeCombat && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-lg bg-rose-950/30 border border-rose-500/30 animate-fadeIn">
            <div className="flex-1 min-w-[280px]">
              <CombatArrow
                laneNumber={activeCombat.laneNumber}
                targetType={activeCombat.targetType}
                isHeroIntercepting={activeCombat.isHeroIntercepting}
                damageValue={activeCombat.damageValue}
                attackerName={activeCombat.attackerName}
                targetName={activeCombat.targetName}
              />
            </div>
            {activeCombat.diceRoll !== undefined && (
              <AttackDie
                value={activeCombat.diceRoll}
                modifier={activeCombat.modifier || 0}
                onRoll={onDieRoll}
                compact={false}
              />
            )}
          </div>
        )}
      </div>

      {/* Player Field */}
      <PlayerField
        state={playerState}
        highlightFilter={highlightFilter}
        onCardClick={(card) => setInspectedCard(card)}
        onSlotClick={(family, idx) => onSlotClick && onSlotClick('player', family, idx)}
      />

      {/* Card Inspector Modal */}
      {inspectedCard && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setInspectedCard(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <CardPreview card={inspectedCard} onClose={() => setInspectedCard(null)} />
          </div>
        </div>
      )}
    </div>
  );
};
