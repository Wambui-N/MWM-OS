import { createAdminClient } from "@/lib/supabase"

const USER_EMAIL = () => process.env.AUTH_USERNAME!

/**
 * Central server-side XP award function.
 * Uses the increment_xp RPC to avoid read-modify-write races.
 */
export async function awardXP(base: number, multiplier = 1): Promise<number> {
  if (base <= 0) return 0
  const actual = Math.round(base * multiplier)
  const supabase = createAdminClient()
  await supabase.rpc("increment_xp", { amount: actual })
  return actual
}

/**
 * Get current XP for the user.
 */
export async function getXP(): Promise<number> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("user_prefs")
    .select("xp")
    .eq("user_email", USER_EMAIL())
    .single()
  return (data as any)?.xp ?? 0
}

/**
 * Check day multiplier: all ticks + all tasks + at least one project done → bonus XP.
 */
export async function checkDayMultiplier(plan: {
  ticks: { done: boolean }[]
  tasks: { done: boolean }[]
  projects: { done: boolean }[]
}): Promise<number> {
  const allTicks = plan.ticks.length > 0 && plan.ticks.every((t) => t.done)
  const allTasks = plan.tasks.length > 0 && plan.tasks.every((t) => t.done)
  const anyProject = plan.projects.some((p) => p.done)

  if (allTicks && allTasks && anyProject) {
    return await awardXP(50, 1.5) // 75 XP for a perfect task day
  }
  return 0
}
