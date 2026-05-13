"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { useHabits } from "@/hooks/use-habits"
import { cn } from "@/lib/utils"

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]

export function HabitTracker() {
  const { habits, loading, toggle, isLogged, habitStreak, weekDates } = useHabits()

  if (loading) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-4">
        <div className="h-24 animate-pulse bg-bg-subtle rounded-lg" />
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-4 flex items-center justify-between">
        <p className="text-sm text-text-muted">No habits defined yet.</p>
        <Link href="/settings#habits" className="text-xs text-brand-accent hover:underline">
          Add habits →
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-card border border-border rounded-xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
          Daily Habits
        </h3>
        <Link href="/settings#habits" className="text-xs text-text-muted hover:text-text-primary transition-colors">
          Manage
        </Link>
      </div>

      <div
        className="grid gap-x-2 gap-y-2 items-center"
        style={{ gridTemplateColumns: "1fr repeat(7, 28px)" }}
      >
        {/* Day headers */}
        <span />
        {DAY_LABELS.map((d, i) => (
          <span key={i} className="text-[10px] text-text-muted text-center font-medium">
            {d}
          </span>
        ))}

        {/* Habit rows */}
        {habits.map((habit) => {
          const streak = habitStreak(habit.id)
          return (
            <>
              {/* Habit label */}
              <div key={`label-${habit.id}`} className="flex items-center gap-1.5 min-w-0">
                <span className="text-base leading-none">{habit.emoji}</span>
                <span className="text-sm text-text-primary truncate">{habit.name}</span>
                {streak > 0 && (
                  <span className="text-[10px] text-brand-accent ml-auto shrink-0">
                    {streak}🔥
                  </span>
                )}
              </div>

              {/* Day toggles */}
              {weekDates.map((date, di) => {
                const done = isLogged(habit.id, date)
                const isToday = date === format(new Date(), "yyyy-MM-dd")
                return (
                  <motion.button
                    key={`${habit.id}-${date}`}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => toggle(habit.id, date)}
                    title={format(parseISO(date), "EEE d MMM")}
                    className={cn(
                      "w-7 h-7 rounded-md border text-xs transition-colors flex items-center justify-center",
                      done
                        ? "bg-brand-accent border-brand-accent text-white"
                        : isToday
                        ? "border-brand-accent/40 hover:border-brand-accent bg-transparent"
                        : "border-border hover:border-border-strong bg-transparent"
                    )}
                  >
                    {done ? "✓" : ""}
                  </motion.button>
                )
              })}
            </>
          )
        })}
      </div>
    </motion.div>
  )
}
