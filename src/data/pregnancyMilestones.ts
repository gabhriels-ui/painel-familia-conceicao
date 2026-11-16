export interface GestationalWeekMilestone {
  week: number;
  trimester: 1 | 2 | 3;
  fruitComparison: string;
  sizeApprox: string;
  weightApprox: string;
  organDevelopment: string;
  paternalDirective: string;
  fruitTone: 'gold' | 'emerald' | 'crimson' | 'amber';
}

export const DUM_ISO = '2026-09-23';
export const DPP_ISO = '2027-06-30';
export const TOTAL_GESTATION_DAYS = 280; // 40 semanas exatas entre 23/09/2026 e 30/06/2027

export const PREGNANCY_WEEK_MILESTONES: GestationalWeekMilestone[] = [
  {
    week: 1,
    trimester: 1,
    fruitComparison: 'Semente de Luz (Preparação)',
    sizeApprox: '< 0,1 mm',
    weightApprox: '< 1 g',
    organDevelopment:
      'Ciclo de preparação uterina que antecede a fecundação e estabelece a contagem obstétrica oficial a partir da DUM.',
    paternalDirective:
      'Consagre este novo ciclo em oração com sua esposa e organize o orçamento mensal para acolher a nova vida sem sobressaltos.',
    fruitTone: 'gold',
  },
  {
    week: 2,
    trimester: 1,
    fruitComparison: 'Grão Microscópico',
    sizeApprox: '0,1 mm',
    weightApprox: '< 1 g',
    organDevelopment:
      'Maturação folicular e janela fértil preparando o encontro celular que dará início ao código genético único do herdeiro.',
    paternalDirective:
      'Mantenha o lar sereno, reduza pressões desnecessárias e reforce a constância no Terço e na provisão da casa.',
    fruitTone: 'gold',
  },
  {
    week: 3,
    trimester: 1,
    fruitComparison: 'Ponta de Alfinete (Blastocisto)',
    sizeApprox: '0,2 mm',
    weightApprox: '< 1 g',
    organDevelopment:
      'Fecundação concluída e rápida divisão celular formando o blastocisto que migra em direção ao útero.',
    paternalDirective:
      'Garanta tranquilidade emocional à esposa e comece a blindar a Arca I para entrar na gestação com crédito livre.',
    fruitTone: 'gold',
  },
  {
    week: 4,
    trimester: 1,
    fruitComparison: 'Semente de Papoula',
    sizeApprox: '2 mm',
    weightApprox: '< 1 g',
    organDevelopment:
      'Nidação no endométrio e formação do saco vitelínico, da placenta inicial e das três camadas germinativas que originarão todos os órgãos.',
    paternalDirective:
      'Agende a primeira consulta de pré-natal, confira o plano de saúde e registre a data no calendário de prioridades do lar.',
    fruitTone: 'amber',
  },
  {
    week: 5,
    trimester: 1,
    fruitComparison: 'Semente de Gergelim',
    sizeApprox: '3 mm',
    weightApprox: '< 1 g',
    organDevelopment:
      'O tubo neural começa a se fechar para formar cérebro e medula espinhal; um minúsculo coração em forma de tubo inicia suas primeiras contrações.',
    paternalDirective:
      'Assegure ácido fólico/suplementação prescrita em dia e assuma tarefas pesadas da casa para poupar a fadiga materna.',
    fruitTone: 'amber',
  },
  {
    week: 6,
    trimester: 1,
    fruitComparison: 'Grão de Lentilha',
    sizeApprox: '5–6 mm',
    weightApprox: '< 1 g',
    organDevelopment:
      'Batimentos cardíacos ritmados tornam-se detectáveis; surgem os brotos dos braços e pernas, vesículas ópticas e esboço da mandíbula.',
    paternalDirective:
      'Acompanhe a esposa nos exames iniciais e tenha paciência redobrada diante de enjoos matinais e oscilações de cansaço.',
    fruitTone: 'amber',
  },
  {
    week: 7,
    trimester: 1,
    fruitComparison: 'Mirtilo (Blueberry)',
    sizeApprox: '1,2 cm',
    weightApprox: '~1 g',
    organDevelopment:
      'Os dois hemisférios cerebrais se expandem rapidamente; fígado, rins e pulmões iniciam estruturação interna e surgem os cotovelos e dedos unidos.',
    paternalDirective:
      'Reforce a hidratação e alimentação leve em casa e evite qualquer gasto por impulso que desvie recursos do pré-natal.',
    fruitTone: 'crimson',
  },
  {
    week: 8,
    trimester: 1,
    fruitComparison: 'Framboesa',
    sizeApprox: '1,6 cm',
    weightApprox: '~2 g',
    organDevelopment:
      'Coração já apresenta quatro câmaras pulsando forte; pálpebras, orelhas externas, ponta do nariz e os primeiros neurônios motores estão em formação.',
    paternalDirective:
      'Prepare a reserva específica de exames do 1º trimestre e reze diariamente com sua esposa pela saúde deste pequeno coração.',
    fruitTone: 'crimson',
  },
  {
    week: 9,
    trimester: 1,
    fruitComparison: 'Uva Verde',
    sizeApprox: '2,3 cm',
    weightApprox: '~3 g',
    organDevelopment:
      'Transição oficial para fase fetal: válvulas cardíacas amadurecem, dedos das mãos se alongam e músculos começam pequenos movimentos reflexos.',
    paternalDirective:
      'Reserve momentos exclusivos de descanso para a mãe e revise os custos recorrentes do mês antes do vencimento da Caixa.',
    fruitTone: 'emerald',
  },
  {
    week: 10,
    trimester: 1,
    fruitComparison: 'Azeitona / Morango Pequeno',
    sizeApprox: '3,1 cm',
    weightApprox: '~5 g',
    organDevelopment:
      'Todos os órgãos vitais — rins, intestinos, cérebro e fígado — já existem em miniatura e passam a crescer e amadurecer continuamente.',
    paternalDirective:
      'Organize a pasta de documentos e exames do pré-natal e fortaleça a rotina de paz e silêncio noturno no lar.',
    fruitTone: 'emerald',
  },
  {
    week: 11,
    trimester: 1,
    fruitComparison: 'Figo Fresco',
    sizeApprox: '4,1 cm',
    weightApprox: '~8 g',
    organDevelopment:
      'Ossos iniciam calcificação, mãos se abrem e fecham, folículos capilares e unhas surgem enquanto o diafragma se desenvolve.',
    paternalDirective:
      'Acompanhe o planejamento do ultrassom morfológico de 1º trimestre e celebre cada marco com gratidão à Providência.',
    fruitTone: 'gold',
  },
  {
    week: 12,
    trimester: 1,
    fruitComparison: 'Ameixa',
    sizeApprox: '5,4 cm',
    weightApprox: '~14 g',
    organDevelopment:
      'Reflexos de sucção e deglutição aparecem; rins já produzem urina e a medula óssea passa a auxiliar na formação de células sanguíneas.',
    paternalDirective:
      'Com o fim do 1º trimestre se aproximando, revise a Arca II (Muralha da Família) para consolidar segurança financeira.',
    fruitTone: 'crimson',
  },
  {
    week: 13,
    trimester: 1,
    fruitComparison: 'Pêssego Pequeno',
    sizeApprox: '7,4 cm',
    weightApprox: '~23 g',
    organDevelopment:
      'Impressões digitais exclusivas se formam nas pontas dos dedos; cordas vocais se estruturam e os intestinos se acomodam no abdômen.',
    paternalDirective:
      'Feche o balanço do 1º trimestre com sua esposa, planeje o anúncio familiar se desejarem e firme o compromisso do Feudo 3.',
    fruitTone: 'amber',
  },
  {
    week: 14,
    trimester: 2,
    fruitComparison: 'Limão Siciliano',
    sizeApprox: '8,7 cm',
    weightApprox: '~43 g',
    organDevelopment:
      'Início do 2º trimestre: fígado produz bile, baço produz hemácias, músculos faciais permitem expressões e o pescoço se alonga.',
    paternalDirective:
      'Aproveite a recuperação de energia da esposa para alinhar o cronograma do enxoval sem pressa e sem parcelamentos longos.',
    fruitTone: 'gold',
  },
  {
    week: 15,
    trimester: 2,
    fruitComparison: 'Maçã',
    sizeApprox: '10,1 cm',
    weightApprox: '~70 g',
    organDevelopment:
      'Ossículos do ouvido médio começam a captar vibrações e batimentos maternos; pernas crescem mais rápido que os braços.',
    paternalDirective:
      'Converse com o bebê perto da barriga diariamente para que reconheça a voz firme e amorosa do pai desde o ventre.',
    fruitTone: 'crimson',
  },
  {
    week: 16,
    trimester: 2,
    fruitComparison: 'Abacate',
    sizeApprox: '11,6 cm',
    weightApprox: '~100 g',
    organDevelopment:
      'Coração bombeia cerca de 25 litros de sangue por dia; músculos das costas ganham força e olhos já detectam variações sutis de luz.',
    paternalDirective:
      'Pesquise preços à vista de itens essenciais de berço e carrinho; evite compras emocionais fora da lista planejada.',
    fruitTone: 'emerald',
  },
  {
    week: 17,
    trimester: 2,
    fruitComparison: 'Pera',
    sizeApprox: '13 cm',
    weightApprox: '~140 g',
    organDevelopment:
      'Tecido adiposo marrom começa a se formar para ajudar na regulação térmica futura; cartilagens iniciam substituição gradual por osso.',
    paternalDirective:
      'Cuide do bem-estar postural da esposa e mantenha os aportes mensais das Arcas disciplinados nos dias 24 e 30.',
    fruitTone: 'emerald',
  },
  {
    week: 18,
    trimester: 2,
    fruitComparison: 'Pimentão / Batata-Doce',
    sizeApprox: '14,2 cm',
    weightApprox: '~190 g',
    organDevelopment:
      'Mielina começa a revestir nervos para acelerar impulsos cerebrais; sistema auditivo se aperfeiçoa e movimentos podem ser sentidos pela mãe.',
    paternalDirective:
      'Organize a agenda para estar presente no ultrassom morfológico de 2º trimestre e avalie necessidades de logística do lar.',
    fruitTone: 'amber',
  },
  {
    week: 19,
    trimester: 2,
    fruitComparison: 'Manga',
    sizeApprox: '15,3 cm',
    weightApprox: '~240 g',
    organDevelopment:
      'Áreas cerebrais dedicadas a olfato, paladar, audição, visão e tato se especializam; surge a vérnix caseosa protegendo a pele delicada.',
    paternalDirective:
      'Mantenha o foco no Feudo 3 (Enxoval) comprando apenas itens essenciais com pagamento à vista e alta durabilidade.',
    fruitTone: 'gold',
  },
  {
    week: 20,
    trimester: 2,
    fruitComparison: 'Banana',
    sizeApprox: '16,4 cm (topo-nádega) · 25 cm total',
    weightApprox: '~300 g',
    organDevelopment:
      'Marco da metade da gestação: engole líquido amniótico treinando o sistema digestivo e produz mecônio; sobrancelhas e cabelos surgem.',
    paternalDirective:
      'Metade da travessia concluída! Faça um balanço de meio de campanha com sua esposa e agradeça em oração por cada vitória.',
    fruitTone: 'gold',
  },
  {
    week: 21,
    trimester: 2,
    fruitComparison: 'Cenoura Grande',
    sizeApprox: '26,7 cm',
    weightApprox: '~360 g',
    organDevelopment:
      'Medula óssea assume o protagonismo na produção de glóbulos vermelhos; papilas gustativas percebem sabores transmitidos pelo líquido amniótico.',
    paternalDirective:
      'Incentive alimentação nutritiva em casa e assuma compras de mercado planejadas para garantir qualidade sem desperdício.',
    fruitTone: 'amber',
  },
  {
    week: 22,
    trimester: 2,
    fruitComparison: 'Mamão Papaia',
    sizeApprox: '27,8 cm',
    weightApprox: '~430 g',
    organDevelopment:
      'Pâncreas desenvolve células produtoras de hormônios; sentido do tato se refina e o bebê já apalpa o próprio rosto e o cordão umbilical.',
    paternalDirective:
      'Inicie os primeiros ajustes práticos no quarto ou cantinho do bebê, preservando organização e ambiente sereno em casa.',
    fruitTone: 'amber',
  },
  {
    week: 23,
    trimester: 2,
    fruitComparison: 'Toranja Grande',
    sizeApprox: '28,9 cm',
    weightApprox: '~500 g',
    organDevelopment:
      'Vasos sanguíneos nos pulmões se multiplicam preparando o aparelho respiratório; movimentos rápidos dos olhos (REM) já acontecem no sono.',
    paternalDirective:
      'Confira o cronograma de vacinas maternas (dTpa/influenza conforme médico) e garanta a reserva da Arca II intacta.',
    fruitTone: 'crimson',
  },
  {
    week: 24,
    trimester: 2,
    fruitComparison: 'Espiga de Milho',
    sizeApprox: '30 cm',
    weightApprox: '~600 g',
    organDevelopment:
      'Pulmões começam a produzir surfactante, substância vital para manter os alvéolos abertos após o nascimento; ouvido interno controla o equilíbrio.',
    paternalDirective:
      'Prepare a rotina para o exame de curva glicêmica materna e mantenha a casa livre de estresses desnecessários.',
    fruitTone: 'gold',
  },
  {
    week: 25,
    trimester: 2,
    fruitComparison: 'Nabo / Couve-Flor Média',
    sizeApprox: '34,6 cm',
    weightApprox: '~660 g',
    organDevelopment:
      'Capilares sob a pele dão tom rosado; narinas começam a se abrir e o bebê responde com movimentos mais coordenados à voz do pai e da mãe.',
    paternalDirective:
      'Defina o plano de logística de transporte até a maternidade e verifique a manutenção preventiva da montaria familiar.',
    fruitTone: 'emerald',
  },
  {
    week: 26,
    trimester: 2,
    fruitComparison: 'Abobrinha / Alface Americana',
    sizeApprox: '35,6 cm',
    weightApprox: '~760 g',
    organDevelopment:
      'Pálpebras começam a se abrir; rede neural auditiva responde com clareza a vozes conhecidas e batimentos cardíacos são audíveis por estetoscópio.',
    paternalDirective:
      'Avalie com a esposa quem comporá a rede de apoio imediata nos primeiros dias pós-parto para proteger o descanso do lar.',
    fruitTone: 'emerald',
  },
  {
    week: 27,
    trimester: 2,
    fruitComparison: 'Couve-Flor Grande',
    sizeApprox: '36,6 cm',
    weightApprox: '~875 g',
    organDevelopment:
      'Encerramento do 2º trimestre: atividade cerebral ganha ondas de sono mais definidas e pulmões ampliam a rede de bronquíolos.',
    paternalDirective:
      'Conclua as aquisições principais do enxoval antes da entrada no 3º trimestre para evitar fadiga e gastos de última hora.',
    fruitTone: 'gold',
  },
  {
    week: 28,
    trimester: 3,
    fruitComparison: 'Berinjela Grande',
    sizeApprox: '37,6 cm',
    weightApprox: '~1,0 kg',
    organDevelopment:
      'Início do 3º trimestre: cérebro desenvolve sulcos característicos e bilhões de conexões sinápticas; cílios e sobrancelhas já estão completos.',
    paternalDirective:
      'As consultas pré-natais se tornam mais frequentes: bloqueie sua agenda para acompanhar a esposa em cada etapa.',
    fruitTone: 'crimson',
  },
  {
    week: 29,
    trimester: 3,
    fruitComparison: 'Abóbora Menina Pequena',
    sizeApprox: '38,6 cm',
    weightApprox: '~1,15 kg',
    organDevelopment:
      'Músculos e pulmões continuam amadurecendo rápido; o cérebro passa a ajudar na regulação da temperatura corporal e da respiração rítmica.',
    paternalDirective:
      'Revise a lista da mala da maternidade da mãe e do bebê e organize a documentação necessária para a internação.',
    fruitTone: 'amber',
  },
  {
    week: 30,
    trimester: 3,
    fruitComparison: 'Repolho Grande',
    sizeApprox: '39,9 cm',
    weightApprox: '~1,32 kg',
    organDevelopment:
      'Crescimento rápido da massa cerebral e redução da lanugem corporal; o bebê acumula ferro, cálcio e fósforo essenciais para os primeiros meses.',
    paternalDirective:
      'Garanta que a Arca II (Muralha da Família) tenha folga pronta para eventualidades médicas e primeiras despesas do recém-nascido.',
    fruitTone: 'emerald',
  },
  {
    week: 31,
    trimester: 3,
    fruitComparison: 'Coco Grande',
    sizeApprox: '41,1 cm',
    weightApprox: '~1,50 kg',
    organDevelopment:
      'Todos os cinco sentidos funcionam em conjunto; conexões neuronais processam estímulos e padrões de vigília e sono ficam mais nítidos.',
    paternalDirective:
      'Teste e higienize itens como bebê-conforto e berço com antecedência, mantendo o lar calmo e acolhedor.',
    fruitTone: 'amber',
  },
  {
    week: 32,
    trimester: 3,
    fruitComparison: 'Jaca Pequena / Melão Cantalupo',
    sizeApprox: '42,4 cm',
    weightApprox: '~1,70 kg',
    organDevelopment:
      'Camada de gordura subcutânea preenche os bracinhos e pernas; o bebê pratica movimentos respiratórios ritmados com o diafragma.',
    paternalDirective:
      'Redobre o cuidado com o descanso da esposa, ajudando nas rotinas noturnas e preparando refeições práticas para congelar antes do parto.',
    fruitTone: 'gold',
  },
  {
    week: 33,
    trimester: 3,
    fruitComparison: 'Abacaxi',
    sizeApprox: '43,7 cm',
    weightApprox: '~1,92 kg',
    organDevelopment:
      'Ossos do corpo endurecem enquanto as suturas do crânio permanecem flexíveis para o nascimento; sistema imunológico recebe anticorpos maternos.',
    paternalDirective:
      'Deixe contatos do obstetra, pediatra e maternidade visíveis no telefone e revise o trajeto mais rápido de casa até o hospital.',
    fruitTone: 'gold',
  },
  {
    week: 34,
    trimester: 3,
    fruitComparison: 'Melão Grande',
    sizeApprox: '45 cm',
    weightApprox: '~2,15 kg',
    organDevelopment:
      'Sistema nervoso central e pulmões alcançam elevado grau de maturação; reservas de gordura e vérnix caseosa protegem contra frio pós-parto.',
    paternalDirective:
      'Finalize a mala da maternidade e deixe-a em local pronto. Mantenha tranquilidade exemplar diante da reta final.',
    fruitTone: 'emerald',
  },
  {
    week: 35,
    trimester: 3,
    fruitComparison: 'Melão Honeydew Grande',
    sizeApprox: '46,2 cm',
    weightApprox: '~2,38 kg',
    organDevelopment:
      'Rins estão plenamente desenvolvidos e o fígado já processa resíduos; o espaço uterino fica menor e os chutes dão lugar a alongamentos firmes.',
    paternalDirective:
      'Alinhe com seu trabalho ou liderança os procedimentos da licença-paternidade e combine cobertura de demandas críticas.',
    fruitTone: 'emerald',
  },
  {
    week: 36,
    trimester: 3,
    fruitComparison: 'Mamão Formosa',
    sizeApprox: '47,4 cm',
    weightApprox: '~2,62 kg',
    organDevelopment:
      'Circulação, sistema imunológico e musculatura de sucção estão prontos para o aleitamento; o bebê tende a se encaixar na pelve materna.',
    paternalDirective:
      'Tanque do carro sempre abastecido acima da metade, documentos na pasta e oração constante pela hora do parto.',
    fruitTone: 'amber',
  },
  {
    week: 37,
    trimester: 3,
    fruitComparison: 'Cacho de Acelga / Melancia Baby',
    sizeApprox: '48,6 cm',
    weightApprox: '~2,86 kg',
    organDevelopment:
      'Termo precoce alcançado: pulmões continuam reforçando surfactante e o ganho de peso gira em torno de 25 a 30 gramas por dia.',
    paternalDirective:
      'Vigília total com serenidade: saiba reconhecer sinais reais de trabalho de parto para conduzir a família sem afobação.',
    fruitTone: 'gold',
  },
  {
    week: 38,
    trimester: 3,
    fruitComparison: 'Abóbora Kabocha / Melancia Média',
    sizeApprox: '49,8 cm',
    weightApprox: '~3,08 kg',
    organDevelopment:
      'Órgãos totalmente funcionais para a vida extrauterina; reflexo de preensão palmar firme e cordas vocais prontas para o primeiro choro.',
    paternalDirective:
      'Escreva um último pergaminho na Oficina de São José antes do nascimento e proteja sua esposa de visitas ou cobranças excessivas.',
    fruitTone: 'crimson',
  },
  {
    week: 39,
    trimester: 3,
    fruitComparison: 'Melancia Pequena',
    sizeApprox: '50,7 cm',
    weightApprox: '~3,29 kg',
    organDevelopment:
      'Termo pleno! O cérebro segue formando conexões rápidas, a placenta fornece anticorpos finais e a pele adquire consistência madura.',
    paternalDirective:
      'Guarnição em prontidão máxima: mantenha calma, bom humor, oração contínua e apoio absoluto à mãe a cada hora.',
    fruitTone: 'gold',
  },
  {
    week: 40,
    trimester: 3,
    fruitComparison: 'Melancia Grande',
    sizeApprox: '51,2 cm',
    weightApprox: '~3,46 kg',
    organDevelopment:
      'Desenvolvimento gestacional concluído para o grande dia (DPP 30/06/2027). Todos os órgãos e sentidos estão prontos para o encontro nos braços da família.',
    paternalDirective:
      'Bem-vindo ao posto mais nobre de sua vida, Comandante! Acolha seu herdeiro com fé, fortaleza, ternura e gratidão a Deus.',
    fruitTone: 'gold',
  },
];

function parseUtcMidnight(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export interface GestationSnapshot {
  elapsedDays: number;
  remainingDays: number;
  completedWeeks: number;
  extraDays: number;
  currentWeekNumber: number; // 1..40 para seleção de marco
  progressPct: number;
  trimester: 1 | 2 | 3;
  status: 'pre-dum' | 'active' | 'post-term';
  milestone: GestationalWeekMilestone;
}

export function calculateGestationSnapshot(now = new Date()): GestationSnapshot {
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const dumUtc = parseUtcMidnight(DUM_ISO);
  const dppUtc = parseUtcMidnight(DPP_ISO);

  const rawElapsed = Math.floor((todayUtc - dumUtc) / 86400000);
  const rawRemaining = Math.max(0, Math.ceil((dppUtc - todayUtc) / 86400000));

  let status: GestationSnapshot['status'] = 'active';
  if (rawElapsed < 0) status = 'pre-dum';
  else if (rawElapsed > TOTAL_GESTATION_DAYS) status = 'post-term';

  const clampedElapsed = Math.max(0, Math.min(TOTAL_GESTATION_DAYS, rawElapsed));
  const completedWeeks = Math.floor(clampedElapsed / 7);
  const extraDays = clampedElapsed % 7;

  // Semana em curso no calendário obstétrico (ex: 7s 4d => 8ª semana de gestação)
  const currentWeekNumber = Math.max(
    1,
    Math.min(40, completedWeeks + (rawElapsed >= 0 ? 1 : 0))
  );

  const progressPct = Math.min(
    100,
    Math.max(0, Math.round((clampedElapsed / TOTAL_GESTATION_DAYS) * 1000) / 10)
  );

  const milestone =
    PREGNANCY_WEEK_MILESTONES.find((w) => w.week === currentWeekNumber) ||
    PREGNANCY_WEEK_MILESTONES[PREGNANCY_WEEK_MILESTONES.length - 1];

  return {
    elapsedDays: Math.max(0, rawElapsed),
    remainingDays: rawRemaining,
    completedWeeks,
    extraDays,
    currentWeekNumber,
    progressPct,
    trimester: milestone.trimester,
    status,
    milestone,
  };
}
