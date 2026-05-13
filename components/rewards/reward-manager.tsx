"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { Reward, RewardTriggerType } from "@/types/database"

const TRIGGER_LABELS: Record<RewardTriggerType, string> = {
  xp_milestone: "XP milestone",
  posting_streak: "Posting streak (weeks)",
  habit_streak: "Habit streak (days)",
  weekly_score: "Weekly score (%)",
  project_closed: "Project closed",
  perfect_days: "Perfect days this month",
  custom: "Custom (manual claim)",
}

const TRIGGER_OPTIONS = Object.entries(TRIGGER_LABELS) as [RewardTriggerType, string][]

export function RewardManager() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: "",
    description: "",
    emoji: "🎁",
    trigger_type: "xp_milestone" as RewardTriggerType,
    trigger_threshold: 100,
  })
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      const { rewards: r } = await fetch("/api/rewards").then((res) => res.json())
      setRewards(r ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function addReward() {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      const { reward } = await res.json()
      setRewards((r) => [...r, reward])
      setShowForm(false)
      setForm({ name: "", description: "", emoji: "🎁", trigger_type: "xp_milestone", trigger_threshold: 100 })
      toast.success("Reward added!")
    } catch {
      toast.error("Couldn't add reward")
    } finally {
      setSaving(false)
    }
  }

  async function archiveReward(id: string) {
    try {
      await fetch(`/api/rewards/${id}`, { method: "DELETE" })
      setRewards((r) => r.filter((x) => x.id !== id))
      toast.success("Reward archived")
    } catch {
      toast.error("Couldn't archive reward")
    }
  }

  return (
    <div className="space-y-3" id="rewards">
      {loading ? (
        <div className="h-16 animate-pulse bg-bg-subtle rounded-lg" />
      ) : (
        <AnimatePresence>
          {rewards.filter((r) => r.is_active).map((reward) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-bg-subtle"
            >
              <span className="text-xl">{reward.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary font-medium">{reward.name}</p>
                <p className="text-xs text-text-muted">
                  {TRIGGER_LABELS[reward.trigger_type]} · {reward.trigger_threshold}
                  {reward.claimed_at && " · Claimed ✓"}
                </p>
              </div>
              <button
                onClick={() => archiveReward(reward.id)}
                className="text-text-muted hover:text-danger transition-colors"
                title="Archive"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {showForm ? (
        <div className="p-4 rounded-xl border border-border bg-bg-subtle space-y-3">
          <div className="flex gap-2">
            <input
              value={form.emoji}
              onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
              maxLength={2}
              className="w-12 text-center px-2 py-2.5 rounded-lg border border-border bg-bg-base text-sm outline-none focus:border-brand-accent"
              placeholder="🎁"
            />
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Reward name *"
              className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-bg-base text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-accent"
            />
          </div>
          <input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Description (optional)"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-base text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-accent"
          />
          <div className="flex gap-2">
            <select
              value={form.trigger_type}
              onChange={(e) => setForm((f) => ({ ...f, trigger_type: e.target.value as RewardTriggerType }))}
              className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-bg-base text-sm text-text-primary outline-none focus:border-brand-accent"
            >
              {TRIGGER_OPTIONS.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <input
              type="number"
              value={form.trigger_threshold}
              onChange={(e) => setForm((f) => ({ ...f, trigger_threshold: Number(e.target.value) }))}
              className="w-24 px-3 py-2.5 rounded-lg border border-border bg-bg-base text-sm text-text-primary outline-none focus:border-brand-accent"
              placeholder="100"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={addReward} disabled={saving || !form.name.trim()} className="px-4 py-2 rounded-lg bg-brand-accent text-white text-sm font-medium hover:bg-brand-accent-hover transition-colors disabled:opacity-60">
              {saving ? "Adding..." : "Add Reward"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-text-muted hover:bg-bg-subtle transition-colors">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <Plus size={14} /> Add reward
        </button>
      )}
    </div>
  )
}
