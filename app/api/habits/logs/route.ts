import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const since = searchParams.get("since") ?? new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("habit_logs")
    .select("*")
    .gte("log_date", since)
    .order("log_date")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ logs: data ?? [] })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { habit_id, log_date, completed } = await req.json()
  const supabase = createAdminClient()

  // Upsert — toggle uses this
  const { data, error } = await supabase
    .from("habit_logs")
    .upsert({ habit_id, log_date, completed }, { onConflict: "habit_id,log_date" })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // XP when all habits complete for today
  if (completed) {
    const { data: allHabits } = await supabase.from("habits").select("id").eq("active", true)
    if (allHabits && allHabits.length > 0) {
      const { data: todayLogs } = await supabase
        .from("habit_logs")
        .select("completed")
        .eq("log_date", log_date)
        .in("habit_id", allHabits.map((h: any) => h.id))
      const allDone = todayLogs && todayLogs.length === allHabits.length && todayLogs.every((l: any) => l.completed)
      if (allDone) {
        await supabase.rpc("increment_xp", { amount: 20 })
      }
    }
  }

  return NextResponse.json({ log: data })
}
