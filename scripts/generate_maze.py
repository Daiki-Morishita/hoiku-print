"""
迷路ジェネレーター — ぬりえプリント / 知育カテゴリ「めいろ」
- Recursive Backtracking でユニーク迷路を生成
- BFSで最短経路を解析、ターン数で難易度を厳密保証
- src/lib/maze/data.json に書き出し（Next.jsから読み込み）

使い方:
  python3 scripts/generate_maze.py --difficulty normal --count 10
  python3 scripts/generate_maze.py --all              # 全難易度 各10枚生成
  python3 scripts/generate_maze.py --all --count 20   # 各難易度20枚
"""
from __future__ import annotations
import argparse
import json
import random
import sys
from collections import deque
from pathlib import Path

DIFFICULTY = {
    'easy':   {'label': 'かんたん',         'age': '2・3さい',  'age_min': 2, 'age_max': 3, 'cols': 6,  'rows': 4,  'turns': (3, 6),   'path': (10, 18)},
    'normal': {'label': 'ふつう',           'age': '3・4さい',  'age_min': 3, 'age_max': 4, 'cols': 8,  'rows': 6,  'turns': (6, 10),  'path': (16, 30)},
    'hard':   {'label': 'むずかしい',       'age': '4・5さい',  'age_min': 4, 'age_max': 5, 'cols': 12, 'rows': 8,  'turns': (10, 18), 'path': (30, 60)},
    'expert': {'label': 'とてもむずかしい', 'age': '5・6さい',  'age_min': 5, 'age_max': 6, 'cols': 16, 'rows': 11, 'turns': (16, 32), 'path': (50, 110)},
}

DIRS = {'N': (0, -1), 'S': (0, 1), 'E': (1, 0), 'W': (-1, 0)}
OPP = {'N': 'S', 'S': 'N', 'E': 'W', 'W': 'E'}


def generate_maze(cols: int, rows: int, seed: int):
    """Recursive Backtracking で迷路生成"""
    rnd = random.Random(seed)
    walls = [[{'N', 'S', 'E', 'W'} for _ in range(rows)] for _ in range(cols)]
    visited = [[False] * rows for _ in range(cols)]
    sys.setrecursionlimit(cols * rows + 100)

    def carve(x: int, y: int) -> None:
        visited[x][y] = True
        dirs = list(DIRS.items())
        rnd.shuffle(dirs)
        for d, (dx, dy) in dirs:
            nx, ny = x + dx, y + dy
            if 0 <= nx < cols and 0 <= ny < rows and not visited[nx][ny]:
                walls[x][y].discard(d)
                walls[nx][ny].discard(OPP[d])
                carve(nx, ny)

    carve(0, 0)
    # スタート開口（左上の左辺）・ゴール開口（右下の右辺）
    walls[0][0].discard('W')
    walls[cols - 1][rows - 1].discard('E')
    return walls


def bfs_solve(walls, cols: int, rows: int):
    """BFSで最短経路を求める"""
    start = (0, 0)
    goal = (cols - 1, rows - 1)
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
            if 0 <= nx < cols and 0 <= ny < rows and (nx, ny) not in came:
                came[(nx, ny)] = (x, y)
                q.append((nx, ny))
    path = []
    cur = goal
    while cur is not None:
        path.append(cur)
        cur = came[cur]
    path.reverse()
    return path


def count_turns(path) -> int:
    """最短経路上の曲がり回数"""
    if len(path) < 3:
        return 0
    turns = 0
    for i in range(1, len(path) - 1):
        d1 = (path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1])
        d2 = (path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1])
        if d1 != d2:
            turns += 1
    return turns


def serialize_walls(walls, cols: int, rows: int) -> list[list[list[str]]]:
    """JSON保存用にsetをsorted listへ"""
    return [[sorted(walls[x][y]) for y in range(rows)] for x in range(cols)]


def find_maze(diff_key: str, used_seeds: set[int], max_attempts: int = 5000):
    """指定難易度に合う迷路をseedを変えながら探す"""
    rule = DIFFICULTY[diff_key]
    cols, rows = rule['cols'], rule['rows']
    tmin, tmax = rule['turns']
    pmin, pmax = rule['path']
    for seed in range(1, max_attempts + 1):
        if seed in used_seeds:
            continue
        walls = generate_maze(cols, rows, seed)
        path = bfs_solve(walls, cols, rows)
        turns = count_turns(path)
        if tmin <= turns <= tmax and pmin <= len(path) <= pmax:
            return walls, path, turns, seed
    return None


def build_record(diff_key: str, no: int, walls, path, turns: int, seed: int) -> dict:
    rule = DIFFICULTY[diff_key]
    cols, rows = rule['cols'], rule['rows']
    return {
        'slug': f'{diff_key}-{no:03d}',
        'difficulty': diff_key,
        'difficulty_label': rule['label'],
        'age_label': rule['age'],
        'age_min': rule['age_min'],
        'age_max': rule['age_max'],
        'no': no,
        'cols': cols,
        'rows': rows,
        'seed': seed,
        'turns': turns,
        'path_length': len(path),
        'walls': serialize_walls(walls, cols, rows),
        'solution': [[x, y] for x, y in path],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--difficulty', choices=list(DIFFICULTY.keys()) + ['all'], default='all')
    parser.add_argument('--count', type=int, default=10, help='生成枚数（難易度ごと）')
    parser.add_argument('--out', type=str, default='src/lib/maze/data.json')
    args = parser.parse_args()

    out_path = Path(__file__).resolve().parent.parent / args.out
    out_path.parent.mkdir(parents=True, exist_ok=True)

    # 既存データを読み込み（差分追加対応）
    existing: dict[str, list[dict]] = {}
    if out_path.exists():
        try:
            existing = json.loads(out_path.read_text())
        except Exception:
            existing = {}

    diff_keys = list(DIFFICULTY.keys()) if args.difficulty == 'all' else [args.difficulty]

    for dk in diff_keys:
        bucket = existing.setdefault(dk, [])
        used_seeds = {r['seed'] for r in bucket}
        start_no = max((r['no'] for r in bucket), default=0) + 1
        target_count = args.count - len(bucket)
        if target_count <= 0:
            print(f'[{dk}] skip（既に{len(bucket)}件あります）')
            continue

        print(f'[{dk}] 生成開始：目標{target_count}件 / 現{len(bucket)}件')
        for i in range(target_count):
            no = start_no + i
            result = find_maze(dk, used_seeds)
            if result is None:
                print(f'  [WARN] {dk} No.{no:03d} 条件に合致する迷路が見つかりませんでした')
                break
            walls, path, turns, seed = result
            used_seeds.add(seed)
            rec = build_record(dk, no, walls, path, turns, seed)
            bucket.append(rec)
            print(f'  ✓ {rec["slug"]} (turns={turns}, path={len(path)}, seed={seed})')

    out_path.write_text(json.dumps(existing, ensure_ascii=False, indent=2))
    total = sum(len(v) for v in existing.values())
    print(f'\n→ {out_path} に {total} 件保存しました')


if __name__ == '__main__':
    main()
