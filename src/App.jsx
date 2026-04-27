import React, { useEffect, useState } from "react";
import {
  DollarSign, ShieldCheck, AlertTriangle, Settings, Truck, Network,
  ChevronRight, X, CheckCircle2, XCircle, Sparkles,
  FileText, Lightbulb, Target, ArrowLeft, Table2, FileCode2,
  Download, Trash2, Lock, KeyRound, Copy, Plus, FileDown, AlertCircle
} from "lucide-react";

import { BLOCKS, QUESTIONS, COLOR_MAP, PROJECT_CATEGORIES, INSUMOS_TABLE, RESPONSE_TYPES, OPTION_STYLES, findBlock } from "./lib/data";
import { saveAnswers, loadAnswers, clearAnswers, exportAnswersAsJson, exportAnswersAsPdf } from "./lib/storage";
import ContractPreview from "./components/ContractPreview";
import { exportContractAsPdf } from "./lib/contractExport";
import { FileSignature, Play } from "lucide-react";
import { hasValidSession, validateToken, clearSession } from "./lib/access";
import { hasTokens, bootstrapAndUnlock, generateNewToken, listTokensMeta, purgeAll } from "./lib/tokens";

const ICON_MAP = { DollarSign, ShieldCheck, AlertTriangle, Settings, Truck, Network };

export default function App() {
  const [accessGranted, setAccessGranted] = useState(hasValidSession());
  const [lastIssuedToken, setLastIssuedToken] = useState(null);

  if (!accessGranted) {
    return (
      <AccessGate
        onGranted={(issuedToken) => {
          if (issuedToken) setLastIssuedToken(issuedToken);
          setAccessGranted(true);
        }}
      />
    );
  }

  return <MainApp initialIssuedToken={lastIssuedToken} onLock={() => { clearSession(); setAccessGranted(false); }} />;
}

function AccessGate({ onGranted }) {
  const isFirstBoot = !hasTokens();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);

  const handleSubmit = async () => {
    setChecking(true);
    setError("");
    const ok = await validateToken(token);
    setChecking(false);
    if (ok) onGranted();
    else setError("Token inválido ou não está entre os 5 ativos.");
  };

  const handleBootstrap = async () => {
    setBootstrapping(true);
    const newToken = await bootstrapAndUnlock();
    setBootstrapping(false);
    onGranted(newToken);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white">
            <Lock size={20} />
          </div>
          <div>
            <h1 className="font-semibold text-lg">Acesso Restrito</h1>
            <p className="text-xs text-slate-500">Pauta CIT AI TECH</p>
          </div>
        </div>

        {isFirstBoot ? (
          <>
            <p className="text-sm text-slate-600 mb-4">
              Primeira execução neste dispositivo. Gere o token mestre —
              ele abre o app e cifra as respostas.
            </p>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 mb-4">
              Guarde o token em local seguro. Ele não será mostrado novamente.
              Você pode rotacionar para até 5 tokens ativos depois.
            </div>
            <button
              onClick={handleBootstrap}
              disabled={bootstrapping}
              className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <KeyRound size={16} />
              {bootstrapping ? "Gerando..." : "Gerar token e entrar"}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600 mb-5">
              Digite um dos 5 tokens ativos para continuar.
            </p>
            <input
              type="password" autoFocus value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !checking && handleSubmit()}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none text-sm mb-3"
              placeholder="Token"
            />
            {error && <p className="text-xs text-rose-600 mb-3">{error}</p>}
            <button onClick={handleSubmit} disabled={checking || !token}
              className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-sm font-medium transition-colors">
              {checking ? "Verificando..." : "Entrar"}
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-4">
              Token valida via SHA-256 + AES-GCM (chave mestra envolvida)
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function MainApp({ initialIssuedToken, onLock }) {
  const [view, setView] = useState("mindmap");
  const [activeBlock, setActiveBlock] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [freshToken, setFreshToken] = useState(initialIssuedToken || null);

  useEffect(() => {
    (async () => {
      try {
        const data = await loadAnswers();
        const pruned = Object.fromEntries(
          Object.entries(data).filter(([qid]) => QUESTIONS[qid])
        );
        setAnswers(pruned);
      } catch (e) {
        console.error(e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveAnswers(answers).catch(console.error);
  }, [answers, loaded]);

  useEffect(() => {
    if (initialIssuedToken) setTokenModalOpen(true);
  }, [initialIssuedToken]);

  const totalQuestions = Object.keys(QUESTIONS).length;
  const completedCount = Object.keys(answers).length;
  const progress = Math.round((completedCount / totalQuestions) * 100);

  const handleAnswer = (qid, response, ressalvaText) => {
    const entry = {
      response,
      ressalva_text: response === "conditional" ? (ressalvaText || "").trim() : null,
      timestamp: new Date().toISOString()
    };
    setAnswers((prev) => ({ ...prev, [qid]: entry }));
  };

  const openQuestion = (qid) => setActiveQuestion(qid);
  const openBlock = (bid) => { setActiveBlock(bid); setView("block"); };
  const backToMap = () => { setActiveBlock(null); setView("mindmap"); };

  const handleExportJson = () => exportAnswersAsJson(answers, QUESTIONS);
  const handleExportPdf = () => exportAnswersAsPdf(answers, QUESTIONS, BLOCKS);
  const handleViewContract = () => setView("contract");
  const handleContractPdf = () => exportContractAsPdf("contract-preview");
  const handlePreAgree = () => {
    if (!confirm("Preencher TODAS as perguntas como CONCORDO?\n\nIsso aplica todas as sugestões/mandatos ao contrato consolidado.")) return;
    const allAgree = {};
    Object.keys(QUESTIONS).forEach((qid) => {
      allAgree[qid] = { response: "agree", ressalva_text: null, timestamp: new Date().toISOString() };
    });
    setAnswers(allAgree);
  };

  const handleClear = () => {
    if (confirm("Apagar todas as respostas salvas?")) {
      clearAnswers();
      setAnswers({});
    }
  };

  const stats = {
    agree: Object.values(answers).filter(a => a.response === "agree").length,
    disagree: Object.values(answers).filter(a => a.response === "disagree").length,
    conditional: Object.values(answers).filter(a => a.response === "conditional").length
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 font-sans antialiased">
      {tokenModalOpen && freshToken && (
        <TokenRevealModal
          token={freshToken}
          onClose={() => { setTokenModalOpen(false); setFreshToken(null); }}
        />
      )}

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white shadow-lg">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold tracking-tight truncate">Pauta · CIT AI TECH</h1>
              <p className="text-xs text-slate-500 truncate">{totalQuestions} perguntas · {Object.keys(BLOCKS).length} blocos · ~45 min</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex items-center gap-3 mr-2">
              <div className="flex items-center gap-1 text-xs">
                <CheckCircle2 size={14} className="text-emerald-500" /> <span className="font-medium">{stats.agree}</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <AlertCircle size={14} className="text-amber-500" /> <span className="font-medium">{stats.conditional}</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <XCircle size={14} className="text-rose-500" /> <span className="font-medium">{stats.disagree}</span>
              </div>
              <div className="w-20 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs font-medium text-slate-600 tabular-nums">{completedCount}/{totalQuestions}</span>
            </div>
            <TokenAdminButton onIssued={(t) => { setFreshToken(t); setTokenModalOpen(true); }} />
            <button
              onClick={handleViewContract}
              disabled={completedCount === 0}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex items-center gap-1.5"
              title="Visualizar contrato consolidado"
            >
              <FileSignature size={14} /> <span className="hidden sm:inline">Contrato</span>
            </button>
            <button
              onClick={handlePreAgree}
              disabled={completedCount === totalQuestions}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex items-center gap-1.5"
              title="Preencher todas como CONCORDO"
            >
              <Play size={14} /> <span className="hidden sm:inline">CONCORDO+</span>
            </button>
            <button onClick={handleExportPdf} disabled={completedCount === 0}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex items-center gap-1.5"
              title="Exportar PDF">
              <FileDown size={14} /> <span className="hidden sm:inline">PDF</span>
            </button>
            <button onClick={handleExportJson} disabled={completedCount === 0}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex items-center gap-1.5"
              title="Exportar JSON">
              <Download size={14} /> <span className="hidden sm:inline">JSON</span>
            </button>
            <button onClick={handleClear} disabled={completedCount === 0}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors flex items-center gap-1.5"
              title="Limpar respostas">
              <Trash2 size={14} />
            </button>
            <button onClick={onLock}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
              title="Bloquear sessão">
              <Lock size={14} />
            </button>
            {view === "block" && (
              <button onClick={backToMap} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors flex items-center gap-1.5">
                <ArrowLeft size={14} /> Mapa
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {view === "mindmap" && <MindMap onOpenBlock={openBlock} answers={answers} total={totalQuestions} />}
        {view === "block" && activeBlock && <BlockView block={BLOCKS[activeBlock]} onOpenQuestion={openQuestion} answers={answers} />}

        {view === "contract" && (
          <div>
            <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Contrato Consolidado</h2>
                <p className="text-xs text-slate-500">Versão com decisões da reunião aplicadas. Clique em "Baixar PDF" para gerar o documento.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setView("mindmap")}
                  className="text-xs font-medium px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  ← Voltar
                </button>
                <button
                  onClick={handleContractPdf}
                  className="text-xs font-medium px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5"
                >
                  <FileSignature size={14} /> Baixar PDF
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <ContractPreview answers={answers} questions={QUESTIONS} />
            </div>
          </div>
        )}
      </main>

      {activeQuestion && (
        <QuestionModal
          qid={activeQuestion}
          question={QUESTIONS[activeQuestion]}
          block={findBlock(activeQuestion)}
          currentAnswer={answers[activeQuestion]}
          onClose={() => setActiveQuestion(null)}
          onAnswer={(resp, txt) => { handleAnswer(activeQuestion, resp, txt); }}
        />
      )}

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 pt-4">
        <div className="text-center text-xs text-slate-400 space-y-1">
          <div>3 opções por pergunta: <span className="font-medium text-emerald-600">CONCORDO</span> · <span className="font-medium text-amber-600">RESSALVAS</span> · <span className="font-medium text-rose-600">DISCORDO</span></div>
          <div className="flex items-center justify-center gap-1">
            <Lock size={10} /> AES-GCM · chave mestra por token (FIFO máx. 5)
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Token management ─── */

function TokenAdminButton({ onIssued }) {
  const [open, setOpen] = useState(false);
  const [currentToken, setCurrentToken] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const meta = listTokensMeta();

  const handleGenerate = async () => {
    setErr("");
    setBusy(true);
    try {
      const newToken = await generateNewToken(currentToken);
      setCurrentToken("");
      setOpen(false);
      onIssued(newToken);
    } catch (e) {
      setErr(e.message || "Falha ao gerar token.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors flex items-center gap-1.5"
        title="Gerenciar tokens"
      >
        <KeyRound size={14} /> <span className="hidden sm:inline">Tokens ({meta.length}/5)</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)} role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-violet-500 flex items-center justify-center text-white">
                <KeyRound size={18} />
              </div>
              <div>
                <h2 className="font-semibold">Gerenciar tokens</h2>
                <p className="text-xs text-slate-500">FIFO · últimos 5 · AES-GCM wrap</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Tokens ativos ({meta.length}/5)
              </div>
              <div className="space-y-1">
                {meta.length === 0 && <div className="text-xs text-slate-400">Nenhum token ativo.</div>}
                {meta.map((t, i) => (
                  <div key={t.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400">#{i + 1}</span>
                      <span className="font-mono text-slate-700">…{t.hash}</span>
                    </div>
                    <span className="text-slate-500">{new Date(t.createdAt).toLocaleString("pt-BR")}</span>
                  </div>
                ))}
              </div>
              {meta.length >= 5 && (
                <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
                  FIFO cheia: o token mais antigo será expulso quando você gerar um novo.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Gerar novo token
              </div>
              <p className="text-xs text-slate-600 mb-2">
                Digite seu token atual para autorizar a emissão de um novo.
                A chave mestra é re-envelopada sob o novo token — seus dados continuam acessíveis.
              </p>
              <input type="password" value={currentToken}
                onChange={(e) => setCurrentToken(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none text-sm mb-2"
                placeholder="Token atual" />
              {err && <p className="text-xs text-rose-600 mb-2">{err}</p>}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setOpen(false)} className="py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium">
                  Cancelar
                </button>
                <button onClick={handleGenerate} disabled={busy || !currentToken}
                  className="py-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-sm font-medium flex items-center justify-center gap-1.5">
                  <Plus size={14} /> {busy ? "Gerando..." : "Gerar"}
                </button>
              </div>
              <button
                onClick={() => {
                  if (confirm("Apagar TODOS os tokens e respostas? Ação irreversível.")) {
                    purgeAll();
                    clearAnswers();
                    location.reload();
                  }
                }}
                className="w-full mt-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium border border-rose-200"
              >
                Apagar tudo e recomeçar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TokenRevealModal({ token, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
            <KeyRound size={18} />
          </div>
          <div>
            <h2 className="font-semibold">Novo token gerado</h2>
            <p className="text-xs text-slate-500">Este valor não será exibido novamente.</p>
          </div>
        </div>
        <div className="rounded-lg bg-slate-900 text-white p-3 font-mono text-sm break-all mb-3 select-all">
          {token}
        </div>
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 mb-4">
          Guarde em gerenciador de senhas. Se perder todos os tokens da FIFO,
          as respostas cifradas ficam irrecuperáveis.
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={copy} className="py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium flex items-center justify-center gap-2">
            <Copy size={14} /> {copied ? "Copiado!" : "Copiar"}
          </button>
          <button onClick={onClose} className="py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium">
            Já guardei
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Mind map ─── */

function MindMap({ onOpenBlock, answers, total }) {
  return (
    <div className="relative">
      <div className="text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium mb-4">
          <Sparkles size={12} /> Mapa mental da negociação
        </div>
        <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight mb-3">Contrato CIT AI TECH</h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">{total} pontos em {Object.keys(BLOCKS).length} blocos. Toque em qualquer bloco para abrir.</p>
      </div>

      <div className="flex justify-center mb-8 sm:mb-12">
        <div className="relative">
          <div className="absolute inset-0 blur-2xl bg-gradient-to-br from-slate-900 to-slate-700 opacity-20 rounded-full" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex flex-col items-center justify-center text-white shadow-2xl ring-4 ring-white">
            <Target size={24} className="mb-1" />
            <div className="text-xs font-semibold tracking-wide">CONTRATO</div>
            <div className="text-[10px] opacity-70">Master + TEPs</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto">
        {Object.values(BLOCKS).map((block, idx) => {
          const blockCompleted = block.questions.filter(q => answers[q]).length;
          const blockTotal = block.questions.length;
          const c = COLOR_MAP[block.color];
          const Icon = ICON_MAP[block.iconName];
          return (
            <button key={block.id} onClick={() => onOpenBlock(block.id)} className={`group relative text-left p-5 rounded-2xl bg-white border ${c.border} ${c.bgHover} transition-all duration-200 hover:scale-[1.015] hover:shadow-xl active:scale-[0.99] focus:outline-none focus:ring-2 ${c.ring} focus:ring-offset-2 min-h-[180px]`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white shadow-lg shrink-0`}>
                  <Icon size={20} />
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Bloco {idx + 1}</div>
                  <div className={`text-xs font-semibold ${c.textMuted}`}>{blockCompleted}/{blockTotal}</div>
                </div>
              </div>
              <h3 className={`text-base sm:text-lg font-semibold ${c.text} mb-1`}>{block.title}</h3>
              <p className="text-xs text-slate-500 mb-4">{block.subtitle}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {block.keywords.map(kw => <span key={kw} className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${c.chip}`}>{kw}</span>)}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex gap-1">
                  {block.questions.map(qid => {
                    const a = answers[qid];
                    const color = !a ? "bg-slate-200" : a.response === "agree" ? "bg-emerald-500" : a.response === "conditional" ? "bg-amber-500" : "bg-rose-500";
                    return <div key={qid} className={`w-2 h-2 rounded-full transition-colors ${color}`} />;
                  })}
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${c.textMuted} group-hover:translate-x-0.5 transition-transform`}>
                  Abrir <ChevronRight size={14} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-10 sm:mt-14 max-w-3xl mx-auto">
        <div className="bg-white/60 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 justify-items-center text-center">
          <Legend color="bg-slate-200" label="pendente" />
          <Legend color="bg-emerald-500" label="concordo" />
          <Legend color="bg-amber-500" label="ressalvas" />
          <Legend color="bg-rose-500" label="discordo" />
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-600">
      <div className={`w-2 h-2 rounded-full ${color}`} /> {label}
    </div>
  );
}

/* ─── Block view ─── */

function BlockView({ block, onOpenQuestion, answers }) {
  const c = COLOR_MAP[block.color];
  const Icon = ICON_MAP[block.iconName];
  return (
    <div>
      <div className="flex items-start gap-4 mb-8">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white shadow-lg shrink-0`}><Icon size={24} /></div>
        <div>
          <div className={`text-xs font-medium ${c.textMuted} uppercase tracking-wider mb-1`}>{block.subtitle}</div>
          <h2 className={`text-2xl sm:text-3xl font-semibold tracking-tight ${c.text}`}>{block.title}</h2>
        </div>
      </div>

      <div className="relative">
        <div className={`absolute left-5 sm:left-7 top-0 bottom-0 w-0.5 ${c.bg} opacity-20`} />
        <div className="space-y-3 sm:space-y-4">
          {block.questions.map((qid, idx) => {
            const q = QUESTIONS[qid];
            const a = answers[qid];
            const optStyle = a ? OPTION_STYLES[a.response] : null;
            return (
              <div key={qid} className="relative pl-12 sm:pl-16">
                <div className={`absolute left-3 sm:left-5 top-5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white shadow-md ${optStyle ? optStyle.pill : c.bg}`}>
                  <span className="text-[10px] font-bold text-white">{idx + 1}</span>
                </div>
                <button onClick={() => onOpenQuestion(qid)} className={`group w-full text-left p-4 sm:p-5 bg-white rounded-xl border ${c.border} ${c.bgHover} transition-all duration-150 hover:shadow-md active:scale-[0.995] focus:outline-none focus:ring-2 ${c.ring} focus:ring-offset-2 min-h-[88px]`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium text-slate-400 mb-1">{q.clause}</div>
                      <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">{q.title}</h3>
                    </div>
                    {a && (
                      <div className={`shrink-0 px-2 py-1 rounded-md text-[10px] font-semibold ${optStyle.chip} border ${optStyle.border}`}>
                        {optStyle.label}
                      </div>
                    )}
                  </div>
                  {a && a.ressalva_text && (
                    <div className="mt-2 text-xs text-slate-600 italic line-clamp-2 bg-amber-50 border-l-2 border-amber-300 pl-2 py-1">
                      "{a.ressalva_text}"
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {q.keywords.map(kw => <span key={kw} className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${c.chip}`}>{kw}</span>)}
                  </div>
                  <div className={`mt-3 pt-3 border-t border-slate-100 flex items-center justify-end gap-1 text-xs font-medium ${c.textMuted} group-hover:translate-x-0.5 transition-transform`}>
                    {a ? "Revisar resposta" : "Responder"} <ChevronRight size={14} />
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Question modal (3 opções) ─── */

function QuestionModal({ qid, question, block, currentAnswer, onClose, onAnswer }) {
  const c = COLOR_MAP[block.color];
  const [response, setResponse] = useState(currentAnswer?.response || null);
  const [ressalvaText, setRessalvaText] = useState(currentAnswer?.ressalva_text || "");

  const handleSave = () => {
    if (!response) return;
    if (response === "conditional" && !ressalvaText.trim()) {
      alert("Descreva sua ressalva no campo de texto.");
      return;
    }
    onAnswer(response, ressalvaText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="relative w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center z-10" aria-label="Fechar">
          <X size={18} />
        </button>

        <div className="p-5 sm:p-8 pr-16 sm:pr-20">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${c.chip} text-xs font-semibold mb-3`}>{question.tag}</div>
          <div className="text-xs font-medium text-slate-500 mb-2">{question.clause}</div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight mb-5 leading-tight">{question.title}</h2>

          <div className="flex flex-wrap gap-1.5 mb-6">
            {question.keywords.map(kw => <span key={kw} className={`px-2 py-1 rounded-md text-xs font-medium ${c.chip}`}>{kw}</span>)}
          </div>

          <div className="space-y-4 mb-6">
            {question.contract && (
              <Section icon={<FileText size={14} />} label="O que diz o contrato" text={question.contract} contract />
            )}
            <Section icon={<Lightbulb size={14} />} label="Contexto" text={question.why} />
            <Section icon={<Target size={14} />} label="Pergunta" text={question.ask} highlight />
            <Section icon={<Sparkles size={14} />} label="Sugestão (mandato)" text={question.suggestion} />
          </div>

          {question.showCategoryTable && <CategoryTable />}
          {question.showInsumosTable && <InsumosTable />}
          {question.showClauseRedaction && <ClauseRedaction text={question.clauseRedaction} />}

          <div className="pt-4 border-t border-slate-200">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Decisão (escolha única)</div>
            <div className="space-y-2">
              {Object.entries(OPTION_STYLES).map(([key, style]) => {
                const isSelected = response === key;
                const rt = RESPONSE_TYPES[key];
                return (
                  <button
                    key={key}
                    onClick={() => setResponse(key)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-start gap-3 ${isSelected ? `${style.bg} ${style.border} ring-2 ring-offset-1 ring-slate-400` : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
                  >
                    <div className={`shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${isSelected ? style.pill + " border-transparent" : "border-slate-300"}`}>
                      {isSelected && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${style.chip}`}>{style.label}</span>
                      </div>
                      <div className={`text-sm font-medium ${isSelected ? style.text : "text-slate-800"}`}>{rt.label}</div>
                      {rt.note && <div className="text-[11px] text-slate-500 mt-0.5">{rt.note}</div>}
                    </div>
                  </button>
                );
              })}
            </div>

            {response === "conditional" && (
              <div className="mt-3 p-3 bg-amber-50 border-2 border-amber-200 rounded-xl">
                <div className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
                  <AlertCircle size={14} /> Descreva sua ressalva
                </div>
                <textarea value={ressalvaText} onChange={(e) => setRessalvaText(e.target.value)} placeholder="Ex: Concordo com 50/50, mas precisamos definir prazo de pagamento de receitas em até 30 dias..." className="w-full p-3 border border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none text-sm resize-none bg-white" rows={4} />
              </div>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-2 gap-2">
            <button onClick={onClose} className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-all min-h-[44px]">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={!response} className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm transition-all min-h-[44px] flex items-center justify-center gap-2">
              <CheckCircle2 size={16} /> Registrar decisão
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Embedded components ─── */

function CategoryTable() {
  return (
    <div className="mb-6 bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 rounded-xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
          <Table2 size={16} />
        </div>
        <div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Anexo proposto</div>
          <div className="text-sm font-semibold text-slate-900">Tabela de Categorização</div>
        </div>
      </div>

      <div className="space-y-3">
        {PROJECT_CATEGORIES.map((cat) => {
          const c = COLOR_MAP[cat.color];
          const bg = cat.color === 'blue' ? '#eff6ff' : '#f5f3ff';
          return (
            <div key={cat.id} className={`p-3 rounded-lg border-2 ${c.border}`} style={{ background: bg }}>
              <div className={`text-sm font-semibold ${c.text} mb-1`}>{cat.name}</div>
              <div className="text-xs text-slate-600 mb-3">{cat.description}</div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/70 rounded-md p-2">
                  <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Camilla</div>
                  <div className="flex items-baseline gap-2 text-xs">
                    <span><strong>Receita</strong> {cat.receita_camilla}</span>
                    <span className="text-slate-400">·</span>
                    <span><strong>Custo</strong> {cat.custo_camilla}</span>
                  </div>
                </div>
                <div className="bg-white/70 rounded-md p-2">
                  <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">CIT</div>
                  <div className="flex items-baseline gap-2 text-xs">
                    <span><strong>Receita</strong> {cat.receita_cit}</span>
                    <span className="text-slate-400">·</span>
                    <span><strong>Custo</strong> {cat.custo_cit}</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 text-[11px] italic text-slate-600">{cat.rationale}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-slate-100 rounded-lg text-xs text-slate-700 leading-relaxed">
        <strong>Princípio de simetria:</strong> quem recebe X% das receitas arca com X% dos custos.
      </div>
    </div>
  );
}

function InsumosTable() {
  return (
    <div className="mb-6 bg-gradient-to-br from-rose-50 to-white border-2 border-rose-200 rounded-xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
          <Truck size={16} />
        </div>
        <div>
          <div className="text-[10px] font-semibold text-rose-700 uppercase tracking-wider">Modelo proposto</div>
          <div className="text-sm font-semibold text-slate-900">Insumos & Equipamentos</div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-rose-100 text-rose-900">
              <th className="text-left p-2 font-semibold">Item</th>
              <th className="text-left p-2 font-semibold">Quem compra</th>
              <th className="text-left p-2 font-semibold">Quem fica com o ativo</th>
            </tr>
          </thead>
          <tbody>
            {INSUMOS_TABLE.map((row, i) => (
              <tr key={i} className="border-b border-rose-100 last:border-b-0">
                <td className="p-2 font-medium text-slate-800">{row.item}</td>
                <td className="p-2 text-slate-700">{row.compra}</td>
                <td className="p-2 text-slate-700">{row.ativo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClauseRedaction({ text }) {
  return (
    <div className="mb-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
          <FileCode2 size={16} />
        </div>
        <div>
          <div className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider">Mandato — redação proposta</div>
          <div className="text-sm font-semibold text-white">Cláusula a inserir/substituir</div>
        </div>
      </div>
      <pre className="text-[11px] sm:text-xs text-slate-100 font-mono whitespace-pre-wrap leading-relaxed bg-slate-950/40 p-3 rounded-lg overflow-x-auto">
        {text}
      </pre>
    </div>
  );
}

function Section({ icon, label, text, highlight, contract }) {
  let cls, labelCls, textCls;
  if (highlight) {
    cls = "bg-slate-900 text-white";
    labelCls = "text-slate-300";
    textCls = "text-white";
  } else if (contract) {
    cls = "bg-amber-50 border-l-4 border-amber-400";
    labelCls = "text-amber-700";
    textCls = "text-amber-900 font-mono text-[13px]";
  } else {
    cls = "bg-slate-50";
    labelCls = "text-slate-500";
    textCls = "text-slate-800";
  }
  return (
    <div className={`p-3 rounded-xl ${cls}`}>
      <div className={`flex items-center gap-1.5 text-[10px] font-semibold mb-1 ${labelCls} uppercase tracking-wider`}>{icon} {label}</div>
      <p className={`text-sm leading-relaxed ${textCls}`}>{text}</p>
    </div>
  );
}
