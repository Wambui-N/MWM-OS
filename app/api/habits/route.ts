import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("active", true)
    .order("sort_order")
    .order("created_at")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ habits: data ?? [] })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("habits")
    .insert({ name: body.name, emoji: body.emoji ?? "✓", sort_order: body.sort_order ?? 0 })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ habit: data })
}
