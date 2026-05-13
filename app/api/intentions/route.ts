import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("daily_intentions")
    .upsert(body, { onConflict: "intention_date" })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Award XP for logging intention
  try {
    await awardXP(supabase, 20)
  } catch {}

  return NextResponse.json({ intention: data }, { status: 201 })
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const date = searchParams.get("date")
  const supabase = createAdminClient()

  if (date) {
    const { data, error } = await supabase
      .from("daily_intentions")
      .select("*")
      .eq("intention_date", date)
      .single()
    if (error && error.code !== "PGRST116") return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ intention: data ?? null })
  }

  const { data, error } = await supabase.from("daily_intentions").select("*").order("intention_date", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ intentions: data })
}

async function awardXP(supabase: ReturnType<typeof createAdminClient>, amount: number) {
  const { data } = await supabase
    .from("user_prefs")
    .select("xp, level")
    .eq("user_email", process.env.AUTH_USERNAME!)
    .single()
  if (!data) return
  await supabase
    .from("user_prefs")
    .update({ xp: ((data as any).xp ?? 0) + amount })
    .eq("user_email", process.env.AUTH_USERNAME!)
}
