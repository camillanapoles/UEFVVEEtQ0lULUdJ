// src/lib/contractData.js
// Texto literal do contrato original (CIT AI TECH) — cada cláusula é um nó.
// Origem: CONTRATO_TECH_ENGENHARIA.docx
// Não modificar este arquivo. As mutações são aplicadas em runtime via clauseRules.js

export const CONTRACT_HEADER = {
  title: "CONTRATO MESTRE DE ALIANÇA TECNOLÓGICA E PRESTAÇÃO DE SERVIÇOS TÉCNICOS",
  parties: [
    {
      role: "CONTRATANTE",
      identification:
        "INSTITUTO INNOVAR (CIT AI TECH), CNPJ 07.275.492/0001-77, com sede na Rua T-38, nº 458, Quadra 125, Lotes 10/11, Sala 106, Setor Bueno, Goiânia – GO, CEP 74.223-045."
    },
    {
      role: "CONTRATADA",
      identification:
        "CAMILLA NÁPOLES, CPF [a preencher], engenheira mecânica e eletrônica, mestre e doutoranda em Engenharia de Software, residente em Recife/PE."
    }
  ]
};

export const CONTRACT_CLAUSES = [
  {
    id: "cl_1",
    number: "CLÁUSULA PRIMEIRA",
    subtitle: "OBJETO E ESCOPO DE ATUAÇÃO",
    items: [
      { id: "1.1", number: "1.1", title: "Natureza da Aliança",
        text: "O presente contrato estabelece as bases para a colaboração técnica da CONTRATADA junto ao Núcleo de Inovação Tecnológica (NIT), visando o desenvolvimento de Propriedade Intelectual (PI) e soluções de engenharia." },
      { id: "1.2", number: "1.2", title: "Independência Técnica",
        text: "A CONTRATADA atuará com absoluta autonomia profissional, sem subordinação, utilizando seu próprio know-how para atingir os resultados contratados, não estando sujeita a controle de jornada ou exclusividade, salvo se houver conflito de interesses direto com projetos do Instituto." }
    ]
  },
  {
    id: "cl_2",
    number: "CLÁUSULA SEGUNDA",
    subtitle: "REMUNERAÇÃO E EXECUÇÃO",
    items: [
      { id: "2.1", number: "2.1", title: "Termo de Execução de Projeto (TEP)",
        text: "Cada projeto específico será regido por TEP próprio, que especificará: (a) Objeto, (b) Cronograma de Marcos (Milestones), (c) Critérios de Aceite, (d) Remuneração." },
      { id: "2.2", number: "2.2", title: "Natureza Indenizatória",
        text: "A remuneração paga em cada TEP tem natureza indenizatória pelos serviços técnicos prestados. O CONTRATANTE poderá reter pagamento em caso de não cumprimento de marco, conforme critérios de aceite." }
    ]
  },
  {
    id: "cl_3",
    number: "CLÁUSULA TERCEIRA",
    subtitle: "PROPRIEDADE INTELECTUAL E COPROPRIEDADE (PADRÃO PCT)",
    items: [
      { id: "3.1", number: "3.1", title: "Copropriedade de Ativos",
        text: 'Todo "Resultado Protegível" desenvolvido em coautoria será de propriedade comum. A quota-parte será de 50% para cada parte, salvo se o TEP específico definir proporção distinta com base na contribuição inventiva.' },
      { id: "3.2", number: "3.2", title: "Gestão de Custos",
        text: "As partes obrigam-se a ratear todas as despesas de depósito, buscas de anterioridade e anuidades perante o INPI e órgãos internacionais (como USPTO ou EPO)." },
      { id: "3.3", number: "3.3", title: "Inércia e Adjudicação",
        text: "Caso uma das partes manifeste desinteresse ou deixe de pagar sua quota de manutenção por mais de 45 dias, a outra parte poderá assumir integralmente os custos e requerer a adjudicação compulsória da quota-parte inadimplente, tornando-se titular única do ativo para evitar sua caducidade." },
      { id: "3.4", number: "3.4", title: "Direito de Comercialização",
        text: "Nenhuma parte poderá conceder licença exclusiva a terceiros sem prévio consentimento escrito da outra. É garantido o Direito de Preferência em igualdade de condições para a aquisição da quota-parte da outra." }
    ]
  },
  {
    id: "cl_4",
    number: "CLÁUSULA QUARTA",
    subtitle: "RELAÇÃO TRABALHISTA E INDENIDADE",
    items: [
      { id: "4.1", number: "4.1", title: "Ausência de Vínculo",
        text: "As partes declaram, expressamente, a inexistência de qualquer vínculo empregatício entre si, configurando-se a CONTRATADA como prestadora de serviço autônomo, nos termos do Art. 442-B da CLT." },
      { id: "4.2", number: "4.2", title: "Indenidade e Denunciação",
        text: "A CONTRATADA manterá o CONTRATANTE livre de quaisquer ônus trabalhistas decorrentes desta relação. Em caso de ação trabalhista movida contra o CONTRATANTE, a CONTRATADA será denunciada à lide, obrigando-se ao reembolso integral de custas e honorários contratuais." }
    ]
  },
  {
    id: "cl_5",
    number: "CLÁUSULA QUINTA",
    subtitle: "CONFIDENCIALIDADE E NÃO-EVASÃO",
    items: [
      { id: "5.1", number: "5.1", title: "Sigilo (NDA)",
        text: "Todas as informações, dados, métodos e Resultados Protegíveis trocados ou desenvolvidos no âmbito desta Aliança são confidenciais." },
      { id: "5.2", number: "5.2", title: "Não-Evasão",
        text: "A CONTRATADA fica impedida de contatar diretamente, durante e após a vigência, parceiros, clientes ou fornecedores apresentados pelo CONTRATANTE, com o fim de oferecer serviços ou produtos relacionados ao objeto desta Aliança." }
    ]
  },
  {
    id: "cl_6",
    number: "CLÁUSULA SEXTA",
    subtitle: "MULTAS, PENALIDADES E CLÁUSULA PENAL",
    items: [
      { id: "6.1", number: "6.1", title: "Multa Moratória",
        text: "O atraso injustificado no pagamento de qualquer obrigação financeira sujeitará a parte infratora a multa moratória de 2% (dois por cento) sobre o valor devido, limitada a 10% (dez por cento) do valor total." },
      { id: "6.2", number: "6.2", title: "Cláusula Penal Compensatória",
        text: "A violação das cláusulas de Propriedade Intelectual (Cláusula 3), Confidencialidade (Cláusula 5.1) ou Não-Evasão (Cláusula 5.2) sujeitará a parte infratora ao pagamento de multa equivalente a 10 (dez) vezes o valor do maior projeto realizado, sem prejuízo de perdas e danos suplementares." }
    ]
  },
  {
    id: "cl_7",
    number: "CLÁUSULA SÉTIMA",
    subtitle: "RESOLUÇÃO DE CONFLITOS E FORO",
    items: [
      { id: "7.1", number: "7.1", title: "Escalonamento Amigável",
        text: "Qualquer divergência será inicialmente tratada em reunião amigável (prazo de 7 dias), seguida de mediação, se necessário (prazo de 15 dias)." },
      { id: "7.2", number: "7.2", title: "Arbitragem Vinculante",
        text: "Persistindo o conflito, as partes elegem arbitragem como meio definitivo, conduzida em Goiânia (sede do CONTRATANTE), nos termos da Lei nº 9.307/96." }
    ]
  }
];
