'use client';

import React, { useState, useEffect } from 'react';
import {
  createGame,
  startGame,
  endTurn,
  playCard,
  resolveAttack,
  setHeroDefenseMode,
} from '../game/engine';
import { GameState } from '../types/gameState';
import { CardType, EntityStatus, GameStatus } from '../types/enums';
import { FarelCard } from '../types/farelCard';
import { ActionSpotlight, ActionSpotlightPayload } from '../components/ActionSpotlight';
import { FarelPlayingCard } from '../components/FarelPlayingCard';

// Componentes Farel 3.0
import { SidebarNavigation, SidebarTab } from '../components/v3/SidebarNavigation';
import { OpponentZoneV3 } from '../components/v3/OpponentZoneV3';
import { TacticalBattlefieldGrid } from '../components/v3/TacticalBattlefieldGrid';
import { TacticalRulesHud } from '../components/v3/TacticalRulesHud';
import { HandTrayV3 } from '../components/v3/HandTrayV3';
import { TurnActionButton } from '../components/v3/TurnActionButton';
import { HeroAvatarCard } from '../components/v3/HeroAvatarCard';
import { EnergyGemsTracker } from '../components/v3/EnergyGemsTracker';

import galleryManifest from '../public/assets/farel/art/gallery-manifest.json';

// Helper de normalização para o formato visual FarelCard
function toFarelCard(c: any): FarelCard {
  if (!c) {
    return {
      id: 'empty',
      name: 'Vazio',
      type: 'creature',
      energyCost: 0,
      life: null,
      rulesText: '',
      keywords: [],
      artDirection: '',
      demoOnly: true,
    };
  }

  const rawType = (c.type || '').toString().toLowerCase();
  const idStr = (c.cardId || c.id || '').toString();

  const normalizedType =
    rawType.includes('hero') || idStr.startsWith('HERO')
      ? 'hero'
      : rawType.includes('gen') || rawType.includes('struct') || idStr.startsWith('GEN')
      ? 'generator'
      : rawType.includes('channel') || idStr.startsWith('CHN')
      ? 'channelled_spell'
      : rawType.includes('spell') || idStr.startsWith('SPL')
      ? 'spell'
      : 'creature';

  return {
    id: c.cardId || c.id || 'card',
    instanceId: c.instanceId,
    name: c.name || 'Carta Arcana',
    type: normalizedType,
    energyCost: c.energyCost ?? 0,
    life: c.health ?? c.maxHealth ?? c.life ?? null,
    rulesText:
      c.rulesText ||
      c.description ||
      (c.energyBonus || c.incomePerTurn ? `Gera +${c.energyBonus || c.incomePerTurn} de Energia por turno.` : ''),
    keywords: c.keywords || [],
    canAttackOnSummon: c.canAttackOnEntry ?? c.canAttackOnSummon ?? null,
    incomePerTurn: c.energyBonus ?? c.incomePerTurn ?? null,
    effectKind: c.effectKind || '',
    trigger: c.trigger || null,
    artDirection: c.artDirection || '',
    artUrl: c.artUrl || (idStr ? `/assets/farel/art/cards/${idStr}.webp` : undefined),
    galleryUrl: c.galleryUrl || (idStr ? `/assets/farel/art/gallery/${idStr}.webp` : undefined),
    demoOnly: true,
  };
}

export default function FarelV3Page() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeTab, setActiveTab] = useState<SidebarTab>('battlefield');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<'hand' | 'board' | null>(null);
  const [selectedLaneIndex, setSelectedLaneIndex] = useState<number | null>(null);
  const [inspectedCard, setInspectedCard] = useState<FarelCard | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [spotlightPayload, setSpotlightPayload] = useState<ActionSpotlightPayload | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Inicializa partida local imediata com heróis padrão 30 HP
  const initLocalMatch = () => {
    setActionError(null);
    setSpotlightPayload(null);
    setSelectedCardId(null);
    setSelectedSource(null);
    setSelectedLaneIndex(null);

    const p1 = { id: 'p1', name: 'Alice (Viajante do Limiar)', heroId: 'HERO-001' };
    const p2 = { id: 'p2', name: 'Bob (Imperatriz das Eras)', heroId: 'HERO-002' };
    let state = createGame('farel_v3_match', [p1, p2]);
    state = startGame(state);
    setGameState(state);
    setInspectedCard(toFarelCard(state.players['p1'].hero));
  };

  useEffect(() => {
    initLocalMatch();
  }, []);

  if (!gameState) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#070b0e] text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono text-[#8297a4]">Iniciando Arena FAREL TCG 3.0...</p>
        </div>
      </div>
    );
  }

  const activeId = gameState.activePlayerId;
  const isP1Active = activeId === 'p1';
  const p1 = gameState.players['p1'];
  const p2 = gameState.players['p2'];
  const defendingPlayerId = isP1Active ? 'p2' : 'p1';
  const defendingPlayer = gameState.players[defendingPlayerId];
  const isGameOver = gameState.status === GameStatus.FINISHED;
  const winner = isGameOver ? (p1.hero.health > 0 ? p1.name : p2.name) : null;

  // Carta selecionada na mão do jogador ativo
  const selectedCardInHand = isP1Active
    ? p1.hand.find((c) => c.instanceId === selectedCardId)
    : p2.hand.find((c) => c.instanceId === selectedCardId);

  // Faixas livres para invocação do jogador humano
  const freeLanes = gameState.board.lanes
    .map((lane, idx) => (lane.p1Creature ? null : idx))
    .filter((idx): idx is number => idx !== null);

  // Selecionar carta da mão
  const handleSelectHandCard = (card: any) => {
    if (selectedCardId === card.instanceId) {
      setSelectedCardId(null);
      setSelectedSource(null);
    } else {
      setSelectedCardId(card.instanceId);
      setSelectedSource('hand');
      setSelectedLaneIndex(null);
      setInspectedCard(toFarelCard(card));
    }
  };

  // Selecionar carta do tabuleiro
  const handleSelectBoardCard = (card: any, source: 'hand' | 'board', laneIndex?: number) => {
    setSelectedCardId(card.instanceId || card.id);
    setSelectedSource(source);
    if (typeof laneIndex === 'number') {
      setSelectedLaneIndex(laneIndex);
    }
    setInspectedCard(toFarelCard(card));
  };

  // =========================================================================
  // EXECUÇÃO DE ATAQUE COM ANIMAÇÃO ACTION SPOTLIGHT
  // =========================================================================
  const handleDeclareAttack = (laneIndex: number) => {
    try {
      setActionError(null);
      const lane = gameState.board.lanes[laneIndex];
      const attackingCreature = isP1Active ? lane.p1Creature : lane.p2Creature;
      const defendingCreature = isP1Active ? lane.p2Creature : lane.p1Creature;

      if (!attackingCreature) return;

      const newState = resolveAttack(gameState, activeId, laneIndex);

      const lastDiceLog = newState.logs.filter((l) => l.type === 'DICE_ROLLED').pop();
      const lastDamageLog = newState.logs.filter((l) => l.type === 'DAMAGE_DEALT').pop();
      const diceValue = lastDiceLog?.value || 1;
      const attackMod = attackingCreature.attackModifier || 0;
      const damageDealt = lastDamageLog?.value || diceValue + attackMod;

      const targetTitle = defendingCreature
        ? defendingCreature.name
        : `${defendingPlayer.name} (Herói)`;

      setSpotlightPayload({
        id: `atk_${Date.now()}`,
        type: 'COMBAT_ATTACK',
        sourceCard: toFarelCard(attackingCreature),
        targetName: targetTitle,
        diceRoll: {
          value: diceValue,
          modifier: attackMod,
          total: diceValue + attackMod,
        },
        damageDealt: damageDealt,
        title: `${attackingCreature.name} ataca na Faixa ${laneIndex + 1}!`,
      });

      setGameState(newState);
      setSelectedSource(null);
      setSelectedLaneIndex(null);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // =========================================================================
  // INVOCAR CRIATURA EM UMA FAIXA DO TABULEIRO
  // =========================================================================
  const handleSummonToLane = (laneIndex: number) => {
    if (!selectedCardInHand) return;
    try {
      setActionError(null);
      const cardToSummon = selectedCardInHand;
      const newState = playCard(gameState, activeId, selectedCardInHand.instanceId, laneIndex);
      setGameState(newState);
      setSelectedCardId(null);
      setSelectedSource(null);

      setSpotlightPayload({
        id: `summon_${Date.now()}`,
        type: 'COMBAT_ATTACK',
        sourceCard: toFarelCard(cardToSummon),
        title: `${cardToSummon.name} invocado na Faixa ${laneIndex + 1}!`,
        effectDescription: cardToSummon.rulesText || cardToSummon.description,
      });
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // =========================================================================
  // CONSTRUIR ESTRUTURA NO BACKLINE
  // =========================================================================
  const handleBuildStructure = (slotIndex: number) => {
    if (!selectedCardInHand) return;
    try {
      setActionError(null);
      const structCard = selectedCardInHand;
      const newState = playCard(gameState, activeId, selectedCardInHand.instanceId, slotIndex);
      setGameState(newState);
      setSelectedCardId(null);
      setSelectedSource(null);

      setSpotlightPayload({
        id: `str_${Date.now()}`,
        type: 'STRUCTURE_BUILT',
        sourceCard: toFarelCard(structCard),
        effectDescription: `Gera +${structCard.energyBonus || 1} de Energia permanente por turno.`,
        title: `Estrutura Erguida: ${structCard.name}`,
      });
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // =========================================================================
  // LANÇAR MAGIA INSTANTÂNEA
  // =========================================================================
  const handleCastInstantSpell = () => {
    if (!selectedCardInHand || selectedCardInHand.type !== CardType.SPELL) return;
    try {
      setActionError(null);
      const spellCard = selectedCardInHand;
      const newState = playCard(gameState, activeId, selectedCardInHand.instanceId, 0);
      setGameState(newState);
      setSelectedCardId(null);
      setSelectedSource(null);

      setSpotlightPayload({
        id: `spell_${Date.now()}`,
        type: 'SPELL_CAST',
        sourceCard: toFarelCard(spellCard),
        effectDescription: spellCard.rulesText || spellCard.description || 'Efeito arcano resolvido.',
        title: `Feitiço Conjurado: ${spellCard.name}`,
      });
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // =========================================================================
  // FINALIZAR TURNO
  // =========================================================================
  const handleEndTurn = () => {
    try {
      setActionError(null);
      setSelectedCardId(null);
      setSelectedSource(null);
      setSelectedLaneIndex(null);

      const newState = endTurn(gameState, activeId);
      setGameState(newState);

      // Atualiza o inspetor para o herói do próximo jogador
      const nextActiveId = newState.activePlayerId;
      setInspectedCard(toFarelCard(newState.players[nextActiveId].hero));

      // Se for a vez da IA (p2), executa turno automatizado com leve delay
      if (nextActiveId === 'p2' && newState.status !== GameStatus.FINISHED) {
        setIsAiThinking(true);
        setTimeout(() => {
          runAiTurn(newState);
        }, 1200);
      }
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // Inteligência Artificial do Oponente (Bob)
  const runAiTurn = (currentState: GameState) => {
    try {
      let state = currentState;
      const bob = state.players['p2'];

      // 1. IA tenta jogar criatura ou estrutura se tiver energia
      const playableCreature = bob.hand.find(
        (c) => c.type === CardType.CREATURE && c.energyCost <= bob.currentEnergy
      );
      if (playableCreature) {
        // Encontra primeira faixa vazia para o oponente
        const emptyLaneIdx = state.board.lanes.findIndex((l) => !l.p2Creature);
        if (emptyLaneIdx !== -1) {
          state = playCard(state, 'p2', playableCreature.instanceId, emptyLaneIdx);
        }
      }

      // 2. IA ataca com criaturas prontas
      for (let i = 0; i < state.board.lanes.length; i++) {
        const creature = state.board.lanes[i].p2Creature;
        if (creature && creature.status === EntityStatus.READY) {
          state = resolveAttack(state, 'p2', i);
        }
      }

      // 3. IA encerra o turno e devolve para Alice (p1)
      state = endTurn(state, 'p2');
      setGameState(state);
      setInspectedCard(toFarelCard(state.players['p1'].hero));
    } catch (err: any) {
      console.warn('AI turn warning:', err.message);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Alternar modo de defesa do herói
  const handleToggleHeroDefense = (playerId: string) => {
    const currentMode = gameState.players[playerId].heroDefenseMode;
    const newMode = currentMode === 'ALWAYS' ? 'AUTO' : 'ALWAYS';
    const newState = setHeroDefenseMode(gameState, playerId, newMode as any);
    setGameState(newState);
  };

  // Logs formatados para o HUD
  const hudLogs = gameState.logs.map((log: any) => {
    if (log.type === 'ATTACK_RESOLVED') return `${log.sourceId || 'Atacante'} atacou ${log.targetId || 'alvo'}`;
    if (log.type === 'DICE_ROLLED') return `Dado D6 rolou: ${log.value}`;
    if (log.type === 'DAMAGE_DEALT') return `Impacto de ${log.value} dano!`;
    if (log.type === 'CARD_PLAYED') return `Carta invocada com sucesso`;
    if (log.type === 'TURN_STARTED') return `Início de Turno`;
    return log.message || log.type;
  });

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#070b10] text-[#f2eee5] font-sans selection:bg-[#d4af37]/30 relative">
      {/* OVERLAY DE RUNAS E AMBIENTAÇÃO DE MASMORRA ARCANA */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, #d4af37 1px, transparent 1px), linear-gradient(rgba(180,200,210,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(180,200,210,.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* ACTION SPOTLIGHT CINEMATOGRÁFICO DE AÇÃO */}
      <ActionSpotlight
        payload={spotlightPayload}
        onDismiss={() => setSpotlightPayload(null)}
        autoDismissMs={1600}
      />

      {/* 1. BARRA LATERAL ESQUERDA (NAVEGAÇÃO TÁTICA 1.1 / 3.0) */}
      <SidebarNavigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        handCount={p1.hand.length}
        deckCount={p1.deck.length}
        graveyardCount={p1.graveyard.length}
        turn={gameState.turn}
        onResetMatch={initLocalMatch}
      />

      {/* 2. ÁREA CENTRAL: OPONENT ZONE + 2.5D ARENA GRID + HAND TRAY */}
      <main className="flex-1 flex flex-col justify-between overflow-hidden relative z-10 px-4 py-2">
        {/* BANNER DE ERRO SE HOUVER */}
        {actionError && (
          <div className="bg-red-950/80 border border-red-500/80 text-red-200 px-4 py-2 rounded-xl text-xs flex items-center justify-between shadow-lg mb-2">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-red-300 hover:text-white font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* TOP ZONE: OPONENTE (IMPERATRIZ DAS ERAS - 30 HP) */}
        <OpponentZoneV3
          hero={p2.hero}
          energy={p2.currentEnergy}
          maxEnergy={5}
          handCount={p2.hand.length}
          deckCount={p2.deck.length}
          graveyardCount={p2.graveyard.length}
          isActiveTurn={!isP1Active}
        />

        {/* CENTRO: ARENA DE BATALHA TÁTICA 2.5D (5 LINHAS X 6 COLUNAS) */}
        <div className="flex-1 flex items-center justify-center py-2 overflow-hidden">
          <TacticalBattlefieldGrid
            lanes={gameState.board.lanes}
            playerStructures={gameState.board.backline['p1'].structures}
            opponentStructures={gameState.board.backline['p2'].structures}
            selectedCard={selectedCardInHand || inspectedCard}
            selectedSource={selectedSource}
            selectedLaneIndex={selectedLaneIndex}
            onSelectCard={handleSelectBoardCard}
            onSummonToLane={handleSummonToLane}
            onBuildToSlot={handleBuildStructure}
            onAttackLane={handleDeclareAttack}
            isPlayerTurn={isP1Active}
            playerEnergy={p1.currentEnergy}
          />
        </div>

        {/* BOTTOM ZONE: MÃO DO JOGADOR + BARRA DE AÇÃO COM AMPULHETA DOURADA */}
        <div className="flex flex-col gap-2">
          {/* Mão de Cartas com Stack 3D de Deck e Descarte */}
          <HandTrayV3
            hand={p1.hand}
            selectedCard={selectedCardInHand}
            playerEnergy={p1.currentEnergy}
            onSelectCard={handleSelectHandCard}
            deckCount={p1.deck.length}
            graveyardCount={p1.graveyard.length}
          />

          {/* BARRA DE AÇÃO INFERIOR: VOCÊ (30 HP) + ENERGIA + FINALIZAR TURNO */}
          <div className="flex items-center justify-between px-6 py-2 bg-gradient-to-r from-[#091016]/95 via-[#0e1720]/95 to-[#080d12]/95 border-t border-[#3a2c16]/50 rounded-2xl shadow-2xl">
            {/* HERÓI DO JOGADOR (VIAJANTE DO LIMIAR - 30 HP) */}
            <HeroAvatarCard
              isPlayer={true}
              name={p1.hero.name}
              title="Você - Viajante do Limiar"
              health={p1.hero.health}
              maxHealth={p1.hero.maxHealth || 30}
              armor={p1.hero.armor || 0}
              isActiveTurn={isP1Active}
              defenseMode={p1.heroDefenseMode}
              onToggleDefenseMode={() => handleToggleHeroDefense('p1')}
              avatarUrl="/assets/farel/art/cards/HERO-001.webp"
            />

            {/* ENERGIA COM GEMAS CIANO */}
            <EnergyGemsTracker
              currentEnergy={p1.currentEnergy}
              maxEnergy={5}
              label="Sua Energia"
            />

            {/* BOTÃO DOURADO DE AMPULHETA: FINALIZAR TURNO */}
            <div className="flex items-center gap-3">
              {isAiThinking && (
                <span className="text-xs font-mono text-cyan-300 animate-pulse">
                  🔮 Oponente pensando...
                </span>
              )}
              <TurnActionButton
                isPlayerTurn={isP1Active && !isAiThinking && !isGameOver}
                onEndTurn={handleEndTurn}
                isLoading={isAiThinking}
              />
            </div>
          </div>
        </div>
      </main>

      {/* 3. BARRA LATERAL DIREITA: TACTICAL HUD (FASE, INSPETOR E REGRAS RÁPIDAS) */}
      <TacticalRulesHud
        turn={gameState.turn}
        isPlayerTurn={isP1Active}
        selectedCard={inspectedCard || selectedCardInHand}
        selectedSource={selectedSource}
        playerEnergy={p1.currentEnergy}
        actionLogs={hudLogs}
        onSummonLane={handleSummonToLane}
        onCastSpell={handleCastInstantSpell}
        onAttackLane={() => {
          if (typeof selectedLaneIndex === 'number') {
            handleDeclareAttack(selectedLaneIndex);
          }
        }}
        onCloseSelection={() => {
          setSelectedCardId(null);
          setSelectedSource(null);
          setInspectedCard(null);
        }}
        freeLanes={freeLanes}
      />

      {/* MODAL DA GALERIA ÉPICA COMPLETA SE A ABA 'LIBRARY' ESTIVER ATIVA */}
      {activeTab === 'library' && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-[#0b1016] border border-[#d4af37]/60 rounded-3xl max-w-6xl w-full p-6 text-[#d8e2ec] shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#3a2c16]">
              <div>
                <h3 className="font-serif font-black text-xl text-[#f7e8c4] flex items-center gap-2">
                  <span>✧</span> Galeria de Cartas de Fantasia Épica (17 Cartas Oficiais)
                </h3>
                <p className="text-xs text-[#8fa7bd]">
                  Artes fatiadas em alta resolução e integradas ao motor oficial Farel TCG.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('battlefield')}
                className="text-[#9a8661] hover:text-[#f7e8c4] text-xl font-mono font-bold px-3 py-1 bg-[#1a140a] rounded-lg border border-[#3a2c16]"
              >
                ✕ Voltar à Batalha
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-2">
              {galleryManifest.cards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => {
                    setInspectedCard(toFarelCard(card));
                    setActiveTab('battlefield');
                  }}
                  className="group cursor-pointer rounded-2xl bg-[#0e1620] border border-[#2b3a4a] hover:border-[#d4af37] p-2.5 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                >
                  <div className="w-full aspect-[5/7] rounded-xl overflow-hidden mb-2 bg-[#060a0e] relative border border-[#1f2b38]">
                    <img
                      src={card.galleryUrl}
                      alt={card.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1 right-1 font-mono font-bold text-[10px] bg-black/80 px-1.5 py-0.5 rounded text-cyan-300 border border-cyan-800">
                      {(card as any).energyCost !== undefined ? `${(card as any).energyCost}⚡` : '✦'}
                    </div>
                  </div>
                  <h4 className="font-serif font-bold text-xs text-[#f1e6cf] truncate w-full text-center">
                    {card.name}
                  </h4>
                  <span className="text-[10px] uppercase font-mono text-[#8fa7bd]">
                    {card.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE FIM DE PARTIDA (VITÓRIA / DERROTA) */}
      {isGameOver && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1620] border-2 border-[#d4af37] rounded-3xl max-w-md w-full p-8 text-center shadow-[0_0_50px_rgba(212,175,55,0.4)] animate-scaleUp">
            <div className="text-5xl mb-4">{p1.hero.health > 0 ? '🏆' : '💀'}</div>
            <h2 className="font-serif font-black text-2xl text-[#f7e8c4] mb-2">
              {p1.hero.health > 0 ? 'Vitória Gloriosa!' : 'Derrota na Arena'}
            </h2>
            <p className="text-sm text-[#8fa7bd] mb-6">
              {p1.hero.health > 0
                ? 'O Viajante do Limiar derrotou a Imperatriz das Eras!'
                : 'A Imperatriz das Eras consumiu os pontos de vida do seu Herói.'}
            </p>
            <button
              onClick={initLocalMatch}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa8022] text-[#1a1205] font-serif font-bold text-sm tracking-wider uppercase shadow-lg hover:brightness-110 transition-all"
            >
              Jogar Novamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
