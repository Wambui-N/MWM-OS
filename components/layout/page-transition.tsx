"use client"

import { motion } from "framer-motion"
import { pageVariants } from "@/lib/animations"

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="enter"
      exit="exit"
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex-1 min-h-0"
    >
      {children}
    </motion.div>
  )
}
