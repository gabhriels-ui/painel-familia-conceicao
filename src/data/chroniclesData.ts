import type {
  AppState,
  EnemyConfig,
  MedicalExamEntry,
  MedicalExamType,
  OracleQuote,
  ReadingCategory,
  SpiritualActType,
  SpiritualDailyGoalKey,
  VaultConfig,
} from '../types/chronicles';

export const STORAGE_KEY = 'familia_conceicao_app_state_v5';
export const LEGACY_STORAGE_KEY = 'familia_conceicao_app_state_v4';
export const REAL_EXAMS_SEEDED_KEY = 'familia_conceicao_real_exams_seeded_v1';
export const HEIR_DUE_DATE_ISO = '2027-06-30T08:00:00';

export const REAL_INITIAL_MEDICAL_EXAMS: MedicalExamEntry[] = [
  {
    id: 'real_holter_24h',
    examType: 'holter',
    examLabel: 'Holter de 24h',
    examDate: '2026-03-10',
    resultSummary: '4.848 ESV · 658 EV · FC média 60 bpm',
    metricsDetail:
      'Extrassístoles Supraventriculares (ESV): 4.848 · Extrassístoles Ventriculares (EV): 658 · FC Média: 60 bpm',
    status: 'acompanhar',
    notes: 'Histórico clínico nativo · Monitoramento cardiológico periódico de ectopias.',
    createdAtIso: '2026-03-10T10:00:00.000Z',
  },
  {
    id: 'real_ecocardiograma',
    examType: 'ecocardiograma',
    examLabel: 'Ecocardiograma Transtorácico',
    examDate: '2026-03-10',
    resultSummary: 'FE 74% · Insuficiência aórtica discreta',
    metricsDetail:
      'Fração de Ejeção (FE): 74% (função sistólica preservada) · Insuficiência aórtica discreta',
    status: 'acompanhar',
    notes: 'Histórico clínico nativo · Acompanhamento seriado com cardiologista.',
    createdAtIso: '2026-03-10T09:50:00.000Z',
  },
  {
    id: 'real_perfil_lipidico',
    examType: 'perfil_lipidico',
    examLabel: 'Perfil Lipídico',
    examDate: '2026-03-10',
    resultSummary: 'Colesterol Total 204 mg/dL · Triglicérides 172 mg/dL',
    metricsDetail:
      'Colesterol Total: 204 mg/dL · Triglicérides: 172 mg/dL',
    status: 'acompanhar',
    notes: 'Histórico clínico nativo · Manter calistenia regular e controle alimentar.',
    createdAtIso: '2026-03-10T09:40:00.000Z',
  },
  {
    id: 'real_glicemia_hba1c',
    examType: 'outro',
    examLabel: 'Glicemia & Hemoglobina Glicada',
    examDate: '2026-03-10',
    resultSummary: 'Glicose 90 mg/dL · HbA1c 5,5%',
    metricsDetail: 'Glicose em jejum: 90 mg/dL · HbA1c: 5,5% (sensibilidade insulínica preservada)',
    status: 'otimo',
    notes: 'Histórico clínico nativo · Controle glicêmico dentro da faixa ideal.',
    createdAtIso: '2026-03-10T09:30:00.000Z',
  },
  {
    id: 'real_hormonal_vitaminas',
    examType: 'outro',
    examLabel: 'Painel Hormonal & Vitaminas',
    examDate: '2026-03-10',
    resultSummary: 'Testosterona Total 498 ng/dL · Vitamina D 33,4 ng/dL · B12 206 pg/dL',
    metricsDetail:
      'Testosterona Total: 498 ng/dL · Vitamina D: 33,4 ng/dL · Vitamina B12: 206 pg/dL',
    status: 'acompanhar',
    notes: 'Histórico clínico nativo · Atenção à reposição/níveis de Vitamina B12 (206 pg/dL) e exposição solar para Vitamina D.',
    createdAtIso: '2026-03-10T09:20:00.000Z',
  },
  {
    id: 'real_hepatico_renal',
    examType: 'hemograma',
    examLabel: 'Função Hepática & Renal',
    examDate: '2026-03-10',
    resultSummary: 'TGP 44 U/L · Creatinina 0,9 mg/dL',
    metricsDetail: 'TGP (ALT): 44 U/L · Creatinina sérica: 0,9 mg/dL (função renal preservada com creatina)',
    status: 'otimo',
    notes: 'Histórico clínico nativo · Hidratação de 3L+/dia protegendo função renal.',
    createdAtIso: '2026-03-10T09:10:00.000Z',
  },
];

export const DEFAULT_STATE: AppState = {
  box1: 0,
  box2: 0,
  box3: 0,
  box4: 0,
  currentCarValue: 33000,
  xp: 0,
  streak: 0,
  arenaWins: 0,
  activeTab: 'comando',
  oracleIdx: 0,
  rosaryDecades: 0,
  rosaryCompleted: 0,
  providerDuties: {},
  letters: [],
  cdiTotal: 0,
  ledger: [],
  transactions: [],
  recurringCosts: [],
  tacticalExpenses: [],
  xpHistory: {},
  unlockedMilestones: {},
  feudChecklist: {
    feudo_3_enxoval: false,
    feudo_3_nascimento: false,
    feudo_4_ipva: false,
    feudo_4_emprestimo: false,
    feudo_6_investimentos: false,
    feudo_6_quitacao_casa: false,
  },
  soundEnabled: true,
  spiritual: {
    spiritualXp: 0,
    lastPrayerDate: '',
    lastDecayDate: '',
    novenaStreak: 0,
    novenaLastDate: '',
    dailyGoalDate: '',
    dailyGoals: {
      oracao: false,
      dezena: false,
      lectio: false,
      novena: false,
    },
    decayedXpTotal: 0,
    pmDutyDate: '',
  },
  spiritualLogs: [],
  vocational: {
    tccTheme: 'Atuação da Polícia Militar e Garantias Fundamentais na Segurança Pública',
    tccStages: {
      stage_0: false,
      stage_1: false,
      stage_2: false,
      stage_3: false,
      stage_4: false,
      stage_5: false,
    },
    academicXp: 0,
    brainXp: 0,
    bodyXp: 0,
    pmEquipment: {
      eq_0: false,
      eq_1: false,
      eq_2: false,
      eq_3: false,
      eq_4: false,
      eq_5: false,
    },
    studyHours: {
      cfo: 0,
      prf: 0,
      pf: 0,
    },
    pullupBest: 8,
    pullupTarget: 15,
    workoutsTotal: 0,
    creatineStockGrams: 300,
    creatineDailyDoseGrams: 5,
    creatineLastTakenDate: '',
    healthChecks: {
      hydration: false,
      sleep: false,
      mobility: false,
    },
  },
  missionEntries: [],
  marriageCouples: [],
  readingLogs: [],
  medicalExams: REAL_INITIAL_MEDICAL_EXAMS,
};

export const ORACLE_QUOTES: OracleQuote[] = [
  // 5 pontos de Caminho
  {
    book: 'Caminho',
    saint: 'São Josemaría Escrivá',
    work: 'Caminho, 15',
    text: '“Não deixes o teu trabalho para amanhã: olha que o que hoje deixas por fazer é uma perda irreparável para ti e para a tua família.”',
  },
  {
    book: 'Caminho',
    saint: 'São Josemaría Escrivá',
    work: 'Caminho, 359',
    text: '“Põe um motivo sobrenatural na tua atividade profissional de cada dia, e terás santificado o trabalho.”',
  },
  {
    book: 'Caminho',
    saint: 'São Josemaría Escrivá',
    work: 'Caminho, 725',
    text: '“Não tenhas medo da luta: a paz não é ausência de combate, mas a vitória da ordem interior sobre o capricho.”',
  },
  {
    book: 'Caminho',
    saint: 'São Josemaría Escrivá',
    work: 'Caminho, 815',
    text: '“Tens a obrigação de te santificares. Tu também. A todos, sem exceção, disse o Senhor: Sede perfeitos, como Meu Pai Celestial é perfeito.”',
  },
  {
    book: 'Caminho',
    saint: 'São Josemaría Escrivá',
    work: 'Caminho, 998',
    text: '“Sê firme na tua palavra e fiel nos pequenos deveres de cada hora; aí se forja a temperança de um verdadeiro chefe de família.”',
  },
  // 5 pontos de Sulco
  {
    book: 'Sulco',
    saint: 'São Josemaría Escrivá',
    work: 'Sulco, 180',
    text: '“A fortaleza não consiste em não sentir o peso do dia, mas em permanecer firme no posto que Deus te confiou.”',
  },
  {
    book: 'Sulco',
    saint: 'São Josemaría Escrivá',
    work: 'Sulco, 492',
    text: '“A verdadeira virtude não é triste nem antipática, mas amavelmente alegre. Guarda a serenidade e o bom humor no teu lar, mesmo quando o combate for duro.”',
  },
  {
    book: 'Sulco',
    saint: 'São Josemaría Escrivá',
    work: 'Sulco, 527',
    text: '“Que a tua vida não seja uma vida estéril. Sê útil. Deixa rasto. Ilumina com o resplendor da tua fé e do teu amor.”',
  },
  {
    book: 'Sulco',
    saint: 'São Josemaría Escrivá',
    work: 'Sulco, 782',
    text: '“Quem governa os seus impulsos e ordena a sua casa constrói sobre rocha e não teme as tempestades do mês.”',
  },
  {
    book: 'Sulco',
    saint: 'São Josemaría Escrivá',
    work: 'Sulco, 916',
    text: '“Reza com perseverança pelo teu lar: cada dezena do Terço é uma muralha invisível ao redor dos teus.”',
  },
  // 5 pontos de Forja
  {
    book: 'Forja',
    saint: 'São Josemaría Escrivá',
    work: 'Forja, 121',
    text: '“Recomeçar sempre, sem desânimo: a vitória pertence ao que não entrega a guarda quando o cansaço aperta.”',
  },
  {
    book: 'Forja',
    saint: 'São Josemaría Escrivá',
    work: 'Forja, 488',
    text: '“Guarda a sobriedade nos bens materiais para que nunca falte liberdade de espírito diante de Deus e dos homens.”',
  },
  {
    book: 'Forja',
    saint: 'São Josemaría Escrivá',
    work: 'Forja, 681',
    text: '“Oferece a Deus o suor de cada turno de trabalho; assim o teu sustento se transforma em oração viva.”',
  },
  {
    book: 'Forja',
    saint: 'São Josemaría Escrivá',
    work: 'Forja, 745',
    text: '“Senhor, dá-me a santa intransigência nas coisas da fé e dos deveres do meu estado, e a santa transigência com as pessoas que amo.”',
  },
  {
    book: 'Forja',
    saint: 'São Josemaría Escrivá',
    work: 'Forja, 932',
    text: '“Tudo se vence no amor de Deus: a paciência silenciosa hoje prepara a colheita abundante de amanhã.”',
  },
  {
    book: 'Santos',
    saint: 'São José',
    work: 'Guarda da Sagrada Família',
    text: '“O homem justo guarda a sua casa no silêncio, no trabalho fiel e na obediência imediata a Deus.”',
  },
  {
    book: 'Santos',
    saint: 'São Miguel Arcanjo',
    work: 'Príncipe da Milícia Celeste',
    text: '“Quem como Deus? Permanecei firmes na brecha e revesti-vos da armadura da luz contra toda cilada.”',
  },
];

export const JACULATORIAS: string[] = [
  'Jesus, manso e humilde de coração, fazei o nosso coração semelhante ao Vosso.',
  'São José, providente guarda da Sagrada Família, rogai por nós e pelo nosso lar.',
  'São Miguel Arcanjo, defendei-nos no combate contra todo impulso e cilada.',
  'Meu Deus, eu Vos amo acima de todas as coisas e guardo minha casa na temperança.',
];

export const PROVIDER_TASKS: { title: string; detail: string }[] = [
  {
    title: 'Teto Sagrado',
    detail: 'Financiamento Caixa · R$ 616,88 em dia',
  },
  {
    title: 'Mesa Farta e Abençoada',
    detail: 'Supermercado planejado sem supérfluos',
  },
  {
    title: 'Infraestrutura do Lar',
    detail: 'Energia, água, gás e internet quitados',
  },
  {
    title: 'Amparo à Esposa e Bebê',
    detail: 'Saúde, pré-natal e provisões do herdeiro',
  },
  {
    title: 'Mobilidade Racional',
    detail: 'Combustível e manutenção preventiva sob controle',
  },
  {
    title: 'Honra de Crédito',
    detail: 'Fatura do cartão Mercado Pago zerada sem rotativo',
  },
];

export const VAULTS: VaultConfig[] = [
  {
    id: 1,
    roman: 'Arca I',
    title: 'Cartão Mercado Pago',
    subtitle: 'Quitação prioritária e libertação do crédito',
    target: 6829,
    priorityLabel: 'Meta de Quitação: R$ 6.829,00',
  },
  {
    id: 2,
    roman: 'Arca II',
    title: 'Muralha da Família',
    subtitle: 'Reserva de emergência e proteção imediata do lar',
    target: 12000,
    priorityLabel: 'Meta Prioritária: R$ 12.000,00',
  },
  {
    id: 3,
    roman: 'Arca III',
    title: 'Corolla XEi 2017',
    subtitle: 'Complemento à vista somado ao valor da montaria atual',
    target: 45000,
    priorityLabel: 'Meta: R$ 45.000,00 (+ montaria atual)',
  },
  {
    id: 4,
    roman: 'Arca IV',
    title: 'Legado e Tesouro IPCA+',
    subtitle: 'Amortização da casa própria e patrimônio do herdeiro',
    target: 50000,
    isLongTerm: true,
    priorityLabel: 'Marco Inicial de Legado: R$ 50.000,00',
  },
];

export const ARENA_ENEMIES: EnemyConfig[] = [
  {
    id: 'rotativo',
    name: 'Demônio dos Juros Rotativos',
    title: 'Suserano das Taxas Compostas',
    maxHp: 110,
    attackPower: 18,
    heavyAttackPower: 36,
    attackName: 'Mordida de Juros Mensais',
    heavyAttackName: 'Espiral do Rotativo (14% a.m.)',
    xpReward: 260,
    description: 'Alimenta-se de faturas parceladas e tenta esgotar sua reserva com juros compostos.',
  },
  {
    id: 'impulso',
    name: 'Espectro da Compra por Impulso',
    title: 'Sussurrador da Oferta Relâmpago',
    maxHp: 125,
    attackPower: 20,
    heavyAttackPower: 40,
    attackName: 'Sussurro do Carrinho Cheio',
    heavyAttackName: 'Ilusão da Parcela Pequena',
    xpReward: 310,
    description: 'Surge nos momentos de fadiga prometendo alívio imediato em troca do futuro da família.',
  },
  {
    id: 'inflacao',
    name: 'Dragão da Inflação',
    title: 'Devorador Silencioso do Poder de Compra',
    maxHp: 150,
    attackPower: 22,
    heavyAttackPower: 44,
    attackName: 'Baforada da Carestia',
    heavyAttackName: 'Chama do Custo de Vida',
    xpReward: 380,
    description: 'Corrói moedas paradas sem rendimento; só cai diante do CDI e de ativos indexados ao IPCA+.',
  },
  {
    id: 'procrastinacao',
    name: 'Sombra da Procrastinação',
    title: 'Guardiã do Amanhã Infinito',
    maxHp: 170,
    attackPower: 24,
    heavyAttackPower: 48,
    attackName: 'Névoa do Adiamento',
    heavyAttackName: 'Torpor da Omissão Total',
    xpReward: 460,
    description: 'Adia orações, registros e deveres do lar até que a disciplina retome a espada.',
  },
];

export const RELICS: import('../types/chronicles').RelicDefinition[] = [
  {
    id: 'primeiro_milhar',
    name: 'Primeiro Milhar',
    requirement: 'Acumular R$ 1.000,00 somados nas Arcas',
    isUnlocked: (s) => (s.box1 || 0) + (s.box2 || 0) + (s.box3 || 0) + (s.box4 || 0) >= 1000,
  },
  {
    id: 'guardiao_fiel',
    name: 'Guardião Fiel',
    requirement: 'Vencer 5 vigílias de 60 segundos contra o impulso',
    isUnlocked: (s) => (s.streak || 0) >= 5,
  },
  {
    id: 'cavaleiro_rosario',
    name: 'Cavaleiro do Rosário',
    requirement: 'Completar pelo menos 1 Santo Terço pela família',
    isUnlocked: (s) => (s.rosaryCompleted || 0) >= 1,
  },
  {
    id: 'muralha_erguida',
    name: 'Muralha Erguida',
    requirement: 'Atingir 50% (R$ 6.000,00) da Arca II · Muralha da Família',
    isUnlocked: (s) => (s.box2 || 0) >= 6000,
  },
  {
    id: 'libertador_credito',
    name: 'Libertador do Crédito',
    requirement: 'Completar 100% da Arca I (R$ 6.829,00)',
    isUnlocked: (s) => (s.box1 || 0) >= 6829,
  },
  {
    id: 'matador_gigantes',
    name: 'Campeão da Arena',
    requirement: 'Derrotar qualquer chefe mensal na Arena de Combate',
    isUnlocked: (s) => (s.arenaWins || 0) >= 1,
  },
  {
    id: 'provedor_nazare',
    name: 'Oficina de Nazaré',
    requirement: 'Cumprir os 6 deveres de São José no mês',
    isUnlocked: (s) => PROVIDER_TASKS.every((_, idx) => !!s.providerDuties?.[idx]),
  },
  {
    id: 'escriba_real',
    name: 'Escriba Real',
    requirement: 'Lacrar ao menos 1 carta na Cápsula do Tempo 2027',
    isUnlocked: (s) => (s.letters?.length || 0) >= 1,
  },
];

export const ROSARY_MYSTERIES: { days: string; name: string; focus: string }[] = [
  { days: 'Domingo e Quarta', name: 'Mistérios Gloriosos', focus: 'Ressurreição, Esperança e Reino Eterno' },
  { days: 'Segunda e Sábado', name: 'Mistérios Gozosos', focus: 'Anunciação, Sagrada Família e Chegada do Filho' },
  { days: 'Terça e Sexta', name: 'Mistérios Dolorosos', focus: 'Sacrifício, Coragem na Cruz e Redenção' },
  { days: 'Quinta-feira', name: 'Mistérios Luminosos', focus: 'Luz de Cristo, Matrimônio em Caná e Eucaristia' },
];

export const TCC_STAGES: { key: string; title: string; detail: string }[] = [
  {
    key: 'stage_0',
    title: 'Delimitação do Tema (Segurança Pública)',
    detail: 'Recorte jurídico e justificativa institucional — 8º Período AGES',
  },
  {
    key: 'stage_1',
    title: 'Pesquisa Bibliográfica e Jurisprudência',
    detail: 'Doutrina penal/constitucional, STF/STJ e legislação aplicável',
  },
  {
    key: 'stage_2',
    title: 'Projeto de Pesquisa Aprovado',
    detail: 'Avaliação do orientador e validação metodológica na AGES',
  },
  {
    key: 'stage_3',
    title: 'Redação dos Capítulos Centrais',
    detail: 'Desenvolvimento teórico, análise operacional e argumentação',
  },
  {
    key: 'stage_4',
    title: 'Revisão ABNT e Depósito Preliminar',
    detail: 'Formatação, citações, referências e revisão ortográfica final',
  },
  {
    key: 'stage_5',
    title: 'Defesa Pública na Banca Examinadora',
    detail: 'Apresentação oral e aprovação do TCC em Direito',
  },
];

export const PM_EQUIPMENT_ITEMS: { key: string; title: string; detail: string }[] = [
  {
    key: 'eq_0',
    title: 'Cinto de Guarnição & Coldre Tático',
    detail: 'Trava de retenção, carregadores e alinhamento conferidos',
  },
  {
    key: 'eq_1',
    title: 'Colete Balístico & Placas',
    detail: 'Validade, ajuste das alças e capa tática verificados',
  },
  {
    key: 'eq_2',
    title: 'Rádio Comunicador (HT) & Bateria',
    detail: 'Frequência da 2ª Cia / 11º BPM e carga em 100%',
  },
  {
    key: 'eq_3',
    title: 'Lanterna Tática, Tonfa & Algemas',
    detail: 'Chaves de algema duplas e iluminação operacional testadas',
  },
  {
    key: 'eq_4',
    title: 'Fardamento Operacional & Funcional',
    detail: 'Identificação PMSE, tarja e apresentação pessoal em ordem',
  },
  {
    key: 'eq_5',
    title: 'Kit APH & Caderno de Ocorrências',
    detail: 'Torniquete/curativos, caneta e documentação de plantão',
  },
];

export const CONCURSO_TRACKS: {
  key: 'cfo' | 'prf' | 'pf';
  name: string;
  subtitle: string;
  targetHours: number;
}[] = [
  {
    key: 'cfo',
    name: 'CFO PMSE',
    subtitle: 'Curso de Formação de Oficiais · Sergipe',
    targetHours: 120,
  },
  {
    key: 'prf',
    name: 'PRF',
    subtitle: 'Polícia Rodoviária Federal · Legislação & Física',
    targetHours: 150,
  },
  {
    key: 'pf',
    name: 'Polícia Federal',
    subtitle: 'Agente / Escrivão / Delegado · Contabilidade & TI',
    targetHours: 150,
  },
];

export const HEALTH_ROUTINE_ITEMS: { key: string; label: string; detail: string }[] = [
  {
    key: 'hydration',
    label: 'Hidratação Mínima (3L+)',
    detail: 'Essencial para absorção da Creatina Monohydrate e plantões',
  },
  {
    key: 'sleep',
    label: 'Recuperação & Sono Regulado',
    detail: 'Higiene do sono entre escalas da 2ª Cia e estudos',
  },
  {
    key: 'mobility',
    label: 'Mobilidade Articular & Escápulas',
    detail: 'Prevenção de lesões para barra fixa e colete balístico',
  },
];

export const MARRIAGE_PREP_TOPICS: string[] = [
  'Encontro I · Vocação Cristã ao Matrimônio & Sacramento',
  'Encontro II · Diálogo Conjugal, Perdão & Temperança',
  'Encontro III · Vida de Oração, Eucaristia & Igreja Doméstica',
  'Encontro IV · Mordomia Cristã, Finanças & Projeto de Família',
  'Encontro V · Paternidade Responsável, Castidade & Fidelidade',
];

export const READING_CATEGORIES: {
  key: ReadingCategory;
  label: string;
  subtitle: string;
  accent: string;
}[] = [
  {
    key: 'espiritual',
    label: 'Livros Espirituais',
    subtitle: 'Escrivá, Patrística & Formação Interior',
    accent: '#fde047',
  },
  {
    key: 'literatura',
    label: 'Literatura Clássica',
    subtitle: 'Chesterton, Tolkien, Clássicos & Humanidades',
    accent: '#38bdf8',
  },
  {
    key: 'tcc',
    label: 'Pesquisa TCC',
    subtitle: 'Doutrina Penal & Segurança Pública (AGES)',
    accent: '#c084fc',
  },
  {
    key: 'direito',
    label: 'Direito & Concursos',
    subtitle: 'AGES 8º Período · CFO PMSE, PRF e PF',
    accent: '#34d399',
  },
];

export const BRAIN_TIERS: {
  minXp: number;
  name: string;
  desc: string;
}[] = [
  { minXp: 0, name: 'Centelha Inicial', desc: 'Primeiras sinapses despertas' },
  { minXp: 150, name: 'Conexão Arcana', desc: 'Feixes neurais em consolidação' },
  { minXp: 400, name: 'Mente Estratégica', desc: 'Rede sináptica de alta clareza' },
  { minXp: 800, name: 'Cidadela Sábia', desc: 'Sabedoria e intelecto em plena luz' },
];

export const BODY_AVATAR_TIERS: {
  minXp: number;
  name: string;
  desc: string;
}[] = [
  { minXp: 0, name: 'Recruta da Guarnição', desc: 'Postura firme e disciplina em forja' },
  { minXp: 150, name: 'Vanguarda de Ferro', desc: 'Placa peitoral e antebraço blindados' },
  { minXp: 400, name: 'Guardião de Aço', desc: 'Escudo real e ombreiras de batalha' },
  { minXp: 800, name: 'Paladino Dourado', desc: 'Armadura plena, manto e aura de vigor' },
];

export const MEDICAL_EXAM_TEMPLATES: {
  type: MedicalExamType;
  label: string;
  defaultSummaryPlaceholder: string;
  metricsPlaceholder: string;
}[] = [
  {
    type: 'holter',
    label: 'Holter 24h',
    defaultSummaryPlaceholder: 'Ex: Ritmo sinusal preservado, sem arritmias complexas',
    metricsPlaceholder: 'Ex: FC média 68 bpm · Mín 49 / Máx 142 bpm · Ectopias raras',
  },
  {
    type: 'ecocardiograma',
    label: 'Ecocardiograma',
    defaultSummaryPlaceholder: 'Ex: Função sistólica preservada, câmaras em dimensões normais',
    metricsPlaceholder: 'Ex: FEVE 66% · Valvas íntegras · Sem sobrecarga cavitária',
  },
  {
    type: 'perfil_lipidico',
    label: 'Perfil Lipídico',
    defaultSummaryPlaceholder: 'Ex: Colesterol e frações dentro das metas cardiovasculares',
    metricsPlaceholder: 'Ex: CT 168 · HDL 58 · LDL 92 · Triglicérides 88 mg/dL',
  },
  {
    type: 'hemograma',
    label: 'Hemograma Completo',
    defaultSummaryPlaceholder: 'Ex: Série vermelha, branca e plaquetas equilibradas',
    metricsPlaceholder: 'Ex: Hb 15,2 g/dL · Ht 45% · Leucócitos 6.400 · Plaquetas 245 mil',
  },
  {
    type: 'outro',
    label: 'Outro Exame Clínico',
    defaultSummaryPlaceholder: 'Ex: Glicemia em jejum, função renal (creatinina) ou TSH',
    metricsPlaceholder: 'Ex: Glicemia 86 mg/dL · Creatinina 0,95 mg/dL · PA 118/76 mmHg',
  },
];

export interface SpiritualActDefinition {
  type: SpiritualActType;
  label: string;
  shortLabel: string;
  category: 'diaria' | 'devocao' | 'sacramento';
  categoryLabel: string;
  description: string;
  baseXp: number;
  goalKey?: SpiritualDailyGoalKey;
}

export const SPIRITUAL_ACTS: SpiritualActDefinition[] = [
  {
    type: 'manha_noite',
    label: 'Orações da Manhã / Noite',
    shortLabel: 'Oração Manhã/Noite',
    category: 'diaria',
    categoryLabel: 'Regra Diária',
    description: 'Oferecimento de obras ao acordar e exame de consciência ao deitar',
    baseXp: 25,
    goalKey: 'oracao',
  },
  {
    type: 'dezena',
    label: 'Dezena do Santo Terço',
    shortLabel: 'Dezena do Terço',
    category: 'diaria',
    categoryLabel: 'Regra Diária',
    description: 'Um mistério meditado em silêncio pela esposa, herdeiro e missão',
    baseXp: 35,
    goalKey: 'dezena',
  },
  {
    type: 'lectio_divina',
    label: 'Lectio Divina (Evangelho do Dia)',
    shortLabel: 'Lectio Divina',
    category: 'diaria',
    categoryLabel: 'Regra Diária',
    description: 'Leitura orante, meditação e propósito concreto da Palavra de Deus',
    baseXp: 45,
    goalKey: 'lectio',
  },
  {
    type: 'novena_sao_jose',
    label: 'Novena de São José (Gestação & Matrimônio)',
    shortLabel: 'Novena de São José',
    category: 'diaria',
    categoryLabel: 'Regra Diária',
    description: 'Intercessão ininterrupta pela saúde da gestação e pelo vínculo conjugal',
    baseXp: 60,
    goalKey: 'novena',
  },
  {
    type: 'comunhao',
    label: 'Comunhão Eucarística',
    shortLabel: 'Sagrada Comunhão',
    category: 'sacramento',
    categoryLabel: 'Sacramento',
    description: 'Receber o Corpo de Cristo em estado de graça no altar',
    baseXp: 80,
  },
  {
    type: 'adoracao',
    label: 'Adoração Eucarística',
    shortLabel: 'Adoração ao Santíssimo',
    category: 'devocao',
    categoryLabel: 'Devoção Maior',
    description: 'Vigília silenciosa diante do Santíssimo Sacramento exposto ou sacrário',
    baseXp: 100,
  },
  {
    type: 'terco_completo',
    label: 'Terço Completo (5 Mistérios)',
    shortLabel: 'Terço Completo',
    category: 'devocao',
    categoryLabel: 'Devoção Maior',
    description: 'Coroa inteira do Rosário ofertada pela proteção da Família Conceição',
    baseXp: 120,
    goalKey: 'dezena',
  },
  {
    type: 'santa_missa',
    label: 'Santa Missa (Preceito / Diária)',
    shortLabel: 'Santa Missa',
    category: 'sacramento',
    categoryLabel: 'Sacramento',
    description: 'Participação plena no Santo Sacrifício do Altar dominical ou ferial',
    baseXp: 150,
  },
  {
    type: 'confissao',
    label: 'Confissão Mensal (Reconciliação)',
    shortLabel: 'Confissão Sacramental',
    category: 'sacramento',
    categoryLabel: 'Sacramento',
    description: 'Renovação da alma pela absolvição sacramental e firme propósito',
    baseXp: 200,
  },
];

export const SPIRITUAL_DAILY_GOALS: {
  key: SpiritualDailyGoalKey;
  actType: SpiritualActType;
  label: string;
  detail: string;
}[] = [
  {
    key: 'oracao',
    actType: 'manha_noite',
    label: 'Orações Manhã / Noite',
    detail: 'Oferecimento e Exame',
  },
  {
    key: 'dezena',
    actType: 'dezena',
    label: '1+ Dezena do Terço',
    detail: 'Rosário pela família',
  },
  {
    key: 'lectio',
    actType: 'lectio_divina',
    label: 'Lectio Divina',
    detail: 'Evangelho do dia',
  },
  {
    key: 'novena',
    actType: 'novena_sao_jose',
    label: 'Novena de São José',
    detail: 'Gestação & Matrimônio',
  },
];

export const SPIRITUAL_RANKS: {
  minStrength: number;
  title: string;
  subtitle: string;
}[] = [
  { minStrength: 0, title: 'Alma em Vigília', subtitle: 'Retomando a escuta interior na oração' },
  { minStrength: 25, title: 'Centelha de Fé', subtitle: 'Chama acesa na rotina diária do lar' },
  { minStrength: 50, title: 'Sentinela da Graça', subtitle: 'Perseverança fiel nos deveres com Deus' },
  { minStrength: 75, title: 'Templo do Espírito', subtitle: 'Vida sacramental firme e coração atento' },
  { minStrength: 90, title: 'Fortaleza em Deus', subtitle: 'Comunhão plena e luz sagrada constante' },
];


