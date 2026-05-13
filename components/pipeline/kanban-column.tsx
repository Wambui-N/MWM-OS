"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import type { Client, ClientStage } from "@/types/database"
import { ClientCard } from "./client-card"
import { cn } from "@/lib/utils"

const STAGE_LABELS: Record<ClientStage, string> = {
  lead:          "Lead",
  discovery:     "Discovery Call",
  proposal_sent: "Proposal Sent",
  negotiation:   "Negotiation",
  active:        "Active Client",
  completed:     "Completed",
  lost:          "Lost",
}

interface KanbanColumnProps {
  stage: ClientStage
  clients: Client[]
  onClientClick: (client: Client) => void
}

export function KanbanColumn({ stage, clients, onClientClick }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: stage })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col min-w-[240px] w-[240px] bg-bg-subtle rounded-2xl p-3 space-y-2 transition-colors",
        isOver && "bg-brand-accent/5 border-2 border-dashed border-brand-accent"
      )}
    >
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
          {STAGE_LABELS[stage]}
        </span>
        <span className="text-xs font-medium text-text-muted bg-bg-card px-2 py-0.5 rounded-full">
          {clients.length}
        </span>
      </div>

      <SortableContext items={clients.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 min-h-[60px]">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} onClick={onClientClick} draggable />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}
