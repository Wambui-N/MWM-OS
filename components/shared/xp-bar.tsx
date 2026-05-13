"use client"

import { motion } from "framer-motion"

const LEVELS = [
  { name: "Trigger",     threshold: 0 },
  { name: "Scenario",    threshold: 200 },
  { name: "Module",      threshold: 500 },
  { name: "Router",      threshold: 1000 },
  { name: "Transformer", threshold: 2000 },
  { name: "Architect",   threshold: 4000 },
]

export function getLevelInfo(xp: number) {
  let current = LEVELS[0]
  let next = LEVELS[1]
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].threshold) {
      current = LEVELS[i]
      next = LEVELS[i + 1] ?? null
      break
    }
  }
  const progress = next
    ? (xp - current.threshold) / (next.threshold - current.threshold)
    : 1
  return { current, next, progress: Math.min(progress, 1) }
}

interface XPBarProps {
  xp: number
  collapsed?: boolean
}

export function XPBar({ xp, collapsed }: XPBarProps) {
  const { current, next, progress } = getLevelInfo(xp)

  if (collapsed) {
    return (
      <div className="px-3 py-2" title={`${current.name} · ${xp} XP`}>
        <div className="w-6 h-1 rounded-full bg-border">
          <div
            className="h-full rounded-full bg-brand-accent"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="px-3 py-2 space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-text-primary">{current.name}</span>
        <span className="text-text-muted">{xp} XP</span>
      </div>
      <div className="h-1.5 rounded-full bg-border overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-brand-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      {next && (
        <p className="text-xs text-text-muted">{next.threshold - xp} XP to {next.name}</p>
      )}
    </div>
  )
}
