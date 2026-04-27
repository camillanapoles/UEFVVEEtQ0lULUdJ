// Persistência cifrada AES-GCM usando a masterKey derivada do token ativo.
// Quando há sessão válida, as respostas são sempre cifradas. Sem sessão,
// seguem em texto claro (para o modo "sem token" de desenvolvimento).

import { getSessionMasterKey, hasSessionMasterKey } from "./tokens";

const STORAGE_KEY = "pauta-cit-respostas-v3";

function b64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function fromB64(str) {
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
}

export async function saveAnswers(answers) {
  const json = JSON.stringify(answers);
  if (!hasSessionMasterKey()) {
    localStorage.setItem(STORAGE_KEY, json);
    return;
  }
  const key = await getSessionMasterKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv }, key, new TextEncoder().encode(json)
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    __enc: true, iv: b64(iv), data: b64(cipher)
  }));
}

export async function loadAnswers() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  const parsed = JSON.parse(raw);
  if (!parsed.__enc) return parsed;
  if (!hasSessionMasterKey()) {
    throw new Error("Dados cifrados — sessão sem chave mestra.");
  }
  const key = await getSessionMasterKey();
  const iv = fromB64(parsed.iv);
  const data = fromB64(parsed.data);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return JSON.parse(new TextDecoder().decode(plain));
}

export function clearAnswers() {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportAnswersAsJson(answers, questions) {
  const output = {
    metadata: {
      app: "Pauta CIT AI TECH",
      exportedAt: new Date().toISOString(),
      version: "2.1.0"
    },
    respostas: Object.entries(answers).map(([qid, ans]) => ({
      pergunta_id: qid,
      pergunta: questions[qid]?.title || "",
      clausula: questions[qid]?.clause || "",
      resposta_selecionada: ans.selected || null,
      resposta_label: ans.label || null,
      tipo: ans.type || null,
      texto_aberto: ans.open_text || null,
      respondido_em: ans.timestamp || null
    }))
  };
  const blob = new Blob([JSON.stringify(output, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pauta-cit-respostas-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportAnswersAsPdf(answers, questions, blocks) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = margin;

  const now = new Date();
  const dtStr = now.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" });

  const ensureSpace = (needed) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const writeWrapped = (text, x, maxW, opts = {}) => {
    const size = opts.size || 10;
    const lh = opts.lh || size * 1.35;
    doc.setFontSize(size);
    if (opts.bold) doc.setFont("helvetica", "bold");
    else doc.setFont("helvetica", "normal");
    if (opts.color) doc.setTextColor(...opts.color);
    else doc.setTextColor(30, 30, 30);
    const lines = doc.splitTextToSize(String(text ?? ""), maxW);
    for (const line of lines) {
      ensureSpace(lh);
      doc.text(line, x, y);
      y += lh;
    }
  };

  // Cabeçalho
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Pauta de Reunião · CIT AI TECH", margin, 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Exportado em ${dtStr}`, margin, 50);
  const totalQ = Object.keys(questions).length;
  const answered = Object.keys(answers).length;
  doc.text(`${answered}/${totalQ} respondidas`, pageW - margin, 50, { align: "right" });

  y = 90;
  doc.setTextColor(30, 30, 30);

  // Blocos ordenados
  for (const block of Object.values(blocks)) {
    ensureSpace(30);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 14;
    writeWrapped(block.title, margin, pageW - margin * 2, { size: 13, bold: true });
    writeWrapped(block.subtitle, margin, pageW - margin * 2, { size: 9, color: [120, 120, 120] });
    y += 4;

    for (const qid of block.questions) {
      const q = questions[qid];
      if (!q) continue;
      const a = answers[qid];

      ensureSpace(60);
      writeWrapped(`${q.tag} — ${q.title}`, margin, pageW - margin * 2, { size: 11, bold: true });
      writeWrapped(q.clause, margin, pageW - margin * 2, { size: 8, color: [120, 120, 120] });
      y += 2;
      if (q.contract) {
        writeWrapped(`Contrato: ${q.contract}`, margin, pageW - margin * 2, {
          size: 8, color: [146, 64, 14]
        });
        y += 2;
      }
      writeWrapped(`Pergunta: ${q.ask}`, margin, pageW - margin * 2, { size: 9 });

      if (a) {
        const typeLabel = {
          solution_best: "IDEAL",
          solution_alt: "ALTERNATIVA",
          solution_weak: "ACEITÁVEL",
          lawyer: "ADVOGADA",
          open: "OUTRO"
        }[a.type] || "?";
        const color = {
          solution_best: [16, 129, 90],
          solution_alt: [30, 64, 175],
          solution_weak: [146, 64, 14],
          lawyer: [91, 33, 182],
          open: [55, 65, 81]
        }[a.type] || [55, 65, 81];
        writeWrapped(`Resposta [${typeLabel}]: ${a.label}`, margin, pageW - margin * 2, {
          size: 9, bold: true, color
        });
        if (a.type === "open" && a.open_text) {
          writeWrapped(`Texto: ${a.open_text}`, margin + 10, pageW - margin * 2 - 10, { size: 9 });
        }
        const when = a.timestamp ? new Date(a.timestamp).toLocaleString("pt-BR") : "—";
        writeWrapped(`Respondida em: ${when}`, margin, pageW - margin * 2, {
          size: 8, color: [120, 120, 120]
        });
      } else {
        writeWrapped("Resposta: (pendente)", margin, pageW - margin * 2, {
          size: 9, color: [150, 150, 150]
        });
      }
      y += 6;
    }
    y += 8;
  }

  // Rodapé em todas as páginas
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(`Pauta CIT AI TECH · ${dtStr}`, margin, pageH - 20);
    doc.text(`Pág. ${i}/${pages}`, pageW - margin, pageH - 20, { align: "right" });
  }

  const stamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
  doc.save(`pauta-cit-respostas-${stamp}.pdf`);
}
