"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useUIStore } from "@/stores/ui"
import { format, startOfWeek } from "date-fns"

function isSunday() {
  return new Date().getDay() === 0
}

function isAfter4pm() {
  return new Date().getHours() >= 16
}

export function WeeklyReviewNudge() {
  const { openReviewModal } = useUIStore()
  const [hasReviewedThisWeek, setHasReviewedThisWeek] = useState(true)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!isSunday()) { setChecked(true); return }
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd")
    fetch("/api/reviews")
      .then((r) => r.json())
      .then(({ reviews }) => {
        const done = (reviews ?? []).some((r: any) => r.week_start === weekStart)
        setHasReviewedThisWeek(done)
      })
      .catch(() => {})
      .finally(() => setChecked(true))
  }, [])

  if (!checked || !isSunday() || !isAfter4pm() || hasReviewedThisWeek) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-card border border-border rounded-xl p-4 flex items-center justify-between"
    >
      <div>
        <p className="text-sm font-medium text-text-primary">Time for your weekly review</p>
        <p className="text-xs text-text-muted">5 minutes · +100 XP</p>
      </div>
      <button
        onClick={openReviewModal}
        className="bg-brand-accent text-white text-sm px-4 py-2 rounded-lg hover:bg-brand-accent-hover transition-colors"
      >
        Start →
      </button>
    </motion.div>
  )
}
