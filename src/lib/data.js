// ============================================================
// PAUTA CIT v5 — sistema simplificado
// 3 opções fixas: CONCORDO / DISCORDO / RESSALVAS (texto)
// 2 categorias: A (compartilhado 50/50) e B (independente 100%)
// SEM piso 1/3, SEM citar Lei 10.973
// ============================================================

export const PROJECT_CATEGORIES = [
  {
    id: "cat_a",
    name: "Categoria A — Projeto compartilhado",
    description: "Ambos contribuem. Default do contrato.",
    receita_camilla: "50%",
    custo_camilla: "50%",
    receita_cit: "50%",
    custo_cit: "50%",
    rationale: "Espelha 50/50 da Cl. 3.1. Simetria total.",
    color: "blue"
  },
  {
    id: "cat_b",
    name: "Categoria B — Projeto independente seu",
    description: "Apps, doutorado, clientes diretos sem CIT.",
    receita_camilla: "100%",
    custo_camilla: "100%",
    receita_cit: "0%",
    custo_cit: "0%",
    rationale: "Fora do contrato. Sua titularidade exclusiva.",
    color: "violet"
  }
];

export const INSUMOS_TABLE = [
  { item: "Consumíveis (SMD, resistor, solda)", compra: "Você", ativo: "Você (descartável)" },
  { item: "Insumos do projeto (chip X, placa Y)", compra: "Você, reembolso via TEP", ativo: "Caso a caso" },
  { item: "Equipamento durável > R$ 5–10k", compra: "Instituto ou cofinanciado", ativo: "Negociar: se >50% você, fica com você + licença de uso pro Instituto" },
  { item: "Software / cloud / APIs B2B", compra: "Instituto (CNPJ exigido)", ativo: "Instituto" }
];

export const BLOCKS = {
  estrutura: {
    id: "estrutura",
    title: "Estrutura da Relação",
    subtitle: "Quem é o quê nesta parceria",
    color: "slate",
    iconName: "Network",
    questions: ["q15"],
    keywords: ["parceria", "viabilização", "ICT vs inventora"]
  },
  remuneracao: {
    id: "remuneracao",
    title: "PI, Receitas & Custos",
    subtitle: "Simetria 50/50 absoluta",
    color: "emerald",
    iconName: "DollarSign",
    questions: ["q1", "q1b", "q2"],
    keywords: ["50/50 simétrico", "categorização", "deduções"]
  },
  propriedade: {
    id: "propriedade",
    title: "Propriedade Intelectual",
    subtitle: "Manutenção, abandono, projetos meus",
    color: "blue",
    iconName: "ShieldCheck",
    questions: ["q4", "q5", "q6"],
    keywords: ["adiantamento", "recompra", "projetos meus"]
  },
  riscos: {
    id: "riscos",
    title: "Riscos & Proteções",
    subtitle: "O que pode dar errado",
    color: "amber",
    iconName: "AlertTriangle",
    questions: ["q7", "q8"],
    keywords: ["multa 10x", "falha de inovação"]
  },
  infra: {
    id: "infra",
    title: "Infraestrutura & Logística",
    subtitle: "Lab em Recife, Instituto em Goiás",
    color: "rose",
    iconName: "Truck",
    questions: ["q13", "q14"],
    keywords: ["insumos", "chips", "viagens"]
  },
  operacional: {
    id: "operacional",
    title: "Operacional",
    subtitle: "Como fazer funcionar",
    color: "violet",
    iconName: "Settings",
    questions: ["q10", "q11", "q12"],
    keywords: ["NF / RPA", "TEP-modelo", "arbitragem"]
  }
};

export const QUESTIONS = {
  q15: {
    tag: "Bloco 0 · #1",
    clause: "Cl. 1.1 — Natureza da Aliança",
    title: "Quem é o quê nesta parceria?",
    keywords: ["modelo viabilização", "ICT nascente", "lab seu"],
    why: "A 1.1 fala em 'colaboração técnica' de forma vaga. Como o Instituto está nascendo (sem lab, sem equipe técnica) e eu entro com infraestrutura, capital intelectual prévio, ART e em alguns casos a captação, queria alinhar formalmente o modelo da relação.",
    ask: "Concordam que esse não é o modelo tradicional 'ICT madura + inventor que usa estrutura ICT', mas sim 'ICT viabilizadora + executora técnica autônoma'?",
    suggestion: "Adicionar Cl. 1.3 explicitando: ICT como viabilizadora institucional + Camilla como executora técnica com infra própria. Isso facilita calibragem dos TEPs depois."
  },
  q1: {
    tag: "Bloco 1 · #1",
    clause: "Cl. 3 — PI + Receitas + Custos",
    title: "Simetria 50/50 — propriedade, receitas e custos",
    keywords: ["50/50 absoluto", "espelho da 3.1", "Cl. 3.5 nova"],
    why: "A 3.1 já estabelece copropriedade 50/50 da PI, mas o contrato é silente sobre RECEITAS e a 3.2 fala vagamente em 'ratear custos'. Quero coerência total: se sou dona de 50% da PI, recebo 50% das receitas e arco com 50% dos custos.",
    ask: "Topam estender a regra 50/50 da Cl. 3.1 para receitas e custos, com cláusula de simetria absoluta?",
    suggestion: "Inserir Cl. 3.5.1 (receitas 50/50), Cl. 3.5.2 (custos 50/50) e Cl. 3.1.1 (alteração só com justificativa técnica E financeira válida documentada + consentimento mútuo escrito). Default sempre 50/50.",
    showClauseRedaction: true,
    clauseRedaction: `3.5.1 Receitas: A divisão 50/50 da Cl. 3.1 aplica-se igualmente aos ganhos econômicos da PI (licenciamentos, transferências, royalties, comercialização), sobre o líquido após deduções listadas em 3.6.

3.5.2 Custos: Aplica-se a mesma proporção 50/50 ao rateio de custos de proteção e manutenção da PI.

3.1.1 Alteração: Qualquer alteração da proporção 50/50 (3.1, 3.5.1, 3.5.2) requer justificativa técnica E financeira válida, comprovada por documentação objetiva, com consentimento mútuo escrito e assinado.`
  },
  q1b: {
    tag: "Bloco 1 · #2",
    clause: "Cl. 3.1 — Categorização",
    title: "Tabela A/B — projetos compartilhados ou independentes",
    keywords: ["2 categorias", "A 50/50", "B 100% meu"],
    why: "A 3.1 permite o TEP alterar 50/50 com base em 'contribuição inventiva' vaga. Em vez disso, categorização clara em DUAS opções: A (compartilhado, 50/50) ou B (independente, 100% meu, fora do contrato).",
    ask: "Topam adotar a tabela A/B como Anexo ao contrato Master?",
    suggestion: "Categoria A = projetos do contrato com simetria 50/50 absoluta. Categoria B = projetos meus independentes, fora do escopo do contrato. Sem outras categorias, sem percentuais intermediários.",
    showCategoryTable: true
  },
  q2: {
    tag: "Bloco 1 · #3",
    clause: "Cl. 3.6 (nova)",
    title: "Lista taxativa de deduções",
    keywords: ["taxativo", "depósito", "anuidades", "PCT"],
    contract: "Cl. 3.2: \"As partes obrigam-se a ratear todas as despesas de depósito, buscas de anterioridade e anuidades perante o INPI e órgãos internacionais (como USPTO ou EPO).\" — sem lista taxativa nem teto de despesas administrativas.",
    why: "Sem lista taxativa, o Instituto poderia adicionar 'despesas administrativas' ou 'overhead de NIT' antes da divisão e diluir minha parte.",
    ask: "Topam fechar a lista de deduções admissíveis e proibir overhead administrativo?",
    suggestion: "Lista taxativa: depósito INPI/USPTO/EPO, anuidades, agente PI, auditoria, busca anterioridade, tributos do licenciamento. Itens não listados não podem ser deduzidos. Vedado: salários NIT, despesas admin gerais, custos de captação.",
    showClauseRedaction: true,
    clauseRedaction: `3.6 LISTA DE DEDUÇÕES ADMISSÍVEIS:
a) custos de depósito e proteção (INPI, USPTO, EPO, PCT);
b) anuidades nacionais e internacionais;
c) honorários de agente da propriedade industrial;
d) custos de auditoria e due diligence;
e) tributos diretamente vinculados ao licenciamento;
f) custos de busca de anterioridade.

§1º Itens não listados acima não podem ser deduzidos nem rateados sem aditivo específico.
§2º NÃO constituem custos rateáveis: despesas administrativas gerais do Instituto, salários de equipe do NIT, custos de captação ou prospecção de licenciados.`
  },
  q4: {
    tag: "Bloco 2 · #1",
    clause: "Cl. 3.7.1 (nova)",
    title: "Adiantamento sem juros por aperto de caixa",
    keywords: ["USPTO/EPO caros", "12 meses", "ressarcimento sem juros"],
    contract: "Cl. 3.3: \"Caso uma das partes manifeste desinteresse ou deixe de pagar sua quota de manutenção por mais de 45 dias, a outra parte poderá assumir integralmente os custos e requerer a adjudicação compulsória da quota-parte inadimplente, tornando-se titular única do ativo para evitar sua caducidade.\"",
    why: "Depósito internacional via PCT custa R$ 10-30k por ativo. Como sou PF, posso ter aperto pontual de caixa.",
    ask: "Topam cláusula de adiantamento mútuo sem juros, ressarcimento em até 12 meses ou na próxima receita?",
    suggestion: "Cl. 3.7.1 — qualquer parte pode adiantar a cota da outra, ressarcimento sem juros até a próxima receita do projeto, ou em até 12 meses, o que ocorrer primeiro. Protege ambos contra perda da PI por aperto temporário.",
    showClauseRedaction: true,
    clauseRedaction: `3.7.1 Adiantamento por aperto de caixa: Se uma das partes não puder honrar sua cota de custos no prazo, a outra parte poderá adiantar o valor, com direito a ressarcimento sem juros até a próxima receita do projeto, ou em até 12 meses, o que ocorrer primeiro.`
  },
  q5: {
    tag: "Bloco 2 · #2",
    clause: "Cl. 3.7.2 e 3.7.3",
    title: "90 dias + oferta prévia + recompra em 24 meses",
    keywords: ["inércia 90d", "oferta prévia", "recompra SELIC"],
    contract: "Cl. 3.3 + Cl. 3.4: prevê adjudicação compulsória por inadimplência (45 dias) e direito de preferência na aquisição da quota-parte da outra. NÃO há cláusula de reversão automática ao inventor quando o Instituto decide abandonar a manutenção.",
    why: "Os 45 dias da Cl. 3.3 são curtos demais — viagei, esqueci, ou tive imprevisto, perco a quota.",
    ask: "Topam estender pra 90 dias + oferta prévia obrigatória + direito de recompra em 24 meses?",
    suggestion: "Cl. 3.7.2 (90d + notificação + oferta) e Cl. 3.7.3 (recompra valor + SELIC em 24 meses).",
    showClauseRedaction: true,
    clauseRedaction: `3.7.2 Inércia caracterizada: Apenas após 90 dias de inadimplência (ampliado dos 45 dias originais), notificação formal e oferta prévia de assunção de cota pela outra parte sem ressarcimento, fica caracterizada inércia para fins de adjudicação compulsória.

3.7.3 Direito de Recompra: A parte adjudicada conserva direito de recomprar sua cota original em até 24 meses, pelo valor pago + correção SELIC.`
  },
  q6: {
    tag: "Bloco 2 · #3",
    clause: "Cl. 3.1 — \"Resultado Protegível\"",
    title: "Categoria B — projetos meus independentes",
    keywords: ["apps próprios", "doutorado", "baseline declaratório"],
    contract: "Cl. 1.2: \"A CONTRATADA atuará com absoluta autonomia profissional, sem subordinação… não estando sujeita a controle de jornada ou exclusividade, salvo se houver conflito de interesses direto com projetos do Instituto.\" + Cl. 3.1 (Resultado Protegível em coautoria). Não há baseline formal de PI pré-existente da inventora.",
    why: "Tenho apps que já desenvolvo, pesquisas do meu doutorado, trabalhos paralelos. Quero deixar claro que esses são Categoria B — 100% meus, fora do escopo do contrato.",
    ask: "Topam declaração formal de baseline (Anexo II com lista de projetos pré-existentes) + Cláusula de Categoria B explícita?",
    suggestion: "Anexo II com baseline (assinado na entrada) + redação clara: 'Projetos sem uso de recursos do CIT são Categoria B — 100% da CONTRATADA, fora do escopo deste contrato'."
  },
  q7: {
    tag: "Bloco 3 · #1",
    clause: "Cl. 6.2 — Multa de 10x",
    title: "Multa de 10x me deu um friozinho",
    keywords: ["proporcional", "1-2x", "teto absoluto"],
    contract: "Cl. 6.2: \"A violação das cláusulas de Propriedade Intelectual, Confidencialidade ou Não-Evasão sujeitará o infrator ao pagamento de multa de 10x o valor do maior projeto realizado, cumulada com perdas e danos apurados.\" Cl. 6.1 (mora) já é separada (2% / teto 10%).",
    why: "10x o valor do maior projeto é desproporcional — contratos parecidos de ICTs ficam entre 1x e 2x o valor do projeto específico, com teto em reais.",
    ask: "Topam 2x o TEP específico + teto absoluto + apenas para PI/confidencialidade?",
    suggestion: "Reduzir pra 2x o TEP específico onde a violação ocorreu, com teto de R$ 200k, restrita a violações de PI/confidencialidade/não-evasão."
  },
  q8: {
    tag: "Bloco 3 · #2",
    clause: "Novo — Risco de inovação",
    title: "E se o projeto não viabilizar?",
    keywords: ["risco intrínseco", "sem multa", "PI parcial"],
    contract: "Cl. 2.2: \"O não cumprimento de um marco técnico (Milestone) autoriza a retenção do pagamento proporcional até a devida correção.\" — o contrato trata só inadimplemento de marco; é silente quanto a inviabilização técnica/de mercado (risco intrínseco a P&D).",
    why: "Todo projeto de pesquisa tem risco de não viabilizar tecnicamente ou o mercado não responder. O contrato não trata disso.",
    ask: "Como será lidado nesses casos?",
    suggestion: "Em caso de falha técnica ou de mercado: o pago fica, sem multa, PI parcial segue 50/50 ou volta integralmente pra mim."
  },
  q13: {
    tag: "Bloco 4 · #1",
    clause: "Novo — Infraestrutura do lab",
    title: "Insumos e equipamentos — quem compra?",
    keywords: ["lab pessoal Recife", "chips", "reembolso"],
    contract: "O contrato é silente sobre insumos, equipamentos e propriedade do ativo físico. Cl. 2.1 (TEP) lista apenas Objeto, Milestones, Critérios de Aceite e Remuneração — sem rubrica de infraestrutura.",
    why: "Meu laboratório é pessoal, em Recife. Pra tocar projetos preciso comprar insumos (chips, placas, sensores, DevKits, licenças), às vezes valores altos (FPGA, SoC, osciloscópio > R$ 20k).",
    ask: "Como organizamos isso, dado que estou em Recife e vocês em Goiás?",
    suggestion: "Modelo híbrido seguindo a tabela abaixo: consumíveis pequenos eu compro e reembolso via TEP; equipamento durável acima de R$ 5k, alinhamos antes por escrito; software B2B fica com vocês (precisa CNPJ).",
    showInsumosTable: true
  },
  q14: {
    tag: "Bloco 4 · #2",
    clause: "Novo — Viagens",
    title: "Viagens Recife ↔ Goiânia",
    keywords: ["passagem", "hospedagem"],
    contract: "Contrato silente sobre custos de deslocamento. Sede do Instituto em Goiânia (preâmbulo); inventora residente em Pernambuco — distância exige tratamento explícito.",
    why: "Se precisarmos reunião presencial em Goiás ou eu participar de apresentação aí, quem cobre passagem e hospedagem?",
    ask: "Quem arca com custos de viagem quando for necessário eu estar presencialmente aí?",
    suggestion: "Padrão: viagem a pedido do Instituto, Instituto paga; por minha conveniência, eu pago."
  },
  q10: {
    tag: "Bloco 5 · #1",
    clause: "Cl. 2 — Remuneração",
    title: "Fiscal — RPA ou NF?",
    keywords: ["RPA ou NF", "IRRF na fonte"],
    contract: "Cl. 2.2: \"Os valores pagos possuem natureza indenizatória de serviços técnicos e não constituem contraprestação por tempo à disposição.\" + Cl. 4.2 (Indenidade fiscal/previdenciária a cargo da CONTRATADA). Não há menção a NF, RPA ou retenção de IRRF.",
    why: "O contrato não fala de NF, RPA, retenção de IRRF. Fica ambíguo perante a Receita.",
    ask: "Eu emito RPA ou NF de serviço e vocês retêm IRRF?",
    suggestion: "Cláusula clara: NF emitida por mim, IRRF retido na fonte por vocês, ISS recolhido por mim. RPA enquanto não tiver CNPJ ativo."
  },
  q11: {
    tag: "Bloco 5 · #2",
    clause: "Cl. 2.1 — TEP",
    title: "TEP-modelo já existe ou construímos juntos?",
    keywords: ["pergunta aberta", "rascunho meu"],
    contract: "Cl. 2.1: \"Cada projeto será formalizado via Termo de Execução de Projeto (TEP), que especificará: (i) Objeto; (ii) Cronograma de Marcos (Milestones); (iii) Critérios de Aceite; e (iv) Remuneração.\" — define os 4 itens mínimos, mas não anexa template.",
    why: "Queria entender se vocês já têm TEP-modelo pronto ou se vamos construir.",
    ask: "O Instituto já tem TEP-modelo? Senão, topam construirmos juntos?",
    suggestion: "Se ainda não existe, posso rascunhar uma estrutura simples (objeto, milestones, aceite, prazos, valor, categoria do projeto). Vira padrão pros próximos."
  },
  q12: {
    tag: "Bloco 5 · #3",
    clause: "Cl. 7.2 — Arbitragem",
    title: "Arbitragem virtual ou juizado local",
    keywords: ["logística", "pequenas causas"],
    contract: "Cl. 7.2: \"Qualquer disputa remanescente será resolvida de forma definitiva por Arbitragem, administrada por Câmara Arbitral de renome a ser escolhida em comum acordo em Goiânia/GO, conduzida por árbitro único e em conformidade com a Lei 9.307/96.\" + Cl. 7.1 (escalonamento: negociação 7d, mediação 15d) + Cl. 7.3 (foro de Goiânia para urgências).",
    why: "A 7.2 coloca arbitragem em Goiânia, mas como moro em Recife, presencial vira problema de logística.",
    ask: "Topam arbitragem virtual ou, pra causas menores, juizado daqui?",
    suggestion: "Arbitragem virtual + JEC de Recife pra causas até R$ 100k."
  }
};

// Sistema de resposta — 3 opções fixas + texto livre nas ressalvas
export const RESPONSE_TYPES = {
  agree: { label: "CONCORDO", color: "#10b981", bg: "#ecfdf5", border: "#34d399", icon: "✓" },
  disagree: { label: "DISCORDO", color: "#dc2626", bg: "#fef2f2", border: "#f87171", icon: "✕", note: "(propor nova depois)" },
  conditional: { label: "CONCORDO COM RESSALVAS", color: "#d97706", bg: "#fffbeb", border: "#fbbf24", icon: "≈", needsText: true }
};

// Classes Tailwind para badge e radio buttons (estilo visual polido)
export const OPTION_STYLES = {
  agree: {
    label: "CONCORDO",
    pill: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-300",
    ring: "ring-emerald-200",
    dot: "bg-emerald-500",
    chip: "bg-emerald-100 text-emerald-800"
  },
  disagree: {
    label: "DISCORDO",
    pill: "bg-rose-500",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-300",
    ring: "ring-rose-200",
    dot: "bg-rose-500",
    chip: "bg-rose-100 text-rose-800"
  },
  conditional: {
    label: "RESSALVAS",
    pill: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-300",
    ring: "ring-amber-200",
    dot: "bg-amber-500",
    chip: "bg-amber-100 text-amber-800"
  }
};

export const COLOR_MAP = {
  slate: { ring: "ring-slate-400", bg: "bg-slate-500", bgHover: "hover:bg-slate-50", text: "text-slate-900", textMuted: "text-slate-700", border: "border-slate-300", gradient: "from-slate-500 to-slate-700", chip: "bg-slate-100 text-slate-800", solid: "#64748b" },
  emerald: { ring: "ring-emerald-400", bg: "bg-emerald-500", bgHover: "hover:bg-emerald-50", text: "text-emerald-900", textMuted: "text-emerald-700", border: "border-emerald-200", gradient: "from-emerald-400 to-emerald-600", chip: "bg-emerald-100 text-emerald-800", solid: "#10b981" },
  blue: { ring: "ring-blue-400", bg: "bg-blue-500", bgHover: "hover:bg-blue-50", text: "text-blue-900", textMuted: "text-blue-700", border: "border-blue-200", gradient: "from-blue-400 to-blue-600", chip: "bg-blue-100 text-blue-800", solid: "#3b82f6" },
  amber: { ring: "ring-amber-400", bg: "bg-amber-500", bgHover: "hover:bg-amber-50", text: "text-amber-900", textMuted: "text-amber-700", border: "border-amber-200", gradient: "from-amber-400 to-amber-600", chip: "bg-amber-100 text-amber-800", solid: "#f59e0b" },
  rose: { ring: "ring-rose-400", bg: "bg-rose-500", bgHover: "hover:bg-rose-50", text: "text-rose-900", textMuted: "text-rose-700", border: "border-rose-200", gradient: "from-rose-400 to-rose-600", chip: "bg-rose-100 text-rose-800", solid: "#f43f5e" },
  violet: { ring: "ring-violet-400", bg: "bg-violet-500", bgHover: "hover:bg-violet-50", text: "text-violet-900", textMuted: "text-violet-700", border: "border-violet-200", gradient: "from-violet-400 to-violet-600", chip: "bg-violet-100 text-violet-800", solid: "#8b5cf6" }
};

export const findBlock = (qid) => {
  for (const b of Object.values(BLOCKS)) if (b.questions.includes(qid)) return b;
  return null;
};
