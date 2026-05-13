import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase"
import { awardXP, checkDayMultiplier } from "@/lib/xp"
import type { DailyPlan, TickItem, TaskItem, PlanProjectItem } from "@/types/database"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { plan_date, type, id, done } = await req.json()
  const supabase = createAdminClient()

  const { data: plan, error: fetchError } = await supabase
    .from("daily_plans")
    .select("*")
    .eq("plan_date", plan_date)
    .single()

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

  const typedPlan = plan as DailyPlan
  let update: Partial<DailyPlan> = {}

  if (type === "tick") {
    update.ticks = typedPlan.ticks.map((t: TickItem) => t.id === id ? { ...t, done } : t)
  } else if (type === "task") {
    update.tasks = typedPlan.tasks.map((t: TaskItem) => t.id === id ? { ...t, done } : t)
  } else if (type === "project") {
    update.projects = typedPlan.projects.map((p: PlanProjectItem) => p.id === id ? { ...p, done } : p)
  }

  const { data: updated, error } = await supabase
    .from("daily_plans")
    .update(update)
    .eq("plan_date", plan_date)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const updatedPlan = updated as DailyPlan

  // XP for completing all ticks
  if (type === "tick" && done) {
    const allDone = updatedPlan.ticks.every((t: TickItem) => t.done)
    if (allDone) await awardXP(15)
  }

  // XP for completing all tasks
  if (type === "task" && done) {
    const allDone = updatedPlan.tasks.every((t: TaskItem) => t.done)
    if (allDone) {
      await awardXP(50)
      // Also check if this triggers the full-day multiplier bonus
      await checkDayMultiplier(updatedPlan)
    }
  }

  return NextResponse.json({ plan: updatedPlan })
}
