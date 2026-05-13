import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("content_posts").select("*").order("scheduled_date", { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ posts: data })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("content_posts")
    .insert({
      hook: body.hook || null,
      body: body.body || null,
      pillar: body.pillar || null,
      status: body.status ?? "draft",
      scheduled_date: body.scheduled_date || null,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Award XP for scheduling a post
  if (body.status === "scheduled") {
    try {
      const { data: prefs } = await supabase.from("user_prefs").select("xp").eq("user_email", process.env.AUTH_USERNAME!).single()
      if (prefs) await supabase.from("user_prefs").update({ xp: (prefs.xp ?? 0) + 10 }).eq("user_email", process.env.AUTH_USERNAME!)
    } catch {}

    // Trigger GCal webhook if hook and date are set
    if (body.hook && body.scheduled_date) {
      fetch(`${process.env.NEXTAUTH_URL ?? ""}/api/webhooks/outgoing/schedule-post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: data.id, hook: body.hook, scheduled_date: body.scheduled_date }),
      }).catch(() => {})
    }
  }

  return NextResponse.json({ post: data }, { status: 201 })
}
