import React from 'react';
import { Hero } from '../types/entities';

interface HeroCardProps {
  hero: Hero;
  currentEnergy: number;
  maxEnergyCap: number;
}

export const HeroCard: React.FC<HeroCardProps> = ({ hero, currentEnergy, maxEnergyCap }) => {
  return (
    <div className="border-4 border-amber-600 rounded-lg p-4 bg-slate-800 text-white w-48 shadow-lg flex flex-col justify-between">
      <div className="text-center font-bold text-xl mb-2">{hero.name}</div>
      <div className="flex flex-col gap-2">
        <div className="bg-red-900/50 p-2 rounded flex justify-between">
          <span>HP:</span>
          <span className="font-bold text-red-400">{hero.health} / {hero.maxHealth}</span>
        </div>
        <div className="bg-blue-900/50 p-2 rounded flex justify-between">
          <span>Energy:</span>
          <span className="font-bold text-blue-400">{currentEnergy} / {maxEnergyCap}</span>
        </div>
      </div>
    </div>
  );
};
