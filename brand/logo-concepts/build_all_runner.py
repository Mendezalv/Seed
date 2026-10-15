"""
Generate Horizontal Lockups for Concepts A, B, and C.
Contains the symbol on the left and the vector wordmark 'SEED' + 'AGRO INTELLIGENCE' on the right.
Pure vector paths, no live <text> tags.
"""

# Let's craft the vector paths for "S E E D":
# Canvas height 256. Cap-height: 84 to 156 (height 72).
# Let's define the letter paths precisely:

def get_wordmark_paths(start_x=280, start_y=84, h=72, stem=13):
    # h = 72, stem = 13
    # S: x from start_x to start_x + 52
    # E: x from start_x + 68 to start_x + 116
    # E: x from start_x + 132 to start_x + 180
    # D: x from start_x + 196 to start_x + 252
    
    # Precise S:
    x0 = start_x
    y0 = start_y
    y1 = y0 + h
    ym = y0 + h / 2
    
    # Path for S:
    s_path = f"""M {x0+48} {y0+18}
                 C {x0+44} {y0+6} {x0+32} {y0} {x0+25} {y0}
                 C {x0+11} {y0} {x0} {y0+10} {x0} {y0+22}
                 C {x0} {y0+36} {x0+12} {y0+42} {x0+28} {y0+46}
                 L {x0+34} {y0+48}
                 C {x0+45} {y0+51} {x0+52} {y0+56} {x0+52} {y0+65}
                 C {x0+52} {y0+77} {x0+39} {y0+85} {x0+24} {y0+85}
                 C {x0+11} {y0+85} {x0} {y0+78} {x0-4} {y0+64}
                 L {x0+9} {y0+60}
                 C {x0+12} {y0+70} {x0+19} {y0+74} {x0+25} {y0+74}
                 C {x0+32} {y0+74} {x0+39} {y0+69} {x0+39} {y0+64}
                 C {x0+39} {y0+54} {x0+29} {y0+50} {x0+15} {y0+46}
                 L {x0+10} {y0+44}
                 C {x0} {y0+41} {x0-9} {y0+34} {x0-9} {y0+22}
                 C {x0-9} {y0+9} {x0+5} {y0} {x0+24} {y0}
                 C {x0+38} {y0} {x0+48} {y0+8} {x0+50} {y0+20}
                 Z"""
                 
    # Let's use clean geometric primitives for S, E, E, D to make them razor-sharp!
    pass

# Let's write the complete generator for symbols and lockups:
with open("brand/logo-concepts/build_all.py", "w", encoding="utf-8") as f:
    f.write('''import os

# Symbol definitions:
concept_a_symbol = """<g id="symbol" fill="currentColor">
  <!-- Folha Superior do S -->
  <path d="M 212 44
           C 170 16 112 18 72 48
           C 38 74 34 116 52 152
           L 88 132
           C 76 106 80 82 102 66
           C 130 46 170 46 200 66
           L 212 44 Z" />
           
  <!-- Folha Inferior do S (Simetria 180°) -->
  <path d="M 44 212
           C 86 240 144 238 184 208
           C 218 182 222 140 204 104
           L 168 124
           C 180 150 176 174 154 190
           C 126 210 86 210 56 190
           L 44 212 Z" />
           
  <!-- Espinha Central: Vetor de Crescimento 45° -->
  <path d="M 72 154
           L 154 72
           C 164 62 178 66 184 78
           C 190 90 186 104 176 114
           L 94 196
           C 84 206 70 202 64 190
           C 58 178 62 164 72 154 Z" />
</g>"""

concept_b_symbol = """<g id="symbol" fill="currentColor">
  <!-- Metade Esquerda: Casca Botânica Viva -->
  <path d="M 122 28
           C 108 52 48 116 48 162
           C 48 198 76 226 122 230
           L 122 188
           C 96 184 80 166 80 148
           C 80 120 110 76 122 54
           L 122 28 Z" />
           
  <!-- Núcleo Germinativo Esquerdo -->
  <path d="M 122 84
           C 114 100 96 130 96 150
           C 96 164 106 174 122 176
           L 122 84 Z" />

  <!-- Metade Direita: 3 Faixas de Telemetria e Precisão -->
  <path d="M 134 42
           L 182 94
           C 174 100 162 104 148 104
           L 134 104
           L 134 42 Z" />
           
  <path d="M 134 118
           L 198 118
           C 206 132 208 146 208 160
           L 134 160
           L 134 118 Z" />
           
  <path d="M 134 174
           L 204 174
           C 196 204 168 226 134 230
           L 134 174 Z" />
</g>"""

concept_c_symbol = """<g id="symbol" fill="currentColor">
  <!-- Disco Exterior com 4 Setores de Satélite / Talhões de Alta Precisão -->
  <path d="M 120 28
           A 100 100 0 0 0 28 120
           L 60 120
           A 68 68 0 0 1 120 60
           Z" />
           
  <path d="M 136 60
           A 68 68 0 0 1 196 120
           L 228 120
           A 100 100 0 0 0 136 28
           Z" />
           
  <path d="M 60 136
           L 28 136
           A 100 100 0 0 0 120 228
           L 120 196
           A 68 68 0 0 1 60 136
           Z" />
           
  <path d="M 196 136
           A 68 68 0 0 1 136 196
           L 136 228
           A 100 100 0 0 0 228 136
           Z" />
           
  <!-- Semente Central: Núcleo Germinativo -->
  <path d="M 128 72
           C 142 98 154 118 154 132
           C 154 146 142 158 128 158
           C 114 158 102 146 102 132
           C 102 118 114 98 128 72 Z" />
</g>"""

# Vector wordmark paths for SEED:
# Letters S, E, E, D crafted as pure vector paths
wordmark_svg = """<g id="wordmark" fill="currentColor">
  <!-- Letter S -->
  <path d="M 334 104
           C 328 92 316 86 302 86
           C 284 86 270 98 270 114
           C 270 130 282 138 300 144
           L 308 146
           C 322 150 330 156 330 166
           C 330 178 316 186 300 186
           C 282 186 270 176 264 162
           L 278 156
           C 282 166 290 172 300 172
           C 308 172 316 166 316 156
           C 316 142 302 136 286 130
           L 278 128
           C 264 122 256 112 256 98
           C 256 84 270 72 290 72
           C 308 72 322 80 328 96
           Z" />

  <!-- Letter E (1) -->
  <path d="M 352 74
           L 404 74
           L 404 88
           L 368 88
           L 368 122
           L 398 122
           L 398 136
           L 368 136
           L 368 172
           L 406 172
           L 406 186
           L 352 186
           Z" />

  <!-- Letter E (2) -->
  <path d="M 424 74
           L 476 74
           L 476 88
           L 440 88
           L 440 122
           L 470 122
           L 470 136
           L 440 136
           L 440 172
           L 478 172
           L 478 186
           L 424 186
           Z" />

  <!-- Letter D -->
  <path d="M 496 74
           L 532 74
           C 556 74 572 90 572 130
           C 572 170 556 186 532 186
           L 496 186
           Z
           M 512 88
           L 512 172
           L 530 172
           C 546 172 556 160 556 130
           C 556 100 546 88 530 88
           Z" />

  <!-- Tagline: AGRO INTELLIGENCE in clean vector tracking -->
  <!-- A G R O -->
  <path d="M 258 214 L 264 214 L 270 230 L 265 230 L 264 227 L 258 227 L 257 230 L 252 230 Z M 259 223 L 263 223 L 261 217 Z" />
  <path d="M 284 219 C 282 215 278 214 274 214 C 269 214 265 218 265 222 C 265 227 269 230 274 230 C 278 230 282 228 284 225 L 284 222 L 275 222 L 275 219 L 288 219 L 288 227 C 285 230 280 231 274 231 C 267 231 261 227 261 222 C 261 217 267 213 274 213 C 280 213 285 215 287 218 Z" />
  <path d="M 292 214 L 300 214 C 304 214 306 216 306 219 C 306 222 304 224 301 224 L 306 230 L 301 230 L 297 225 L 296 225 L 296 230 L 292 230 Z M 296 221 L 299 221 C 302 221 303 220 303 219 C 303 217 302 217 299 217 L 296 217 Z" />
  <path d="M 315 213 C 320 213 325 217 325 222 C 325 227 320 231 315 231 C 309 231 304 227 304 222 C 304 217 309 213 315 213 Z M 315 216 C 311 216 308 219 308 222 C 308 225 311 228 315 228 C 318 228 321 225 321 222 C 321 219 318 216 315 216 Z" />

  <!-- Separator Dot -->
  <circle cx="337" cy="222" r="2.2" />

  <!-- I N T E L L I G E N C E -->
  <path d="M 348 214 L 352 214 L 352 230 L 348 230 Z" />
  <path d="M 358 214 L 362 214 L 368 224 L 368 214 L 372 214 L 372 230 L 368 230 L 362 220 L 362 230 L 358 230 Z" />
  <path d="M 378 214 L 388 214 L 388 217 L 385 217 L 385 230 L 381 230 L 381 217 L 378 217 Z" />
  <path d="M 393 214 L 402 214 L 402 217 L 397 217 L 397 220 L 401 220 L 401 223 L 397 223 L 397 227 L 402 227 L 402 230 L 393 230 Z" />
  <path d="M 407 214 L 411 214 L 411 227 L 417 227 L 417 230 L 407 230 Z" />
  <path d="M 422 214 L 426 214 L 426 227 L 432 227 L 432 230 L 422 230 Z" />
  <path d="M 437 214 L 441 214 L 441 230 L 437 230 Z" />
  <path d="M 453 218 C 451 215 448 214 445 214 C 440 214 437 218 437 222 C 437 227 440 230 445 230 C 448 230 451 228 453 226 L 453 223 L 446 223 L 446 220 L 456 220 L 456 227 C 453 230 449 231 445 231 C 438 231 433 227 433 222 C 433 217 438 213 445 213 C 449 213 453 215 455 218 Z" />
  <path d="M 461 214 L 470 214 L 470 217 L 465 217 L 465 220 L 469 220 L 469 223 L 465 223 L 465 227 L 470 227 L 470 230 L 461 230 Z" />
  <path d="M 475 214 L 479 214 L 485 224 L 485 214 L 489 214 L 489 230 L 485 230 L 479 220 L 479 230 L 475 230 Z" />
  <path d="M 498 215 C 496 214 494 213 492 213 C 487 213 483 217 483 222 C 483 227 487 231 492 231 C 494 231 497 230 499 228 L 500 230 C 498 231 495 232 492 232 C 485 232 480 227 480 222 C 480 217 485 212 492 212 C 495 212 498 213 500 215 Z" />
  <path d="M 505 214 L 514 214 L 514 217 L 509 217 L 509 220 L 513 220 L 513 223 L 509 223 L 509 227 L 514 227 L 514 230 L 505 230 Z" />
</g>"""

# Assemble Symbols (256x256)
symbols = {
    "concept-a-symbol.svg": f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="t-a"><title id="t-a">Seed Logo — Conceito A: Bio-Vector S</title>{concept_a_symbol}</svg>',
    "concept-b-symbol.svg": f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="t-b"><title id="t-b">Seed Logo — Conceito B: The Hybrid Grain</title>{concept_b_symbol}</svg>',
    "concept-c-symbol.svg": f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="t-c"><title id="t-c">Seed Logo — Conceito C: GIS Radar Seed</title>{concept_c_symbol}</svg>',
}

for name, content in symbols.items():
    with open(f"brand/logo-concepts/{name}", "w", encoding="utf-8") as f:
        f.write(content)

# Assemble Horizontal Lockups (640x256)
# Scaled symbol at (x=40, y=48, size=160x160)
def make_lockup(symbol_g, title, filename):
    lockup = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 256" width="620" height="256" role="img" aria-labelledby="title-lk">
  <title id="title-lk">{title}</title>
  <!-- Scaled Symbol on Left -->
  <g transform="translate(36, 44) scale(0.656)">
    {symbol_g}
  </g>
  
  <!-- Divider -->
  <line x1="228" y1="64" x2="228" y2="192" stroke="currentColor" stroke-width="1.5" opacity="0.15" />
  
  <!-- Wordmark & Subtitle -->
  {wordmark_svg}
</svg>'''
    with open(f"brand/logo-concepts/{filename}", "w", encoding="utf-8") as f:
        f.write(lockup)

make_lockup(concept_a_symbol, "Seed Lockup A", "concept-a-lockup.svg")
make_lockup(concept_b_symbol, "Seed Lockup B", "concept-b-lockup.svg")
make_lockup(concept_c_symbol, "Seed Lockup C", "concept-c-lockup.svg")

print("Generated all symbols and lockups.")
''')

print("Created build_all.py")
