'use client';

import React from 'react';
import { HeroAvatarCard } from './HeroAvatarCard';
import { EnergyGemsTracker } from './EnergyGemsTracker';

interface OpponentZoneV3Props {
  hero: any;
  energy: number;
  maxEnergy?: number;
  handCount?: number;
  deckCount?: number;
  graveyardCount?: number;
  isActiveTurn?: boolean;
  className?: string;
}

export const OpponentZoneV3: React.FC<OpponentZoneV3Props> = ({
  hero,
  energy,
  maxEnergy = 5,
  handCount = 5,
  deckCount = 32,
  graveyardCount = 3,
  isActiveTurn = false,
  className = '',
}) => {
  return (
    <div
      className={`w-full flex items-center justify-between px-6 py-2.5 bg-gradient-to-b from-[#06090c] via-[#0a0f15]/95 to-transparent border-b border-[#3a2c16]/30 shadow-md ${className}`}
    >
      {/* HERÓI DO OPONENTE */}
      <HeroAvatarCard
        isPlayer={false}
        name={hero?.name || 'Imperatriz das Eras'}
        title="Oponente - Imperatriz das Eras"
        health={hero?.health ?? 30}
        maxHealth={hero?.maxHealth ?? 30}
        armor={hero?.armor ?? 0}
        isActiveTurn={isActiveTurn}
        avatarUrl="/assets/farel/art/cards/HERO-002.webp"
      />

      {/* MÃO DE CARTAS DO OPONENTE (VIRADAS PARA BAIXO) */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b0e13]/70 border border-[#212d3b]/40">
        <span className="text-[10px] font-mono text-[#8fa7bd] uppercase tracking-wider mr-1">
          Mão Oponente ({handCount})
        </span>
        {Array.from({ length: Math.min(handCount, 6) }).map((_, i) => (
          <div
            key={i}
            className="w-7 h-10 rounded-sm bg-[#111923] border border-[#d4af37]/40 shadow-sm flex items-center justify-center -ml-2 first:ml-0"
            title="Carta oculta na mão do oponente"
          >
            <span className="text-[10px] text-[#d4af37]/60">✧</span>
          </div>
        ))}
      </div>

      {/* ENERGIA E DECKS DO OPONENTE */}
      <div className="flex items-center gap-4">
        <EnergyGemsTracker
          currentEnergy={energy}
          maxEnergy={maxEnergy}
          label="Energia Oponente"
        />

        <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-[#8fa7bd]">
          <span title="Deck do oponente">📚 {deckCount}</span>
          <span title="Descarte do oponente">☠ {graveyardCount}</span>
        </div>
      </div>
    </div>
  );
};
