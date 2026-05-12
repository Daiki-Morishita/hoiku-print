#!/usr/bin/env python3
"""Generate SVG hero images for columns 13-36."""
import os

OUTPUT_DIR = '/Users/daikimorishita/dev/hoiku-print/public/columns'

COLUMNS = [
    (13, 'outdoor-play-benefits', '#4ade80', '#22c55e', '#bbf7d0', '遊び・アイデア'),
    (14, 'numbers-math-preschool', '#60a5fa', '#3b82f6', '#bfdbfe', '教育・学習'),
    (15, 'free-drawing-creative-expression', '#f472b6', '#ec4899', '#fce7f3', '発達・知育'),
    (16, 'concentration-tips-for-toddlers', '#a78bfa', '#8b5cf6', '#ede9fe', '発達・知育'),
    (17, 'supporting-kids-who-dislike-crafts', '#fb923c', '#f97316', '#ffedd5', '遊び・アイデア'),
    (18, 'when-to-start-hiragana-learning', '#34d399', '#10b981', '#d1fae5', '教育・学習'),
    (19, 'best-coloring-pages-for-4-year-olds', '#f87171', '#ef4444', '#fee2e2', '発達・知育'),
    (20, 'making-printouts-a-daily-habit', '#38bdf8', '#0ea5e9', '#e0f2fe', '教育・学習'),
    (21, 'dot-connect-benefits-for-kids', '#818cf8', '#6366f1', '#e0e7ff', '教育・学習'),
    (22, 'coloring-for-2-year-olds', '#fb7185', '#f43f5e', '#ffe4e6', '発達・知育'),
    (23, 'learning-colors-for-toddlers', '#fbbf24', '#f59e0b', '#fef3c7', '教育・学習'),
    (24, 'number-writing-practice-guide', '#2dd4bf', '#14b8a6', '#ccfbf1', '運筆・書き方'),
    (25, 'sensory-play-benefits', '#4ade80', '#16a34a', '#dcfce7', '遊び・アイデア'),
    (26, 'seasonal-coloring-themes', '#f472b6', '#db2777', '#fdf2f8', '季節・行事'),
    (27, 'drawing-development-stages', '#a78bfa', '#7c3aed', '#f5f3ff', '発達・知育'),
    (28, 'animal-themes-learning-benefits', '#fb923c', '#ea580c', '#fff7ed', '教育・学習'),
    (29, 'school-readiness-printouts', '#60a5fa', '#2563eb', '#eff6ff', '教育・学習'),
    (30, 'group-craft-activities-nursery', '#34d399', '#059669', '#ecfdf5', '遊び・アイデア'),
    (31, 'dinosaur-learning-for-kids', '#4ade80', '#15803d', '#f0fdf4', '教育・学習'),
    (32, 'summer-crafts-coloring', '#fbbf24', '#d97706', '#fffbeb', '季節・行事'),
    (33, 'fine-motor-skills-activities', '#f87171', '#dc2626', '#fef2f2', '発達・知育'),
    (34, 'vehicle-coloring-benefits', '#38bdf8', '#0284c7', '#f0f9ff', '教育・学習'),
    (35, 'screen-time-and-printouts', '#818cf8', '#4338ca', '#eef2ff', '教育・学習'),
    (36, 'playground-equipment-development', '#fb923c', '#c2410c', '#fff7ed', '発達・知育'),
]

PATTERNS = [
    # circles
    '<circle cx="80" cy="80" r="60" fill="{light}" opacity="0.5"/>'
    '<circle cx="640" cy="200" r="100" fill="{mid}" opacity="0.3"/>'
    '<circle cx="400" cy="280" r="80" fill="{light}" opacity="0.4"/>'
    '<circle cx="760" cy="60" r="40" fill="{mid}" opacity="0.25"/>',
    # dots grid
    ''.join(
        f'<circle cx="{x}" cy="{y}" r="6" fill="{{}}" opacity="0.2"/>'
        for x in range(60, 801, 80)
        for y in range(40, 241, 60)
    ).replace('{}', '{light}'),
    # waves
    '<path d="M0,120 Q160,60 320,120 Q480,180 640,120 Q720,90 800,120 L800,240 L0,240Z" fill="{light}" opacity="0.4"/>'
    '<path d="M0,150 Q200,90 400,150 Q600,210 800,150 L800,240 L0,240Z" fill="{mid}" opacity="0.25"/>',
]

def make_svg(col_num, color1, color2, light, pattern_idx):
    pattern = PATTERNS[pattern_idx % len(PATTERNS)]
    shapes = pattern.replace('{light}', light).replace('{mid}', color1)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="240" viewBox="0 0 800 240">
  <defs>
    <linearGradient id="bg{col_num}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{light}"/>
      <stop offset="100%" stop-color="{color1}" stop-opacity="0.3"/>
    </linearGradient>
  </defs>
  <rect width="800" height="240" fill="url(#bg{col_num})"/>
  {shapes}
  <!-- decorative circle accent -->
  <circle cx="720" cy="220" r="120" fill="{color1}" opacity="0.12"/>
  <circle cx="100" cy="30" r="80" fill="{color2}" opacity="0.08"/>
</svg>'''

os.makedirs(OUTPUT_DIR, exist_ok=True)

for i, (num, slug, color1, color2, light, category) in enumerate(COLUMNS):
    svg = make_svg(num, color1, color2, light, i % len(PATTERNS))
    path = os.path.join(OUTPUT_DIR, f'col{num}-hero.svg')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(svg)
    print(f'Created col{num}-hero.svg  ({slug})')

print(f'\nDone: {len(COLUMNS)} SVG hero images created.')
