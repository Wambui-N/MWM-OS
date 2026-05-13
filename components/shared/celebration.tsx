"use client"

import { useEffect } from "react"
import confetti from "canvas-confetti"

const MESSAGES = [
  "Built different.",
  "The automation ran. So did you.",
  "Keep going.",
  "Wambui works.",
  "That's how it's done.",
]

interface CelebrationProps {
  trigger: boolean
  onComplete?: () => void
}

export function Celebration({ trigger, onComplete }: CelebrationProps) {
  useEffect(() => {
    if (!trigger) return

    const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)]

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: ["#E5401A", "#C97B1A", "#2D7A4F", "#F7F4EF"],
    })

    const toast = document.createElement("div")
    toast.textContent = message
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-primary);
      background: var(--bg-card);
      padding: 1.5rem 3rem;
      border-radius: 1rem;
      border: 1px solid var(--border);
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      z-index: 9999;
      pointer-events: none;
      font-family: var(--font-display);
      animation: celebrationFade 2.5s ease-in-out forwards;
    `
    document.body.appendChild(toast)
    setTimeout(() => {
      document.body.removeChild(toast)
      onComplete?.()
    }, 2500)
  }, [trigger, onComplete])

  return null
}
