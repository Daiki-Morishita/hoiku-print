import { isCircleMaze, type CircleMazeRecord, type GridMazeRecord, type MazeRecord, type WallSide } from './types'

const CELL = 42
const WALL = 6

export type MazeEdge = 'left' | 'right' | 'top' | 'bottom' | 'circle'

export type MazeSvgResult = {
  svg: string
  startXPct: number
  startYPct: number
  startEdge: MazeEdge
  goalXPct: number
  goalYPct: number
  goalEdge: MazeEdge
}

function sideToEdge(side: WallSide): 'left' | 'right' | 'top' | 'bottom' {
  return ({ W: 'left', E: 'right', N: 'top', S: 'bottom' } as const)[side]
}

/** トップエントリ: shape に応じて grid版 / polar版 を呼び分け */
export function buildMazeSvg(maze: MazeRecord, showSolution = false): MazeSvgResult {
  if (isCircleMaze(maze)) return buildPolarSvg(maze, showSolution)
  return buildGridSvg(maze, showSolution)
}

function buildGridSvg(maze: GridMazeRecord, showSolution = false): MazeSvgResult {
  const { walls, valid, cols, rows, solution, start_cell, goal_cell, start_side, goal_side } = maze
  const W = cols * CELL
  const H = rows * CELL

  // 内壁: 有効セル間の壁のみ
  const inner: string[] = []
  // 外壁: 有効セルの「形の境界」（隣が無効 or 範囲外）
  const outer: string[] = []
  const [sx, sy] = start_cell
  const [gx, gy] = goal_cell

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if (!valid[x][y]) continue
      const px = x * CELL
      const py = y * CELL
      const cell = walls[x][y]
      // 北
      if (cell.includes('N')) {
        const neighborValid = y > 0 && valid[x][y - 1]
        const isStartOpening = x === sx && y === sy && start_side === 'N'
        const isGoalOpening = x === gx && y === gy && goal_side === 'N'
        if (isStartOpening || isGoalOpening) continue
        if (neighborValid) inner.push(`M${px} ${py} L${px + CELL} ${py}`)
        else outer.push(`M${px} ${py} L${px + CELL} ${py}`)
      }
      // 南
      if (cell.includes('S')) {
        const neighborValid = y < rows - 1 && valid[x][y + 1]
        const isStartOpening = x === sx && y === sy && start_side === 'S'
        const isGoalOpening = x === gx && y === gy && goal_side === 'S'
        if (isStartOpening || isGoalOpening) continue
        // 内壁は北側で書くので、南は外壁のみ書く（重複防止）
        if (!neighborValid) outer.push(`M${px} ${py + CELL} L${px + CELL} ${py + CELL}`)
      }
      // 西
      if (cell.includes('W')) {
        const neighborValid = x > 0 && valid[x - 1][y]
        const isStartOpening = x === sx && y === sy && start_side === 'W'
        const isGoalOpening = x === gx && y === gy && goal_side === 'W'
        if (isStartOpening || isGoalOpening) continue
        if (neighborValid) inner.push(`M${px} ${py} L${px} ${py + CELL}`)
        else outer.push(`M${px} ${py} L${px} ${py + CELL}`)
      }
      // 東
      if (cell.includes('E')) {
        const neighborValid = x < cols - 1 && valid[x + 1][y]
        const isStartOpening = x === sx && y === sy && start_side === 'E'
        const isGoalOpening = x === gx && y === gy && goal_side === 'E'
        if (isStartOpening || isGoalOpening) continue
        if (!neighborValid) outer.push(`M${px + CELL} ${py} L${px + CELL} ${py + CELL}`)
      }
    }
  }

  // 解答パス
  let solLayer = ''
  if (showSolution && solution.length > 0) {
    const pts: [number, number][] = []
    // スタート外側
    const [s0x, s0y] = solution[0]
    pts.push(extendOutside(s0x, s0y, start_side))
    for (const [cx, cy] of solution) {
      pts.push([cx * CELL + CELL / 2, cy * CELL + CELL / 2])
    }
    // ゴール外側
    const [g0x, g0y] = solution[solution.length - 1]
    pts.push(extendOutside(g0x, g0y, goal_side))
    const d = 'M ' + pts.map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`).join(' L ')
    solLayer = `<path d="${d}" stroke="#FF4757" stroke-width="${WALL * 0.9}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.85"/>`
  }

  const pad = WALL
  const vbW = W + pad * 2
  const vbH = H + pad * 2
  const svg = `<svg viewBox="-${pad} -${pad} ${vbW} ${vbH}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    ${solLayer}
    <path d="${inner.join(' ')}" stroke="#2A1E22" stroke-width="${WALL}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="${outer.join(' ')}" stroke="#2A1E22" stroke-width="${WALL}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`

  // キャラ位置計算（viewBox上の座標を％に変換）
  const startCenterX = sx * CELL + CELL / 2 + pad
  const startCenterY = sy * CELL + CELL / 2 + pad
  const goalCenterX = gx * CELL + CELL / 2 + pad
  const goalCenterY = gy * CELL + CELL / 2 + pad

  return {
    svg,
    startXPct: (startCenterX / vbW) * 100,
    startYPct: (startCenterY / vbH) * 100,
    startEdge: sideToEdge(start_side),
    goalXPct: (goalCenterX / vbW) * 100,
    goalYPct: (goalCenterY / vbH) * 100,
    goalEdge: sideToEdge(goal_side),
  }

  function extendOutside(cx: number, cy: number, side: WallSide): [number, number] {
    const px = cx * CELL + CELL / 2
    const py = cy * CELL + CELL / 2
    const off = CELL * 0.5
    if (side === 'W') return [px - off, py]
    if (side === 'E') return [px + off, py]
    if (side === 'N') return [px, py - off]
    return [px, py + off]
  }
}

// ========= Polar (真の円形) maze renderer =========
function buildPolarSvg(maze: CircleMazeRecord, showSolution = false): MazeSvgResult {
  const { rings, sectors, circle_walls, solution, start_cell, goal_cell, start_side, goal_side } = maze

  const CENTER_R = 32   // 中心円（穴）の半径
  const RING_W = 28     // 各リングの幅
  const CHAR_SPACE = RING_W * 1.6  // 外側のキャラ配置スペース
  const outerR = CENTER_R + rings * RING_W
  const vb = outerR + CHAR_SPACE + 6   // viewBox 半径（キャラ込み）

  const sectorAngle = (2 * Math.PI) / sectors

  function pt(r: number, theta: number): [number, number] {
    return [r * Math.cos(theta), r * Math.sin(theta)]
  }

  function arcPath(r: number, t1: number, t2: number): string {
    const [x1, y1] = pt(r, t1)
    const [x2, y2] = pt(r, t2)
    const largeArc = Math.abs(t2 - t1) > Math.PI ? 1 : 0
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
  }

  function linePath(r1: number, r2: number, theta: number): string {
    const [x1, y1] = pt(r1, theta)
    const [x2, y2] = pt(r2, theta)
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}`
  }

  const paths: string[] = []
  const [sr, ss] = start_cell
  const [gr, gs] = goal_cell

  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < sectors; s++) {
      const cell = circle_walls[r][s]
      const t1 = s * sectorAngle
      const t2 = (s + 1) * sectorAngle
      const rIn = CENTER_R + r * RING_W
      const rOut = CENTER_R + (r + 1) * RING_W

      // IN (内側の弧)
      if (cell.includes('IN')) {
        const isStart = r === sr && s === ss && start_side === 'IN'
        const isGoal = r === gr && s === gs && goal_side === 'IN'
        if (!isStart && !isGoal) paths.push(arcPath(rIn, t1, t2))
      }
      // OUT (外側の弧)
      if (cell.includes('OUT')) {
        const isStart = r === sr && s === ss && start_side === 'OUT'
        const isGoal = r === gr && s === gs && goal_side === 'OUT'
        if (!isStart && !isGoal) paths.push(arcPath(rOut, t1, t2))
      }
      // CW (sector境界 = theta2 の半径方向の線)。CCW側は隣セルが CW として描くので重複防止
      if (cell.includes('CW')) {
        paths.push(linePath(rIn, rOut, t2))
      }
    }
  }

  // 解答パス
  let solLayer = ''
  if (showSolution && solution.length > 0) {
    const ext = RING_W * 0.6
    const pathPts: [number, number][] = []
    pathPts.push(extendPolar(start_cell, start_side, ext, CENTER_R, RING_W, sectorAngle))
    for (const [r, s] of solution) {
      const theta = (s + 0.5) * sectorAngle
      const radius = CENTER_R + (r + 0.5) * RING_W
      pathPts.push(pt(radius, theta))
    }
    pathPts.push(extendPolar(goal_cell, goal_side, ext, CENTER_R, RING_W, sectorAngle))
    const d = 'M ' + pathPts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ')
    solLayer = `<path d="${d}" stroke="#FF4757" stroke-width="${WALL * 0.9}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.85"/>`
  }

  const svg = `<svg viewBox="${-vb} ${-vb} ${vb * 2} ${vb * 2}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    ${solLayer}
    <path d="${paths.join(' ')}" stroke="#2A1E22" stroke-width="${WALL}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`

  // キャラ位置: 開口の方向の外側に配置。viewBox(-vb,-vb,2vb,2vb)→%変換
  const charOffset = CHAR_SPACE - 4
  const [sx, sy] = charPosPolar(start_cell, start_side, charOffset, CENTER_R, RING_W, sectorAngle)
  const [gx, gy] = charPosPolar(goal_cell, goal_side, charOffset, CENTER_R, RING_W, sectorAngle)
  const toPct = (v: number) => ((v + vb) / (vb * 2)) * 100
  return {
    svg,
    startXPct: toPct(sx),
    startYPct: toPct(sy),
    startEdge: 'circle',
    goalXPct: toPct(gx),
    goalYPct: toPct(gy),
    goalEdge: 'circle',
  }
}

function extendPolar(cell: [number, number], side: string, ext: number, CENTER_R: number, RING_W: number, sectorAngle: number): [number, number] {
  const [r, s] = cell
  const theta = (s + 0.5) * sectorAngle
  let radius = CENTER_R + (r + 0.5) * RING_W
  if (side === 'OUT') radius = CENTER_R + (r + 1) * RING_W + ext
  if (side === 'IN') radius = Math.max(0, CENTER_R + r * RING_W - ext)
  // CW/CCW (角度方向) は実装不要（このプロジェクトでは外側開口のみ採用）
  return [radius * Math.cos(theta), radius * Math.sin(theta)]
}

function charPosPolar(cell: [number, number], side: string, ext: number, CENTER_R: number, RING_W: number, sectorAngle: number): [number, number] {
  return extendPolar(cell, side, ext, CENTER_R, RING_W, sectorAngle)
}

export const RABBIT_SVG = `<svg viewBox="0 0 100 115" xmlns="http://www.w3.org/2000/svg">
  <path d="M 36 38 C 30 30, 26 16, 30 8 C 36 4, 44 8, 45 22 C 46 32, 44 38, 40 40 Z" fill="#FFFFFF" stroke="#3A2A2E" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M 38 34 C 35 26, 33 16, 36 12 C 40 12, 42 20, 41 30 Z" fill="#FFC0CB" opacity="0.9"/>
  <path d="M 64 38 C 70 30, 74 16, 70 8 C 64 4, 56 8, 55 22 C 54 32, 56 38, 60 40 Z" fill="#FFFFFF" stroke="#3A2A2E" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M 62 34 C 65 26, 67 16, 64 12 C 60 12, 58 20, 59 30 Z" fill="#FFC0CB" opacity="0.9"/>
  <path d="M 30 58 C 30 38, 40 36, 50 36 C 60 36, 70 38, 70 58 C 70 75, 62 82, 50 82 C 38 82, 30 75, 30 58 Z" fill="#FFFFFF" stroke="#3A2A2E" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="35" cy="66" rx="6.5" ry="4.5" fill="#FFB3C0" opacity="0.85"/>
  <ellipse cx="65" cy="66" rx="6.5" ry="4.5" fill="#FFB3C0" opacity="0.85"/>
  <ellipse cx="41" cy="57" rx="3" ry="4" fill="#3A2A2E"/>
  <ellipse cx="59" cy="57" rx="3" ry="4" fill="#3A2A2E"/>
  <circle cx="42" cy="55.5" r="1" fill="white"/>
  <circle cx="60" cy="55.5" r="1" fill="white"/>
  <path d="M 47 65 Q 50 68, 53 65 Q 50 67, 47 65 Z" fill="#F5A0B0" stroke="#3A2A2E" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M 50 67 L 50 70" stroke="#3A2A2E" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M 50 70 Q 46 73, 43 71" fill="none" stroke="#3A2A2E" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M 50 70 Q 54 73, 57 71" fill="none" stroke="#3A2A2E" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M 27 62 L 16 60" stroke="#3A2A2E" stroke-width="1" stroke-linecap="round"/>
  <path d="M 27 67 L 16 68" stroke="#3A2A2E" stroke-width="1" stroke-linecap="round"/>
  <path d="M 73 62 L 84 60" stroke="#3A2A2E" stroke-width="1" stroke-linecap="round"/>
  <path d="M 73 67 L 84 68" stroke="#3A2A2E" stroke-width="1" stroke-linecap="round"/>
  <path d="M 32 78 C 28 88, 30 100, 36 106 C 42 110, 58 110, 64 106 C 70 100, 72 88, 68 78" fill="#FFFFFF" stroke="#3A2A2E" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M 36 102 C 33 106, 33 110, 38 110 C 42 110, 43 106, 41 102 Z" fill="#FFFFFF" stroke="#3A2A2E" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M 64 102 C 67 106, 67 110, 62 110 C 58 110, 57 106, 59 102 Z" fill="#FFFFFF" stroke="#3A2A2E" stroke-width="2.5" stroke-linejoin="round"/>
</svg>`

export const CARROT_SVG = `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFB088"/><stop offset="50%" stop-color="#F58F5C"/><stop offset="100%" stop-color="#D86840"/></linearGradient>
    <linearGradient id="lg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#8FD49A"/><stop offset="100%" stop-color="#5DA66E"/></linearGradient>
  </defs>
  <path d="M 50 42 C 42 38, 32 30, 25 18 C 23 12, 28 10, 32 14 C 36 18, 40 22, 44 28 C 46 32, 48 38, 50 42 Z" fill="url(#lg)" stroke="#2F5538" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M 50 42 C 58 38, 68 30, 75 18 C 77 12, 72 10, 68 14 C 64 18, 60 22, 56 28 C 54 32, 52 38, 50 42 Z" fill="url(#lg)" stroke="#2F5538" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M 50 42 C 48 32, 44 20, 42 8 C 44 4, 48 4, 50 8 C 52 4, 56 4, 58 8 C 56 20, 52 32, 50 42 Z" fill="url(#lg)" stroke="#2F5538" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M 32 18 L 40 30" stroke="#2F5538" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  <path d="M 50 10 L 50 38" stroke="#2F5538" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  <path d="M 68 18 L 60 30" stroke="#2F5538" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  <path d="M 33 42 Q 50 36, 67 42 Q 65 50, 50 50 Q 35 50, 33 42 Z" fill="#4D8C5C" stroke="#2F5538" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M 35 48 C 30 60, 28 80, 36 105 C 40 118, 44 125, 50 128 C 56 125, 60 118, 64 105 C 72 80, 70 60, 65 48 Q 50 44, 35 48 Z" fill="url(#cg)" stroke="#3A2A2E" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M 36 62 Q 50 65, 64 62" stroke="#3A2A2E" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.5"/>
  <path d="M 36 78 Q 50 81, 64 78" stroke="#3A2A2E" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.5"/>
  <path d="M 38 94 Q 50 97, 62 94" stroke="#3A2A2E" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.5"/>
  <path d="M 42 110 Q 50 112, 58 110" stroke="#3A2A2E" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.5"/>
  <path d="M 42 56 C 40 76, 42 100, 46 118" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.4" fill="none"/>
</svg>`
