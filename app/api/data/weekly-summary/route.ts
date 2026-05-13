import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export async function GET(req: Request) {
  // Validate Make.com secret for cron-triggered requests
  const secret = req.headers.get("x-make-secret")
  if (secret !== process.env.MAKE_INCOMING_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoISO = weekAgo.toISOString().split("T")[0]

  const { data: clients } = await supabase.from("clients").select("stage, value_ksh, created_at")
  const { data: movedToActive } = await supabase
    .from("clients")
    .select("id")
    .eq("stage", "active")
    .gte("created_at", weekAgo.toISOString())

  const newLeads = (clients ?? []).filter(c => new Date(c.created_at) >= weekAgo).length
  const proposalsSent = (clients ?? []).filter(c => c.stage === "proposal_sent" && new Date(c.created_at) >= weekAgo).length
  const dealsClosed = movedToActive?.length ?? 0
  const revenue = (clients ?? [])
    .filter(c => (c.stage === "active" || c.stage === "completed") && new Date(c.created_at) >= weekAgo)
    .reduce((sum, c) => sum + (c.value_ksh ?? 0), 0)

  return NextResponse.json({
    week_start: weekAgoISO,
    new_leads: newLeads,
    proposals_sent: proposalsSent,
    deals_closed: dealsClosed,
    revenue_ksh: revenue,
  })
}
