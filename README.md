# Pauta Interativa — Reunião CIT AI TECH

App React/Vite para conduzir a reunião de negociação do contrato com o Instituto Innovar (CIT AI TECH).

**14 perguntas · 5 blocos temáticos · 5 opções de resposta por pergunta:**

- 🟢 **Ideal** — solução recomendada
- 🔵 **Alternativa** — 2ª melhor opção
- 🟡 **Aceitável** — meio-termo
- 🟣 **Advogada retornará com análise** — aguarda análise jurídica
- ⚪ **Outro (texto aberto)** — campo livre para anotação

## Funcionalidades

- Mapa mental clicável dos 5 blocos temáticos
- Timeline vertical das perguntas dentro de cada bloco
- Modal com contexto + pergunta + sugestão + 5 opções em radio
- **Persistência local** (localStorage) — nada vai pra servidor
- **Criptografia opcional** via senha (AES-GCM, Web Crypto API nativa)
- **Export JSON** das respostas para compartilhar com advogada
- **Deploy automático** no GitHub Pages via Actions
- **Proteção opcional de acesso** via hash SHA-256 em secret

## Estrutura

```
pauta-app/
├── src/
│   ├── App.jsx           # UI principal
│   ├── main.jsx          # Entry point
│   ├── index.css         # Tailwind
│   └── lib/
│       ├── data.js       # Perguntas, blocos, opções
│       └── storage.js    # localStorage + crypto
├── .github/workflows/
│   └── deploy.yml        # CI/CD
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Rodar local

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Publicar no GitHub Pages

### Passo 1 — Criar repo e push

```bash
git init
git add .
git commit -m "Pauta CIT — v2"
git branch -M main
git remote add origin git@github.com:SEU_USUARIO/pauta-cit.git
git push -u origin main
```

### Passo 2 — Ativar Pages

1. Vá em **Settings → Pages** no repositório
2. Em **Source**, selecione **GitHub Actions**
3. Faça um novo push ou rode o workflow manualmente em **Actions**

### Passo 3 (opcional) — Proteger acesso com token

Se quiser que a página só abra com senha compartilhada:

1. **Settings → Secrets and variables → Actions → New repository secret**
2. Nome: `APP_ACCESS_TOKEN`
3. Valor: uma senha forte (ex: `camilla-cit-2026-recife`)
4. Rode novamente o workflow

O workflow cifra o token como hash SHA-256 e embute no build. Ao acessar o site,
a pessoa precisa digitar o token; se o hash bater, o app abre. **O token nunca
sai do cliente** — a comparação é feita localmente no navegador.

## Export JSON de respostas

Ao clicar no botão **Exportar** (canto superior direito), baixa um arquivo
`pauta-cit-respostas-YYYY-MM-DD.json` com todas as respostas no formato:

```json
{
  "metadata": { "exportedAt": "...", "version": "2.0.0" },
  "respostas": [
    {
      "pergunta_id": "q1",
      "pergunta": "Participação em receitas futuras da PI",
      "clausula": "Cl. 3 — Propriedade Intelectual",
      "resposta_selecionada": "a",
      "resposta_label": "1/3 (33%) pro inventor sobre o líquido",
      "tipo": "solution_best",
      "texto_aberto": null,
      "respondido_em": "2026-04-22T14:35:00.000Z"
    }
  ]
}
```

Esse JSON pode ser enviado direto pra advogada — ela tem contexto completo sem ler conversa nenhuma.

## Segurança

- **localStorage** não é compartilhado entre dispositivos; cada navegador tem o seu
- **Criptografia AES-GCM** com PBKDF2 (150k iterações) — padrão forte
- **Token de acesso** comparado via SHA-256 — nunca vai em texto claro pro repositório
- GitHub Pages serve via HTTPS

## Customizar as perguntas

Edite `src/lib/data.js`:

```js
export const QUESTIONS = {
  q1: {
    title: "...",
    ask: "...",
    options: [
      { value: "a", label: "...", type: "solution_best" },
      // ...
    ]
  }
};
```

Os `type` disponíveis são: `solution_best`, `solution_alt`, `solution_weak`, `lawyer`, `open`.
