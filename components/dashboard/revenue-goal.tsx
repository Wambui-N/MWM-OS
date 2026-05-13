"use client"

import { motion } from "framer-motion"
import { useEffect, useRef } from "react"
import { triggerRevenueGoal } from "@/lib/celebrations"

interface RevenueGoalProps {
  target: number
  current: number
}

export function RevenueGoal({ target, current }: RevenueGoalProps) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference
  const celebratedRef = useRef(false)

  useEffect(() => {
    if (pct >= 100 && !celebratedRef.current) {
      celebratedRef.current = true
      triggerRevenueGoal()
    }
  }, [pct])

  if (target <= 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-4 flex items-center gap-3">
        <div className="w-[72px] h-[72px] rounded-full border-4 border-bg-subtle flex items-center justify-center text-text-muted text-xs text-center leading-tight">
          No target
        </div>
        <div>
          <p className="text-xs text-text-muted mb-0.5">Monthly revenue</p>
          <p className="text-sm text-text-muted">Set target in Settings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 flex items-center gap-4">
      <svg width="72" height="72" className="-rotate-90 shrink-0">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="var(--bg-subtle)" strokeWidth="4" />
        <motion.circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>

      <div className="min-w-0">
        <p className="text-xs text-text-muted mb-0.5">Monthly revenue</p>
        <p className="font-semibold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
          KSh {(current / 1000).toFixed(0)}k
          <span className="text-sm text-text-muted font-sans"> / {(target / 1000).toFixed(0)}k</span>
        </p>
        <p className="text-xs text-text-muted mt-0.5">{Math.round(pct)}% of goal</p>
      </div>
    </div>
  )
}
