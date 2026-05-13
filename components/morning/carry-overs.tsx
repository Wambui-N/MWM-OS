"use client"

import { useState } from "react"
import { X } from "lucide-react"
import type { TickItem, TaskItem, PlanProjectItem } from "@/types/database"

type AnyItem = (TickItem | TaskItem | PlanProjectItem) & { _type: "tick" | "task" | "project" }

interface CarryOversProps {
  items: AnyItem[]
  onCarry: (item: AnyItem) => void
  onDismiss: (item: AnyItem) => void
}

export function CarryOvers({ items, onCarry, onDismiss }: CarryOversProps) {
  if (items.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
        Carry over from yesterday
      </p>
      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border bg-bg-subtle text-sm"
          >
            <span className="flex-1 text-text-muted truncate">{item.label}</span>
            <button
              onClick={() => onCarry(item)}
              className="text-xs text-brand-accent hover:text-brand-accent-hover font-medium shrink-0"
            >
              Add
            </button>
            <button
              onClick={() => onDismiss(item)}
              className="text-text-muted hover:text-danger transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
