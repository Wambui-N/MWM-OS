import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase"
import { ContentClient } from "./content-client"

export default async function ContentPage() {
  const session = await auth()
  if (!session) redirect("/login")

  let posts: any[] = []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from("content_posts")
      .select("*")
      .order("scheduled_date", { ascending: true, nullsFirst: false })
    posts = data ?? []
  } catch {}

  return <ContentClient initialPosts={posts} />
}
