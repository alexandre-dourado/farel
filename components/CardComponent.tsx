import React from 'react';
import { Card } from '../types/entities';

interface CardProps {
  card: Card;
  onClick?: () => void;
}

export const CardComponent: React.FC<CardProps> = ({ card, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="cursor-pointer border-2 border-gray-400 bg-gray-100 rounded p-2 w-24 h-32 flex flex-col justify-between hover:border-blue-500 shadow-sm transition-colors text-black"
    >
      <div className="text-xs font-bold text-center">{card.name}</div>
      <div className="text-[10px] text-gray-600 flex-1 my-1 overflow-hidden">{card.description}</div>
      <div className="flex justify-between items-center text-xs font-bold">
        <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center">{card.energyCost}</span>
      </div>
    </div>
  );
};
