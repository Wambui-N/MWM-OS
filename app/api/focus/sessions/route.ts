import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { session_date, label, client_id, duration_mins, completed = true } = body

  if (!session_date || !duration_mins) {
    return NextResponse.json({ error: "session_date and duration_mins are required" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .insert({ session_date, label: label ?? null, client_id: client_id ?? null, duration_mins, completed })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ session: data }, { status: 201 })
}
