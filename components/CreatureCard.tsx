import React from 'react';
import { Creature } from '../types/entities';

interface CreatureCardProps {
  creature: Creature;
  onClick?: () => void;
}

export const CreatureCard: React.FC<CreatureCardProps> = ({ creature, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="cursor-pointer border-2 border-red-800 bg-red-100 rounded p-2 w-24 h-24 flex flex-col justify-between hover:border-red-500 shadow-sm text-black relative"
    >
      <div className="text-xs font-bold text-center truncate">{creature.name}</div>
      <div className="text-[10px] text-center italic">{creature.status}</div>
      <div className="flex justify-between items-center text-xs font-bold mt-1">
        <span className="bg-red-200 text-red-900 px-1 rounded">HP: {creature.health}</span>
        <span className="bg-gray-300 text-gray-900 px-1 rounded">ATK: {creature.attackModifier >= 0 ? '+' : ''}{creature.attackModifier}</span>
      </div>
    </div>
  );
};
