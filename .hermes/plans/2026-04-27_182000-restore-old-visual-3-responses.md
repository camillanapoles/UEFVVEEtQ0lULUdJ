# Plano: Restaurar estilo visual antigo + manter 3 respostas

## Objetivo
Recuperar o estilo visual polido da versão anterior (git 3ebffc1, 5 respostas)
aplicado ao sistema atual de 3 respostas (CONCORDO / RESSALVAS / DISCORDO).

## Análise — o que difere visualmente

Comparando App.jsx antigo (3ebffc1) vs atual (main 86dd535):

| Aspecto | Antigo (5 resp) | Atual (3 resp) | Status |
|---------|-----------------|----------------|--------|
| AccessGate | Bootstrap + login | Idêntico | OK |
| MindMap | 5 cores na legenda | 4 cores (3+pendente) | OK (correto p/ 3 resp) |
| MindMap bloco | "Bloco {idx+1}" | "Bloco {idx}" | MINOR |
| BlockView timeline | OPTION_STYLES classes | RESPONSE_TYPES inline style | DIFERENTE |
| BlockView badge | optStyle classes Tailwind | inline style | DIFERENTE |
| QuestionModal sections | contract/why/ask/suggestion | Idêntico + tabelas | OK |
| QuestionModal options | Radio com OPTION_STYLES + CheckCircle2 | RESPONSE_TYPES inline style + texto icon | DIFERENTE |
| QuestionModal textarea | style="border-2" genérico | amber box estilizado | OK (atual melhor) |
| Header stats | Progress bar + counter | Stats 3 resp + progress | OK (atual melhor) |

### Mudanças necessárias:

1. **RESPONSE_TYPES → OPTION_STYLES compatível**
   - Adicionar `OPTION_STYLES` no data.js com classes Tailwind (pill, bg, text, border)
   - Manter RESPONSE_TYPES para lógica (contract preview usa)
   - BlockView: usar OPTION_STYLES para badge e timeline circle
   - QuestionModal: usar OPTION_STYLES para radio buttons com CheckCircle2

2. **MindMap bloco index**: `Bloco {idx+1}` → era assim no antigo

3. **QuestionModal options**: voltar ao estilo radio button com CheckCircle2
   - Ao invés do inline style com texto icon (✓/✕/≈), usar CheckCircle2 colorido
   - Label badge com classes Tailwind ao invés de inline styles

## Arquivos a modificar

### `src/lib/data.js`
- Adicionar `OPTION_STYLES` export (mapa de classes Tailwind por tipo de resposta)
- Manter RESPONSE_TYPES para compatibilidade com ContractPreview

### `src/App.jsx`
- **BlockView**: trocar `respType` inline styles por `OPTION_STYLES` classes
- **QuestionModal**: trocar botões de resposta para estilo radio com CheckCircle2
- **MindMap**: corrigir "Bloco {idx}" → "Bloco {idx+1}"

## Não mudar
- AccessGate (idêntico)
- TokenAdminButton (idêntico)
- TokenRevealModal (idêntico)
- CategoryTable, InsumosTable, ClauseRedaction (mantidos)
- Section component (idêntico, com modo contract)
- Contrato preview view (mantido)
- Header stats e botões (atual é melhor com stats)
- storage.js, tokens.js, access.js (sem mudança)
- contractExport.js, ContractPreview.jsx, clauseRules.js (sem mudança)

## Validação
- `npm run build` deve passar sem erros
- Visual deve parecer idêntico ao antigo (git 3ebffc1) exceto pelo número de opções
- ContractPreview deve continuar funcionando (usa RESPONSE_TYPES)
