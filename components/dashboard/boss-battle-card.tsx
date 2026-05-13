"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { triggerBossWin } from "@/lib/celebrations"
import { useUIStore } from "@/stores/ui"
import type { BossBattle } from "@/types/database"

interface Milestone {
  id: string
  label: string
  done: boolean
}

export function BossBattleCard() {
  const [battle, setBattle] = useState<BossBattle | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const { triggerRewardMoment } = useUIStore()

  const load = useCallback(async () => {
    try {
      const { battle: b } = await fetch("/api/boss-battles").then((r) => r.json())
      setBattle(b ?? null)
      if (b?.project_id) {
        const { project } = await fetch(`/api/projects/${b.project_id}`).then((r) => r.json())
        setMilestones((project?.milestones ?? []) as Milestone[])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleMilestone(milestoneId: string) {
    if (!battle) return
    const updated = milestones.map((m) => m.id === milestoneId ? { ...m, done: !m.done } : m)
    setMilestones(updated)
    const completedCount = updated.filter((m) => m.done).length

    // Update project milestones
    await fetch(`/api/projects/${battle.project_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestones: updated }),
    })

    const newCompleted = completedCount
    const isWon = newCompleted === battle.total_milestones

    const res = await fetch(`/api/boss-battles/${battle.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        completed_milestones: newCompleted,
        ...(isWon ? { is_won: true, won_at: new Date().toISOString() } : {}),
      }),
    })

    const { battle: updatedBattle } = await res.json()
    setBattle(updatedBattle)

    if (isWon) {
      triggerBossWin()
    }
  }

  if (loading || !battle) return null

  const pct = (battle.completed_milestones / battle.total_milestones) * 100
  const isNearDone = pct >= 80

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-xl border p-4",
        "bg-gradient-to-r from-bg-card to-brand-accent/5 border-brand-accent/30"
      )}
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top right, var(--accent), transparent)" }} />

      <div className="relative space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚔️</span>
          <span className="text-xs font-medium text-brand-accent uppercase tracking-wider">Boss Battle</span>
        </div>

        <h3
          className="text-xl font-semibold text-text-primary"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {battle.label}
        </h3>

        <div className="space-y-1">
          <div className="h-2 bg-bg-subtle rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-brand-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-xs text-text-muted">
            <span>{battle.completed_milestones} of {battle.total_milestones} milestones</span>
            <span>{Math.round(pct)}%</span>
          </div>
        </div>

        {milestones.length > 0 && (
          <div className="space-y-1.5">
            {milestones.map((m) => (
              <button
                key={m.id}
                onClick={() => toggleMilestone(m.id)}
                className="flex items-center gap-2 text-sm w-full text-left hover:opacity-80 transition-opacity"
              >
                <span className={m.done ? "text-brand-accent" : "text-text-muted"}>
                  {m.done ? "●" : "○"}
                </span>
                <span className={m.done ? "line-through text-text-muted" : "text-text-primary"}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
