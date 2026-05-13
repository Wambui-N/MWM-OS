"use client"

import { motion } from "framer-motion"
import { fadeUp } from "@/lib/animations"
import { getGreeting, formatDate } from "@/lib/utils"

export function Greeting() {
  const greeting = getGreeting()
  const today = formatDate(new Date())

  return (
    <motion.div variants={fadeUp} className="space-y-1">
      <h1
        className="text-5xl font-semibold text-text-primary leading-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {greeting}, Wambui.
      </h1>
      <p className="text-base text-text-muted">{today}</p>
    </motion.div>
  )
}
