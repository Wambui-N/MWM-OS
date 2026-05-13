"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Client, ServiceType, ClientStage } from "@/types/database"
import { toast } from "sonner"
import { ExternalLink, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

const STAGES: ClientStage[] = ["lead", "discovery", "proposal_sent", "negotiation", "active", "completed", "lost"]
const STAGE_LABELS: Record<ClientStage, string> = {
  lead: "Lead", discovery: "Discovery", proposal_sent: "Proposal Sent",
  negotiation: "Negotiation", active: "Active", completed: "Completed", lost: "Lost",
}

interface ClientDetailSheetProps {
  client: Client | null
  onClose: () => void
  onUpdated: (client: Client) => void
}

export function ClientDetailSheet({ client, onClose, onUpdated }: ClientDetailSheetProps) {
  const [editing, setEditing] = useState<Partial<Client>>({})
  const [note, setNote] = useState("")
  const [savingNote, setSavingNote] = useState(false)
  const [triggeringOnboard, setTriggeringOnboard] = useState(false)
  const [triggeringProposal, setTriggeringProposal] = useState(false)

  if (!client) return null

  function fieldValue<K extends keyof Client>(key: K): Client[K] {
    return (editing[key] !== undefined ? editing[key] : client![key]) as Client[K]
  }

  async function saveField(field: keyof Client, value: any) {
    try {
      const res = await fetch(`/api/clients/${client!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      })
      if (!res.ok) throw new Error()
      const { client: updated } = await res.json()
      onUpdated(updated)
      toast.success("Saved")
    } catch {
      toast.error("Couldn't save")
    }
  }

  async function appendNote() {
    if (!note.trim()) return
    setSavingNote(true)
    try {
      const existing = client!.notes ?? ""
      const newNotes = `${existing}${existing ? "\n\n" : ""}[${new Date().toLocaleDateString()}] ${note.trim()}`
      await saveField("notes", newNotes)
      setNote("")
    } finally {
      setSavingNote(false)
    }
  }

  async function triggerOnboarding() {
    setTriggeringOnboard(true)
    try {
      const res = await fetch("/api/webhooks/outgoing/onboard-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: client!.id, name: client!.name, company: client!.company, email: client!.email, service_type: client!.service_type }),
      })
      if (!res.ok) throw new Error()
      toast.success("Onboarding triggered! Drive folder will be created shortly.")
    } catch {
      toast.error("Couldn't trigger onboarding.")
    } finally {
      setTriggeringOnboard(false)
    }
  }

  async function triggerProposal() {
    setTriggeringProposal(true)
    try {
      const res = await fetch("/api/webhooks/outgoing/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: client!.id,
          name: client!.name,
          company: client!.company,
          service_type: client!.service_type,
          value_ksh: client!.value_ksh,
          date: new Date().toISOString().split("T")[0],
        }),
      })
      if (!res.ok) throw new Error()
      toast.success("Proposal generation triggered! Doc will appear in Drive shortly.")
    } catch {
      toast.error("Couldn't trigger proposal.")
    } finally {
      setTriggeringProposal(false)
    }
  }

  return (
    <Sheet open={!!client} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-bg-card space-y-6">
        <SheetHeader>
          <SheetTitle style={{ fontFamily: "var(--font-display)" }} className="text-2xl">
            {client.name}
          </SheetTitle>
          {client.company && <p className="text-sm text-text-muted">{client.company}</p>}
        </SheetHeader>

        {/* Stage */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">Stage</label>
          <select
            value={fieldValue("stage") ?? "lead"}
            onChange={(e) => saveField("stage", e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-subtle text-sm text-text-primary outline-none focus:border-brand-accent transition-colors"
          >
            {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
          </select>
        </div>

        {/* Core fields */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Email", field: "email" as const, type: "email" },
            { label: "Value (KSh)", field: "value_ksh" as const, type: "number" },
            { label: "Last Contact", field: "last_contact" as const, type: "date" },
            { label: "Next Follow-up", field: "next_followup" as const, type: "date" },
          ].map(({ label, field, type }) => (
            <div key={field} className="space-y-1">
              <label className="text-xs font-medium text-text-muted">{label}</label>
              <input
                type={type}
                defaultValue={(fieldValue(field) ?? "") as string}
                onBlur={(e) => {
                  if (e.target.value !== (client[field] ?? "")) {
                    saveField(field, type === "number" ? Number(e.target.value) : e.target.value)
                  }
                }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-bg-subtle text-sm text-text-primary outline-none focus:border-brand-accent transition-colors"
              />
            </div>
          ))}
        </div>

        {/* Next action */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">Next Action</label>
          <input
            type="text"
            defaultValue={fieldValue("next_action") ?? ""}
            onBlur={(e) => {
              if (e.target.value !== (client.next_action ?? "")) saveField("next_action", e.target.value)
            }}
            placeholder="What's the next move?"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-subtle text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-accent transition-colors"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-text-muted">Notes</label>
          {client.notes && (
            <div className="px-3 py-2.5 rounded-lg bg-bg-subtle text-xs text-text-primary whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
              {client.notes}
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              rows={2}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg-subtle text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-accent transition-colors resize-none"
            />
            <button
              onClick={appendNote}
              disabled={savingNote || !note.trim()}
              className="px-3 py-2 rounded-lg bg-brand-accent text-white text-xs font-medium hover:bg-brand-accent-hover transition-colors disabled:opacity-60 self-end"
            >
              {savingNote ? <Loader2 size={14} className="animate-spin" /> : "Add"}
            </button>
          </div>
        </div>

        {/* Drive folder */}
        {client.drive_folder_url && (
          <a
            href={client.drive_folder_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-brand-accent hover:text-brand-accent-hover transition-colors"
          >
            <ExternalLink size={14} />
            Open Drive Folder
          </a>
        )}

        {/* Make.com actions */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Automation</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={triggerOnboarding}
              disabled={triggeringOnboard}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-xs font-medium text-text-primary hover:bg-bg-subtle transition-colors disabled:opacity-60"
            >
              {triggeringOnboard ? <Loader2 size={12} className="animate-spin" /> : "✳"}
              Create Drive Folder
            </button>
            <button
              onClick={triggerProposal}
              disabled={triggeringProposal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-xs font-medium text-text-primary hover:bg-bg-subtle transition-colors disabled:opacity-60"
            >
              {triggeringProposal ? <Loader2 size={12} className="animate-spin" /> : "📄"}
              Generate Proposal
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
