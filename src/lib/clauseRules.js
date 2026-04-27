// src/lib/clauseRules.js
//
// Regras de mutação por (qid × tipo da resposta).
// Cada mutação é aplicada ao contrato original e gera o contrato consolidado.
//
// PRINCÍPIO: o texto reescrito segue EXATAMENTE o estilo formal-jurídico
// do contrato original (CIT AI TECH). Vocabulário canônico:
//   "As partes obrigam-se", "fica caracterizada", "para fins de",
//   "no caso de", "deverá", "serão", "salvo se", "sob pena de".
// Evitar: linguagem coloquial, frases longas, gírias, conjunções modernas.
//
// TIPOS DA RESPOSTA (OPTION_STYLES do repo):
//   solution_best  → cláusula sugerida ACEITA → reescreve cláusula em
//                    linguagem formal (estilo do original).
//   solution_alt   → variante aceita → addendum como §único.
//   solution_weak  → meio-termo aceitável → addendum em §único.
//   lawyer         → DISCORDO/advogada → bloco DÚVIDA + SUGESTÃO em itálico.
//   open           → texto livre da Camilla → bloco AMARELO (pendente edição).
//
// TIPOS DE MUTAÇÃO:
//   replace        → substitui texto da cláusula (riscado + novo azul)
//   addition       → insere NOVA cláusula após existente (badge ✚)
//   addendum       → §único APÓS o texto original
//   annexize       → ANEXO completo ao final do contrato
//   annotate       → nota colorida (azul claro / amarelo)
//   lawyer_dispute → Dúvida + Sugestão em itálico (laranja)

// ────────────────────────────────────────────────────────────
// Helper para gerar bloco LAWYER_DISPUTE de forma consistente
// ────────────────────────────────────────────────────────────
function lawyerBlock(target_clause, duvida, sugestao) {
  return { type: "lawyer_dispute", target_clause, duvida, sugestao };
}

// ────────────────────────────────────────────────────────────
// Tabela de Categorização (Anexo I) — texto formal completo
// ────────────────────────────────────────────────────────────
const ANEXO_I_TEXT = `Para fins do presente contrato e seus respectivos TEPs, os projetos serão classificados, por consenso bilateral, em uma das seguintes categorias:

CATEGORIA A — PROJETO COMPARTILHADO. Configura-se quando ambas as partes contribuem para a concepção, captação de recursos ou execução do projeto. Aplica-se a regra de simetria absoluta 50/50 prevista nas Cláusulas 3.1, 3.5.1 e 3.5.2. Esta é a categoria padrão (default) do presente contrato.

CATEGORIA B — PROJETO INDEPENDENTE DA CONTRATADA. Configura-se quando o projeto é concebido, executado e/ou comercializado pela CONTRATADA sem qualquer aporte de recursos, infraestrutura, captação ou nome institucional do CONTRATANTE. Inclui, sem limitação: aplicativos próprios, atividades de doutorado, consultorias diretas a terceiros e demais ativos pré-existentes constantes do Anexo II. Tais projetos permanecem 100% (cem por cento) de titularidade exclusiva da CONTRATADA, fora do escopo do presente contrato.

§ Único. Cada Termo de Execução de Projeto (TEP) deverá indicar expressamente a categoria aplicável.`;

// ────────────────────────────────────────────────────────────
// Anexo II — Baseline
// ────────────────────────────────────────────────────────────
const ANEXO_II_TEXT = `A CONTRATADA declara, na data de assinatura do presente contrato, a relação de projetos, aplicativos, pesquisas, códigos e demais ativos intelectuais pré-existentes de sua titularidade. Tais ativos enquadram-se na Categoria B (PROJETO INDEPENDENTE) e permanecem integralmente sob sua titularidade exclusiva, fora do escopo do presente contrato.

[Lista de baseline a ser anexada pela CONTRATADA na assinatura.]`;

// ════════════════════════════════════════════════════════════
// TRANSFORMAÇÕES POR PERGUNTA
// ════════════════════════════════════════════════════════════
export const TRANSFORMATIONS = {

  // ============== Q1 — Cl. 3 (Simetria 50/50 PI + receitas + custos) ==============
  q1: {
    solution_best: [
      { type: "replace", target_clause: "3.1",
        new_text: 'Todo "Resultado Protegível" desenvolvido em coautoria será de propriedade comum, sendo a quota-parte de 50% (cinquenta por cento) para cada parte. Qualquer alteração da proporção 50/50 estabelecida nesta Cláusula e nas Cláusulas 3.5.1 e 3.5.2 somente terá efeito mediante justificativa técnica E financeira válida, comprovada por documentação objetiva, com consentimento mútuo escrito e assinado em TEP específico.' },
      { type: "addition", after_clause: "3.4",
        new_id: "3.5.1", new_number: "3.5.1", new_title: "Receitas — Simetria",
        new_text: "A divisão 50/50 prevista na Cláusula 3.1 aplica-se igualmente aos ganhos econômicos auferidos com a exploração da Propriedade Intelectual, incluindo licenciamentos, transferências, royalties e comercialização direta, calculada sobre o valor líquido após as deduções listadas na Cláusula 3.6." },
      { type: "addition", after_clause: "3.5.1",
        new_id: "3.5.2", new_number: "3.5.2", new_title: "Custos — Simetria",
        new_text: "Aplica-se a mesma proporção 50/50 ao rateio dos custos de proteção e manutenção da Propriedade Intelectual, conforme lista taxativa da Cláusula 3.6." }
    ],
    solution_alt: [{
      type: "addendum", target_clause: "3.1",
      addendum_text: "§ Único. Os ganhos econômicos da Propriedade Intelectual serão divididos na proporção de 1/3 (um terço) para a CONTRATADA, calculados sobre o valor líquido conforme deduções a serem listadas em cláusula específica."
    }],
    solution_weak: [{
      type: "annotate", target_clause: "3.1", note_color: "blue_light",
      note_text: "[ACEITAÇÃO INTEGRAL] Cl. 3.1 mantida — divisão de receitas e custos a definir por TEP."
    }],
    lawyer: [
      lawyerBlock("3.1",
        "A Cl. 3.1 estabelece copropriedade 50/50 da PI, mas o contrato é silente quanto à divisão de RECEITAS auferidas com a exploração da PI (licenciamentos, royalties, vendas), e a Cl. 3.2 trata de \"rateio de custos\" sem fixar proporção. Resulta em incoerência: a CONTRATADA é dona de 50% do ativo, mas não há garantia contratual de que receberá 50% do que o ativo gerar economicamente.",
        "Inserir Cláusulas 3.5.1 (receitas 50/50) e 3.5.2 (custos 50/50) para estender simetricamente a regra da Cl. 3.1 a receitas e custos. Reescrever a Cl. 3.1 para estabelecer que qualquer alteração da proporção 50/50 requer justificativa técnica E financeira válida, comprovada por documentação objetiva, com consentimento mútuo escrito e assinado em TEP específico — protegendo contra alteração unilateral via TEP."
      )
    ],
    open: [{
      type: "annotate", target_clause: "3.1", note_color: "yellow",
      note_text: "[PENDENTE — EDIÇÃO PELA CONTRATADA]"
    }]
  },

  // ============== Q1b — Anexo I (Tabela A/B) ==============
  q1b: {
    solution_best: [{
      type: "annexize",
      anexo_id: "anexo_I", anexo_number: "ANEXO I",
      anexo_title: "Tabela de Categorização de Projetos",
      anexo_text: ANEXO_I_TEXT
    }],
    solution_alt: [{
      type: "addendum", target_clause: "3.1",
      addendum_text: "§ Único. Cada TEP indicará a categoria do projeto, podendo configurar projeto compartilhado (50/50) ou projeto independente da CONTRATADA (100%, fora do escopo deste contrato)."
    }],
    solution_weak: [{
      type: "annotate", target_clause: "3.1", note_color: "blue_light",
      note_text: "[ACEITAÇÃO INTEGRAL] Categorização será definida caso a caso em cada TEP."
    }],
    lawyer: [
      lawyerBlock("3.1",
        "A Cl. 3.1 permite ao TEP \"definir proporção distinta com base na contribuição inventiva\", mas não objetiva esse critério, deixando-o sujeito à interpretação unilateral do CONTRATANTE.",
        "Adotar Anexo I — Tabela de Categorização — com duas categorias objetivas: (A) Projeto Compartilhado, default 50/50; (B) Projeto Independente da CONTRATADA, 100% e fora do escopo. Cada TEP deverá indicar expressamente a categoria aplicável."
      )
    ],
    open: [{
      type: "annotate", target_clause: "3.1", note_color: "yellow",
      note_text: "[PENDENTE — EDIÇÃO PELA CONTRATADA]"
    }]
  },

  // ============== Q2 — Cl. 3.6 (Lista taxativa de deduções) ==============
  q2: {
    solution_best: [{
      type: "addition", after_clause: "3.5.2",
      new_id: "3.6", new_number: "3.6", new_title: "Deduções Admissíveis",
      new_text: "Para fins de rateio de custos (Cláusula 3.5.2) e dedução prévia das receitas (Cláusula 3.5.1), serão considerados admissíveis exclusivamente os seguintes itens: (a) custos de depósito e proteção junto ao INPI, USPTO, EPO e PCT; (b) anuidades nacionais e internacionais; (c) honorários de agente da propriedade industrial; (d) custos de auditoria e due diligence; (e) tributos diretamente vinculados ao licenciamento; (f) custos de busca de anterioridade. § 1º Itens não listados nesta cláusula não poderão ser deduzidos nem rateados sem aditivo contratual específico, devidamente assinado por ambas as partes. § 2º NÃO constituem custos rateáveis: despesas administrativas gerais do CONTRATANTE, salários da equipe do NIT e custos de captação ou prospecção de licenciados."
    }],
    solution_alt: [{
      type: "addendum", target_clause: "3.2",
      addendum_text: "§ Único. As despesas administrativas gerais do CONTRATANTE poderão ser rateadas até o limite máximo de 15% (quinze por cento) do valor bruto da receita auferida, observada a regra de transparência."
    }],
    solution_weak: [{
      type: "annotate", target_clause: "3.2", note_color: "blue_light",
      note_text: "[ACEITAÇÃO INTEGRAL] Cl. 3.2 mantida — deduções definidas caso a caso."
    }],
    lawyer: [
      lawyerBlock("3.2",
        "A Cl. 3.2 fala em \"ratear todas as despesas\" sem listar quais são admissíveis, abrindo margem para inclusão posterior de overhead administrativo, salários do NIT ou custos de captação, o que poderia diluir significativamente a participação líquida da CONTRATADA.",
        "Inserir Cláusula 3.6 com lista TAXATIVA de deduções admissíveis (depósito, anuidades, agente PI, auditoria, tributos, busca de anterioridade) e parágrafo expresso vedando dedução de despesas administrativas gerais, salários de equipe NIT e custos de captação."
      )
    ],
    open: [{
      type: "annotate", target_clause: "3.2", note_color: "yellow",
      note_text: "[PENDENTE — EDIÇÃO PELA CONTRATADA]"
    }]
  },

  // ============== Q3 — Cl. 3.1 (Metodologia de contribuição) ==============
  q3: {
    solution_best: [{
      type: "annotate", target_clause: "3.1", note_color: "blue_light",
      note_text: "[NOTA] A regra geral de 50/50 está consagrada na nova redação da Cl. 3.1; alteração somente mediante acordo escrito justificado."
    }],
    solution_alt: [{
      type: "addendum", target_clause: "3.1",
      addendum_text: '§ Único. Para fins desta Cláusula, "contribuição inventiva" será apurada por metodologia objetiva combinando: (i) horas técnicas registradas; (ii) infraestrutura de pesquisa utilizada por cada parte; (iii) capital intelectual prévio aportado, devidamente documentados.'
    }],
    solution_weak: [{
      type: "annotate", target_clause: "3.1", note_color: "blue_light",
      note_text: "[ACEITAÇÃO] Critério a ser definido pelo NIT em cada TEP."
    }],
    lawyer: [
      lawyerBlock("3.1",
        "A Cl. 3.1 menciona \"contribuição inventiva\" como critério para alterar a proporção 50/50, mas não define como tal contribuição será objetivamente medida.",
        "Inserir §único na Cl. 3.1 estabelecendo metodologia objetiva de aferição: (i) horas técnicas; (ii) infraestrutura utilizada; (iii) capital intelectual prévio aportado."
      )
    ],
    open: [{
      type: "annotate", target_clause: "3.1", note_color: "yellow",
      note_text: "[PENDENTE — EDIÇÃO PELA CONTRATADA]"
    }]
  },

  // ============== Q4 — Cl. 3.7.1 (Adiantamento) ==============
  q4: {
    solution_best: [{
      type: "addition", after_clause: "3.6",
      new_id: "3.7.1", new_number: "3.7.1", new_title: "Adiantamento Mútuo",
      new_text: "Caso uma das partes não puder honrar sua quota-parte de custos no prazo, a outra parte poderá adiantar o valor correspondente, com direito a ressarcimento sem incidência de juros, até a próxima receita do projeto ou em até 12 (doze) meses, o que primeiro ocorrer."
    }],
    solution_alt: [{
      type: "replace", target_clause: "3.3",
      new_text: "No caso de uma das partes manifestar desinteresse ou deixar de pagar sua quota-parte de manutenção por mais de 90 (noventa) dias, a outra parte poderá assumir integralmente os custos e requerer a adjudicação compulsória da quota-parte inadimplente, tornando-se titular única do ativo para evitar sua caducidade."
    }],
    solution_weak: [{
      type: "annotate", target_clause: "3.3", note_color: "blue_light",
      note_text: "[ACEITAÇÃO INTEGRAL] Prazo de 45 dias mantido."
    }],
    lawyer: [
      lawyerBlock("3.3",
        "A Cl. 3.3 fixa prazo de apenas 45 dias para inadimplência caracterizar inércia e adjudicação compulsória, sem prever mecanismo de adiantamento mútuo. Considerando que depósitos internacionais via PCT podem custar entre R$ 10.000 e R$ 30.000 por ativo e que a CONTRATADA é pessoa física, há risco de perda de PI por aperto pontual de caixa.",
        "Inserir Cláusula 3.7.1 prevendo adiantamento mútuo sem juros (ressarcimento em 12 meses ou na próxima receita), aplicável simetricamente a ambas as partes."
      )
    ],
    open: [{
      type: "annotate", target_clause: "3.3", note_color: "yellow",
      note_text: "[PENDENTE — EDIÇÃO PELA CONTRATADA]"
    }]
  },

  // ============== Q5 — Cl. 3.7.2 e 3.7.3 (Inércia + recompra) ==============
  q5: {
    solution_best: [
      { type: "replace", target_clause: "3.3",
        new_text: "No caso de uma das partes manifestar desinteresse ou deixar de pagar sua quota-parte de manutenção por mais de 90 (noventa) dias, mediante notificação formal e oferta prévia de assunção de quota pela outra parte, fica caracterizada inércia para fins de adjudicação compulsória, tornando-se a parte adjudicante titular única do ativo." },
      { type: "addition", after_clause: "3.7.1",
        new_id: "3.7.2", new_number: "3.7.2", new_title: "Direito de Recompra",
        new_text: "A parte adjudicada conserva o direito de recomprar sua quota-parte original em até 24 (vinte e quatro) meses contados da adjudicação, mediante pagamento do valor adimplido pela outra parte, acrescido de correção pela taxa SELIC do período." }
    ],
    solution_alt: [{
      type: "replace", target_clause: "3.3",
      new_text: "No caso de uma das partes manifestar desinteresse ou deixar de pagar sua quota-parte de manutenção por mais de 90 (noventa) dias, mediante oferta prévia de assunção de quota pela outra parte, fica caracterizada inércia para adjudicação compulsória."
    }],
    solution_weak: [{
      type: "replace", target_clause: "3.3",
      new_text: "No caso de uma das partes manifestar desinteresse ou deixar de pagar sua quota-parte de manutenção por mais de 60 (sessenta) dias, a outra parte poderá assumir integralmente os custos e requerer a adjudicação compulsória."
    }],
    lawyer: [
      lawyerBlock("3.3",
        "A Cl. 3.3 caracteriza inércia em apenas 45 dias e atribui adjudicação compulsória definitiva, sem oferta prévia de assunção e sem direito de recompra, criando risco de perda definitiva de PI por inadimplemento pontual.",
        "Reescrever Cl. 3.3 ampliando o prazo para 90 dias e exigindo notificação formal com oferta prévia de assunção. Inserir Cláusula 3.7.2 — Direito de Recompra — permitindo à parte adjudicada recomprar sua quota original em até 24 meses pelo valor pago pela outra, acrescido de SELIC."
      )
    ],
    open: [{
      type: "annotate", target_clause: "3.3", note_color: "yellow",
      note_text: "[PENDENTE — EDIÇÃO PELA CONTRATADA]"
    }]
  },

  // ============== Q6 — Categoria B + Anexo II ==============
  q6: {
    solution_best: [{
      type: "annexize",
      anexo_id: "anexo_II", anexo_number: "ANEXO II",
      anexo_title: "Baseline de Projetos Pré-Existentes da CONTRATADA",
      anexo_text: ANEXO_II_TEXT
    }],
    solution_alt: [{
      type: "addendum", target_clause: "3.1",
      addendum_text: "§ Único. Os projetos pré-existentes da CONTRATADA, sem aporte de recursos, infraestrutura ou nome institucional do CONTRATANTE, permanecem 100% (cem por cento) de sua titularidade exclusiva, fora do escopo deste contrato."
    }],
    solution_weak: [{
      type: "annotate", target_clause: "3.1", note_color: "blue_light",
      note_text: "[ACEITAÇÃO INTEGRAL] Sem alteração — revisão caso a caso."
    }],
    lawyer: [
      lawyerBlock("3.1",
        'O contrato é silente quanto a projetos pré-existentes ou paralelos da CONTRATADA (aplicativos próprios, doutorado, consultorias). Há risco de ambiguidade sobre o que constitui "Resultado Protegível" no escopo do contrato.',
        "Adotar Anexo II — Baseline de Projetos Pré-Existentes — com declaração formal da CONTRATADA, na assinatura, dos ativos intelectuais que permanecem 100% de sua titularidade exclusiva, fora do escopo do contrato."
      )
    ],
    open: [{
      type: "annotate", target_clause: "3.1", note_color: "yellow",
      note_text: "[PENDENTE — EDIÇÃO PELA CONTRATADA]"
    }]
  },

  // ============== Q7 — Cl. 6.2 (Multa proporcional) ==============
  q7: {
    solution_best: [{
      type: "replace", target_clause: "6.2",
      new_text: "A violação comprovada das cláusulas de Propriedade Intelectual (Cláusula 3), Confidencialidade (Cláusula 5.1) ou Não-Evasão (Cláusula 5.2) sujeitará a parte infratora ao pagamento de multa equivalente a 2 (duas) vezes o valor do TEP específico no qual ocorreu a violação, limitada a um teto absoluto de R$ 200.000,00 (duzentos mil reais), sem prejuízo de perdas e danos efetivamente comprovados."
    }],
    solution_alt: [{
      type: "replace", target_clause: "6.2",
      new_text: "A violação das cláusulas de Propriedade Intelectual (Cláusula 3), Confidencialidade (Cláusula 5.1) ou Não-Evasão (Cláusula 5.2) sujeitará a parte infratora ao pagamento de multa equivalente a 2 (duas) vezes o valor do TEP específico no qual ocorreu a violação, sem prejuízo de perdas e danos."
    }],
    solution_weak: [{
      type: "replace", target_clause: "6.2",
      new_text: "A violação das cláusulas de Propriedade Intelectual (Cláusula 3), Confidencialidade (Cláusula 5.1) ou Não-Evasão (Cláusula 5.2) sujeitará a parte infratora ao pagamento de multa equivalente a 5 (cinco) vezes o valor do maior projeto realizado, sem prejuízo de perdas e danos suplementares."
    }],
    lawyer: [
      lawyerBlock("6.2",
        "A Cl. 6.2 estabelece multa equivalente a 10 vezes o valor do maior projeto realizado, valor manifestamente desproporcional à luz do Art. 412 do Código Civil (a cláusula penal não pode exceder o valor da obrigação principal). Contratos similares em ICTs maduras (Brasil/EUA) fixam multa entre 1 e 2 vezes o valor do projeto específico, com teto absoluto.",
        "Reescrever Cl. 6.2 reduzindo a multa para 2x o valor do TEP específico onde ocorreu a violação, com teto absoluto de R$ 200.000, restrita às hipóteses de violação de PI, confidencialidade ou não-evasão, sem prejuízo de perdas e danos comprovados."
      )
    ],
    open: [{
      type: "annotate", target_clause: "6.2", note_color: "yellow",
      note_text: "[PENDENTE — EDIÇÃO PELA CONTRATADA]"
    }]
  },

  // ============== Q8 — Risco de inovação ==============
  q8: {
    solution_best: [{
      type: "addition", after_clause: "6.2",
      new_id: "6.3", new_number: "6.3", new_title: "Risco da Inovação",
      new_text: "No caso de inviabilidade técnica ou de mercado do projeto, devidamente comprovada, não haverá imposição de multa nem dever de devolução de valores pagos por marcos já cumpridos. A Propriedade Intelectual parcial gerada permanecerá em copropriedade na proporção 50/50 prevista na Cláusula 3.1."
    }],
    solution_alt: [{
      type: "addition", after_clause: "6.2",
      new_id: "6.3", new_number: "6.3", new_title: "Risco da Inovação",
      new_text: "No caso de inviabilidade técnica ou de mercado do projeto, devidamente comprovada, não haverá imposição de multa nem dever de devolução de valores pagos por marcos já cumpridos. A Propriedade Intelectual parcial gerada retornará integralmente à CONTRATADA."
    }],
    solution_weak: [{
      type: "annotate", target_clause: "6.2", note_color: "blue_light",
      note_text: "[ACEITAÇÃO] Tratamento caso a caso, sem cláusula específica."
    }],
    lawyer: [
      lawyerBlock("6.2",
        "O contrato é silente quanto à hipótese de inviabilidade técnica ou de mercado do projeto, situação inerente a atividades de pesquisa e desenvolvimento. Em ICTs maduras, é prática consolidada prever que, em caso de falha intrínseca à inovação, não há multa nem dever de devolução, e a PI parcial segue regime de copropriedade.",
        "Inserir nova Cláusula 6.3 — Risco da Inovação — estabelecendo que, em caso de inviabilidade comprovada, não há multa nem devolução de valores pagos por marcos cumpridos, e a PI parcial gerada permanece em copropriedade 50/50."
      )
    ],
    open: [{
      type: "annotate", target_clause: "6.2", note_color: "yellow",
      note_text: "[PENDENTE — EDIÇÃO PELA CONTRATADA]"
    }]
  },

  // ============== Q13 — Insumos ==============
  q13: {
    solution_best: [{
      type: "addition", after_clause: "2.2",
      new_id: "2.3", new_number: "2.3", new_title: "Aquisição de Insumos e Equipamentos",
      new_text: "(a) Consumíveis e insumos de pequeno valor serão adquiridos diretamente pela CONTRATADA, com posterior reembolso via TEP mediante apresentação de Nota Fiscal. (b) Equipamentos duráveis com valor unitário superior a R$ 5.000,00 (cinco mil reais) requerem alinhamento prévio escrito entre as partes, devendo o respectivo TEP especificar a forma de aquisição e a titularidade do ativo ao final do projeto. (c) Software, serviços em nuvem e APIs em regime B2B serão contratados pelo CONTRATANTE, em razão da exigência de pessoa jurídica, ficando o ativo registrado em seu nome."
    }],
    solution_alt: [{
      type: "addendum", target_clause: "2.1",
      addendum_text: "§ Único. Insumos e equipamentos serão reembolsáveis mediante Nota Fiscal, com pré-aprovação para valores superiores a R$ 5.000,00."
    }],
    solution_weak: [{
      type: "annotate", target_clause: "2.1", note_color: "blue_light",
      note_text: "[ACEITAÇÃO] Insumos e equipamentos serão adquiridos pelo CONTRATANTE e enviados a Recife/PE."
    }],
    lawyer: [
      lawyerBlock("2.1",
        "O contrato é silente quanto à aquisição de insumos e equipamentos necessários à execução dos projetos, considerando que o laboratório da CONTRATADA é pessoal e localiza-se em Recife/PE, distante da sede do CONTRATANTE em Goiânia/GO. Insumos podem variar de baixo valor (componentes SMD) a alto valor (FPGA, SoC, instrumentação acima de R$ 20.000).",
        "Inserir nova Cláusula 2.3 — Aquisição de Insumos e Equipamentos — com modelo híbrido: (a) consumíveis pela CONTRATADA com reembolso via TEP; (b) equipamentos duráveis acima de R$ 5.000 com pré-aprovação escrita e definição de titularidade; (c) software/cloud/APIs B2B contratados pelo CONTRATANTE."
      )
    ],
    open: [{
      type: "annotate", target_clause: "2.1", note_color: "yellow",
      note_text: "[PENDENTE — EDIÇÃO PELA CONTRATADA]"
    }]
  },

  // ============== Q14 — Viagens ==============
  q14: {
    solution_best: [{
      type: "addition", after_clause: "2.3",
      new_id: "2.4", new_number: "2.4", new_title: "Custos de Viagem",
      new_text: "As viagens realizadas a pedido do CONTRATANTE, incluindo reuniões presenciais em Goiânia/GO, apresentações e eventos institucionais, serão custeadas integralmente pelo CONTRATANTE quanto a passagem aérea e hospedagem. As viagens realizadas por conveniência exclusiva da CONTRATADA correrão por sua conta."
    }],
    solution_alt: [{
      type: "addendum", target_clause: "2.1",
      addendum_text: "§ Único. As viagens necessárias à execução dos projetos serão custeadas via rubrica específica do TEP correspondente, quando aplicável."
    }],
    solution_weak: [{
      type: "annotate", target_clause: "2.1", note_color: "blue_light",
      note_text: "[ACEITAÇÃO] Tratamento caso a caso, sem regra fixa."
    }],
    lawyer: [
      lawyerBlock("2.1",
        "O contrato é silente quanto a custos de viagem entre Recife/PE (residência da CONTRATADA) e Goiânia/GO (sede do CONTRATANTE), o que pode gerar passivo financeiro à CONTRATADA em caso de exigência de presença física institucional.",
        "Inserir nova Cláusula 2.4 — Custos de Viagem — estabelecendo que viagens a pedido do CONTRATANTE são custeadas pelo CONTRATANTE; viagens por conveniência da CONTRATADA correm por sua conta."
      )
    ],
    open: [{
      type: "annotate", target_clause: "2.1", note_color: "yellow",
      note_text: "[PENDENTE — EDIÇÃO PELA CONTRATADA]"
    }]
  },

  // ============== Q10 — Fiscal NF/RPA ==============
  q10: {
    solution_best: [{
      type: "replace", target_clause: "2.2",
      new_text: "A remuneração paga em cada TEP corresponde à contraprestação pelos serviços técnicos prestados. A CONTRATADA emitirá Nota Fiscal de Serviços ou, na ausência de CNPJ ativo, Recibo de Pagamento Autônomo (RPA). O CONTRATANTE reterá o IRRF na fonte conforme a legislação vigente, ficando a CONTRATADA responsável pelo recolhimento de ISS e demais contribuições próprias. O CONTRATANTE poderá reter pagamento no caso de não cumprimento de marco, mediante prévio procedimento de contestação documentado."
    }],
    solution_alt: [{
      type: "addendum", target_clause: "2.2",
      addendum_text: "§ Único. Enquanto a CONTRATADA não possuir CNPJ ativo, a remuneração será paga via Recibo de Pagamento Autônomo (RPA), com retenção de IRRF na fonte pelo CONTRATANTE."
    }],
    solution_weak: [{
      type: "annotate", target_clause: "2.2", note_color: "blue_light",
      note_text: "[ACEITAÇÃO] Regime fiscal a definir no primeiro TEP."
    }],
    lawyer: [
      lawyerBlock("2.2",
        "A Cl. 2.2 não especifica o regime fiscal aplicável (Nota Fiscal vs. RPA), nem disciplina a retenção de IRRF na fonte. A omissão pode gerar inseguranças tributárias para ambas as partes perante a Receita Federal.",
        "Reescrever Cl. 2.2 estabelecendo: emissão de NF de Serviços pela CONTRATADA (ou RPA, na ausência de CNPJ), retenção de IRRF na fonte pelo CONTRATANTE, e responsabilidade da CONTRATADA pelo recolhimento de ISS e contribuições próprias."
      )
    ],
    open: [{
      type: "annotate", target_clause: "2.2", note_color: "yellow",
      note_text: "[PENDENTE — EDIÇÃO PELA CONTRATADA]"
    }]
  },

  // ============== Q11 — TEP-modelo ==============
  q11: {
    solution_best: [{
      type: "annotate", target_clause: "2.1", note_color: "blue_light",
      note_text: "[ACORDO OPERACIONAL] O CONTRATANTE possui TEP-modelo, que será compartilhado para revisão conjunta."
    }],
    solution_alt: [{
      type: "addendum", target_clause: "2.1",
      addendum_text: "§ Único. As partes comprometem-se a elaborar conjuntamente o TEP-modelo no prazo de até 30 (trinta) dias contados da assinatura deste contrato, contendo, no mínimo: objeto, marcos (milestones), critérios de aceite, prazos, valor e categoria do projeto (Anexo I)."
    }],
    solution_weak: [{
      type: "annotate", target_clause: "2.1", note_color: "blue_light",
      note_text: "[ACEITAÇÃO] O TEP-modelo será elaborado internamente e apresentado posteriormente."
    }],
    lawyer: [
      lawyerBlock("2.1",
        "A Cl. 2.1 prevê que cada projeto será regido por TEP próprio, mas não disciplina a estrutura mínima desse documento, gerando risco de assimetria entre TEPs.",
        "Inserir §único na Cl. 2.1 estabelecendo o compromisso bilateral de elaboração conjunta do TEP-modelo em até 30 dias, com estrutura mínima padronizada."
      )
    ],
    open: [{
      type: "annotate", target_clause: "2.1", note_color: "yellow",
      note_text: "[PENDENTE — EDIÇÃO PELA CONTRATADA]"
    }]
  },

  // ============== Q12 — Arbitragem ==============
  q12: {
    solution_best: [{
      type: "replace", target_clause: "7.2",
      new_text: "Persistindo o conflito, as partes elegem como meio definitivo a arbitragem na modalidade VIRTUAL, nos termos da Lei nº 9.307/96. Para causas de valor até R$ 100.000,00 (cem mil reais), poderão as partes recorrer ao Juizado Especial Cível da comarca de Recife/PE, em razão do domicílio da CONTRATADA."
    }],
    solution_alt: [{
      type: "replace", target_clause: "7.2",
      new_text: "Persistindo o conflito, as partes elegem como meio definitivo a arbitragem na modalidade VIRTUAL, nos termos da Lei nº 9.307/96."
    }],
    solution_weak: [{
      type: "annotate", target_clause: "7.2", note_color: "blue_light",
      note_text: "[ACEITAÇÃO INTEGRAL] Arbitragem mantida em Goiânia/GO presencial."
    }],
    lawyer: [
      lawyerBlock("7.2",
        "A Cl. 7.2 elege arbitragem presencial em Goiânia/GO, sede do CONTRATANTE, o que impõe ônus logístico relevante à CONTRATADA, residente em Recife/PE, especialmente para causas de menor valor.",
        "Reescrever Cl. 7.2 adotando arbitragem virtual (Lei 9.307/96) e prevendo, para causas até R$ 100.000, a possibilidade de recurso ao Juizado Especial Cível de Recife/PE."
      )
    ],
    open: [{
      type: "annotate", target_clause: "7.2", note_color: "yellow",
      note_text: "[PENDENTE — EDIÇÃO PELA CONTRATADA]"
    }]
  }
};

// ════════════════════════════════════════════════════════════
// COMPILA AS MUTAÇÕES PENDENTES A PARTIR DAS RESPOSTAS
// ════════════════════════════════════════════════════════════
//
// Mapeamento v5 (3 opções) → v2 (5 tipos de mutação):
//   agree       → solution_best  (aceitou o mandato/sugestão)
//   conditional → solution_alt   (aceitou com ressalvas → addendum)
//   disagree    → lawyer         (discordou → Dúvida + Sugestão)
//
// answer.ressalva_text é repassado como open_text para o diff.
//
const RESPONSE_TO_MUTATION_TYPE = {
  agree: "solution_best",
  conditional: "solution_alt",
  disagree: "lawyer"
};

const RESPONSE_LABELS = {
  agree: "CONCORDO",
  disagree: "DISCORDO (propor nova depois)",
  conditional: "CONCORDO COM RESSALVAS"
};

export function buildMutations(answers) {
  const mutations = [];
  Object.entries(answers).forEach(([qid, answer]) => {
    const rules = TRANSFORMATIONS[qid];
    if (!rules) return;
    const mutationType = RESPONSE_TO_MUTATION_TYPE[answer.response];
    if (!mutationType) return;
    const ruleSet = rules[mutationType];
    if (!ruleSet) return;
    ruleSet.forEach((rule) => {
      mutations.push({
        ...rule,
        source_qid: qid,
        decision_type: answer.response,
        decision_label: RESPONSE_LABELS[answer.response] || answer.response,
        open_text: answer.ressalva_text || null
      });
    });
  });
  return mutations;
}
