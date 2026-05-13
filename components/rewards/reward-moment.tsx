"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useUIStore } from "@/stores/ui"
import { triggerConfetti } from "@/lib/celebrations"

export function RewardMoment() {
  const { pendingReward, clearRewardMoment } = useUIStore()

  useEffect(() => {
    if (pendingReward) {
      triggerConfetti()
    }
  }, [pendingReward])

  return (
    <AnimatePresence>
      {pendingReward && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-bg-base/95 backdrop-blur-sm z-[100] flex items-center justify-center"
          onClick={clearRewardMoment}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="text-center space-y-4 max-w-sm px-8"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-6xl"
            >
              {pendingReward.emoji}
            </motion.div>
            <h2
              className="text-3xl font-semibold text-text-primary"
              style={{ fontFamily: "var(--font-display)" }}
            >
              You&apos;ve earned it.
            </h2>
            <p className="text-text-primary font-medium">{pendingReward.name}</p>
            {pendingReward.description && (
              <p className="text-sm text-text-muted border border-border rounded-lg p-3">
                {pendingReward.description}
              </p>
            )}
            <button
              onClick={clearRewardMoment}
              className="bg-brand-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-accent-hover transition-colors"
            >
              Claim it →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
