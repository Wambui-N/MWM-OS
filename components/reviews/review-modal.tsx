"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useUIStore } from "@/stores/ui"
import { toast } from "sonner"

const QUESTIONS = [
  { key: "shipped", label: "What did you ship this week?", placeholder: "Delivered X, finished Y..." },
  { key: "biggest_win", label: "What was your biggest win?", placeholder: "The thing you're most proud of" },
  { key: "blocker", label: "What slowed you down?", placeholder: "Be honest — it helps" },
  { key: "next_priority", label: "What's your #1 priority next week?", placeholder: "One thing" },
]

export function ReviewModal() {
  const { isReviewModalOpen, closeReviewModal } = useUIStore()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  async function submit() {
    setSaving(true)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      })
      if (!res.ok) throw new Error()
      toast.success("+100 XP · Weekly review complete! 📋")
      closeReviewModal()
      setStep(0)
      setAnswers({})
    } catch {
      toast.error("Couldn't save review")
    } finally {
      setSaving(false)
    }
  }

  const current = QUESTIONS[step]
  const isLast = step === QUESTIONS.length - 1

  return (
    <AnimatePresence>
      {isReviewModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-bg-base/90 backdrop-blur-sm z-[90] flex items-center justify-center p-4"
          onClick={closeReviewModal}
        >
          <motion.div
            initial={{ scale: 0.95, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="bg-bg-card border border-border rounded-2xl p-8 w-full max-w-lg space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress */}
            <div className="flex items-center gap-2">
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    i <= step ? "bg-brand-accent" : "bg-bg-subtle"
                  }`}
                />
              ))}
            </div>

            {/* Header */}
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                Weekly Review · {step + 1}/{QUESTIONS.length}
              </p>
              <h2
                className="text-2xl font-semibold text-text-primary"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {current.label}
              </h2>
            </div>

            {/* Answer */}
            <textarea
              autoFocus
              value={answers[current.key] ?? ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [current.key]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  if (isLast) submit()
                  else setStep((s) => s + 1)
                }
              }}
              placeholder={current.placeholder}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg-subtle text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-accent resize-none"
            />

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={closeReviewModal}
                className="text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                Save for later
              </button>
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="px-4 py-2 rounded-lg border border-border text-sm text-text-muted hover:bg-bg-subtle transition-colors"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={() => isLast ? submit() : setStep((s) => s + 1)}
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-brand-accent text-white text-sm font-medium hover:bg-brand-accent-hover transition-colors disabled:opacity-60"
                >
                  {isLast ? (saving ? "Saving..." : "Complete +100 XP") : "Next →"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
