'use client';

import React from 'react';

export interface CombatFloatingItem {
  id: string;
  lane: number; // 0 to 4
  text: string;
  kind: 'damage' | 'critical' | 'intercept' | 'destroyed' | 'summon';
}

interface FloatingCombatTextProps {
  items: CombatFloatingItem[];
}

export const FloatingCombatText: React.FC<FloatingCombatTextProps> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      {items.map((item) => {
        // Compute left percentage based on lane (0..4)
        // In 5-column layout, lane 0 is ~10%, lane 1 is ~30%, lane 2 is ~50%, lane 3 is ~70%, lane 4 is ~90%
        const leftPercent = 10 + item.lane * 20;

        const isCrit = item.kind === 'critical';
        const isIntercept = item.kind === 'intercept';
        const isDestroyed = item.kind === 'destroyed';

        return (
          <div
            key={item.id}
            className="absolute top-[48%] -translate-x-1/2 floating-text-anim flex items-center justify-center pointer-events-none"
            style={{ left: `${leftPercent}%` }}
          >
            <div
              className={`px-3 py-1 rounded-full font-serif font-black tracking-wide shadow-2xl border ${
                isCrit
                  ? 'bg-gradient-to-r from-[#7a0d0d] via-[#bd1313] to-[#ff4747] text-[#fff7d1] text-base border-[#ffea78] shadow-[0_0_20px_#ff2222]'
                  : isIntercept
                  ? 'bg-[#1d3247] text-[#a1e5ff] text-xs border-[#43d9c4] shadow-[0_0_15px_#43d9c4]'
                  : isDestroyed
                  ? 'bg-[#2b0c0c] text-[#ff8075] text-xs border-[#ff473d]'
                  : 'bg-[#5e1010]/95 text-[#ffdfdb] text-sm border-[#ff7066] shadow-[0_0_15px_rgba(255,50,50,0.6)]'
              }`}
              style={{
                textShadow: '0 2px 4px #000, 0 0 8px rgba(0,0,0,0.8)'
              }}
            >
              {item.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};
