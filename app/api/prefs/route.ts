import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase"

const DEFAULT_PREFS = {
  user_email: process.env.AUTH_USERNAME!,
  xp: 0,
  level: 1,
  theme: "light",
  work_duration: 25,
  break_duration: 5,
  long_break_duration: 15,
  daily_goal_sessions: 8,
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("user_prefs")
    .select("*")
    .eq("user_email", process.env.AUTH_USERNAME!)
    .single()

  // PGRST116 = no rows found — seed defaults on first visit
  if (error?.code === "PGRST116") {
    const { data: seeded } = await supabase
      .from("user_prefs")
      .insert(DEFAULT_PREFS)
      .select()
      .single()
    return NextResponse.json({ prefs: seeded ?? DEFAULT_PREFS })
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ prefs: data })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("user_prefs")
    .upsert({ ...body, user_email: process.env.AUTH_USERNAME! }, { onConflict: "user_email" })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ prefs: data })
}
