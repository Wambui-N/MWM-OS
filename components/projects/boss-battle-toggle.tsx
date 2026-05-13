"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import type { Project } from "@/types/database"

interface BossBattleToggleProps {
  project: Project
  onActivated?: () => void
}

export function BossBattleToggle({ project, onActivated }: BossBattleToggleProps) {
  const [loading, setLoading] = useState(false)

  const milestones = (project.milestones as any[]) ?? []
  const totalMilestones = milestones.length

  async function declare() {
    if (totalMilestones === 0) {
      toast.error("Add milestones to the project first.")
      return
    }
    setLoading(true)
    try {
      const completedCount = milestones.filter((m: any) => m.done).length
      const res = await fetch("/api/boss-battles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: project.id,
          label: project.name,
          total_milestones: totalMilestones,
          completed_milestones: completedCount,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success("⚔️ Boss Battle declared! Finish every milestone to win.")
      onActivated?.()
    } catch {
      toast.error("Couldn't declare Boss Battle")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={declare}
      disabled={loading}
      className="flex items-center gap-2 text-xs border border-brand-accent/40 text-brand-accent px-3 py-1.5 rounded-lg hover:bg-brand-accent/10 transition-colors disabled:opacity-60"
    >
      ⚔️ {loading ? "Declaring..." : "Declare Boss Battle"}
    </motion.button>
  )
}
