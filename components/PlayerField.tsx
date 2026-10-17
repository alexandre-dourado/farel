'use client';

import React from 'react';
import { BoardSlot } from './BoardSlot';
import { HealthMeter } from './HealthMeter';
import { EnergyMeter } from './EnergyMeter';
import { FarelCard } from '../types/farelCard';

export interface SlotData {
  card: FarelCard | null;
  currentLife?: number;
  maxLife?: number;
  newlySummoned?: boolean;
  canAttack?: boolean;
  isChanneling?: boolean;
  isTriggering?: boolean;
  isDamaged?: boolean;
  isTargeted?: boolean;
  isHighlighted?: boolean;
  isDimmed?: boolean;
}

export interface PlayerFieldState {
  playerId: string;
  playerName: string;
  isOpponent: boolean;
  hero: SlotData;
  creatures: (SlotData | null)[]; // 5 slots
  structures: (SlotData | null)[]; // 5 slots
  channels: (SlotData | null)[]; // 3 slots
  baseEnergy: number;
  structureIncome: number;
  availableEnergy: number;
}

interface PlayerFieldProps {
  state: PlayerFieldState;
  highlightFilter?: string[];
  onCardClick?: (card: FarelCard) => void;
  onSlotClick?: (family: 'hero' | 'creature' | 'structure' | 'channel', index: number) => void;
}

export const PlayerField: React.FC<PlayerFieldProps> = ({
  state,
  highlightFilter = [],
  onCardClick,
  onSlotClick,
}) => {
  const isMatch = (target: string) => {
    if (highlightFilter.includes('board')) return true;
    if (state.isOpponent && highlightFilter.some((h) => h.startsWith('opponent'))) {
      return highlightFilter.includes(target);
    }
    if (!state.isOpponent && highlightFilter.some((h) => h.startsWith('player'))) {
      return highlightFilter.includes(target);
    }
    return highlightFilter.includes(target);
  };

  const prefix = state.isOpponent ? 'opponent' : 'player';

  const renderStatus = () => (
    <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-md">
      {/* Hero Slot & Health */}
      <div className="flex items-center gap-3">
        <div className="w-20">
          <BoardSlot
            id={`${prefix}-hero`}
            family="hero"
            label="HERÓI"
            card={state.hero.card}
            currentLife={state.hero.currentLife}
            maxLife={state.hero.maxLife}
            isHighlighted={isMatch(`${prefix}-hero`)}
            isTargeted={state.hero.isTargeted}
            isDamaged={state.hero.isDamaged}
            isLethal={(state.hero.currentLife || 0) <= 0}
            onCardClick={onCardClick}
            onClick={() => onSlotClick && onSlotClick('hero', 0)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-100">{state.playerName}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${state.isOpponent ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'}`}>
              {state.isOpponent ? 'OPONENTE' : 'VOCÊ'}
            </span>
          </div>
          <HealthMeter
            current={state.hero.currentLife || 0}
            max={state.hero.maxLife || 12}
            isHero={true}
            label="Elo Mortal"
          />
        </div>
      </div>

      {/* Energy Meter */}
      <EnergyMeter
        current={state.availableEnergy}
        baseEnergy={state.baseEnergy}
        structureIncome={state.structureIncome}
      />
    </div>
  );

  const renderChannels = () => (
    <div className="flex flex-col gap-1">
      <div className="text-[10px] font-mono tracking-wider text-purple-400 uppercase flex items-center justify-between">
        <span>Magias Canalizadas (3 slots)</span>
        <span className="text-slate-500 text-[9px]">Aguardam condição de ativação</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {state.channels.map((ch, idx) => {
          const slotKey = `${prefix}-channel-slot-${idx + 1}`;
          const isHighlight = isMatch(`${prefix}-channels`) || isMatch(slotKey);
          return (
            <BoardSlot
              key={slotKey}
              id={slotKey}
              family="channel"
              slotIndex={idx + 1}
              label={`CANAL ${idx + 1}`}
              card={ch?.card}
              isChanneling={ch?.isChanneling ?? Boolean(ch?.card)}
              isTriggering={ch?.isTriggering}
              isHighlighted={isHighlight}
              onCardClick={onCardClick}
              onClick={() => onSlotClick && onSlotClick('channel', idx)}
            />
          );
        })}
      </div>
    </div>
  );

  const renderStructures = () => (
    <div className="flex flex-col gap-1">
      <div className="text-[10px] font-mono tracking-wider text-emerald-400 uppercase flex items-center justify-between">
        <span>Estruturas Geradoras (5 faixas)</span>
        <span className="text-slate-500 text-[9px]">Linha de Suporte • Possuem Vida</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {state.structures.map((st, idx) => {
          const slotKey = `${prefix}-structure-slot-${idx + 1}`;
          const isHighlight = isMatch(`${prefix}-structures`) || isMatch(slotKey);
          return (
            <BoardSlot
              key={slotKey}
              id={slotKey}
              family="structure"
              slotIndex={idx + 1}
              label={`ESTR ${idx + 1}`}
              card={st?.card}
              currentLife={st?.currentLife}
              maxLife={st?.maxLife}
              isHighlighted={isHighlight}
              isTargeted={st?.isTargeted}
              isDamaged={st?.isDamaged}
              onCardClick={onCardClick}
              onClick={() => onSlotClick && onSlotClick('structure', idx)}
            />
          );
        })}
      </div>
    </div>
  );

  const renderCreatures = () => (
    <div className="flex flex-col gap-1">
      <div className="text-[10px] font-mono tracking-wider text-sky-400 uppercase flex items-center justify-between">
        <span>Criaturas em Combate (5 faixas)</span>
        <span className="text-slate-500 text-[9px]">Linha de Frente • Dano d6</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {state.creatures.map((cr, idx) => {
          const slotKey = `${prefix}-creature-slot-${idx + 1}`;
          const isHighlight = isMatch(`${prefix}-creatures`) || isMatch(slotKey);
          return (
            <BoardSlot
              key={slotKey}
              id={slotKey}
              family="creature"
              slotIndex={idx + 1}
              label={`CRIATURA ${idx + 1}`}
              card={cr?.card}
              currentLife={cr?.currentLife}
              maxLife={cr?.maxLife}
              isNewlySummoned={cr?.newlySummoned}
              canAttack={cr?.canAttack}
              isHighlighted={isHighlight}
              isTargeted={cr?.isTargeted}
              isDamaged={cr?.isDamaged}
              onCardClick={onCardClick}
              onClick={() => onSlotClick && onSlotClick('creature', idx)}
            />
          );
        })}
      </div>
    </div>
  );

  // If opponent: Top to bottom: status -> channels -> structures -> creatures (facing center)
  // If player: Top to bottom: creatures (facing center) -> structures -> channels -> status
  return (
    <div className="flex flex-col gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl">
      {state.isOpponent ? (
        <>
          {renderStatus()}
          {renderChannels()}
          {renderStructures()}
          {renderCreatures()}
        </>
      ) : (
        <>
          {renderCreatures()}
          {renderStructures()}
          {renderChannels()}
          {renderStatus()}
        </>
      )}
    </div>
  );
};
