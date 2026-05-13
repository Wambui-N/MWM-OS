"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { fadeUp } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: number
  prefix?: string
  suffix?: string
  description?: string
  className?: string
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (target === 0) return setCount(0)
    const start = performance.now()
    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])

  return count
}

export function StatCard({ label, value, prefix, suffix, description, className }: StatCardProps) {
  const count = useCountUp(value)

  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        "bg-bg-card rounded-2xl border border-border p-6 space-y-3",
        className
      )}
    >
      <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</p>
      <div className="flex items-baseline gap-1">
        {prefix && <span className="text-sm text-text-muted">{prefix}</span>}
        <span
          className="text-3xl font-semibold text-text-primary tabular-nums"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {count.toLocaleString()}
        </span>
        {suffix && <span className="text-sm text-text-muted">{suffix}</span>}
      </div>
      {description && <p className="text-xs text-text-muted">{description}</p>}
    </motion.div>
  )
}
