'use client';

import React, { useState } from 'react';
import { PLAYTEST_OPEN_QUESTIONS, demoRules as defaultDemoRules, DemoRulesConfig } from '../game/config/demoRules';

interface PlaytestNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rulesConfig?: DemoRulesConfig;
  onUpdateRule?: <K extends keyof DemoRulesConfig>(key: K, value: DemoRulesConfig[K]) => void;
}

export const PlaytestNotesModal: React.FC<PlaytestNotesModalProps> = ({
  isOpen,
  onClose,
  rulesConfig = defaultDemoRules,
  onUpdateRule,
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'config'>('questions');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredQuestions = PLAYTEST_OPEN_QUESTIONS.filter(
    (q) =>
      q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="playtest-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 id="playtest-modal-title" className="text-lg font-bold text-amber-300 flex items-center gap-2">
              <span>📋</span>
              <span>Notas para o Teste — Decisões em Aberto</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              FAREL TCG 1.1 • Mapeamento das 16 pendências de regras e configurações do protótipo
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar janela de notas de teste"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-4 pt-3 border-b border-slate-800 bg-slate-950/30 text-xs">
          <button
            onClick={() => setActiveTab('questions')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'questions'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            As 16 Questões de Design ({PLAYTEST_OPEN_QUESTIONS.length})
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Configuração demoRules (Ativa no Protótipo)
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'questions' ? (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filtrar tópico ou pergunta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-3">
                {filteredQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-slate-200">
                        {q.id}. {q.topic}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          q.status === 'Pendente de Decisão'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                        }`}
                      >
                        {q.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {q.question}
                    </p>

                    <div className="text-[11px] font-mono text-slate-400 bg-slate-900/90 p-2 rounded-lg border border-slate-800 flex items-start gap-1.5">
                      <strong className="text-amber-400/90 whitespace-nowrap">Hipótese atual:</strong>
                      <span>{q.currentDemoAssumption}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                Este objeto central <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded font-mono">demoRules</code> isola todas as hipóteses temporárias usadas no protótipo, garantindo que o designer possa alterá-las após o playtest sem refazer o onboarding ou o tabuleiro.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200">attacksMandatory</div>
                    <div className="text-[10px] text-slate-400">Ataque obrigatório no fim do turno</div>
                  </div>
                  <span className="px-2 py-1 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
                    {String(rulesConfig.attacksMandatory)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200">unspentEnergyCarriesOver</div>
                    <div className="text-[10px] text-slate-400">Energia não gasta acumula</div>
                  </div>
                  <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-bold">
                    {String(rulesConfig.unspentEnergyCarriesOver)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200">handLimit</div>
                    <div className="text-[10px] text-slate-400">Limite de cartas na mão</div>
                  </div>
                  <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    {rulesConfig.handLimit} cartas
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200">structuresStartProducing</div>
                    <div className="text-[10px] text-slate-400">Início de geração de energia</div>
                  </div>
                  <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    {rulesConfig.structuresStartProducing}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200">heroInterception</div>
                    <div className="text-[10px] text-slate-400">Interceptação com Herói</div>
                  </div>
                  <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold text-[10px]">
                    {rulesConfig.heroInterception}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200">combatOverflow</div>
                    <div className="text-[10px] text-slate-400">Dano excedente ao matar</div>
                  </div>
                  <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-[10px]">
                    {rulesConfig.combatOverflow}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Documento de referência: <strong className="text-slate-300">01-regras-e-onboarding.md (Seção 6)</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
          >
            Entendido, fechar
          </button>
        </div>
      </div>
    </div>
  );
};
