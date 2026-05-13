"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useUIStore } from "@/stores/ui"

interface DeepWorkOverlayProps {
  children: React.ReactNode
}

export function DeepWorkOverlay({ children }: DeepWorkOverlayProps) {
  const { deepWork } = useUIStore()

  return (
    <AnimatePresence mode="wait">
      {deepWork ? (
        <motion.div
          key="deepwork"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          key="normal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
