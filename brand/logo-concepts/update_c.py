"""
Update Concept C to: "The GIS Radar Seed"
An architectural circular GIS radar dial with an ascending seedling in the central core.
"""

concept_c_radar = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-c">
  <title id="title-c">Seed Logo — Conceito C: GIS Radar Seed</title>
  <g id="symbol" fill="#000000" fill-rule="evenodd">
    <!-- Disco Exterior com 4 Setores de Satélite / Talhões de Alta Precisão -->
    <!-- Setor Noroeste -->
    <path d="M 120 28
             A 100 100 0 0 0 28 120
             L 60 120
             A 68 68 0 0 1 120 60
             Z" />
             
    <!-- Setor Nordeste -->
    <path d="M 136 60
             A 68 68 0 0 1 196 120
             L 228 120
             A 100 100 0 0 0 136 28
             Z" />
             
    <!-- Setor Sudoeste -->
    <path d="M 60 136
             L 28 136
             A 100 100 0 0 0 120 228
             L 120 196
             A 68 68 0 0 1 60 136
             Z" />
             
    <!-- Setor Sudeste -->
    <path d="M 196 136
             A 68 68 0 0 1 136 196
             L 136 228
             A 100 100 0 0 0 228 136
             Z" />
             
    <!-- Semente Central: Núcleo Germinativo de Dados -->
    <path d="M 128 72
             C 142 98 154 118 154 132
             C 154 146 142 158 128 158
             C 114 158 102 146 102 132
             C 102 118 114 98 128 72 Z" />
             
    <!-- Broto Ascendente em Vetor 45° -->
    <path d="M 128 132
             L 146 114
             C 150 118 150 126 144 132
             Z" />
  </g>
</svg>"""

with open("brand/logo-concepts/concept-c-symbol.svg", "w", encoding="utf-8") as f:
    f.write(concept_c_radar)

print("Updated Concept C.")
