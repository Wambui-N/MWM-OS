"use client"

import { motion } from "framer-motion"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Client, ServiceType } from "@/types/database"
import { daysBetween, todayISODate } from "@/lib/utils"
import { cn } from "@/lib/utils"

const SERVICE_STYLES: Record<ServiceType, { label: string; bg: string; text: string }> = {
  automation: { label: "Automation", bg: "bg-orange-100 dark:bg-orange-900/20", text: "text-orange-700 dark:text-orange-400" },
  web:        { label: "Web",        bg: "bg-blue-100 dark:bg-blue-900/20",   text: "text-blue-700 dark:text-blue-400" },
  both:       { label: "Both",       bg: "bg-purple-100 dark:bg-purple-900/20", text: "text-purple-700 dark:text-purple-400" },
}

function staleness(lastContact: string | null) {
  if (!lastContact) return { label: "No contact", color: "bg-danger/15 text-danger" }
  const days = daysBetween(lastContact, todayISODate())
  if (days <= 3)  return { label: `${days}d ago`, color: "bg-success/15 text-success" }
  if (days <= 7)  return { label: `${days}d ago`, color: "bg-warning/15 text-warning" }
  return { label: `${days}d ago`, color: "bg-danger/15 text-danger" }
}

interface ClientCardProps {
  client: Client
  onClick: (client: Client) => void
  draggable?: boolean
}

export function ClientCard({ client, onClick, draggable }: ClientCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: client.id,
    disabled: !draggable,
  })

  const stale = staleness(client.last_contact)
  const service = client.service_type ? SERVICE_STYLES[client.service_type] : null

  return (
    <motion.div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      whileDrag={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
      className={cn(
        "bg-bg-card rounded-xl border border-border p-4 cursor-pointer hover:border-border-strong transition-colors space-y-3",
        isDragging && "opacity-50 z-50"
      )}
      onClick={() => onClick(client)}
      {...(draggable ? { ...attributes, ...listeners } : {})}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">{client.name}</p>
          {client.company && (
            <p className="text-xs text-text-muted truncate">{client.company}</p>
          )}
        </div>
        {service && (
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full shrink-0", service.bg, service.text)}>
            {service.label}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        {client.value_ksh && (
          <span className="text-xs font-medium text-text-primary">
            KSh {client.value_ksh.toLocaleString()}
          </span>
        )}
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full ml-auto", stale.color)}>
          {stale.label}
        </span>
      </div>

      {client.next_action && (
        <p className="text-xs text-text-muted line-clamp-1">→ {client.next_action}</p>
      )}
    </motion.div>
  )
}
