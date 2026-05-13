"use client"

import { useState, useEffect, useCallback } from "react"
import { getCurrentWeekDates, getHabitStreak } from "@/lib/streak"
import type { Habit, HabitLog } from "@/types/database"

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)

  const weekDates = getCurrentWeekDates()
  const since = weekDates[0]

  const load = useCallback(async () => {
    try {
      const [hRes, lRes] = await Promise.all([
        fetch("/api/habits").then((r) => r.json()),
        fetch(`/api/habits/logs?since=${since}`).then((r) => r.json()),
      ])
      setHabits(hRes.habits ?? [])
      setLogs(lRes.logs ?? [])
    } finally {
      setLoading(false)
    }
  }, [since])

  useEffect(() => {
    load()
  }, [load])

  const toggle = useCallback(
    async (habitId: string, date: string) => {
      const existing = logs.find((l) => l.habit_id === habitId && l.log_date === date)
      const newCompleted = !(existing?.completed ?? false)

      // Optimistic update
      setLogs((prev) => {
        const without = prev.filter((l) => !(l.habit_id === habitId && l.log_date === date))
        return [...without, { id: existing?.id ?? "", habit_id: habitId, log_date: date, completed: newCompleted, created_at: "" }]
      })

      try {
        await fetch("/api/habits/logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ habit_id: habitId, log_date: date, completed: newCompleted }),
        })
      } catch {
        await load() // revert on error
      }
    },
    [logs, load]
  )

  const isLogged = (habitId: string, date: string) =>
    logs.find((l) => l.habit_id === habitId && l.log_date === date)?.completed ?? false

  const habitStreak = (habitId: string) => getHabitStreak(logs, habitId)

  return { habits, logs, loading, toggle, isLogged, habitStreak, weekDates }
}
