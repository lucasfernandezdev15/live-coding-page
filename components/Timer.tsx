'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

const HINT_UNLOCK_SECONDS = 60

interface Props {
  onHintUnlock: () => void
  onTick?: (elapsedSeconds: number) => void
  resetSignal?: number
}

function formatElapsed(seconds: number): string {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

export default function Timer({ onHintUnlock, onTick, resetSignal = 0 }: Props) {
  const [seconds, setSeconds] = useState(0)
  const fired = useRef(false)

  useEffect(() => {
    setSeconds(0)
    fired.current = false
  }, [resetSignal])

  useEffect(() => {
    const id = setInterval(() => setSeconds((prev) => prev + 1), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    onTick?.(seconds)
    if (!fired.current && seconds >= HINT_UNLOCK_SECONDS) {
      fired.current = true
      onHintUnlock()
    }
  }, [onHintUnlock, onTick, seconds])

  const color = useMemo(() => {
    if (seconds >= 300) return 'var(--red)'
    if (seconds >= HINT_UNLOCK_SECONDS) return 'var(--amber)'
    return 'var(--muted)'
  }, [seconds])

  return (
    <span style={{ fontFamily: 'var(--font-mono)', color }} className="text-sm">
      {formatElapsed(seconds)}
    </span>
  )
}
