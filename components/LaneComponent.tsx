import React from 'react';
import { LaneState } from '../types/board';
import { CreatureCard } from './CreatureCard';

interface LaneProps {
  lane: LaneState;
  isP1Bottom: boolean;
}

export const LaneComponent: React.FC<LaneProps> = ({ lane, isP1Bottom }) => {
  const topCreature = isP1Bottom ? lane.p2Creature : lane.p1Creature;
  const bottomCreature = isP1Bottom ? lane.p1Creature : lane.p2Creature;

  return (
    <div className="flex flex-col border border-dashed border-gray-600 rounded w-28 min-h-[300px] bg-slate-800/50 p-2 items-center justify-between">
      <div className="w-full h-24 border border-gray-700 rounded flex items-center justify-center bg-slate-900/50">
        {topCreature ? <CreatureCard creature={topCreature} /> : <span className="text-gray-600 text-xs">Empty</span>}
      </div>
      
      <div className="text-xs text-gray-400 font-bold my-2">Lane {lane.laneIndex + 1}</div>

      <div className="w-full h-24 border border-gray-700 rounded flex items-center justify-center bg-slate-900/50">
        {bottomCreature ? <CreatureCard creature={bottomCreature} /> : <span className="text-gray-600 text-xs">Empty</span>}
      </div>
    </div>
  );
};
