import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase"
import { awardXP } from "@/lib/xp"
import { startOfWeek, format } from "date-fns"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("weekly_reviews")
    .select("*")
    .order("week_start", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reviews: data ?? [] })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd")
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("weekly_reviews")
    .upsert({ ...body, week_start: weekStart, xp_awarded: true }, { onConflict: "week_start" })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Award XP for weekly review (only once per week)
  if (!body.already_awarded) {
    await awardXP(100)
  }

  return NextResponse.json({ review: data })
}
