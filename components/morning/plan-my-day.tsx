"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { X, Plus, GripVertical } from "lucide-react"
import { slideUp } from "@/lib/animations"
import type { TickItem, TaskItem, PlanProjectItem } from "@/types/database"
import { SchedulePreview } from "./schedule-preview"
import { toast } from "sonner"
import { useUIStore } from "@/stores/ui"
import { useTimerStore } from "@/stores/timer"
import { nanoid } from "@/lib/nanoid"

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="flex items-center gap-2 group"
    >
      <div {...attributes} {...listeners} className="cursor-grab text-border-strong hover:text-text-muted shrink-0">
        <GripVertical size={14} />
      </div>
      {children}
    </div>
  )
}

interface PlanMyDayProps {
  open: boolean
  onClose: () => void
  planDate: string
  initialPlan?: { ticks: TickItem[]; tasks: TaskItem[]; projects: PlanProjectItem[] }
}

const TASK_DURATIONS = [15, 30]
const PROJECT_DURATIONS = [60, 90, 120]

export function PlanMyDay({ open, onClose, planDate, initialPlan }: PlanMyDayProps) {
  const [ticks, setTicks] = useState<TickItem[]>(initialPlan?.ticks ?? [])
  const [tasks, setTasks] = useState<TaskItem[]>(initialPlan?.tasks ?? [])
  const [projects, setProjects] = useState<PlanProjectItem[]>(initialPlan?.projects ?? [])
  const [tickInput, setTickInput] = useState("")
  const [taskInput, setTaskInput] = useState("")
  const [taskDuration, setTaskDuration] = useState(30)
  const [projectInput, setProjectInput] = useState("")
  const [projectDuration, setProjectDuration] = useState(60)
  const [workStart, setWorkStart] = useState("09:00")
  const [step, setStep] = useState<"plan" | "preview">("plan")
  const [saving, setSaving] = useState(false)
  const { setPlanDoneToday } = useUIStore()
  const { setProjectSessions } = useTimerStore()

  // Re-populate when modal opens with an existing plan
  useEffect(() => {
    if (open && initialPlan) {
      setTicks(initialPlan.ticks)
      setTasks(initialPlan.tasks)
      setProjects(initialPlan.projects)
    }
    if (!open) {
      setStep("plan")
    }
  }, [open, initialPlan])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function addTick() {
    if (!tickInput.trim()) return
    setTicks((p) => [...p, { id: nanoid(), label: tickInput.trim(), done: false }])
    setTickInput("")
  }

  function addTask() {
    if (!taskInput.trim()) return
    setTasks((p) => [...p, { id: nanoid(), label: taskInput.trim(), duration_mins: taskDuration, done: false }])
    setTaskInput("")
  }

  function addProject() {
    if (!projectInput.trim()) return
    if (projects.length >= 2) return
    setProjects((p) => [...p, { id: nanoid(), label: projectInput.trim(), duration_mins: projectDuration, done: false }])
    setProjectInput("")
    // Wire pomodoro sessions (1 hr = 2 sessions)
    const totalSessions = Math.round(projectDuration / 30)
    setProjectSessions(0, totalSessions)
  }

  function handleDragEndTicks(e: DragEndEvent) {
    const { active, over } = e
    if (over && active.id !== over.id) {
      setTicks((items) => arrayMove(items, items.findIndex(i => i.id === active.id), items.findIndex(i => i.id === over.id)))
    }
  }

  function handleDragEndTasks(e: DragEndEvent) {
    const { active, over } = e
    if (over && active.id !== over.id) {
      setTasks((items) => arrayMove(items, items.findIndex(i => i.id === active.id), items.findIndex(i => i.id === over.id)))
    }
  }

  function handleDragEndProjects(e: DragEndEvent) {
    const { active, over } = e
    if (over && active.id !== over.id) {
      setProjects((items) => arrayMove(items, items.findIndex(i => i.id === active.id), items.findIndex(i => i.id === over.id)))
    }
  }

  async function savePlan() {
    setSaving(true)
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_date: planDate, ticks, tasks, projects }),
      })
      if (!res.ok) throw new Error()
      toast.success("Plan saved!", { icon: "✅" })
      setPlanDoneToday(true)
      onClose()
    } catch {
      toast.error("Couldn't save plan.")
    } finally {
      setSaving(false)
    }
  }

  const hasItems = ticks.length > 0 || tasks.length > 0 || projects.length > 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={slideUp}
          initial="hidden"
          animate="show"
          exit="exit"
          className="fixed inset-0 z-50 bg-bg-base overflow-y-auto"
        >
          <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2
                  className="text-4xl font-semibold text-text-primary"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Plan My Day
                </h2>
                <p className="text-sm text-text-muted mt-1">
                  What&apos;s happening today? Add your ticks, tasks, and deep work blocks.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-text-muted hover:bg-bg-subtle transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {step === "plan" ? (
              <>
                {/* Work start time */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-text-primary shrink-0">
                    Start work at
                  </label>
                  <input
                    type="time"
                    value={workStart}
                    onChange={(e) => setWorkStart(e.target.value)}
                    className="text-sm px-3 py-1.5 rounded-lg border border-border bg-bg-subtle text-text-primary outline-none focus:border-brand-accent transition-colors tabular-nums"
                  />
                </div>

                {/* Three lanes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Ticks */}
                  <LaneCard
                    title="⚡ Ticks"
                    subtitle="Up to 5 min each"
                    accent="#C97B1A"
                  >
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndTicks}>
                      <SortableContext items={ticks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                        {ticks.map((tick) => (
                          <SortableItem key={tick.id} id={tick.id}>
                            <span className="flex-1 text-sm text-text-primary">{tick.label}</span>
                            <button onClick={() => setTicks(p => p.filter(t => t.id !== tick.id))} className="shrink-0 text-text-muted hover:text-danger transition-colors">
                              <X size={12} />
                            </button>
                          </SortableItem>
                        ))}
                      </SortableContext>
                    </DndContext>
                    <div className="flex gap-1.5 mt-2">
                      <input
                        value={tickInput}
                        onChange={(e) => setTickInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addTick()}
                        placeholder="Add a tick..."
                        className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-bg-subtle outline-none focus:border-brand-accent text-text-primary placeholder:text-text-muted"
                      />
                      <button onClick={addTick} className="p-2 rounded-lg bg-brand-accent text-white hover:bg-brand-accent-hover transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                  </LaneCard>

                  {/* Tasks */}
                  <LaneCard title="📋 Tasks" subtitle="Up to 30 min each" accent="#2563EB">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndTasks}>
                      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                        {tasks.map((task) => (
                          <SortableItem key={task.id} id={task.id}>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-text-primary truncate block">{task.label}</span>
                              <span className="text-xs text-text-muted">{task.duration_mins} min</span>
                            </div>
                            <button onClick={() => setTasks(p => p.filter(t => t.id !== task.id))} className="shrink-0 text-text-muted hover:text-danger transition-colors">
                              <X size={12} />
                            </button>
                          </SortableItem>
                        ))}
                      </SortableContext>
                    </DndContext>
                    <div className="flex gap-1 mt-2">
                      {TASK_DURATIONS.map(d => (
                        <button
                          key={d}
                          onClick={() => setTaskDuration(d)}
                          className={`text-xs px-2 py-0.5 rounded-md border transition-colors ${
                            taskDuration === d
                              ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                              : "border-border bg-bg-subtle text-text-muted hover:border-border-strong"
                          }`}
                        >
                          {d}m
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        value={taskInput}
                        onChange={(e) => setTaskInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addTask()}
                        placeholder="Add a task..."
                        className="flex-1 min-w-0 text-xs px-3 py-2 rounded-lg border border-border bg-bg-subtle outline-none focus:border-brand-accent text-text-primary placeholder:text-text-muted"
                      />
                      <button onClick={addTask} className="shrink-0 p-2 rounded-lg bg-brand-accent text-white hover:bg-brand-accent-hover transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                  </LaneCard>

                  {/* Projects */}
                  <LaneCard
                    title="🏗 Projects"
                    subtitle="1–2 hrs deep work"
                    accent="var(--accent)"
                    badge={`${projects.length} / 2`}
                  >
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndProjects}>
                      <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                        {projects.map((project) => (
                          <SortableItem key={project.id} id={project.id}>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-text-primary truncate block">{project.label}</span>
                              <span className="text-xs text-text-muted">{project.duration_mins} min · {Math.round(project.duration_mins / 30)} sessions</span>
                            </div>
                            <button onClick={() => setProjects(p => p.filter(pr => pr.id !== project.id))} className="shrink-0 text-text-muted hover:text-danger transition-colors">
                              <X size={12} />
                            </button>
                          </SortableItem>
                        ))}
                      </SortableContext>
                    </DndContext>
                    <div className="flex gap-1 mt-2">
                      {PROJECT_DURATIONS.map(d => (
                        <button
                          key={d}
                          onClick={() => setProjectDuration(d)}
                          disabled={projects.length >= 2}
                          className={`text-xs px-2 py-0.5 rounded-md border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                            projectDuration === d
                              ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                              : "border-border bg-bg-subtle text-text-muted hover:border-border-strong"
                          }`}
                        >
                          {d === 60 ? "1h" : d === 90 ? "1.5h" : "2h"}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        value={projectInput}
                        onChange={(e) => setProjectInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addProject()}
                        placeholder={projects.length >= 2 ? "Two deep work blocks is plenty." : "Add a project..."}
                        disabled={projects.length >= 2}
                        className="flex-1 min-w-0 text-xs px-3 py-2 rounded-lg border border-border bg-bg-subtle outline-none focus:border-brand-accent text-text-primary placeholder:text-text-muted disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        onClick={addProject}
                        disabled={projects.length >= 2}
                        className="shrink-0 p-2 rounded-lg bg-brand-accent text-white hover:bg-brand-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </LaneCard>
                </div>

                {/* CTA */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-sm text-text-muted hover:bg-bg-subtle transition-colors"
                  >
                    Skip for now
                  </button>
                  <button
                    onClick={() => setStep("preview")}
                    disabled={!hasItems}
                    className="px-6 py-2.5 rounded-xl bg-brand-accent text-white font-medium text-sm hover:bg-brand-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Build My Schedule →
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <h3
                    className="text-2xl font-semibold text-text-primary"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Your schedule for today
                  </h3>
                  <p className="text-sm text-text-muted">Review and send to Google Calendar.</p>
                </div>

                <SchedulePreview
                  ticks={ticks}
                  tasks={tasks}
                  projects={projects}
                  planDate={planDate}
                  workStart={workStart}
                  onSent={savePlan}
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("plan")}
                    className="px-4 py-2.5 rounded-xl text-sm text-text-muted border border-border hover:bg-bg-subtle transition-colors"
                  >
                    ← Edit plan
                  </button>
                  <button
                    onClick={savePlan}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl border border-border text-sm font-medium text-text-primary hover:bg-bg-subtle transition-colors disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save without GCal"}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function LaneCard({
  title,
  subtitle,
  accent,
  badge,
  children,
}: {
  title: string
  subtitle: string
  accent: string
  badge?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-bg-card rounded-2xl border border-border p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-text-primary" style={{ color: accent }}>
            {title}
          </h3>
          <p className="text-xs text-text-muted">{subtitle}</p>
        </div>
        {badge && (
          <span className="text-xs font-mono px-2 py-0.5 rounded-full border border-border text-text-muted">
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-2 min-h-[60px]">{children}</div>
    </div>
  )
}
