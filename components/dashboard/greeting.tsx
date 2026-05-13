"use client"

import { motion } from "framer-motion"
import { fadeUp } from "@/lib/animations"
import { getGreeting, formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { DayGrade } from "@/types/database"

interface GreetingProps {
  score?: number | null
  grade?: DayGrade | null
}

export function Greeting({ score, grade }: GreetingProps) {
  const greeting = getGreeting()
  const today = formatDate(new Date())

  const gradeColor =
    grade === "A+" || grade === "A"
      ? "bg-success/10 text-success"
      : grade === "B"
      ? "bg-warning/10 text-warning"
      : grade
      ? "bg-bg-subtle text-text-muted"
      : ""

  return (
    <motion.div variants={fadeUp} className="space-y-1">
      <h1
        className="text-5xl font-semibold text-text-primary leading-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {greeting}, Wambui.
      </h1>
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-base text-text-muted">{today}</p>
        {grade && score != null && (
          <span className={cn("text-sm font-medium px-2 py-0.5 rounded-md", gradeColor)}>
            {grade} · {score}/100
          </span>
        )}
      </div>
    </motion.div>
  )
}
