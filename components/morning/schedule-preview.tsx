"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { stagger, fadeUp } from "@/lib/animations"
import type { TickItem, TaskItem, PlanProjectItem } from "@/types/database"
import { toast } from "sonner"

interface ScheduleBlock {
  label: string
  start: string
  end: string
  type: "ticks" | "task" | "project"
  items?: string[]
}

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number)
  const total = h * 60 + m + mins
  const nh = Math.floor(total / 60) % 24
  const nm = total % 60
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`
}

export function buildSchedule(
  ticks: TickItem[],
  tasks: TaskItem[],
  projects: PlanProjectItem[],
  workStart = "09:00"
): ScheduleBlock[] {
  const blocks: ScheduleBlock[] = []
  let cursor = workStart

  // Tick batch
  if (ticks.length > 0) {
    const end = addMinutes(cursor, 30)
    blocks.push({
      label: "⚡ Tick Batch",
      start: cursor,
      end,
      type: "ticks",
      items: ticks.map((t) => t.label),
    })
    cursor = end
  }

  // Tasks
  for (const task of tasks) {
    const dur = task.duration_mins ?? 30
    const end = addMinutes(cursor, dur)
    blocks.push({ label: `📋 ${task.label}`, start: cursor, end, type: "task" })
    cursor = end
  }

  // Buffer before projects
  if (projects.length > 0) {
    cursor = addMinutes(cursor, 15)
  }

  // Determine if we need post-lunch placement
  const [h] = cursor.split(":").map(Number)
  if (h >= 12 && h < 14) {
    cursor = "14:00"
  }

  for (const project of projects) {
    const dur = project.duration_mins ?? 60
    const end = addMinutes(cursor, dur)
    blocks.push({ label: `🏗 ${project.label}`, start: cursor, end, type: "project" })
    cursor = end
    cursor = addMinutes(cursor, 30) // gap between projects
  }

  return blocks
}

interface SchedulePreviewProps {
  ticks: TickItem[]
  tasks: TaskItem[]
  projects: PlanProjectItem[]
  planDate: string
  workStart?: string
  onSent: () => void
}

export function SchedulePreview({ ticks, tasks, projects, planDate, workStart = "09:00", onSent }: SchedulePreviewProps) {
  const [sending, setSending] = useState(false)
  const blocks = buildSchedule(ticks, tasks, projects, workStart)

  async function sendToGCal() {
    setSending(true)
    try {
      const res = await fetch("/api/webhooks/outgoing/schedule-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_date: planDate, ticks, tasks, projects, blocks }),
      })
      if (!res.ok) throw new Error()
      toast.success("Schedule sent to Google Calendar!", { icon: "📅" })
      onSent()
    } catch {
      toast.error("Couldn't send to GCal. Try again.")
    } finally {
      setSending(false)
    }
  }

  const typeColors: Record<string, string> = {
    ticks: "#C97B1A",
    task: "#2563EB",
    project: "var(--accent)",
  }

  return (
    <div className="space-y-4">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
        {blocks.map((block, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="flex items-start gap-4 px-4 py-3 rounded-xl border border-border bg-bg-card"
          >
            <div className="w-20 shrink-0 text-xs font-medium text-text-muted mt-0.5 tabular-nums">
              {block.start} – {block.end}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-sm font-medium"
                style={{ color: typeColors[block.type] }}
              >
                {block.label}
              </div>
              {block.items && block.items.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {block.items.map((it, j) => (
                    <li key={j} className="text-xs text-text-muted">
                      · {it}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {blocks.length === 0 && (
        <p className="text-sm text-text-muted text-center py-8">
          Add some items to your plan to see the schedule.
        </p>
      )}

      {blocks.length > 0 && (
        <button
          onClick={sendToGCal}
          disabled={sending}
          className="w-full py-3 rounded-xl bg-brand-accent text-white font-medium text-sm hover:bg-brand-accent-hover transition-colors disabled:opacity-60"
        >
          {sending ? "Sending to GCal..." : "📅 Send to Google Calendar"}
        </button>
      )}
    </div>
  )
}
