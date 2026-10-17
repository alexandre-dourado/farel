'use client';

import React from 'react';
import { FarelCard } from '../../types/farelCard';
import { LifeOrb } from './LifeOrb';

interface CombatLogEntry {
  id: string;
  turn: number;
  message: string;
  type: 'damage' | 'summon' | 'energy' | 'phase' | 'info';
  timestamp: string;
}

interface DuelCardInspectorProps {
  card: FarelCard | null;
  lastDieRoll: number | null;
  attackModifier: number;
  isRolling: boolean;
  onRollDie?: () => void;
  combatLog: CombatLogEntry[];
}

export const DuelCardInspector: React.FC<DuelCardInspectorProps> = ({
  card,
  lastDieRoll,
  attackModifier,
  isRolling,
  onRollDie,
  combatLog
}) => {
  const getCardFrameUrl = (type?: string) => {
    switch (type) {
      case 'hero': return '/assets/farel/cards/template-hero.webp';
      case 'creature': return '/assets/farel/cards/template-creature.webp';
      case 'generator': return '/assets/farel/cards/template-structure.webp';
      case 'spell': return '/assets/farel/cards/template-spell-instant.webp';
      case 'channelled_spell': return '/assets/farel/cards/template-spell-channel.webp';
      default: return '/assets/farel/cards/card-back.webp';
    }
  };

  const getArtUrl = (cardObj?: FarelCard | null) => {
    if (!cardObj) return '/assets/farel/illustrations/heroi_1.webp';
    if (cardObj.artUrl) return cardObj.artUrl;
    switch (cardObj.type) {
      case 'hero': return `/assets/farel/illustrations/${cardObj.id}.webp`;
      case 'creature': return `/assets/farel/illustrations/${cardObj.id}.webp`;
      case 'generator': return `/assets/farel/illustrations/${cardObj.id}.webp`;
      case 'spell': return `/assets/farel/illustrations/${cardObj.id}.webp`;
      case 'channelled_spell': return `/assets/farel/illustrations/${cardObj.id}.webp`;
      default: return '/assets/farel/art/creature.webp';
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'hero': return '#f2c66d';
      case 'creature': return '#68d391';
      case 'generator': return '#90cdf4';
      case 'spell': return '#f687b3';
      case 'channelled_spell': return '#d6bcfa';
      default: return '#d4af70';
    }
  };

  const getTypeName = (type?: string) => {
    switch (type) {
      case 'hero': return 'HERÓI · ELO MORTAL';
      case 'creature': return 'CRIATURA TÁTICA';
      case 'generator': return 'ESTRUTURA GERADORA';
      case 'spell': return 'MAGIA INSTANTÂNEA';
      case 'channelled_spell': return 'MAGIA CANALIZADA';
      default: return 'CARTA';
    }
  };

  const totalCalculatedDamage = lastDieRoll !== null ? Math.max(0, lastDieRoll + attackModifier) : null;

  return (
    <aside className="w-[330px] min-w-[310px] max-w-[350px] h-full flex flex-col bg-[#081016] border-r border-[#d4af70]/20 p-3 select-none overflow-hidden justify-between shadow-2xl z-20">
      {/* 1. Header do Inspecionador */}
      <div className="flex items-center justify-between border-b border-[#d4af70]/25 pb-1.5 mb-1.5">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full border border-[#d4af70] text-[#d4af70] flex items-center justify-center text-xs font-serif shadow-[0_0_8px_rgba(212,175,112,0.4)]">
            ✧
          </span>
          <h2 className="text-[11px] font-serif uppercase tracking-widest text-[#ebd8b5] font-bold">
            Inspecionador PS1
          </h2>
        </div>
        <span className="text-[10px] text-[#7ea0b3] font-mono tracking-wider font-bold">
          {card ? card.id : 'NENHUMA'}
        </span>
      </div>

      {/* 2. Visualizador da Carta em Grande Escala (Ampliado para 260px) */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative my-1">
        {card ? (
          <div
            className="ps1-card w-[255px] max-h-[360px] transition-transform duration-300 hover:scale-[1.02] relative"
            style={{
              backgroundImage: `url('${getCardFrameUrl(card.type)}')`
            }}
          >
            {/* Janela de Arte com a Ilustração Épica */}
            <div className="art-window" style={{ left: '7%', top: '8%', width: '86%', height: '44%' }}>
              <img
                src={getArtUrl(card)}
                alt={card.name}
                loading="eager"
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/farel/art/creature.webp';
                }}
              />
            </div>

            {/* Custo de Energia */}
            <div className="cost-orb" title={`Custo de Energia: ${card.energyCost}`}>
              {card.energyCost}
            </div>

            {/* Nome da Carta */}
            <div className="card-name-text" style={{ top: '53.5%', height: '8%' }}>
              <span className="truncate text-[13px] font-serif font-black text-[#fff5df] tracking-tight">
                {card.name}
              </span>
            </div>

            {/* Linha de Tipo */}
            <div
              className="card-type-text text-[9px]"
              style={{ top: '61.5%', color: getTypeColor(card.type) }}
            >
              {getTypeName(card.type)}
            </div>

            {/* Texto de Regras */}
            <div className="card-rules-text text-[9.5px] leading-tight" style={{ top: '68.5%', height: '21%' }}>
              {card.rulesText}
            </div>

            {/* Orbe de Sangue no Rodapé da Carta */}
            {card.life !== null && card.life !== undefined && (
              <div className="absolute right-[4%] bottom-[2%] z-20 scale-95 origin-bottom-right">
                <LifeOrb
                  currentHp={card.life}
                  maxHp={card.life}
                  size="md"
                  showMax={false}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="w-[240px] aspect-[198/279] rounded-xl border border-dashed border-[#293b46] flex flex-col items-center justify-center text-center p-4 bg-[#0a141b]/80">
            <div className="text-4xl text-[#4a6b80] mb-2 animate-pulse">🃏</div>
            <p className="text-xs text-[#8297a4] font-serif">Passe o cursor sobre qualquer carta da mão ou do campo</p>
          </div>
        )}
      </div>

      {/* 3. Área de Rolagem do Dado D6 de Combate */}
      <div className="bg-[#0e1b24] border border-[#2a3c49] rounded-lg p-2 my-1 shadow-inner">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#d4af70] flex items-center gap-1.5">
            <span>🎲</span> Combate Tático d6
          </span>
          <span className="text-[9px] font-mono text-[#8eb0c2]">
            Mod: {attackModifier >= 0 ? `+${attackModifier}` : attackModifier}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Caixa do Dado 3D */}
          <div
            className={`w-10 h-10 rounded-lg bg-gradient-to-tr from-[#1b2f3d] to-[#2b4b5e] border-2 border-[#d4af70] shadow-[0_0_12px_rgba(212,175,112,0.3)] flex items-center justify-center text-xl font-bold font-mono text-[#fff4d1] ${
              isRolling ? 'die-rolling' : ''
            }`}
          >
            {lastDieRoll !== null ? lastDieRoll : '-'}
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="text-[11px] text-[#c9d8df]">
              Dano: <strong className="text-[#f7dca4]">{totalCalculatedDamage !== null ? `${totalCalculatedDamage} Impacto` : 'Aguardando'}</strong>
            </div>
            <div className="text-[9px] text-[#6f8592] font-mono">
              d6 puro {lastDieRoll ?? 0} {attackModifier >= 0 ? `+ ${attackModifier}` : `- ${Math.abs(attackModifier)}`}
            </div>
          </div>

          {onRollDie && (
            <button
              onClick={onRollDie}
              disabled={isRolling}
              type="button"
              className="px-2.5 py-1 text-xs font-serif font-bold text-[#091116] bg-gradient-to-b from-[#f2d08a] to-[#d4af70] hover:brightness-110 active:scale-95 rounded border border-[#ffdca8] shadow transition-all disabled:opacity-50"
            >
              Rolar
            </button>
          )}
        </div>
      </div>

      {/* 4. Histórico Tático */}
      <div className="h-24 bg-[#060c10] border border-[#1d2d38] rounded-lg p-1.5 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between pb-1 border-b border-[#1f313d] text-[9px] uppercase tracking-wider text-[#7992a0]">
          <span>Histórico de Combate</span>
          <span className="text-[#43d9c4] font-mono">{combatLog.length} ações</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 mt-1 pr-1 text-[9.5px] font-mono leading-tight scrollbar-thin">
          {combatLog.length === 0 ? (
            <div className="text-[#4d6370] italic text-center py-3">Aguardando ações...</div>
          ) : (
            combatLog.slice().reverse().map((entry) => (
              <div
                key={entry.id}
                className={`p-1 rounded ${
                  entry.type === 'damage'
                    ? 'text-[#ff918b] bg-[#331114]/40 border-l-2 border-[#ff6b62]'
                    : entry.type === 'summon'
                    ? 'text-[#96e6a1] bg-[#102919]/40 border-l-2 border-[#43d9c4]'
                    : entry.type === 'phase'
                    ? 'text-[#f5d996] bg-[#36270e]/40 border-l-2 border-[#d4af70]'
                    : 'text-[#9db7c4]'
                }`}
              >
                <span className="text-[#5b7382] mr-1">T{entry.turn}</span>
                {entry.message}
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};
