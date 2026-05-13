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
  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .select("session_date, duration_mins")
    .eq("completed", true)
    .gte("session_date", sinceISO)
    .order("session_date")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Group by session_date in JS (avoids needing a DB function)
  const map = new Map<string, { total_mins: number; session_count: number }>()
  for (const row of data ?? []) {
    const existing = map.get(row.session_date) ?? { total_mins: 0, session_count: 0 }
    map.set(row.session_date, {
      total_mins: existing.total_mins + (row.duration_mins ?? 0),
      session_count: existing.session_count + 1,
    })
  }

  const days = Array.from(map.entries()).map(([date, v]) => ({ date, ...v }))
  return NextResponse.json({ days, since: sinceISO })
}
