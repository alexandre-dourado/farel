export interface DemoRulesConfig {
  attacksMandatory: boolean;
  unspentEnergyCarriesOver: boolean;
  drawAtEveryTurnStart: boolean;
  handLimit: number;
  handLimitEnforcement: 'end-of-turn' | 'immediate-discard' | 'block-draw';
  structuresStartProducing: 'next-turn' | 'same-turn';
  combatOverflow: 'unresolved' | 'lost' | 'trample-to-structure';
  defenderRetaliation: 'unresolved' | 'none' | 'simultaneous';
  heroInterception: 'illustrative-full-redirection' | 'unresolved' | 'split-damage';
  channelCanTriggerOnOpponentTurn: 'unresolved' | 'yes' | 'no';
}

export const demoRules: DemoRulesConfig = {
  attacksMandatory: true,
  unspentEnergyCarriesOver: false,
  drawAtEveryTurnStart: true,
  handLimit: 5,
  handLimitEnforcement: 'end-of-turn',
  structuresStartProducing: 'next-turn',
  combatOverflow: 'unresolved',
  defenderRetaliation: 'unresolved',
  heroInterception: 'illustrative-full-redirection',
  channelCanTriggerOnOpponentTurn: 'unresolved',
};

export interface PlaytestOpenQuestion {
  id: number;
  topic: string;
  question: string;
  currentDemoAssumption: string;
  status: 'Hipótese de Protótipo' | 'Pendente de Decisão';
}

export const PLAYTEST_OPEN_QUESTIONS: PlaytestOpenQuestion[] = [
  {
    id: 1,
    topic: 'Ataque no fim do turno',
    question: 'É obrigatório ou o jogador pode escolher não atacar?',
    currentDemoAssumption: 'attacksMandatory: true (no protótipo todas atacam automaticamente)',
    status: 'Hipótese de Protótipo',
  },
  {
    id: 2,
    topic: 'Energia não gasta',
    question: 'Expira no fim do turno ou acumula?',
    currentDemoAssumption: 'unspentEnergyCarriesOver: false (a energia reseta para a nova renda a cada turno)',
    status: 'Hipótese de Protótipo',
  },
  {
    id: 3,
    topic: 'Compra e mão',
    question: 'Há compra no primeiro turno além das cinco cartas iniciais? Se a mão ficar acima de cinco, deve-se descartar, bloquear a compra ou aplicar outra regra?',
    currentDemoAssumption: 'Mão inicial 5, compra 1 no turno, descarta excedente no fim do turno',
    status: 'Pendente de Decisão',
  },
  {
    id: 4,
    topic: 'Herói defendendo',
    question: 'Ele substitui o alvo e recebe todo o dano? Pode interceptar várias vezes? Pode ser usado depois de ver a rolagem? Há algum custo?',
    currentDemoAssumption: 'Redirecionamento ilustrativo integral do dano para o herói',
    status: 'Hipótese de Protótipo',
  },
  {
    id: 5,
    topic: 'Combate criatura contra criatura',
    question: 'O defensor revida? O contra-ataque é simultâneo ou ocorre depois? Quem morre primeiro se ambos chegarem a zero?',
    currentDemoAssumption: 'Defensor não revida na demonstração básica',
    status: 'Pendente de Decisão',
  },
  {
    id: 6,
    topic: 'Alinhamento das casas',
    question: 'As cinco casas de criatura e as cinco de estrutura são cinco faixas alinhadas? O ataque escolhe a faixa pela posição da criatura?',
    currentDemoAssumption: 'Sim, 5 faixas alinhadas front-to-back para clareza didática',
    status: 'Hipótese de Protótipo',
  },
  {
    id: 7,
    topic: 'Ordem de ataque',
    question: 'Quem escolhe a ordem das cinco faixas? A ordem muda algo?',
    currentDemoAssumption: 'Resolução da esquerda para a direita (faixa 1 a 5)',
    status: 'Pendente de Decisão',
  },
  {
    id: 8,
    topic: 'Dano excedente',
    question: 'Se um ataque destrói uma criatura com dano sobrando, o excedente passa para a estrutura ou é perdido?',
    currentDemoAssumption: 'Dano excedente é descartado no protótipo',
    status: 'Pendente de Decisão',
  },
  {
    id: 9,
    topic: 'Modificadores de d6',
    question: 'A soma pode exceder 6? Existe valor mínimo/máximo para dano? Vários buffs acumulam?',
    currentDemoAssumption: 'Soma d6 + buff demonstrada como 4 + 2 = 6 sem teto rígido',
    status: 'Pendente de Decisão',
  },
  {
    id: 10,
    topic: 'Estrutura geradora',
    question: 'Começa a produzir energia no turno seguinte à construção? A renda é recebida antes ou depois de efeitos de início de turno?',
    currentDemoAssumption: 'Começa a produzir no turno seguinte (structuresStartProducing: next-turn)',
    status: 'Hipótese de Protótipo',
  },
  {
    id: 11,
    topic: 'Canalização',
    question: 'A magia pode disparar durante o turno adversário? Ela é removida quando resolve? E se a condição nunca ocorrer? É possível cancelar/remover uma magia canalizada?',
    currentDemoAssumption: 'Ocupa slot com Aguardando Condição e é consumida ao resolver',
    status: 'Pendente de Decisão',
  },
  {
    id: 12,
    topic: 'Slots',
    question: 'Pode haver no máximo uma carta por slot? Como uma casa fica livre quando uma carta sai? Cartas podem ocupar mais de um slot?',
    currentDemoAssumption: 'Exatamente 1 carta por slot; morte/remoção libera o slot',
    status: 'Hipótese de Protótipo',
  },
  {
    id: 13,
    topic: 'Deck',
    question: 'Tamanho, quantidade de cópias, construção, cartas disponíveis, compra de deck vazio e regra de empate não foram especificados.',
    currentDemoAssumption: 'Biblioteca fixa de 14 cartas demonstrativas',
    status: 'Pendente de Decisão',
  },
  {
    id: 14,
    topic: 'Heróis e cartas',
    question: 'Valores de vida, habilidades exclusivas e requisitos de seleção precisam vir das cartas finais; o texto-base não os define.',
    currentDemoAssumption: 'Heróis de teste com 12 e 14 de vida para fins ilustrativos',
    status: 'Hipótese de Protótipo',
  },
  {
    id: 15,
    topic: 'Defesa de criaturas',
    question: 'Uma criatura pode defender ataques dirigidos a outra faixa? O herói é o único defensor móvel?',
    currentDemoAssumption: 'Criaturas só defendem a própria faixa; apenas o herói pode defender qualquer casa',
    status: 'Hipótese de Protótipo',
  },
  {
    id: 16,
    topic: 'Condição de Derrota',
    question: 'A morte do herói é a única condição de derrota? Não há regra de deck vazio ou limite de turnos no texto recebido.',
    currentDemoAssumption: 'Vida do Herói <= 0 encerra a partida como derrota',
    status: 'Hipótese de Protótipo',
  },
];
