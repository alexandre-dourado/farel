'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TUTORIAL_SLIDES, TutorialSlide } from '../data/tutorialSlides';
import { BattlefieldBoard, ActiveCombatState } from './BattlefieldBoard';
import { PlayerFieldState } from './PlayerField';
import { TurnTimeline, PhaseType } from './TurnTimeline';
import { HandTray } from './HandTray';
import { PlaytestNotesModal } from './PlaytestNotesModal';
import cardsData from '../game/data/farelDemoCards.json';
import { FarelCard } from '../types/farelCard';

const allCards: FarelCard[] = cardsData.cards as FarelCard[];
const getCard = (id: string) => allCards.find((c) => c.id === id) || null;

export const TutorialShell: React.FC<{ onNavigateToArena?: () => void }> = ({ onNavigateToArena }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [interactiveStep, setInteractiveStep] = useState(0);

  const currentSlide: TutorialSlide = TUTORIAL_SLIDES[currentSlideIndex];
  const totalSlides = TUTORIAL_SLIDES.length;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'Right') {
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        goToPrev();
      } else if (e.key === 'Home') {
        setCurrentSlideIndex(0);
        setInteractiveStep(0);
      } else if (e.key === 'End') {
        setCurrentSlideIndex(totalSlides - 1);
        setInteractiveStep(0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, totalSlides]);

  const goToNext = useCallback(() => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
      setInteractiveStep(0);
    }
  }, [currentSlideIndex, totalSlides]);

  const goToPrev = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
      setInteractiveStep(0);
    }
  }, [currentSlideIndex]);

  const handleRestart = () => {
    setCurrentSlideIndex(0);
    setInteractiveStep(0);
  };

  // Build reactive board scene state based on currentSlide and interactiveStep
  const getSceneState = () => {
    const heroCard1 = getCard('HERO-001')!;
    const heroCard2 = getCard('HERO-002')!;
    const legionario = getCard('CRE-001')!;
    const batedora = getCard('CRE-002')!;
    const guardiao = getCard('CRE-003')!;
    const lobo = getCard('CRE-004')!;
    const gladiador = getCard('CRE-005')!;
    const condensador = getCard('GEN-001')!;
    const mina = getCard('GEN-002')!;
    const fúria = getCard('SPL-001')!;
    const dardo = getCard('SPL-002')!;
    const escudo = getCard('CHN-001')!;

    // Defaults
    let playerHeroLife = 12;
    let opponentHeroLife = 14;
    let playerAvailableEnergy = 5;
    let playerBaseEnergy = 5;
    let playerStructureIncome = 0;
    let activeCombat: ActiveCombatState | null = null;

    let playerCreatures: any[] = [null, null, null, null, null];
    let playerStructures: any[] = [null, null, null, null, null];
    let playerChannels: any[] = [null, null, null, null, null];
    let playerHandCards: FarelCard[] = [legionario, batedora, mina, dardo, fúria];

    let opponentCreatures: any[] = [null, null, null, null, null];
    let opponentStructures: any[] = [null, null, null, null, null];
    let opponentChannels: any[] = [null, null, null];

    switch (currentSlide.id) {
      case 'slide-01':
        // Empty board with subtle entry
        if (interactiveStep > 0) {
          playerCreatures[0] = { card: legionario, currentLife: 4, maxLife: 4, newlySummoned: true };
          opponentCreatures[0] = { card: lobo, currentLife: 2, maxLife: 2 };
        }
        break;

      case 'slide-02':
        // Hero danger - connection broken when life = 0
        if (interactiveStep === 0) {
          playerHeroLife = 3;
        } else {
          playerHeroLife = 0;
        }
        break;

      case 'slide-03':
        // Zones overview - sample entities in slots
        playerStructures[0] = { card: mina, currentLife: 4, maxLife: 4 };
        playerCreatures[0] = { card: legionario, currentLife: 4, maxLife: 4, canAttack: true };
        playerChannels[0] = { card: escudo, isChanneling: true };
        break;

      case 'slide-04':
        // Starting hand
        playerHandCards = [legionario, mina, dardo, batedora, fúria];
        break;

      case 'slide-05':
        // Turn timeline
        playerCreatures[0] = { card: legionario, currentLife: 4, maxLife: 4, canAttack: true };
        break;

      case 'slide-06':
        // Energy spend: 5 -> 3
        if (interactiveStep === 0) {
          playerAvailableEnergy = 5;
        } else {
          playerAvailableEnergy = 3;
          playerCreatures[0] = { card: legionario, currentLife: 4, maxLife: 4, newlySummoned: true };
        }
        break;

      case 'slide-07':
        // Generator build: Mina de Éter (+2 renda)
        playerStructures[0] = { card: mina, currentLife: 4, maxLife: 4 };
        if (interactiveStep > 0) {
          playerStructureIncome = 2;
          playerAvailableEnergy = 7;
        }
        break;

      case 'slide-08':
        // Hand limit 5
        if (interactiveStep === 1) {
          playerHandCards = [legionario, mina, dardo, batedora, fúria, guardiao]; // 6 cards!
        } else if (interactiveStep >= 2) {
          playerHandCards = [legionario, mina, dardo, batedora, fúria]; // back to 5
          playerCreatures[0] = { card: guardiao, currentLife: 7, maxLife: 7, newlySummoned: true };
        }
        break;

      case 'slide-09':
        // Summon new creature
        if (interactiveStep === 0) {
          playerAvailableEnergy = 5;
        } else {
          playerAvailableEnergy = 3;
          playerCreatures[0] = { card: legionario, currentLife: 4, maxLife: 4, newlySummoned: true };
        }
        break;

      case 'slide-10':
        // Newly summoned vs agile
        playerCreatures[0] = { card: legionario, currentLife: 4, maxLife: 4, newlySummoned: true, canAttack: false };
        playerCreatures[1] = { card: batedora, currentLife: 3, maxLife: 3, canAttack: true };
        break;

      case 'slide-11':
        // Creature life and damage persistence
        if (interactiveStep === 0) {
          playerCreatures[0] = { card: legionario, currentLife: 4, maxLife: 4 };
        } else if (interactiveStep === 1) {
          playerCreatures[0] = { card: legionario, currentLife: 2, maxLife: 4, isDamaged: true };
        } else {
          // Destroyed, slot empty
          playerCreatures[0] = null;
        }
        break;

      case 'slide-12':
        // Attack d6 + modifier
        playerCreatures[0] = { card: gladiador, currentLife: 5, maxLife: 5, canAttack: true };
        opponentCreatures[0] = { card: guardiao, currentLife: 7, maxLife: 7 };
        activeCombat = {
          laneNumber: 1,
          attackerName: 'Gladiador da Arena',
          targetType: 'creature',
          targetName: 'Guardião de Basalto',
          diceRoll: interactiveStep > 0 ? 5 : 4,
          modifier: 2,
          damageValue: interactiveStep > 0 ? 7 : 6,
        };
        break;

      case 'slide-13':
        // Target priority: creature -> structure -> hero
        playerCreatures[0] = { card: gladiador, currentLife: 5, maxLife: 5, canAttack: true };
        if (interactiveStep === 0) {
          opponentCreatures[0] = { card: lobo, currentLife: 2, maxLife: 2, isTargeted: true };
          activeCombat = {
            laneNumber: 1,
            targetType: 'creature',
            attackerName: 'Gladiador (Faixa 1)',
            targetName: 'Lobo de Cinzas (Criatura)',
          };
        } else if (interactiveStep === 1) {
          opponentCreatures[0] = null;
          opponentStructures[0] = { card: condensador, currentLife: 3, maxLife: 3, isTargeted: true };
          activeCombat = {
            laneNumber: 1,
            targetType: 'structure',
            attackerName: 'Gladiador (Faixa 1)',
            targetName: 'Condensador de Éter (Estrutura)',
          };
        } else {
          opponentCreatures[0] = null;
          opponentStructures[0] = null;
          activeCombat = {
            laneNumber: 1,
            targetType: 'hero',
            attackerName: 'Gladiador (Faixa 1)',
            targetName: 'Herói Oponente (Alvo Direto!)',
          };
        }
        break;

      case 'slide-14':
        // Hero intercept
        opponentCreatures[0] = { card: gladiador, currentLife: 5, maxLife: 5 };
        playerCreatures[0] = { card: lobo, currentLife: 2, maxLife: 2 };
        if (interactiveStep > 0) {
          playerHeroLife = 9; // took 3 damage
          activeCombat = {
            laneNumber: 1,
            targetType: 'hero',
            attackerName: 'Gladiador Inimigo',
            isHeroIntercepting: true,
            damageValue: 3,
            targetName: 'Herói Aliado Interceptou o Golpe!',
          };
        } else {
          activeCombat = {
            laneNumber: 1,
            targetType: 'creature',
            attackerName: 'Gladiador Inimigo',
            targetName: 'Lobo de Cinzas (Faixa 1)',
          };
        }
        break;

      case 'slide-15':
        // Instant vs Channelled
        playerChannels[0] = {
          card: escudo,
          isChanneling: interactiveStep === 0,
          isTriggering: interactiveStep > 0,
        };
        break;

      case 'slide-16':
        // Turn end attacks
        playerCreatures[0] = { card: gladiador, currentLife: 5, maxLife: 5, canAttack: true };
        playerCreatures[1] = { card: legionario, currentLife: 4, maxLife: 4, newlySummoned: true };
        opponentCreatures[0] = { card: lobo, currentLife: 2, maxLife: 2, isTargeted: true };
        activeCombat = {
          laneNumber: 1,
          targetType: 'creature',
          attackerName: 'Gladiador (Pronto)',
          targetName: 'Lobo de Cinzas',
          diceRoll: 3,
          damageValue: 3,
        };
        break;

      case 'slide-17':
        // Sample turn connected
        playerStructures[0] = { card: mina, currentLife: 4, maxLife: 4 };
        playerCreatures[0] = { card: legionario, currentLife: 4, maxLife: 4, canAttack: interactiveStep > 0 };
        opponentCreatures[0] = { card: lobo, currentLife: 2, maxLife: 2 };
        if (interactiveStep > 0) {
          playerStructureIncome = 2;
          playerAvailableEnergy = 7;
          activeCombat = {
            laneNumber: 1,
            targetType: 'creature',
            attackerName: 'Legionário',
            targetName: 'Lobo Inimigo',
            diceRoll: 2,
            damageValue: 2,
          };
        }
        break;

      case 'slide-18':
      default:
        // Full recap
        playerStructures[0] = { card: mina, currentLife: 4, maxLife: 4 };
        playerCreatures[0] = { card: gladiador, currentLife: 5, maxLife: 5, canAttack: true };
        playerCreatures[1] = { card: batedora, currentLife: 3, maxLife: 3, canAttack: true };
        playerChannels[0] = { card: escudo, isChanneling: true };
        opponentCreatures[0] = { card: guardiao, currentLife: 7, maxLife: 7 };
        opponentStructures[0] = { card: condensador, currentLife: 3, maxLife: 3 };
        break;
    }

    const playerFieldState: PlayerFieldState = {
      playerId: 'p1',
      playerName: 'Viajante do Limiar',
      isOpponent: false,
      hero: { card: heroCard1, currentLife: playerHeroLife, maxLife: 12 },
      creatures: playerCreatures,
      structures: playerStructures,
      channels: playerChannels,
      baseEnergy: playerBaseEnergy,
      structureIncome: playerStructureIncome,
      availableEnergy: playerAvailableEnergy,
    };

    const opponentFieldState: PlayerFieldState = {
      playerId: 'p2',
      playerName: 'Imperatriz das Eras',
      isOpponent: true,
      hero: { card: heroCard2, currentLife: opponentHeroLife, maxLife: 14 },
      creatures: opponentCreatures,
      structures: opponentStructures,
      channels: opponentChannels,
      baseEnergy: 5,
      structureIncome: 0,
      availableEnergy: 5,
    };

    return {
      playerFieldState,
      opponentFieldState,
      activeCombat,
      playerHandCards,
    };
  };

  const { playerFieldState, opponentFieldState, activeCombat, playerHandCards } = getSceneState();
  const progressPercent = Math.round(((currentSlideIndex + 1) / totalSlides) * 100);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
              FAREL
            </span>
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">TCG 1.1 • ONBOARDING INTERATIVO</span>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-xs font-mono font-bold text-amber-300">
                {String(currentSlideIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
              </span>
              <div className="w-24 sm:w-36 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={handleRestart}
              title="Reiniciar Tutorial"
              className="text-xs px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              🔄 Reiniciar
            </button>

            <button
              onClick={() => setIsNotesOpen(true)}
              className="text-xs px-2.5 py-1 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors font-semibold"
            >
              📋 Notas para o Teste
            </button>
          </div>
        </div>
      </header>

      {/* Main Slide Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-5">
        {/* Slide Explanation Card */}
        <section
          aria-live="polite"
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col gap-2.5 relative"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              PASSO {currentSlide.slideNumber} DE {totalSlides}
            </span>

            {currentSlide.demoAssumption && (
              <span className="text-[11px] font-mono text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-500/30">
                ★ Exemplo de demonstração
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {currentSlide.question}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans max-w-4xl">
            {currentSlide.body}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 mt-1">
            <div className="flex items-center gap-2 text-xs text-amber-300/90 font-medium">
              <span>💡</span>
              <span><strong>Ideia central:</strong> {currentSlide.keyTakeaway}</span>
            </div>

            {currentSlide.interactiveStepLabel && (
              <button
                onClick={() => setInteractiveStep((prev) => (prev + 1) % 3)}
                className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 font-bold flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <span>▶</span>
                <span>{currentSlide.interactiveStepLabel}</span>
              </button>
            )}
          </div>

          {currentSlide.footnote && (
            <div className="text-[11px] text-slate-400 font-mono italic">
              * Nota: {currentSlide.footnote}
            </div>
          )}
        </section>

        {/* Turn Timeline if active for this slide */}
        {currentSlide.showTimeline && (
          <TurnTimeline
            currentPhase={currentSlide.activeTimelinePhase || 'action'}
            interactive={false}
          />
        )}

        {/* Persistent Interactive Battlefield Board */}
        <section aria-label="Tabuleiro interativo do tutorial">
          <BattlefieldBoard
            playerState={playerFieldState}
            opponentState={opponentFieldState}
            highlightFilter={currentSlide.highlight}
            activeCombat={activeCombat}
          />
        </section>

        {/* Hand Tray */}
        <section aria-label="Mão de cartas">
          <HandTray
            cards={playerHandCards}
            availableEnergy={playerFieldState.availableEnergy}
            maxHand={5}
          />
        </section>
      </main>

      {/* Navigation Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/95 sticky bottom-0 z-40 p-3 sm:p-4 shadow-2xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={goToPrev}
            disabled={currentSlideIndex === 0}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              currentSlideIndex === 0
                ? 'bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm'
            }`}
          >
            <span>←</span>
            <span>Anterior</span>
          </button>

          <div className="text-center hidden sm:block text-xs font-mono text-slate-400">
            Navegue com setas do teclado (← / →)
          </div>

          {currentSlideIndex < totalSlides - 1 ? (
            <button
              onClick={goToNext}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <span>Próximo Passo</span>
              <span>→</span>
            </button>
          ) : (
            <button
              onClick={onNavigateToArena}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 animate-bounce"
            >
              <span>Jogar na Arena Completa</span>
              <span>⚔️</span>
            </button>
          )}
        </div>
      </footer>

      {/* Playtest Notes Modal */}
      <PlaytestNotesModal
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
      />
    </div>
  );
};
