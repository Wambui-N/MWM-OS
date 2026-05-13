"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"

interface PostingStreakProps {
  streak: number
  streakBest: number
  freezeCount: number
  isMissingThisWeek: boolean
}

export function PostingStreak({ streak, streakBest, freezeCount, isMissingThisWeek }: PostingStreakProps) {
  const [localFreeze, setLocalFreeze] = useState(freezeCount)
  const [showConfirm, setShowConfirm] = useState(false)
  const [used, setUsed] = useState(false)

  async function useFreeze() {
    try {
      const res = await fetch("/api/prefs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posting_streak_freeze_count: localFreeze - 1 }),
      })
      if (!res.ok) throw new Error()
      setLocalFreeze((n) => n - 1)
      setUsed(true)
      setShowConfirm(false)
      toast.success("Streak freeze used! Your streak is protected this week.")
    } catch {
      toast.error("Couldn't use freeze")
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-bg-card border border-border rounded-xl">
      <motion.div
        animate={{ scale: streak > 0 ? [1, 1.08, 1] : 1 }}
        transition={{ duration: 0.4, repeat: streak > 0 ? Infinity : 0, repeatDelay: 3 }}
      >
        <span className="text-3xl">{streak > 0 ? "🔥" : "🩶"}</span>
      </motion.div>

      <div>
        <p className="font-semibold text-text-primary text-lg" style={{ fontFamily: "var(--font-display)" }}>
          {streak} week{streak !== 1 ? "s" : ""}
        </p>
        <p className="text-xs text-text-muted">
          posting streak{streakBest > streak ? ` · best: ${streakBest}` : ""}
        </p>
      </div>

      {isMissingThisWeek && localFreeze > 0 && !used && (
        <div className="ml-auto">
          {showConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">Use your freeze?</span>
              <button
                onClick={useFreeze}
                className="text-xs bg-brand-accent text-white px-3 py-1.5 rounded-lg hover:bg-brand-accent-hover transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-xs border border-border px-3 py-1.5 rounded-lg text-text-muted hover:bg-bg-subtle transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="text-xs border border-border rounded-lg px-3 py-1.5 hover:bg-bg-subtle transition-colors text-text-muted"
            >
              🧊 Use freeze ({localFreeze} left)
            </button>
          )}
        </div>
      )}

      {used && (
        <span className="ml-auto text-xs text-success">🧊 Freeze active</span>
      )}
    </div>
  )
}
