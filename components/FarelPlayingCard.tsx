'use client';

import React from 'react';
import { FarelCard } from '../types/farelCard';

export type CardScale = 'micro' | 'mini' | 'normal' | 'large' | 'spotlight';

export interface FarelPlayingCardProps {
  card: FarelCard | any;
  size?: CardScale;
  showBack?: boolean;
  isSelected?: boolean;
  isReady?: boolean;
  isExhausted?: boolean;
  isNewlySummoned?: boolean;
  isTargetable?: boolean;
  currentHealth?: number | null;
  attackModifier?: number;
  badgeText?: string;
  onClick?: () => void;
  className?: string;
}

const TEMPLATE_MAP: Record<string, string> = {
  hero: '/assets/farel/cards/template-hero.webp',
  creature: '/assets/farel/cards/template-creature.webp',
  generator: '/assets/farel/cards/template-structure.webp',
  structure: '/assets/farel/cards/template-structure.webp',
  spell: '/assets/farel/cards/template-spell-instant.webp',
  channelled_spell: '/assets/farel/cards/template-spell-channel.webp',
  channel: '/assets/farel/cards/template-spell-channel.webp',
};

const ART_MAP: Record<string, string> = {
  hero: '/assets/farel/art/hero.webp',
  creature: '/assets/farel/art/creature.webp',
  generator: '/assets/farel/art/structure.webp',
  structure: '/assets/farel/art/structure.webp',
  spell: '/assets/farel/art/spell.webp',
  channelled_spell: '/assets/farel/art/channel.webp',
  channel: '/assets/farel/art/channel.webp',
};

const CARD_ART_MAP: Record<string, string> = {
  'HERO-001': '/assets/farel/art/cards/HERO-001.webp',
  'HERO-002': '/assets/farel/art/cards/HERO-002.webp',
  'CRE-001': '/assets/farel/art/cards/CRE-001.webp',
  'CRE-002': '/assets/farel/art/cards/CRE-002.webp',
  'CRE-003': '/assets/farel/art/cards/CRE-003.webp',
  'CRE-004': '/assets/farel/art/cards/CRE-004.webp',
  'CRE-006': '/assets/farel/art/cards/CRE-006.webp',
  'GEN-001': '/assets/farel/art/cards/GEN-001.webp',
  'GEN-002': '/assets/farel/art/cards/GEN-002.webp',
  'GEN-003': '/assets/farel/art/cards/GEN-003.webp',
  'GEN-004': '/assets/farel/art/cards/GEN-004.webp',
  'GEN-005': '/assets/farel/art/cards/GEN-005.webp',
  'SPL-001': '/assets/farel/art/cards/SPL-001.webp',
  'SPL-002': '/assets/farel/art/cards/SPL-002.webp',
  'SPL-003': '/assets/farel/art/cards/SPL-003.webp',
  'CHN-001': '/assets/farel/art/cards/CHN-001.webp',
  'CHN-002': '/assets/farel/art/cards/CHN-002.webp',
};

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  hero: { label: 'HERÓI', color: '#d4af70' },
  creature: { label: 'CRIATURA', color: '#e06a62' },
  generator: { label: 'ESTRUTURA', color: '#65d7d7' },
  structure: { label: 'ESTRUTURA', color: '#65d7d7' },
  spell: { label: 'MAGIA', color: '#c58be7' },
  channelled_spell: { label: 'CANALIZADA', color: '#60c78d' },
  channel: { label: 'CANALIZADA', color: '#60c78d' },
};

// Configurações de dimensão e tipografia proporcional para cada escala
const SIZE_CONFIG: Record<CardScale, {
  containerClass: string;
  costTextClass: string;
  nameTextClass: string;
  typeTextClass: string;
  rulesTextClass: string;
  footerTextClass: string;
  lifeTextClass: string;
}> = {
  micro: {
    containerClass: 'w-[76px] aspect-[198/279]',
    costTextClass: 'text-[9px]',
    nameTextClass: 'text-[6.5px]',
    typeTextClass: 'text-[5.5px]',
    rulesTextClass: 'text-[5.5px] leading-[1.05]',
    footerTextClass: 'text-[5px]',
    lifeTextClass: 'text-[7.5px]',
  },
  mini: {
    containerClass: 'w-[114px] aspect-[198/279]',
    costTextClass: 'text-[11px]',
    nameTextClass: 'text-[8.5px]',
    typeTextClass: 'text-[7px]',
    rulesTextClass: 'text-[7px] leading-[1.15]',
    footerTextClass: 'text-[6.5px]',
    lifeTextClass: 'text-[9.5px]',
  },
  normal: {
    containerClass: 'w-[200px] aspect-[198/279]',
    costTextClass: 'text-[16px]',
    nameTextClass: 'text-[13px]',
    typeTextClass: 'text-[10px]',
    rulesTextClass: 'text-[9.5px] leading-[1.25]',
    footerTextClass: 'text-[8.5px]',
    lifeTextClass: 'text-[13px]',
  },
  large: {
    containerClass: 'w-[280px] aspect-[198/279]',
    costTextClass: 'text-[22px]',
    nameTextClass: 'text-[17px]',
    typeTextClass: 'text-[12px]',
    rulesTextClass: 'text-[12px] leading-[1.3]',
    footerTextClass: 'text-[10px]',
    lifeTextClass: 'text-[16px]',
  },
  spotlight: {
    containerClass: 'w-[320px] sm:w-[360px] aspect-[198/279]',
    costTextClass: 'text-[26px]',
    nameTextClass: 'text-[20px]',
    typeTextClass: 'text-[14px]',
    rulesTextClass: 'text-[13.5px] leading-[1.35]',
    footerTextClass: 'text-[11.5px]',
    lifeTextClass: 'text-[19px]',
  },
};

export const FarelPlayingCard: React.FC<FarelPlayingCardProps> = ({
  card,
  size = 'normal',
  showBack = false,
  isSelected = false,
  isReady = false,
  isExhausted = false,
  isNewlySummoned = false,
  isTargetable = false,
  currentHealth,
  attackModifier,
  badgeText,
  onClick,
  className = '',
}) => {
  if (!card) return null;

  const rawType = (card.type || 'creature').toString().toLowerCase();
  const normalizedType = 
    rawType.includes('hero') ? 'hero'
    : rawType.includes('gen') || rawType.includes('struct') ? 'generator'
    : rawType.includes('channel') ? 'channelled_spell'
    : rawType.includes('spell') ? 'spell'
    : 'creature';

  const typeConfig = TYPE_CONFIG[normalizedType] || TYPE_CONFIG['creature'];
  const templatePath = TEMPLATE_MAP[normalizedType] || TEMPLATE_MAP['creature'];
  const cardId = (card.cardId || card.id || '').toString();
  const artPath = card.artUrl || card.customArt || CARD_ART_MAP[cardId] || ART_MAP[normalizedType] || ART_MAP['creature'];
  const sizeStyles = SIZE_CONFIG[size] || SIZE_CONFIG['normal'];

  const displayLife = currentHealth !== undefined && currentHealth !== null 
    ? currentHealth 
    : (card.life ?? card.health ?? card.maxHealth ?? null);

  const displayCost = normalizedType === 'hero' 
    ? '0' 
    : (card.energyCost ?? 0);

  const keywordsString = Array.isArray(card.keywords) && card.keywords.length > 0
    ? card.keywords.join(' · ')
    : normalizedType === 'hero' ? 'Herói · Elo Mortal'
    : '';

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`relative select-none transition-all duration-200 transform-gpu group ${sizeStyles.containerClass} ${
        onClick ? 'cursor-pointer hover:-translate-y-1' : ''
      } ${
        isSelected 
          ? 'ring-2 ring-[#d4af70] shadow-[0_0_24px_rgba(212,175,112,0.65)] scale-[1.03] z-20' 
          : 'shadow-[0_12px_24px_rgba(0,0,0,0.5)]'
      } ${
        isTargetable
          ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#071017] shadow-[0_0_20px_rgba(101,215,215,0.7)] animate-pulse'
          : ''
      } ${
        isExhausted
          ? 'grayscale-[0.6] opacity-75'
          : ''
      } ${className}`}
      style={{
        borderRadius: '6px',
      }}
    >
      {/* VERSO DA CARTA */}
      {showBack ? (
        <div 
          className="absolute inset-0 bg-cover bg-center rounded-[5px] overflow-hidden shadow-inner"
          style={{ backgroundImage: `url('/assets/farel/cards/card-back.webp')` }}
        >
          <div className="absolute inset-0 bg-black/10" />
        </div>
      ) : (
        /* FACE FRONTAL DA CARTA */
        <div 
          className="absolute inset-0 bg-cover bg-center rounded-[5px] overflow-hidden"
          style={{ 
            backgroundImage: `url('${templatePath}')`,
            backgroundColor: '#0d1820',
          }}
        >
          {/* 1. JANELA DE ARTE (ART WINDOW) */}
          <div 
            className="absolute overflow-hidden z-[1] rounded-t-[3px] bg-gradient-to-br from-[#17252d] to-[#0b1218]"
            style={{
              left: '5%',
              top: '7.1%',
              width: '90%',
              height: '51.3%',
            }}
          >
            <img 
              src={artPath} 
              alt={card.name || 'Carta Farel'}
              className="w-full h-full object-cover object-center filter saturate-[0.95] contrast-[1.03]"
              loading="lazy"
            />
            {/* Vinheta de profundidade da arte */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: 'inset 0 0 24px rgba(0,0,0,0.35)',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, transparent 65%, rgba(0,0,0,0.2) 100%)',
              }}
            />
          </div>

          {/* 2. MEDALHÃO CIRCULAR DE CUSTO (CANTO SUPERIOR ESQUERDO) */}
          <div 
            className={`absolute z-[5] rounded-full flex items-center justify-center font-serif font-bold text-[#fff6dc] shadow-[0_2px_8px_#000] border border-[#d9b76e] ${sizeStyles.costTextClass}`}
            style={{
              top: '2.8%',
              left: '5%',
              width: '18%',
              aspectRatio: '1 / 1',
              background: 'radial-gradient(circle at 35% 25%, #293a42, #071016 70%)',
              boxShadow: '0 0 0 2px rgba(9,12,14,0.85), 0 2px 8px #000',
            }}
            title={`Custo: ${displayCost} Energia`}
          >
            {displayCost}
          </div>

          {/* 3. NOME DA CARTA */}
          <div 
            className={`absolute z-[3] flex items-center justify-center text-center font-serif font-medium text-[#fff5df] overflow-hidden px-1 tracking-wide ${sizeStyles.nameTextClass}`}
            style={{
              top: '60.1%',
              left: '9%',
              width: '82%',
              height: '7.1%',
              textShadow: '0 1px 3px #000, 0 2px 6px rgba(0,0,0,0.9)',
            }}
            title={card.name}
          >
            <span className="truncate">{card.name}</span>
          </div>

          {/* 4. LINHA DE TIPO */}
          <div 
            className={`absolute z-[3] flex items-center justify-center text-center font-sans font-bold uppercase tracking-wider overflow-hidden whitespace-nowrap ${sizeStyles.typeTextClass}`}
            style={{
              top: '67.4%',
              left: '10%',
              width: '80%',
              height: '5.7%',
              color: typeConfig.color,
              textShadow: '0 1px 3px #000',
            }}
          >
            {typeConfig.label}
          </div>

          {/* 5. CAIXA DE REGRAS (TEXTO DE EFEITO) */}
          <div 
            className={`absolute z-[3] font-sans text-[#e3e4dc] overflow-hidden text-left px-1.5 py-0.5 line-clamp-4 ${sizeStyles.rulesTextClass}`}
            style={{
              top: '73.5%',
              left: '10%',
              width: '80%',
              height: '14.2%',
              textShadow: '0 1px 3px #000',
            }}
          >
            {card.rulesText || card.description || 'Sem efeito adicional.'}
          </div>

          {/* 6. RODAPÉ ESQUERDO: PALAVRAS-CHAVE OU DADO D6 */}
          <div 
            className={`absolute z-[4] flex items-center whitespace-nowrap overflow-hidden font-sans font-bold text-[#f0dfb5] ${sizeStyles.footerTextClass}`}
            style={{
              left: '18%',
              bottom: '2.1%',
              width: '54%',
              height: '5.5%',
              textShadow: '0 1px 3px #000',
            }}
          >
            {normalizedType === 'creature' ? (
              <span className="truncate flex items-center gap-1 text-[#f4d7a1]">
                <span>🎲 d6{attackModifier ? `+${attackModifier}` : ''}</span>
                {keywordsString && <span>· {keywordsString}</span>}
              </span>
            ) : normalizedType === 'generator' && card.incomePerTurn ? (
              <span className="truncate text-[#65d7d7]">
                +{card.incomePerTurn} Energia / Turno
              </span>
            ) : (
              <span className="truncate">{keywordsString || card.id}</span>
            )}
          </div>

          {/* 7. MEDALHÃO CIRCULAR DE VIDA (CANTO INFERIOR DIREITO) */}
          {displayLife !== null && (
            <div 
              className={`absolute z-[5] rounded-full flex items-center justify-center font-serif font-bold text-white border border-[#dc9a7a] shadow-[0_2px_8px_#000] ${sizeStyles.lifeTextClass}`}
              style={{
                right: '4.7%',
                bottom: '2.25%',
                width: '16%',
                height: '7.3%',
                background: 'radial-gradient(circle at 35% 25%, #7e342f, #260c10 70%)',
                boxShadow: '0 0 0 2px rgba(8,10,12,0.85), 0 2px 6px #000',
              }}
              title={`Vida: ${displayLife}`}
            >
              {displayLife}
            </div>
          )}

          {/* BADGES DE ESTADO (EXAUSTÃO, RECÉM-INVOCADA, ETC.) */}
          {isExhausted && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-[10] flex items-center justify-center rounded-[5px]">
              <span className="px-2 py-0.5 rounded bg-black/80 border border-slate-600 text-slate-300 font-mono text-[9px] uppercase tracking-wider font-bold">
                Exausta
              </span>
            </div>
          )}

          {isNewlySummoned && !isExhausted && (
            <div className="absolute top-2 right-2 z-[11]">
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/80 text-black font-mono text-[7px] font-black uppercase tracking-wider shadow">
                Nova
              </span>
            </div>
          )}

          {badgeText && (
            <div className="absolute top-2 right-2 z-[11]">
              <span className="px-1.5 py-0.5 rounded bg-black/80 border border-[#d4af70] text-[#f4d7a1] font-mono text-[7.5px] font-bold">
                {badgeText}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
