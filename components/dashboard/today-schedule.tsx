"use client"

import { motion } from "framer-motion"
import { fadeUp } from "@/lib/animations"
import type { DailyPlan, TickItem, TaskItem, PlanProjectItem } from "@/types/database"
import { cn } from "@/lib/utils"
import confetti from "canvas-confetti"
import { toast } from "sonner"
import { Pencil } from "lucide-react"

interface TodayScheduleProps {
  plan: DailyPlan | null
  onEdit?: () => void
}

function fireConfetti() {
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#E5401A", "#C97B1A", "#2D7A4F"] })
}

export function TodaySchedule({ plan, onEdit }: TodayScheduleProps) {
  if (!plan) {
    return (
      <div className="bg-bg-card rounded-2xl border border-dashed border-border p-6 text-center space-y-3">
        <p className="text-sm text-text-muted">No plan for today yet. Head to the morning flow to plan your day.</p>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-sm font-medium text-brand-accent hover:text-brand-accent-hover transition-colors"
          >
            + Plan my day
          </button>
        )}
      </div>
    )
  }

  const allTicksDone = plan.ticks.every(t => t.done)
  const allTasksDone = plan.tasks.every(t => t.done)

  async function toggleItem(type: "tick" | "task" | "project", id: string, done: boolean) {
    try {
      await fetch("/api/plans/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_date: plan!.plan_date, type, id, done: !done }),
      })
      if (type === "tick" && plan!.ticks.every(t => t.id === id ? !done : t.done) && !allTicksDone) {
        fireConfetti()
        toast.success("Tick batch done! 🔥", { icon: "⚡" })
      }
      if (type === "task" && plan!.tasks.every(t => t.id === id ? !done : t.done) && !allTasksDone) {
        fireConfetti()
        toast.success("All focus tasks complete! Built different.", { icon: "🏆" })
      }
    } catch (e) {
      toast.error("Couldn't update item")
    }
  }

  return (
    <motion.div variants={fadeUp} className="bg-bg-card rounded-2xl border border-border p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Today&apos;s Schedule</h3>
        <div className="flex items-center gap-3">
          {plan.gcal_synced && (
            <span className="text-xs text-success font-medium">✓ Synced to GCal</span>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors"
              title="Edit plan"
            >
              <Pencil size={12} />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Ticks */}
      {plan.ticks.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-warning uppercase tracking-wide">⚡ Ticks</p>
          {plan.ticks.map((tick: TickItem) => (
            <label
              key={tick.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={tick.done}
                onChange={() => toggleItem("tick", tick.id, tick.done)}
                className="w-4 h-4 rounded border-border accent-brand-accent"
              />
              <span className={cn("text-sm transition-colors", tick.done ? "line-through text-text-muted" : "text-text-primary")}>
                {tick.label}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Tasks */}
      {plan.tasks.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">📋 Tasks</p>
          {plan.tasks.map((task: TaskItem) => (
            <label key={task.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleItem("task", task.id, task.done)}
                className="w-4 h-4 rounded border-border accent-brand-accent"
              />
              <div className="flex-1 min-w-0">
                <span className={cn("text-sm transition-colors", task.done ? "line-through text-text-muted" : "text-text-primary")}>
                  {task.label}
                </span>
                <span className="text-xs text-text-muted ml-2">{task.duration_mins}m</span>
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Projects */}
      {plan.projects.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-brand-accent uppercase tracking-wide">🏗 Deep Work</p>
          {plan.projects.map((project: PlanProjectItem) => (
            <label key={project.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={project.done}
                onChange={() => toggleItem("project", project.id, project.done)}
                className="w-4 h-4 rounded border-border accent-brand-accent"
              />
              <div className="flex-1 min-w-0">
                <span className={cn("text-sm transition-colors", project.done ? "line-through text-text-muted" : "text-text-primary")}>
                  {project.label}
                </span>
                <span className="text-xs text-text-muted ml-2">{project.duration_mins}m</span>
              </div>
            </label>
          ))}
        </div>
      )}
    </motion.div>
  )
}
