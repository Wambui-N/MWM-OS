"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { Habit } from "@/types/database"

export function HabitManager() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [newEmoji, setNewEmoji] = useState("✓")
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      const res = await fetch("/api/habits")
      const { habits: h } = await res.json()
      setHabits(h ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function addHabit() {
    if (!newName.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), emoji: newEmoji }),
      })
      if (!res.ok) throw new Error()
      const { habit } = await res.json()
      setHabits((h) => [...h, habit])
      setNewName("")
      setNewEmoji("✓")
      toast.success("Habit added!")
    } catch {
      toast.error("Couldn't add habit")
    } finally {
      setSaving(false)
    }
  }

  async function removeHabit(id: string) {
    try {
      await fetch(`/api/habits/${id}`, { method: "DELETE" })
      setHabits((h) => h.filter((x) => x.id !== id))
      toast.success("Habit removed")
    } catch {
      toast.error("Couldn't remove habit")
    }
  }

  return (
    <div className="space-y-3" id="habits">
      {loading ? (
        <div className="h-16 animate-pulse bg-bg-subtle rounded-lg" />
      ) : (
        <AnimatePresence>
          {habits.map((habit) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-bg-subtle"
            >
              <span className="text-lg">{habit.emoji}</span>
              <span className="text-sm text-text-primary flex-1">{habit.name}</span>
              <button
                onClick={() => removeHabit(habit.id)}
                className="text-text-muted hover:text-danger transition-colors"
                title="Remove habit"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* Add form */}
      <div className="flex gap-2">
        <input
          value={newEmoji}
          onChange={(e) => setNewEmoji(e.target.value)}
          maxLength={2}
          className="w-12 text-center px-2 py-2.5 rounded-lg border border-border bg-bg-subtle text-sm outline-none focus:border-brand-accent"
          placeholder="✓"
        />
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addHabit()}
          placeholder="New habit name..."
          className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-bg-subtle text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-accent"
        />
        <button
          onClick={addHabit}
          disabled={saving || !newName.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand-accent text-white text-sm font-medium hover:bg-brand-accent-hover transition-colors disabled:opacity-60"
        >
          <Plus size={14} />
          Add
        </button>
      </div>
    </div>
  )
}
