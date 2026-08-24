import { GameStatus, TurnPhase } from './enums';
import { Card, Hero } from './entities';
import { Board } from './board';

export interface EventLog {
  type: string;
  sourceId?: string;
  targetId?: string;
  value?: number;
  timestamp: number;
}

export interface PlayerState {
  playerId: string;
  hero: Hero;
  hand: Card[];
  deckCount: number;
  graveyard: Card[];
  currentEnergy: number;
  maxEnergyCap: number;
  heroDefenseMode?: 'ALWAYS' | 'AUTO';
}

export interface GameState {
  gameId: string;
  status: GameStatus;
  turn: number;
  activePlayerId: string;
  phase: TurnPhase;
  players: Record<string, PlayerState>;
  board: Board;
  logs: EventLog[];
}
