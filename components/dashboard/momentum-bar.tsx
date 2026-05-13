"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { recalculateMomentum } from "@/lib/momentum"

interface MomentumBarProps {
  initialScore?: number
}

export function MomentumBar({ initialScore = 0 }: MomentumBarProps) {
  const [score, setScore] = useState(initialScore)
  const lastUpdateRef = useRef(new Date())

  // Decay every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setScore((current) => {
        const decayed = recalculateMomentum(current, [], lastUpdateRef.current)
        lastUpdateRef.current = new Date()
        return decayed
      })
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const color =
    score >= 70 ? "var(--accent)" :
    score >= 40 ? "#C97B1A" :
    "var(--border)"

  if (score <= 0) return <div className="w-full h-0.5 bg-bg-subtle rounded-full" />

  return (
    <div className="w-full h-0.5 bg-bg-subtle rounded-full overflow-hidden" title={`Momentum: ${Math.round(score)}%`}>
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  )
}
