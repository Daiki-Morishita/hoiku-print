'use client'

import styles from './maze.module.css'

export function PrintButton() {
  return (
    <button
      type="button"
      className={`${styles.btn} ${styles['btn-print']}`}
      onClick={() => window.print()}
    >
      印刷する
    </button>
  )
}
