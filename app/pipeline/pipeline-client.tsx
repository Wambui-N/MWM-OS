"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { stagger } from "@/lib/animations"
import { KanbanBoard } from "@/components/pipeline/kanban-board"
import { TableView } from "@/components/pipeline/table-view"
import { WinCard } from "@/components/pipeline/win-card"
import { ClientDetailSheet } from "@/components/pipeline/client-detail-sheet"
import { AddLeadSheet } from "@/components/pipeline/add-lead-sheet"
import { useUIStore } from "@/stores/ui"
import type { Client } from "@/types/database"
import { LayoutGrid, List, Trophy, Plus } from "lucide-react"

interface PipelineClientProps {
  initialClients: Client[]
}

export function PipelineClient({ initialClients }: PipelineClientProps) {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const { pipelineView, setPipelineView } = useUIStore()

  function handleClientUpdated(updated: Client) {
    setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    if (selectedClient?.id === updated.id) setSelectedClient(updated)
  }

  function handleAdded(client: Client) {
    setClients((prev) => [client, ...prev])
  }

  const wins = clients.filter((c) => c.stage === "completed")

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-text-muted">{clients.length} clients total</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg overflow-hidden border border-border">
            <button
              onClick={() => setPipelineView("kanban")}
              className={`p-2 transition-colors ${pipelineView === "kanban" ? "bg-brand-accent text-white" : "text-text-muted hover:bg-bg-subtle"}`}
              title="Kanban view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setPipelineView("table")}
              className={`p-2 transition-colors ${pipelineView === "table" ? "bg-brand-accent text-white" : "text-text-muted hover:bg-bg-subtle"}`}
              title="Table view"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setPipelineView("wins")}
              className={`p-2 transition-colors ${pipelineView === "wins" ? "bg-brand-accent text-white" : "text-text-muted hover:bg-bg-subtle"}`}
              title="Win wall"
            >
              <Trophy size={16} />
            </button>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-accent text-white text-sm font-medium hover:bg-brand-accent-hover transition-colors"
          >
            <Plus size={16} />
            Add Lead
          </button>
        </div>
      </div>

      {/* Board / Table / Wins */}
      {pipelineView === "kanban" ? (
        <KanbanBoard
          clients={clients}
          onClientClick={setSelectedClient}
          onClientUpdated={handleClientUpdated}
        />
      ) : pipelineView === "table" ? (
        <div className="bg-bg-card rounded-2xl border border-border overflow-hidden">
          <TableView
            clients={clients}
            onClientClick={setSelectedClient}
            onClientUpdated={handleClientUpdated}
          />
        </div>
      ) : (
        /* Wins wall */
        wins.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🏆</p>
            <p className="text-sm text-text-muted">No wins yet. Keep pushing!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <h2
                className="text-xl font-semibold text-text-primary"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {wins.length} Win{wins.length !== 1 ? "s" : ""}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wins.map((client) => (
                <WinCard key={client.id} client={client} />
              ))}
            </div>
          </div>
        )
      )}

      <ClientDetailSheet
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
        onUpdated={handleClientUpdated}
      />

      <AddLeadSheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdded={handleAdded}
      />
    </motion.div>
  )
}
