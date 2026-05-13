"use client"

import { motion } from "framer-motion"
import { stagger, fadeUp } from "@/lib/animations"
import type { Client } from "@/types/database"
import { daysBetween, todayISODate } from "@/lib/utils"

interface StaleLeadsProps {
  leads: Client[]
}

export function StaleLeads({ leads }: StaleLeadsProps) {
  if (leads.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text-primary">Follow-up Nudges</h3>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
        {leads.map((client) => {
          const days = client.last_contact
            ? daysBetween(client.last_contact, todayISODate())
            : null

          return (
            <motion.div
              key={client.id}
              variants={fadeUp}
              className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-border bg-bg-card"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{client.name}</p>
                {client.company && (
                  <p className="text-xs text-text-muted truncate">{client.company}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {days !== null && (
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: days > 14 ? "var(--danger)" : "var(--warning)",
                      color: "#FFFFFF",
                    }}
                  >
                    {days}d ago
                  </motion.span>
                )}
                <a
                  href={`/pipeline?client=${client.id}`}
                  className="text-xs font-medium text-brand-accent hover:text-brand-accent-hover transition-colors"
                >
                  Follow up →
                </a>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
