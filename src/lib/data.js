// Centraliza toda a lógica de dados da pauta.
// Cada pergunta tem 5 opções de resposta:
//  - opt1, opt2, opt3: soluções concretas sugeridas
//  - opt4: "Advogada retornará com análise"
//  - opt5: "Outro / texto aberto"

export const BLOCKS = {
  remuneracao: {
    id: "remuneracao",
    title: "Remuneração & PI",
    subtitle: "Como o dinheiro é dividido",
    color: "emerald",
    iconName: "DollarSign",
    questions: ["q2"],
    keywords: ["deduções", "custos taxativos", "rateio"]
  },
  propriedade: {
    id: "propriedade",
    title: "Propriedade Intelectual",
    subtitle: "Quem é dono do quê",
    color: "blue",
    iconName: "ShieldCheck",
    questions: ["q4", "q5", "q6"],
    keywords: ["anuidades", "patente", "projetos meus", "abandono"]
  },
  riscos: {
    id: "riscos",
    title: "Riscos & Proteções",
    subtitle: "O que pode dar errado",
    color: "amber",
    iconName: "AlertTriangle",
    questions: ["q7", "q8"],
    keywords: ["multa 10x", "falha de inovação", "teto"]
  },
  infra: {
    id: "infra",
    title: "Infraestrutura & Logística",
    subtitle: "Lab em Recife, Instituto em Goiás",
    color: "rose",
    iconName: "Truck",
    questions: ["q13", "q14"],
    keywords: ["insumos", "chips", "reembolso", "viagens"]
  },
  operacional: {
    id: "operacional",
    title: "Operacional",
    subtitle: "Como fazer funcionar",
    color: "violet",
    iconName: "Settings",
    questions: ["q10", "q11", "q12"],
    keywords: ["NF / RPA", "TEP-modelo", "arbitragem", "Recife"]
  }
};

export const QUESTIONS = {
  q2: {
    tag: "Bloco 1 · #2",
    clause: "Cl. 3.2 — Gestão de custos",
    title: "Custos deduzidos antes da divisão",
    keywords: ["taxativo", "depósito", "anuidades", "PCT"],
    contract: "Cl. 3.2: \"As partes obrigam-se a ratear todas as despesas de depósito, buscas de anterioridade e anuidades perante o INPI e órgãos internacionais (como USPTO ou EPO).\" — sem lista taxativa nem teto de despesas administrativas.",
    why: "A cláusula fala de rateio de custos, mas sem listar o quê exatamente. Isso pode diluir minha parte depois.",
    ask: "Se houver licenciamento, quais custos vocês deduzem antes de dividir?",
    suggestion: "Pergunto porque normalmente as ICTs listam tudo de forma bem detalhada pra evitar mal-entendido depois.",
    options: [
      { value: "a", label: "Lista taxativa: depósito, anuidades, PCT, auditoria, impostos", type: "solution_best" },
      { value: "b", label: "Lista taxativa + teto de 15% de despesas administrativas", type: "solution_alt" },
      { value: "c", label: "Fica em aberto, acordado por TEP", type: "solution_weak" },
      { value: "d", label: "Advogada retornará com análise", type: "lawyer" },
      { value: "e", label: "Outro (texto aberto)", type: "open" }
    ]
  },
  q4: {
    tag: "Bloco 2 · #4",
    clause: "Cl. 3.3 — Prazo de 45 dias",
    title: "Prazo de 45 dias aperta pra PF",
    keywords: ["USPTO/EPO caros", "90 dias", "adiantamento com abatimento"],
    contract: "Cl. 3.3: \"Caso uma das partes manifeste desinteresse ou deixe de pagar sua quota de manutenção por mais de 45 dias, a outra parte poderá assumir integralmente os custos e requerer a adjudicação compulsória da quota-parte inadimplente, tornando-se titular única do ativo para evitar sua caducidade.\"",
    why: "Depósito internacional (USPTO, EPO via PCT) é caro, tipo R$ 10-30k por ativo, e eu sou PF.",
    ask: "Topam estender pra 90 dias + o Instituto adiantar minha parte com abatimento futuro em royalty?",
    suggestion: "Assim a gente não perde patente por aperto pontual de caixa meu.",
    options: [
      { value: "a", label: "90 dias + adiantamento com abatimento em royalty", type: "solution_best" },
      { value: "b", label: "Só estender pra 90 dias (sem adiantamento)", type: "solution_alt" },
      { value: "c", label: "Manter 45 dias", type: "solution_weak" },
      { value: "d", label: "Advogada retornará com análise", type: "lawyer" },
      { value: "e", label: "Outro (texto aberto)", type: "open" }
    ]
  },
  q5: {
    tag: "Bloco 2 · #5",
    clause: "Cl. 3 — Abandono de ativos",
    title: "Direito de assumir ativo que seria abandonado",
    keywords: ["reversão", "UnB faz isso", "evita perder patente"],
    contract: "Cl. 3.3 + Cl. 3.4: prevê adjudicação compulsória por inadimplência (45 dias) e direito de preferência na aquisição da quota-parte da outra. NÃO há cláusula de reversão automática ao inventor quando o Instituto decide abandonar a manutenção.",
    why: "Se vocês decidirem não manter uma anuidade (abandonar o ativo), a patente caduca. Mas eu posso querer continuar sozinha.",
    ask: "Antes de abandonar de vez, topam me oferecer a chance de assumir sozinha?",
    suggestion: "Vi que a UnB faz isso automaticamente por regulamento interno — me pareceu bem justo.",
    options: [
      { value: "a", label: "Reversão automática ao inventor por silêncio (modelo UnB)", type: "solution_best" },
      { value: "b", label: "Notificação prévia + 60 dias pra eu assumir", type: "solution_alt" },
      { value: "c", label: "Caso a caso, sem regra fixa", type: "solution_weak" },
      { value: "d", label: "Advogada retornará com análise", type: "lawyer" },
      { value: "e", label: "Outro (texto aberto)", type: "open" }
    ]
  },
  q6: {
    tag: "Bloco 2 · #6",
    clause: 'Cl. 3.1 — "Resultado Protegível"',
    title: "Meus projetos independentes ficam comigo",
    keywords: ["apps próprios", "doutorado", "preferência da ICT"],
    contract: "Cl. 1.2: \"A CONTRATADA atuará com absoluta autonomia profissional, sem subordinação… não estando sujeita a controle de jornada ou exclusividade, salvo se houver conflito de interesses direto com projetos do Instituto.\" + Cl. 3.1 (Resultado Protegível em coautoria). Não há baseline formal de PI pré-existente da inventora.",
    why: "Tenho apps que já desenvolvo, pesquisas do meu doutorado, trabalhos paralelos sem relação com o Instituto.",
    ask: "Topam colocar uma linha clara dizendo que esses ficam 100% comigo, e definindo preferencialmente a parceria com a ICT para projetos novos?",
    suggestion: 'Só pra evitar qualquer ambiguidade futura sobre "Resultado Protegível".',
    options: [
      { value: "a", label: "Projetos independentes 100% meus + declaração inicial de baseline", type: "solution_best" },
      { value: "b", label: "100% meus, sem baseline formal", type: "solution_alt" },
      { value: "c", label: "Manter como está (revisão caso a caso)", type: "solution_weak" },
      { value: "d", label: "Advogada retornará com análise", type: "lawyer" },
      { value: "e", label: "Outro (texto aberto)", type: "open" }
    ]
  },
  q7: {
    tag: "Bloco 3 · #7",
    clause: "Cl. 6.2 — Multa de 10x",
    title: "Multa de 10x me deu um friozinho",
    keywords: ["proporcional", "1-2x", "teto absoluto", "escopo"],
    contract: "Cl. 6.2: \"A violação das cláusulas de Propriedade Intelectual, Confidencialidade ou Não-Evasão sujeitará o infrator ao pagamento de multa de 10x o valor do maior projeto realizado, cumulada com perdas e danos apurados.\" Cl. 6.1 (mora) já é separada (2% / teto 10%).",
    why: "10x o valor do maior projeto é muito — contratos parecidos de ICTs ficam entre 1x e 2x o valor do projeto específico.",
    ask: "Topam repensar pra algo mais proporcional? E ela vale só pra PI/confidencialidade mesmo, ou pega outras coisas?",
    suggestion: "Um teto absoluto dá segurança pros dois lados.",
    options: [
      { value: "a", label: "2x o TEP específico + teto R$ 200k + só PI/sigilo", type: "solution_best" },
      { value: "b", label: "2x o TEP específico, sem teto absoluto", type: "solution_alt" },
      { value: "c", label: "Reduzir pra 5x (meio-termo)", type: "solution_weak" },
      { value: "d", label: "Advogada retornará com análise", type: "lawyer" },
      { value: "e", label: "Outro (texto aberto)", type: "open" }
    ]
  },
  q8: {
    tag: "Bloco 3 · #8",
    clause: "Novo — Risco de inovação",
    title: "E se o projeto não viabilizar?",
    keywords: ["risco intrínseco", "sem multa", "PI parcial"],
    contract: "Cl. 2.2: \"O não cumprimento de um marco técnico (Milestone) autoriza a retenção do pagamento proporcional até a devida correção.\" — o contrato trata só inadimplemento de marco; é silente quanto a inviabilização técnica/de mercado (risco intrínseco a P&D).",
    why: "Todo projeto de pesquisa tem risco de não viabilizar tecnicamente ou o mercado não responder.",
    ask: "Como será lidado nesses casos?",
    suggestion: "O normal em ICTs é: o que foi pago até ali fica, sem multa, PI parcial em copropriedade.",
    options: [
      { value: "a", label: "Sem multa + pago fica + PI parcial em copropriedade", type: "solution_best" },
      { value: "b", label: "Sem multa + pago fica + PI volta integralmente ao inventor", type: "solution_alt" },
      { value: "c", label: "Analisar caso a caso", type: "solution_weak" },
      { value: "d", label: "Advogada retornará com análise", type: "lawyer" },
      { value: "e", label: "Outro (texto aberto)", type: "open" }
    ]
  },
  q13: {
    tag: "Bloco 4 · #13",
    clause: "Novo — Infraestrutura do lab",
    title: "Insumos e equipamentos — quem compra?",
    keywords: ["lab pessoal Recife", "chips", "reembolso", "dono do ativo"],
    contract: "O contrato é silente sobre insumos, equipamentos e propriedade do ativo físico. Cl. 2.1 (TEP) lista apenas Objeto, Milestones, Critérios de Aceite e Remuneração — sem rubrica de infraestrutura.",
    why: "Meu laboratório é pessoal, aqui em Recife. Pra tocar os projetos preciso comprar insumos (chips, placas, sensores, DevKits, licenças), às vezes valores altos (FPGA, SoC, osciloscópio > R$ 20k).",
    ask: "Como a gente organiza isso, dado que estou em Recife e vocês em Goiás?",
    suggestion: "Pensei em modelo híbrido: consumíveis pequenos eu compro e reembolso via TEP; equipamento durável acima de faixa, alinhamos antes por escrito.",
    options: [
      { value: "a", label: "Modelo híbrido: eu compro pequenos (reembolso) + Instituto aprova/compra grandes + propriedade do ativo clara em cada caso", type: "solution_best" },
      { value: "b", label: "Tudo reembolsável mediante NF, sem limite de valor (mas com pré-aprovação acima de R$ 5k)", type: "solution_alt" },
      { value: "c", label: "Tudo comprado pelo Instituto, enviado a Recife (mais lento mas mais simples)", type: "solution_weak" },
      { value: "d", label: "Advogada retornará com análise", type: "lawyer" },
      { value: "e", label: "Outro (texto aberto)", type: "open" }
    ]
  },
  q14: {
    tag: "Bloco 4 · #14",
    clause: "Novo — Viagens e reuniões presenciais",
    title: "Viagens Recife ↔ Goiânia",
    keywords: ["passagem", "hospedagem", "reunião técnica"],
    contract: "Contrato silente sobre custos de deslocamento. Sede do Instituto em Goiânia (preâmbulo); inventora residente em Pernambuco — distância exige tratamento explícito.",
    why: "Se precisarmos reunião presencial em Goiás ou eu participar de apresentação aí, quem cobre passagem e hospedagem?",
    ask: "Quem arca com custos de viagem quando for necessário eu estar presencialmente aí?",
    suggestion: "O padrão em ICTs é: viagem a pedido do Instituto, Instituto paga. Viagem por minha conveniência, eu pago.",
    options: [
      { value: "a", label: "Viagem a pedido do Instituto = Instituto paga; por minha conveniência = eu pago", type: "solution_best" },
      { value: "b", label: "Rubrica do TEP cobre viagens quando aplicável", type: "solution_alt" },
      { value: "c", label: "Caso a caso, sem regra fixa", type: "solution_weak" },
      { value: "d", label: "Advogada retornará com análise", type: "lawyer" },
      { value: "e", label: "Outro (texto aberto)", type: "open" }
    ]
  },
  q10: {
    tag: "Bloco 5 · #10",
    clause: "Cl. 2 — Remuneração",
    title: "Fiscal — RPA ou NF?",
    keywords: ["RPA ou NF", "IRRF na fonte", "Receita tranquila"],
    contract: "Cl. 2.2: \"Os valores pagos possuem natureza indenizatória de serviços técnicos e não constituem contraprestação por tempo à disposição.\" + Cl. 4.2 (Indenidade fiscal/previdenciária a cargo da CONTRATADA). Não há menção a NF, RPA ou retenção de IRRF.",
    why: "O contrato não fala de nota fiscal, RPA, retenção de IRRF. Fica ambíguo pros dois lados perante a Receita.",
    ask: "Eu emito RPA ou NF de serviço e vocês retêm IRRF?",
    suggestion: "Podemos colocar um parágrafo curto deixando claro.",
    options: [
      { value: "a", label: "Eu emito NF, vocês retêm IRRF (ISS recolhido por mim)", type: "solution_best" },
      { value: "b", label: "RPA (enquanto eu não tiver CNPJ) + IRRF retido por vocês", type: "solution_alt" },
      { value: "c", label: "Definir depois, primeiro TEP", type: "solution_weak" },
      { value: "d", label: "Advogada retornará com análise", type: "lawyer" },
      { value: "e", label: "Outro (texto aberto)", type: "open" }
    ]
  },
  q11: {
    tag: "Bloco 5 · #11",
    clause: "Cl. 2.1 — TEP",
    title: "TEP-modelo já existe ou construímos juntos?",
    keywords: ["pergunta aberta", "rascunho meu", "padrão futuro"],
    contract: "Cl. 2.1: \"Cada projeto será formalizado via Termo de Execução de Projeto (TEP), que especificará: (i) Objeto; (ii) Cronograma de Marcos (Milestones); (iii) Critérios de Aceite; e (iv) Remuneração.\" — define os 4 itens mínimos, mas não anexa template.",
    why: "Queria entender se vocês já têm um TEP-modelo pronto ou se ainda não existe.",
    ask: "O Instituto já tem TEP-modelo? Senão, topam a gente montar juntos?",
    suggestion: "Posso rascunhar uma estrutura simples (objeto, milestones, critérios de aceite, prazos, valor) e vocês ajustam.",
    options: [
      { value: "a", label: "Já temos modelo — envio pra você revisar", type: "solution_best" },
      { value: "b", label: "Não temos ainda — topamos construir juntos (você rascunha, a gente ajusta)", type: "solution_alt" },
      { value: "c", label: "Vamos criar internamente e apresentar depois", type: "solution_weak" },
      { value: "d", label: "Advogada retornará com análise", type: "lawyer" },
      { value: "e", label: "Outro (texto aberto)", type: "open" }
    ]
  },
  q12: {
    tag: "Bloco 5 · #12",
    clause: "Cl. 7.2 — Arbitragem",
    title: "Arbitragem virtual ou juizado local",
    keywords: ["logística", "pequenas causas", "juizado daqui"],
    contract: "Cl. 7.2: \"Qualquer disputa remanescente será resolvida de forma definitiva por Arbitragem, administrada por Câmara Arbitral de renome a ser escolhida em comum acordo em Goiânia/GO, conduzida por árbitro único e em conformidade com a Lei 9.307/96.\" + Cl. 7.1 (escalonamento: negociação 7d, mediação 15d) + Cl. 7.3 (foro de Goiânia para urgências).",
    why: "A 7.2 coloca arbitragem em Goiânia, mas como moro em Recife, arbitragem presencial vira problema de logística.",
    ask: "Topam arbitragem virtual ou, pra causas menores, a gente usar o juizado daqui?",
    suggestion: "É só pra caso aconteça algo pequeno não virar problema grande de logística.",
    options: [
      { value: "a", label: "Arbitragem virtual + JEC de Recife pra causas até R$ 100k", type: "solution_best" },
      { value: "b", label: "Arbitragem virtual (sem menção a JEC)", type: "solution_alt" },
      { value: "c", label: "Manter arbitragem em Goiânia presencial", type: "solution_weak" },
      { value: "d", label: "Advogada retornará com análise", type: "lawyer" },
      { value: "e", label: "Outro (texto aberto)", type: "open" }
    ]
  }
};

export const COLOR_MAP = {
  emerald: { ring: "ring-emerald-400", bg: "bg-emerald-500", bgHover: "hover:bg-emerald-50", text: "text-emerald-900", textMuted: "text-emerald-700", border: "border-emerald-200", gradient: "from-emerald-400 to-emerald-600", chip: "bg-emerald-100 text-emerald-800", solid: "#10b981" },
  blue: { ring: "ring-blue-400", bg: "bg-blue-500", bgHover: "hover:bg-blue-50", text: "text-blue-900", textMuted: "text-blue-700", border: "border-blue-200", gradient: "from-blue-400 to-blue-600", chip: "bg-blue-100 text-blue-800", solid: "#3b82f6" },
  amber: { ring: "ring-amber-400", bg: "bg-amber-500", bgHover: "hover:bg-amber-50", text: "text-amber-900", textMuted: "text-amber-700", border: "border-amber-200", gradient: "from-amber-400 to-amber-600", chip: "bg-amber-100 text-amber-800", solid: "#f59e0b" },
  rose: { ring: "ring-rose-400", bg: "bg-rose-500", bgHover: "hover:bg-rose-50", text: "text-rose-900", textMuted: "text-rose-700", border: "border-rose-200", gradient: "from-rose-400 to-rose-600", chip: "bg-rose-100 text-rose-800", solid: "#f43f5e" },
  violet: { ring: "ring-violet-400", bg: "bg-violet-500", bgHover: "hover:bg-violet-50", text: "text-violet-900", textMuted: "text-violet-700", border: "border-violet-200", gradient: "from-violet-400 to-violet-600", chip: "bg-violet-100 text-violet-800", solid: "#8b5cf6" }
};

export const OPTION_STYLES = {
  solution_best: { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-900", pill: "bg-emerald-500", label: "Ideal" },
  solution_alt: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-900", pill: "bg-blue-500", label: "Alternativa" },
  solution_weak: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-900", pill: "bg-amber-500", label: "Aceitável" },
  lawyer: { bg: "bg-violet-50", border: "border-violet-300", text: "text-violet-900", pill: "bg-violet-500", label: "Advogada" },
  open: { bg: "bg-slate-50", border: "border-slate-300", text: "text-slate-900", pill: "bg-slate-600", label: "Outro" }
};

export const findBlock = (qid) => {
  for (const b of Object.values(BLOCKS)) if (b.questions.includes(qid)) return b;
  return null;
};
