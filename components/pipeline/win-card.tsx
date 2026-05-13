"use client"

import { motion } from "framer-motion"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Client } from "@/types/database"

const SERVICE_STYLES: Record<string, { bg: string; text: string }> = {
  automation: { bg: "bg-brand-accent/10", text: "text-brand-accent" },
  web:        { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400" },
  both:       { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-400" },
}

interface WinCardProps {
  client: Client
}

export function WinCard({ client }: WinCardProps) {
  const serviceStyle = client.service_type
    ? (SERVICE_STYLES[client.service_type] ?? SERVICE_STYLES.automation)
    : SERVICE_STYLES.automation

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-bg-card border border-border rounded-xl p-4 space-y-3"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <h3
            className="text-lg font-semibold text-text-primary leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {client.company ?? client.name}
          </h3>
          {client.company && (
            <p className="text-sm text-text-muted">{client.name}</p>
          )}
        </div>
        {client.service_type && (
          <span className={cn("text-xs px-2 py-1 rounded-full shrink-0 ml-2", serviceStyle.bg, serviceStyle.text)}>
            {client.service_type}
          </span>
        )}
      </div>

      <div className="pt-2 border-t border-border">
        {client.value_ksh ? (
          <p
            className="text-2xl font-semibold text-text-primary"
            style={{ fontFamily: "var(--font-display)" }}
          >
            KSh {(client.value_ksh / 1000).toFixed(0)}k
          </p>
        ) : (
          <p className="text-sm text-text-muted">—</p>
        )}
        <p className="text-xs text-text-muted mt-0.5">
          Won {client.updated_at
            ? format(new Date(client.updated_at), "MMM yyyy")
            : format(new Date(client.created_at), "MMM yyyy")}
        </p>
      </div>
    </motion.div>
  )
}
