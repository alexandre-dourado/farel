import { Card, Hero } from '../../types/entities';
import { CardType } from '../../types/enums';
import demoCardsData from './farelDemoCards.json';

export interface FarelRawCard {
  id: string;
  name: string;
  type: string;
  energyCost: number;
  life: number | null;
  rulesText: string;
  keywords: string[];
  canAttackOnSummon: boolean | null;
  incomePerTurn: number | null;
  effectKind: string;
  trigger: string | null;
  artDirection: string;
  demoOnly: boolean;
  demoNotes?: string;
}

export const HeroRegistry: Hero[] = [
  {
    id: 'HERO-001',
    name: 'Viajante do Limiar',
    maxHealth: 30,
    health: 30,
    baseDefense: 0,
    baseEnergy: 5,
    artDirection: 'silhueta de viajante sob um arco luminoso; medalhão circular dourado; poucos detalhes',
    artUrl: '/assets/farel/art/cards/HERO-001.webp'
  },
  {
    id: 'HERO-002',
    name: 'Imperatriz das Eras',
    maxHealth: 30,
    health: 30,
    baseDefense: 0,
    baseEnergy: 5,
    artDirection: 'silhueta régia com coroa geométrica e anéis temporais; dourado fosco e azul-escuro',
    artUrl: '/assets/farel/art/cards/HERO-002.webp'
  }
];

function mapCardType(rawType: string): CardType {
  switch (rawType.toLowerCase()) {
    case 'creature':
      return CardType.CREATURE;
    case 'generator':
      return CardType.STRUCTURE;
    case 'spell':
      return CardType.SPELL;
    case 'channelled_spell':
      return CardType.CHANNELLED_SPELL;
    default:
      return CardType.CREATURE;
  }
}

export const CardRegistry: Card[] = (demoCardsData.cards as FarelRawCard[])
  .filter(c => c.type !== 'hero')
  .map(c => ({
    id: c.id,
    instanceId: '',
    name: c.name,
    type: mapCardType(c.type),
    description: c.rulesText,
    rulesText: c.rulesText,
    keywords: c.keywords,
    energyCost: c.energyCost,
    health: c.life || undefined,
    maxHealth: c.life || undefined,
    attackModifier: 0,
    energyBonus: c.incomePerTurn || 0,
    incomePerTurn: c.incomePerTurn,
    canAttackOnEntry: c.canAttackOnSummon,
    effectKind: c.effectKind,
    trigger: c.trigger,
    artDirection: c.artDirection,
    artUrl: `/assets/farel/art/cards/${c.id}.webp`
  }));

export function getHeroById(id: string): Hero {
  const found = HeroRegistry.find(h => h.id === id);
  if (!found) {
    return { ...HeroRegistry[0] };
  }
  return { ...found };
}

export function getCardById(id: string): Card | undefined {
  return CardRegistry.find(c => c.id === id);
}

export function buildDefaultDeck(playerId: string): Card[] {
  // Cria um baralho de 15 cartas variadas a partir do CardRegistry para uma partida dinâmica
  const deckCards: Card[] = [];
  CardRegistry.forEach((template, idx) => {
    // 1 cópia de cada carta da biblioteca inicial (15 cartas)
    deckCards.push({
      ...template,
      instanceId: `inst_${playerId}_${template.id}_${idx}`
    });
  });
  return deckCards;
}
