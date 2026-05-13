import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { amount } = await req.json()
  if (!amount || amount <= 0) return NextResponse.json({ ok: true })

  const supabase = createAdminClient()
  const { data } = await supabase
    .from("user_prefs")
    .select("xp")
    .eq("user_email", process.env.AUTH_USERNAME!)
    .single()

  if (data) {
    await supabase
      .from("user_prefs")
      .update({ xp: ((data as any).xp ?? 0) + amount })
      .eq("user_email", process.env.AUTH_USERNAME!)
  }

  return NextResponse.json({ ok: true })
}
