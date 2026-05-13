"use client"

import { useState } from "react"
import type { Client, ClientStage } from "@/types/database"
import { daysBetween, todayISODate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const STAGE_LABELS: Record<ClientStage, string> = {
  lead: "Lead", discovery: "Discovery", proposal_sent: "Proposal",
  negotiation: "Negotiation", active: "Active", completed: "Completed", lost: "Lost",
}

const STAGES: ClientStage[] = ["lead", "discovery", "proposal_sent", "negotiation", "active", "completed", "lost"]

interface TableViewProps {
  clients: Client[]
  onClientClick: (client: Client) => void
  onClientUpdated: (client: Client) => void
}

export function TableView({ clients, onClientClick, onClientUpdated }: TableViewProps) {
  const [sortField, setSortField] = useState<keyof Client>("created_at")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  function toggleSort(field: keyof Client) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const sorted = [...clients].sort((a, b) => {
    const va = (a[sortField] ?? "") as string
    const vb = (b[sortField] ?? "") as string
    return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va)
  })

  async function updateStage(clientId: string, stage: ClientStage) {
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      })
      if (!res.ok) throw new Error()
      const { client } = await res.json()
      onClientUpdated(client)
    } catch {
      toast.error("Couldn't update stage")
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {[
              { label: "Name", field: "name" as const },
              { label: "Company", field: "company" as const },
              { label: "Stage", field: "stage" as const },
              { label: "Value", field: "value_ksh" as const },
              { label: "Last Contact", field: "last_contact" as const },
              { label: "Next Action", field: "next_action" as const },
            ].map(({ label, field }) => (
              <th
                key={field}
                onClick={() => toggleSort(field)}
                className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wide cursor-pointer hover:text-text-primary transition-colors select-none"
              >
                {label}{" "}
                {sortField === field && (
                  <span>{sortDir === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {sorted.map((client) => {
            const days = client.last_contact ? daysBetween(client.last_contact, todayISODate()) : null
            return (
              <tr
                key={client.id}
                className="hover:bg-bg-subtle transition-colors cursor-pointer"
              >
                <td
                  className="px-4 py-3 font-medium text-text-primary"
                  onClick={() => onClientClick(client)}
                >
                  {client.name}
                </td>
                <td className="px-4 py-3 text-text-muted">{client.company ?? "-"}</td>
                <td className="px-4 py-3">
                  <select
                    value={client.stage}
                    onChange={(e) => updateStage(client.id, e.target.value as ClientStage)}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs px-2 py-1 rounded-lg border border-border bg-bg-subtle text-text-primary outline-none"
                  >
                    {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-text-primary tabular-nums">
                  {client.value_ksh ? `KSh ${client.value_ksh.toLocaleString()}` : "-"}
                </td>
                <td className="px-4 py-3">
                  {days !== null ? (
                    <span className={cn("text-xs font-medium",
                      days <= 3 ? "text-success" : days <= 7 ? "text-warning" : "text-danger"
                    )}>
                      {days}d ago
                    </span>
                  ) : (
                    <span className="text-xs text-text-muted">No contact</span>
                  )}
                </td>
                <td className="px-4 py-3 text-text-muted max-w-[200px] truncate">
                  {client.next_action ?? "-"}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {clients.length === 0 && (
        <div className="text-center py-12 text-sm text-text-muted">
          No clients yet. Add your first lead.
        </div>
      )}
    </div>
  )
}
