import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const months = Math.min(Number(searchParams.get("months") ?? "6"), 12)

  const since = new Date()
  since.setMonth(since.getMonth() - months)
  const sinceISO = since.toISOString().split("T")[0]

  const supabase = createAdminClient()

  // Fetch pomodoro sessions and daily plans in parallel
  const [{ data: sessionRows, error: sessError }, { data: planRows, error: planError }] =
    await Promise.all([
      supabase
        .from("pomodoro_sessions")
        .select("session_date, duration_mins")
        .eq("completed", true)
        .gte("session_date", sinceISO)
        .order("session_date"),
      supabase
        .from("daily_plans")
        .select("plan_date, daily_score, daily_grade, is_perfect_day")
        .gte("plan_date", sinceISO),
    ])

  if (sessError) return NextResponse.json({ error: sessError.message }, { status: 500 })
  if (planError) return NextResponse.json({ error: planError.message }, { status: 500 })

  // Build score map from daily_plans
  const scoreMap = new Map<string, { daily_score: number | null; daily_grade: string | null; is_perfect_day: boolean }>()
  for (const row of planRows ?? []) {
    scoreMap.set(row.plan_date, {
      daily_score: row.daily_score,
      daily_grade: row.daily_grade,
      is_perfect_day: row.is_perfect_day ?? false,
    })
  }

  // Group sessions by date
  const map = new Map<string, { total_mins: number; session_count: number }>()
  for (const row of sessionRows ?? []) {
    const existing = map.get(row.session_date) ?? { total_mins: 0, session_count: 0 }
    map.set(row.session_date, {
      total_mins: existing.total_mins + (row.duration_mins ?? 0),
      session_count: existing.session_count + 1,
    })
  }

  // Merge with score data
  const days = Array.from(map.entries()).map(([date, v]) => ({
    date,
    ...v,
    ...(scoreMap.get(date) ?? { daily_score: null, daily_grade: null, is_perfect_day: false }),
  }))

  return NextResponse.json({ days, since: sinceISO })
}
