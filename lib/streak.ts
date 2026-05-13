import { startOfWeek, format, subDays } from "date-fns"
import type { ContentPost, HabitLog } from "@/types/database"

export function isCompletePostingWeek(posts: ContentPost[], weekStart: Date): boolean {
  const weekDays = [1, 2, 3, 4] // Mon=1, Tue=2, Wed=3, Thu=4
  return weekDays.every((day) =>
    posts.some((p) => {
      if (!p.posted_at) return false
      const d = new Date(p.posted_at)
      const ws = startOfWeek(d, { weekStartsOn: 1 })
      return ws.getTime() === weekStart.getTime() && d.getDay() === day
    })
  )
}

export function calculatePostingStreak(
  posts: ContentPost[],
  currentStreak: number,
  lastCompleteWeek: Date | null
): { streak: number; broke: boolean } {
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const lastWeekStart = new Date(thisWeekStart)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)

  const thisWeekComplete = isCompletePostingWeek(posts, thisWeekStart)

  if (thisWeekComplete) {
    const continued =
      lastCompleteWeek &&
      new Date(lastCompleteWeek).getTime() === lastWeekStart.getTime()
    return {
      streak: continued ? currentStreak + 1 : 1,
      broke: false,
    }
  }

  return { streak: currentStreak, broke: false }
}

export function getHabitStreak(logs: HabitLog[], habitId: string): number {
  const today = new Date()
  let streak = 0
  let date = today

  while (true) {
    const dateStr = format(date, "yyyy-MM-dd")
    const log = logs.find((l) => l.habit_id === habitId && l.log_date === dateStr)
    if (!log?.completed) break
    streak++
    date = subDays(date, 1)
  }

  return streak
}

export function getCurrentWeekDates(): string[] {
  const today = new Date()
  const monday = startOfWeek(today, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    return format(d, "yyyy-MM-dd")
  })
}
