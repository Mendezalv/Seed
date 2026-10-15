# Diretrizes de Marca e Identidade Visual — Seed (Agro Intelligence OS)

> **Versão Oficial 1.0** · Data: 15 de Outubro de 2026  
> **Conceito Aprovado:** GIS Radar Seed (Conceito C)  
> **Classificação Heurística de Produção SVG:** 100/100 (Master Symbol) & 91/100 (Lockups Tipográficos Vetoriais)

---

## 1. Racional do Símbolo: GIS Radar Seed

O símbolo da **Seed** sintetiza os dois pilares fundamentais da plataforma: a **ciência de dados geoespaciais e sensoriamento remoto orbital** e a **agronomia de precisão centrada na produtividade da lavoura**.

```
          [ Quadrante Norte ]
                  ▲
    [ Oeste ]  ◄ ( 💧 ) ►  [ Leste ]
                  ▼
          [ Quadrante Sul ]
```

- **4 Arcos Periféricos de Radar:** Representam os 4 pontos cardeais, o escaneamento de radares meteorológicos e satelitais, e a delimitação modular de talhões agrícolas de alta precisão.
- **Semente Central (Data Seed):** Localizada no ponto de convergência focal, simboliza a semente, o dado germinativo e o núcleo biológico que impulsiona o agronegócio sustentável.
- **Geometria Pura:** Construído rigorosamente com arcos tangentes, ângulos ortogonais e espessuras consistentes, permitindo corte industrial e renderização perfeita em telas de qualquer resolução.

---

## 2. Paleta Cromática Oficial

A paleta de cores reflete precisão cirúrgica, alta tecnologia e contraste otimizado para longas jornadas de monitoramento agrícola em telas dark mode:

| Cor | HEX | RGB | CMYK | Pantone | Uso Principal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Seed Emerald** | `#10B981` | `16, 185, 129` | `75, 0, 65, 0` | 7724 C | Símbolo oficial, CTAs primários, status ótimo |
| **Obsidian Dark** | `#09090B` | `9, 9, 11` | `70, 65, 60, 85` | Black 6 C | Fundo principal da UI (Dark Canvas) |
| **Mint Bright** | `#34D399` | `52, 211, 153` | `60, 0, 50, 0` | 2268 C | Destaques de telemetria, satélite ativo |
| **Precision Slate** | `#27272A` | `39, 39, 42` | `65, 55, 50, 60` | 446 C | Divisores, bordas de cards, grids de mapas |
| **Pure White** | `#FFFFFF` | `255, 255, 255` | `0, 0, 0, 0` | — | Wordmark `SEED` em tema escuro, tipografia H1 |
| **Muted Zinc** | `#A1A1AA` | `161, 161, 170` | `40, 30, 25, 0` | 422 C | Subtítulo `AGRO INTELLIGENCE`, rótulos secundários |

---

## 3. Arquivos e Estrutura do Kit

O kit está organizado na pasta `brand/seed-logo-kit/`:

```
brand/seed-logo-kit/
├── vectors/                           # Masters vetoriais em SVG puro
│   ├── seed-symbol-color.svg          # Símbolo Emerald oficial (100/100)
│   ├── seed-symbol-small.svg          # Corte óptico reforçado para 16px/Favicon (100/100)
│   ├── seed-symbol-white.svg          # Símbolo em branco puro para fundos pretos
│   ├── seed-symbol-black.svg          # Símbolo em preto puro para impressão P&B
│   ├── seed-horizontal-dark.svg       # Lockup completo para Dark Mode
│   ├── seed-horizontal-light.svg      # Lockup completo para Fundo Claro
│   ├── seed-horizontal-white.svg      # Lockup monocromático branco
│   ├── seed-horizontal-black.svg      # Lockup monocromático preto
│   ├── seed-stacked-dark.svg          # Lockup empilhado (Dark Mode)
│   └── seed-stacked-light.svg         # Lockup empilhado (Fundo Claro)
│
├── exports/
│   ├── symbol/                        # Renders do símbolo e Web Icon Suite completa
│   │   ├── favicon.ico                # Ícone multi-resolução (16, 32, 48px)
│   │   ├── favicon.svg                # Favicon vetorial para navegadores modernos
│   │   ├── apple-touch-icon.png       # 180×180px para iOS Safari
│   │   ├── icon-192.png / icon-512.png# Ícones para PWA Android / Chrome
│   │   ├── maskable-512.png           # Ícone adaptativo maskable
│   │   ├── site.webmanifest           # Manifesto PWA configurado
│   │   ├── head-snippet.html          # Trecho HTML para incluir no <head> da aplicação
│   │   └── seed-symbol-color-[256, 512, 1024].png
│   │
│   ├── lockup/                        # Renders do Lockup Horizontal
│   │   ├── seed-horizontal-dark-[640, 1280].png
│   │   ├── seed-horizontal-light-[640, 1280].png
│   │   └── seed-horizontal-mono-10b981-[320, 640, 1280].png
│   │
│   └── stacked/                       # Renders do Lockup Empilhado
│       ├── seed-stacked-dark-[400, 800].png
│       └── seed-stacked-light-[400, 800].png
│
├── slides/                            # Slides executivos da apresentação de marca
│   ├── slide-01.png                   # Capa executiva
│   ├── slide-02.png                   # Racional do Briefing e Critérios
│   ├── slide-03.png                   # Detalhamento do Símbolo & Escalas
│   ├── slide-04.png                   # Mockups de Aplicação (Web, App, Cartão, Crachá, etc.)
│   └── slide-05.png                   # Comparativo e Próximos Passos
└── presentation.html                  # Deck interativo completo em HTML
```

---

## 4. Área de Proteção e Escala Mínima

### Área de Proteção (Clear Space)
- A área de respiro ao redor do símbolo e dos lockups corresponde à largura $X$ da semente central.
- Nenhum texto, botão ou elemento gráfico deve invadir essa margem mínima de segurança.

### Tamanhos Mínimos de Aplicação
- **Favicon & Ícones de Telemetria:** `16px × 16px` (obrigatório o uso de `seed-symbol-small.svg`, cujos canais foram alargados em 25% para evitar colapso de sub-pixels).
- **Símbolo Padrão em UI:** Mínimo `24px × 24px`.
- **Lockup Horizontal:** Mínimo `140px` de largura (para manter legível o subtítulo `AGRO INTELLIGENCE`).
- **Lockup Empilhado:** Mínimo `110px` de largura.

---

## 5. Regras de Não-Uso (Misuse)

1. **Nunca distorcer proporções:** O símbolo possui proporção geométrica estrita `1:1`.
2. **Nunca alterar cores individuais dos quadrantes:** Os 4 quadrantes e a semente devem sempre possuir o mesmo tom de preenchimento (`#10B981`, `#FFFFFF` ou `#000000`).
3. **Não aplicar degradês difusos ou sombras caídas:** A marca é estritamente vetorial e flat tech.
4. **Não rotacionar os eixos:** Os 4 canais de separação devem permanecer estritamente orientados nos eixos horizontal e vertical (0°, 90°, 180°, 270°), refletindo os eixos de radar e coordenadas GIS.
5. **Não usar fontes substitutas não autorizadas:** Os letterforms foram convertidos em caminhos vetoriais permanentes e não dependem da instalação de fontes no sistema.
