# Seed — Sistema de Design Oficial (Dark Zinc & Emerald)

Este documento define a linguagem visual definitiva do **Seed (Hub de Gestão e Inteligência Agropecuária)**, baseada no padrão aprovado do modelo Opus. Todas as telas da aplicação e prompts para o Google Stitch devem seguir estritamente estes tokens e componentes.

---

## 1. Filosofia de Design: "Executive AgTech"
* **Atmosphere:** Dark theme sóbrio, técnico, minimalista e denso na medida certa (estilo Vercel / Linear / Raycast adaptado para o agronegócio de precisão).
* **Propósito do Dashboard (Tela 01):** Centro de comando executivo limpo. Não deve amontoar todas as ferramentas operacionais em uma só tela. Em vez disso, apresenta indicadores vitais consolidados (Clima, Custos, Frota, Epidemiologia, ESG) com ações rápidas e links de aprofundamento para as telas especializadas.
* **Telas Dedicadas para Detalhes:**
  * O mosaico detalhado de talhões pertence à **Tela 03 (Talhões & GIS)**.
  * O simulador profundo de sensibilidade financeira pertence à **Tela 07 (Viabilidade)**.
  * O mapa de calor georreferenciado com fotos pertence à **Tela 10 (Epidemiológico)**.

---

## 2. Tokens de Cores (CSS Variables)

```css
:root {
  /* Superfícies */
  --bg-primary: #09090b;       /* Fundo principal do app e sidebar */
  --bg-elevated: #18181b;      /* Cards, context-bar e containers elevados */
  --bg-surface: #1c1c21;       /* Sub-cards e elementos internos */
  --bg-hover: #27272a;         /* Estados de hover em botões e menus */
  
  /* Bordas */
  --border: #27272a;           /* Linhas estruturais e divisores de cards */
  --border-subtle: #1f1f23;    /* Linhas internas de tabelas e listas */
  
  /* Tipografia */
  --text-primary: #fafafa;     /* Títulos, valores de destaque e texto principal */
  --text-secondary: #a1a1aa;   /* Rótulos de apoio e descrições */
  --text-muted: #71717a;       /* Metadados, unidades, timestamps e breadcrumbs */
  
  /* Cores Semânticas / Marca */
  --accent: #10b981;           /* Verde Esmeralda oficial Seed (botões primários, logo, badges) */
  --accent-muted: rgba(16, 185, 129, 0.12); /* Fundos translúcidos de badges ativos */
  --accent-text: #34d399;      /* Texto de destaque verde claro */
  
  --warning: #f59e0b;          /* Âmbar de alertas moderados e revisões */
  --warning-muted: rgba(245, 158, 11, 0.12);
  
  --danger: #ef4444;           /* Vermelho de risco crítico e infestações sanitárias */
  --danger-muted: rgba(239, 68, 68, 0.12);
  
  --info: #3b82f6;             /* Azul para frotas e telemetria */
  --info-muted: rgba(59, 130, 246, 0.12);
}
```

---

## 3. Tipografia

* **Fonte Principal (Sans):** `'Inter', system-ui, sans-serif`
  * Títulos: `letter-spacing: -0.025em; font-weight: 700;`
  * Rótulos / Labels: `font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); font-weight: 500;`
* **Fonte Numérica & Técnica (Mono):** `'JetBrains Mono', monospace`
  * Usada obrigatoriamente para todos os números, hectares, valores monetários (R$), temperaturas, horímetros, porcentagens e coordenadas.

---

## 4. Componentes Chave

### 4.1 Botões
* **Botão Primário:**
  ```css
  background: var(--accent); /* #10b981 */
  color: #000000;
  font-weight: 600;
  border-radius: 8px;
  font-size: 13px;
  padding: 8px 16px;
  ```
* **Botão Secundário / Outline:**
  ```css
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  border-radius: 8px;
  font-size: 13px;
  padding: 8px 16px;
  ```
* **Micro-interação tátil:** `active: scale(0.97)` em 160ms.

### 4.2 Cards & Containers
* `background: var(--bg-elevated);` (`#18181b`)
* `border: 1px solid var(--border);` (`#27272a`)
* `border-radius: 12px;`
* Hover: `border-color: #3f3f46;`

### 4.3 Badges de Status
* Pílula arredondada (`border-radius: 100px; padding: 2px 8px; font-size: 11px; font-weight: 500;`)
* Fundo com 12% de opacidade da cor semântica e texto na cor de acento (ex: `--accent-muted` + `--accent-text`).

### 4.4 Ícones
* Linhas finas monocromáticas (`stroke-width: 1.5`), sempre com `opacity: 0.7` em estado inativo e `1.0` em estado ativo.
