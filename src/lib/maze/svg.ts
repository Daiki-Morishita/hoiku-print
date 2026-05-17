import type { MazeRecord } from './types'

const CELL = 42
const WALL = 6

export type MazeSvgResult = {
  svg: string
  startYPct: number
  goalYPct: number
}

/**
 * 迷路をSVG文字列としてレンダリング。
 * solution=true で赤い解答パスをオーバーレイ。
 */
export function buildMazeSvg(maze: MazeRecord, showSolution = false): MazeSvgResult {
  const { walls, cols, rows, solution } = maze
  const W = cols * CELL
  const H = rows * CELL

  const inner: string[] = []
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const px = x * CELL
      const py = y * CELL
      const cell = walls[x][y]
      if (cell.includes('N') && y > 0) inner.push(`M${px} ${py} L${px + CELL} ${py}`)
      if (cell.includes('W') && x > 0) inner.push(`M${px} ${py} L${px} ${py + CELL}`)
    }
  }
  const outer: string[] = [
    `M0 0 L${W} 0`,
    `M0 ${H} L${W} ${H}`,
    `M0 ${CELL} L0 ${H}`,
    `M${W} 0 L${W} ${(rows - 1) * CELL}`,
  ]

  let solLayer = ''
  if (showSolution && solution.length > 0) {
    const pts: [number, number][] = []
    const [, sy] = solution[0]
    pts.push([-CELL * 0.4, sy * CELL + CELL / 2])
    for (const [cx, cy] of solution) {
      pts.push([cx * CELL + CELL / 2, cy * CELL + CELL / 2])
    }
    const [, gy] = solution[solution.length - 1]
    pts.push([W + CELL * 0.4, gy * CELL + CELL / 2])
    const d = 'M ' + pts.map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`).join(' L ')
    solLayer = `<path d="${d}" stroke="#FF4757" stroke-width="${WALL * 0.9}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.85"/>`
  }

  const vbH = H + WALL * 2
  const svg = `<svg viewBox="-${CELL * 0.5} -${WALL} ${W + CELL} ${vbH}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    ${solLayer}
    <path d="${inner.join(' ')}" stroke="#2A1E22" stroke-width="${WALL}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="${outer.join(' ')}" stroke="#2A1E22" stroke-width="${WALL}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`

  const startYPct = ((WALL + 0.5 * CELL) / vbH) * 100
  const goalYPct = ((WALL + (rows - 0.5) * CELL) / vbH) * 100
  return { svg, startYPct, goalYPct }
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
