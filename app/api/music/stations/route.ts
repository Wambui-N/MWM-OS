import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("saved_stations")
    .select("*")
    .order("sort_order")
    .order("created_at")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ stations: data ?? [] })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, source, url, thumbnail_url, is_default, sort_order } = body

  if (!name || !source || !url) {
    return NextResponse.json({ error: "name, source, and url are required" }, { status: 400 })
  }
  if (!["spotify", "youtube"].includes(source)) {
    return NextResponse.json({ error: "source must be spotify or youtube" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("saved_stations")
    .insert({ name, source, url, thumbnail_url: thumbnail_url ?? null, is_default: is_default ?? false, sort_order: sort_order ?? 0 })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ station: data }, { status: 201 })
}
