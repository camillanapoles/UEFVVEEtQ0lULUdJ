// src/components/ContractPreview.jsx
//
// Renderiza o contrato consolidado com diff visual:
//
//   • Texto-base (referência):   fundo cinza claro, letra cinza escuro
//   • Texto novo (concordou):    fundo azul claro, letra azul escuro, badge ▸ NOVA REDAÇÃO ou ✚ NOVA CLÁUSULA
//   • Texto substituído:         fundo cinza claro, letra cinza médio, TACHADO
//   • Pendente edição (open):    fundo AMARELO, letra amarelo escuro
//   • Pendente advogada (lawyer): fundo LARANJA TERRA, letra laranja escuro

import React, { useMemo, forwardRef } from "react";
import { CONTRACT_HEADER, CONTRACT_CLAUSES } from "../lib/contractData";
import { buildMutations } from "../lib/clauseRules";

// =========================================================
// PALETA DE CORES — semântica do diff
// =========================================================
const STYLES = {
  reference: {
    background: "#f1f5f9",  // slate-100
    color: "#334155",       // slate-700
    border: "1px solid #e2e8f0",
    padding: "10px 14px",
    borderRadius: "6px",
    lineHeight: 1.6
  },
  addition: {
    background: "#dbeafe",  // blue-100
    color: "#1e3a8a",       // blue-900
    border: "1px solid #93c5fd",
    padding: "10px 14px",
    borderRadius: "6px",
    lineHeight: 1.6,
    fontWeight: 500
  },
  additionLight: {
    background: "#eff6ff",  // blue-50
    color: "#1e40af",
    border: "1px dashed #93c5fd",
    padding: "8px 12px",
    borderRadius: "6px",
    lineHeight: 1.5,
    fontSize: "12.5px"
  },
  replaced: {
    background: "#f1f5f9",
    color: "#94a3b8",       // slate-400
    border: "1px solid #e2e8f0",
    padding: "10px 14px",
    borderRadius: "6px",
    lineHeight: 1.6,
    textDecoration: "line-through"
  },
  pendingEdit: {
    background: "#fef3c7",  // amber-100
    color: "#78350f",       // amber-900
    border: "1px solid #fcd34d",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "13px"
  },
  pendingLawyer: {
    background: "#fed7aa",  // orange-200 (terra)
    color: "#7c2d12",       // orange-900
    border: "1px solid #fb923c",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 500
  },
  // Bloco DÚVIDA + SUGESTÃO em itálico (laranja terra)
  lawyerDispute: {
    background: "#fff7ed",  // orange-50 (mais suave)
    color: "#7c2d12",
    border: "1.5px solid #fb923c",
    borderLeft: "5px solid #ea580c",
    padding: "12px 16px",
    borderRadius: "6px",
    fontSize: "12.5px",
    fontStyle: "italic",
    lineHeight: 1.65
  },
  annexBox: {
    background: "#dbeafe",
    color: "#1e3a8a",
    border: "2px solid #60a5fa",
    padding: "16px 20px",
    borderRadius: "8px",
    lineHeight: 1.7,
    fontSize: 13,
    whiteSpace: "pre-wrap"
  }
};

// =========================================================
// COMPONENTE PRINCIPAL — usado tanto na visualização quanto pra captura PDF
// =========================================================
const ContractPreview = forwardRef(({ answers, questions }, ref) => {
  const mutations = useMemo(() => buildMutations(answers), [answers]);

  // Indexa mutações por número de cláusula-alvo
  const mutationsByClause = useMemo(() => {
    const map = {};
    mutations.forEach((m) => {
      const target = m.target_clause;
      if (target) {
        if (!map[target]) map[target] = [];
        map[target].push(m);
      }
    });
    return map;
  }, [mutations]);

  // Gera ordem de blocos (cláusula original + adições intercaladas)
  const renderBlocks = useMemo(() => {
    const blocks = [];

    CONTRACT_CLAUSES.forEach((cl) => {
      blocks.push({ kind: "clause_header", data: cl });

      cl.items.forEach((item) => {
        blocks.push({ kind: "clause_item", data: item });

        // Anotações ligadas a este item
        const annotations = mutations.filter(
          (m) => m.type === "annotate" && m.target_clause === item.number
        );
        annotations.forEach((a) =>
          blocks.push({ kind: "annotation", data: a })
        );

        // Bloco DÚVIDA + SUGESTÃO (lawyer_dispute) ligado a este item
        const disputes = mutations.filter(
          (m) => m.type === "lawyer_dispute" && m.target_clause === item.number
        );
        disputes.forEach((d) =>
          blocks.push({ kind: "lawyer_dispute", data: d })
        );

        // Aditivos (§único) ligados a este item
        const addendums = mutations.filter(
          (m) => m.type === "addendum" && m.target_clause === item.number
        );
        addendums.forEach((a) =>
          blocks.push({ kind: "addendum", data: a })
        );

        // Adições posicionadas APÓS este item
        const additions = mutations.filter(
          (m) => m.type === "addition" && m.after_clause === item.number
        );
        additions.forEach((a) => blocks.push({ kind: "addition", data: a }));
      });
    });

    // Adições encadeadas (after_clause aponta para outra adição)
    let changed = true;
    let safety = 0;
    while (changed && safety < 20) {
      changed = false;
      mutations.forEach((m) => {
        if (m.type !== "addition") return;
        const alreadyIn = blocks.some(
          (b) => b.kind === "addition" && b.data.new_id === m.new_id
        );
        if (alreadyIn) return;

        const anchorIdx = blocks.findIndex(
          (b) => b.kind === "addition" && b.data.new_id === m.after_clause
        );
        if (anchorIdx >= 0) {
          blocks.splice(anchorIdx + 1, 0, { kind: "addition", data: m });
          changed = true;
        }
      });
      safety++;
    }

    return blocks;
  }, [mutations]);

  return (
    <div
      ref={ref}
      id="contract-preview"
      style={{
        maxWidth: "850px",
        margin: "0 auto",
        padding: "40px 32px",
        background: "#fff",
        fontFamily: "Georgia, 'Times New Roman', serif",
        color: "#0f172a"
      }}
    >
      {/* ===== Cabeçalho ===== */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>
          {CONTRACT_HEADER.title}
        </h1>
        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>
          Versão consolidada com decisões da reunião de negociação
        </div>
        <div style={{ fontSize: 11, color: "#475569", fontStyle: "italic" }}>
          Recife/PE, {new Date().toLocaleDateString("pt-BR", {
            day: "2-digit", month: "long", year: "numeric"
          })}
        </div>
      </div>

      {/* ===== Partes ===== */}
      <div style={{ marginBottom: 28, fontSize: 13, lineHeight: 1.7 }}>
        {CONTRACT_HEADER.parties.map((p, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <strong>{p.role}:</strong> {p.identification}
          </div>
        ))}
      </div>

      {/* ===== Legenda ===== */}
      <DiffLegend />

      {/* ===== Cláusulas ===== */}
      <div style={{ marginTop: 24 }}>
        {renderBlocks.map((block, idx) => {
          if (block.kind === "clause_header") {
            return <ClauseHeader key={`h-${idx}`} clause={block.data} />;
          }
          if (block.kind === "clause_item") {
            return (
              <ClauseItem
                key={`i-${block.data.id}-${idx}`}
                item={block.data}
                mutations={mutationsByClause[block.data.number] || []}
              />
            );
          }
          if (block.kind === "addition") {
            return <NewClauseBlock key={`a-${block.data.new_id}-${idx}`} mutation={block.data} />;
          }
          if (block.kind === "annotation") {
            return <AnnotationBlock key={`an-${idx}`} annotation={block.data} />;
          }
          if (block.kind === "lawyer_dispute") {
            return <LawyerDisputeBlock key={`ld-${idx}`} dispute={block.data} />;
          }
          if (block.kind === "addendum") {
            return <AddendumBlock key={`ad-${idx}`} addendum={block.data} />;
          }
          return null;
        })}
      </div>

      {/* ===== Anexos ao final ===== */}
      <AnnexesSection mutations={mutations} />

      {/* ===== Assinaturas ===== */}
      <SignaturesSection />

      {/* ===== Resumo de decisões ===== */}
      <DecisionSummary mutations={mutations} answers={answers} questions={questions} />

      {/* ===== Rodapé ===== */}
      <div style={{
        marginTop: 32, paddingTop: 16, borderTop: "1px solid #e2e8f0",
        fontSize: 11, color: "#94a3b8", textAlign: "center"
      }}>
        Documento gerado pela pauta interativa CIT AI TECH · {new Date().toLocaleString("pt-BR")}
      </div>
    </div>
  );
});

ContractPreview.displayName = "ContractPreview";
export default ContractPreview;

// =========================================================
// SUB-COMPONENTES
// =========================================================

function ClauseHeader({ clause }) {
  return (
    <div style={{
      marginTop: 28, marginBottom: 12,
      paddingBottom: 6, borderBottom: "2px solid #0f172a"
    }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
        {clause.number} — {clause.subtitle}
      </h2>
    </div>
  );
}

function ClauseItem({ item, mutations }) {
  const replaceRule = mutations.find((m) => m.type === "replace");

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: "#475569" }}>
        {item.number}. {item.title}
      </div>

      {replaceRule ? (
        <>
          {/* Original tachado */}
          <div style={{ ...STYLES.replaced, fontSize: 13, marginBottom: 6 }}>
            {item.text}
          </div>
          {/* Novo texto azul */}
          <div style={{ ...STYLES.addition, fontSize: 13 }}>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: 1,
              marginRight: 6, color: "#1e40af"
            }}>
              ▸ NOVA REDAÇÃO
            </span>
            {replaceRule.new_text}
          </div>
        </>
      ) : (
        <div style={{ ...STYLES.reference, fontSize: 13 }}>
          {item.text}
        </div>
      )}
    </div>
  );
}

function NewClauseBlock({ mutation }) {
  return (
    <div style={{ marginBottom: 14, marginTop: 8 }}>
      <div style={{
        fontSize: 9, fontWeight: 700, color: "#1e40af",
        letterSpacing: 1, marginBottom: 4
      }}>
        ✚ CLÁUSULA NOVA
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: "#1e3a8a" }}>
        {mutation.new_number}. {mutation.new_title}
      </div>
      <div style={{
        background: "#dbeafe", color: "#1e3a8a",
        border: "2px solid #60a5fa",
        padding: "12px 16px", borderRadius: "8px",
        lineHeight: 1.6, fontSize: 13
      }}>
        {mutation.new_text}
      </div>
    </div>
  );
}

function AnnotationBlock({ annotation }) {
  const isLawyer = annotation.note_color === "orange";
  const isYellow = annotation.note_color === "yellow";
  const isBlueLight = annotation.note_color === "blue_light";

  let style, label;
  if (isLawyer) {
    style = STYLES.pendingLawyer;
    label = "▸ PENDENTE — RETORNO ADVOGADA";
  } else if (isYellow) {
    style = STYLES.pendingEdit;
    label = "▸ PENDENTE — EDIÇÃO";
  } else if (isBlueLight) {
    style = STYLES.additionLight;
    label = "▸ NOTA";
  } else {
    style = STYLES.pendingEdit;
    label = "▸ NOTA";
  }

  const openText = annotation.open_text;

  return (
    <div style={{ marginTop: 4, marginBottom: 14, marginLeft: 14 }}>
      <div style={style}>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: 1,
          marginBottom: 4, color: style.color
        }}>
          {label}
        </div>
        <div>{annotation.note_text}</div>
        {openText && (
          <div style={{
            marginTop: 6, paddingTop: 6,
            borderTop: `1px solid ${isLawyer ? "#fb923c" : "#fcd34d"}`,
            fontSize: 12
          }}>
            <strong>Texto da CONTRATADA:</strong> {openText}
          </div>
        )}
      </div>
    </div>
  );
}

function AddendumBlock({ addendum }) {
  return (
    <div style={{ marginTop: 4, marginBottom: 14, marginLeft: 14 }}>
      <div style={{ ...STYLES.addition, fontSize: 13 }}>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: 1,
          marginRight: 6, color: "#1e40af"
        }}>
          ▸ ADITIVO (§único)
        </span>
        {addendum.addendum_text}
      </div>
    </div>
  );
}

function DiffLegend() {
  const items = [
    { style: STYLES.reference, label: "Texto original (referência)" },
    { style: STYLES.replaced, label: "Texto substituído (riscado)" },
    { style: STYLES.addition, label: "Texto novo (concordado)" },
    { style: STYLES.pendingEdit, label: "Pendente edição (texto livre)" },
    { style: STYLES.lawyerDispute, label: "Dúvida + Sugestão (advogada)" }
  ];
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6,
      padding: 10, background: "#f8fafc",
      border: "1px solid #e2e8f0", borderRadius: 6,
      fontSize: 11, marginBottom: 12
    }}>
      <div style={{
        gridColumn: "1 / -1", fontSize: 10, fontWeight: 700,
        color: "#64748b", letterSpacing: 1, marginBottom: 4
      }}>
        LEGENDA DO DIFF
      </div>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ ...it.style, padding: "2px 8px", fontSize: 10, minWidth: 18 }}>aA</div>
          <span style={{ color: "#475569" }}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

function DecisionSummary({ mutations, answers, questions }) {
  const totalQ = Object.keys(questions || {}).length;
  const answered = Object.keys(answers).length;
  const counts = {
    solution_best: 0, solution_alt: 0, solution_weak: 0,
    lawyer: 0, open: 0
  };
  Object.values(answers).forEach((a) => {
    if (counts[a.type] != null) counts[a.type]++;
  });

  return (
    <div style={{
      marginTop: 32, padding: 16, background: "#f8fafc",
      border: "1px solid #e2e8f0", borderRadius: 8
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 1, marginBottom: 10 }}>
        RESUMO DE DECISÕES
      </div>
      <div style={{ fontSize: 12, color: "#334155", marginBottom: 8 }}>
        <strong>{answered}</strong> de <strong>{totalQ}</strong> perguntas respondidas ·{" "}
        <strong>{mutations.length}</strong> mutações geradas no contrato
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 11 }}>
        <Pill color="#10b981" label={`Sugerida: ${counts.solution_best}`} />
        <Pill color="#3b82f6" label={`Alternativa: ${counts.solution_alt}`} />
        <Pill color="#f59e0b" label={`Aceitável: ${counts.solution_weak}`} />
        <Pill color="#fb923c" label={`Advogada: ${counts.lawyer}`} />
        <Pill color="#facc15" label={`Texto livre: ${counts.open}`} />
      </div>
    </div>
  );
}

function LawyerDisputeBlock({ dispute }) {
  return (
    <div style={{ marginTop: 4, marginBottom: 14, marginLeft: 14 }}>
      <div style={STYLES.lawyerDispute}>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: 1,
          marginBottom: 8, color: "#7c2d12", fontStyle: "normal"
        }}>
          ▸ PARA ANÁLISE DA ADVOGADA
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong style={{ fontStyle: "normal" }}>Dúvida:</strong>{" "}
          <em>{dispute.duvida}</em>
        </div>
        <div>
          <strong style={{ fontStyle: "normal" }}>Sugestão:</strong>{" "}
          <em>{dispute.sugestao}</em>
        </div>
      </div>
    </div>
  );
}

function AnnexesSection({ mutations }) {
  const annexes = mutations.filter((m) => m.type === "annexize");
  if (annexes.length === 0) return null;

  return (
    <div style={{ marginTop: 40 }}>
      <div style={{
        marginTop: 28, marginBottom: 16,
        paddingBottom: 6, borderBottom: "2px solid #0f172a"
      }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
          ANEXOS
        </h2>
      </div>
      {annexes.map((a, idx) => (
        <div key={`anx-${idx}`} style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 9, fontWeight: 700, color: "#1e40af",
            letterSpacing: 1, marginBottom: 4
          }}>
            ✚ ANEXO NOVO
          </div>
          <div style={{
            fontSize: 13, fontWeight: 700, marginBottom: 8,
            color: "#1e3a8a", textTransform: "uppercase"
          }}>
            {a.anexo_number} — {a.anexo_title}
          </div>
          <div style={STYLES.annexBox}>
            {a.anexo_text}
          </div>
        </div>
      ))}
    </div>
  );
}

function SignaturesSection() {
  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric"
  });
  return (
    <div style={{ marginTop: 48, fontSize: 12 }}>
      <div style={{
        marginBottom: 24, paddingBottom: 6,
        borderBottom: "2px solid #0f172a"
      }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
          ASSINATURAS
        </h2>
      </div>
      <div style={{ marginBottom: 32, lineHeight: 1.7 }}>
        Por estarem justos e contratados, as partes assinam o presente
        instrumento em duas vias de igual teor e forma, na presença das
        testemunhas abaixo identificadas.
      </div>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        Recife/PE, {today}
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginTop: 32
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ borderTop: "1px solid #0f172a", paddingTop: 6, fontSize: 11 }}>
            <strong>CONTRATANTE</strong>
            <div style={{ marginTop: 2 }}>INSTITUTO INNOVAR (CIT AI TECH)</div>
            <div style={{ color: "#64748b" }}>CNPJ 07.275.492/0001-77</div>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ borderTop: "1px solid #0f172a", paddingTop: 6, fontSize: 11 }}>
            <strong>CONTRATADA</strong>
            <div style={{ marginTop: 2 }}>CAMILLA NÁPOLES</div>
            <div style={{ color: "#64748b" }}>CPF [a preencher]</div>
          </div>
        </div>
      </div>
      <div style={{
        marginTop: 40, display: "grid",
        gridTemplateColumns: "1fr 1fr", gap: 32
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ borderTop: "1px solid #94a3b8", paddingTop: 6, fontSize: 10, color: "#64748b" }}>
            Testemunha 1 — Nome / CPF
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ borderTop: "1px solid #94a3b8", paddingTop: 6, fontSize: 10, color: "#64748b" }}>
            Testemunha 2 — Nome / CPF
          </div>
        </div>
      </div>
    </div>
  );
}

function Pill({ color, label }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", background: "#fff",
      border: `1px solid ${color}`, color,
      borderRadius: 12, fontWeight: 600
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      {label}
    </span>
  );
}
