"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useUIStore } from "@/stores/ui"
import type { WeeklyChallenge as WeeklyChallengeType } from "@/types/database"

export function WeeklyChallenge() {
  const [challenge, setChallenge] = useState<WeeklyChallengeType | null>(null)
  const [loading, setLoading] = useState(true)
  const { isChallengeSetupOpen, openChallengeSetup, closeChallengeSetup } = useUIStore()
  const [form, setForm] = useState({ challenge_text: "", trigger_type: "pomodoro_complete", trigger_threshold: 10, xp_bonus: 75 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/challenges")
      .then((r) => r.json())
      .then(({ challenge: c }) => setChallenge(c))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function saveChallenge() {
    setSaving(true)
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const { challenge: c } = await res.json()
      setChallenge(c)
      closeChallengeSetup()
    } catch {}
    finally { setSaving(false) }
  }

  if (loading) return null

  if (isChallengeSetupOpen || !challenge) {
    return (
      <div className="border border-dashed border-border rounded-xl p-4 space-y-3">
        <p className="text-sm font-medium text-text-primary">Set this week&apos;s challenge</p>
        <input
          value={form.challenge_text}
          onChange={(e) => setForm((f) => ({ ...f, challenge_text: e.target.value }))}
          placeholder="e.g. Complete 10 Pomodoro sessions"
          className="w-full px-3 py-2 rounded-lg border border-border bg-bg-subtle text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-accent"
        />
        <div className="flex gap-2">
          <select
            value={form.trigger_type}
            onChange={(e) => setForm((f) => ({ ...f, trigger_type: e.target.value }))}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg-subtle text-sm text-text-primary outline-none focus:border-brand-accent"
          >
            <option value="pomodoro_complete">Pomodoro sessions</option>
            <option value="task_done">Tasks completed</option>
            <option value="post_published">Posts published</option>
            <option value="pipeline_updated">Pipeline updates</option>
          </select>
          <input
            type="number"
            value={form.trigger_threshold}
            onChange={(e) => setForm((f) => ({ ...f, trigger_threshold: Number(e.target.value) }))}
            className="w-20 px-3 py-2 rounded-lg border border-border bg-bg-subtle text-sm outline-none focus:border-brand-accent"
            placeholder="10"
          />
          <input
            type="number"
            value={form.xp_bonus}
            onChange={(e) => setForm((f) => ({ ...f, xp_bonus: Number(e.target.value) }))}
            className="w-20 px-3 py-2 rounded-lg border border-border bg-bg-subtle text-sm outline-none focus:border-brand-accent"
            placeholder="XP"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={saveChallenge}
            disabled={saving || !form.challenge_text.trim()}
            className="px-4 py-2 rounded-lg bg-brand-accent text-white text-sm font-medium hover:bg-brand-accent-hover transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : "Set Challenge"}
          </button>
          {challenge && (
            <button
              onClick={closeChallengeSetup}
              className="px-4 py-2 rounded-lg border border-border text-sm text-text-muted hover:bg-bg-subtle transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    )
  }

  const pct = Math.min((challenge.current_progress / challenge.trigger_threshold) * 100, 100)

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted uppercase tracking-wider">This week&apos;s challenge</span>
        <div className="flex items-center gap-2">
          {challenge.completed && <span className="text-xs text-success">Complete ✓</span>}
          <button
            onClick={openChallengeSetup}
            className="text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
      <p className="text-sm font-medium text-text-primary">{challenge.challenge_text}</p>
      <div className="space-y-1">
        <div className="h-1.5 bg-bg-subtle rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-brand-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <p className="text-xs text-text-muted">
          {challenge.current_progress} / {challenge.trigger_threshold} · +{challenge.xp_bonus} XP on completion
        </p>
      </div>
    </div>
  )
}
