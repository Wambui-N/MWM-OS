"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { scaleIn } from "@/lib/animations"
import { toast } from "sonner"
import { useUIStore } from "@/stores/ui"

const ENERGY_OPTIONS = [
  { value: 1, emoji: "😴", label: "Drained" },
  { value: 2, emoji: "🙁", label: "Low" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "🔥", label: "On fire" },
]

interface IntentionModalProps {
  open: boolean
  onClose: () => void
}

export function IntentionModal({ open, onClose }: IntentionModalProps) {
  const [topWin, setTopWin] = useState("")
  const [energy, setEnergy] = useState<number | null>(null)
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const { setIntentionDoneToday } = useUIStore()

  async function handleSubmit() {
    if (!topWin.trim()) {
      toast.error("Add your #1 win for the day first.")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/intentions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          top_win: topWin.trim(),
          energy_level: energy,
          notes: notes.trim() || null,
          intention_date: new Date().toISOString().split("T")[0],
        }),
      })
      if (!res.ok) throw new Error()
      setIntentionDoneToday(true)
      toast.success("Intention set. Let's go.", { icon: "✳" })
      onClose()
    } catch {
      toast.error("Couldn't save intention. Try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="show"
            exit="exit"
            className="relative z-10 w-full max-w-md mx-4 bg-bg-card rounded-2xl border border-border shadow-xl p-8 space-y-6"
          >
            <div className="space-y-1">
              <h2
                className="text-3xl font-semibold text-text-primary"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Good morning, Wambui.
              </h2>
              <p className="text-sm text-text-muted">
                Let&apos;s set the tone for today.
              </p>
            </div>

            {/* Win */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                What&apos;s your #1 win today?
              </label>
              <input
                value={topWin}
                onChange={(e) => setTopWin(e.target.value)}
                placeholder="e.g. Send the Client proposal"
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-subtle text-text-primary text-sm placeholder:text-text-muted outline-none focus:border-brand-accent transition-colors"
                autoFocus
              />
            </div>

            {/* Energy */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Energy level
              </label>
              <div className="flex gap-2">
                {ENERGY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setEnergy(opt.value)}
                    title={opt.label}
                    className={`flex-1 py-3 rounded-xl text-xl border transition-all ${
                      energy === opt.value
                        ? "border-brand-accent bg-brand-accent/10 scale-105"
                        : "border-border bg-bg-subtle hover:border-border-strong"
                    }`}
                  >
                    {opt.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">
                Anything to clear your head? <span className="text-text-muted">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Brain dump here..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-subtle text-text-primary text-sm placeholder:text-text-muted outline-none focus:border-brand-accent transition-colors resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full py-3 rounded-xl bg-brand-accent text-white font-medium text-sm hover:bg-brand-accent-hover transition-colors disabled:opacity-60"
            >
              {saving ? "Saving..." : "Set my intention →"}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
