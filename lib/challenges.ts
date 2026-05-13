import { createAdminClient } from "@/lib/supabase"
import { awardXP } from "@/lib/xp"
import { startOfWeek, format } from "date-fns"
import confetti from "canvas-confetti"

function getMonday() {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd")
}

/**
 * Increment progress for the current week's challenge if the trigger_type matches.
 * Call this server-side from action handlers (toggle, post publish, etc.).
 */
export async function updateChallengeProgress(triggerType: string, increment = 1) {
  const supabase = createAdminClient()
  const weekStart = getMonday()

  const { data: challenge } = await supabase
    .from("weekly_challenges")
    .select("*")
    .eq("week_start", weekStart)
    .eq("trigger_type", triggerType)
    .single()

  if (!challenge || (challenge as any).completed) return

  const newProgress = (challenge as any).current_progress + increment
  const nowComplete = newProgress >= (challenge as any).trigger_threshold

  await supabase
    .from("weekly_challenges")
    .update({ current_progress: newProgress, completed: nowComplete })
    .eq("id", (challenge as any).id)

  if (nowComplete) {
    await awardXP((challenge as any).xp_bonus)
  }
}
