import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase"
import { calculatePostingStreak } from "@/lib/streak"
import { awardXP } from "@/lib/xp"
import type { ContentPost } from "@/types/database"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const supabase = createAdminClient()

  // Auto-set posted_at when marking as posted
  const update = { ...body }
  if (body.status === "posted" && !body.posted_at) {
    update.posted_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from("content_posts")
    .update(update)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update posting streak when a post is marked as posted
  if (body.status === "posted") {
    try {
      // Fetch all posted posts for streak calculation
      const { data: allPosts } = await supabase
        .from("content_posts")
        .select("posted_at")
        .eq("status", "posted")
        .not("posted_at", "is", null)

      const { data: prefs } = await supabase
        .from("user_prefs")
        .select("posting_streak, posting_streak_best, last_complete_post_week")
        .eq("user_email", process.env.AUTH_USERNAME!)
        .single()

      if (prefs && allPosts) {
        const lastCompleteWeek = (prefs as any).last_complete_post_week
          ? new Date((prefs as any).last_complete_post_week)
          : null
        const { streak } = calculatePostingStreak(
          allPosts as ContentPost[],
          (prefs as any).posting_streak ?? 0,
          lastCompleteWeek
        )
        const newBest = Math.max(streak, (prefs as any).posting_streak_best ?? 0)
        await supabase
          .from("user_prefs")
          .update({ posting_streak: streak, posting_streak_best: newBest })
          .eq("user_email", process.env.AUTH_USERNAME!)
      }

      // Award XP for posting
      await awardXP(10)
    } catch {
      // Non-fatal
    }
  }

  // Trigger GCal for newly scheduled posts
  if (body.status === "scheduled" && body.hook && body.scheduled_date) {
    fetch(`${process.env.NEXTAUTH_URL ?? ""}/api/webhooks/outgoing/schedule-post`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: id, hook: body.hook, scheduled_date: body.scheduled_date }),
    }).catch(() => {})
  }

  return NextResponse.json({ post: data })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const supabase = createAdminClient()
  const { error } = await supabase.from("content_posts").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
