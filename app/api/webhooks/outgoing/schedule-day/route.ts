import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { triggerMake } from "@/lib/make-webhooks"
import { createAdminClient } from "@/lib/supabase"
import { buildSchedule } from "@/components/morning/schedule-preview"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { plan_date, ticks, tasks, projects } = body
  const blocks = buildSchedule(ticks, tasks, projects)

  // Save plan to DB
  const supabase = createAdminClient()
  await supabase.from("daily_plans").upsert(
    { plan_date, ticks, tasks, projects },
    { onConflict: "plan_date" }
  )

  // Build Make payload
  const payload = {
    plan_date,
    tick_batch: ticks.length > 0 ? {
      start: blocks.find(b => b.type === "ticks")?.start ?? "09:00",
      duration_mins: 30,
      items: ticks.map((t: any) => t.label),
    } : null,
    tasks: tasks.map((t: any) => ({
      id: t.id,
      label: t.label,
      start: blocks.find(b => b.label.includes(t.label))?.start ?? "",
      duration_mins: t.duration_mins,
    })),
    projects: projects.map((p: any) => ({
      id: p.id,
      label: p.label,
      start: blocks.find(b => b.label.includes(p.label))?.start ?? "",
      duration_mins: p.duration_mins,
    })),
  }

  const result = await triggerMake("MAKE_WEBHOOK_SCHEDULE", payload)

  return NextResponse.json({ ok: true, result })
}
