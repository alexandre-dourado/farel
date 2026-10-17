'use client';

import React, { useState, useEffect } from 'react';
import { createGame, startGame, endTurn, playCard, resolveAttack, setHeroDefenseMode } from '../game/engine';
import { GameState } from '../types/gameState';
import { Card, Creature, Structure } from '../types/entities';
import { CardType, EntityStatus, GameStatus } from '../types/enums';
import { FarelCard } from '../types/farelCard';
import { FarelPlayingCard } from '../components/FarelPlayingCard';
import { CardInspector } from '../components/CardInspector';
import { ActionSpotlight, ActionSpotlightPayload } from '../components/ActionSpotlight';
import galleryManifest from '../public/assets/farel/art/gallery-manifest.json';

// Helper de conversão para o formato visual FarelCard
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
      demoOnly: true
    };
  }

  const rawType = (c.type || '').toString().toLowerCase();
  const idStr = (c.cardId || c.id || '').toString();

  const normalizedType = 
    rawType.includes('hero') || idStr.startsWith('HERO') ? 'hero'
    : rawType.includes('gen') || rawType.includes('struct') || idStr.startsWith('GEN') ? 'generator'
    : rawType.includes('channel') || idStr.startsWith('CHN') ? 'channelled_spell'
    : rawType.includes('spell') || idStr.startsWith('SPL') ? 'spell'
    : 'creature';

  return {
    id: c.cardId || c.id || 'card',
    name: c.name || 'Carta',
    type: normalizedType,
    energyCost: c.energyCost ?? 0,
    life: c.health ?? c.maxHealth ?? c.life ?? null,
    rulesText: c.rulesText || c.description || (c.incomePerTurn ? `Gera +${c.incomePerTurn} de Energia por turno.` : ''),
    keywords: c.keywords || [],
    canAttackOnSummon: c.canAttackOnEntry ?? c.canAttackOnSummon ?? null,
    incomePerTurn: c.energyBonus ?? c.incomePerTurn ?? null,
    effectKind: c.effectKind || '',
    trigger: c.trigger || null,
    artDirection: c.artDirection || '',
    artUrl: c.artUrl || (idStr ? `/assets/farel/art/cards/${idStr}.webp` : undefined),
    galleryUrl: c.galleryUrl || (idStr ? `/assets/farel/art/gallery/${idStr}.webp` : undefined),
    demoOnly: true
  };
}

export default function FarelMVPPage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [inspectedCard, setInspectedCard] = useState<FarelCard | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [spotlightPayload, setSpotlightPayload] = useState<ActionSpotlightPayload | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Inicializa partida local imediata
  const initLocalMatch = () => {
    setActionError(null);
    setSpotlightPayload(null);
    setSelectedCardId(null);
    const p1 = { id: 'p1', name: 'Alice (Viajante do Limiar)', heroId: 'HERO-001' };
    const p2 = { id: 'p2', name: 'Bob (Imperatriz das Eras)', heroId: 'HERO-002' };
    let state = createGame('local_match_1', [p1, p2]);
    state = startGame(state);
    setGameState(state);
    // Inicia com o herói de Alice selecionado no inspetor
    setInspectedCard(toFarelCard(state.players['p1'].hero));
  };

  useEffect(() => {
    initLocalMatch();
  }, []);

  if (!gameState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#071017] text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#d4af70] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono text-[#8297a4]">Preparando Tabuleiro Farel...</p>
        </div>
      </div>
    );
  }

  const activeId = gameState.activePlayerId;
  const isP1Active = activeId === 'p1';
  const p1 = gameState.players['p1'];
  const p2 = gameState.players['p2'];
  const activePlayer = gameState.players[activeId];
  const defendingPlayerId = isP1Active ? 'p2' : 'p1';
  const defendingPlayer = gameState.players[defendingPlayerId];
  const isGameOver = gameState.status === GameStatus.FINISHED;
  const winner = isGameOver 
    ? (p1.hero.health > 0 ? p1.name : p2.name) 
    : null;

  // Carta selecionada na mão do jogador ativo
  const selectedCard = activePlayer.hand.find(c => c.instanceId === selectedCardId);

  // Faixas livres para invocação
  const freeLanes = gameState.board.lanes
    .map((lane, idx) => {
      const creature = isP1Active ? lane.p1Creature : lane.p2Creature;
      return creature ? null : idx;
    })
    .filter((idx): idx is number => idx !== null);

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

      // Pega o último evento de rolagem do log para alimentar o Spotlight
      const lastDiceLog = newState.logs.filter(l => l.type === 'DICE_ROLLED').pop();
      const lastDamageLog = newState.logs.filter(l => l.type === 'DAMAGE_DEALT').pop();
      const diceValue = lastDiceLog?.value || 1;
      const attackMod = attackingCreature.attackModifier || 0;
      const damageDealt = lastDamageLog?.value || (diceValue + attackMod);

      const targetTitle = defendingCreature 
        ? defendingCreature.name 
        : `${defendingPlayer.name} (Herói)`;

      // Dispara o efeito cinematográfico de destaque da carta
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
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // =========================================================================
  // CLIQUE EM UMA FAIXA DO TABULEIRO (INVOCAÇÃO OU ATAQUE)
  // =========================================================================
  const handleLaneClick = (laneIndex: number) => {
    if (!selectedCard) {
      // Se não há carta na mão selecionada, inspeciona a criatura da faixa
      const lane = gameState.board.lanes[laneIndex];
      const myCreature = isP1Active ? lane.p1Creature : lane.p2Creature;
      const oppCreature = isP1Active ? lane.p2Creature : lane.p1Creature;
      const target = myCreature || oppCreature;
      if (target) {
        setInspectedCard(toFarelCard(target));
      }
      return;
    }

    if (selectedCard.type === CardType.CREATURE) {
      try {
        setActionError(null);
        const cardToSummon = selectedCard;
        const newState = playCard(gameState, activeId, selectedCard.instanceId, laneIndex);
        setGameState(newState);
        setSelectedCardId(null);

        // Spotlight para a invocação da criatura
        setSpotlightPayload({
          id: `summon_${Date.now()}`,
          type: 'COMBAT_ATTACK',
          sourceCard: toFarelCard(cardToSummon),
          title: `${cardToSummon.name} entrou na Faixa ${laneIndex + 1}!`,
          effectDescription: cardToSummon.rulesText || cardToSummon.description,
        });
      } catch (err: any) {
        setActionError(err.message);
      }
    } else if (selectedCard.type === CardType.SPELL && selectedCard.effectKind === 'direct_damage') {
      try {
        setActionError(null);
        const spellCard = selectedCard;
        const newState = playCard(gameState, activeId, selectedCard.instanceId, laneIndex);
        setGameState(newState);
        setSelectedCardId(null);

        setSpotlightPayload({
          id: `spell_dmg_${Date.now()}`,
          type: 'SPELL_CAST',
          sourceCard: toFarelCard(spellCard),
          effectDescription: `Disparou dano direto na Faixa ${laneIndex + 1}!`,
          title: `Feitiço Conjurado: ${spellCard.name}`,
        });
      } catch (err: any) {
        setActionError(err.message);
      }
    }
  };

  // =========================================================================
  // CLIQUE NO BACKLINE (ESTRUTURAS OU CANALIZAÇÃO)
  // =========================================================================
  const handleBacklineClick = (slotIndex: number, isStructure: boolean) => {
    if (!selectedCard) return;

    if (isStructure && selectedCard.type === CardType.STRUCTURE) {
      try {
        setActionError(null);
        const structCard = selectedCard;
        const newState = playCard(gameState, activeId, selectedCard.instanceId, slotIndex);
        setGameState(newState);
        setSelectedCardId(null);

        setSpotlightPayload({
          id: `str_${Date.now()}`,
          type: 'STRUCTURE_BUILT',
          sourceCard: toFarelCard(structCard),
          effectDescription: `Gera +${structCard.energyBonus || 1} de Energia por turno no Backline.`,
          title: `Estrutura Erguida: ${structCard.name}`,
        });
      } catch (err: any) {
        setActionError(err.message);
      }
    } else if (!isStructure && selectedCard.type === CardType.CHANNELLED_SPELL) {
      try {
        setActionError(null);
        const chCard = selectedCard;
        const newState = playCard(gameState, activeId, selectedCard.instanceId, slotIndex);
        setGameState(newState);
        setSelectedCardId(null);

        setSpotlightPayload({
          id: `chn_${Date.now()}`,
          type: 'CHANNEL_TRIGGERED',
          sourceCard: toFarelCard(chCard),
          effectDescription: chCard.rulesText || 'Permanece oculta aguardando condição de ativação.',
          title: `Canalização Armada: ${chCard.name}`,
        });
      } catch (err: any) {
        setActionError(err.message);
      }
    }
  };

  // =========================================================================
  // JOGAR MAGIA INSTANTÂNEA
  // =========================================================================
  const handleCastInstantSpell = () => {
    if (!selectedCard || selectedCard.type !== CardType.SPELL) return;
    try {
      setActionError(null);
      const spellCard = selectedCard;
      const newState = playCard(gameState, activeId, selectedCard.instanceId, 0);
      setGameState(newState);
      setSelectedCardId(null);

      setSpotlightPayload({
        id: `spell_${Date.now()}`,
        type: 'SPELL_CAST',
        sourceCard: toFarelCard(spellCard),
        effectDescription: spellCard.rulesText || spellCard.description || 'Efeito de feitiço resolvido.',
        title: `Magia Instantânea: ${spellCard.name}`,
      });
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // =========================================================================
  // PASSAR TURNO
  // =========================================================================
  const handleEndTurn = () => {
    try {
      setActionError(null);
      setSelectedCardId(null);
      const newState = endTurn(gameState, activeId);
      setGameState(newState);
      // Atualiza o inspetor para o herói do novo jogador ativo
      const nextActiveId = newState.activePlayerId;
      setInspectedCard(toFarelCard(newState.players[nextActiveId].hero));
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // Alternar modo de defesa do herói
  const handleToggleHeroDefense = (playerId: string) => {
    const currentMode = gameState.players[playerId].heroDefenseMode;
    const newMode = currentMode === 'ALWAYS' ? 'AUTO' : 'ALWAYS';
    const newState = setHeroDefenseMode(gameState, playerId, newMode);
    setGameState(newState);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#071017] text-[#f2eee5] font-sans selection:bg-[#d4af70]/30 relative overflow-x-hidden">
      
      {/* OVERLAY DE GRID SUTIL */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: 'linear-gradient(rgba(180,200,210,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(180,200,210,.1) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
        }}
      />

      {/* ACTION SPOTLIGHT CINEMATOGRÁFICO */}
      <ActionSpotlight 
        payload={spotlightPayload} 
        onDismiss={() => setSpotlightPayload(null)} 
        autoDismissMs={1300}
      />

      {/* TOPBAR NO PADRÃO OFICIAL */}
      <header className="sticky top-0 z-30 bg-[#0d1820]/95 backdrop-blur-md border-b border-[#bea470]/25 px-5 py-2.5 flex flex-wrap items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        
        {/* LOGO & MARCA */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border border-[#76613e] flex items-center justify-center text-[#d4af70] text-xl font-serif shadow-[inset_0_0_12px_rgba(212,175,112,0.2)]">
            ✧
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg tracking-[0.12em] text-[#ead4aa]">FAREL</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded border border-[#bea470]/40 bg-[#bea470]/10 text-[#d4af70] font-mono tracking-wider">
                MVP 1.1
              </span>
            </div>
            <p className="text-[10px] text-[#8297a4] tracking-wide">Trading Card Game · Cartas Oficiais e Action Spotlight</p>
          </div>
        </div>

        {/* INDICADOR CENTRAL DE TURNO & VEZ */}
        <div className="flex items-center gap-4 bg-[#071017]/90 px-4 py-1.5 rounded-xl border border-[#bea470]/30 shadow-inner">
          <div className="text-xs font-mono">
            <span className="text-[#8297a4]">TURNO: </span>
            <span className="text-[#d4af70] font-bold text-sm">{gameState.turn}</span>
          </div>
          <div className="h-4 w-px bg-[#263c47]" />
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af70] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#d4af70]"></span>
            </span>
            <span className="text-xs font-medium text-[#cad5dc]">
              Vez de: <strong className="text-[#f4d7a1]">{activePlayer.name}</strong>
            </span>
          </div>
        </div>

        {/* CONTROLES RÁPIDOS */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGalleryOpen(true)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#182a34] hover:bg-[#d4af70] hover:text-[#071017] text-[#ead4aa] border border-[#bea470]/40 transition flex items-center gap-1.5 shadow"
            title="Abrir Galeria de Fantasia Épica (17 Cartas)"
          >
            <span>🖼️</span>
            <span>Galeria Épica (17)</span>
          </button>
          <a
            href="/play"
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-[#d4af70] to-[#b38a49] hover:brightness-110 text-[#071017] shadow-md transition flex items-center gap-1.5 border border-[#fff6dc]"
          >
            <span>⚔️</span>
            <span>Arena Forbidden Memories</span>
          </a>
          <button
            onClick={initLocalMatch}
            className="px-3 py-1.5 text-xs rounded-lg bg-[#111f28] hover:bg-[#182a34] text-[#bcd1db] border border-[#2a3b44] transition hover:border-[#d4af70]"
          >
            🔄 Reiniciar Partida
          </button>
          <button
            onClick={handleEndTurn}
            disabled={isGameOver}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-[#76613e] to-[#d4af70] hover:brightness-110 text-[#071017] shadow-md transition flex items-center gap-1.5 border border-[#d9b76e]"
          >
            <span>Passar Turno</span>
            <span>➔</span>
          </button>
        </div>
      </header>

      {/* ALERTA DE ERRO TEMPORÁRIO */}
      {actionError && (
        <div className="bg-[#7e342f]/30 border-b border-[#dc9a7a]/40 text-[#f8d7da] px-4 py-2 text-xs flex items-center justify-between animate-fadeIn z-20">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-[#dc9a7a] hover:text-white font-bold text-sm">×</button>
        </div>
      )}

      {/* ÁREA PRINCIPAL: TABULEIRO TÁTICO + CARD INSPECTOR LATERAL */}
      <main className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-5 p-4 max-w-[1700px] mx-auto w-full relative z-10">
        
        {/* ============================================================== */}
        {/* COLUNA ESQUERDA & CENTRAL: TABULEIRO COMPLETO (3 COLUNAS)     */}
        {/* ============================================================== */}
        <div className="xl:col-span-3 flex flex-col gap-4">

          {/* ============================================================== */}
          {/* LADO SUPERIOR: JOGADOR 2 (BOB - IMPERATRIZ DAS ERAS)          */}
          {/* ============================================================== */}
          <section 
            aria-label="Zona do Jogador 2"
            className={`rounded-2xl p-3 border transition-all ${
              !isP1Active 
                ? 'bg-[#0d1820]/90 border-[#d4af70]/50 shadow-[0_0_25px_rgba(212,175,112,0.1)]' 
                : 'bg-[#0d1820]/40 border-[#263c47]/50'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              
              {/* HERÓI P2 (CLIQUE ABRE NO INSPETOR) */}
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => setInspectedCard(toFarelCard(p2.hero))}
                  className="cursor-pointer transition-transform hover:scale-105"
                  title="Inspecionar Herói P2"
                >
                  <FarelPlayingCard 
                    card={toFarelCard(p2.hero)} 
                    size="micro" 
                    currentHealth={p2.hero.health}
                  />
                </div>
                <div>
                  <div className="text-xs font-serif font-bold text-[#ead4aa] flex items-center gap-2">
                    {p2.name}
                    {!isP1Active && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#d4af70] text-[#071017] font-mono font-black">
                        ATIVO
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] font-mono text-[#8297a4] mt-0.5">
                    <span className="text-[#e06a62] font-bold">❤️ {p2.hero.health} / {p2.hero.maxHealth} HP</span>
                    <span>•</span>
                    <span className="text-[#65d7d7] font-bold">⚡ {p2.currentEnergy} / {p2.maxEnergyCap} E</span>
                    <span>•</span>
                    <span>🃏 Deck: {p2.deck.length}</span>
                  </div>
                </div>
              </div>

              {/* MODO DE DEFESA DO HERÓI P2 */}
              <label className="flex items-center gap-2 text-xs font-mono bg-[#071017]/90 px-2.5 py-1.5 rounded-lg border border-[#263c47] cursor-pointer hover:border-[#d4af70]">
                <input 
                  type="checkbox" 
                  checked={p2.heroDefenseMode === 'ALWAYS'} 
                  onChange={() => handleToggleHeroDefense('p2')}
                  className="rounded text-[#d4af70] focus:ring-0"
                />
                <span className="text-[11px] text-[#cad5dc]">
                  Defesa Herói: <strong className={p2.heroDefenseMode === 'ALWAYS' ? 'text-[#d4af70]' : 'text-[#8297a4]'}>{p2.heroDefenseMode}</strong>
                </span>
              </label>

              {/* BACKLINE P2: 5 ESTRUTURAS + 3 CANAIS */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#8297a4] uppercase mr-1">Backline:</span>
                
                {/* 5 Estruturas */}
                {gameState.board.backline['p2'].structures.map((struct, idx) => (
                  <div
                    key={`p2_str_${idx}`}
                    onClick={() => {
                      if (struct) setInspectedCard(toFarelCard(struct));
                      if (!isP1Active) handleBacklineClick(idx, true);
                    }}
                    className={`w-10 h-14 rounded border flex flex-col items-center justify-center text-[10px] cursor-pointer transition ${
                      struct
                        ? 'bg-[#0f2420] border-[#65d7d7]/60 text-[#65d7d7] shadow-sm'
                        : (!isP1Active && selectedCard?.type === CardType.STRUCTURE)
                        ? 'border-dashed border-[#65d7d7] bg-[#65d7d7]/10 animate-pulse'
                        : 'border-dashed border-[#263c47] bg-[#071017]/50 text-[#8297a4]'
                    }`}
                    title={struct ? `${struct.name} (+${struct.energyBonus} E)` : `Slot Estrutura ${idx + 1}`}
                  >
                    {struct ? (
                      <>
                        <span className="text-sm">🏛️</span>
                        <span className="text-[7.5px] font-mono font-bold">+{struct.energyBonus}E</span>
                      </>
                    ) : (
                      <span className="text-[8px] font-mono text-[#8297a4]">{idx + 1}</span>
                    )}
                  </div>
                ))}

                <div className="w-px h-6 bg-[#263c47] mx-1" />

                {/* 3 Canais */}
                {gameState.board.backline['p2'].channeling.map((ch, idx) => (
                  <div
                    key={`p2_ch_${idx}`}
                    onClick={() => {
                      if (ch?.card) setInspectedCard(toFarelCard(ch.card));
                      if (!isP1Active) handleBacklineClick(idx, false);
                    }}
                    className={`w-10 h-14 rounded border flex flex-col items-center justify-center text-[10px] cursor-pointer transition ${
                      ch
                        ? 'bg-[#1b1428] border-[#c58be7]/60 text-[#c58be7] shadow-sm'
                        : (!isP1Active && selectedCard?.type === CardType.CHANNELLED_SPELL)
                        ? 'border-dashed border-[#c58be7] bg-[#c58be7]/10 animate-pulse'
                        : 'border-dashed border-[#263c47] bg-[#071017]/50 text-[#8297a4]'
                    }`}
                    title={ch?.card ? ch.card.name : `Slot Canal ${idx + 1}`}
                  >
                    {ch ? <span className="text-sm">🔮</span> : <span className="text-[8px] font-mono text-[#8297a4]">C{idx + 1}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* BANDEJA DE MÃO P2 (COM CARTAS FARELPLAYINGCARD MINI) */}
            <div className="flex items-center gap-2.5 overflow-x-auto pt-2.5 border-t border-[#bea470]/20 scrollbar-thin">
              <span className="text-[10px] font-mono text-[#8297a4] whitespace-nowrap">MÃO P2 ({p2.hand.length}):</span>
              {p2.hand.map((card) => {
                const isSelected = selectedCardId === card.instanceId;
                const canAfford = !isP1Active && p2.currentEnergy >= card.energyCost;
                return (
                  <div
                    key={card.instanceId}
                    onClick={() => {
                      if (!isP1Active) {
                        setSelectedCardId(isSelected ? null : card.instanceId);
                      }
                      setInspectedCard(toFarelCard(card));
                    }}
                    className="flex-shrink-0 cursor-pointer"
                  >
                    <FarelPlayingCard 
                      card={toFarelCard(card)} 
                      size="mini"
                      isSelected={isSelected}
                      className={!canAfford && !isP1Active ? 'opacity-60' : ''}
                    />
                  </div>
                );
              })}
            </div>
          </section>


          {/* ============================================================== */}
          {/* BATTLEFIELD CENTRAL: AS 5 FAIXAS (LANES) COM CARTAS REAIS      */}
          {/* ============================================================== */}
          <section 
            aria-label="Zona de Combate das 5 Faixas"
            className="bg-[#0d1820]/80 rounded-2xl p-4 border border-[#bea470]/25 shadow-2xl flex flex-col gap-3"
          >
            <div className="text-center text-xs font-mono text-[#8297a4] font-bold uppercase tracking-wider flex items-center justify-center gap-3">
              <span className="h-px w-20 bg-[#263c47]" />
              <span className="text-[#d4af70]">ZONA DE COMBATE — 5 FAIXAS TÁTICAS</span>
              <span className="h-px w-20 bg-[#263c47]" />
            </div>

            <div className="grid grid-cols-5 gap-3.5">
              {gameState.board.lanes.map((lane, laneIdx) => {
                const p2Creature = lane.p2Creature;
                const p1Creature = lane.p1Creature;
                const activeCreature = isP1Active ? p1Creature : p2Creature;
                const canActiveAttack = activeCreature 
                  && activeCreature.status === EntityStatus.READY
                  && (activeCreature.summonedOnTurn !== gameState.turn || activeCreature.canAttackOnEntry);

                const isLaneFreeForActive = isP1Active ? !p1Creature : !p2Creature;
                const isTargetForCreatureSummon = selectedCard?.type === CardType.CREATURE && isLaneFreeForActive;

                return (
                  <div 
                    key={laneIdx} 
                    className="flex flex-col bg-[#071017]/85 border border-[#263c47] rounded-xl p-2 items-center justify-between min-h-[380px] shadow-inner transition hover:border-[#bea470]/50"
                  >
                    {/* CRIATURA JOGADOR 2 (TOPO DA FAIXA) */}
                    <div 
                      onClick={() => {
                        if (p2Creature) setInspectedCard(toFarelCard(p2Creature));
                        if (!isP1Active) handleLaneClick(laneIdx);
                      }}
                      className="w-full flex items-center justify-center cursor-pointer min-h-[160px]"
                    >
                      {p2Creature ? (
                        <FarelPlayingCard 
                          card={toFarelCard(p2Creature)} 
                          size="mini"
                          currentHealth={p2Creature.health}
                          attackModifier={p2Creature.attackModifier}
                          isExhausted={p2Creature.status === EntityStatus.EXHAUSTED}
                          isNewlySummoned={p2Creature.summonedOnTurn === gameState.turn && !p2Creature.canAttackOnEntry}
                          badgeText={p2Creature.canAttackOnEntry ? 'Ágil' : undefined}
                        />
                      ) : (
                        <div className={`w-[114px] aspect-[198/279] rounded-[6px] border flex flex-col items-center justify-center text-center p-2 transition ${
                          isTargetForCreatureSummon && !isP1Active
                            ? 'border-[#65d7d7] bg-[#65d7d7]/10 animate-pulse text-[#65d7d7]'
                            : 'border-dashed border-[#263c47] bg-[#0d1820]/30 text-[#8297a4]'
                        }`}>
                          <span className="text-[10px] font-mono">Faixa Vazia</span>
                          {isTargetForCreatureSummon && !isP1Active && (
                            <span className="text-[9px] font-bold font-mono mt-1">Invocar</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* SEPARADOR CENTRAL DA FAIXA + BOTÃO DE ATAQUE COM d6 */}
                    <div className="my-2 flex flex-col items-center gap-1.5 w-full">
                      <span className="text-[10px] font-mono text-[#8297a4] font-bold tracking-tight">
                        FAIXA {laneIdx + 1}
                      </span>

                      {/* Botão de Ataque se a criatura ativa estiver pronta */}
                      {canActiveAttack && !isGameOver && (
                        <button
                          onClick={() => handleDeclareAttack(laneIdx)}
                          className="w-full py-1.5 px-2 rounded-lg bg-gradient-to-r from-[#e06a62] to-[#b34038] hover:brightness-110 text-white font-bold text-[10px] shadow-lg transition animate-bounce flex items-center justify-center gap-1.5 border border-[#dc9a7a]"
                          title="Declarar Ataque com d6 nesta Faixa"
                        >
                          <span>⚔️</span>
                          <span>ATACAR COM d6</span>
                        </button>
                      )}
                    </div>

                    {/* CRIATURA JOGADOR 1 (BASE DA FAIXA) */}
                    <div 
                      onClick={() => {
                        if (p1Creature) setInspectedCard(toFarelCard(p1Creature));
                        if (isP1Active) handleLaneClick(laneIdx);
                      }}
                      className="w-full flex items-center justify-center cursor-pointer min-h-[160px]"
                    >
                      {p1Creature ? (
                        <FarelPlayingCard 
                          card={toFarelCard(p1Creature)} 
                          size="mini"
                          currentHealth={p1Creature.health}
                          attackModifier={p1Creature.attackModifier}
                          isExhausted={p1Creature.status === EntityStatus.EXHAUSTED}
                          isNewlySummoned={p1Creature.summonedOnTurn === gameState.turn && !p1Creature.canAttackOnEntry}
                          badgeText={p1Creature.canAttackOnEntry ? 'Ágil' : undefined}
                        />
                      ) : (
                        <div className={`w-[114px] aspect-[198/279] rounded-[6px] border flex flex-col items-center justify-center text-center p-2 transition ${
                          isTargetForCreatureSummon && isP1Active
                            ? 'border-[#65d7d7] bg-[#65d7d7]/10 animate-pulse text-[#65d7d7]'
                            : 'border-dashed border-[#263c47] bg-[#0d1820]/30 text-[#8297a4]'
                        }`}>
                          <span className="text-[10px] font-mono">Faixa Vazia</span>
                          {isTargetForCreatureSummon && isP1Active && (
                            <span className="text-[9px] font-bold font-mono mt-1">Invocar</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>


          {/* ============================================================== */}
          {/* LADO INFERIOR: JOGADOR 1 (ALICE - VIAJANTE DO LIMIAR)          */}
          {/* ============================================================== */}
          <section 
            aria-label="Zona do Jogador 1"
            className={`rounded-2xl p-3 border transition-all ${
              isP1Active 
                ? 'bg-[#0d1820]/90 border-[#d4af70]/50 shadow-[0_0_25px_rgba(212,175,112,0.1)]' 
                : 'bg-[#0d1820]/40 border-[#263c47]/50'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              
              {/* HERÓI P1 (CLIQUE ABRE NO INSPETOR) */}
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => setInspectedCard(toFarelCard(p1.hero))}
                  className="cursor-pointer transition-transform hover:scale-105"
                  title="Inspecionar Herói P1"
                >
                  <FarelPlayingCard 
                    card={toFarelCard(p1.hero)} 
                    size="micro" 
                    currentHealth={p1.hero.health}
                  />
                </div>
                <div>
                  <div className="text-xs font-serif font-bold text-[#ead4aa] flex items-center gap-2">
                    {p1.name}
                    {isP1Active && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#d4af70] text-[#071017] font-mono font-black">
                        ATIVO
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] font-mono text-[#8297a4] mt-0.5">
                    <span className="text-[#e06a62] font-bold">❤️ {p1.hero.health} / {p1.hero.maxHealth} HP</span>
                    <span>•</span>
                    <span className="text-[#65d7d7] font-bold">⚡ {p1.currentEnergy} / {p1.maxEnergyCap} E</span>
                    <span>•</span>
                    <span>🃏 Deck: {p1.deck.length}</span>
                  </div>
                </div>
              </div>

              {/* MODO DE DEFESA DO HERÓI P1 */}
              <label className="flex items-center gap-2 text-xs font-mono bg-[#071017]/90 px-2.5 py-1.5 rounded-lg border border-[#263c47] cursor-pointer hover:border-[#d4af70]">
                <input 
                  type="checkbox" 
                  checked={p1.heroDefenseMode === 'ALWAYS'} 
                  onChange={() => handleToggleHeroDefense('p1')}
                  className="rounded text-[#d4af70] focus:ring-0"
                />
                <span className="text-[11px] text-[#cad5dc]">
                  Defesa Herói: <strong className={p1.heroDefenseMode === 'ALWAYS' ? 'text-[#d4af70]' : 'text-[#8297a4]'}>{p1.heroDefenseMode}</strong>
                </span>
              </label>

              {/* BACKLINE P1: 5 ESTRUTURAS + 3 CANAIS */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#8297a4] uppercase mr-1">Backline:</span>
                
                {/* 5 Estruturas */}
                {gameState.board.backline['p1'].structures.map((struct, idx) => (
                  <div
                    key={`p1_str_${idx}`}
                    onClick={() => {
                      if (struct) setInspectedCard(toFarelCard(struct));
                      if (isP1Active) handleBacklineClick(idx, true);
                    }}
                    className={`w-10 h-14 rounded border flex flex-col items-center justify-center text-[10px] cursor-pointer transition ${
                      struct
                        ? 'bg-[#0f2420] border-[#65d7d7]/60 text-[#65d7d7] shadow-sm'
                        : (isP1Active && selectedCard?.type === CardType.STRUCTURE)
                        ? 'border-dashed border-[#65d7d7] bg-[#65d7d7]/10 animate-pulse'
                        : 'border-dashed border-[#263c47] bg-[#071017]/50 text-[#8297a4]'
                    }`}
                    title={struct ? `${struct.name} (+${struct.energyBonus} E)` : `Slot Estrutura ${idx + 1}`}
                  >
                    {struct ? (
                      <>
                        <span className="text-sm">🏛️</span>
                        <span className="text-[7.5px] font-mono font-bold">+{struct.energyBonus}E</span>
                      </>
                    ) : (
                      <span className="text-[8px] font-mono text-[#8297a4]">{idx + 1}</span>
                    )}
                  </div>
                ))}

                <div className="w-px h-6 bg-[#263c47] mx-1" />

                {/* 3 Canais */}
                {gameState.board.backline['p1'].channeling.map((ch, idx) => (
                  <div
                    key={`p1_ch_${idx}`}
                    onClick={() => {
                      if (ch?.card) setInspectedCard(toFarelCard(ch.card));
                      if (isP1Active) handleBacklineClick(idx, false);
                    }}
                    className={`w-10 h-14 rounded border flex flex-col items-center justify-center text-[10px] cursor-pointer transition ${
                      ch
                        ? 'bg-[#1b1428] border-[#c58be7]/60 text-[#c58be7] shadow-sm'
                        : (isP1Active && selectedCard?.type === CardType.CHANNELLED_SPELL)
                        ? 'border-dashed border-[#c58be7] bg-[#c58be7]/10 animate-pulse'
                        : 'border-dashed border-[#263c47] bg-[#071017]/50 text-[#8297a4]'
                    }`}
                    title={ch?.card ? ch.card.name : `Slot Canal ${idx + 1}`}
                  >
                    {ch ? <span className="text-sm">🔮</span> : <span className="text-[8px] font-mono text-[#8297a4]">C{idx + 1}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* BANDEJA DE MÃO P1 (COM CARTAS FARELPLAYINGCARD MINI) */}
            <div className="flex items-center gap-2.5 overflow-x-auto pt-2.5 border-t border-[#bea470]/20 scrollbar-thin">
              <span className="text-[10px] font-mono text-[#8297a4] whitespace-nowrap">MÃO P1 ({p1.hand.length}):</span>
              {p1.hand.map((card) => {
                const isSelected = selectedCardId === card.instanceId;
                const canAfford = isP1Active && p1.currentEnergy >= card.energyCost;
                return (
                  <div
                    key={card.instanceId}
                    onClick={() => {
                      if (isP1Active) {
                        setSelectedCardId(isSelected ? null : card.instanceId);
                      }
                      setInspectedCard(toFarelCard(card));
                    }}
                    className="flex-shrink-0 cursor-pointer"
                  >
                    <FarelPlayingCard 
                      card={toFarelCard(card)} 
                      size="mini"
                      isSelected={isSelected}
                      className={!canAfford && isP1Active ? 'opacity-60' : ''}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        </div>


        {/* ============================================================== */}
        {/* COLUNA DIREITA: CARD INSPECTOR LATERAL + LOG DE COMBATE        */}
        {/* ============================================================== */}
        <aside aria-label="Painel Lateral de Inspeção e Log" className="flex flex-col gap-4">
          
          {/* PAINEL DE INSPEÇÃO DA CARTA SELECIONADA */}
          <CardInspector 
            card={inspectedCard}
            onClose={() => setInspectedCard(null)}
            isCardInHand={Boolean(selectedCard && activePlayer.hand.some(c => c.instanceId === selectedCard.instanceId))}
            isCardOnBoard={false}
            canAfford={selectedCard ? activePlayer.currentEnergy >= selectedCard.energyCost : true}
            freeLanes={freeLanes}
            onCastSpell={handleCastInstantSpell}
            onSummonLane={(laneIdx) => handleLaneClick(laneIdx)}
            onBacklineBuild={(slotIdx) => handleBacklineClick(slotIdx, true)}
          />

          {/* HISTÓRICO / LOG DE COMBATE ESTILIZADO */}
          <div className="bg-[#0d1820]/90 rounded-2xl p-4 border border-[#bea470]/25 shadow-lg flex-1 flex flex-col min-h-[300px]">
            <h3 className="text-xs font-mono font-bold text-[#8297a4] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="text-[#d4af70] flex items-center gap-1.5">
                <span>📜</span>
                <span>REGISTRO DE COMBATE</span>
              </span>
              <span className="text-[10px] text-[#8297a4] font-mono">{gameState.logs.length} eventos</span>
            </h3>
            
            <div className="flex-1 overflow-y-auto max-h-[360px] flex flex-col gap-1.5 pr-1 font-mono text-[11px] scrollbar-thin">
              {gameState.logs.slice().reverse().map((log, idx) => (
                <div key={idx} className="p-2 rounded bg-[#071017]/80 border border-[#263c47] text-[#bcd1db] leading-relaxed">
                  <span className="text-[10px] text-[#8297a4] mr-2">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span>{log.message || log.type}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* MODAL DA GALERIA ÉPICA (17 CARTAS DA PRANCHA) */}
      {isGalleryOpen && (
        <div 
          onClick={() => setIsGalleryOpen(false)}
          className="fixed inset-0 z-50 bg-[#071017]/90 backdrop-blur-md flex flex-col p-4 sm:p-6 overflow-hidden animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-7xl w-full mx-auto flex-1 flex flex-col bg-[#0d1820] border border-[#bea470]/40 rounded-2xl p-5 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden"
          >
            {/* Topo da Galeria */}
            <div className="flex items-center justify-between border-b border-[#bea470]/25 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border border-[#d4af70] flex items-center justify-center text-[#d4af70] font-serif text-lg shadow-[inset_0_0_10px_rgba(212,175,112,0.2)]">
                  ✧
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-[#ead4aa] tracking-wide">
                    Galeria de Cartas de Fantasia Épica
                  </h2>
                  <p className="text-xs text-[#8297a4]">
                    17 ilustrações originais fatiadas da prancha oficial · Clique em qualquer carta para inspecionar no tabuleiro
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-700 hover:border-[#d4af70] text-slate-400 hover:text-white flex items-center justify-center text-sm transition"
                title="Fechar Galeria"
              >
                ✕
              </button>
            </div>

            {/* Grade de Cartas da Galeria */}
            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-2 scrollbar-thin">
              {galleryManifest.cards.map((cardItem) => (
                <div
                  key={cardItem.id}
                  onClick={() => {
                    setInspectedCard({
                      id: cardItem.id,
                      name: cardItem.name,
                      type: cardItem.type as any,
                      energyCost: 0,
                      life: null,
                      rulesText: `Ilustração oficial de ${cardItem.name} extraída de "${cardItem.originalLabel}".`,
                      keywords: [cardItem.type, cardItem.originalLabel],
                      artDirection: cardItem.originalLabel,
                      artUrl: cardItem.artUrl,
                      galleryUrl: cardItem.galleryUrl,
                      demoOnly: true,
                    });
                    setIsGalleryOpen(false);
                  }}
                  className="group flex flex-col items-center bg-[#071017]/85 border border-[#263c47] hover:border-[#d4af70] rounded-xl p-2 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(212,175,112,0.25)]"
                >
                  <div className="w-full aspect-[236/319] rounded-lg overflow-hidden bg-black/40 mb-2 border border-slate-800 group-hover:border-[#d4af70]/60">
                    <img
                      src={cardItem.galleryUrl}
                      alt={cardItem.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#d4af70] uppercase tracking-wider font-bold truncate w-full text-center">
                    {cardItem.originalLabel}
                  </span>
                  <span className="text-xs font-serif text-[#cad5dc] truncate w-full text-center mt-0.5">
                    {cardItem.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE FIM DE PARTIDA */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d1820] border-2 border-[#d4af70] rounded-2xl p-8 max-w-md w-full text-center shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col items-center gap-4 animate-scaleUp">
            <span className="text-5xl">🏆</span>
            <h2 className="text-2xl font-serif font-bold text-[#ead4aa] uppercase tracking-wider">
              Partida Concluída!
            </h2>
            <p className="text-[#bcd1db] text-sm leading-relaxed">
              O elo vital do herói adversário foi quebrado.
              <br />
              <strong className="text-[#fff6dc] text-lg font-serif">{winner}</strong> venceu a disputa tática!
            </p>
            <div className="w-full h-px bg-[#263c47] my-1" />
            <div className="text-xs font-mono text-[#8297a4]">Total de turnos completados: {gameState.turn}</div>
            <button
              onClick={initLocalMatch}
              className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#76613e] to-[#d4af70] hover:brightness-110 text-[#071017] font-bold text-sm shadow-lg shadow-[#d4af70]/20 transition"
            >
              Iniciar Nova Partida
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
