'use client';

import React from 'react';
import { LaneState } from '../../types/board';
import { Structure } from '../../types/entities';
import { FarelPlayingCard } from '../FarelPlayingCard';
import { FarelCard } from '../../types/farelCard';
import { EntityStatus } from '../../types/enums';

interface TacticalBattlefieldGridProps {
  lanes: LaneState[];
  playerStructures: (Structure | null)[];
  opponentStructures: (Structure | null)[];
  selectedCard: FarelCard | any | null;
  selectedSource: 'hand' | 'board' | null;
  selectedLaneIndex: number | null;
  onSelectCard: (card: any, source: 'hand' | 'board', laneIndex?: number) => void;
  onSummonToLane: (laneIndex: number) => void;
  onBuildToSlot: (slotIndex: number) => void;
  onAttackLane: (laneIndex: number) => void;
  isPlayerTurn: boolean;
  playerEnergy: number;
  className?: string;
}

export const TacticalBattlefieldGrid: React.FC<TacticalBattlefieldGridProps> = ({
  lanes,
  playerStructures,
  opponentStructures,
  selectedCard,
  selectedSource,
  selectedLaneIndex,
  onSelectCard,
  onSummonToLane,
  onBuildToSlot,
  onAttackLane,
  isPlayerTurn,
  playerEnergy,
  className = '',
}) => {
  // Determina se a carta na mão é invocável
  const isSelectedCreatureInHand =
    selectedSource === 'hand' &&
    selectedCard &&
    (selectedCard.type?.toLowerCase().includes('creature') || false);

  const isSelectedStructureInHand =
    selectedSource === 'hand' &&
    selectedCard &&
    (selectedCard.type?.toLowerCase().includes('generator') ||
      selectedCard.type?.toLowerCase().includes('structure') ||
      false);

  const cardCost = selectedCard?.energyCost || 0;
  const canAfford = playerEnergy >= cardCost;

  return (
    <div
      className={`relative w-full rounded-2xl bg-gradient-to-b from-[#0a0f14]/95 via-[#0e1720]/95 to-[#080d12]/98 border border-[#3d2f19]/60 shadow-[inset_0_0_60px_rgba(0,0,0,0.85),0_8px_32px_rgba(0,0,0,0.7)] p-4 flex flex-col justify-between overflow-hidden ${className}`}
    >
      {/* RUNAS DE FUNDO E EFEITO DE PERSPECTIVA 2.5D */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(40,65,85,0.15)_0%,rgba(0,0,0,0.85)_100%)]" />
      <div className="absolute top-2 left-6 text-[10px] font-mono tracking-widest text-[#6c5932] uppercase flex items-center gap-2">
        <span>⚔️ ARENA TÁTICA 2.5D</span>
        <span>•</span>
        <span>HEX-RUNIC SYSTEM</span>
      </div>

      {/* CABEÇALHO DAS 6 COLUNAS TÁTICAS COM MARCADORES RÚNICOS */}
      <div className="w-full grid grid-cols-12 gap-2 text-center text-[10px] font-mono uppercase tracking-widest text-[#7f7151] pt-4 pb-2 border-b border-[#3d2f19]/30">
        <div className="col-span-2 text-left pl-2 font-serif font-bold text-[#bfa267]">
          FAIXAS / PROFUNDIDADE
        </div>
        <div className="col-span-3 flex items-center justify-center gap-1 text-[#8bb4c9]">
          <span>✧</span> FAIXA I (ESQUERDA)
        </div>
        <div className="col-span-4 flex items-center justify-center gap-1 text-[#e0ca9b] font-bold">
          <span>⚜</span> FAIXA II (CENTRO)
        </div>
        <div className="col-span-3 flex items-center justify-center gap-1 text-[#8bb4c9]">
          <span>✧</span> FAIXA III (DIREITA)
        </div>
      </div>

      {/* ============================================================== */}
      {/* LINHA 1 (Oponente Retaguarda / Estruturas) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-12 gap-2 items-center py-2 border-b border-[#243340]/30 min-h-[90px]">
        <div className="col-span-2 text-left pl-2 flex flex-col">
          <span className="text-[11px] font-serif font-bold text-rose-300/80">LINHA 1 (Trás)</span>
          <span className="text-[9px] font-mono text-[#6c7885]">Retaguarda Oponente</span>
        </div>

        {/* 3 Slots de Estruturas do Oponente */}
        <div className="col-span-10 grid grid-cols-3 gap-3">
          {[0, 1, 2].map((slotIdx) => {
            const structure = opponentStructures[slotIdx];
            return (
              <div
                key={`opp-struct-${slotIdx}`}
                className="h-20 rounded-xl border border-dashed border-[#442c2c]/60 bg-[#160e12]/60 flex items-center justify-center relative p-1 transition-all"
              >
                {structure ? (
                  <div
                    onClick={() => onSelectCard(structure, 'board')}
                    className="w-full h-full cursor-pointer flex items-center justify-center hover:scale-102 transition-transform"
                  >
                    <FarelPlayingCard card={structure} size="micro" />
                  </div>
                ) : (
                  <span className="text-[10px] font-mono text-[#543b3b]">
                    [Slot Retaguarda {slotIdx + 1}]
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* LINHA 2 (Oponente Frente / Criaturas) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-12 gap-2 items-center py-2.5 border-b border-[#243340]/40 min-h-[120px]">
        <div className="col-span-2 text-left pl-2 flex flex-col">
          <span className="text-[11px] font-serif font-bold text-rose-400">LINHA 2 (Frente)</span>
          <span className="text-[9px] font-mono text-rose-300/60">Linha de Combate Oponente</span>
        </div>

        {/* 3 Faixas de Criaturas do Oponente */}
        <div className="col-span-10 grid grid-cols-3 gap-3">
          {lanes.map((lane, laneIdx) => {
            const oppCreature = lane.p2Creature;
            const isAttackingTarget = selectedSource === 'board' && selectedLaneIndex === laneIdx;

            return (
              <div
                key={`opp-creature-${laneIdx}`}
                className={`h-28 rounded-xl border ${
                  oppCreature
                    ? 'border-[#7a3232] bg-gradient-to-b from-[#241215]/90 to-[#180a0c]/90'
                    : 'border-[#2d1b1f]/50 border-dashed bg-[#140b0d]/40'
                } flex flex-col items-center justify-center relative p-1.5 transition-all shadow-md`}
              >
                {oppCreature ? (
                  <div
                    onClick={() => onSelectCard(oppCreature, 'board', laneIdx)}
                    className="w-full h-full cursor-pointer flex items-center justify-center hover:scale-102 transition-transform"
                  >
                    <FarelPlayingCard
                      card={oppCreature}
                      size="mini"
                      currentHealth={oppCreature.health}
                      attackModifier={oppCreature.attackModifier}
                      badgeText={`HP: ${oppCreature.health}`}
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <span className="text-xs text-[#523337] block">Faixa Vazia</span>
                    <span className="text-[9px] font-mono text-[#78464c]">(Alvo Direto)</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* LINHA 3 (Zona de Confronto / Meio Campo) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-12 gap-2 items-center py-2 my-1 bg-gradient-to-r from-transparent via-[#182633]/30 to-transparent border-y border-[#3d2f19]/30">
        <div className="col-span-2 text-left pl-2 flex flex-col">
          <span className="text-[11px] font-serif font-bold text-[#e0ca9b]">LINHA 3 (Meio)</span>
          <span className="text-[9px] font-mono text-[#8a7a5c]">Zona de Confronto D6</span>
        </div>

        {/* Indicadores de Duelo / Botões de Ataque por Faixa */}
        <div className="col-span-10 grid grid-cols-3 gap-3">
          {lanes.map((lane, laneIdx) => {
            const hasPlayerAttacker = !!lane.p1Creature;
            const isReady = lane.p1Creature?.status === EntityStatus.READY;
            const canAttack = isPlayerTurn && hasPlayerAttacker && isReady;

            return (
              <div
                key={`clash-zone-${laneIdx}`}
                className="h-10 rounded-lg flex items-center justify-center gap-2 border border-[#2b3e4f]/30 bg-[#0c161e]/40 px-2"
              >
                {canAttack ? (
                  <button
                    onClick={() => onAttackLane(laneIdx)}
                    className="w-full h-8 px-2 rounded-md font-sans font-bold text-[11px] uppercase tracking-wider bg-gradient-to-r from-[#991b1b] via-[#dc2626] to-[#b91c1c] text-white hover:from-red-600 hover:to-rose-600 border border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all flex items-center justify-center gap-1.5 animate-pulse"
                  >
                    <span>⚔️</span> Atacar Faixa {laneIdx + 1}
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#5b7385]">
                    <span>⇅</span>
                    <span>{hasPlayerAttacker && !isReady ? 'Exausto' : 'Neutro'}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* LINHA 4 (Jogador Frente / Criaturas) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-12 gap-2 items-center py-2.5 border-b border-[#243340]/40 min-h-[120px]">
        <div className="col-span-2 text-left pl-2 flex flex-col">
          <span className="text-[11px] font-serif font-bold text-cyan-300">LINHA 4 (Frente)</span>
          <span className="text-[9px] font-mono text-cyan-200/60">Sua Linha de Combate</span>
        </div>

        {/* 3 Faixas de Criaturas do Jogador */}
        <div className="col-span-10 grid grid-cols-3 gap-3">
          {lanes.map((lane, laneIdx) => {
            const myCreature = lane.p1Creature;
            const isReady = myCreature?.status === EntityStatus.READY;
            const isExhausted = myCreature?.status === EntityStatus.EXHAUSTED;
            const isSelected = selectedSource === 'board' && selectedLaneIndex === laneIdx;

            // Se o jogador selecionou uma criatura da mão, este slot é invocável
            const canSummonHere = isSelectedCreatureInHand && !myCreature && canAfford;

            return (
              <div
                key={`player-creature-${laneIdx}`}
                onClick={() => {
                  if (canSummonHere) {
                    onSummonToLane(laneIdx);
                  } else if (myCreature) {
                    onSelectCard(myCreature, 'board', laneIdx);
                  }
                }}
                className={`h-28 rounded-xl border ${
                  canSummonHere
                    ? 'border-emerald-400 bg-emerald-950/40 cursor-pointer shadow-[0_0_16px_rgba(52,211,153,0.4)] animate-pulse'
                    : myCreature
                    ? isSelected
                      ? 'border-[#ffd875] bg-[#12222d] shadow-[0_0_16px_rgba(255,216,117,0.3)]'
                      : 'border-[#2d526e] bg-gradient-to-b from-[#10202b]/90 to-[#0a151d]/90'
                    : 'border-[#1b2b38]/60 border-dashed bg-[#091118]/50'
                } flex flex-col items-center justify-center relative p-1.5 transition-all shadow-md`}
              >
                {myCreature ? (
                  <div className="w-full h-full flex items-center justify-center cursor-pointer hover:scale-102 transition-transform">
                    <FarelPlayingCard
                      card={myCreature}
                      size="mini"
                      isReady={isReady}
                      isExhausted={isExhausted}
                      isSelected={isSelected}
                      currentHealth={myCreature.health}
                      attackModifier={myCreature.attackModifier}
                      badgeText={isReady ? 'PRONTO' : 'EXAUSTO'}
                    />
                  </div>
                ) : canSummonHere ? (
                  <div className="text-center p-2">
                    <span className="text-emerald-300 font-bold text-xs block">✨ Invocar Aqui</span>
                    <span className="text-[9px] font-mono text-emerald-200">
                      Faixa {laneIdx + 1} ({cardCost} Energia)
                    </span>
                  </div>
                ) : (
                  <div className="text-center">
                    <span className="text-xs text-[#3b556b] block">Vazio</span>
                    <span className="text-[9px] font-mono text-[#2c4254]">Faixa {laneIdx + 1}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* LINHA 5 (Jogador Retaguarda / Estruturas) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-12 gap-2 items-center py-2 min-h-[90px]">
        <div className="col-span-2 text-left pl-2 flex flex-col">
          <span className="text-[11px] font-serif font-bold text-cyan-200/80">LINHA 5 (Trás)</span>
          <span className="text-[9px] font-mono text-[#6c7885]">Sua Retaguarda</span>
        </div>

        {/* 3 Slots de Estruturas do Jogador */}
        <div className="col-span-10 grid grid-cols-3 gap-3">
          {[0, 1, 2].map((slotIdx) => {
            const structure = playerStructures[slotIdx];
            const canBuildHere = isSelectedStructureInHand && !structure && canAfford;

            return (
              <div
                key={`player-struct-${slotIdx}`}
                onClick={() => {
                  if (canBuildHere) {
                    onBuildToSlot(slotIdx);
                  } else if (structure) {
                    onSelectCard(structure, 'board');
                  }
                }}
                className={`h-20 rounded-xl border ${
                  canBuildHere
                    ? 'border-cyan-400 bg-cyan-950/40 cursor-pointer shadow-[0_0_16px_rgba(34,211,238,0.4)] animate-pulse'
                    : structure
                    ? 'border-[#2d526e] bg-[#0c1822]'
                    : 'border-dashed border-[#1e3447]/60 bg-[#081017]/60'
                } flex items-center justify-center relative p-1 transition-all`}
              >
                {structure ? (
                  <div className="w-full h-full cursor-pointer flex items-center justify-center hover:scale-102 transition-transform">
                    <FarelPlayingCard card={structure} size="micro" />
                  </div>
                ) : canBuildHere ? (
                  <span className="text-cyan-300 font-bold text-[10px] text-center">
                    🏗️ Construir Estrutura ({cardCost}⚡)
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-[#385368]">
                    [Slot Retaguarda {slotIdx + 1}]
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
