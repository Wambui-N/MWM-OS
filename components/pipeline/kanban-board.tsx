"use client"

import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core"
import type { Client, ClientStage } from "@/types/database"
import { KanbanColumn } from "./kanban-column"
import { ClientCard } from "./client-card"
import { toast } from "sonner"

const STAGES: ClientStage[] = [
  "lead", "discovery", "proposal_sent", "negotiation", "active", "completed", "lost",
]

interface KanbanBoardProps {
  clients: Client[]
  onClientClick: (client: Client) => void
  onClientUpdated: (client: Client) => void
}

export function KanbanBoard({ clients, onClientClick, onClientUpdated }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const activeClient = clients.find((c) => c.id === activeId) ?? null

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string)
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const { active, over } = e
    if (!over) return

    const draggedClient = clients.find((c) => c.id === active.id)
    if (!draggedClient) return

    // Determine target stage
    let targetStage: ClientStage | null = null
    if (STAGES.includes(over.id as ClientStage)) {
      targetStage = over.id as ClientStage
    } else {
      // dropped on another card — same column
      const targetClient = clients.find((c) => c.id === over.id)
      if (targetClient && targetClient.stage !== draggedClient.stage) {
        targetStage = targetClient.stage
      }
    }

    if (!targetStage || targetStage === draggedClient.stage) return

    try {
      const res = await fetch(`/api/clients/${draggedClient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: targetStage }),
      })
      if (!res.ok) throw new Error()
      const { client: updated } = await res.json()
      onClientUpdated(updated)

      // Trigger onboarding webhook if moved to active
      if (targetStage === "active") {
        fetch("/api/webhooks/outgoing/onboard-client", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: updated.id,
            name: updated.name,
            company: updated.company,
            email: updated.email,
            service_type: updated.service_type,
          }),
        }).catch(() => {})
        toast.success(`${updated.name} is now active. Onboarding triggered!`)
      } else {
        toast.success(`Moved ${updated.name} to ${targetStage.replace("_", " ")}`)
      }
    } catch {
      toast.error("Couldn't update stage")
    }
  }

  const clientsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = clients.filter((c) => c.stage === stage)
    return acc
  }, {} as Record<ClientStage, Client[]>)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            clients={clientsByStage[stage]}
            onClientClick={onClientClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeClient && (
          <ClientCard client={activeClient} onClick={() => {}} />
        )}
      </DragOverlay>
    </DndContext>
  )
}
