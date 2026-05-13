import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase"
import { ContentClient } from "./content-client"

export default async function ContentPage() {
  const session = await auth()
  if (!session) redirect("/login")

  let posts: any[] = []
  let postingStreak = 0
  let postingStreakBest = 0
  let freezeCount = 1

  try {
    const supabase = createAdminClient()
    const [{ data: postsData }, { data: prefs }] = await Promise.all([
      supabase
        .from("content_posts")
        .select("*")
        .order("scheduled_date", { ascending: true, nullsFirst: false }),
      supabase
        .from("user_prefs")
        .select("posting_streak, posting_streak_best, posting_streak_freeze_count")
        .eq("user_email", process.env.AUTH_USERNAME!)
        .single(),
    ])
    posts = postsData ?? []
    postingStreak = (prefs as any)?.posting_streak ?? 0
    postingStreakBest = (prefs as any)?.posting_streak_best ?? 0
    freezeCount = (prefs as any)?.posting_streak_freeze_count ?? 1
  } catch {}

  return (
    <ContentClient
      initialPosts={posts}
      postingStreak={postingStreak}
      postingStreakBest={postingStreakBest}
      freezeCount={freezeCount}
    />
  )
}
