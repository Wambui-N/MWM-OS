"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useUIStore } from "@/stores/ui"
import type { Reward } from "@/types/database"

export function UnclaimedBanner() {
  const [unclaimed, setUnclaimed] = useState<Reward[]>([])
  const { triggerRewardMoment } = useUIStore()

  useEffect(() => {
    fetch("/api/rewards")
      .then((r) => r.json())
      .then(({ rewards }) => {
        const pending = (rewards ?? []).filter(
          (r: Reward) => r.is_active && !r.claimed_at
        )
        // Don't show banner — rewards are claimed via the moment overlay automatically
        // This banner surfaces rewards that were earned but never shown (e.g. in a previous session)
        setUnclaimed(pending)
      })
      .catch(() => {})
  }, [])

  if (unclaimed.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="bg-brand-accent/10 border border-brand-accent/20 rounded-xl p-4 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{unclaimed[0].emoji}</span>
          <div>
            <p className="text-sm font-medium text-text-primary">
              You have {unclaimed.length} unclaimed reward{unclaimed.length > 1 ? "s" : ""}!
            </p>
            <p className="text-xs text-text-muted">{unclaimed[0].name}</p>
          </div>
        </div>
        <button
          onClick={() => triggerRewardMoment(unclaimed[0])}
          className="text-sm font-medium text-brand-accent hover:underline shrink-0"
        >
          Claim →
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
