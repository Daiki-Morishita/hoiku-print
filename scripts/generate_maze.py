"""
迷路ジェネレーター — ぬりえプリント / 知育カテゴリ「めいろ」
- 形状: square / circle / triangle-up / triangle-down
- Recursive Backtracking でユニーク迷路を生成
- BFSで最短経路を解析、ターン数で難易度を厳密保証
- src/lib/maze/data.json に書き出し

使い方:
  python3 scripts/generate_maze.py --shape square --difficulty normal --count 10
  python3 scripts/generate_maze.py --shape all --difficulty all --count 5
"""
from __future__ import annotations
import argparse
import json
import random
import sys
from collections import deque
from pathlib import Path

SHAPES = ['square', 'circle', 'triangle-up', 'triangle-down']

SHAPE_LABELS = {
    'square': 'しかくのめいろ',
    'circle': 'まるのめいろ',
    'triangle-up': 'さんかくのめいろ',
    'triangle-down': 'さんかくのめいろ',
}

# 形状ごとのグリッドサイズ（difficulty別）
GRID_BY_SHAPE_DIFF = {
    'square': {
        'easy':   (6, 4),
        'normal': (8, 6),
        'hard':   (12, 8),
        'expert': (16, 11),
    },
    'circle': {
        # 円は正方形グリッド、半径=size/2
        'easy':   (7, 7),
        'normal': (9, 9),
        'hard':   (13, 13),
        'expert': (17, 17),
    },
    'triangle-up': {
        # 底辺横長、頂点上
        'easy':   (9, 5),
        'normal': (11, 7),
        'hard':   (15, 9),
        'expert': (19, 12),
    },
    'triangle-down': {
        'easy':   (9, 5),
        'normal': (11, 7),
        'hard':   (15, 9),
        'expert': (19, 12),
    },
}

DIFFICULTY = {
    'easy':   {'label': 'かんたん',         'age': '2・3さい', 'age_min': 2, 'age_max': 3, 'turns': (3, 7),   'path': (8, 20)},
    'normal': {'label': 'ふつう',           'age': '3・4さい', 'age_min': 3, 'age_max': 4, 'turns': (6, 12),  'path': (14, 32)},
    'hard':   {'label': 'むずかしい',       'age': '4・5さい', 'age_min': 4, 'age_max': 5, 'turns': (10, 20), 'path': (28, 65)},
    'expert': {'label': 'とてもむずかしい', 'age': '5・6さい', 'age_min': 5, 'age_max': 6, 'turns': (16, 35), 'path': (45, 120)},
}

DIRS = {'N': (0, -1), 'S': (0, 1), 'E': (1, 0), 'W': (-1, 0)}
OPP = {'N': 'S', 'S': 'N', 'E': 'W', 'W': 'E'}


# === 形マスク ===
def in_shape(x: int, y: int, cols: int, rows: int, shape: str) -> bool:
    if shape == 'square':
        return True
    cx = (cols - 1) / 2.0
    cy = (rows - 1) / 2.0
    if shape == 'circle':
        r = min(cols, rows) / 2.0
        # セル中心が円内か（少し余裕）
        return (x - cx) ** 2 + (y - cy) ** 2 <= (r - 0.01) ** 2
    if shape == 'triangle-up':
        # 頂点が上、底辺が下。y=0 で頂点（細い）、y=rows-1 で底辺（広い）
        if rows <= 1:
            return True
        ratio = (y + 0.5) / rows  # 0..1
        half_width = (cols / 2.0) * ratio
        return cx - half_width <= x <= cx + half_width
    if shape == 'triangle-down':
        # 頂点が下、底辺が上
        if rows <= 1:
            return True
        ratio = (rows - y - 0.5) / rows
        half_width = (cols / 2.0) * ratio
        return cx - half_width <= x <= cx + half_width
    return True


def make_valid_cells(cols: int, rows: int, shape: str) -> list[list[bool]]:
    return [[in_shape(x, y, cols, rows, shape) for y in range(rows)] for x in range(cols)]


# === スタート/ゴール選定 ===
def pick_start_goal(valid: list[list[bool]], cols: int, rows: int, shape: str) -> tuple[tuple[int, int], tuple[int, int], str, str]:
    """戻り値: (start_cell, goal_cell, start_opening, goal_opening)
    start_opening / goal_opening は 'W'|'E'|'N'|'S'（どの辺に開口部を開けるか）"""
    if shape == 'square':
        return (0, 0), (cols - 1, rows - 1), 'W', 'E'
    if shape == 'circle':
        # 左中央 → 右中央。中央行で最も左/右の有効セル
        cy = rows // 2
        sx = next((x for x in range(cols) if valid[x][cy]), 0)
        gx = next((x for x in range(cols - 1, -1, -1) if valid[x][cy]), cols - 1)
        return (sx, cy), (gx, cy), 'W', 'E'
    if shape == 'triangle-up':
        # 底辺の左端 → 右端
        by = rows - 1
        sx = next((x for x in range(cols) if valid[x][by]), 0)
        gx = next((x for x in range(cols - 1, -1, -1) if valid[x][by]), cols - 1)
        return (sx, by), (gx, by), 'S', 'S'
    if shape == 'triangle-down':
        # 上辺の左端 → 右端
        by = 0
        sx = next((x for x in range(cols) if valid[x][by]), 0)
        gx = next((x for x in range(cols - 1, -1, -1) if valid[x][by]), cols - 1)
        return (sx, by), (gx, by), 'N', 'N'
    return (0, 0), (cols - 1, rows - 1), 'W', 'E'


# === 迷路生成 ===
def generate_maze(cols: int, rows: int, shape: str, seed: int):
    rnd = random.Random(seed)
    walls = [[{'N', 'S', 'E', 'W'} for _ in range(rows)] for _ in range(cols)]
    visited = [[False] * rows for _ in range(cols)]
    valid = make_valid_cells(cols, rows, shape)
    sys.setrecursionlimit(cols * rows + 100)

    # 開始セルは最初の有効セルを使う
    start = next(((x, y) for x in range(cols) for y in range(rows) if valid[x][y]), (0, 0))

    def carve(x: int, y: int) -> None:
        visited[x][y] = True
        dirs = list(DIRS.items())
        rnd.shuffle(dirs)
        for d, (dx, dy) in dirs:
            nx, ny = x + dx, y + dy
            if 0 <= nx < cols and 0 <= ny < rows and valid[nx][ny] and not visited[nx][ny]:
                walls[x][y].discard(d)
                walls[nx][ny].discard(OPP[d])
                carve(nx, ny)

    carve(*start)
    return walls, valid


def open_boundary(walls, cell: tuple[int, int], side: str) -> None:
    walls[cell[0]][cell[1]].discard(side)


def bfs_solve(walls, valid, cols: int, rows: int, start: tuple[int, int], goal: tuple[int, int]):
    q = deque([start])
    came = {start: None}
    while q:
        x, y = q.popleft()
        if (x, y) == goal:
            break
        for d, (dx, dy) in DIRS.items():
            if d in walls[x][y]:
                continue
            nx, ny = x + dx, y + dy
            if 0 <= nx < cols and 0 <= ny < rows and valid[nx][ny] and (nx, ny) not in came:
                came[(nx, ny)] = (x, y)
                q.append((nx, ny))
    path = []
    cur = goal if goal in came else None
    while cur is not None:
        path.append(cur)
        cur = came[cur]
    path.reverse()
    return path


def count_turns(path) -> int:
    if len(path) < 3:
        return 0
    turns = 0
    for i in range(1, len(path) - 1):
        d1 = (path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1])
        d2 = (path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1])
        if d1 != d2:
            turns += 1
    return turns


def serialize(walls, valid, cols: int, rows: int):
    return {
        'walls': [[sorted(walls[x][y]) if valid[x][y] else [] for y in range(rows)] for x in range(cols)],
        'valid': [[bool(valid[x][y]) for y in range(rows)] for x in range(cols)],
    }


def find_maze(shape: str, diff_key: str, used_seeds: set[int], max_attempts: int = 5000):
    rule = DIFFICULTY[diff_key]
    cols, rows = GRID_BY_SHAPE_DIFF[shape][diff_key]
    tmin, tmax = rule['turns']
    pmin, pmax = rule['path']

    for seed in range(1, max_attempts + 1):
        if seed in used_seeds:
            continue
        walls, valid = generate_maze(cols, rows, shape, seed)
        start, goal, s_side, g_side = pick_start_goal(valid, cols, rows, shape)
        path = bfs_solve(walls, valid, cols, rows, start, goal)
        if len(path) < 2:
            continue
        turns = count_turns(path)
        if tmin <= turns <= tmax and pmin <= len(path) <= pmax:
            open_boundary(walls, start, s_side)
            open_boundary(walls, goal, g_side)
            return {
                'walls': walls, 'valid': valid,
                'path': path, 'turns': turns, 'seed': seed,
                'start': start, 'goal': goal,
                's_side': s_side, 'g_side': g_side,
                'cols': cols, 'rows': rows,
            }
    return None


def build_record(shape: str, diff_key: str, no: int, found: dict) -> dict:
    rule = DIFFICULTY[diff_key]
    ser = serialize(found['walls'], found['valid'], found['cols'], found['rows'])
    return {
        'slug': f'{shape}-{diff_key}-{no:03d}',
        'shape': shape,
        'shape_label': SHAPE_LABELS[shape],
        'difficulty': diff_key,
        'difficulty_label': rule['label'],
        'age_label': rule['age'],
        'age_min': rule['age_min'],
        'age_max': rule['age_max'],
        'no': no,
        'cols': found['cols'],
        'rows': found['rows'],
        'seed': found['seed'],
        'turns': found['turns'],
        'path_length': len(found['path']),
        'walls': ser['walls'],
        'valid': ser['valid'],
        'solution': [[x, y] for x, y in found['path']],
        'start_cell': list(found['start']),
        'goal_cell': list(found['goal']),
        'start_side': found['s_side'],
        'goal_side': found['g_side'],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--shape', choices=SHAPES + ['all'], default='all')
    parser.add_argument('--difficulty', choices=list(DIFFICULTY.keys()) + ['all'], default='all')
    parser.add_argument('--count', type=int, default=5)
    parser.add_argument('--out', type=str, default='src/lib/maze/data.json')
    args = parser.parse_args()

    out_path = Path(__file__).resolve().parent.parent / args.out
    out_path.parent.mkdir(parents=True, exist_ok=True)

    # 既存読込（shape ごと → difficulty ごと → list）
    existing: dict[str, dict[str, list[dict]]] = {}
    if out_path.exists():
        try:
            raw = json.loads(out_path.read_text())
            # 旧形式（difficulty直下）と新形式（shape -> difficulty）を判定
            if raw and isinstance(next(iter(raw.values())), list):
                # 旧形式：square 扱いで移行
                existing['square'] = raw
            else:
                existing = raw
        except Exception:
            existing = {}

    shapes = SHAPES if args.shape == 'all' else [args.shape]
    diffs = list(DIFFICULTY.keys()) if args.difficulty == 'all' else [args.difficulty]

    for sh in shapes:
        shape_bucket = existing.setdefault(sh, {})
        for dk in diffs:
            bucket = shape_bucket.setdefault(dk, [])
            used_seeds = {r['seed'] for r in bucket}
            start_no = max((r['no'] for r in bucket), default=0) + 1
            need = args.count - len(bucket)
            if need <= 0:
                print(f'[{sh}/{dk}] skip（既に{len(bucket)}件）')
                continue
            print(f'[{sh}/{dk}] 生成開始：目標{need}件 / 現{len(bucket)}件')
            for i in range(need):
                no = start_no + i
                found = find_maze(sh, dk, used_seeds)
                if not found:
                    print(f'  [WARN] {sh}/{dk} No.{no:03d} 条件未達')
                    break
                used_seeds.add(found['seed'])
                rec = build_record(sh, dk, no, found)
                bucket.append(rec)
                print(f'  ✓ {rec["slug"]} (turns={found["turns"]}, path={len(found["path"])}, seed={found["seed"]})')

    out_path.write_text(json.dumps(existing, ensure_ascii=False, indent=2))
    total = sum(len(d) for s in existing.values() for d in s.values())
    print(f'\n→ {out_path} に合計{total}件')


if __name__ == '__main__':
    main()
