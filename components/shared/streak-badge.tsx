"use client"

import { motion } from "framer-motion"

interface StreakBadgeProps {
  streak: number
  collapsed?: boolean
}

export function StreakBadge({ streak, collapsed }: StreakBadgeProps) {
  if (streak <= 0) return null

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-0.5"
    >
      <span className="text-xs leading-none">🔥</span>
      {!collapsed && (
        <span className="text-xs font-medium text-brand-accent tabular-nums">{streak}</span>
      )}
    </motion.div>
  )
}
