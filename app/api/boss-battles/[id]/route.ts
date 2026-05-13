import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase"
import { awardXP } from "@/lib/xp"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("boss_battles")
    .update(body)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Award XP and mark project complete when boss is won
  if (body.is_won) {
    await awardXP(150)
    if ((data as any).project_id) {
      await supabase
        .from("projects")
        .update({ status: "completed" })
        .eq("id", (data as any).project_id)
    }
  }

  return NextResponse.json({ battle: data })
}
