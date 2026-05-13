import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase"
import { todayISODate, daysBetween, isMonday } from "@/lib/utils"
import { calculateDayScore } from "@/lib/scoring"
import { DashboardClient } from "./dashboard-client"
import type { ClientStage, DailyPlan, DailyIntention, ContentPost } from "@/types/database"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  let stats = {
    pipelineValue: 0,
    proposalsOut: 0,
    activeClients: 0,
    postsThisWeek: 0,
  }
  let stageCounts: Partial<Record<ClientStage, number>> = {}
  let staleLeads: any[] = []
  let todayPlan: any = null
  let weekPosts: any[] = []
  let userXP = 0
  let todayIntention: any = null

  try {
    const supabase = createAdminClient()
    const today = todayISODate()

    // Clients
    const { data: clients } = await supabase
      .from("clients")
      .select("id, name, company, stage, value_ksh, last_contact")
      .order("created_at", { ascending: false })

    if (clients) {
      for (const c of clients) {
        const stage = c.stage as ClientStage
        stageCounts[stage] = (stageCounts[stage] ?? 0) + 1
        if (stage === "active" || stage === "negotiation") {
          stats.pipelineValue += c.value_ksh ?? 0
        }
        if (stage === "proposal_sent") stats.proposalsOut++
        if (stage === "active") stats.activeClients++
      }

      // Stale leads: last_contact > 7 days, stage not active/completed/lost
      const STALE_STAGES: ClientStage[] = ["lead", "discovery", "proposal_sent", "negotiation"]
      staleLeads = clients.filter((c) => {
        if (!STALE_STAGES.includes(c.stage as ClientStage)) return false
        if (!c.last_contact) return true
        return daysBetween(c.last_contact, today) > 7
      }).slice(0, 5)
    }

    // Today's plan
    const { data: planData } = await supabase
      .from("daily_plans")
      .select("*")
      .eq("plan_date", today)
      .single()
    todayPlan = planData ?? null

    // Today's intention
    const { data: intention } = await supabase
      .from("daily_intentions")
      .select("*")
      .eq("intention_date", today)
      .single()
    todayIntention = intention ?? null

    // Week posts
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const { data: posts } = await supabase
      .from("content_posts")
      .select("*")
      .gte("scheduled_date", weekStart.toISOString().split("T")[0])
      .lte("scheduled_date", weekEnd.toISOString().split("T")[0])
      .order("scheduled_date")
    weekPosts = posts ?? []
    stats.postsThisWeek = weekPosts.length

    // User XP + prefs
    const { data: prefs } = await supabase
      .from("user_prefs")
      .select("xp, posting_streak, monthly_revenue_target")
      .eq("user_email", process.env.AUTH_USERNAME!)
      .single()
    userXP = prefs?.xp ?? 0

    // Today's content posts for score calculation
    const { data: todayPosts } = await supabase
      .from("content_posts")
      .select("posted_at, status")
      .eq("status", "posted")
    
    // Compute today's live score
    const scoreResult = calculateDayScore(
      todayPlan as DailyPlan | null,
      todayIntention as DailyIntention | null,
      (todayPosts ?? []) as ContentPost[]
    )

    // Revenue from active/completed clients
    const { data: revenueClients } = await supabase
      .from("clients")
      .select("value_ksh, stage")
      .in("stage", ["active", "completed"])
    const currentRevenue = (revenueClients ?? []).reduce((s: number, c: any) => s + (c.value_ksh ?? 0), 0)

    return (
      <DashboardClient
        stats={stats}
        stageCounts={stageCounts}
        staleLeads={staleLeads}
        todayPlan={todayPlan}
        weekPosts={weekPosts}
        userXP={userXP}
        todayIntention={todayIntention}
        isMonday={isMonday()}
        todayScore={scoreResult.score}
        todayGrade={scoreResult.grade}
        postingStreak={(prefs as any)?.posting_streak ?? 0}
        monthlyRevenueTarget={(prefs as any)?.monthly_revenue_target ?? 0}
        currentRevenue={currentRevenue}
      />
    )
  } catch {
    // DB not connected yet — graceful degradation
  }

  return (
    <DashboardClient
      stats={stats}
      stageCounts={stageCounts}
      staleLeads={staleLeads}
      todayPlan={todayPlan}
      weekPosts={weekPosts}
      userXP={userXP}
      todayIntention={todayIntention}
      isMonday={isMonday()}
      todayScore={null}
      todayGrade={null}
      postingStreak={0}
      monthlyRevenueTarget={0}
      currentRevenue={0}
    />
  )
}
