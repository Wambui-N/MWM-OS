import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export async function POST(req: Request) {
  const secret = req.headers.get("x-make-secret")
  if (secret !== process.env.MAKE_INCOMING_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const supabase = createAdminClient()

  try {
    // Handle Drive folder URL callback
    if (body.client_id && body.drive_folder_url) {
      await supabase
        .from("clients")
        .update({ drive_folder_url: body.drive_folder_url })
        .eq("id", body.client_id)
    }

    // Handle GCal event IDs for daily plan
    if (body.gcal_events && Array.isArray(body.gcal_events)) {
      for (const { plan_date, item_id, gcal_event_id, type } of body.gcal_events) {
        if (!plan_date) continue
        const { data: plan } = await supabase
          .from("daily_plans")
          .select("*")
          .eq("plan_date", plan_date)
          .single()

        if (!plan) continue

        const update: Record<string, any> = { gcal_synced: true }
        if (type === "task") {
          update.tasks = plan.tasks.map((t: any) =>
            t.id === item_id ? { ...t, gcal_event_id } : t
          )
        } else if (type === "project") {
          update.projects = plan.projects.map((p: any) =>
            p.id === item_id ? { ...p, gcal_event_id } : p
          )
        } else if (type === "tick_batch") {
          update.schedule_sent_at = new Date().toISOString()
        }
        await supabase.from("daily_plans").update(update).eq("plan_date", plan_date)
      }
    }

    // Handle content post GCal event ID
    if (body.post_id && body.gcal_event_id) {
      await supabase
        .from("content_posts")
        .update({ gcal_event_id: body.gcal_event_id })
        .eq("id", body.post_id)
    }

    // Handle proposal URL
    if (body.client_id && body.proposal_url) {
      const { data: client } = await supabase.from("clients").select("notes").eq("id", body.client_id).single()
      const newNotes = `${client?.notes ?? ""}\n\n[Proposal] ${body.proposal_url}`.trim()
      await supabase.from("clients").update({ notes: newNotes }).eq("id", body.client_id)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[Incoming webhook]", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
