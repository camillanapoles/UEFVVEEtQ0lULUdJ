# Plano: PAUTA-CIT-GI — Merge ZIP + Git + 3 respostas

## Goal

Mesclar conteudo das perguntas do ZIP com a infraestrutura do git atual,
simplificando o sistema de resposta para 3 opcoes (concordo / discordo /
ressalvas com texto). Manter visual, tokens, PDF e storage do git.

## Regra de merge

```
CONTEUDO  (perguntas, blocos, textos)  ← ZIP (PAUTA-CIT-GI.zip)
INFRA     (token FIFO, visual, layout)  ← GIT (repo atual)
RESPOSTA  (sistema)                     ← ZIP (3 opcoes, nao 5)
EXPORT    (PDF + JSON)                  ← GIT (mantido, adaptado)
```

## Diff: ZIP vs GIT — o que muda em cada arquivo

### 1. `src/lib/data.js` — REESCREVER com conteudo do ZIP

**Blocos**: ZIP tem 6 blocos (inclui "estrutura"), GIT tem 5.

```
ZIP:  estrutura, remuneracao, propriedade, riscos, infra, operacional
GIT:  remuneracao, propriedade, riscos, infra, operacional
```

ZIP tem 14 perguntas (q15,q1,q1b,q2,q4,q5,q6,q7,q8,q13,q14,q10,q11,q12)
GIT tem 12 perguntas (q15,q2,q4,q5,q6,q7,q8,q13,q14,q10,q11,q12)

Diferencas:
- ZIP adiciona **q1b** (Categorizacao A/B) e separa **q1** (50/50 receitas)
- ZIP tem campos: `why`, `ask`, `suggestion`, `showCategoryTable`,
  `showInsumosTable`, `showClauseRedaction`, `clauseRedaction`
- GIT tem campos: `contract`, `options[]` (5 opcoes)
- ZIP tem `PROJECT_CATEGORIES`, `INSUMOS_TABLE`, `RESPONSE_TYPES`
- GIT tem `OPTION_STYLES`

**Acao**:
- Usar o data.js do ZIP como base
- Adicionar campo `contract` do GIT (quote do contrato) nas perguntas que tinham
- Remover `options[]` (5 opcoes) — usar `RESPONSE_TYPES` do ZIP (3 opcoes)
- Manter `PROJECT_CATEGORIES`, `INSUMOS_TABLE` do ZIP
- Manter `COLOR_MAP` do ZIP (tem `slate` a mais para o bloco "estrutura")
- Remover `OPTION_STYLES` do GIT

### 2. `src/App.jsx` — ADAPTAR

O que manter do GIT:
- AccessGate com bootstrap/token FIFO
- MainApp com loaded/pruning/auto-save
- TokenAdminButton + TokenRevealModal
- MindMap, BlockView layout e visual
- Lock button no header
- Token modal system

O que mudar do GIT → ZIP:
- **QuestionModal**: trocar 5 opcoes (options[]) por 3 botoes fixos
  (CONCORDO / DISCORDO / RESSALVAS com textarea)
- **handleAnswer**: formato `{response, ressalva_text, timestamp}`
  ao inves de `{selected, label, type, open_text, timestamp}`
- **Indicadores de cor**: agree=emerald, disagree=rose, conditional=amber
  ao inves de 5 cores por tipo de opcao
- **Legend**: 4 itens (pendente/concordo/ressalvas/discordo) ao inves de 5
- **Section**: manter `contract` do GIT (quote amber) + `why`, `ask`,
  `suggestion` do ZIP + campos novos do ZIP
- **Componentes novos do ZIP**: CategoryTable, InsumosTable, ClauseRedaction
- **Stats**: agree/disagree/conditional ao inves de types variados

O que REMOVER do GIT:
- OPTION_STYLES imports/usage
- Logica de 5 opcoes no QuestionModal
- selected/type/label no handleAnswer
- open_text field (trocar por ressalva_text)

### 3. `src/lib/storage.js` — ADAPTAR formato de resposta

Manter do GIT:
- Token FIFO / masterKey / AES-GCM encrypt
- loadAnswers, saveAnswers, clearAnswers
- exportAnswersAsJson
- exportAnswersAsPdf (com jsPDF)

Mudar:
- Formato do entry: `{response, ressalva_text, timestamp}`
  (era `{selected, label, type, open_text, timestamp}`)
- PDF: mapear `response` (agree/conditional/disagree) ao inves de `type`
- JSON: campos `decisao`, `decisao_label`, `ressalva_texto`

### 4. `src/lib/access.js` — SEM MUDANCA

Manter do GIT. O ZIP tinha versao mais simples (hash unico).
Git tem versao com token FIFO — manter.

### 5. `src/lib/tokens.js` — SEM MUDANCA

Manter do GIT inteiro.

### 6. Outros arquivos — SEM MUDANCA

- `package.json` — manter deps atuais (jspdf ja instalado)
- `vite.config.js` — manter
- `tailwind.config.js` — manter
- `postcss.config.js` — manter
- `index.html` — manter
- `.github/workflows/deploy.yml` — manter
- `src/main.jsx` — manter
- `src/index.css` — manter

## Formato de resposta (novo, do ZIP)

```js
// Cada resposta salva:
{
  response: "agree" | "disagree" | "conditional",
  ressalva_text: string | null,  // preenchido se conditional
  timestamp: "2026-04-27T15:30:00.000Z"
}
```

```js
// RESPONSE_TYPES (do ZIP):
{
  agree:      { label: "CONCORDO",               color: "#10b981", ... },
  disagree:   { label: "DISCORDO",               color: "#dc2626", ... },
  conditional:{ label: "CONCORDO COM RESSALVAS",  color: "#d97706", ... }
}
```

## Ordem de execucao

```
1. Reescrever src/lib/data.js
   - 6 blocos do ZIP
   - 14 perguntas do ZIP (com contract do GIT mesclado)
   - RESPONSE_TYPES do ZIP (3 opcoes)
   - PROJECT_CATEGORIES + INSUMOS_TABLE do ZIP
   - COLOR_MAP do ZIP (com slate)
   - Remover OPTION_STYLES

2. Reescrever src/App.jsx
   - Manter infra do GIT (tokens, access, visual base)
   - QuestionModal com 3 opcoes + textarea de ressalva
   - CategoryTable, InsumosTable, ClauseRedaction do ZIP
   - Stats agree/disagree/conditional
   - Legend 4 itens

3. Adaptar src/lib/storage.js
   - Formato {response, ressalva_text, timestamp}
   - PDF com mapeamento de 3 responses
   - JSON com campos atualizados

4. Testar: npm run dev

5. Build: npm run build
```

## Arquivos que mudam

```
src/lib/data.js    ← REWRITE (conteudo ZIP + contract do GIT, 3 responses)
src/App.jsx        ← REWRITE (infra GIT + 3 responses + componentes ZIP)
src/lib/storage.js ← ADAPTAR (formato resposta + PDF)
```

Arquivos que NAO mudam:
```
src/lib/access.js    ← manter
src/lib/tokens.js    ← manter
src/main.jsx         ← manter
package.json         ← manter
vite.config.js       ← manter
index.html           ← manter
```

## Validacao

- [ ] 6 blocos aparecem no mapa (incluindo "Estrutura da Relacao")
- [ ] 14 perguntas visiveis, conteudo rico do ZIP
- [ ] 3 opcoes de resposta: CONCORDO / DISCORDO / RESSALVAS
- [ ] Campo de texto aparece ao selecionar RESSALVAS
- [ ] Auto-save funciona (localStorage + AES-GCM via masterKey)
- [ ] Token FIFO funciona (bootstrap, gerar novo, lock/unlock)
- [ ] PDF gerado com as 3 categorias de resposta
- [ ] JSON exportado com campos corretos
- [ ] CategoryTable e InsumosTable aparecem nas perguntas certas
- [ ] ClauseRedaction aparece nas perguntas com showClauseRedaction
- [ ] Visual mantido (cores, gradientes, layout do git atual)
- [ ] Build sem erros
