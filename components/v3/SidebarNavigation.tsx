'use client';

import React from 'react';

export type SidebarTab = 'battlefield' | 'hand' | 'deck' | 'history' | 'settings' | 'library';

interface SidebarNavigationProps {
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  handCount?: number;
  deckCount?: number;
  graveyardCount?: number;
  turn?: number;
  onResetMatch?: () => void;
  className?: string;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeTab,
  onSelectTab,
  handCount = 5,
  deckCount = 28,
  graveyardCount = 0,
  turn = 1,
  onResetMatch,
  className = '',
}) => {
  const navItems = [
    {
      id: 'battlefield' as SidebarTab,
      label: 'Campo de Batalha',
      icon: '⚔️',
      badge: null,
    },
    {
      id: 'hand' as SidebarTab,
      label: 'Mão de Cartas',
      icon: '🃏',
      badge: handCount,
    },
    {
      id: 'deck' as SidebarTab,
      label: 'Deck',
      icon: '📚',
      badge: deckCount,
    },
    {
      id: 'history' as SidebarTab,
      label: 'Histórico',
      icon: '📜',
      badge: null,
    },
    {
      id: 'library' as SidebarTab,
      label: 'Catálogo',
      icon: '✨',
      badge: null,
    },
    {
      id: 'settings' as SidebarTab,
      label: 'Configurações',
      icon: '⚙️',
      badge: null,
    },
  ];

  return (
    <aside
      className={`w-64 bg-gradient-to-b from-[#0b1016]/95 via-[#080c10]/95 to-[#06090c]/98 border-r border-[#3a2c16]/50 flex flex-col justify-between p-4 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.7)] backdrop-blur-md z-20 ${className}`}
    >
      {/* BRAND HEADER DE FANTASIA ÉPICA */}
      <div>
        <div className="flex items-center gap-2.5 pb-5 mb-5 border-b border-[#3a2c16]/40">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c8a45d] to-[#6d5225] p-0.5 shadow-[0_0_15px_rgba(200,164,93,0.4)] flex items-center justify-center">
            <span className="text-xl">✧</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-serif font-black text-base text-[#f7e8c4] tracking-wider uppercase">
                FAREL TCG
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1e2e38] text-cyan-300 border border-cyan-800/60 font-bold">
                3.0
              </span>
            </div>
            <p className="text-[10px] text-[#9a8661] uppercase tracking-widest font-sans font-semibold">
              Arena Tática Arcana
            </p>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-[#2a2012]/90 via-[#362916]/80 to-[#1e170c]/50 text-[#f6e5c2] border border-[#d4af37]/60 shadow-[0_0_16px_rgba(212,175,55,0.25)] translate-x-1'
                    : 'text-[#9e978a] hover:text-[#ebd6af] hover:bg-[#121921]/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">{item.icon}</span>
                  <span className="font-sans font-semibold">{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-[#d4af37] text-[#1a1205]'
                        : 'bg-[#18232e] text-[#8ea4b8] border border-[#273a4b]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* RODAPÉ DO SIDEBAR: STATUS DA PARTIDA E RESET */}
      <div className="pt-4 border-t border-[#3a2c16]/40 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-[11px] text-[#8ea4b8] px-1 font-mono">
          <span>Turno Atual:</span>
          <span className="font-bold text-[#f7e8c4]">#{turn}</span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#8ea4b8] px-1 font-mono">
          <span>Cemitério:</span>
          <span className="text-rose-400 font-bold">{graveyardCount} cartas</span>
        </div>

        {onResetMatch && (
          <button
            onClick={onResetMatch}
            className="w-full mt-2 py-2 px-3 rounded-lg text-xs font-semibold text-[#c8a45d] bg-[#1a150e] hover:bg-[#2e2314] border border-[#5c4621] hover:border-[#c8a45d] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>🔄</span> Reiniciar Partida
          </button>
        )}

        <div className="text-center text-[10px] text-[#6b6252] font-mono pt-1">
          Farel Engine v3.0 • 30 HP Baseline
        </div>
      </div>
    </aside>
  );
};
