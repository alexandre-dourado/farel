'use client';

import React, { useState } from 'react';
import { BattlefieldBoard, ActiveCombatState } from './BattlefieldBoard';
import { PlayerFieldState, SlotData } from './PlayerField';
import { HandTray } from './HandTray';
import { TurnTimeline, PhaseType } from './TurnTimeline';
import { PlaytestNotesModal } from './PlaytestNotesModal';
import { CardLibraryViewer } from './CardLibraryViewer';
import cardsData from '../game/data/farelDemoCards.json';
import { FarelCard } from '../types/farelCard';

const allCards: FarelCard[] = cardsData.cards as FarelCard[];
const getCard = (id: string) => allCards.find((c) => c.id === id) || null;

export const PlaytestArena: React.FC<{ onNavigateToTutorial?: () => void }> = ({ onNavigateToTutorial }) => {
  const [turn, setTurn] = useState(1);
  const [phase, setPhase] = useState<PhaseType>('action');
  const [activeCombat, setActiveCombat] = useState<ActiveCombatState | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([
    '⚔️ Partida iniciada! Bem-vindo à Arena de Playtest FAREL 1.1.',
    '👑 Proteja seu Herói: quando seus pontos de vida chegarem a zero, você perde a partida.',
    '⚡ Turno 1: Você recebeu 5 de energia base. Jogue cartas da sua mão nos slots!',
  ]);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [selectedHandCard, setSelectedHandCard] = useState<FarelCard | null>(null);
  const [heroDefends, setHeroDefends] = useState(false);
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);

  // Player state
  const [playerHeroLife, setPlayerHeroLife] = useState(12);
  const [playerAvailableEnergy, setPlayerAvailableEnergy] = useState(5);
  const [playerCreatures, setPlayerCreatures] = useState<(SlotData | null)[]>([
    { card: getCard('CRE-001'), currentLife: 4, maxLife: 4, newlySummoned: false, canAttack: true },
    null,
    null,
    null,
    null,
  ]);
  const [playerStructures, setPlayerStructures] = useState<(SlotData | null)[]>([
    { card: getCard('GEN-002'), currentLife: 4, maxLife: 4 }, // Mina de Éter (+2)
    null,
    null,
    null,
    null,
  ]);
  const [playerChannels, setPlayerChannels] = useState<(SlotData | null)[]>([
    { card: getCard('CHN-001'), isChanneling: true },
    null,
    null,
  ]);
  const [playerHand, setPlayerHand] = useState<FarelCard[]>([
    getCard('CRE-002')!, // Batedora do Vento (Ágil)
    getCard('CRE-005')!, // Gladiador
    getCard('SPL-001')!, // Fúria Marcial (+2 d6)
    getCard('SPL-002')!, // Dardo Arcano (2 dano)
    getCard('GEN-001')!, // Condensador (+1)
  ]);

  // Opponent state
  const [opponentHeroLife, setOpponentHeroLife] = useState(14);
  const [opponentCreatures, setOpponentCreatures] = useState<(SlotData | null)[]>([
    { card: getCard('CRE-004'), currentLife: 2, maxLife: 2, newlySummoned: false, canAttack: true },
    { card: getCard('CRE-003'), currentLife: 7, maxLife: 7, newlySummoned: false, canAttack: true },
    null,
    null,
    null,
  ]);
  const [opponentStructures, setOpponentStructures] = useState<(SlotData | null)[]>([
    null,
    { card: getCard('GEN-001'), currentLife: 3, maxLife: 3 }, // Condensador (+1)
    null,
    null,
    null,
  ]);
  const [opponentChannels, setOpponentChannels] = useState<(SlotData | null)[]>([
    null,
    null,
    null,
  ]);

  // Helper log
  const log = (msg: string) => setCombatLog((prev) => [msg, ...prev.slice(0, 40)]);

  // Compute structure income
  const playerStructureIncome = playerStructures.reduce((sum, s) => {
    return sum + (s?.card?.incomePerTurn || 0);
  }, 0);

  const opponentStructureIncome = opponentStructures.reduce((sum, s) => {
    return sum + (s?.card?.incomePerTurn || 0);
  }, 0);

  // Play a card
  const handlePlayCard = (card: FarelCard) => {
    if (winner) return;
    if (playerAvailableEnergy < card.energyCost) {
      log(`❌ Energia insuficiente para jogar ${card.name} (Requer ${card.energyCost}⚡, possui ${playerAvailableEnergy}⚡).`);
      return;
    }

    if (card.type === 'creature') {
      const freeIdx = playerCreatures.findIndex((c) => c === null);
      if (freeIdx === -1) {
        log('❌ Todos os 5 slots de criaturas estão ocupados!');
        return;
      }
      const newCreatures = [...playerCreatures];
      const isAgile = card.canAttackOnSummon === true;
      newCreatures[freeIdx] = {
        card,
        currentLife: card.life || 3,
        maxLife: card.life || 3,
        newlySummoned: !isAgile,
        canAttack: isAgile,
      };
      setPlayerCreatures(newCreatures);
      setPlayerAvailableEnergy((prev) => prev - card.energyCost);
      setPlayerHand((prev) => prev.filter((c) => c !== card));
      log(`⚔️ Invocou ${card.name} na Faixa ${freeIdx + 1}! ${isAgile ? 'Ágil: pode atacar já!' : 'Recém-invocada: aguarda próximo turno.'}`);
    } else if (card.type === 'generator') {
      const freeIdx = playerStructures.findIndex((s) => s === null);
      if (freeIdx === -1) {
        log('❌ Todos os 5 slots de estruturas estão ocupados!');
        return;
      }
      const newStructs = [...playerStructures];
      newStructs[freeIdx] = {
        card,
        currentLife: card.life || 3,
        maxLife: card.life || 3,
      };
      setPlayerStructures(newStructs);
      setPlayerAvailableEnergy((prev) => prev - card.energyCost);
      setPlayerHand((prev) => prev.filter((c) => c !== card));
      log(`💎 Construiu ${card.name} na Faixa ${freeIdx + 1}! Gerará +${card.incomePerTurn}⚡ a partir do próximo turno.`);
    } else if (card.type === 'channelled_spell') {
      const freeIdx = playerChannels.findIndex((ch) => ch === null);
      if (freeIdx === -1) {
        log('❌ Todos os 3 slots de canalização estão ocupados!');
        return;
      }
      const newChannels = [...playerChannels];
      newChannels[freeIdx] = {
        card,
        isChanneling: true,
      };
      setPlayerChannels(newChannels);
      setPlayerAvailableEnergy((prev) => prev - card.energyCost);
      setPlayerHand((prev) => prev.filter((c) => c !== card));
      log(`⏳ Canalizou ${card.name} no slot ${freeIdx + 1}! Aguardando condição: "${card.trigger}".`);
    } else if (card.type === 'spell') {
      setPlayerAvailableEnergy((prev) => prev - card.energyCost);
      setPlayerHand((prev) => prev.filter((c) => c !== card));

      if (card.id === 'SPL-002') {
        // Dardo Arcano: 2 damage to first enemy creature or hero
        const enemyCrIdx = opponentCreatures.findIndex((c) => c !== null);
        if (enemyCrIdx !== -1) {
          const target = opponentCreatures[enemyCrIdx]!;
          const newLife = Math.max(0, (target.currentLife || 0) - 2);
          const newOppCreatures = [...opponentCreatures];
          if (newLife === 0) {
            newOppCreatures[enemyCrIdx] = null;
            log(`⚡ Dardo Arcano causou 2 de dano direto! ${target.card?.name} na Faixa ${enemyCrIdx + 1} foi destruído!`);
          } else {
            newOppCreatures[enemyCrIdx] = { ...target, currentLife: newLife, isDamaged: true };
            log(`⚡ Dardo Arcano causou 2 de dano direto em ${target.card?.name} na Faixa ${enemyCrIdx + 1}!`);
          }
          setOpponentCreatures(newOppCreatures);
        } else {
          setOpponentHeroLife((prev) => {
            const nextLife = Math.max(0, prev - 2);
            if (nextLife === 0) setWinner('player');
            return nextLife;
          });
          log(`⚡ Dardo Arcano atingiu o Herói Oponente diretamente por 2 de dano!`);
        }
      } else if (card.id === 'SPL-003') {
        // Surto de Éter: +2 energy this turn
        setPlayerAvailableEnergy((prev) => prev + 2);
        log(`⚡ Surto de Éter ativado! +2 de energia disponível neste turno.`);
      } else {
        log(`⚡ Lançou a magia instantânea ${card.name}! ${card.rulesText}`);
      }
    }
  };

  // Draw card
  const handleDrawCard = () => {
    if (winner) return;
    const pool = allCards.filter((c) => c.type !== 'hero');
    const randomCard = pool[Math.floor(Math.random() * pool.length)];
    setPlayerHand((prev) => [...prev, randomCard]);
    log(`📥 Comprou uma carta: ${randomCard.name} (${randomCard.type}).`);
  };

  // End turn & resolve attacks
  const handleEndTurn = () => {
    if (winner) return;
    setPhase('end');
    log('🔔 Fim do turno do Jogador! Iniciando fase de combate com d6 nas faixas...');

    let currentOppHeroLife = opponentHeroLife;
    const newOppCreatures = [...opponentCreatures];
    const newOppStructures = [...opponentStructures];

    // Check each player creature for attack
    for (let lane = 0; lane < 5; lane++) {
      const attacker = playerCreatures[lane];
      if (attacker && attacker.canAttack) {
        // Roll d6
        const d6Roll = Math.floor(Math.random() * 6) + 1;
        const damage = d6Roll;

        // Target priority: creature -> structure -> hero
        const enemyCreature = newOppCreatures[lane];
        const enemyStructure = newOppStructures[lane];

        if (enemyCreature) {
          const newHp = Math.max(0, (enemyCreature.currentLife || 0) - damage);
          log(`🎲 Faixa ${lane + 1}: ${attacker.card?.name} rolou ${d6Roll} no d6! Causou ${damage} de dano em ${enemyCreature.card?.name}.`);
          if (newHp === 0) {
            newOppCreatures[lane] = null;
            log(`💀 ${enemyCreature.card?.name} na Faixa ${lane + 1} foi derrotado!`);
          } else {
            newOppCreatures[lane] = { ...enemyCreature, currentLife: newHp, isDamaged: true };
          }
        } else if (enemyStructure) {
          const newHp = Math.max(0, (enemyStructure.currentLife || 0) - damage);
          log(`💥 Faixa ${lane + 1}: Sem criatura inimiga! ${attacker.card?.name} atacou ${enemyStructure.card?.name} por ${damage} de dano!`);
          if (newHp === 0) {
            newOppStructures[lane] = null;
            log(`🏚️ Estrutura ${enemyStructure.card?.name} na Faixa ${lane + 1} foi destruída! Renda oponente reduzida.`);
          } else {
            newOppStructures[lane] = { ...enemyStructure, currentLife: newHp, isDamaged: true };
          }
        } else {
          // Direct hit on hero!
          currentOppHeroLife = Math.max(0, currentOppHeroLife - damage);
          log(`👑 Faixa ${lane + 1}: Faixa livre! Golpe atingiu o HERÓI OPONENTE diretamente por ${damage} de dano!`);
          if (currentOppHeroLife === 0) {
            setWinner('player');
            log('🎉 O Herói oponente foi derrotado! Conexão rompida — VOCÊ VENCEU A PARTIDA!');
            break;
          }
        }
      }
    }

    setOpponentCreatures(newOppCreatures);
    setOpponentStructures(newOppStructures);
    setOpponentHeroLife(currentOppHeroLife);

    if (currentOppHeroLife > 0) {
      // Simulate opponent retaliation / response
      setTimeout(() => {
        log('🛡️ Turno do Oponente: Oponente recebe energia e avança suas tropas...');
        // Opponent attack on lane 1 if creature exists
        if (newOppCreatures[0]) {
          const oppRoll = Math.floor(Math.random() * 6) + 1;
          if (heroDefends) {
            setPlayerHeroLife((prev) => {
              const nextLife = Math.max(0, prev - oppRoll);
              if (nextLife === 0) setWinner('opponent');
              return nextLife;
            });
            log(`🛡️ Seu Herói interceptou o ataque do oponente na Faixa 1! Sofreu ${oppRoll} de dano de combate no elo mortal.`);
          } else if (playerCreatures[0]) {
            const newPlHp = Math.max(0, (playerCreatures[0].currentLife || 0) - oppRoll);
            const updated = [...playerCreatures];
            if (newPlHp === 0) {
              updated[0] = null;
              log(`💀 Seu ${playerCreatures[0].card?.name} na Faixa 1 sofreu ${oppRoll} de dano e foi derrotado!`);
            } else {
              updated[0] = { ...playerCreatures[0], currentLife: newPlHp, isDamaged: true };
              log(`🛡️ Seu ${playerCreatures[0].card?.name} na Faixa 1 sofreu ${oppRoll} de dano (Restam ${newPlHp} PV).`);
            }
            setPlayerCreatures(updated);
          } else {
            setPlayerHeroLife((prev) => {
              const nextLife = Math.max(0, prev - oppRoll);
              if (nextLife === 0) setWinner('opponent');
              return nextLife;
            });
            log(`⚠️ Faixa 1 desprotegida! Ataque inimigo atingiu seu Herói diretamente por ${oppRoll} de dano!`);
          }
        }

        // Start Next Player Turn
        setTurn((prev) => prev + 1);
        setPhase('action');
        // Refresh energy: 5 base + structures
        const nextEnergy = 5 + playerStructureIncome;
        setPlayerAvailableEnergy(nextEnergy);

        // Turn all newlySummoned creatures to canAttack
        setPlayerCreatures((prev) =>
          prev.map((c) => (c ? { ...c, newlySummoned: false, canAttack: true } : null))
        );

        // Auto draw 1 card
        handleDrawCard();
        log(`🌅 Turno ${turn + 1} iniciado! Você recebeu ${nextEnergy}⚡ (${5} base + ${playerStructureIncome} geradores) e comprou uma carta.`);
      }, 1200);
    }
  };

  const handleRestartGame = () => {
    setTurn(1);
    setPhase('action');
    setActiveCombat(null);
    setWinner(null);
    setHeroDefends(false);
    setPlayerHeroLife(12);
    setOpponentHeroLife(14);
    setPlayerAvailableEnergy(5);
    setPlayerCreatures([
      { card: getCard('CRE-001'), currentLife: 4, maxLife: 4, newlySummoned: false, canAttack: true },
      null,
      null,
      null,
      null,
    ]);
    setPlayerStructures([
      { card: getCard('GEN-002'), currentLife: 4, maxLife: 4 },
      null,
      null,
      null,
      null,
    ]);
    setPlayerChannels([{ card: getCard('CHN-001'), isChanneling: true }, null, null]);
    setPlayerHand([
      getCard('CRE-002')!,
      getCard('CRE-005')!,
      getCard('SPL-001')!,
      getCard('SPL-002')!,
      getCard('GEN-001')!,
    ]);
    setOpponentCreatures([
      { card: getCard('CRE-004'), currentLife: 2, maxLife: 2, newlySummoned: false, canAttack: true },
      { card: getCard('CRE-003'), currentLife: 7, maxLife: 7, newlySummoned: false, canAttack: true },
      null,
      null,
      null,
    ]);
    setOpponentStructures([null, { card: getCard('GEN-001'), currentLife: 3, maxLife: 3 }, null, null, null]);
    setCombatLog(['⚔️ Nova partida reiniciada!']);
  };

  const playerFieldState: PlayerFieldState = {
    playerId: 'p1',
    playerName: 'Viajante do Limiar',
    isOpponent: false,
    hero: { card: getCard('HERO-001'), currentLife: playerHeroLife, maxLife: 12 },
    creatures: playerCreatures,
    structures: playerStructures,
    channels: playerChannels,
    baseEnergy: 5,
    structureIncome: playerStructureIncome,
    availableEnergy: playerAvailableEnergy,
  };

  const opponentFieldState: PlayerFieldState = {
    playerId: 'p2',
    playerName: 'Imperatriz das Eras',
    isOpponent: true,
    hero: { card: getCard('HERO-002'), currentLife: opponentHeroLife, maxLife: 14 },
    creatures: opponentCreatures,
    structures: opponentStructures,
    channels: opponentChannels,
    baseEnergy: 5,
    structureIncome: opponentStructureIncome,
    availableEnergy: 5,
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-12">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/95 sticky top-0 z-40 px-4 py-2.5 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
              FAREL
            </span>
            <span className="text-xs font-mono text-slate-400">ARENA DE PLAYTEST MVP</span>
            <span className="text-xs font-mono font-bold text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-500/30">
              TURNO {turn}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLibraryOpen(true)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              🃏 Biblioteca (14)
            </button>
            <button
              onClick={() => setIsNotesOpen(true)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors font-semibold"
            >
              📋 Regras & Questões
            </button>
            {onNavigateToTutorial && (
              <button
                onClick={onNavigateToTutorial}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 transition-colors font-semibold"
              >
                🎓 Rever Tutorial (18)
              </button>
            )}
            <button
              onClick={handleRestartGame}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors"
            >
              🔄 Reiniciar Partida
            </button>
          </div>
        </div>
      </header>

      {/* Main Arena Content */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-5 flex-1">
        {/* Victory or Defeat Banner */}
        {winner && (
          <div className={`p-6 rounded-2xl border text-center shadow-2xl animate-bounce ${
            winner === 'player'
              ? 'bg-emerald-950/80 border-emerald-400 text-emerald-100 shadow-emerald-950/80'
              : 'bg-rose-950/80 border-rose-400 text-rose-100 shadow-rose-950/80'
          }`}>
            <h2 className="text-2xl sm:text-3xl font-black mb-1">
              {winner === 'player' ? '👑 VITÓRIA! O ELO INIMIGO FOI DESTRUÍDO!' : '💀 DERROTA! SUA CONEXÃO FOI ROMPIDA!'}
            </h2>
            <p className="text-sm opacity-90 mb-4">
              {winner === 'player'
                ? 'Você destruiu o Herói adversário através da prioridade de combate e gestão de energia.'
                : 'Seu Herói chegou a zero pontos de vida.'}
            </p>
            <button
              onClick={handleRestartGame}
              className="px-6 py-2.5 rounded-xl font-bold bg-white text-slate-950 hover:bg-slate-200 transition-transform active:scale-95 text-sm"
            >
              Jogar Novamente
            </button>
          </div>
        )}

        {/* Turn Timeline */}
        <TurnTimeline currentPhase={phase} />

        {/* Battlefield Board */}
        <BattlefieldBoard
          playerState={playerFieldState}
          opponentState={opponentFieldState}
          activeCombat={activeCombat}
        />

        {/* Arena Action Bar & Controls */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleEndTurn}
              disabled={Boolean(winner)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-transform active:scale-95 ${
                winner
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-lg shadow-amber-500/20'
              }`}
            >
              <span>⚔️ Encerrar Turno & Resolver Ataques d6</span>
            </button>

            <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                checked={heroDefends}
                onChange={(e) => setHeroDefends(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <span>🛡️ Interceptar ataques com o Herói</span>
            </label>
          </div>

          <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
            <span>Energia: <strong className="text-teal-300">{playerAvailableEnergy}⚡</strong></span>
            <span>Renda geradores: <strong className="text-emerald-300">+{playerStructureIncome}⚡</strong></span>
          </div>
        </div>

        {/* Hand Tray */}
        <HandTray
          cards={playerHand}
          availableEnergy={playerAvailableEnergy}
          onPlayCard={handlePlayCard}
          onDrawCard={handleDrawCard}
          isDrawEligible={!winner}
        />

        {/* Live Combat Event Log */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-1">
            <span>📜 Registro de Combate e Eventos</span>
            <span className="text-[10px] text-slate-500">Eventos em tempo real</span>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1 font-mono text-xs text-slate-300">
            {combatLog.map((item, idx) => (
              <div key={idx} className="leading-relaxed border-l-2 border-slate-800 pl-2">
                {item}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Library Inspector Modal */}
      {isLibraryOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={() => setIsLibraryOpen(false)}
        >
          <div
            className="w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-amber-300">Biblioteca de Cartas</h3>
              <button
                onClick={() => setIsLibraryOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CardLibraryViewer />
            </div>
          </div>
        </div>
      )}

      {/* Playtest Notes Modal */}
      <PlaytestNotesModal
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
      />
    </div>
  );
};
