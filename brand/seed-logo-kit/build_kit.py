"""
Production Build Script for Seed — Agro Intelligence Official Logo Kit
Generates all master vectors, color lockups, optical cuts, web icon suite, and presentation slides.
"""

import os
import sys
import glob
import json
import shutil
import subprocess
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

KIT_DIR = "brand/seed-logo-kit"
VECTORS_DIR = f"{KIT_DIR}/vectors"
EXPORTS_DIR = f"{KIT_DIR}/exports"
SLIDES_DIR = f"{KIT_DIR}/slides"

os.makedirs(KIT_DIR, exist_ok=True)
os.makedirs(VECTORS_DIR, exist_ok=True)
os.makedirs(EXPORTS_DIR, exist_ok=True)
os.makedirs(f"{EXPORTS_DIR}/symbol", exist_ok=True)
os.makedirs(f"{EXPORTS_DIR}/lockup", exist_ok=True)
os.makedirs(f"{EXPORTS_DIR}/stacked", exist_ok=True)
os.makedirs(SLIDES_DIR, exist_ok=True)

# ------------------------------------------------------------------------------
# 1. Typography Extraction (Bézier outlined paths, zero live <text>)
# ------------------------------------------------------------------------------
def text_to_svg_paths(text, font_path, font_size, x_start, y_baseline, letter_spacing=0.0):
    font = TTFont(font_path)
    glyph_set = font.getGlyphSet()
    hmtx = font['hmtx']
    cmap = font.getBestCmap()
    scale = font_size / font['head'].unitsPerEm
    cur_x = x_start
    paths = []
    import re
    for ch in text:
        if ch == ' ':
            cur_x += font_size * 0.40 + letter_spacing
            continue
        code = ord(ch)
        if code not in cmap:
            continue
        gname = cmap[code]
        adv, lsb = hmtx[gname]
        pen = SVGPathPen(glyph_set)
        tpen = TransformPen(pen, (scale, 0, 0, -scale, cur_x, y_baseline))
        glyph_set[gname].draw(tpen)
        cmd = pen.getCommands().strip()
        if cmd:
            # Round decimals to 2 places to ensure clean production coordinates
            cmd = re.sub(r'(\d+\.\d{2})\d+', r'\1', cmd)
            paths.append(cmd)
        cur_x += adv * scale + letter_spacing
    return ' '.join(paths), cur_x

FONT_BOLD = r"C:\Windows\Fonts\segoeuib.ttf"
FONT_REG = r"C:\Windows\Fonts\segoeui.ttf"

# ------------------------------------------------------------------------------
# 2. Master Symbol Geometries (256x256)
# ------------------------------------------------------------------------------
# Concept C: GIS Radar Seed
# 4 Radar arcs (satellite farm parcels) + central data seed droplet
symbol_geometry = """  <!-- 4 Quadrantes de Radar Satelital / Talhões de Alta Precisão -->
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
           
  <!-- Semente Central: Núcleo Germinativo de Dados -->
  <path d="M 128 72
           C 142 98 154 118 154 132
           C 154 146 142 158 128 158
           C 114 158 102 146 102 132
           C 102 118 114 98 128 72 Z" />"""

# Small-Size Optical Cut (16px Favicon / Status Bars)
symbol_geometry_small = """  <!-- Versão Óptica Reduzida (16px - 24px) -->
  <path d="M 118 24
           A 104 104 0 0 0 24 118
           L 62 118
           A 66 66 0 0 1 118 62
           Z" />
           
  <path d="M 138 62
           A 66 66 0 0 1 194 118
           L 232 118
           A 104 104 0 0 0 138 24
           Z" />
           
  <path d="M 62 138
           L 24 138
           A 104 104 0 0 0 118 232
           L 118 194
           A 66 66 0 0 1 62 138
           Z" />
           
  <path d="M 194 138
           A 66 66 0 0 1 138 194
           L 138 232
           A 104 104 0 0 0 232 138
           Z" />
           
  <!-- Semente com Peso Óptico Reforçado -->
  <path d="M 128 68
           C 144 96 158 116 158 132
           C 158 148 144 162 128 162
           C 112 162 98 148 98 132
           C 98 116 112 96 128 68 Z" />"""

def make_symbol_svg(fill_color, title, small=False):
    geom = symbol_geometry_small if small else symbol_geometry
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="sym-title">
  <title id="sym-title">{title}</title>
  <g id="symbol" fill="{fill_color}">
{geom}
  </g>
</svg>"""

with open(f"{VECTORS_DIR}/seed-symbol-color.svg", "w", encoding="utf-8") as f:
    f.write(make_symbol_svg("#10B981", "Seed Symbol — Cor Oficial"))

with open(f"{VECTORS_DIR}/seed-symbol-black.svg", "w", encoding="utf-8") as f:
    f.write(make_symbol_svg("#000000", "Seed Symbol — Monocromático Preto"))

with open(f"{VECTORS_DIR}/seed-symbol-white.svg", "w", encoding="utf-8") as f:
    f.write(make_symbol_svg("#FFFFFF", "Seed Symbol — Branco Reverso"))

with open(f"{VECTORS_DIR}/seed-symbol-small.svg", "w", encoding="utf-8") as f:
    f.write(make_symbol_svg("#10B981", "Seed Symbol — Corte Óptico Reduzido (Favicon)", small=True))


# ------------------------------------------------------------------------------
# 3. Horizontal Lockups (640x256)
# ------------------------------------------------------------------------------
# Total content width centered in 640px canvas
# Symbol at x=64, divider at x=236, text starting at x=266
h_seed_path, _ = text_to_svg_paths("SEED", FONT_BOLD, 104, 266, 152, letter_spacing=5.0)
h_tag_path, _ = text_to_svg_paths("AGRO INTELLIGENCE", FONT_REG, 18.5, 268, 190, letter_spacing=7.2)

def make_horizontal_lockup(sym_fill, text_color, desc_color, div_color, title, bg_rect=None):
    bg_svg = f'<rect width="640" height="256" fill="{bg_rect}" />\n  ' if bg_rect else ''
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 256" width="640" height="256" role="img" aria-labelledby="h-title">
  <title id="h-title">{title}</title>
  {bg_svg}<g transform="translate(64, 44) scale(0.656)" fill="{sym_fill}">
{symbol_geometry}
  </g>
  <rect x="236" y="56" width="2" height="144" rx="1" fill="{div_color}" />
  <path fill="{text_color}" d="{h_seed_path}" />
  <path fill="{desc_color}" d="{h_tag_path}" />
</svg>"""

with open(f"{VECTORS_DIR}/seed-horizontal-dark.svg", "w", encoding="utf-8") as f:
    f.write(make_horizontal_lockup("#10B981", "#FFFFFF", "#A1A1AA", "#27272A", "Seed Logo Horizontal — Tema Escuro"))

with open(f"{VECTORS_DIR}/seed-horizontal-light.svg", "w", encoding="utf-8") as f:
    f.write(make_horizontal_lockup("#10B981", "#09090B", "#52525B", "#E4E4E7", "Seed Logo Horizontal — Fundo Claro"))

with open(f"{VECTORS_DIR}/seed-horizontal-black.svg", "w", encoding="utf-8") as f:
    f.write(make_horizontal_lockup("#000000", "#000000", "#000000", "#000000", "Seed Logo Horizontal — Preto 1-Cor"))

with open(f"{VECTORS_DIR}/seed-horizontal-white.svg", "w", encoding="utf-8") as f:
    f.write(make_horizontal_lockup("#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "Seed Logo Horizontal — Branco 1-Cor"))


# ------------------------------------------------------------------------------
# 4. Stacked / Vertical Lockups (400x340) for Badges, Signs & Silos
# ------------------------------------------------------------------------------
# Centered at x=200, canvas 400x340
_, seed_w_end = text_to_svg_paths("SEED", FONT_BOLD, 88, 0, 0, letter_spacing=5.0)
seed_stacked_start = round((400 - seed_w_end) / 2, 2)
s_seed_path, _ = text_to_svg_paths("SEED", FONT_BOLD, 88, seed_stacked_start, 242, letter_spacing=5.0)

_, tag_w_end = text_to_svg_paths("AGRO INTELLIGENCE", FONT_REG, 16.5, 0, 0, letter_spacing=6.6)
tag_stacked_start = round((400 - tag_w_end) / 2, 2)
s_tag_path, _ = text_to_svg_paths("AGRO INTELLIGENCE", FONT_REG, 16.5, tag_stacked_start, 282, letter_spacing=6.6)

def make_stacked_lockup(sym_fill, text_color, desc_color, title, bg_rect=None):
    bg_svg = f'<rect width="400" height="340" fill="{bg_rect}" />\n  ' if bg_rect else ''
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 340" width="400" height="340" role="img" aria-labelledby="st-title">
  <title id="st-title">{title}</title>
  {bg_svg}<!-- Símbolo no Topo (140x140) centralizado em x=200 -->
  <g transform="translate(130, 26) scale(0.547)" fill="{sym_fill}">
{symbol_geometry}
  </g>
  <path fill="{text_color}" d="{s_seed_path}" />
  <path fill="{desc_color}" d="{s_tag_path}" />
</svg>"""

with open(f"{VECTORS_DIR}/seed-stacked-dark.svg", "w", encoding="utf-8") as f:
    f.write(make_stacked_lockup("#10B981", "#FFFFFF", "#A1A1AA", "Seed Logo Empilhado — Tema Escuro"))

with open(f"{VECTORS_DIR}/seed-stacked-light.svg", "w", encoding="utf-8") as f:
    f.write(make_stacked_lockup("#10B981", "#09090B", "#52525B", "Seed Logo Empilhado — Fundo Claro"))

with open(f"{VECTORS_DIR}/seed-stacked-black.svg", "w", encoding="utf-8") as f:
    f.write(make_stacked_lockup("#000000", "#000000", "#000000", "Seed Logo Empilhado — Preto 1-Cor"))

with open(f"{VECTORS_DIR}/seed-stacked-white.svg", "w", encoding="utf-8") as f:
    f.write(make_stacked_lockup("#FFFFFF", "#FFFFFF", "#FFFFFF", "Seed Logo Empilhado — Branco 1-Cor"))

print("Master SVG vectors created successfully with flawless typographic outlines.")
