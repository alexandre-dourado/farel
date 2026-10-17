'use client';

import React, { useState } from 'react';
import { FarelCard } from '../../types/farelCard';
import { DuelCardInspector } from './DuelCardInspector';
import { TacticalBoard, BoardSlotData } from './TacticalBoard';
import { HotseatControls } from './HotseatControls';
import { CombatFloatingItem } from './FloatingCombatText';
import rawDemoCards from '../../game/data/farelDemoCards.json';

interface CombatLogEntry {
  id: string;
  turn: number;
  message: string;
  type: 'damage' | 'summon' | 'energy' | 'phase' | 'info';
  timestamp: string;
}

export const DuelArena: React.FC = () => {
  const cardsLibrary: FarelCard[] = (rawDemoCards as unknown as { cards: FarelCard[] }).cards;

  const heroP1 = cardsLibrary.find((c) => c.id === 'HERO-001') || cardsLibrary[0];
  const heroP2 = cardsLibrary.find((c) => c.id === 'HERO-002') || cardsLibrary[1];

  // Game state
  const [currentTurn, setCurrentTurn] = useState<number>(1);
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [autoFlipOnTurn, setAutoFlipOnTurn] = useState<boolean>(true);
  const [heroIntercept, setHeroIntercept] = useState<boolean>(false);

  // Inspector & selection
  const [inspectedCard, setInspectedCard] = useState<FarelCard | null>(heroP1);
  const [selectedHandCard, setSelectedHandCard] = useState<FarelCard | null>(null);

  // Health and energy
  const [p1Hp, setP1Hp] = useState<number>(heroP1.life ?? 12);
  const [p2Hp, setP2Hp] = useState<number>(heroP2.life ?? 14);
  const [p1Energy, setP1Energy] = useState<number>(5);
  const [p2Energy, setP2Energy] = useState<number>(5);

  // Visual Damage Pulses & Floating Combat Texts
  const [p1IsDamaged, setP1IsDamaged] = useState<boolean>(false);
  const [p2IsDamaged, setP2IsDamaged] = useState<boolean>(false);
  const [floatingCombatItems, setFloatingCombatItems] = useState<CombatFloatingItem[]>([]);

  // Board Slots (5 creatures, 5 structures, 3 channels)
  const initialSlots = (type: 'creature' | 'structure' | 'channel', count: number, prefix: string): BoardSlotData[] =>
    Array.from({ length: count }, (_, i) => ({
      id: `${prefix}-${type}-${i}`,
      lane: i,
      type,
      card: null
    }));

  const [p1Creatures, setP1Creatures] = useState<BoardSlotData[]>(() => initialSlots('creature', 5, 'p1'));
  const [p1Structures, setP1Structures] = useState<BoardSlotData[]>(() => initialSlots('structure', 5, 'p1'));
  const [p1Channels, setP1Channels] = useState<BoardSlotData[]>(() => initialSlots('channel', 3, 'p1'));

  const [p2Creatures, setP2Creatures] = useState<BoardSlotData[]>(() => initialSlots('creature', 5, 'p2'));
  const [p2Structures, setP2Structures] = useState<BoardSlotData[]>(() => initialSlots('structure', 5, 'p2'));
  const [p2Channels, setP2Channels] = useState<BoardSlotData[]>(() => initialSlots('channel', 3, 'p2'));

  // Hands
  const playableCards = cardsLibrary.filter((c) => c.type !== 'hero');
  const [p1Hand, setP1Hand] = useState<FarelCard[]>(() => playableCards.slice(0, 4));
  const [p2Hand, setP2Hand] = useState<FarelCard[]>(() => playableCards.slice(4, 8));

  // Combat d6
  const [lastDieRoll, setLastDieRoll] = useState<number | null>(null);
  const [attackModifier, setAttackModifier] = useState<number>(0);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [lastCombatLanes, setLastCombatLanes] = useState<number[]>([]);

  // Logs
  const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([
    {
      id: 'log-0',
      turn: 1,
      message: 'Partida iniciada no modo Duelo Forbidden Memories. Jogador 1 começa.',
      type: 'info',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const addLog = (message: string, type: CombatLogEntry['type']) => {
    setCombatLog((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        turn: currentTurn,
        message,
        type,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  const triggerDamagePulse = (player: 1 | 2) => {
    if (player === 1) {
      setP1IsDamaged(true);
      setTimeout(() => setP1IsDamaged(false), 600);
    } else {
      setP2IsDamaged(true);
      setTimeout(() => setP2IsDamaged(false), 600);
    }
  };

  // Roll d6 helper
  const rollD6 = (): number => {
    return Math.floor(Math.random() * 6) + 1;
  };

  const handleManualRollDie = () => {
    if (isRolling) return;
    setIsRolling(true);
    setTimeout(() => {
      const roll = rollD6();
      setLastDieRoll(roll);
      setIsRolling(false);
      addLog(`Dado rolado: ${roll} (Mod: ${attackModifier}) ➔ ${roll + attackModifier} dano.`, 'damage');
    }, 400);
  };

  // Summon card from hand to board slot
  const handleSlotClick = (lane: number, slotType: 'creature' | 'structure' | 'channel') => {
    if (!selectedHandCard) return;

    const currentEnergy = activePlayer === 1 ? p1Energy : p2Energy;
    if (currentEnergy < selectedHandCard.energyCost) {
      addLog(`Energia insuficiente! Requer ${selectedHandCard.energyCost} ⚡ (disponível: ${currentEnergy}).`, 'info');
      return;
    }

    if (selectedHandCard.type === 'creature' && slotType !== 'creature') return;
    if (selectedHandCard.type === 'generator' && slotType !== 'structure') return;
    if (selectedHandCard.type === 'channelled_spell' && slotType !== 'channel') return;

    const maxHp = selectedHandCard.life ?? (slotType === 'creature' ? 4 : 5);

    if (activePlayer === 1) {
      setP1Energy((e) => e - selectedHandCard.energyCost);
      if (slotType === 'creature') {
        setP1Creatures((prev) =>
          prev.map((s, idx) => (idx === lane ? { ...s, card: selectedHandCard, currentLife: maxHp, maxLife: maxHp } : s))
        );
      } else if (slotType === 'structure') {
        setP1Structures((prev) =>
          prev.map((s, idx) => (idx === lane ? { ...s, card: selectedHandCard, currentLife: maxHp, maxLife: maxHp } : s))
        );
      } else if (slotType === 'channel') {
        setP1Channels((prev) =>
          prev.map((s, idx) => (idx === lane ? { ...s, card: selectedHandCard } : s))
        );
      }
      setP1Hand((h) => h.filter((c) => c.id !== selectedHandCard.id));
    } else {
      setP2Energy((e) => e - selectedHandCard.energyCost);
      if (slotType === 'creature') {
        setP2Creatures((prev) =>
          prev.map((s, idx) => (idx === lane ? { ...s, card: selectedHandCard, currentLife: maxHp, maxLife: maxHp } : s))
        );
      } else if (slotType === 'structure') {
        setP2Structures((prev) =>
          prev.map((s, idx) => (idx === lane ? { ...s, card: selectedHandCard, currentLife: maxHp, maxLife: maxHp } : s))
        );
      } else if (slotType === 'channel') {
        setP2Channels((prev) =>
          prev.map((s, idx) => (idx === lane ? { ...s, card: selectedHandCard } : s))
        );
      }
      setP2Hand((h) => h.filter((c) => c.id !== selectedHandCard.id));
    }

    addLog(
      `Jogador ${activePlayer} invocou ${selectedHandCard.name} na Faixa ${lane + 1} (-${selectedHandCard.energyCost} ⚡).`,
      'summon'
    );
    setSelectedHandCard(null);
  };

  // End Turn & Resolve Combat
  const handleEndTurn = () => {
    setIsRolling(true);
    const engagedLanes: number[] = [];
    const newFloatingItems: CombatFloatingItem[] = [];

    const attackingCreatures = activePlayer === 1 ? p1Creatures : p2Creatures;
    const defendingCreatures = activePlayer === 1 ? p2Creatures : p1Creatures;
    const defendingStructures = activePlayer === 1 ? p2Structures : p1Structures;

    let totalDamageDealtThisTurn = 0;

    attackingCreatures.forEach((attackerSlot, laneIdx) => {
      if (attackerSlot.card) {
        engagedLanes.push(laneIdx);
        const roll = rollD6();
        const dmg = Math.max(1, roll + attackModifier);
        totalDamageDealtThisTurn += dmg;

        const defenderCreature = defendingCreatures[laneIdx];
        const defenderStructure = defendingStructures[laneIdx];

        if (heroIntercept) {
          if (activePlayer === 1) {
            setP2Hp((hp) => Math.max(0, hp - dmg));
            triggerDamagePulse(2);
          } else {
            setP1Hp((hp) => Math.max(0, hp - dmg));
            triggerDamagePulse(1);
          }
          newFloatingItems.push({
            id: `crit-${Date.now()}-${laneIdx}`,
            lane: laneIdx,
            text: `🛡️ -${dmg} NO HERÓI!`,
            kind: 'intercept'
          });
          addLog(
            `[Faixa ${laneIdx + 1}] ${attackerSlot.card.name} rolou d6 (${roll}) ➔ ${dmg} dano interceptado pelo Herói!`,
            'damage'
          );
        } else if (defenderCreature && defenderCreature.card) {
          const newLife = (defenderCreature.currentLife ?? 4) - dmg;
          if (activePlayer === 1) {
            setP2Creatures((prev) =>
              prev.map((s, idx) =>
                idx === laneIdx
                  ? newLife <= 0
                    ? { ...s, card: null, currentLife: 0 }
                    : { ...s, currentLife: newLife }
                  : s
              )
            );
          } else {
            setP1Creatures((prev) =>
              prev.map((s, idx) =>
                idx === laneIdx
                  ? newLife <= 0
                    ? { ...s, card: null, currentLife: 0 }
                    : { ...s, currentLife: newLife }
                  : s
              )
            );
          }

          newFloatingItems.push({
            id: `dmg-${Date.now()}-${laneIdx}`,
            lane: laneIdx,
            text: newLife <= 0 ? `☠️ -${dmg} DESTRUÍDA!` : `💥 -${dmg}`,
            kind: newLife <= 0 ? 'destroyed' : roll === 6 ? 'critical' : 'damage'
          });

          addLog(
            `[Faixa ${laneIdx + 1}] ${attackerSlot.card.name} atacou ${defenderCreature.card.name}: ${dmg} dano! ${
              newLife <= 0 ? '☠️ Criatura destruída!' : `(Vida restante: ${newLife})`
            }`,
            'damage'
          );
        } else if (defenderStructure && defenderStructure.card) {
          const newLife = (defenderStructure.currentLife ?? 5) - dmg;
          if (activePlayer === 1) {
            setP2Structures((prev) =>
              prev.map((s, idx) =>
                idx === laneIdx
                  ? newLife <= 0
                    ? { ...s, card: null, currentLife: 0 }
                    : { ...s, currentLife: newLife }
                  : s
              )
            );
          } else {
            setP1Structures((prev) =>
              prev.map((s, idx) =>
                idx === laneIdx
                  ? newLife <= 0
                    ? { ...s, card: null, currentLife: 0 }
                    : { ...s, currentLife: newLife }
                  : s
              )
            );
          }

          newFloatingItems.push({
            id: `str-${Date.now()}-${laneIdx}`,
            lane: laneIdx,
            text: newLife <= 0 ? `💥 -${dmg} RUÍNA!` : `💥 -${dmg}`,
            kind: 'damage'
          });

          addLog(
            `[Faixa ${laneIdx + 1}] ${attackerSlot.card.name} atacou ${defenderStructure.card.name}: ${dmg} dano à estrutura!`,
            'damage'
          );
        } else {
          // Direct Hit to Enemy Hero
          if (activePlayer === 1) {
            setP2Hp((hp) => Math.max(0, hp - dmg));
            triggerDamagePulse(2);
          } else {
            setP1Hp((hp) => Math.max(0, hp - dmg));
            triggerDamagePulse(1);
          }

          newFloatingItems.push({
            id: `hero-${Date.now()}-${laneIdx}`,
            lane: laneIdx,
            text: `🩸 -${dmg} DIRETO NO HERÓI!`,
            kind: roll >= 5 ? 'critical' : 'damage'
          });

          addLog(
            `[Faixa ${laneIdx + 1}] FAIXA LIVRE! ${attackerSlot.card.name} rolou d6 (${roll}) ➔ ${dmg} dano direto ao Herói inimigo!`,
            'damage'
          );
        }
      }
    });

    setFloatingCombatItems(newFloatingItems);
    setTimeout(() => setFloatingCombatItems([]), 1300);

    setLastCombatLanes(engagedLanes);
    setLastDieRoll(totalDamageDealtThisTurn > 0 ? totalDamageDealtThisTurn : null);

    // Turn change & income
    setTimeout(() => {
      setIsRolling(false);
      const nextPlayer = activePlayer === 1 ? 2 : 1;
      setActivePlayer(nextPlayer);
      setCurrentTurn((t) => t + 1);

      const survivingStructures = nextPlayer === 1 ? p1Structures : p2Structures;
      const extraEnergy = survivingStructures.filter((s) => s.card !== null).length;
      const totalIncome = 1 + extraEnergy;

      if (nextPlayer === 1) {
        setP1Energy((e) => Math.min(10, e + totalIncome));
      } else {
        setP2Energy((e) => Math.min(10, e + totalIncome));
      }

      addLog(`Início do Turno ${currentTurn + 1} • Jogador ${nextPlayer} recebeu +${totalIncome} ⚡ de energia.`, 'phase');

      if (autoFlipOnTurn) {
        setIsFlipped((f) => !f);
      }
    }, 550);
  };

  const handleResetGame = () => {
    setCurrentTurn(1);
    setActivePlayer(1);
    setIsFlipped(false);
    setP1Hp(heroP1.life ?? 12);
    setP2Hp(heroP2.life ?? 14);
    setP1Energy(5);
    setP2Energy(5);
    setP1Creatures(initialSlots('creature', 5, 'p1'));
    setP1Structures(initialSlots('structure', 5, 'p1'));
    setP1Channels(initialSlots('channel', 3, 'p1'));
    setP2Creatures(initialSlots('creature', 5, 'p2'));
    setP2Structures(initialSlots('structure', 5, 'p2'));
    setP2Channels(initialSlots('channel', 3, 'p2'));
    setP1Hand(playableCards.slice(0, 4));
    setP2Hand(playableCards.slice(4, 8));
    setLastDieRoll(null);
    setFloatingCombatItems([]);
    setCombatLog([
      {
        id: 'reset-1',
        turn: 1,
        message: 'Duelo reiniciado. Tabuleiro restaurado ao estado inicial.',
        type: 'info',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  const activeHand = activePlayer === 1 ? p1Hand : p2Hand;
  const isGameOver = p1Hp <= 0 || p2Hp <= 0;
  const winner = p1Hp <= 0 ? 'Jogador 2 (Imperatriz das Eras)' : 'Jogador 1 (Viajante do Limiar)';

  return (
    <div className="w-screen h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#071017] text-[#f2eee5] flex flex-col font-sans select-none">
      {/* 1. Barra Superior de Controles e Hotseat (180°) */}
      <HotseatControls
        currentTurn={currentTurn}
        activePlayer={activePlayer}
        p1Name={heroP1.name}
        p2Name={heroP2.name}
        p1Hp={p1Hp}
        p2Hp={p2Hp}
        p1Energy={p1Energy}
        p2Energy={p2Energy}
        isFlipped={isFlipped}
        autoFlipOnTurn={autoFlipOnTurn}
        onToggleAutoFlip={() => setAutoFlipOnTurn((v) => !v)}
        onManualFlip={() => setIsFlipped((v) => !v)}
        heroIntercept={heroIntercept}
        onToggleHeroIntercept={() => setHeroIntercept((v) => !v)}
        onEndTurn={handleEndTurn}
        onResetGame={handleResetGame}
        disabled={isGameOver || isRolling}
      />

      {/* 2. Área Central de Duelo: Painel Lateral PS1 + Tabuleiro Tático */}
      <div className="flex-1 flex flex-row min-h-0 overflow-hidden relative">
        {/* Painel Lateral Esquerdo: Inspecionador de Cartas com Moldura Transparente + Dado + Log */}
        <DuelCardInspector
          card={inspectedCard}
          lastDieRoll={lastDieRoll}
          attackModifier={attackModifier}
          isRolling={isRolling}
          onRollDie={handleManualRollDie}
          combatLog={combatLog}
        />

        {/* Tabuleiro Tático Central com Orbes Vivos e Zero Scroll */}
        <div className="flex-1 flex flex-col justify-between min-h-0 overflow-hidden relative">
          <TacticalBoard
            isFlipped={isFlipped}
            selectedCardId={selectedHandCard ? selectedHandCard.id : null}
            onHoverCard={(c) => c && setInspectedCard(c)}
            onClickSlot={handleSlotClick}
            p2Hero={heroP2}
            p2HeroHp={p2Hp}
            p2Energy={p2Energy}
            p2IsDamaged={p2IsDamaged}
            p2Creatures={p2Creatures}
            p2Structures={p2Structures}
            p2Channels={p2Channels}
            p1Hero={heroP1}
            p1HeroHp={p1Hp}
            p1Energy={p1Energy}
            p1IsDamaged={p1IsDamaged}
            p1Creatures={p1Creatures}
            p1Structures={p1Structures}
            p1Channels={p1Channels}
            activePlayer={activePlayer}
            lastCombatLanes={lastCombatLanes}
            floatingItems={floatingCombatItems}
          />

          {/* Bandeja da Mão do Jogador Ativo */}
          <footer className="h-[92px] min-h-[92px] bg-[#09131a]/95 border-t border-[#223544] px-4 py-1.5 flex items-center justify-between gap-3 z-10 shadow-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-serif font-bold text-[#d4af70] tracking-wider flex items-center gap-1">
                <span>🎴</span> Mão P{activePlayer}:
              </span>
              <span className="text-[10px] text-[#7d99aa] font-mono">
                ({activeHand.length} cartas)
              </span>
            </div>

            <div className="flex-1 flex items-center gap-2.5 overflow-x-auto py-1 scrollbar-thin">
              {activeHand.map((card) => {
                const isSelected = selectedHandCard?.id === card.id;
                const canAfford = (activePlayer === 1 ? p1Energy : p2Energy) >= card.energyCost;
                const artUrl = card.artUrl || `/assets/farel/illustrations/${card.id}.webp`;
                const getFrameUrl = (type: string) => {
                  switch (type) {
                    case 'hero': return '/assets/farel/cards/template-hero.webp';
                    case 'creature': return '/assets/farel/cards/template-creature.webp';
                    case 'generator': return '/assets/farel/cards/template-structure.webp';
                    case 'spell': return '/assets/farel/cards/template-spell-instant.webp';
                    case 'channelled_spell': return '/assets/farel/cards/template-spell-channel.webp';
                    default: return '/assets/farel/cards/template-creature.webp';
                  }
                };

                return (
                  <div
                    key={card.id}
                    onMouseEnter={() => setInspectedCard(card)}
                    onClick={() => {
                      setSelectedHandCard(isSelected ? null : card);
                      setInspectedCard(card);
                    }}
                    className={`relative h-[82px] w-[62px] min-w-[62px] rounded-md border flex flex-col justify-between cursor-pointer transition-all duration-150 select-none overflow-hidden group ${
                      isSelected
                        ? 'border-[#43d9c4] shadow-[0_0_15px_rgba(67,217,196,0.6)] -translate-y-2 scale-105 z-20'
                        : canAfford
                        ? 'border-[#385366] hover:border-[#d4af70] hover:-translate-y-1.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.6)]'
                        : 'border-[#1b252d] opacity-55 hover:opacity-80'
                    }`}
                  >
                    {/* Background Illustration */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-110 duration-200"
                      style={{ backgroundImage: `url('${artUrl}')` }}
                    />
                    {/* Frame overlay */}
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-70 pointer-events-none"
                      style={{ backgroundImage: `url('${getFrameUrl(card.type)}')` }}
                    />
                    {/* Dark gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/60 pointer-events-none" />

                    {/* Top: Energy Cost badge & Life */}
                    <div className="relative z-10 p-0.5 flex justify-between items-start">
                      <span className="w-4 h-4 rounded-full bg-[#0d161d]/90 border border-[#d4af70] text-[#ffd580] flex items-center justify-center font-serif font-black text-[9px] shadow">
                        {card.energyCost}
                      </span>
                      {card.life !== null && card.life !== undefined && (
                        <span className="px-1 py-0.2 rounded bg-[#5a1111]/90 border border-[#ff6e61] text-[8px] font-bold text-[#ffb0a6] leading-tight">
                          {card.life}
                        </span>
                      )}
                    </div>

                    {/* Bottom: Card Name & Type */}
                    <div className="relative z-10 p-0.5 text-center">
                      <div className="text-[8px] font-serif font-bold text-[#fce8c7] truncate leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        {card.name}
                      </div>
                      <div className="text-[6.5px] uppercase tracking-wider font-mono text-[#8eb0c2] leading-tight">
                        {card.type === 'channelled_spell' ? 'CANALIZ' : card.type}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedHandCard && (
              <button
                onClick={() => setSelectedHandCard(null)}
                type="button"
                className="px-2 py-1 text-[10px] text-[#aab6c4] hover:text-white border border-[#3b5161] rounded bg-[#101b22]"
              >
                Cancelar
              </button>
            )}
          </footer>
        </div>
      </div>

      {/* 3. Modal de Vitória / Fim de Jogo */}
      {isGameOver && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full bg-gradient-to-b from-[#172530] to-[#0b1218] border-2 border-[#d4af70] rounded-2xl p-6 text-center shadow-[0_0_50px_rgba(212,175,112,0.4)] animate-in fade-in zoom-in duration-300">
            <div className="text-5xl mb-3">🏆</div>
            <h2 className="text-2xl font-serif font-bold text-[#fce8c7] mb-1">
              Vitória Decisiva!
            </h2>
            <p className="text-sm text-[#43d9c4] font-mono mb-4">
              {winner} venceu a disputa!
            </p>
            <p className="text-xs text-[#9db2be] mb-6">
              O Elo Mortal adversário foi quebrado. A partida durou {currentTurn} turnos.
            </p>
            <button
              onClick={handleResetGame}
              type="button"
              className="px-6 py-2.5 rounded-lg bg-gradient-to-b from-[#f2d08a] to-[#d4af70] text-[#091116] font-serif font-bold text-sm border border-[#ffe1a6] shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              Jogar Novamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
