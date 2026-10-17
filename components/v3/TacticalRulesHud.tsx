'use client';

import React, { useState } from 'react';
import { CardInspector } from '../CardInspector';
import { FarelCard } from '../../types/farelCard';

interface TacticalRulesHudProps {
  turn: number;
  isPlayerTurn: boolean;
  selectedCard: FarelCard | any | null;
  selectedSource: 'hand' | 'board' | null;
  playerEnergy: number;
  actionLogs?: string[];
  onSummonLane?: (laneIndex: number) => void;
  onCastSpell?: () => void;
  onAttackLane?: () => void;
  onCloseSelection?: () => void;
  freeLanes?: number[];
  className?: string;
}

export const TacticalRulesHud: React.FC<TacticalRulesHudProps> = ({
  turn,
  isPlayerTurn,
  selectedCard,
  selectedSource,
  playerEnergy,
  actionLogs = [],
  onSummonLane,
  onCastSpell,
  onAttackLane,
  onCloseSelection,
  freeLanes = [0, 1, 2],
  className = '',
}) => {
  const [showFullRules, setShowFullRules] = useState(false);

  const cardCost = selectedCard?.energyCost || 0;
  const canAfford = playerEnergy >= cardCost;

  return (
    <aside
      className={`w-80 bg-gradient-to-b from-[#0a0f15]/95 via-[#080d12]/95 to-[#05080c]/98 border-l border-[#3a2c16]/50 flex flex-col justify-between p-4 shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.7)] backdrop-blur-md z-20 overflow-y-auto ${className}`}
    >
      <div className="flex flex-col gap-4">
        {/* CARD DE FASE E TURNO COM DICA TÁTICA */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1c160c]/90 via-[#141009]/95 to-[#0d0a06]/90 border border-[#b89548]/40 shadow-lg">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#b89548]/20">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37] font-bold">
              FASE ATUAL
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                isPlayerTurn
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                  : 'bg-rose-950 text-rose-300 border border-rose-700/60'
              }`}
            >
              {isPlayerTurn ? 'Seu Turno' : 'Turno Oponente'}
            </span>
          </div>

          <h3 className="font-serif font-black text-sm text-[#f6e5c2] tracking-wide mb-1">
            TURNO {turn} • FASE PRINCIPAL
          </h3>

          <p className="text-[11px] text-[#bdae93] leading-relaxed bg-[#0b0804]/50 p-2 rounded-lg border border-[#44351a]/40">
            💡 <strong className="text-[#e2caa0]">Dica Tática:</strong>{' '}
            {isPlayerTurn
              ? 'Invoque criaturas nas faixas abertas ou utilize estruturas de éter na retaguarda para acumular energia.'
              : 'Aguarde o término da fase de combate do oponente.'}
          </p>
        </div>

        {/* INSPETOR DA CARTA SELECIONADA */}
        <div className="w-full">
          <CardInspector
            card={selectedCard}
            onClose={onCloseSelection}
            onSummonLane={onSummonLane}
            onCastSpell={onCastSpell}
            onAttackLane={onAttackLane}
            isCardInHand={selectedSource === 'hand'}
            isCardOnBoard={selectedSource === 'board'}
            canAfford={canAfford}
            canAttack={isPlayerTurn && selectedSource === 'board'}
            freeLanes={freeLanes}
          />
        </div>

        {/* GUIA RÁPIDO DE REGRAS OFICIAIS (1 a 5) */}
        <div className="p-3 rounded-2xl bg-[#0c131a]/80 border border-[#1e3447]/50 shadow-md">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1e3447]/40">
            <h4 className="font-serif font-bold text-xs text-[#cadbe8] uppercase tracking-wider flex items-center gap-1.5">
              <span>📜</span> Regras Rápidas
            </h4>
            <button
              onClick={() => setShowFullRules(true)}
              className="text-[10px] text-cyan-400 hover:text-cyan-200 underline font-mono"
            >
              Ver Tudo
            </button>
          </div>

          <ol className="flex flex-col gap-1.5 text-[11px] text-[#93a7b8] leading-tight">
            <li className="flex items-start gap-1.5">
              <span className="font-mono font-bold text-cyan-400">1.</span>
              <span><strong>Invocação:</strong> Gaste energia para invocar na sua linha frontal.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-mono font-bold text-cyan-400">2.</span>
              <span><strong>Combate D6:</strong> Dano = Rolagem de D6 + Bônus de Ataque da carta.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-mono font-bold text-cyan-400">3.</span>
              <span><strong>Hierarquia:</strong> Criaturas absorvem &gt; Estruturas &gt; Herói.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-mono font-bold text-cyan-400">4.</span>
              <span><strong>Retaguarda:</strong> Estruturas concedem bônus permanente de energia.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-mono font-bold text-cyan-400">5.</span>
              <span><strong>Vitória:</strong> Reduza o Herói oponente de 30 para 0 HP.</span>
            </li>
          </ol>
        </div>

        {/* LOG RÁPIDO DE AÇÕES */}
        {actionLogs.length > 0 && (
          <div className="p-2.5 rounded-xl bg-[#080d12]/90 border border-[#162533] max-h-32 overflow-y-auto">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#637d94] mb-1 font-bold">
              Últimas Ações
            </div>
            <div className="flex flex-col gap-1 text-[10px] font-mono text-[#8fa7bd]">
              {actionLogs.slice(-4).reverse().map((log, i) => (
                <div key={i} className="truncate">
                  • {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE REGRAS COMPLETAS */}
      {showFullRules && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1720] border border-[#d4af37]/60 rounded-2xl max-w-xl w-full p-6 text-[#d8e2ec] shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#3a2c16]">
              <h3 className="font-serif font-bold text-lg text-[#f7e8c4] flex items-center gap-2">
                <span>✧</span> Regras Oficiais Farel TCG (Padrão 30 HP)
              </h3>
              <button
                onClick={() => setShowFullRules(false)}
                className="text-[#9a8661] hover:text-[#f7e8c4] text-lg font-mono font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed">
              <section>
                <h4 className="font-bold text-[#bfa267] uppercase mb-1">1. Heróis e Vida Base</h4>
                <p>
                  Ambos os jogadores iniciam a partida com um Herói oficial com <strong>30 Pontos de Vida (HP)</strong>. Se a vida do seu Herói chegar a 0, a derrota é imediata.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-[#bfa267] uppercase mb-1">2. Recursos e Energia</h4>
                <p>
                  A energia é restaurada a cada início de turno (Base 5). Estruturas na retaguarda como o Condensador de Éter aumentam o suprimento por turno.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-[#bfa267] uppercase mb-1">3. Combate e Dados D6</h4>
                <p>
                  Cada ataque rola um dado de 6 faces (1 a 6) somado ao bônus de ataque da criatura. Se o defensor tiver armadura, o dano absorvido é deduzido.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-[#bfa267] uppercase mb-1">4. Regra de Summoning Sickness</h4>
                <p>
                  Criaturas normais não podem atacar no mesmo turno em que foram invocadas, a não ser que possuam a habilidade <em>Ágil</em> (como a Batedora do Vento).
                </p>
              </section>
            </div>

            <div className="mt-6 pt-3 border-t border-[#3a2c16] flex justify-end">
              <button
                onClick={() => setShowFullRules(false)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#bfa267] to-[#8c6f37] text-[#120d04] font-bold text-xs"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
