import { Creature, Structure } from './entities';

export interface ChannelingSlot {
  cardInstanceId: string;
  turnsRemaining: number;
}

export interface LaneState {
  laneIndex: number;
  p1Creature: Creature | null;
  p2Creature: Creature | null;
}

export interface BacklineState {
  structures: (Structure | null)[];
  channeling: (ChannelingSlot | null)[];
}

export interface Board {
  lanes: LaneState[];
  backline: Record<string, BacklineState>;
}
