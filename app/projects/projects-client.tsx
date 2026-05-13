"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { stagger, fadeUp } from "@/lib/animations"
import type { Project, Client } from "@/types/database"
import { ExternalLink, Plus, CheckSquare, Square } from "lucide-react"
import { toast } from "sonner"
import { formatDateShort } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { BossBattleToggle } from "@/components/projects/boss-battle-toggle"

const STATUS_STYLES = {
  active:    { label: "Active",    bg: "bg-brand-accent/10", text: "text-brand-accent" },
  paused:    { label: "Paused",    bg: "bg-warning/10", text: "text-warning" },
  completed: { label: "Completed", bg: "bg-success/10", text: "text-success" },
}

interface Milestone { id: string; label: string; done: boolean }

interface ProjectsClientProps {
  initialProjects: (Project & { clients?: { name: string; company: string | null } | null })[]
  clients: Pick<Client, "id" | "name" | "company">[]
}

export function ProjectsClient({ initialProjects, clients }: ProjectsClientProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [showAdd, setShowAdd] = useState(false)
  const [newProject, setNewProject] = useState({ name: "", client_id: "", due_date: "" })
  const [saving, setSaving] = useState(false)

  async function addProject() {
    if (!newProject.name.trim()) return toast.error("Name is required")
    setSaving(true)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      })
      if (!res.ok) throw new Error()
      const { project } = await res.json()
      setProjects((p) => [project, ...p])
      toast.success("Project added!")
      setShowAdd(false)
      setNewProject({ name: "", client_id: "", due_date: "" })
    } catch {
      toast.error("Couldn't add project")
    } finally {
      setSaving(false)
    }
  }

  async function toggleMilestone(project: Project, milestoneId: string) {
    const milestones = (project.milestones as unknown as Milestone[]).map((m) =>
      m.id === milestoneId ? { ...m, done: !m.done } : m
    )
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestones }),
      })
      if (!res.ok) throw new Error()
      const { project: updated } = await res.json()
      setProjects((p) => p.map((pr) => (pr.id === updated.id ? updated : pr)))
    } catch {
      toast.error("Couldn't update milestone")
    }
  }

  async function addMilestone(project: Project, label: string) {
    if (!label.trim()) return
    const milestones = [
      ...(project.milestones as unknown as Milestone[]),
      { id: Math.random().toString(36).slice(2), label: label.trim(), done: false },
    ]
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestones }),
      })
      if (!res.ok) throw new Error()
      const { project: updated } = await res.json()
      setProjects((p) => p.map((pr) => (pr.id === updated.id ? updated : pr)))
    } catch {
      toast.error("Couldn't add milestone")
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">{projects.length} projects</p>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-accent text-white text-sm font-medium hover:bg-brand-accent-hover transition-colors"
        >
          <Plus size={16} /> Add Project
        </button>
      </div>

      {/* Add project form */}
      {showAdd && (
        <div className="bg-bg-card rounded-2xl border border-border p-5 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">New Project</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              value={newProject.name}
              onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))}
              placeholder="Project name *"
              className="px-3 py-2 rounded-lg border border-border bg-bg-subtle text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-accent"
            />
            <select
              value={newProject.client_id}
              onChange={(e) => setNewProject((p) => ({ ...p, client_id: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-border bg-bg-subtle text-sm text-text-primary outline-none focus:border-brand-accent"
            >
              <option value="">No client</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input
              type="date"
              value={newProject.due_date}
              onChange={(e) => setNewProject((p) => ({ ...p, due_date: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-border bg-bg-subtle text-sm text-text-primary outline-none focus:border-brand-accent"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={addProject} disabled={saving} className="px-4 py-2 rounded-xl bg-brand-accent text-white text-xs font-medium hover:bg-brand-accent-hover transition-colors disabled:opacity-60">
              {saving ? "Adding..." : "Add"}
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl border border-border text-xs text-text-muted hover:bg-bg-subtle transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Projects list */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        {projects.map((project) => {
          const milestones = (project.milestones ?? []) as unknown as Milestone[]
          const style = STATUS_STYLES[project.status]
          return (
            <motion.div
              key={project.id}
              variants={fadeUp}
              className="bg-bg-card rounded-2xl border border-border p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <h3 className="text-base font-semibold text-text-primary">{project.name}</h3>
                  {(project as any).clients && (
                    <p className="text-xs text-text-muted">
                      {(project as any).clients.name}
                      {(project as any).clients.company && ` · ${(project as any).clients.company}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  {project.status === "active" && (
                    <BossBattleToggle
                      project={project}
                      onActivated={() => toast.success("Boss Battle active! Check your dashboard.")}
                    />
                  )}
                  <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", style.bg, style.text)}>
                    {style.label}
                  </span>
                  {project.due_date && (
                    <span className="text-xs text-text-muted">Due {formatDateShort(project.due_date)}</span>
                  )}
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-2">
                {milestones.map((m) => (
                  <label key={m.id} className="flex items-center gap-2.5 cursor-pointer group">
                    <button onClick={() => toggleMilestone(project, m.id)} className="shrink-0 text-text-muted group-hover:text-brand-accent">
                      {m.done ? <CheckSquare size={16} className="text-success" /> : <Square size={16} />}
                    </button>
                    <span className={cn("text-sm", m.done ? "line-through text-text-muted" : "text-text-primary")}>
                      {m.label}
                    </span>
                  </label>
                ))}
                <MilestoneInput onAdd={(label) => addMilestone(project, label)} />
              </div>

              {project.drive_folder_url && (
                <a href={project.drive_folder_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-brand-accent hover:text-brand-accent-hover transition-colors">
                  <ExternalLink size={12} /> Drive Folder
                </a>
              )}
            </motion.div>
          )
        })}

        {projects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-text-muted">No projects yet. Add your first one above.</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function MilestoneInput({ onAdd }: { onAdd: (label: string) => void }) {
  const [value, setValue] = useState("")
  return (
    <div className="flex gap-2 mt-1">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { onAdd(value); setValue("") }
        }}
        placeholder="Add milestone..."
        className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-dashed border-border bg-transparent text-text-muted placeholder:text-text-muted outline-none focus:border-brand-accent focus:text-text-primary"
      />
      <button
        onClick={() => { onAdd(value); setValue("") }}
        className="text-xs px-2 py-1 rounded-lg bg-bg-subtle text-text-muted hover:text-text-primary transition-colors"
      >
        +
      </button>
    </div>
  )
}
