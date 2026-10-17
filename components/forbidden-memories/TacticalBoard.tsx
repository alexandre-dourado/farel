'use client';

import React from 'react';
import { FarelCard } from '../../types/farelCard';
import { LifeOrb } from './LifeOrb';
import { EnergyOrb } from './EnergyOrb';
import { FloatingCombatText, CombatFloatingItem } from './FloatingCombatText';

export interface BoardSlotData {
  id: string;
  lane: number; // 0 to 4 (Lanes 1 to 5)
  type: 'creature' | 'structure' | 'channel' | 'hero';
  card: FarelCard | null;
  currentLife?: number;
  maxLife?: number;
  exhausted?: boolean;
}

interface TacticalBoardProps {
  isFlipped: boolean;
  selectedCardId: string | null;
  onHoverCard: (card: FarelCard | null) => void;
  onClickSlot: (lane: number, type: 'creature' | 'structure' | 'channel') => void;
  // Opponent (Player 2)
  p2Hero: FarelCard;
  p2HeroHp: number;
  p2Energy: number;
  p2IsDamaged?: boolean;
  p2Creatures: (BoardSlotData)[];
  p2Structures: (BoardSlotData)[];
  p2Channels: (BoardSlotData)[];
  // Player 1
  p1Hero: FarelCard;
  p1HeroHp: number;
  p1Energy: number;
  p1IsDamaged?: boolean;
  p1Creatures: (BoardSlotData)[];
  p1Structures: (BoardSlotData)[];
  p1Channels: (BoardSlotData)[];
  activePlayer: 1 | 2;
  lastCombatLanes?: number[];
  floatingItems?: CombatFloatingItem[];
}

export const TacticalBoard: React.FC<TacticalBoardProps> = ({
  isFlipped,
  selectedCardId,
  onHoverCard,
  onClickSlot,
  p2Hero,
  p2HeroHp,
  p2Energy,
  p2IsDamaged = false,
  p2Creatures,
  p2Structures,
  p2Channels,
  p1Hero,
  p1HeroHp,
  p1Energy,
  p1IsDamaged = false,
  p1Creatures,
  p1Structures,
  p1Channels,
  activePlayer,
  lastCombatLanes = [],
  floatingItems = []
}) => {
  const getIllustration = (card: FarelCard) => {
    if (card.artUrl) return card.artUrl;
    return `/assets/farel/illustrations/${card.id}.webp`;
  };

  const getFrameUrl = (type: string) => {
    switch (type) {
      case 'creature': return '/assets/farel/cards/template-creature.webp';
      case 'structure':
      case 'generator': return '/assets/farel/cards/template-structure.webp';
      case 'channel':
      case 'channelled_spell': return '/assets/farel/cards/template-spell-channel.webp';
      default: return '/assets/farel/cards/template-creature.webp';
    }
  };

  const renderCardSlot = (
    slot: BoardSlotData,
    isOpponent: boolean,
    slotType: 'creature' | 'structure'
  ) => {
    const card = slot.card;
    const isOwner = (activePlayer === 1 && !isOpponent) || (activePlayer === 2 && isOpponent);
    const canSummonHere = isOwner && !card && selectedCardId !== null;

    return (
      <div
        key={slot.id}
        onClick={() => onClickSlot(slot.lane, slotType)}
        onMouseEnter={() => card && onHoverCard(card)}
        className={`relative flex-1 max-w-[135px] h-[92px] rounded-lg border transition-all duration-200 flex flex-col justify-between p-1 cursor-pointer overflow-hidden group ${
          card
            ? slotType === 'creature'
              ? 'bg-[#150a0a] border-[#8c2d25] shadow-[0_4px_14px_rgba(140,45,37,0.35)] hover:border-[#ff6f61] hover:-translate-y-0.5'
              : 'bg-[#0a171d] border-[#256070] shadow-[0_4px_14px_rgba(37,96,112,0.35)] hover:border-[#4ec0db] hover:-translate-y-0.5'
            : canSummonHere
            ? 'bg-[#14261f]/80 border-2 border-[#43d9c4] border-dashed shadow-[0_0_15px_rgba(67,217,196,0.4)] animate-pulse'
            : 'bg-[#091218]/90 border border-[#1b2b36] hover:border-[#385366]'
        }`}
      >
        {card ? (
          <div className="card-counter-rotate w-full h-full flex flex-col justify-between relative">
            {/* Imagem de Fundo da Moldura Transparente */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 pointer-events-none rounded"
              style={{ backgroundImage: `url('${getFrameUrl(slotType)}')` }}
            />

            {/* Topo: Custo de Energia e Arte Ilustrada */}
            <div className="flex items-center justify-between z-10">
              <span className="w-4 h-4 rounded-full bg-[#1b2b36] border border-[#d4af70] text-[#ffd580] flex items-center justify-center font-serif font-black text-[9px] shadow">
                {card.energyCost}
              </span>

              {/* Mini-Orbe de Sangue Líquido */}
              {slot.currentLife !== undefined && (
                <div className="scale-75 origin-top-right">
                  <LifeOrb
                    currentHp={slot.currentLife}
                    maxHp={slot.maxLife ?? (card.life ?? 4)}
                    size="sm"
                    showMax={false}
                  />
                </div>
              )}
            </div>

            {/* Janela Central com a Ilustração Épica Recortada */}
            <div className="w-full h-[46px] rounded overflow-hidden relative border border-[#ffffff]/10 bg-[#070e13]">
              <img
                src={getIllustration(card)}
                alt={card.name}
                className="w-full h-full object-cover object-top filter contrast-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/farel/art/creature.webp';
                }}
              />
            </div>

            {/* Nome da Carta na Base */}
            <div className="text-[9.5px] font-serif font-bold text-[#f7e6ca] truncate text-center z-10 drop-shadow-[0_1px_2px_#000]">
              {card.name}
            </div>
          </div>
        ) : (
          <div className="card-counter-rotate w-full h-full flex flex-col items-center justify-center text-[#2b4152] font-mono">
            {canSummonHere ? (
              <span className="text-[#43d9c4] font-bold animate-bounce text-[9px]">+ INVOCAR</span>
            ) : (
              <>
                <span className="text-[9px] opacity-40">Faixa {slot.lane + 1}</span>
                <span className="text-[8px] opacity-25 uppercase tracking-wider">
                  {slotType === 'creature' ? 'Criatura' : 'Estrutura'}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 h-full flex flex-col justify-between p-2 relative overflow-hidden">
      {/* Camada de Números e Textos de Dano Flutuantes */}
      <FloatingCombatText items={floatingItems} />

      {/* Tabuleiro Tático 2.5D com Inversão 180° */}
      <div
        className={`hotseat-board w-full h-full flex flex-col justify-between max-w-[1020px] mx-auto ${
          isFlipped ? 'hotseat-flipped' : ''
        }`}
      >
        {/* ============================================================== */}
        {/* PARTE SUPERIOR: OPONENTE (P2)                                  */}
        {/* ============================================================== */}
        <div className="flex flex-col gap-1 p-2 rounded-xl bg-[#091117]/95 border border-[#1d2f3d] shadow-2xl relative">
          {/* Santuário do Herói Oponente: Herói + Orbe Sangue + Orbe Mana + 3 Receptáculos */}
          <div className="flex items-center justify-between gap-3 px-1 py-0.5 border-b border-[#1f313d] pb-1.5">
            {/* Bloco Herói com Orbe de Sangue e Mana Integrados */}
            <div
              onMouseEnter={() => onHoverCard(p2Hero)}
              className="flex items-center gap-3 bg-gradient-to-r from-[#2c1311] via-[#1a141c] to-[#0c161e] border-2 border-[#d98275] rounded-xl px-3 py-1 cursor-pointer shadow-[0_0_15px_rgba(217,130,117,0.25)] hover:border-[#ff9b8e]"
            >
              <div className="card-counter-rotate flex items-center gap-3">
                {/* Avatar Miniatura do Herói */}
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#d98275] shadow">
                  <img
                    src={getIllustration(p2Hero)}
                    alt={p2Hero.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">👑</span>
                    <span className="text-xs font-serif font-black text-[#fce4dc] tracking-tight">
                      {p2Hero.name}
                    </span>
                  </div>
                  <span className="text-[9px] text-[#b8736c] font-mono font-bold uppercase tracking-widest">
                    HERÓI OPONENTE
                  </span>
                </div>

                {/* Orbe de Sangue Líquido do Herói Inimigo */}
                <div className="ml-2">
                  <LifeOrb
                    currentHp={p2HeroHp}
                    maxHp={14}
                    isDamaged={p2IsDamaged}
                    size="md"
                    showMax={true}
                  />
                </div>

                {/* Orbe de Mana do Herói Inimigo */}
                <div className="ml-1">
                  <EnergyOrb currentEnergy={p2Energy} maxEnergy={10} size="md" />
                </div>
              </div>
            </div>

            {/* 3 Receptáculos Compactos de Magia Canalizada */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-[#6ba880] uppercase tracking-wider font-bold">
                Canais:
              </span>
              <div className="flex gap-1.5">
                {p2Channels.map((slot) => {
                  const card = slot.card;
                  return (
                    <div
                      key={slot.id}
                      onClick={() => onClickSlot(slot.lane, 'channel')}
                      onMouseEnter={() => card && onHoverCard(card)}
                      className={`w-11 h-11 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                        card
                          ? 'bg-[#181124] border-[#af67e3] shadow-[0_0_8px_rgba(175,103,227,0.4)]'
                          : 'bg-[#0a141b] border-[#223947] hover:border-[#43d9c4]'
                      }`}
                      title={card ? card.name : `Slot de Canalização ${slot.lane + 1}`}
                    >
                      <div className="card-counter-rotate text-[10px] font-bold">
                        {card ? '⏳' : <span className="opacity-30 text-[9px]">{slot.lane + 1}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5 Slots de Estruturas Geradoras (Cards Verticais) */}
          <div className="flex justify-between gap-2 mt-1">
            {p2Structures.map((slot) => renderCardSlot(slot, true, 'structure'))}
          </div>

          {/* 5 Slots de Criaturas Táticas (Cards Verticais) */}
          <div className="flex justify-between gap-2 mt-1">
            {p2Creatures.map((slot) => renderCardSlot(slot, true, 'creature'))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* FAIXA CENTRAL DE COMBATE (ALINHADA DIRETAMENTE COM AS 5 CASAS) */}
        {/* ============================================================== */}
        <div className="my-1 py-1 px-3 bg-[#0a151d]/95 rounded-lg border border-[#2b4150] flex items-center justify-between text-xs font-mono shadow-inner z-10">
          <span className="text-[10px] uppercase tracking-widest text-[#d4af70] font-bold flex items-center gap-1">
            <span>⚔️</span> FAIXAS:
          </span>

          <div className="flex-1 grid grid-cols-5 gap-2 text-center mx-3">
            {[1, 2, 3, 4, 5].map((laneNum) => {
              const isEngaged = lastCombatLanes.includes(laneNum - 1);
              return (
                <div
                  key={laneNum}
                  className={`card-counter-rotate py-0.5 rounded flex items-center justify-center gap-1.5 text-[10px] font-bold transition-all ${
                    isEngaged
                      ? 'bg-[#6b1e16] text-[#ffd6d1] border-2 border-[#ff7063] shadow-[0_0_12px_#ff4538] animate-pulse'
                      : 'bg-[#101e29] text-[#7ea1b5] border border-[#1e3444]'
                  }`}
                >
                  <span>Faixa {laneNum}</span>
                  <span className={isEngaged ? 'text-[#ffd580] animate-ping' : 'text-[#43d9c4]'}>
                    ➔
                  </span>
                </div>
              );
            })}
          </div>

          <span className="text-[9px] text-[#6e8999] hidden sm:inline">
            Hierarquia: Criatura ➔ Estrutura ➔ Herói
          </span>
        </div>

        {/* ============================================================== */}
        {/* PARTE INFERIOR: JOGADOR ATIVO (P1)                             */}
        {/* ============================================================== */}
        <div className="flex flex-col gap-1 p-2 rounded-xl bg-[#091117]/95 border border-[#1d2f3d] shadow-2xl relative">
          {/* 5 Slots de Criaturas Táticas (Cards Verticais) */}
          <div className="flex justify-between gap-2">
            {p1Creatures.map((slot) => renderCardSlot(slot, false, 'creature'))}
          </div>

          {/* 5 Slots de Estruturas Geradoras (Cards Verticais) */}
          <div className="flex justify-between gap-2 mt-1">
            {p1Structures.map((slot) => renderCardSlot(slot, false, 'structure'))}
          </div>

          {/* Santuário do Herói Jogador: Herói + Orbe Sangue + Orbe Mana + 3 Receptáculos */}
          <div className="flex items-center justify-between gap-3 px-1 py-0.5 border-t border-[#1f313d] pt-1.5 mt-1">
            {/* Bloco Herói com Orbe de Sangue e Mana Integrados */}
            <div
              onMouseEnter={() => onHoverCard(p1Hero)}
              className="flex items-center gap-3 bg-gradient-to-r from-[#112415] via-[#101c17] to-[#0c161e] border-2 border-[#6fc480] rounded-xl px-3 py-1 cursor-pointer shadow-[0_0_15px_rgba(111,196,128,0.25)] hover:border-[#8ef5a2]"
            >
              <div className="card-counter-rotate flex items-center gap-3">
                {/* Avatar Miniatura do Herói */}
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#6fc480] shadow">
                  <img
                    src={getIllustration(p1Hero)}
                    alt={p1Hero.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">👑</span>
                    <span className="text-xs font-serif font-black text-[#e8f7ec] tracking-tight">
                      {p1Hero.name}
                    </span>
                  </div>
                  <span className="text-[9px] text-[#5cb86b] font-mono font-bold uppercase tracking-widest">
                    SEU HERÓI
                  </span>
                </div>

                {/* Orbe de Sangue Líquido do Seu Herói */}
                <div className="ml-2">
                  <LifeOrb
                    currentHp={p1HeroHp}
                    maxHp={12}
                    isDamaged={p1IsDamaged}
                    size="md"
                    showMax={true}
                  />
                </div>

                {/* Orbe de Mana do Seu Herói */}
                <div className="ml-1">
                  <EnergyOrb currentEnergy={p1Energy} maxEnergy={10} size="md" />
                </div>
              </div>
            </div>

            {/* 3 Receptáculos Compactos de Magia Canalizada */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-[#6ba880] uppercase tracking-wider font-bold">
                Canais:
              </span>
              <div className="flex gap-1.5">
                {p1Channels.map((slot) => {
                  const card = slot.card;
                  return (
                    <div
                      key={slot.id}
                      onClick={() => onClickSlot(slot.lane, 'channel')}
                      onMouseEnter={() => card && onHoverCard(card)}
                      className={`w-11 h-11 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                        card
                          ? 'bg-[#181124] border-[#af67e3] shadow-[0_0_8px_rgba(175,103,227,0.4)]'
                          : 'bg-[#0a141b] border-[#223947] hover:border-[#43d9c4]'
                      }`}
                      title={card ? card.name : `Slot de Canalização ${slot.lane + 1}`}
                    >
                      <div className="card-counter-rotate text-[10px] font-bold">
                        {card ? '⏳' : <span className="opacity-30 text-[9px]">{slot.lane + 1}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
