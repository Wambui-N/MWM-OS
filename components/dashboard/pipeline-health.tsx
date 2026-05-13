"use client"

import { motion } from "framer-motion"
import { fadeUp } from "@/lib/animations"
import { useRouter } from "next/navigation"
import type { ClientStage } from "@/types/database"

const STAGE_LABELS: Record<ClientStage, string> = {
  lead: "Lead",
  discovery: "Discovery",
  proposal_sent: "Proposal",
  negotiation: "Negotiation",
  active: "Active",
  completed: "Completed",
  lost: "Lost",
}

const STAGE_COLORS: Record<ClientStage, string> = {
  lead:          "#8A857E",
  discovery:     "#C97B1A",
  proposal_sent: "#2563EB",
  negotiation:   "#7C3AED",
  active:        "#E5401A",
  completed:     "#2D7A4F",
  lost:          "#C0392B",
}

interface PipelineHealthProps {
  stageCounts: Partial<Record<ClientStage, number>>
}

export function PipelineHealth({ stageCounts }: PipelineHealthProps) {
  const router = useRouter()
  const total = Object.values(stageCounts).reduce((a, b) => a + (b ?? 0), 0)

  if (total === 0) return null

  const stages = Object.entries(stageCounts) as [ClientStage, number][]

  return (
    <motion.div variants={fadeUp} className="bg-bg-card rounded-2xl border border-border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Pipeline Health</h3>
        <span className="text-xs text-text-muted">{total} clients total</span>
      </div>

      {/* Segmented bar */}
      <div className="flex rounded-full overflow-hidden h-3 gap-0.5">
        {stages.filter(([, count]) => count > 0).map(([stage, count]) => (
          <button
            key={stage}
            onClick={() => router.push(`/pipeline?stage=${stage}`)}
            title={`${STAGE_LABELS[stage]}: ${count}`}
            className="h-full transition-opacity hover:opacity-80"
            style={{
              width: `${(count / total) * 100}%`,
              backgroundColor: STAGE_COLORS[stage],
              minWidth: "4px",
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {stages.filter(([, count]) => count > 0).map(([stage, count]) => (
          <div key={stage} className="flex items-center gap-1.5 text-xs text-text-muted">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STAGE_COLORS[stage] }} />
            <span>{STAGE_LABELS[stage]}</span>
            <span className="font-medium text-text-primary">{count}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
