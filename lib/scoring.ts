import { format } from "date-fns"
import type { DailyPlan, DailyIntention, ContentPost, DayGrade, TickItem, TaskItem, PlanProjectItem } from "@/types/database"

export interface DayScore {
  score: number
  grade: DayGrade
  isPerfect: boolean
  breakdown: Record<string, number>
}

export function calculateDayScore(
  plan: DailyPlan | null,
  intention: DailyIntention | null,
  posts: ContentPost[]
): DayScore {
  let score = 0
  const breakdown: Record<string, number> = {}

  const ticks = (plan?.ticks ?? []) as TickItem[]
  if (ticks.length > 0 && ticks.every((t) => t.done)) {
    score += 20
    breakdown.ticks = 20
  }

  const tasks = (plan?.tasks ?? []) as TaskItem[]
  if (tasks.length > 0 && tasks.every((t) => t.done)) {
    score += 30
    breakdown.tasks = 30
  }

  const projects = (plan?.projects ?? []) as PlanProjectItem[]
  if (projects.some((p) => p.done)) {
    score += 30
    breakdown.projects = 30
  }

  if (intention) {
    score += 10
    breakdown.intention = 10
  }

  const today = format(new Date(), "yyyy-MM-dd")
  if (posts.some((p) => p.posted_at?.startsWith(today))) {
    score += 10
    breakdown.post = 10
  }

  const grade: DayGrade =
    score >= 90 ? "A+" :
    score >= 80 ? "A" :
    score >= 65 ? "B" :
    score >= 50 ? "C" : "D"

  return { score, grade, isPerfect: score === 100, breakdown }
}
