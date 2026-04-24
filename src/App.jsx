import React, { useEffect, useState } from "react";
import {
  DollarSign, ShieldCheck, AlertTriangle, Settings, Truck,
  ChevronRight, X, CheckCircle2, XCircle, Sparkles,
  FileText, Lightbulb, Target, HelpCircle, ArrowLeft,
  Download, Trash2, Lock, Unlock
} from "lucide-react";

import { BLOCKS, QUESTIONS, COLOR_MAP, OPTION_STYLES, findBlock } from "./lib/data";
import { saveAnswers, loadAnswers, clearAnswers, exportAnswersAsJson } from "./lib/storage";
import { isAccessRequired, hasValidSession, validateToken } from "./lib/access";

const ICON_MAP = { DollarSign, ShieldCheck, AlertTriangle, Settings, Truck };

export default function App() {
  const [accessGranted, setAccessGranted] = useState(!isAccessRequired() || hasValidSession());

  if (!accessGranted) {
    return <AccessGate onGranted={() => setAccessGranted(true)} />;
  }

  return <MainApp />;
}

function AccessGate({ onGranted }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const handleSubmit = async () => {
    setChecking(true);
    setError("");
    const ok = await validateToken(token);
    setChecking(false);
    if (ok) onGranted();
    else setError("Token inválido.");
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
        <p className="text-sm text-slate-600 mb-5">Digite o token de acesso para continuar.</p>
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
        <p className="text-[10px] text-slate-400 text-center mt-4">Token validado localmente via SHA-256</p>
      </div>
    </div>
  );
}

function MainApp() {
  const [view, setView] = useState("mindmap");
  const [activeBlock, setActiveBlock] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [answers, setAnswers] = useState({});
  const [password, setPassword] = useState("");
  const [passwordPromptOpen, setPasswordPromptOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Carrega respostas ao montar (tenta sem senha; se for cifrado, pede)
  useEffect(() => {
    (async () => {
      try {
        const data = await loadAnswers("");
        setAnswers(data);
        setLoaded(true);
      } catch (e) {
        setPasswordPromptOpen(true);
      }
    })();
  }, []);

  // Persiste ao mudar
  useEffect(() => {
    if (!loaded) return;
    saveAnswers(answers, password).catch(console.error);
  }, [answers, password, loaded]);

  const totalQuestions = Object.keys(QUESTIONS).length;
  const completedCount = Object.keys(answers).length;
  const progress = Math.round((completedCount / totalQuestions) * 100);

  const handleAnswer = (qid, option, openText) => {
    const entry = {
      selected: option.value,
      label: option.label,
      type: option.type,
      open_text: option.type === "open" ? (openText || "").trim() : null,
      timestamp: new Date().toISOString()
    };
    setAnswers((prev) => ({ ...prev, [qid]: entry }));
  };

  const openQuestion = (qid) => setActiveQuestion(qid);
  const openBlock = (bid) => { setActiveBlock(bid); setView("block"); };
  const backToMap = () => { setActiveBlock(null); setView("mindmap"); };

  const handleExport = () => exportAnswersAsJson(answers, QUESTIONS);

  const handleClear = () => {
    if (confirm("Apagar todas as respostas salvas?")) {
      clearAnswers();
      setAnswers({});
      setPassword("");
    }
  };

  const handleUnlock = async (pwd) => {
    try {
      const data = await loadAnswers(pwd);
      setAnswers(data);
      setPassword(pwd);
      setLoaded(true);
      setPasswordPromptOpen(false);
      setLoadError(null);
    } catch (e) {
      setLoadError("Senha incorreta — tente novamente ou apague os dados.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 font-sans antialiased">
      {passwordPromptOpen && (
        <PasswordPrompt onUnlock={handleUnlock} onClear={() => { clearAnswers(); setPasswordPromptOpen(false); setAnswers({}); setLoaded(true); }} error={loadError} />
      )}

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white shadow-lg">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold tracking-tight truncate">Pauta da Reunião · CIT AI TECH</h1>
              <p className="text-xs text-slate-500 truncate">{totalQuestions} perguntas · {Object.keys(BLOCKS).length} blocos · ~45 min</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <div className="w-28 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs font-medium text-slate-600 tabular-nums">{completedCount}/{totalQuestions}</span>
            </div>
            <button onClick={handleExport} disabled={completedCount === 0} className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex items-center gap-1.5" title="Exportar JSON">
              <Download size={14} /> <span className="hidden sm:inline">Exportar</span>
            </button>
            <button onClick={handleClear} disabled={completedCount === 0} className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors flex items-center gap-1.5" title="Limpar respostas">
              <Trash2 size={14} />
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
      </main>

      {activeQuestion && (
        <QuestionModal
          qid={activeQuestion}
          question={QUESTIONS[activeQuestion]}
          block={findBlock(activeQuestion)}
          currentAnswer={answers[activeQuestion]}
          onClose={() => setActiveQuestion(null)}
          onAnswer={(opt, txt) => { handleAnswer(activeQuestion, opt, txt); }}
        />
      )}

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 pt-4">
        <div className="text-center text-xs text-slate-400 space-y-1">
          <div>Clique em cada bloco → pergunta. Marque a resposta. Dados salvos localmente.</div>
          <div className="flex items-center justify-center gap-1">
            {password ? <Lock size={10} /> : <Unlock size={10} />}
            {password ? "Respostas cifradas" : "Sem criptografia (sem senha definida)"}
          </div>
        </div>
      </footer>
    </div>
  );
}

function PasswordPrompt({ onUnlock, onClear, error }) {
  const [pwd, setPwd] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-violet-500 flex items-center justify-center text-white">
            <Lock size={18} />
          </div>
          <h2 className="font-semibold">Respostas protegidas</h2>
        </div>
        <p className="text-sm text-slate-600 mb-4">Esta sessão tem respostas criptografadas salvas. Digite a senha para continuar.</p>
        <input type="password" autoFocus value={pwd} onChange={(e) => setPwd(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onUnlock(pwd)}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none text-sm mb-3" placeholder="Senha" />
        {error && <p className="text-xs text-rose-600 mb-3">{error}</p>}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => onUnlock(pwd)} className="py-2 rounded-lg bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium">Desbloquear</button>
          <button onClick={onClear} className="py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium">Apagar tudo</button>
        </div>
      </div>
    </div>
  );
}

function MindMap({ onOpenBlock, answers, total }) {
  return (
    <div className="relative">
      <div className="text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium mb-4">
          <Sparkles size={12} /> Mapa mental da negociação
        </div>
        <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight mb-3">Contrato CIT AI TECH</h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">{total} perguntas em {Object.keys(BLOCKS).length} blocos. Toque em qualquer bloco para abrir as perguntas.</p>
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
            <button key={block.id} onClick={() => onOpenBlock(block.id)}
              className={`group relative text-left p-5 rounded-2xl bg-white border ${c.border} ${c.bgHover} transition-all duration-200 hover:scale-[1.015] hover:shadow-xl active:scale-[0.99] focus:outline-none focus:ring-2 ${c.ring} focus:ring-offset-2 min-h-[180px]`}
              aria-label={`Abrir bloco ${block.title}`}>
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
                    const color = !a ? "bg-slate-200" :
                      a.type === "solution_best" ? "bg-emerald-500" :
                      a.type === "solution_alt" ? "bg-blue-500" :
                      a.type === "solution_weak" ? "bg-amber-500" :
                      a.type === "lawyer" ? "bg-violet-500" :
                      "bg-slate-500";
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
        <div className="bg-white/60 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 justify-items-center text-center">
          <Legend color="bg-slate-200" label="pendente" />
          <Legend color="bg-emerald-500" label="ideal" />
          <Legend color="bg-blue-500" label="alternativa" />
          <Legend color="bg-amber-500" label="aceitável" />
          <Legend color="bg-violet-500" label="advogada" />
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
            const optStyle = a ? OPTION_STYLES[a.type] : null;
            return (
              <div key={qid} className="relative pl-12 sm:pl-16">
                <div className={`absolute left-3 sm:left-5 top-5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white shadow-md ${optStyle ? optStyle.pill : c.bg}`}>
                  <span className="text-[10px] font-bold text-white">{idx + 1}</span>
                </div>
                <button onClick={() => onOpenQuestion(qid)}
                  className={`group w-full text-left p-4 sm:p-5 bg-white rounded-xl border ${c.border} ${c.bgHover} transition-all duration-150 hover:shadow-md active:scale-[0.995] focus:outline-none focus:ring-2 ${c.ring} focus:ring-offset-2 min-h-[88px]`}
                  aria-label={`Abrir pergunta ${q.title}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium text-slate-400 mb-1">{q.clause}</div>
                      <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">{q.title}</h3>
                    </div>
                    {a && (
                      <div className={`shrink-0 px-2 py-1 rounded-md text-[10px] font-semibold ${optStyle.bg} ${optStyle.text} border ${optStyle.border}`}>
                        {optStyle.label}
                      </div>
                    )}
                  </div>
                  {a && (
                    <div className="mt-2 text-xs text-slate-600 italic line-clamp-2">
                      "{a.type === 'open' && a.open_text ? a.open_text : a.label}"
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

function QuestionModal({ qid, question, block, currentAnswer, onClose, onAnswer }) {
  const c = COLOR_MAP[block.color];
  const [selected, setSelected] = useState(currentAnswer?.selected || null);
  const [openText, setOpenText] = useState(currentAnswer?.open_text || "");

  const selectedOption = question.options.find((o) => o.value === selected);

  const handleSave = () => {
    if (!selectedOption) return;
    if (selectedOption.type === "open" && !openText.trim()) {
      alert("Preencha o campo de texto aberto antes de salvar.");
      return;
    }
    onAnswer(selectedOption, openText);
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
            <Section icon={<Lightbulb size={14} />} label="Contexto" text={question.why} />
            <Section icon={<Target size={14} />} label="Pergunta ao CIT" text={question.ask} highlight />
            <Section icon={<Sparkles size={14} />} label="Sugestão" text={question.suggestion} />
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Resposta do Instituto</div>
            <div className="space-y-2">
              {question.options.map((opt) => {
                const style = OPTION_STYLES[opt.type];
                const isSelected = selected === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSelected(opt.value)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-start gap-3 ${isSelected ? `${style.bg} ${style.border} ring-2 ring-offset-1 ring-slate-400` : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
                  >
                    <div className={`shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${isSelected ? style.pill + " border-transparent" : "border-slate-300"}`}>
                      {isSelected && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${style.bg} ${style.text}`}>{style.label}</span>
                      </div>
                      <div className={`text-sm font-medium ${isSelected ? style.text : "text-slate-800"}`}>{opt.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedOption?.type === "open" && (
              <textarea
                value={openText}
                onChange={(e) => setOpenText(e.target.value)}
                placeholder="Escreva o que o Instituto respondeu ou anote suas observações..."
                className="mt-3 w-full p-3 border-2 border-slate-200 rounded-xl focus:border-slate-400 focus:outline-none text-sm resize-none"
                rows={4}
              />
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-2 gap-2">
            <button onClick={onClose} className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-all min-h-[44px]">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={!selectedOption} className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm transition-all min-h-[44px] flex items-center justify-center gap-2">
              <CheckCircle2 size={16} /> Salvar resposta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ icon, label, text, highlight }) {
  return (
    <div className={`p-3 rounded-xl ${highlight ? "bg-slate-900 text-white" : "bg-slate-50"}`}>
      <div className={`flex items-center gap-1.5 text-[10px] font-semibold mb-1 ${highlight ? "text-slate-300" : "text-slate-500"} uppercase tracking-wider`}>{icon} {label}</div>
      <p className={`text-sm leading-relaxed ${highlight ? "text-white" : "text-slate-800"}`}>{text}</p>
    </div>
  );
}
