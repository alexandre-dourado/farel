'use client';

import React from 'react';

interface EnergyMeterProps {
  current: number;
  baseEnergy?: number;
  structureIncome?: number;
  showDetails?: boolean;
}

export const EnergyMeter: React.FC<EnergyMeterProps> = ({
  current,
  baseEnergy = 5,
  structureIncome = 0,
  showDetails = true,
}) => {
  const totalIncome = baseEnergy + structureIncome;

  return (
    <div
      className="flex flex-col gap-1 p-2 rounded-lg bg-teal-950/40 border border-teal-500/30 text-teal-100 min-w-[120px]"
      aria-label={`Energia disponível: ${current}. Renda por turno: ${totalIncome} (${baseEnergy} base + ${structureIncome} estruturas)`}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-[11px] font-mono text-teal-400">
          <span>⚡</span>
          <span>DISPONÍVEL:</span>
        </span>
        <span className="text-base font-black text-teal-300 font-mono tracking-tight">
          {current}
        </span>
      </div>

      {showDetails && (
        <div className="flex items-center justify-between pt-1 border-t border-teal-800/40 text-[10px] font-mono text-teal-400/80">
          <span>Renda/turno:</span>
          <span className="text-teal-200">
            {baseEnergy} base {structureIncome > 0 && <strong className="text-emerald-300">+{structureIncome} geradores</strong>}
          </span>
        </div>
      )}
    </div>
  );
};
