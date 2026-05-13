import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase"
import { startOfWeek, format } from "date-fns"

function getMonday() {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd")
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("weekly_challenges")
    .select("*")
    .eq("week_start", getMonday())
    .single()

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ challenge: data ?? null })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("weekly_challenges")
    .upsert({ ...body, week_start: getMonday() }, { onConflict: "week_start" })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ challenge: data })
}
